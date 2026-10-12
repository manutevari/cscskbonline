-- Run in the Supabase SQL Editor before enabling the privacy request form.
-- Requests are private; no public RLS policies are created.
create table if not exists public.data_deletion_requests (
  id uuid primary key default gen_random_uuid(),
  request_type text not null check (request_type in ('personal_data_deletion','access_or_correction')),
  name text,
  email text,
  mobile text,
  details text,
  consent_confirmed boolean not null default false,
  status text not null default 'RECEIVED' check (status in ('RECEIVED','IDENTITY_CHECK','IN_REVIEW','COMPLETED','REJECTED')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.data_deletion_requests enable row level security;
-- Do not add public SELECT/INSERT/UPDATE/DELETE policies.
-- The server route inserts using SUPABASE_SERVICE_ROLE_KEY, which must remain server-only.
