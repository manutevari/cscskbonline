from __future__ import annotations

from typing import Literal\nimport json
from pydantic import BaseModel, ConfigDict, Field
from langchain_core.tools import tool, BaseTool

from .models import QueryRequest
from .service import retrieve
from .live_search import LiveSearchRequest, search_tavily


class SchemeSearchArgs(BaseModel):
    model_config = ConfigDict(extra="forbid")
    question: str = Field(min_length=3, max_length=1200, description="Question about a government scheme or CSC procedure")
    category: str | None = Field(default=None, max_length=100)
    language: Literal["auto", "hi", "en", "hinglish"] = "auto"


class TavilySearchArgs(BaseModel):
    model_config = ConfigDict(extra="forbid")
    query: str = Field(min_length=3, max_length=500, description="Recruitment, government job, notification or official notice query")
    state: str | None = Field(default=None, max_length=80)
    category: str | None = Field(default=None, max_length=80)
    language: Literal["auto", "hi", "en", "hinglish"] = "auto"


class DocumentLookupArgs(BaseModel):
    model_config = ConfigDict(extra="forbid")
    document_id: str = Field(min_length=8, max_length=64)


@tool("search_approved_knowledge", args_schema=SchemeSearchArgs)
def search_approved_knowledge(question: str, category: str | None = None, language: str = "auto") -> str:
    """Search only human-approved, non-expired CSCSKB documents. Use for scheme eligibility, official procedures, required documents and CSC service guidance. Returns answer and citations."""
    result = retrieve(QueryRequest(question=question, category=category, language=language, top_k=5))
    return result.model_dump_json()


@tool("get_approved_document_metadata", args_schema=DocumentLookupArgs)
def get_approved_document_metadata(document_id: str) -> str:
    """Retrieve metadata for one published knowledge document. Never returns original file bytes or private upload information."""
    from .service import clients
    db, _ = clients()
    response = (db.table("knowledge_documents")
        .select("id,title,source_name,source_type,source_url,issuing_authority,published_on,effective_from,effective_until,category,language,version,status")
        .eq("id", document_id).eq("status", "published").maybe_single().execute())
    if not response.data:
        return "No approved document found."
    return str(response.data)


@tool("tavily_live_recruitment_search", args_schema=TavilySearchArgs)
def tavily_live_recruitment_search(query: str, state: str | None = None, category: str | None = None, language: str = "auto") -> str:
    """Search the live web using Tavily for current recruitment notices. Results are unverified discovery links, not proof of open application status. Prefer official government domains and tell the user to verify the source notice."""
    return json.dumps(search_tavily(LiveSearchRequest(query=query, state=state, category=category, language=language)), ensure_ascii=False)


READ_ONLY_TOOLS: list[BaseTool] = [search_approved_knowledge, get_approved_document_metadata, tavily_live_recruitment_search]
