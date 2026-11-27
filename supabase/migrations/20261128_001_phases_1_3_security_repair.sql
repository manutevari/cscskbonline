-- CSCSKB Phases 1-3 security repair.
-- Prepared on repair/phases-1-3-2026-11-28-main from current main.
-- REVIEW ONLY: this file is not applied by this change.
-- Apply to a staging project first, after API compatibility review.

begin;

-- Phase 1: appointment verification-token persistence.
alter table public.appointments
  add column if not exists verification_token_hash text;

create unique index if not exists appointments_verification_token_hash_unique
  on public.appointments (verification_token_hash)
  where verification_token_hash is not null;

-- The active-slot index already exists in the inspected production schema.
-- Keep this idempotent definition so fresh environments receive the same invariant.
create unique index if not exists appointments_date_time_unique
  on public.appointments (date, time)
  where status in ('BOOKED', 'CONFIRMED');

-- Phase 3: these records are accessed through trusted server-side routes.
-- RLS remains enabled; service_role privileges are deliberately preserved.
revoke all privileges on table
  public.appointments,
  public.audit_logs,
  public.documents,
  public.tata_water_enquiries
from public, anon, authenticated;

-- Vector search is not a public client capability. Preserve server-side access.
revoke all on function public.match_documents(public.vector, integer)
  from public, anon, authenticated;
grant execute on function public.match_documents(public.vector, integer)
  to service_role;

-- Pin search_path for application-owned functions identified by the Supabase
-- security advisor. pg_temp is explicitly last to prevent temporary-object shadowing.
alter function public.match_documents(public.vector, integer)
  set search_path = public, pg_temp;
alter function public.marketing_campaign_content_guard()
  set search_path = public, pg_temp;
alter function public.prevent_approval_event_mutation()
  set search_path = public, pg_temp;
alter function public.decide_marketing_approval(uuid, text, text, text, text)
  set search_path = public, pg_temp;
alter function public.claim_approved_marketing_execution(uuid, text, integer, text)
  set search_path = public, pg_temp;

commit;
