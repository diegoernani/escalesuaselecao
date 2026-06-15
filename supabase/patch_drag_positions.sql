-- Patch minimo para:
-- 1. garantir a formacao 4-2-4 na tabela public.lineups
-- 2. adicionar coordenadas customizadas para arrastar jogadores em public.lineup_players

alter table public.lineups
  drop constraint if exists lineups_formation_check;

alter table public.lineups
  add constraint lineups_formation_check
  check (formation in ('4-3-3', '4-5-1', '4-4-2', '4-2-4', '3-5-2'));

alter table public.lineup_players
  add column if not exists custom_x double precision;

alter table public.lineup_players
  add column if not exists custom_y double precision;

alter table public.lineup_players
  drop constraint if exists lineup_players_custom_coordinates_check;

alter table public.lineup_players
  add constraint lineup_players_custom_coordinates_check
  check (
    (custom_x is null or custom_x between 0 and 100)
    and (custom_y is null or custom_y between 0 and 100)
  );
