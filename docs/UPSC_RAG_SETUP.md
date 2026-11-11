# UPSC RAG setup

## Server-only environment
- SUPABASE_URL
- SUPABASE_SERVICE_ROLE_KEY
- TAVILY_API_KEY
- OPENROUTER_API_KEY
- UPSC_EMBEDDING_MODEL: embeddings-capable model available through OpenRouter
- UPSC_RAG_LLM_MODEL (optional; otherwise OPENROUTER_MODEL or openrouter/auto)
- UPSC_INGEST_TOKEN: long random secret

Never expose secrets through NEXT_PUBLIC variables.

## Database
Apply, in order, to the intended Supabase project:
1. database/migrations/20261111_upsc_hybrid_rag.sql
2. database/migrations/20261112_upsc_rag_rpc.sql

Embeddings must use one model and consistent vector dimensions. The current vector column is unbounded; add a dimension-specific ANN index only after validating the chosen model and dimension.

## Routes
- POST /api/upsc-rag/search with {"query":"Explain fundamental rights"}
- POST /api/upsc-rag/ingest with Authorization: Bearer UPSC_INGEST_TOKEN and JSON title, url, content. Optional source_name, source_type, verified, document_type, language, published_at, metadata, page_number.

Ingestion accepts extracted text, chunks at 500 tokens with 75 overlap, embeds each chunk and stores it. PDF/HTML extraction, OCR, page-preserving parsers, scheduled official-source crawling and ingestion dashboard remain follow-up work.

## Ranking
Query-specific score: semantic 35%, authority 25%, keyword 15%, freshness 15%, evidence quality 10%. Global cumulative document ranking is maintained independently and never replaces the query-specific ranking. The initial global formula is a heuristic and needs evaluation against a labelled UPSC benchmark.

## Security and release
Ingestion requires a server-side bearer token. Retrieved text is treated as untrusted. Do not run migrations against production until the target project is confirmed and explicitly approved. Configure secrets in Vercel preview environment before testing. Verify the selected OpenRouter embedding model supports /embeddings and note its exact vector dimension before first ingestion.
