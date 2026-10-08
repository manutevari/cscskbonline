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

create index if not exists appointments_date_time_idx on public.appointments (date, time);

alter table public.appointments enable row level security;
-- The service role key is used only by the Next.js server route. No public policy is added.
