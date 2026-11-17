-- CSCSKB RAG knowledge store. Apply to staging first; never run automatically.
begin;

create extension if not exists vector with schema public;

create table if not exists public.knowledge_documents (
 id uuid primary key,
 title text not null,
 source_name text not null,
 source_type text not null check (source_type in ('official_government','official_csc','internal_manual','other')),
 source_url text,
 issuing_authority text,
 jurisdiction text not null default 'India',
 language text not null default 'unknown',
 category text not null default 'general',
 published_on date,
 effective_from date,
 effective_until date,
 version text,
 content_sha256 text not null check (content_sha256 ~ '^[a-f0-9]{64}$'),
 uploaded_by text not null,
 original_filename text not null,
 status text not null default 'pending_review' check (status in ('pending_review','published','rejected','archived')),
 reviewed_by text,
 review_reason text,
 reviewed_at timestamptz,
 created_at timestamptz not null default now()
);

create table if not exists public.knowledge_chunks (
 id bigint generated always as identity primary key,
 document_id uuid not null references public.knowledge_documents(id) on delete cascade,
 chunk_index integer not null check (chunk_index >= 0),
 content text not null,
 embedding vector(1536) not null,
 metadata jsonb not null default '{}'::jsonb,
 created_at timestamptz not null default now(),
 unique(document_id, chunk_index)
);

create index if not exists knowledge_chunks_embedding_idx
 on public.knowledge_chunks using ivfflat (embedding vector_cosine_ops) with (lists = 100);
create index if not exists knowledge_documents_status_category_idx
 on public.knowledge_documents(status, category);
create index if not exists knowledge_documents_hash_idx on public.knowledge_documents(content_sha256);

alter table public.knowledge_documents enable row level security;
alter table public.knowledge_chunks enable row level security;
revoke all on public.knowledge_documents, public.knowledge_chunks from public, anon, authenticated;
grant select, insert, update, delete on public.knowledge_documents, public.knowledge_chunks to service_role;
grant usage, select on sequence public.knowledge_chunks_id_seq to service_role;

create or replace function public.match_csc_knowledge(
 query_embedding vector(1536),
 match_count integer default 5,
 filter_category text default null
)
returns table (
 document_id uuid, title text, source_name text, source_url text,
 issuing_authority text, published_on date, effective_until date,
 chunk_index integer, content text, similarity double precision
)
language sql
stable
security invoker
set search_path = public, pg_temp
as $$
 select d.id, d.title, d.source_name, d.source_url, d.issuing_authority,
        d.published_on, d.effective_until, c.chunk_index, c.content,
        (1 - (c.embedding <=> query_embedding))::double precision as similarity
 from public.knowledge_chunks c
 join public.knowledge_documents d on d.id = c.document_id
 where d.status = 'published'
   and (filter_category is null or d.category = filter_category)
   and (d.effective_until is null or d.effective_until >= current_date)
 order by c.embedding <=> query_embedding
 limit least(greatest(match_count, 1), 10);
$$;
revoke all on function public.match_csc_knowledge(vector, integer, text) from public, anon, authenticated;
grant execute on function public.match_csc_knowledge(vector, integer, text) to service_role;

commit;
