-- CSCSKB security remediation: private tables, function execution, and appointment verification.
-- Review and apply in staging first. This file is not executed by this PR.

begin;

-- Restore the two missing schema dependencies used by existing server APIs.
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
revoke all on public.data_deletion_requests from public, anon, authenticated;
grant select, insert, update on public.data_deletion_requests to service_role;

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
create index if not exists marketing_ai_assessments_campaign_idx
  on public.marketing_ai_assessments(campaign_id, created_at desc);
alter table public.marketing_ai_assessments enable row level security;
revoke all on public.marketing_ai_assessments from public, anon, authenticated;
grant select, insert on public.marketing_ai_assessments to service_role;

-- All four tables are server-mediated today. Public clients must not query or mutate them.
revoke all on public.appointments, public.audit_logs, public.documents, public.tata_water_enquiries
  from public, anon, authenticated;

-- Existing service-role server routes retain only the operations they currently require.
grant select, insert, update on public.appointments to service_role;
grant select, insert, update, delete on public.audit_logs to service_role;
grant select, insert, update, delete on public.documents to service_role;
grant select, insert, update, delete on public.tata_water_enquiries to service_role;

-- Public vector search is not currently exposed as a client feature.
revoke all on function public.match_documents(vector, integer) from public, anon, authenticated;

-- Pin function search paths for existing application-owned functions.
alter function public.marketing_campaign_content_guard() set search_path = public, extensions;
alter function public.prevent_approval_event_mutation() set search_path = public, extensions;
alter function public.decide_marketing_approval(uuid,text,text,text,text) set search_path = public, extensions;
alter function public.claim_approved_marketing_execution(uuid,text,integer,text) set search_path = public, extensions;
alter function public.match_documents(vector, integer) set search_path = public, extensions;

-- Appointment verification uses a high-entropy bearer token; only its SHA-256 digest is stored.
alter table public.appointments add column if not exists verification_token_hash text;
create unique index if not exists appointments_verification_token_hash_uidx
  on public.appointments(verification_token_hash)
  where verification_token_hash is not null;

commit;
