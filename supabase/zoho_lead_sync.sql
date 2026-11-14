-- Zoho CRM lead-sync state. Apply in Supabase SQL Editor before enabling Zoho sync.
create table if not exists public.zoho_lead_sync (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null unique references public.marketing_leads(id) on delete cascade,
  status text not null default 'PENDING' check (status in ('PENDING','SYNCED','FAILED')),
  zoho_lead_id text,
  attempt_count integer not null default 0,
  last_error text,
  last_attempt_at timestamptz,
  synced_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists zoho_lead_sync_status_idx
  on public.zoho_lead_sync(status, created_at);
alter table public.zoho_lead_sync enable row level security;
revoke all on public.zoho_lead_sync from anon, authenticated;
grant select, insert, update on public.zoho_lead_sync to service_role;
