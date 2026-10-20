# Base de datos de producción

Arcade E1230 usa dos proyectos de Supabase:

| Entorno    | Proyecto               | Quién lo toca                                                         |
| ---------- | ---------------------- | --------------------------------------------------------------------- |
| Desarrollo | `xanuntuhanyubcqiudlp` | Claude Code, por el MCP de `.mcp.json` (`apply_migration`, consultas) |
| Producción | `<PROD_REF>`           | Tú escribes, desde el panel. Claude solo lee, con `claude_readonly`.  |

Esta carpeta trae todo lo necesario para dejar producción igual que desarrollo. Claude escribe los scripts leyendo dev; tú los ejecutas en producción. Para revisar producción, Claude solo tiene acceso de lectura por el pooler (Paso 7).

| Archivo                | Qué hace                                                                                                | Cuándo                                 |
| ---------------------- | ------------------------------------------------------------------------------------------------------- | -------------------------------------- |
| `01-schema.sql`        | Tablas, vista, funciones, triggers, políticas RLS y permisos. Una sola transacción.                     | Una vez, con el proyecto vacío         |
| `02-seed-games.sql`    | Las 8 filas del catálogo (`games`). Se puede volver a correr: actualiza los juegos que ya existen.      | Después de `01`                        |
| `03-verify.sql`        | Solo lectura: una fila por chequeo con `ok`. Todas deben dar `true`.                                    | Después de `02`, y cuando quieras      |
| `04-readonly-role.sql` | Crea `claude_readonly`, el rol de solo lectura de Claude, y verifica sus permisos. No es una migración. | Una vez, después de `03` (Paso 7)      |
| `migrations/`          | El SQL de cada spec que cambie la base después de hoy, para aplicarlo también en producción.            | En cada despliegue con archivos nuevos |

Los scripts reflejan dev al 2026-10-20: las 12 migraciones de `supabase_migrations` (de `create_games` a `harden_public_grants`) consolidadas en su estado final, más el event trigger `ensure_rls`, que Supabase crea al crear el proyecto y no está en ninguna migración. Producción arranca solo con el catálogo: sin usuarios, perfiles ni puntuaciones.

## Paso 0 — Aislar producción del MCP

Claude solo lee producción, con el rol del Paso 7. El MCP de Supabase puede escribir, así que nunca debe alcanzar ese proyecto:

- **Pon producción en otra organización de Supabase.** La autorización OAuth del MCP es por organización: si dev y prod comparten organización, el token del MCP también alcanza a prod, aunque `.mcp.json` fije el `project_ref` de dev. Crea una organización nueva y mueve ahí el proyecto (Project Settings → General → Transfer project). El plan Free permite dos proyectos gratis por cuenta, así que caben los dos.
- Si el MCP ya se autorizó con acceso a esa organización, revoca la autorización (Account → Access Tokens / aplicaciones OAuth autorizadas) y vuelve a autorizarlo eligiendo solo la organización de dev.
- **Nunca** pongas el `project_ref` de producción en `.mcp.json`, ni las claves de producción o la contraseña de Postgres en `.env` o en un archivo del repo.
- Si guardas las variables de producción en un archivo local (por ejemplo `.env.production.local`), bloquea su lectura en `.claude/settings.json`:

  ```json
  {
    "permissions": {
      "deny": ["Read(./.env.production*)"]
    }
  }
  ```

## Paso 1 — Ajustes del proyecto

En el panel del proyecto de producción:

1. **Data API activa** (Project Settings → Data API), con el esquema `public` expuesto. Sin esto, la app no puede leer el catálogo.
2. Postgres 17, como dev (es la versión por defecto de los proyectos nuevos).
3. No importa si al crear el proyecto activaste el RLS automático: `01-schema.sql` crea `ensure_rls` si falta y lo deja igual si ya existe.

## Paso 2 — SQL

En SQL Editor → New query, pega y ejecuta **cada archivo completo**, en orden:

1. `01-schema.sql`. Si el proyecto ya tiene las tablas, se detiene con «El esquema de Arcade E1230 ya existe…» y no cambia nada.
2. `02-seed-games.sql`.
3. `03-verify.sql`. Los chequeos que fallan salen primero: si la primera fila dice `ok = true`, todo está bien (son 102).

Después, en Advisors → Security Advisor solo debe quedar el aviso `auth_leaked_password_protection` (riesgo aceptado: requiere el plan Pro).

## Paso 3 — Authentication

El MCP no puede leer la configuración de Auth de dev, así que abre los dos paneles lado a lado y compáralos pestaña por pestaña. Estos son los valores de dev, según los SPEC 18, 19 y 20:

**Sign In / Providers → Email**

- Email: activado.
- **Confirm email: desactivado** (el registro entra con sesión).
- **Minimum password length: 8.**
- **Secure password change: activado.**
- Leaked password protection: desactivada (solo existe en Pro).

**Google y GitHub**

- Crea **apps OAuth nuevas para producción** en Google Cloud Console y en GitHub (Settings → Developer settings → OAuth Apps), separadas de las de dev.
- URL de callback en las dos: `https://<PROD_REF>.supabase.co/auth/v1/callback`.
- En Google, el origen autorizado de JavaScript es `https://<TU_DOMINIO>`.
- El Client ID y el Secret se cargan solo en el panel de Supabase, nunca en `.env`.
- La vinculación automática de identidades con el mismo correo verificado viene activa por defecto; no hay que tocarla.

**URL Configuration**

- Site URL: `https://<TU_DOMINIO>`.
- Redirect URLs: `https://<TU_DOMINIO>/**`. Sin `localhost`: producción no debe aceptar redirecciones a tu máquina.

**Rate Limits**

