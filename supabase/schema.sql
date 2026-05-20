-- Supabase schema for Escale sua Selecao
-- Run this file in Supabase SQL Editor.
-- Upcoming Brazil fixtures seeded below were confirmed from FIFA pages on 2026-05-20.

create extension if not exists pgcrypto;

create table if not exists public.national_teams (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  short_name text not null,
  fifa_code text unique,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.team_players (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references public.national_teams(id) on delete cascade,
  name text not null,
  category text not null check (category in ('Goleiros', 'Defensores', 'Meio-campistas', 'Atacantes')),
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  unique (team_id, name)
);

create table if not exists public.matches (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  home_team_id uuid not null references public.national_teams(id) on delete cascade,
  away_team_id uuid not null references public.national_teams(id) on delete cascade,
  competition_name text not null,
  competition_stage text,
  venue_name text,
  venue_city text,
  match_at timestamptz not null,
  status text not null default 'scheduled' check (status in ('scheduled', 'completed', 'postponed', 'cancelled')),
  featured_rank integer not null default 0,
  created_at timestamptz not null default now(),
  check (home_team_id <> away_team_id)
);

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text,
  email text,
  created_at timestamptz not null default now()
);

create table if not exists public.lineups (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  team_id uuid not null references public.national_teams(id) on delete restrict,
  match_id uuid references public.matches(id) on delete set null,
  formation text not null check (formation in ('4-3-3', '4-5-1', '4-4-2', '3-5-2')),
  created_at timestamptz not null default now()
);

alter table public.lineups
  add column if not exists team_id uuid references public.national_teams(id) on delete restrict;

alter table public.lineups
  add column if not exists match_id uuid references public.matches(id) on delete set null;

create table if not exists public.lineup_players (
  id uuid primary key default gen_random_uuid(),
  lineup_id uuid not null references public.lineups(id) on delete cascade,
  position text not null,
  position_id text not null,
  player_name text not null,
  created_at timestamptz not null default now(),
  unique (lineup_id, position_id)
);

insert into public.national_teams (slug, name, short_name, fifa_code)
values
  ('brazil', 'Brasil', 'Brasil', 'BRA'),
  ('morocco', 'Marrocos', 'Marrocos', 'MAR'),
  ('haiti', 'Haiti', 'Haiti', 'HAI'),
  ('scotland', 'Escocia', 'Escocia', 'SCO')
on conflict (slug) do update
set
  name = excluded.name,
  short_name = excluded.short_name,
  fifa_code = excluded.fifa_code,
  is_active = true;

with brazil as (
  select id
  from public.national_teams
  where slug = 'brazil'
)
insert into public.team_players (team_id, name, category, sort_order)
select
  brazil.id,
  player.name,
  player.category,
  player.sort_order
from brazil
cross join (
  values
    ('Alisson', 'Goleiros', 1),
    ('Ederson', 'Goleiros', 2),
    ('Weverton', 'Goleiros', 3),
    ('Alex Sandro', 'Defensores', 10),
    ('Bremer', 'Defensores', 11),
    ('Danilo', 'Defensores', 12),
    ('Douglas Santos', 'Defensores', 13),
    ('Gabriel Magalhaes', 'Defensores', 14),
    ('Ibanez', 'Defensores', 15),
    ('Leo Pereira', 'Defensores', 16),
    ('Marquinhos', 'Defensores', 17),
    ('Wesley', 'Defensores', 18),
    ('Bruno Guimaraes', 'Meio-campistas', 20),
    ('Casemiro', 'Meio-campistas', 21),
    ('Danilo Santos', 'Meio-campistas', 22),
    ('Fabinho', 'Meio-campistas', 23),
    ('Lucas Paqueta', 'Meio-campistas', 24),
    ('Endrick', 'Atacantes', 30),
    ('Gabriel Martinelli', 'Atacantes', 31),
    ('Igor Thiago', 'Atacantes', 32),
    ('Luiz Henrique', 'Atacantes', 33),
    ('Matheus Cunha', 'Atacantes', 34),
    ('Neymar Junior', 'Atacantes', 35),
    ('Raphinha', 'Atacantes', 36),
    ('Rayan', 'Atacantes', 37),
    ('Vinicius Junior', 'Atacantes', 38)
) as player(name, category, sort_order)
on conflict (team_id, name) do update
set
  category = excluded.category,
  sort_order = excluded.sort_order,
  is_active = true;

insert into public.matches (
  slug,
  home_team_id,
  away_team_id,
  competition_name,
  competition_stage,
  venue_name,
  venue_city,
  match_at,
  status,
  featured_rank
)
select
  fixture.slug,
  home_team.id,
  away_team.id,
  fixture.competition_name,
  fixture.competition_stage,
  fixture.venue_name,
  fixture.venue_city,
  fixture.match_at,
  fixture.status,
  fixture.featured_rank
