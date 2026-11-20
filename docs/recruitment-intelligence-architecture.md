# CSCSKB Recruitment Intelligence (Preview architecture)

## Proposed flow
Exam Register UI -> LLM orchestrator -> Central / State / UT router -> source adapters
(Tavily search + official source GET/POST/API/HTML/PDF connectors) -> raw evidence -> LLM analyzer/extractor
-> validation/provenance -> normalized recruitment records -> database/history -> RAG retrieval -> intelligence modules.

## Modules
- Search discovery: Tavily API search (enabled only when TAVILY_API_KEY is configured).
- Source connectors: official portals using their supported access method; POST is not universal or forced.
- LLM analyzer: optional OpenAI-compatible Chat Completions via OPENAI_API_KEY. Results are discovery summaries, not verified facts.
- Knowledge base/RAG: planned persistent retrieval layer; not yet implemented. Requires DB schema, document storage and embeddings/vector search.
- Predictor / Trend Analyzer: architecture-ready; only show estimates once history is sufficient and confidence is disclosed.
- Eligibility Matcher / Alert Engine: planned modules.
- Scheduler and source-health monitor: planned orchestration, retry and coverage tracking.

## Predictability color coding
Green = high-confidence regular cycle (supported by published calendars or multiple verified historical cycles);
Yellow = recurring but date variability;
Orange = irregular/low consistency;
Grey = insufficient verified history. Labels should be evidence-derived, not guessed.

## Current preview API
POST /api/recruitment/intelligence/search
Body: { query: string, state?: string, category?: string }
Requires TAVILY_API_KEY. Optional LLM analysis requires OPENAI_API_KEY and optional RECRUITMENT_LLM_MODEL.
Never expose keys to client. Results include URLs and discovery warnings. No persistent RAG writes yet.

## Next implementation steps
1. Configure Preview environment secrets (TAVILY_API_KEY, optionally OPENAI_API_KEY).
2. Add per-state source registry, connector adapters, and official-domain validation.
3. Persist normalized notices, source snapshots, and history in DB; implement deduplication.
4. Add embedding/vector retrieval and RAG answer endpoint with citations.
5. Predictor, cycle analyzer, eligibility matcher, alert engine.
6. Add UI, scheduled refresh, source health, retry/circuit-breakers and tests.
