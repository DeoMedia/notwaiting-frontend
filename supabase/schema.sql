-- ============================================================
-- #NotWaiting — Supabase Database Schema
-- Run this in Supabase Dashboard → SQL Editor → New Query
-- ============================================================

create extension if not exists "uuid-ossp";

-- ── Signers ───────────────────────────────────────────────────
create table if not exists public.signers (
  id          uuid primary key default uuid_generate_v4(),
  first_name  text not null check (char_length(first_name) between 1 and 60),
  country     text not null,
  wave        text,
  wave_tag    text,
  created_at  timestamptz not null default now(),
  constraint signers_unique unique (first_name, country)
);

-- ── Actions ───────────────────────────────────────────────────
create type public.action_type as enum ('signed', 'got_mark', 'shared_social', 'shared_story');

create table if not exists public.actions (
  id          uuid primary key default uuid_generate_v4(),
  signer_id   uuid references public.signers(id) on delete cascade,
  action      public.action_type not null,
  metadata    jsonb,
  created_at  timestamptz not null default now()
);

-- ── Stories ───────────────────────────────────────────────────
create table if not exists public.stories (
  id          uuid primary key default uuid_generate_v4(),
  signer_id   uuid references public.signers(id) on delete cascade,
  first_name  text not null,
  country     text not null,
  wave_tag    text not null,
  caption     text not null check (char_length(caption) between 1 and 600),
  is_visible  boolean not null default true,
  created_at  timestamptz not null default now()
);

-- ── Stats view ────────────────────────────────────────────────
create or replace view public.movement_stats as
select
  (select count(*) from public.signers)::int                                           as total_signers,
  (select count(distinct country) from public.signers)::int                            as total_countries,
  (select count(*) from public.actions where action = 'got_mark')::int                 as total_marks,
  (select count(*) from public.actions where action in ('shared_social','shared_story'))::int as total_shares,
  (select count(*) from public.signers where created_at > now() - interval '24 hours')::int  as signed_today,
  (select count(*) from public.actions where action = 'got_mark'
     and created_at > now() - interval '24 hours')::int                                as marks_today,
  (select count(*) from public.actions
     where action in ('shared_social','shared_story')
     and created_at > now() - interval '24 hours')::int                                as shares_today;

-- ── Wave breakdown ────────────────────────────────────────────
create or replace view public.wave_breakdown as
select wave_tag, count(*)::int as signer_count
from public.signers
where wave_tag is not null
group by wave_tag
order by signer_count desc;

-- ── Country breakdown ─────────────────────────────────────────
create or replace view public.country_breakdown as
select country, count(*)::int as signer_count
from public.signers
group by country
order by signer_count desc
limit 20;

-- ── Indexes ───────────────────────────────────────────────────
create index if not exists signers_country_idx  on public.signers(country);
create index if not exists signers_wave_idx     on public.signers(wave_tag);
create index if not exists signers_created_idx  on public.signers(created_at desc);
create index if not exists actions_signer_idx   on public.actions(signer_id);
create index if not exists stories_visible_idx  on public.stories(is_visible, created_at desc);

-- ── Row Level Security ────────────────────────────────────────
alter table public.signers enable row level security;
alter table public.actions  enable row level security;
alter table public.stories  enable row level security;

-- Public can read signers (for the counter)
create policy "Public read signers"  on public.signers for select using (true);
-- Public can read visible stories
create policy "Public read stories"  on public.stories for select using (is_visible = true);
-- Service role key (used in the server) bypasses RLS automatically.

-- ── Realtime on signers (live counter) ───────────────────────
alter publication supabase_realtime add table public.signers;
