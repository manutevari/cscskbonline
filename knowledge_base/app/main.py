from __future__ import annotations

import hashlib
import hmac
from datetime import datetime, timezone
from fastapi import Depends, FastAPI, File, Header, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware

from .core import get_settings
from .models import ApprovalRequest, DocumentMetadata, IngestResponse, KnowledgeStatus, QueryRequest, QueryResponse
from .service import ingest, retrieve, clients
from .agent import agent
from .agent_models import AgentRequest, AgentResponse
from langchain_core.messages import HumanMessage

app = FastAPI(title="CSCSKB Knowledge Base API", version="0.1.0")
settings = get_settings()
app.add_middleware(CORSMiddleware, allow_origins=list(settings.allowed_origins),
                   allow_credentials=False, allow_methods=["GET", "POST"],
                   allow_headers=["Authorization", "Content-Type"])


def require_token(authorization: str | None = Header(default=None)) -> None:
    expected = "Bearer " + settings.kb_api_token.get_secret_value()
    if not authorization or not hmac.compare_digest(authorization, expected):
        raise HTTPException(status_code=401, detail="Unauthorized")


@app.get("/health")
def health():
    return {"status": "ok", "service": "cscskb-knowledge-base"}


@app.post("/v1/documents", response_model=IngestResponse, dependencies=[Depends(require_token)])
async def upload_document(file: UploadFile = File(...), metadata_json: str = Header(..., alias="X-Document-Metadata")):
    import json
    try:
        metadata = DocumentMetadata.model_validate(json.loads(metadata_json))
        payload = await file.read(settings.max_upload_bytes + 1)
        if len(payload) > settings.max_upload_bytes:
            raise HTTPException(status_code=413, detail="File exceeds upload limit")
        if not file.filename:
            raise HTTPException(status_code=400, detail="Filename required")
        doc_id, count = ingest(file.filename, payload, metadata)
        return IngestResponse(document_id=doc_id, status=KnowledgeStatus.PENDING_REVIEW,
                              chunk_count=count, message="Document ingested and awaiting human approval.")
    except (ValueError, json.JSONDecodeError) as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc


@app.post("/v1/query", response_model=QueryResponse, dependencies=[Depends(require_token)])
def query_knowledge(request: QueryRequest):
    try:
        return retrieve(request)
    except Exception as exc:
        raise HTTPException(status_code=502, detail="Knowledge retrieval is temporarily unavailable") from exc



@app.post("/v1/agent", response_model=AgentResponse, dependencies=[Depends(require_token)])
def run_agent(request: AgentRequest):
    try:
        result = agent.invoke({"messages": [HumanMessage(content=request.question)]},
                              config={"recursion_limit": 8})
        messages = result.get("messages", [])
        final = next((m for m in reversed(messages) if getattr(m, "type", "") == "ai"), None)
        if final is None:
            raise ValueError("Agent returned no final answer")
        content = final.content
        answer = content if isinstance(content, str) else str(content)
        tool_calls = sum(len(getattr(m, "tool_calls", []) or []) for m in messages)
        return AgentResponse(answer=answer, tool_calls=tool_calls,
                             evidence_status="retrieval_tool_used" if tool_calls else "no_tool_call")
    except Exception as exc:
        raise HTTPException(status_code=502, detail="Knowledge agent is temporarily unavailable") from exc

@app.post("/v1/documents/{document_id}/review", dependencies=[Depends(require_token)])
def review_document(document_id: str, request: ApprovalRequest):
    db, _ = clients()
    row = db.table("knowledge_documents").select("id,status,uploaded_by").eq("id", document_id).maybe_single().execute().data
    if not row:
        raise HTTPException(status_code=404, detail="Document not found")
    if row["status"] != KnowledgeStatus.PENDING_REVIEW.value:
        raise HTTPException(status_code=409, detail="Document is not awaiting review")
    if request.reviewer_id == row["uploaded_by"]:
        raise HTTPException(status_code=403, detail="Uploader cannot approve their own document")
    status = KnowledgeStatus.PUBLISHED.value if request.decision == "approve" else KnowledgeStatus.REJECTED.value
    db.table("knowledge_documents").update({
        "status": status, "reviewed_by": request.reviewer_id,
        "review_reason": request.reason, "reviewed_at": datetime.now(timezone.utc).isoformat(),
    }).eq("id", document_id).execute()
    return {"document_id": document_id, "status": status}