- Sign-ups and sign-ins: **15 cada 5 minutos** (SPEC 19).

**Emails**

- Plantilla y SMTP por defecto, como en dev: el correo de recuperación llega en inglés y el SMTP por defecto envía pocos correos por hora. Para un lanzamiento real conviene un SMTP propio (spec aparte).

## Paso 4 — Variables de entorno del hosting

Se cargan en el panel del hosting, **nunca** en el repo:

| Variable                               | Valor en producción                                               |
| -------------------------------------- | ----------------------------------------------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`             | `https://<PROD_REF>.supabase.co`                                  |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | La `sb_publishable_…` de producción (Project Settings → API Keys) |
| `NEXT_PUBLIC_SITE_URL`                 | `https://<TU_DOMINIO>`, sin barra final                           |
| `RESEND_API_KEY`                       | La misma de dev, o una clave nueva solo para producción           |
| `CONTACT_TO_EMAIL`                     | El correo que recibe los mensajes de contacto                     |
| `CONTACT_FROM_EMAIL`                   | Opcional; con dominio propio verificado en Resend                 |

Las `NEXT_PUBLIC_*` se incrustan durante `next build`: si cambias alguna, vuelve a construir. El `.env` local sigue con las claves de dev.

## Paso 5 — Cuando tengas dominio

Reemplaza `<TU_DOMINIO>` en: Site URL, Redirect URLs, el origen autorizado de la app OAuth de Google y `NEXT_PUBLIC_SITE_URL` (con un build nuevo).

## Paso 6 — Prueba de humo

Con la app desplegada (o un build local que apunte a producción):

1. `GET /api/health` responde `200 {"status":"ok","supabase":"ok"}`.
2. La Biblioteca (`/games`) muestra los 8 juegos.
3. CREAR CUENTA con alias, correo y contraseña entra con sesión.
4. Juega Snake y GUARDAR PUNTUACIÓN: la puntuación aparece en el Detalle y en el Salón de la Fama con tu alias.
5. Entra con Google y con GitHub: la primera vez pide ELIGE TU ALIAS.
6. «¿Olvidaste tu contraseña?» manda un correo cuyo enlace abre `https://<TU_DOMINIO>/auth/reset`.

## Paso 7 — Acceso de solo lectura para Claude

Claude puede consultar producción, pero solo leer. Lo hace con el rol `claude_readonly` y por el pooler de Supabase.

1. Genera una contraseña con `openssl rand -hex 32`.
2. En el SQL Editor, pega `04-readonly-role.sql` con la contraseña en lugar de `<CONTRASEÑA>` y ejecútalo completo. Las filas de verificación del final deben dar `ok = true`. No guardes el snippet con la contraseña.
3. Crea `~/.config/arcade-e1230/prod-readonly.env`, fuera del repo, con permisos `600` (`chmod 600`):

   ```sh
   PROD_READONLY_DATABASE_URL='postgresql://claude_readonly.<PROD_REF>:<CONTRASEÑA>@aws-0-<REGIÓN>.pooler.supabase.com:6543/postgres?sslmode=require'
   ```

   El host y la región salen de Connect → Transaction pooler, pero **cambia el usuario**: el panel siempre muestra `postgres.<PROD_REF>` (el rol administrador) y aquí va `claude_readonly.<PROD_REF>`, el rol que creó `04`, con su propia contraseña. Con `postgres.` y la contraseña de `claude_readonly` falla con `password authentication failed for user "postgres"`. Sin el project ref, el pooler responde «Tenant or user not found».

4. Prueba la conexión:
   - `psql "$PROD_READONLY_DATABASE_URL" -c "select count(*) from public.games"` debe devolver el número de juegos.
   - `psql "$PROD_READONLY_DATABASE_URL" -c "delete from public.scores where false"` debe fallar con `cannot execute DELETE in a read-only transaction`.

El rol lee `games`, `profiles`, `scores`, `leaderboard` y las tablas que crees después en `public`. No ve `auth` ni `storage`. Ignora la RLS (las políticas de lectura son solo de `anon` y `authenticated`), pero no tiene ningún permiso de escritura. Para rotar la contraseña o revocar el acceso, usa las sentencias comentadas al final de `04-readonly-role.sql` y actualiza el archivo `.env`.

## Mantener producción al día

Desde el 2026-10-20, **todo** cambio en la base de dev es una migración: esquema, datos (un juego nuevo con su fila en `games`, un texto corregido), políticas, permisos y funciones. Se aplica en dev con `apply_migration`, nunca con `execute_sql` (que queda para lecturas), **y** Claude guarda el mismo SQL en `migrations/<version>_<name>.sql`, con el `version` y el `name` de la migración de dev (por ejemplo `migrations/20261101120000_seed_pacman.sql`). Así `migrations/` tiene exactamente las migraciones de dev posteriores a `01-schema.sql`, en el mismo orden.

Dos hooks de `.claude/settings.json` lo hacen cumplir: `guard-execute-sql.sh` rechaza el SQL de escritura en `execute_sql`, y `remind-production-migration.sh` recuerda guardar la copia después de cada `apply_migration`.

Al desplegar, ejecuta en el SQL Editor de producción, en orden, los archivos de `migrations/` que todavía no hayas corrido, y después `03-verify.sql` si el spec también lo actualizó. Anota en el mensaje del despliegue hasta qué archivo llegaste. Un archivo cuya primera línea dice `-- Solo desarrollo: no aplicar en producción.` (por ejemplo, borrar puntuaciones de prueba) se salta: está ahí solo para que la lista coincida con la de dev.

`02-seed-games.sql` refleja el catálogo de hoy; los juegos nuevos entran por `migrations/`, no editando ese archivo.
