-- =============================================================================
-- Arcade E1230 — Rol de solo lectura para Claude Code (solo producción)
-- =============================================================================
-- Crea `claude_readonly`, el único acceso de Claude a producción: lee el esquema
-- public por el pooler de Supabase y no puede escribir nada.
--
-- No es una migración: no se aplica en dev ni va en migrations/. Ejecútalo una
-- vez en el SQL Editor de producción, después de 01, 02 y 03.
--
-- Antes de ejecutarlo:
--   1. Genera la contraseña con `openssl rand -hex 32` (hexadecimal: no hay que
--      codificarla en la URL) y reemplaza <CONTRASEÑA>.
--   2. No guardes el snippet del SQL Editor con la contraseña real.
--
-- Por qué BYPASSRLS: las políticas de lectura de games, profiles y scores son
-- solo `to anon, authenticated`; sin BYPASSRLS el rol vería 0 filas. No le da
-- escritura: los únicos permisos de tabla que tiene son SELECT.
--
-- Conexión (pooler compartido; el usuario lleva el project ref):
--   postgresql://claude_readonly.<PROD_REF>:<CONTRASEÑA>@aws-0-<REGIÓN>.pooler.supabase.com:6543/postgres?sslmode=require
-- =============================================================================

begin;

create role claude_readonly
  with login
  password '<CONTRASEÑA>'
  nosuperuser nocreatedb nocreaterole noreplication
  bypassrls
  connection limit 3;

-- Capa extra: cada transacción arranca en solo lectura y con tiempos límite.
-- El límite real son los permisos: el rol no tiene INSERT, UPDATE, DELETE ni DDL.
alter role claude_readonly set default_transaction_read_only = on;
alter role claude_readonly set statement_timeout = '15s';
alter role claude_readonly set idle_in_transaction_session_timeout = '30s';

-- Solo el esquema public (games, profiles, scores y la vista leaderboard).
-- auth y storage quedan fuera: correos, identidades y sesiones no se leen.
grant usage on schema public to claude_readonly;
grant select on all tables in schema public to claude_readonly;

-- Las tablas que creen las migraciones futuras (como postgres) también se leen
alter default privileges for role postgres in schema public
  grant select on tables to claude_readonly;

commit;

-- -----------------------------------------------------------------------------
-- Verificación: una fila por chequeo, todas con ok = true
-- -----------------------------------------------------------------------------
with expected_tables(table_name) as (
  values ('games'), ('leaderboard'), ('profiles'), ('scores')
)
select 'rol con login, bypassrls y límite de 3 conexiones' as check_name,
       exists (
         select 1 from pg_roles
         where rolname = 'claude_readonly'
           and rolcanlogin and rolbypassrls and not rolsuper
           and not rolcreaterole and not rolcreatedb
           and rolconnlimit = 3
       ) as ok
union all
select 'transacciones en solo lectura por defecto',
       exists (
         select 1 from pg_roles
         where rolname = 'claude_readonly'
           and 'default_transaction_read_only=on' = any (rolconfig)
       )
union all
select 'select en ' || e.table_name,
       has_table_privilege('claude_readonly', 'public.' || e.table_name, 'select')
from expected_tables e
union all
select 'sin permisos de escritura en public',
       not exists (
         select 1 from information_schema.role_table_grants
         where grantee = 'claude_readonly' and privilege_type <> 'SELECT'
       )
union all
select 'sin acceso a auth',
       not has_schema_privilege('claude_readonly', 'auth', 'usage')
order by ok, check_name;

-- -----------------------------------------------------------------------------
-- Rotar la contraseña o revocar el acceso (no se ejecuta: descomenta lo que uses)
-- -----------------------------------------------------------------------------
-- alter role claude_readonly with password '<NUEVA>';
--
-- drop owned by claude_readonly;
-- drop role claude_readonly;
