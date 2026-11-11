-- UPSC Hybrid RAG: document vectors, per-query ranking, and cumulative global ranking.
-- Apply only to the intended non-production database after reviewing connection settings.
CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE IF NOT EXISTS upsc_source_registry (
  id BIGSERIAL PRIMARY KEY,
  canonical_domain TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  source_type TEXT NOT NULL DEFAULT 'official',
  authority_score REAL NOT NULL DEFAULT 0.5 CHECK (authority_score BETWEEN 0 AND 1),
  is_verified BOOLEAN NOT NULL DEFAULT FALSE,
  verification_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS upsc_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_id BIGINT REFERENCES upsc_source_registry(id),
  canonical_url TEXT NOT NULL,
  title TEXT NOT NULL,
  document_type TEXT NOT NULL DEFAULT 'reference',
  language TEXT,
  published_at TIMESTAMPTZ,
  content_hash TEXT NOT NULL,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  ingested_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (canonical_url, content_hash)
);

CREATE TABLE IF NOT EXISTS upsc_document_chunks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID NOT NULL REFERENCES upsc_documents(id) ON DELETE CASCADE,
  chunk_index INTEGER NOT NULL,
  content TEXT NOT NULL,
  token_count INTEGER NOT NULL CHECK (token_count BETWEEN 1 AND 500),
  start_token INTEGER NOT NULL,
  end_token INTEGER NOT NULL,
  embedding VECTOR,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (document_id, chunk_index)
);
CREATE INDEX IF NOT EXISTS upsc_chunks_document_idx ON upsc_document_chunks(document_id);
CREATE INDEX IF NOT EXISTS upsc_chunks_metadata_gin ON upsc_document_chunks USING GIN(metadata);

CREATE TABLE IF NOT EXISTS upsc_search_queries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  query_text TEXT NOT NULL,
  normalized_query TEXT NOT NULL,
  user_scope_hash TEXT,
  language TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS upsc_queries_normalized_idx ON upsc_search_queries(normalized_query);
CREATE INDEX IF NOT EXISTS upsc_queries_created_idx ON upsc_search_queries(created_at DESC);

CREATE TABLE IF NOT EXISTS upsc_search_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  query_id UUID NOT NULL REFERENCES upsc_search_queries(id) ON DELETE CASCADE,
  document_id UUID REFERENCES upsc_documents(id) ON DELETE SET NULL,
  chunk_id UUID REFERENCES upsc_document_chunks(id) ON DELETE SET NULL,
  channel TEXT NOT NULL CHECK (channel IN ('semantic','tavily','prior_rank')),
  result_url TEXT NOT NULL,
  title TEXT NOT NULL,
  snippet TEXT,
  provider_rank INTEGER,
  retrieved_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  raw_metadata JSONB NOT NULL DEFAULT '{}'::jsonb
);
CREATE INDEX IF NOT EXISTS upsc_results_query_idx ON upsc_search_results(query_id);

CREATE TABLE IF NOT EXISTS upsc_search_rankings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  query_id UUID NOT NULL REFERENCES upsc_search_queries(id) ON DELETE CASCADE,
  result_id UUID NOT NULL REFERENCES upsc_search_results(id) ON DELETE CASCADE,
  rank_position INTEGER NOT NULL CHECK (rank_position > 0),
  total_score REAL NOT NULL CHECK (total_score BETWEEN 0 AND 1),
  semantic_score REAL NOT NULL DEFAULT 0,
  authority_score REAL NOT NULL DEFAULT 0,
  keyword_score REAL NOT NULL DEFAULT 0,
  freshness_score REAL NOT NULL DEFAULT 0,
  evidence_score REAL NOT NULL DEFAULT 0,
  ranking_version TEXT NOT NULL DEFAULT 'v1',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (query_id, result_id),
  UNIQUE (query_id, rank_position)
);
CREATE INDEX IF NOT EXISTS upsc_rankings_query_score_idx ON upsc_search_rankings(query_id, total_score DESC);

-- Cumulative score is materialized separately from query-specific rankings.
CREATE TABLE IF NOT EXISTS upsc_global_document_rankings (
  document_key TEXT PRIMARY KEY,
  canonical_url TEXT NOT NULL,
  title TEXT NOT NULL,
  query_count BIGINT NOT NULL DEFAULT 0,
  weighted_clicks DOUBLE PRECISION NOT NULL DEFAULT 0,
  positive_feedback BIGINT NOT NULL DEFAULT 0,
  negative_feedback BIGINT NOT NULL DEFAULT 0,
  mean_query_score REAL NOT NULL DEFAULT 0,
  global_score REAL NOT NULL DEFAULT 0 CHECK (global_score BETWEEN 0 AND 1),
  last_seen_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS upsc_global_rank_score_idx ON upsc_global_document_rankings(global_score DESC);

CREATE TABLE IF NOT EXISTS upsc_search_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  query_id UUID NOT NULL REFERENCES upsc_search_queries(id) ON DELETE CASCADE,
  result_id UUID NOT NULL REFERENCES upsc_search_results(id) ON DELETE CASCADE,
  feedback SMALLINT NOT NULL CHECK (feedback IN (-1, 1)),
  feedback_scope_hash TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS upsc_feedback_result_idx ON upsc_search_feedback(result_id);

-- Security: do not store raw personal identifiers in user_scope_hash; hash a random/session identifier.
-- Never expose Tavily API keys or database credentials to browser code.
