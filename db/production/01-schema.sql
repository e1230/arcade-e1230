-- Arcade E1230 — esquema de producción
--
-- Estado final del proyecto de desarrollo (xanuntuhanyubcqiudlp) al 2026-10-20,
-- consolidado de sus 12 migraciones (create_games … harden_public_grants) más el
-- event trigger ensure_rls, que Supabase crea al crear el proyecto y no está en
-- ninguna migración.
--
-- Se ejecuta UNA sola vez, en el SQL Editor del proyecto de producción, sobre un
-- esquema public vacío. Corre en una transacción: si algo falla, no queda nada a medias.

begin;

-- Guarda: este script nunca corre sobre una base que ya tiene el esquema
do $$
begin
  if to_regclass('public.games') is not null
     or to_regclass('public.profiles') is not null
     or to_regclass('public.scores') is not null then
    raise exception 'El esquema de Arcade E1230 ya existe en este proyecto: 01-schema.sql no se vuelve a ejecutar.';
  end if;
end;
$$;

-- ---------------------------------------------------------------------------
-- games: catálogo de juegos, solo lectura pública (SPEC 06)
-- ---------------------------------------------------------------------------

create table public.games (
  id text primary key check (id ~ '^[a-z0-9-]+$'),
  title text not null check (char_length(title) between 1 and 40),
  category text not null check (category in ('Clásicos', 'Disparos', 'Puzles', 'Laberinto')),
  accent text not null check (accent in ('cyan', 'pink', 'yellow')),
  short_description text not null,
  long_description text not null,
  sort_order smallint not null unique,
  created_at timestamptz not null default now()
);

alter table public.games enable row level security;

create policy "games are readable by everyone"
  on public.games for select
  to anon, authenticated
  using (true);

-- ---------------------------------------------------------------------------
-- profiles: alias público de cada cuenta (SPEC 18)
-- ---------------------------------------------------------------------------

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  alias text not null unique check (alias ~ '^[A-Z0-9_]{3,14}$'),
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "profiles are readable by everyone"
  on public.profiles for select
  to anon, authenticated
  using (true);

create policy "users create their own profile"
  on public.profiles for insert
  to authenticated
  with check (id = (select auth.uid()));

-- ---------------------------------------------------------------------------
-- scores: una fila por puntuación guardada (SPEC 06 + SPEC 18)
-- ---------------------------------------------------------------------------

-- Mismo orden de columnas que dev, donde user_id se agregó al final
create table public.scores (
  id bigint generated always as identity primary key,
  game_id text not null references public.games (id) on delete cascade,
  name text not null check (name = btrim(name) and char_length(name) between 1 and 20),
  score integer not null check (score between 0 and 9999999),
  created_at timestamptz not null default now(),
  user_id uuid not null references public.profiles (id) on delete cascade
);

create index scores_game_ranking_idx
  on public.scores (game_id, score desc, created_at asc);

create index scores_game_user_idx
  on public.scores (game_id, user_id);

alter table public.scores enable row level security;

create policy "scores are readable by everyone"
  on public.scores for select
  to anon, authenticated
  using (true);

create policy "players submit their own scores"
  on public.scores for insert
  to authenticated
  with check (
    user_id = (select auth.uid())
    and score between 0 and 9999999
  );

-- ---------------------------------------------------------------------------
-- leaderboard: top 10 por juego, desempate por la entrada más antigua
-- ---------------------------------------------------------------------------

create view public.leaderboard
with (security_invoker = true) as
select game_id, name, score, created_at, rank
from (
  select
    game_id,
    name,
    score,
    created_at,
    row_number() over (
      partition by game_id
      order by score desc, created_at asc, id asc
    )::int as rank
  from public.scores
) ranked
where rank <= 10;

-- ---------------------------------------------------------------------------
-- Triggers
-- ---------------------------------------------------------------------------

-- Crea el perfil si el registro trae un alias válido y libre en raw_user_meta_data.
-- Si no lo trae (OAuth) o ya está tomado, no falla: la cuenta queda sin perfil y va a /onboarding.
create function public.handle_new_user() returns trigger
  language plpgsql
  security definer
  set search_path = ''
