-- Recruitment Intelligence preview schema. Apply only to the dedicated preview Supabase project after verifying credentials.
create extension if not exists pgcrypto;
create extension if not exists vector;

create table if not exists public.recruitment_documents (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  url text not null unique,
  source_domain text,
  source_kind text not null default 'search_discovery',
  state text,
  category text,
  status text not null default 'discovery',
  content_text text,
  content_hash text,
  published_at date,
  application_start date,
  application_end date,
  exam_date date,
  vacancy_count integer,
  eligibility jsonb not null default '{}'::jsonb,
  extracted_fields jsonb not null default '{}'::jsonb,
  confidence numeric(4,3),
  verification_status text not null default 'unverified',
  last_seen_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists recruitment_documents_state_idx on public.recruitment_documents(state,category,status);
create index if not exists recruitment_documents_last_seen_idx on public.recruitment_documents(last_seen_at desc);

create table if not exists public.recruitment_evidence (
  id uuid primary key default gen_random_uuid(),
  document_id uuid references public.recruitment_documents(id) on delete cascade,
  provider text not null,
  query text,
  url text not null,
  title text,
  excerpt text,
  score numeric(5,4),
  collected_at timestamptz not null default now(),
  raw_metadata jsonb not null default '{}'::jsonb
);
create index if not exists recruitment_evidence_document_idx on public.recruitment_evidence(document_id);

create table if not exists public.recruitment_history (
  id uuid primary key default gen_random_uuid(),
  board text not null,
  exam_name text not null,
  state text,
  cycle_label text,
  notification_date date,
  application_start date,
  application_end date,
  exam_date date,
  result_date date,
  vacancy_count integer,
  source_url text,
  confidence numeric(4,3),
  verified boolean not null default false,
  created_at timestamptz not null default now()
);
create index if not exists recruitment_history_exam_idx on public.recruitment_history(board,exam_name,state);

create table if not exists public.recruitment_chunks (
  id uuid primary key default gen_random_uuid(),
  document_id uuid references public.recruitment_documents(id) on delete cascade,
  chunk_index integer not null,
  chunk_text text not null,
  embedding vector(1536),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  unique(document_id,chunk_index)
);
create index if not exists recruitment_chunks_embedding_idx on public.recruitment_chunks using ivfflat (embedding vector_cosine_ops) with (lists = 100);

-- RLS is enabled; public access denied. Service-role backend only.
alter table public.recruitment_documents enable row level security;
alter table public.recruitment_evidence enable row level security;
alter table public.recruitment_history enable row level security;
alter table public.recruitment_chunks enable row level security;
