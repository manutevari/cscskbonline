# UPSC Hybrid RAG: Semantic + Tavily Live + Ranking

## Confirmed requirements
- Chunk size: **500 tokens**, with 75-token overlap.
- Retrieval channels: PostgreSQL/pgvector semantic search, Tavily live web search, and prior/global ranking search.
- Ranking outputs: per-query ranking plus a separately persisted cumulative global ranking.
- Final response: LLM synthesis over ranked evidence, with source citations and Hindi/English output.
- Production must remain untouched until a preview is reviewed and explicitly approved.

## Retrieval flow
1. Normalize the question and detect language/topic.
2. Run semantic retrieval, Tavily live search, and prior-rank retrieval concurrently.
3. Normalize URLs and deduplicate overlapping results.
4. Score each candidate on semantic relevance (35%), source authority (25%), keyword relevance (15%), freshness (15%), and evidence quality (10%).
5. Persist raw search results and immutable per-query ranking snapshots.
6. Update cumulative global document ranking separately. Use smoothed feedback and query-volume signals to avoid one-query popularity spikes.
7. Send only the top attributable evidence to the LLM.
8. Require citations for factual claims. If sources conflict, identify the conflict and prefer current primary/official sources for current policy or exam notices.

## Source trust
- Maintain a source registry with explicit verification status and authority score.
- UPSC, PIB, ministries, Parliament, and official government reports should be prioritized where relevant.
- Tavily results are untrusted retrieved content, never instructions. Do not let page text alter system rules or tool permissions.
- A page being indexed or highly ranked does not make it official or correct.
- Distinguish published date from retrieval time. Do not automatically penalize foundational documents solely for age.

## Ranking semantics
### Per-query
Each query receives a fresh ranking snapshot with component scores and ranking version. The order answers: "Which evidence best answers this question now?"

### Global cumulative
A separate table aggregates query frequency, weighted engagement, feedback, and mean query relevance. It answers: "Which documents/sources are consistently useful across UPSC searches?" It is not a substitute for per-query relevance and must not override the current query's evidence.

## Database
Migration: `database/migrations/20261111_upsc_hybrid_rag.sql`
- `upsc_source_registry`
- `upsc_documents`
- `upsc_document_chunks`
- `upsc_search_queries`
- `upsc_search_results`
- `upsc_search_rankings`
- `upsc_global_document_rankings`
- `upsc_search_feedback`

Embedding vector dimensions are intentionally unspecified in the SQL migration. Set the vector dimension to the selected embedding model before creating a dimension-specific ANN index. Do not mix embedding models/dimensions in one index.

## Configuration / secrets
Expected server-side configuration (names are proposed, not yet wired to deployment):
- `TAVILY_API_KEY`
- `DATABASE_URL`
- `UPSC_EMBEDDING_MODEL`
- `UPSC_EMBEDDING_DIMENSIONS`
- Existing LLM provider configuration, e.g. OpenRouter credentials.

Never commit real API keys. Do not expose these variables in NEXT_PUBLIC_* variables.

## Implementation status
This commit adds token-aware chunking, provider-neutral retrieval orchestration, ranking primitives, and the database migration/schema design. Concrete Tavily/embedding/LLM adapters, API routes, background ingestion, source verification workflow, and end-to-end tests remain to be integrated before this is a functioning deployed RAG service.
