# CSC SKB Online — Personal Tool RAG

This implements retrieval-augmented search for the site's tool catalogue. It indexes tool descriptions and metadata, creates embeddings, stores them in Supabase pgvector, and retrieves matching tools from natural-language queries.

## Architecture

1. Canonical catalogue: `frontend/src/lib/tools-catalog.ts`
2. Embedding model: OpenAI `text-embedding-3-small` (1536 dimensions by default)
3. Vector store: Supabase Postgres + pgvector
4. Ingestion: `POST /api/tools/ingest` (protected by `x-rag-ingest-secret`)
5. Search: `GET /api/tools/search?q=...`
6. UI: `ToolRagSearch` on the Document Tools page
7. If credentials are absent, search falls back to keyword matching and labels the mode honestly.

## Supabase setup

Run `supabase/migrations/202610280001_tool_knowledge_rag.sql` in the Supabase SQL Editor. It creates `tool_knowledge`, a vector index and the `search_tool_knowledge` RPC. The table has RLS enabled and no public read/write policy. Keep the service-role key server-only.

## Vercel environment variables

Set these in the `cscskbonline` project, for Preview and Production as appropriate:

- `OPENAI_API_KEY`: server-side OpenAI API key for embeddings.
- `RAG_EMBEDDING_MODEL`: optional; leave unset to use `text-embedding-3-small` (1536 dimensions).
- `SUPABASE_URL`: Supabase project URL.
- `SUPABASE_SERVICE_ROLE_KEY`: Supabase service-role key; never expose it with a `NEXT_PUBLIC_` prefix.
- `RAG_INGEST_SECRET`: long random secret used only for the ingestion endpoint.

Important: the migration uses `vector(1536)`; do not switch to an embedding model with a different dimension without changing the database column and rebuilding the index.

## Index the catalogue

After the migration and environment variables are configured, run this from a trusted terminal. Replace the URL and secret with your own values; do not commit the secret.

```bash
curl -X POST "https://YOUR_DEPLOYMENT_URL/api/tools/ingest" \
  -H "x-rag-ingest-secret: YOUR_RAG_INGEST_SECRET"
```

A successful response reports `indexed` and the model name. Re-run after changing tool descriptions so embeddings stay current.

## Search

```bash
curl "https://YOUR_DEPLOYMENT_URL/api/tools/search?q=passport%20photo%20300%20DPI"
```

The response's `mode` is `semantic-vector` when vector retrieval succeeds, otherwise `keyword-fallback`. This makes it clear whether embeddings are actually active.

## Scope and safety

- The catalogue includes local tools, planned capabilities and external links. The UI must not imply external links are integrated APIs.
- The RAG indexes tool descriptions/metadata, not user-uploaded identity documents or private user files.
- Never send uploaded CSC customer documents to the embedding endpoint.
- The ingestion route is protected; do not remove its authentication check.
- Build/deployment success does not prove live embeddings work. Verify by ingesting the catalogue and checking for `mode: semantic-vector`.
