-- Preview-only multi-user identity foundation for CSCSKB Marketing Agent
create extension if not exists pgcrypto;
create table if not exists public.marketing_users (
 id uuid primary key default gen_random_uuid(),
 username text not null unique,
 email text unique,
 password_hash text not null,
 role text not null default 'marketing_manager' check (role in ('owner_admin','marketing_manager')),
 active boolean not null default true,
 created_at timestamptz not null default now()
);
alter table public.marketing_users enable row level security;
revoke all on public.marketing_users from public, anon, authenticated;
grant select, insert, update on public.marketing_users to service_role;

alter table public.marketing_leads add column if not exists owner_user_id uuid references public.marketing_users(id) on delete set null;
alter table public.marketing_campaigns add column if not exists owner_user_id uuid references public.marketing_users(id) on delete set null;
create index if not exists marketing_leads_owner_idx on public.marketing_leads(owner_user_id,created_at desc);
create index if not exists marketing_campaigns_owner_idx on public.marketing_campaigns(owner_user_id,created_at desc);

-- Preserve existing records as owner-only legacy data; registration users cannot see these.
-- Owner account is provisioned by the server on first successful owner login.
