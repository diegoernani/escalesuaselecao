-- Supabase schema for Escale sua Seleção
-- Run this file in Supabase SQL Editor.

create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text,
  email text,
  created_at timestamptz not null default now()
);

create table if not exists public.lineups (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  formation text not null check (formation in ('4-3-3', '4-5-1', '4-4-2', '3-5-2')),
  created_at timestamptz not null default now()
);

create table if not exists public.lineup_players (
  id uuid primary key default gen_random_uuid(),
  lineup_id uuid not null references public.lineups(id) on delete cascade,
  position text not null,
  position_id text not null,
  player_name text not null,
  created_at timestamptz not null default now(),
  unique (lineup_id, position_id)
);

create index if not exists idx_lineups_user_id on public.lineups(user_id);
create index if not exists idx_lineups_formation on public.lineups(formation);
create index if not exists idx_lineup_players_lineup_id on public.lineup_players(lineup_id);
create index if not exists idx_lineup_players_position_player on public.lineup_players(position, player_name);

alter table public.profiles enable row level security;
alter table public.lineups enable row level security;
alter table public.lineup_players enable row level security;

drop policy if exists "Profiles are visible to the owner" on public.profiles;
drop policy if exists "Users can insert their own profile" on public.profiles;
drop policy if exists "Users can update their own profile" on public.profiles;

create policy "Profiles are visible to the owner"
on public.profiles for select
to authenticated
using (auth.uid() = id);

create policy "Users can insert their own profile"
on public.profiles for insert
to authenticated
with check (auth.uid() = id);

create policy "Users can update their own profile"
on public.profiles for update
to authenticated
using (auth.uid() = id)
with check (auth.uid() = id);

drop policy if exists "Authenticated users can read lineups" on public.lineups;
drop policy if exists "Users can create their own lineups" on public.lineups;
drop policy if exists "Users can update their own lineups" on public.lineups;
drop policy if exists "Users can delete their own lineups" on public.lineups;

create policy "Authenticated users can read lineups"
on public.lineups for select
to authenticated
using (true);

create policy "Users can create their own lineups"
on public.lineups for insert
to authenticated
with check (auth.uid() = user_id);

create policy "Users can update their own lineups"
on public.lineups for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "Users can delete their own lineups"
on public.lineups for delete
to authenticated
using (auth.uid() = user_id);

drop policy if exists "Authenticated users can read lineup players" on public.lineup_players;
drop policy if exists "Users can create players for their own lineups" on public.lineup_players;
drop policy if exists "Users can update players for their own lineups" on public.lineup_players;
drop policy if exists "Users can delete players from their own lineups" on public.lineup_players;

create policy "Authenticated users can read lineup players"
on public.lineup_players for select
to authenticated
using (true);

create policy "Users can create players for their own lineups"
on public.lineup_players for insert
to authenticated
with check (
  exists (
    select 1
    from public.lineups l
    where l.id = lineup_id
      and l.user_id = auth.uid()
  )
);

create policy "Users can update players for their own lineups"
on public.lineup_players for update
to authenticated
using (
  exists (
    select 1
    from public.lineups l
    where l.id = lineup_id
      and l.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.lineups l
    where l.id = lineup_id
      and l.user_id = auth.uid()
  )
);

create policy "Users can delete players from their own lineups"
on public.lineup_players for delete
to authenticated
using (
  exists (
    select 1
    from public.lineups l
    where l.id = lineup_id
      and l.user_id = auth.uid()
  )
);

create or replace view public.ranking_formations
with (security_invoker = true)
as
select
  formation,
  count(*)::int as votes
from public.lineups
group by formation
order by votes desc, formation asc;

create or replace view public.ranking_players_by_position
with (security_invoker = true)
as
select
  position,
  player_name,
  count(*)::int as votes
from public.lineup_players
group by position, player_name
order by position asc, votes desc, player_name asc;

grant select on public.ranking_formations to authenticated;
grant select on public.ranking_players_by_position to authenticated;

create or replace function public.handle_new_user_profile()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, name, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', new.raw_user_meta_data->>'full_name'),
    new.email
  )
  on conflict (id) do update
  set
    name = excluded.name,
    email = excluded.email;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created_create_profile on auth.users;

create trigger on_auth_user_created_create_profile
after insert on auth.users
for each row execute function public.handle_new_user_profile();
