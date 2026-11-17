# CSCSKB Knowledge Base — Pydantic + RAG

A separate Python service intended to run alongside the Next.js 16 frontend. It uses Pydantic v2 contracts, FastAPI, Supabase Postgres/pgvector, and OpenAI-compatible embeddings.

## Flow

1. An authenticated operator uploads PDF/TXT/Markdown/CSV with validated metadata and a SHA-256 digest.
2. The service extracts text, chunks it with overlap, embeds chunks, and stores them under a `pending_review` document.
3. A different reviewer approves or rejects the document. Only `published` documents are eligible for retrieval.
4. A query is embedded and matched against published chunks. The answer is generated only from retrieved excerpts and returns structured citations.
5. Low similarity or empty retrieval returns an explicit insufficient-evidence answer.

## Local run

```bash
cd knowledge_base
python -m venv .venv
source .venv/bin/activate
pip install -e .
cp .env.example .env
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

Set secrets in the deployment environment. Never commit `.env`, service-role keys, or model API keys.

## Supabase

Apply `../supabase/migrations/20261118_002_knowledge_base_rag.sql` to a staging database first. The migration is intentionally not run by this service. It creates private tables and a service-role-only vector search function.

## API

- `GET /health`
- `POST /v1/documents`: multipart file, `X-Document-Metadata` JSON header, bearer token
- `POST /v1/documents/{id}/review`: approve/reject, different reviewer required
- `POST /v1/query`: validated question and top-k
- `POST /v1/agent`: LangGraph agent with typed read-only tools

All endpoints except health require `Authorization: Bearer $KB_API_TOKEN`. Keep this service private behind a server-to-server integration; do not put the token in browser code.

## Tool calling framework\n\nThe agent uses LangGraph for orchestration and LangChain Core structured tools. Current tools are deliberately read-only: `search_approved_knowledge` and `get_approved_document_metadata`. Tool arguments are Pydantic-validated; graph recursion is bounded; retrieved documents are treated as untrusted evidence. No write, payment, appointment mutation, SQL, publication or approval tools are exposed. If future tools perform consequential actions, route them through a separate authenticated HITL approval service with verified operator identity and immutable audit events.\n\n## Initial limitations / next engineering steps

- Scanned PDF OCR is not yet wired; text extraction failure is explicit. Integrate OCR in a separate worker with page-level provenance.
- Add durable ingestion jobs, retry queue, malware scanning, MIME sniffing, rate limits, quotas, audit events, and deletion/retention workflows before broad public use.
- The first embedding schema is fixed at 1536 dimensions; changing embedding models requires a versioned re-embedding migration.
- The initial similarity threshold (0.45) is a conservative starting heuristic, not calibrated confidence. Evaluate with a reviewed CSC question/answer dataset before launch.
- Replace reviewer_id supplied by the caller with verified Supabase Auth identity and role claims before production. Shared-token authentication is a service bootstrap, not an admin identity system.
- The chat model name is configurable in a follow-up; configure an available model on the selected OpenAI-compatible endpoint.
- Add multilingual reranking and hybrid lexical/vector search after baseline retrieval evaluation.
- Preserve human approval: the model cannot publish documents or approve its own uploads.
