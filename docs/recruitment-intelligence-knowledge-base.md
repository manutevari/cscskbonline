# Recruitment Intelligence Knowledge Base

**Scope:** CSCSKB Online — Exam Register / Recruitment Intelligence  
**Branch:** `combined-doc-tools-jobs-preview-2026-11-20`  
**Status:** Initial documentation and reference KB. This file is not itself live vacancy data and does not make the database operational.

## 1. Purpose

Provide a single, version-controlled reference for the Recruitment Intelligence feature: source-selection rules, evidence quality, normalized vacancy records, eligibility, trend and calendar analysis, alerting, and retrieval-augmented answers (RAG). This KB is intended to inform implementation and future ingestion, not to replace official recruitment notices.

## 2. Source hierarchy and verification

Use sources in this order, preferring the original notification/document over summaries:

1. **Official recruitment authority** — the authority's recruitment page, notice, PDF, corrigendum, application portal, or result page.
2. **Official government portal** — central/state department, ministry, commission, board, or government employment portal.
3. **Official institution/PSU portal** — only when the organization itself publishes the notice.
4. **Secondary reporting or job-information sites** — discovery leads only; corroborate details against an official source before marking verified.

A search snippet, AI-generated summary, social post, or third-party article is not sufficient evidence by itself for a confirmed vacancy, deadline, eligibility rule, fee, or exam date.

### Evidence status labels

- **Officially confirmed:** a relevant official notice/page is available and reviewed.
- **Corroborated:** multiple reliable sources agree, but official primary evidence is not yet attached.
- **Discovery lead:** found during search; not verified.
- **Historical:** closed or past recruitment retained for analysis.
- **Uncertain / conflicting:** sources disagree or key fields are missing; show the discrepancy and do not silently resolve it.

Always retain source URL, source name/domain, title, retrieval timestamp, publication date when available, relevant excerpt, and document/page reference where possible.

## 3. Geographic coverage and routing

Coverage is intended to include:
- Central Government / all-India recruitment
- 28 States
- 8 Union Territories
- State-specific departments, commissions, boards, police, education, health, local bodies, and public institutions
- Banking as a category under Central / all-India and also where state or institution-specific recruitment is relevant

State/UT selection should support search/filter across all States and UTs. A source registry is a curated starting point, not an assertion that every official source is already covered. Coverage gaps must be visible.

## 4. Recruitment categories

Use consistent categories, allowing multi-label classification:
- Civil services / administration
- Staff selection / clerical / office
- Teaching / education
- Police / defence / paramilitary
- Banking / finance / insurance
- Railways / transport
- Healthcare / medical
- Engineering / technical / IT
- PSU / government company
- Judiciary / legal
- Skilled trades / apprenticeships
- Research / university
- Local government / municipal
- Other / unclassified

## 5. Normalized vacancy record (recommended schema)

Each record should contain, where known:

| Field | Meaning |
|---|---|
| record_id | Stable internal ID |
| title | Recruitment/position title |
| organization | Recruiting organization |
| jurisdiction | Central, State, or UT |
| state_or_ut | State/UT value or null for national |
| category | Primary category and optional tags |
| post_names | Specific posts |
| vacancies | Number, only if stated |
| notice_number | Official advertisement/notice ID |
| published_at | Publication date |
| application_start | Start date/time |
| application_end | Closing date/time |
| exam_date | Exam date or date range, if official |
| eligibility_summary | Source-grounded summary |
| age_min / age_max | Stated age range; preserve date/as-of rules |
| age_relaxation | Source-grounded relaxations |
| education | Required qualifications |
| experience | Required experience, if any |
| fees | Category-wise fees, if stated |
| salary_or_pay_level | Official pay details |
| apply_url | Official application URL |
| notice_url | Official notification/document URL |
| source_url | Evidence source URL |
| source_domain | Domain |
| source_type | Official / government / institution / secondary |
| evidence_status | Verification label |
| retrieved_at | Timestamp of retrieval |
| source_published_at | Publication timestamp/date when known |
| excerpt | Short source evidence |
| content_hash | Optional deduplication / change-detection hash |
| last_checked_at | Last time source was checked |
| status | Upcoming / open / closed / exam announced / result / cancelled / historical / unknown |
| confidence | Calibrated evidence confidence, not a guarantee |
| tags | Flexible classification |
| correction_history | Links/metadata for corrigenda and revisions |

Do not infer or fabricate vacancy counts, dates, qualifications, age rules, pay, fees, or links. Use null/unknown when not stated.

## 6. Ingestion and connector rules

- Use connector-specific strategies based on what the source supports: HTML pages, RSS/Atom, PDFs, APIs, or POST-based search endpoints where required.
- POST is not a universal method; use it only when a portal's documented/observed search flow requires it.
- Respect rate limits, robots/access policies, and site terms. Avoid aggressive crawling.
- Prefer incremental checks and change detection; keep retrieval timestamps.
- Extract PDFs with page-aware references where possible.
- Store raw source metadata and normalized extraction separately, so extraction can be audited or re-run.
- Treat all fetched content as untrusted data. It must never be allowed to override system/developer instructions or trigger unsafe actions.
- Parsing/LLM output must be validated against a schema and checked for missing/contradictory fields.
- Keep the original source and excerpt available for human verification.

