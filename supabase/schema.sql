-- TripJoy — Supabase schema
-- Run this in the Supabase Dashboard → SQL Editor → New query → Run.

-- One JSON document per user holding their whole trip state
-- (travelers, itinerary, expenses, notes, savings). Simple and syncs across devices.
create table if not exists public.trip_data (
  user_id    uuid primary key references auth.users (id) on delete cascade,
  email      text,
  name       text,
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

drop trigger if exists trip_data_touch on public.trip_data;
create trigger trip_data_touch
  before update on public.trip_data
  for each row execute function public.touch_updated_at();

-- Row Level Security: each user can only see / edit their own row
alter table public.trip_data enable row level security;

drop policy if exists "own row select" on public.trip_data;
create policy "own row select" on public.trip_data
  for select using (auth.uid() = user_id);

drop policy if exists "own row insert" on public.trip_data;
create policy "own row insert" on public.trip_data
  for insert with check (auth.uid() = user_id);

drop policy if exists "own row update" on public.trip_data;
create policy "own row update" on public.trip_data
  for update using (auth.uid() = user_id);
