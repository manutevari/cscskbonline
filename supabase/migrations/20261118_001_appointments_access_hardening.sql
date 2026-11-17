-- Phase 1 security hardening: appointment table access boundary.
-- Review and apply manually in a controlled Supabase migration window.
-- The Next.js server routes use SUPABASE_SERVICE_ROLE_KEY; public clients must
-- not read or mutate appointment rows directly.
alter table public.appointments enable row level security;

revoke all privileges on table public.appointments from anon, authenticated;
grant all privileges on table public.appointments to service_role;

-- Intentionally no anon/authenticated policies are created. Public booking,
-- availability and verification remain mediated by validated server routes.
