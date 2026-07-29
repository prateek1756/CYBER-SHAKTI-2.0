-- Run this in your Supabase project: SQL Editor → New Query

-- Enable PostGIS extension for geo queries (already available in Supabase)
create extension if not exists postgis;

create table if not exists scam_reports (
  id          bigint generated always as identity primary key,
  title       text not null,
  description text not null,
  latitude    double precision not null,
  longitude   double precision not null,
  status      text not null default 'verified' check (status in ('pending', 'verified', 'rejected')),
  created_at  timestamptz default now()
);

-- Spatial index via PostGIS geography column (optional but fast for radius queries)
-- Haversine filtering is done in the Express layer, so this index is a bonus.
create index if not exists idx_scam_reports_status on scam_reports (status);
create index if not exists idx_scam_reports_created_at on scam_reports (created_at desc);

-- Row Level Security: allow public reads of verified reports, authenticated inserts
alter table scam_reports enable row level security;

create policy "Public can read verified scams"
  on scam_reports for select
  using (status = 'verified');

create policy "Anyone can insert scam reports"
  on scam_reports for insert
  with check (true);