from (
  values
    ('brazil-vs-morocco-2026-06-13', 'brazil', 'morocco', 'FIFA World Cup 2026', 'Grupo C', 'New York New Jersey Stadium', 'East Rutherford, Estados Unidos', '2026-06-13T22:00:00Z'::timestamptz, 'scheduled', 1),
    ('brazil-vs-haiti-2026-06-19', 'brazil', 'haiti', 'FIFA World Cup 2026', 'Grupo C', 'Philadelphia Stadium', 'Philadelphia, Estados Unidos', '2026-06-20T00:30:00Z'::timestamptz, 'scheduled', 2),
    ('scotland-vs-brazil-2026-06-24', 'scotland', 'brazil', 'FIFA World Cup 2026', 'Grupo C', 'Miami Stadium', 'Miami Gardens, Estados Unidos', '2026-06-24T22:00:00Z'::timestamptz, 'scheduled', 3)
) as fixture(
  slug,
  home_slug,
  away_slug,
  competition_name,
  competition_stage,
  venue_name,
  venue_city,
  match_at,
  status,
  featured_rank
)
join public.national_teams home_team on home_team.slug = fixture.home_slug
join public.national_teams away_team on away_team.slug = fixture.away_slug
on conflict (slug) do update
set
  home_team_id = excluded.home_team_id,
  away_team_id = excluded.away_team_id,
  competition_name = excluded.competition_name,
  competition_stage = excluded.competition_stage,
  venue_name = excluded.venue_name,
  venue_city = excluded.venue_city,
  match_at = excluded.match_at,
  status = excluded.status,
  featured_rank = excluded.featured_rank;

update public.lineups
set team_id = national_teams.id
from public.national_teams
where national_teams.slug = 'brazil'
  and public.lineups.team_id is null;

alter table public.lineups
  alter column team_id set not null;

create index if not exists idx_team_players_team_id on public.team_players(team_id);
create index if not exists idx_team_players_category on public.team_players(team_id, category);
create index if not exists idx_matches_home_team_id on public.matches(home_team_id);
create index if not exists idx_matches_away_team_id on public.matches(away_team_id);
create index if not exists idx_matches_match_at on public.matches(match_at);
create index if not exists idx_lineups_user_id on public.lineups(user_id);
create index if not exists idx_lineups_team_id on public.lineups(team_id);
create index if not exists idx_lineups_match_id on public.lineups(match_id);
create index if not exists idx_lineups_formation on public.lineups(formation);
create unique index if not exists idx_lineups_unique_user_team_match on public.lineups(user_id, team_id, match_id);
create index if not exists idx_lineup_players_lineup_id on public.lineup_players(lineup_id);
create index if not exists idx_lineup_players_position_player on public.lineup_players(position, player_name);

alter table public.national_teams enable row level security;
alter table public.team_players enable row level security;
alter table public.matches enable row level security;
alter table public.profiles enable row level security;
alter table public.lineups enable row level security;
alter table public.lineup_players enable row level security;

drop policy if exists "Public can read teams" on public.national_teams;
drop policy if exists "Public can read team players" on public.team_players;
drop policy if exists "Public can read matches" on public.matches;
drop policy if exists "Profiles are visible to the owner" on public.profiles;
drop policy if exists "Users can insert their own profile" on public.profiles;
drop policy if exists "Users can update their own profile" on public.profiles;
drop policy if exists "Authenticated users can read lineups" on public.lineups;
drop policy if exists "Users can create their own lineups" on public.lineups;
drop policy if exists "Users can update their own lineups" on public.lineups;
drop policy if exists "Users can delete their own lineups" on public.lineups;
drop policy if exists "Authenticated users can read lineup players" on public.lineup_players;
drop policy if exists "Users can create players for their own lineups" on public.lineup_players;
drop policy if exists "Users can update players for their own lineups" on public.lineup_players;
drop policy if exists "Users can delete players from their own lineups" on public.lineup_players;

create policy "Public can read teams"
on public.national_teams for select
to anon, authenticated
using (true);

create policy "Public can read team players"
on public.team_players for select
to anon, authenticated
using (true);

create policy "Public can read matches"
on public.matches for select
to anon, authenticated
using (true);

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

grant select on public.national_teams to anon, authenticated;
grant select on public.team_players to anon, authenticated;
grant select on public.matches to anon, authenticated;

drop view if exists public.ranking_formations;

create view public.ranking_formations
with (security_invoker = true)
as
select
  l.team_id,
  l.match_id,
  l.formation,
  count(*)::int as votes
from public.lineups l
where l.match_id is not null
group by l.team_id, l.match_id, l.formation
order by l.team_id, l.match_id, votes desc, l.formation asc;

drop view if exists public.ranking_players_by_position;

create view public.ranking_players_by_position
with (security_invoker = true)
as
select
  l.team_id,
  l.match_id,
  lp.position,
  lp.player_name,
  count(*)::int as votes
from public.lineup_players lp
join public.lineups l on l.id = lp.lineup_id
where l.match_id is not null
group by l.team_id, l.match_id, lp.position, lp.player_name
order by l.team_id, l.match_id, lp.position asc, votes desc, lp.player_name asc;

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
