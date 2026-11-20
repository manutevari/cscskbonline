# Recruitment Intelligence architecture and staged implementation

## Implemented on preview branch
- Tavily Search POST connector, configurable API key, official-domain allowlist for state-specific queries where registry entries exist.
- Optional LLM analyzer via OpenAI Chat Completions API. It is instructed to ground summaries in search evidence and mark discovery as unverified.
- API endpoint: POST /api/recruitment/intelligence/search (query, state, category).
- Exam Register UI has an AI Recruitment Search box. It uses selected state and category; displays source links, snippets, search scores and LLM analysis.
- Forecast helper computes cycle interval median and median absolute deviation from verified cycle records, with confidence/status colors and an explicit estimate disclaimer. It currently has no UI or historical DB connection.
- Text chunking helper prepared for future RAG ingestion.
- India registry lists all 28 States and 8 UTs with curated portal domains. Registry is a starting point and coverage needs audit.

## Architecture
UI -> search API -> state/central/UT routing -> Tavily + source connectors -> evidence collection -> LLM analysis/extraction -> validation/provenance -> structured database -> historical records -> RAG -> predictor/trend/eligibility/alerts/calendar.

## Not yet operational / external prerequisites
- Preview env secrets: TAVILY_API_KEY; OPENAI_API_KEY optional for analyzer; RECRUITMENT_LLM_MODEL optional.
- Supabase persistence requires dedicated preview DB credentials and applying migration `frontend/supabase/migrations/202611210001_recruitment_intelligence.sql`. Do not apply to production.
- Embeddings and RAG retrieval endpoints; scheduled collection; state-specific POST/GET/RSS/PDF adapters; full source coverage validation; predictor with history; alert delivery; verified live/closed classification.
- Search results are discovery leads, not verified vacancy data. Dates, vacancy, fees, eligibility require official notification verification.

## Forecast confidence
Green: high regularity (official published calendar or multiple verified historical cycles); Yellow: recurring with variance; Orange: irregular/weak consistency; Grey: insufficient verified history. Forecast must show estimate, confidence, data window and source evidence.

## Source registry
States and UTs are searchable. State-specific official domains are used where configured; broader Tavily search is used for All India; Central search uses central recruitment portals. Domains are not an exhaustive source inventory.

## Security notes
Keys remain server-side. Request body fields are bounded. Results include source URLs and snippets; LLM input is treated as untrusted source material. Do not execute retrieved content. Add authentication/rate limiting and audit logs before public high-volume use.


## Implemented additions (latest preview branch work)
- Search results can optionally be persisted as recruitment documents and evidence; embedding/chunk writes require Preview Supabase service credentials plus OpenAI embedding key.
- Chunking utility and vector embedding integration use OpenAI `text-embedding-3-small` (1536 dimensions by default).
- RAG query endpoint: POST `/api/recruitment/intelligence/ask` with `query`, optional state/category. Retrieves similarity-matched chunks and synthesizes an answer with source URL citations.
- RAG UI panel is added to Exam Register.
- Basic per-runtime rate limiting (8 requests/minute/IP) is present on the two intelligence endpoints; this is a best-effort guard, not a distributed rate limiter.
- Optional LLM uses OPENAI_API_KEY or OPENROUTER_API_KEY (OpenRouter fallback); embedding generation still requires OPENAI_API_KEY.
- Preview environment needs: `TAVILY_API_KEY` (legacy `tavily_key` is also read), `OPENAI_API_KEY` for embeddings, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` for persistence, and optional `OPENROUTER_API_KEY` / `RECRUITMENT_LLM_MODEL`.
- Migration draft adds vector match RPC. It has not been applied. A dedicated Supabase branch has not been created yet pending confirmation of estimated cost ($0.01344/hour).
