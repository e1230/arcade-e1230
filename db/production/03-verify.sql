-- Arcade E1230 — verificación del esquema de producción
--
-- Solo lectura: no cambia nada. Devuelve una fila por chequeo; todas deben dar ok = true.
-- Corre después de 01-schema.sql y 02-seed-games.sql.
-- En desarrollo, los chequeos «datos: …» de perfiles y puntuaciones dan false
-- (allá hay cuentas de prueba); el resto debe dar true en los dos proyectos.

with checks (area, item, ok) as (
  -- RLS activo en las tres tablas
  select 'rls', t, coalesce((select c.relrowsecurity from pg_class c where c.oid = to_regclass('public.' || t)), false)
  from unnest(array['games', 'profiles', 'scores']) as t

  union all
  select 'vista', 'leaderboard con security_invoker',
    coalesce((select c.reloptions @> array['security_invoker=true'] from pg_class c where c.oid = to_regclass('public.leaderboard')), false)

  -- Políticas: exactamente estas cinco
  union all
  select 'políticas', 'hay 5 en public',
    (select count(*) = 5 from pg_policies where schemaname = 'public')
  union all
  select 'políticas', p.tbl || ': ' || p.name,
    exists (select 1 from pg_policies where schemaname = 'public' and tablename = p.tbl and policyname = p.name and cmd = p.cmd)
  from (values
    ('games', 'games are readable by everyone', 'SELECT'),
    ('profiles', 'profiles are readable by everyone', 'SELECT'),
    ('profiles', 'users create their own profile', 'INSERT'),
    ('scores', 'scores are readable by everyone', 'SELECT'),
    ('scores', 'players submit their own scores', 'INSERT')
  ) as p (tbl, name, cmd)

  -- Funciones security definer sin EXECUTE para anon ni authenticated
  union all
  select 'funciones', f || ' es security definer',
    coalesce((select p.prosecdef from pg_proc p where p.oid = to_regproc('public.' || f)), false)
  from unnest(array['handle_new_user', 'set_score_owner', 'rls_auto_enable']) as f
  union all
  select 'funciones', f || ' sin EXECUTE para ' || r,
    to_regproc('public.' || f) is not null
    and not has_function_privilege(r, to_regproc('public.' || f), 'EXECUTE')
  from unnest(array['handle_new_user', 'set_score_owner', 'rls_auto_enable']) as f,
       unnest(array['anon', 'authenticated']) as r

  -- Triggers
  union all
  select 'triggers', 'on_auth_user_created en auth.users',
    exists (select 1 from pg_trigger where tgname = 'on_auth_user_created' and tgrelid = 'auth.users'::regclass
            and tgfoid = to_regproc('public.handle_new_user') and tgenabled = 'O')
  union all
  select 'triggers', 'set_score_owner en public.scores',
    exists (select 1 from pg_trigger where tgname = 'set_score_owner' and tgrelid = to_regclass('public.scores')
            and tgfoid = to_regproc('public.set_score_owner') and tgenabled = 'O')
  union all
  select 'triggers', 'event trigger ensure_rls activo',
    exists (select 1 from pg_event_trigger where evtname = 'ensure_rls' and evtenabled = 'O'
            and evtfoid = to_regproc('public.rls_auto_enable'))

  -- Índices del ranking
  union all
  select 'índices', i,
    exists (select 1 from pg_indexes where schemaname = 'public' and indexname = i)
  from unnest(array['scores_game_ranking_idx', 'scores_game_user_idx', 'profiles_alias_key', 'games_sort_order_key']) as i

  -- Permisos de tabla: lectura sí, escritura a nivel de tabla no
  union all
  select 'permisos', r || ' puede leer ' || t,
    to_regclass('public.' || t) is not null and has_table_privilege(r, to_regclass('public.' || t), 'SELECT')
  from unnest(array['games', 'profiles', 'scores', 'leaderboard']) as t,
       unnest(array['anon', 'authenticated']) as r
  union all
  select 'permisos', r || ' sin ' || pr || ' en ' || t,
    to_regclass('public.' || t) is not null and not has_table_privilege(r, to_regclass('public.' || t), pr)
  from unnest(array['games', 'profiles', 'scores', 'leaderboard']) as t,
       unnest(array['anon', 'authenticated']) as r,
       unnest(array['INSERT', 'UPDATE', 'DELETE', 'TRUNCATE', 'TRIGGER', 'REFERENCES']) as pr

  -- Permisos de columna: solo los dos insert del SPEC 18, solo para authenticated
  union all
  select 'columnas', 'authenticated ' || (case when c.allowed then 'puede' else 'no puede' end) || ' insertar ' || c.tbl || '.' || c.col,
    to_regclass('public.' || c.tbl) is not null
    and has_column_privilege('authenticated', to_regclass('public.' || c.tbl), c.col, 'INSERT') = c.allowed
  from (values
    ('profiles', 'id', true),
    ('profiles', 'alias', true),
    ('profiles', 'created_at', false),
    ('scores', 'game_id', true),
    ('scores', 'score', true),
    ('scores', 'user_id', false),
    ('scores', 'name', false),
    ('scores', 'created_at', false)
  ) as c (tbl, col, allowed)
  union all
  select 'columnas', 'anon no inserta en ' || t,
    to_regclass('public.' || t) is not null
    and not has_any_column_privilege('anon', to_regclass('public.' || t), 'INSERT')
  from unnest(array['games', 'profiles', 'scores']) as t
  union all
  select 'columnas', r || ' no actualiza ninguna columna de ' || t,
    to_regclass('public.' || t) is not null
    and not has_any_column_privilege(r, to_regclass('public.' || t), 'UPDATE')
  from unnest(array['games', 'profiles', 'scores']) as t,
       unnest(array['anon', 'authenticated']) as r

  -- Datos
  union all
  select 'datos', 'games tiene los 8 juegos',
    (select count(*) = 8 and count(*) filter (where id in ('arkanoid', 'tetris', 'snake', 'pacman', 'invaders', 'asteroids', 'frogger', 'galaga')) = 8
     from public.games)
  union all
  select 'datos', 'profiles vacía (producción nueva)', not exists (select 1 from public.profiles)
  union all
  select 'datos', 'scores vacía (producción nueva)', not exists (select 1 from public.scores)
)
select area, item, ok
from checks
order by ok, area, item;
