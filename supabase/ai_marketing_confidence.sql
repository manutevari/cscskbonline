-- Confidence gate and sensitive-data human-review metadata for CSCSKB campaigns.
create table if not exists public.marketing_ai_assessments (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references public.marketing_campaigns(id) on delete restrict,
  confidence_score integer not null check (confidence_score between 0 and 100),
  confidence_threshold integer not null check (confidence_threshold between 1 and 100),
  confidence_decision text not null check (confidence_decision in ('AUTO_REJECT','PASS')),
  confidence_reason text not null default '',
  assessment_source text not null,
  sensitive_data_detected boolean not null default false,
  human_review_required boolean not null default false,
  assessed_by text not null,
  created_at timestamptz not null default now()
);
create index if not exists marketing_ai_assessments_campaign_idx on public.marketing_ai_assessments(campaign_id, created_at desc);
alter table public.marketing_ai_assessments enable row level security;
revoke all on public.marketing_ai_assessments from public, anon, authenticated;
grant select, insert on public.marketing_ai_assessments to service_role;
