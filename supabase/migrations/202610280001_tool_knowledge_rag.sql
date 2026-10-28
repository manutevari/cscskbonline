-- CSC SKB Online tool-catalog RAG
-- Run once in Supabase SQL Editor before setting the RAG environment variables.
create extension if not exists vector with schema extensions;

create table if not exists public.tool_knowledge (
  id text primary key,
  title text not null,
  category text not null,
  content text not null,
  metadata jsonb not null default '{}'::jsonb,
  embedding extensions.vector(1536),
  updated_at timestamptz not null default now()
);

create index if not exists tool_knowledge_category_idx on public.tool_knowledge (category);
create index if not exists tool_knowledge_embedding_hnsw_idx
  on public.tool_knowledge using hnsw (embedding extensions.vector_cosine_ops);

alter table public.tool_knowledge enable row level security;
-- No anon/authenticated policies: the service-role key is server-only and bypasses RLS.

create or replace function public.search_tool_knowledge(
  query_embedding extensions.vector(1536),
  match_count integer default 6,
  filter_category text default null
)
returns table (
  id text,
  title text,
  category text,
  content text,
  metadata jsonb,
  similarity double precision
)
language sql stable
as $$
  select
    tk.id,
    tk.title,
    tk.category,
    tk.content,
    tk.metadata,
    1 - (tk.embedding <=> query_embedding) as similarity
  from public.tool_knowledge tk
  where tk.embedding is not null
    and (filter_category is null or tk.category = filter_category)
  order by tk.embedding <=> query_embedding
  limit greatest(1, least(match_count, 20));
$$;

revoke all on function public.search_tool_knowledge(extensions.vector, integer, text) from public, anon, authenticated;
grant execute on function public.search_tool_knowledge(extensions.vector, integer, text) to service_role;