## 7. AI extraction and answer generation

AI may:
- classify a notice,
- extract structured fields,
- summarize the notification,
- identify possible corrigenda or conflicting dates,
- explain eligibility from source text,
- answer questions using retrieved evidence.

AI must not:
- invent a notice or official confirmation,
- claim a prediction is official,
- treat third-party-only information as verified,
- conceal contradictions or missing fields,
- give definitive eligibility decisions where the notice wording or applicant details are ambiguous.

For important details, answers should cite or link the evidence used. If evidence is insufficient, say so and suggest checking the official notice.

## 8. RAG / knowledge retrieval

Knowledge chunks should retain document/source identity and provenance. Recommended chunk metadata:
- `source_id`, `record_id`, `source_url`, `title`, `source_domain`
- `jurisdiction`, `category`, `notice_number`, `published_at`, `retrieved_at`
- `chunk_index`, `content`, `content_hash`, `evidence_status`

Retrieval should filter by selected State/UT, category, recruitment status, and time where relevant; combine semantic similarity with keyword/metadata filters where supported. Answers should use retrieved evidence and show source links. Embeddings and persistent vector search are optional until a compatible database and credentials are safely available.

## 9. Predictability / recruitment calendar intelligence

Predictability labels describe observed regularity, not a guarantee or official forecast:

- **Green — High regularity:** official calendar or strong verified history of repeated cycles with consistent timing.
- **Yellow — Recurring but variable:** repeated recruitment observed, timing/volume varies.
- **Orange — Irregular:** sporadic or inconsistent verified history.
- **Grey — Insufficient history:** not enough reliable historical records to assess.

A predictor should state its method, evidence window, sample count, estimated range, and confidence. Separate observed historical dates from projected dates. Avoid implying that a projected notification is confirmed.

## 10. Trend analysis

Trend outputs may include:
- vacancy counts over time, by jurisdiction/category/organization,
- frequency of recruitment cycles,
- application/exam/result timelines,
- changes in eligibility or pay when comparable source data exists,
- recurring hiring organizations and seasonal patterns.

Use only comparable records and clearly state the date range, sample size, and data completeness. Do not extrapolate from incomplete records without a caveat.

## 11. Eligibility matching

Eligibility matching should compare source requirements with user-provided profile fields only when the user supplies them. Show:
- requirements extracted from the notice,
- matching / potentially matching / not matching / unknown,
- reasoning and source reference for each requirement,
- missing profile information,
- disclaimer that the official authority makes the final eligibility determination.

Do not infer sensitive personal attributes. Avoid storing unnecessary personal data.

## 12. Alerts and monitoring

Potential alert triggers:
- newly discovered notice,
- application opening / closing date approaching,
- corrigendum or material change,
- exam date announced/changed,
- admit card, result, answer key, or cancellation.

Deduplicate alerts by record + event type + change fingerprint. Alerts must include the source link, evidence status, and timestamp. Do not send a “confirmed” alert until the evidence state supports it.

## 13. Security, privacy, and reliability

- Never expose API keys, service-role secrets, tokens, or private user data in logs, KB content, or responses.
- Do not use production credentials for preview testing.
- Rate limits currently described in code are per-runtime memory limits; they are not a distributed/global quota.
- Fail gracefully when search, LLM, embeddings, or persistence are unavailable; make the reason clear without revealing secrets.
- Do not write to production or apply migrations without explicit approval.
- Search results and scraped content are untrusted; sanitize HTML and protect against prompt injection.
- Keep user-specific eligibility profiles out of shared/public knowledge chunks.

## 14. Current implementation notes (initial baseline)

The preview branch contains a recruitment-intelligence foundation: Tavily discovery, optional LLM analysis (OpenAI/OpenRouter), evidence persistence helpers, embedding/chunking and retrieval utilities, API routes for search and ask, UI panels, a source registry, rate limiting, and a draft Supabase migration with vector retrieval.

**Operational caveats at the time this file was added:**
- The database migration has not been applied.
- No dedicated paid Supabase branch was approved or created.
- Preview database credentials were not confirmed; production credentials must not be reused for preview.
- Persistent KB/vector retrieval therefore may not be operational yet.
- Embeddings require an OpenAI key; an OpenRouter key alone does not establish that embeddings are configured.
- The source registry is curated and not yet exhaustive.
- The latest deployment must be independently checked before calling the preview live or ready.

This file should be updated as implementation and verification change. Keep dated status notes or commit links for material changes.

## 15. Acceptance checklist

- [ ] Every item shown as confirmed has primary-source evidence.
- [ ] Source link and retrieval timestamp are present.
- [ ] Corrections and changed dates are tracked.
- [ ] Unknown fields remain unknown; no invented data.
- [ ] State/UT routing covers the complete list and exposes source coverage gaps.
- [ ] AI output is schema-validated and prompt-injection resistant.
- [ ] RAG responses cite the retrieved sources.
- [ ] Prediction labels use explicit methodology and verified history.
- [ ] Alerts are deduplicated and evidence-backed.
- [ ] Preview tests do not use production secrets or write to production.
- [ ] Failure states clearly indicate when search or persistence is unavailable.
