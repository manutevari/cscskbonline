-- CSCSKB AI Marketing Agent: multi-vertical CRM and human-approved campaigns
create extension if not exists pgcrypto;

create table if not exists public.marketing_leads (
  id uuid primary key default gen_random_uuid(),
  vertical text not null check (vertical in ('csc_services','tata_water','food_safety','insurance_banking')),
  full_name text not null,
  phone text not null,
  email text,
  city text,
  service_interest text,
  message text,
  source text not null default 'website',
  consent_to_contact boolean not null default false,
  lead_score integer not null default 20 check (lead_score between 0 and 100),
  status text not null default 'NEW' check (status in ('NEW','CONTACTED','QUALIFIED','CONVERTED','LOST')),
  assigned_to text,
  next_follow_up_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists marketing_leads_vertical_status_idx on public.marketing_leads(vertical,status,created_at desc);
create index if not exists marketing_leads_phone_idx on public.marketing_leads(phone);

create table if not exists public.marketing_campaigns (
  id uuid primary key default gen_random_uuid(),
  vertical text not null check (vertical in ('csc_services','tata_water','food_safety','insurance_banking')),
  name text not null,
  channel text not null check (channel in ('whatsapp','facebook','instagram','google_business','email','website')),
  audience text not null default '',
  objective text not null default '',
  language text not null default 'hi',
  draft_content text not null,
  status text not null default 'DRAFT' check (status in ('DRAFT','PENDING_APPROVAL','APPROVED','REJECTED','PUBLISHED')),
  created_by text not null default 'marketing_agent',
  approved_by text,
  approved_at timestamptz,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists marketing_campaigns_status_idx on public.marketing_campaigns(status,created_at desc);

create table if not exists public.marketing_activities (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid references public.marketing_leads(id) on delete set null,
  campaign_id uuid references public.marketing_campaigns(id) on delete set null,
  activity_type text not null,
  details jsonb not null default '{}'::jsonb,
  actor text not null default 'system',
  created_at timestamptz not null default now()
);
create index if not exists marketing_activities_created_idx on public.marketing_activities(created_at desc);

alter table public.marketing_leads enable row level security;
alter table public.marketing_campaigns enable row level security;
alter table public.marketing_activities enable row level security;
-- No anon/authenticated policies: all privileged reads/writes go through server routes
-- using SUPABASE_SERVICE_ROLE_KEY. Never expose that key in client-side code.

