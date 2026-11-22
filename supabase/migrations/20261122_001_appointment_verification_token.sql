-- Phase 2 repair: appointment verification token storage.
-- Apply in Supabase before deploying the appointment API fix.
-- This migration is idempotent for existing appointment tables.

create table if not exists public.appointments (
  id text primary key,
  name text not null,
  mobile text not null,
  service text not null,
  date date not null,
  time text not null,
  remarks text default '',
  status text not null default 'BOOKED' check (status in ('BOOKED','CONFIRMED','COMPLETED','CANCELLED')),
  created_at timestamptz not null default now()
);

alter table public.appointments
  add column if not exists verification_token_hash text;

create index if not exists appointments_date_time_idx
  on public.appointments (date, time);

create unique index if not exists appointments_date_time_unique
  on public.appointments (date, time)
  where status in ('BOOKED', 'CONFIRMED');

create unique index if not exists appointments_verification_token_hash_unique
  on public.appointments (verification_token_hash)
  where verification_token_hash is not null;

alter table public.appointments enable row level security;

revoke all privileges on table public.appointments from anon, authenticated;
grant all privileges on table public.appointments to service_role;
