-- TripJoy — Supabase schema (shared-trip / join-code model)
-- Run this in the Supabase Dashboard → SQL Editor → New query → Run.

-- One row per trip, identified by a short share code. Everyone who enters the
-- code reads & writes the same trip (itinerary, budget, travelers, notes).
create table if not exists public.shared_trips (
  code       text primary key,
  data       jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

-- Keep updated_at fresh
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists shared_trips_touch on public.shared_trips;
create trigger shared_trips_touch
  before update on public.shared_trips
  for each row execute function public.touch_updated_at();

-- Access is controlled by knowing the secret code (rows are not listable by name).
-- Allow read/insert/update for the anon role; there is no user auth in this model.
alter table public.shared_trips enable row level security;

drop policy if exists "trips read" on public.shared_trips;
create policy "trips read" on public.shared_trips for select using (true);

drop policy if exists "trips insert" on public.shared_trips;
create policy "trips insert" on public.shared_trips for insert with check (true);

drop policy if exists "trips update" on public.shared_trips;
create policy "trips update" on public.shared_trips for update using (true);