as $$
declare
  requested_alias text := upper(btrim(coalesce(new.raw_user_meta_data ->> 'alias', '')));
begin
  -- Los metadatos los puede mandar cualquiera con la clave publicable: se validan aquí
  if requested_alias ~ '^[A-Z0-9_]{3,14}$' then
    insert into public.profiles (id, alias)
    values (new.id, requested_alias)
    on conflict do nothing;
  end if;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

revoke execute on function public.handle_new_user() from public, anon, authenticated;

-- La base pone el dueño y el alias: el navegador solo manda game_id y score
create function public.set_score_owner() returns trigger
  language plpgsql
  security definer
  set search_path = ''
as $$
declare
  owner_alias text;
begin
  select alias into owner_alias
  from public.profiles
  where id = (select auth.uid());

  if owner_alias is null then
    raise exception 'a profile with an alias is required to submit a score'
      using errcode = '42501';
  end if;

  new.user_id := (select auth.uid());
  new.name := owner_alias;
  return new;
end;
$$;

create trigger set_score_owner
  before insert on public.scores
  for each row execute function public.set_score_owner();

revoke execute on function public.set_score_owner() from public, anon, authenticated;

-- ---------------------------------------------------------------------------
-- ensure_rls: activa RLS en toda tabla nueva de public
-- ---------------------------------------------------------------------------

-- Copia de la función que Supabase crea con la opción de RLS automático.
-- create or replace: si el proyecto ya la trae, queda igual que en dev.
create or replace function public.rls_auto_enable() returns event_trigger
  language plpgsql
  security definer
  set search_path = 'pg_catalog'
as $$
DECLARE
  cmd record;
BEGIN
  FOR cmd IN
    SELECT *
    FROM pg_event_trigger_ddl_commands()
    WHERE command_tag IN ('CREATE TABLE', 'CREATE TABLE AS', 'SELECT INTO')
      AND object_type IN ('table','partitioned table')
  LOOP
     IF cmd.schema_name IS NOT NULL AND cmd.schema_name IN ('public') AND cmd.schema_name NOT IN ('pg_catalog','information_schema') AND cmd.schema_name NOT LIKE 'pg_toast%' AND cmd.schema_name NOT LIKE 'pg_temp%' THEN
      BEGIN
        EXECUTE format('alter table if exists %s enable row level security', cmd.object_identity);
        RAISE LOG 'rls_auto_enable: enabled RLS on %', cmd.object_identity;
      EXCEPTION
        WHEN OTHERS THEN
          RAISE LOG 'rls_auto_enable: failed to enable RLS on %', cmd.object_identity;
      END;
     ELSE
        RAISE LOG 'rls_auto_enable: skip % (either system schema or not in enforced list: %.)', cmd.object_identity, cmd.schema_name;
     END IF;
  END LOOP;
END;
$$;

-- El event trigger solo se crea si el proyecto no lo trae
do $$
begin
  if not exists (select 1 from pg_event_trigger where evtname = 'ensure_rls') then
    create event trigger ensure_rls
      on ddl_command_end
      when tag in ('CREATE TABLE', 'CREATE TABLE AS', 'SELECT INTO')
      execute function public.rls_auto_enable();
  end if;
end;
$$;

-- La función solo debe correr desde el event trigger ensure_rls, nunca por /rest/v1/rpc
revoke execute on function public.rls_auto_enable() from public, anon, authenticated;

-- ---------------------------------------------------------------------------
-- Permisos: mínimo privilegio (SPEC 18 + SPEC 19)
-- ---------------------------------------------------------------------------

-- Lectura explícita, por si el proyecto no expone las tablas nuevas automáticamente
grant select on public.games, public.profiles, public.scores, public.leaderboard
  to anon, authenticated;

-- La app solo lee y hace los dos insert por columna del SPEC 18
revoke insert, update, delete, truncate, trigger, references
  on public.games, public.profiles, public.scores, public.leaderboard
  from anon, authenticated;

-- El cliente solo puede escribir id y alias; created_at lo pone la base
grant insert (id, alias) on public.profiles to authenticated;

-- El navegador solo manda game_id y score; user_id y name los pone set_score_owner
grant insert (game_id, score) on public.scores to authenticated;

commit;
