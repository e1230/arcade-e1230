# Auditoría de seguridad

Memoria del agente `security-auditor` (`.claude/agents/security-auditor.md`). El agente lo lee antes de auditar y lo actualiza después. Se puede editar a mano (por ejemplo, para aceptar o descartar un hallazgo).

Última auditoría: 2026-10-20 · Modo: spec (20-auth-hardening)

Estados: `[ ]` Abierto · `[x]` Resuelto · `[!]` Riesgo aceptado · `[-]` Descartado · `[R]` Regresión
Severidades: Crítico · Alto · Medio · Bajo · Info

## Resumen

| Severidad | Abiertos | Aceptados | Resueltos |
| --------- | -------- | --------- | --------- |
| Crítico   | 0        | 0         | 0         |
| Alto      | 0        | 0         | 0         |
| Medio     | 2        | 5         | 0         |
| Bajo      | 3        | 6         | 0         |
| Info      | 1        | 0         | 0         |

Primera auditoría registrada (modo spec, sin auditoría completa previa): los controles no listados abajo como verificados están sin revisar.

## Controles

| Control                                      | Área | Estado                                  | Verificado | Evidencia                                                                                                                            |
| -------------------------------------------- | ---- | --------------------------------------- | ---------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| A1 RLS en todas las tablas                   | Base | OK                                      | 2026-10-20 | `relrowsecurity` en `games`, `profiles`, `scores`; vista `leaderboard` con `security_invoker=true`                                   |
| A2 Políticas                                 | Base | OK                                      | 2026-10-20 | 5 políticas; escrituras solo `authenticated` con `(select auth.uid())`; sin `using/with check (true)` en escritura                   |
| A3 Permisos de tabla                         | Base | OK                                      | 2026-10-20 | `anon` y `authenticated`: solo `SELECT` en las 4 relaciones de `public`                                                              |
| A4 Permisos de columna                       | Base | OK                                      | 2026-10-20 | `authenticated` INSERT: `profiles (alias,id)`, `scores (game_id,score)`; `anon` nada                                                 |
| A5 Funciones `security definer`              | Base | OK                                      | 2026-10-20 | `handle_new_user`, `rls_auto_enable`, `set_score_owner`: `search_path` fijo, `EXECUTE` en `false` para `anon` y `authenticated`      |
| A6 Triggers                                  | Base | OK                                      | 2026-10-20 | `on_auth_user_created` (auth.users) y `set_score_owner` (scores) con `tgenabled='O'`                                                 |
| A8 Event triggers                            | Base | OK                                      | 2026-10-20 | `ensure_rls` habilitado; el resto son de Supabase (`issue_*`, `pgrst_*`)                                                             |
| Advisors de seguridad                        | Base | Solo el aviso aceptado                  | 2026-10-20 | `auth_leaked_password_protection` (S-03)                                                                                             |
| A7, A9, A10, A11, A12                        | Base | Sin revisar                             | —          | Fuera del alcance del modo spec                                                                                                      |
| Sondeos Supabase (anon)                      | Base | OK                                      | 2026-10-20 | GET games/profiles 200 (profiles solo `id`,`alias`,`created_at`); PATCH games/profiles, DELETE scores, POST scores 401 `42501`; RPC `rls_auto_enable` 401; signup de 1 carácter 422 `weak_password` (no se creó cuenta) |
| B1 Secretos en el árbol                      | App  | OK                                      | 2026-10-20 | `.env` y `.env.local` ignorados, solo `.env.example` versionado; `git grep` solo encuentra menciones de texto (docs, spec, `.env.example:19`) |
| B2 Variables de entorno                      | App  | OK (Info S-17)                          | 2026-10-20 | `NEXT_PUBLIC_SITE_URL` solo en `lib/site-url.ts`; no hay secretos en `NEXT_PUBLIC_*`; `.env.example` sin valores                     |
| B3 Clientes de Supabase                      | App  | OK                                      | 2026-10-20 | `createClient` solo desde `lib/supabase/`; sin `service_role`                                                                        |
| B4 Server Actions (`app/auth/actions.ts`)    | App  | OK                                      | 2026-10-20 | `readStrings`, `getClaims()`, códigos cerrados; no se lee `error.message` (`rg 'error.message'` sin coincidencias en el archivo)    |
| B5 Route Handler `/auth/callback`            | App  | OK                                      | 2026-10-20 | `safeNextPath`, perfil siempre revisado; sin `code` va a `/login?error=oauth` (o `error=link` con `type=recovery`)                   |
| B6 Redirecciones                             | App  | OK                                      | 2026-10-20 | Todos los `redirect`/`router.push` pasan por `safeNextPath` o son constantes; `lib/safe-next.ts` sigue rechazando `//`, `/\`, control |
| B7 Enumeración                               | App  | Aceptado (S-09)                         | 2026-10-20 | `signUp` distingue registro nuevo y repetido                                                                                         |
| B10 Headers                                  | App  | OK                                      | 2026-10-20 | `curl -sI` en `/`, `/api/health`, 404, `/games/snake/play`, asset del matcher y `/auth/callback`: los 4 headers, sin `X-Powered-By` |
| B11 Dependencias                             | App  | Abierto (S-12)                          | 2026-10-20 | `npm audit --omit=dev`: 3 high (`next`, `sharp`, `source-map-js`); `package*.json` sin cambios en la rama                            |
| B12 MCP y agentes                            | App  | Abierto (S-13, S-16)                    | 2026-10-20 | `.mcp.json` sin `read_only=true`; `.claude/settings.json` sin bloque `permissions`; `settings.local.json` ignorado                  |
| B13 CI                                       | App  | Info                                    | 2026-10-20 | No existe `.github/`                                                                                                                 |
| B14 Documentación                            | App  | OK                                      | 2026-10-20 | `CLAUDE.md` (cambio sin commit) y `.env.example` coinciden con el código del SPEC 20                                                 |
| B8, B9                                       | App  | Sin revisar                             | —          | Fuera del alcance del modo spec                                                                                                      |

### SPEC 20 — hallazgos del spec verificados en código

| Hallazgo del spec                  | Estado en el código | Evidencia                                                                                                                                                                         |
| ---------------------------------- | ------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1 Cierre de otras sesiones         | Implementado        | `app/auth/actions.ts:270-277`: `signOut({ scope: "others" })` tras `updateUser`; en `GoTrueClient._signOut` con `others` no se borra la sesión local. Sin verificar en ejecución (dos navegadores) |
| 4 `redirectTo` fijo                | Implementado        | `actions.ts:225-234`: `readSiteUrl()` o `http://localhost:3000` fuera de producción, `unavailable` en producción; `headers` ya no se importa. Sin verificar el correo real con `Origin` falso |
| 5 Cookies `Secure`                 | Implementado        | `lib/supabase/cookie-options.ts` usado en `server.ts:21`, `client.ts:16` y `proxy.ts:21`; `@supabase/ssr` 0.12.7 mezcla `cookieOptions` sobre los valores por defecto (`sameSite lax`, `httpOnly false`). Sin verificar el atributo en una respuesta real (hace falta sesión) |
| 6 `chooseAlias` sin `error.message` | Implementado        | `actions.ts:190-194`: ante `23505` consulta `hasProfile`                                                                                                                          |
| 7 Callback siempre revisa perfil   | Implementado        | `route.ts:20-31`; `type=recovery` solo elige el destino de error. Con una cuenta sin alias el destino es `/onboarding?next=%2Fauth%2Freset`, y `AliasForm` («Ahora no» y LISTO) vuelve a `/auth/reset`, que solo exige sesión: sin regresión |
| 8 Tope de 72 bytes                 | Implementado        | `lib/auth.ts` (`isPasswordTooLong`, bytes UTF-8), `signUp:129`, `updatePassword:255`, `AuthCard.tsx` (solo pestaña `register`) y `ResetPasswordForm.tsx`; ENTRAR sin tope por diseño |

Ajustes del panel confirmados por el usuario el 2026-10-20 (no verificables desde el repo): Site URL `http://localhost:3000`; Redirect URLs solo `http://localhost:3000/**`; «Secure password change» activado; JWT expiry 3600 s.

## Hallazgos

| ID   | Estado | Severidad | Área | Título                                                            | Visto      |
| ---- | ------ | --------- | ---- | ----------------------------------------------------------------- | ---------- |
| S-01 | `[!]`  | Medio     | Base | Ranking manipulable: `score` libre entre 0 y 9.999.999            | 2026-10-20 |
| S-02 | `[!]`  | Medio     | App  | Sin `Content-Security-Policy` ni `Strict-Transport-Security`      | 2026-10-20 |
| S-03 | `[!]`  | Bajo      | Base | Leaked password protection desactivada (plan Free)                | 2026-10-20 |
| S-04 | `[!]`  | Bajo      | Base | Límite de 15 sign-ups/sign-ins cada 5 min actúa como global      | 2026-10-20 |
| S-05 | `[!]`  | Medio     | Base | Sin confirmación de correo y con SMTP por defecto                 | 2026-10-20 |
| S-06 | `[!]`  | Medio     | App  | Sin CAPTCHA ni límite propio por IP en las Server Actions         | 2026-10-20 |
| S-07 | `[!]`  | Bajo      | Base | Vinculación automática de identidades Google/GitHub por correo    | 2026-10-20 |
| S-08 | `[!]`  | Bajo      | App  | Sin moderación de alias ofensivos                                 | 2026-10-20 |
| S-09 | `[!]`  | Medio     | App  | Enumeración de correos en `signUp`                                | 2026-10-20 |
| S-10 | `[!]`  | Bajo      | App  | Access tokens vigentes hasta 1 h tras cerrar sesiones             | 2026-10-20 |
| S-11 | `[!]`  | Bajo      | App  | Cierre de otras sesiones de mejor esfuerzo y sin aviso            | 2026-10-20 |
| S-12 | `[ ]`  | Medio     | App  | `npm audit`: 3 avisos high (`next` 16.3.6, `sharp`, `source-map-js`) | 2026-10-20 |
| S-13 | `[ ]`  | Medio     | App  | `.mcp.json` sin `read_only=true` y con `database`/`functions`     | 2026-10-20 |
| S-14 | `[ ]`  | Bajo      | App  | `NEXT_PUBLIC_SITE_URL` con `http://` en producción quita `Secure` | 2026-10-20 |
| S-15 | `[ ]`  | Bajo      | App  | `/auth/reset` y `updatePassword` aceptan cualquier sesión         | 2026-10-20 |
| S-16 | `[ ]`  | Bajo      | App  | `.claude/settings.json` sin bloque `permissions`                  | 2026-10-20 |
| S-17 | `[ ]`  | Info      | App  | `SUPABASE_PASSWORD` en `.env` sin uso en la app                   | 2026-10-20 |

### S-12 — `npm audit`: 3 avisos high

- **Estado:** `[ ]` · **Severidad:** Medio · **Área:** App
- **Dónde:** `node_modules/next` (16.3.6), `sharp`, `source-map-js`
- **Evidencia:** `npm audit --omit=dev` → 3 high: Next.js cache poisoning en SSG/ISR (GHSA-mcj8-r9mp-w47p), SSRF en Image Optimization (GHSA-cjq9-62q9-8jv4), `sharp` <0.35.5 y `source-map-js` DoS. Fix de `sharp` y `source-map-js` con `npm audit fix`; para `next` el audit propone `--force` (16.4.2).
- **Por qué importa:** son avisos de severidad alta en dependencias de producción. No se comprobó que la app los haga explotables (las páginas se renderizan por petición, lo que reduce el caso de SSG/ISR), por eso Medio.
- **Recomendación:** el SPEC 20 ya los deja para `npm audit fix` sin spec; `next` puede exigir subir a una versión fuera del rango declarado, conviene decidirlo aparte (`/spec actualizar next` si hace falta).
- **Historial:**
  - 2026-10-20 — Encontrado en la auditoría del SPEC 20.

### S-13 — `.mcp.json` sin `read_only`

- **Estado:** `[ ]` · **Severidad:** Medio · **Área:** App
- **Dónde:** `.mcp.json` (URL con `features=docs,account,database,debugging,development,functions,branching`, sin `read_only=true`)
- **Evidencia:** lectura del archivo; el MCP apunta al proyecto real.
- **Por qué importa:** cualquier sesión o agente con acceso al MCP puede ejecutar DDL/escrituras sobre la base de producción del proyecto. Es una decisión de flujo de trabajo (las migraciones se aplican por MCP), pero no hay una barrera de solo lectura para los agentes de auditoría.
- **Recomendación:** valorar un segundo servidor MCP con `read_only=true` para los agentes que solo leen; `conviene un spec: /spec MCP de Supabase de solo lectura para agentes`.
- **Historial:**
  - 2026-10-20 — Encontrado (revisión B12 durante el SPEC 20).

### S-14 — `NEXT_PUBLIC_SITE_URL` con `http://` en producción

- **Estado:** `[ ]` · **Severidad:** Bajo · **Área:** App
- **Dónde:** `lib/supabase/cookie-options.ts:9-13`, `lib/site-url.ts`
- **Evidencia:** con una URL `http://…` válida, `secure` es `false` aunque `NODE_ENV` sea `production`; nada avisa si el valor local (`http://localhost:3000`, que hoy está en `.env`) llega a un despliegue.
- **Por qué importa:** copiar el `.env` de desarrollo a producción dejaría las cookies de sesión sin `Secure` y el correo de recuperación apuntando a localhost, sin ningún error. El spec ya lo registra como riesgo; falta una guarda.
- **Recomendación:** a corto plazo, checklist de despliegue (valor `https://`); opcionalmente una guarda que fuerce `Secure` o avise cuando `NODE_ENV=production` y la URL sea `http://`. `conviene un spec` solo si se decide la guarda.
- **Historial:**
  - 2026-10-20 — Encontrado en la auditoría del SPEC 20 (fallo nuevo, no cubierto por los criterios de aceptación).

### S-15 — `/auth/reset` y `updatePassword` aceptan cualquier sesión

- **Estado:** `[ ]` · **Severidad:** Bajo · **Área:** App
- **Dónde:** `app/auth/reset/page.tsx:12-13`, `app/auth/actions.ts:259-268`
- **Evidencia:** la página solo exige `fetchSessionUser()` y la acción solo `getClaims()`: no se distingue una sesión abierta por el enlace de recuperación de una sesión normal, ni se pide la contraseña actual.
- **Por qué importa:** quien robe una sesión (cookies con `httpOnly=false`, sin CSP) puede cambiar la contraseña y, desde el SPEC 20, cerrar las demás sesiones del dueño. Lo atenúa «Secure password change» (confirmado activo): Supabase exige una sesión reciente o reautenticación.
- **Recomendación:** mantener «Secure password change»; la contraseña actual o una página de perfil están fuera de alcance del SPEC 20. `conviene un spec: /spec pedir contraseña actual al cambiarla` cuando se quiera cerrar.
- **Historial:**
  - 2026-10-20 — Encontrado en la auditoría del SPEC 20 (fuera de alcance del spec, mitigado por el panel).

### S-16 — `.claude/settings.json` sin `permissions`

- **Estado:** `[ ]` · **Severidad:** Bajo · **Área:** App
- **Dónde:** `.claude/settings.json`
- **Evidencia:** `grep -n permissions .claude/settings.json` sin coincidencias; no hay `deny` para `.env*` ni para comandos destructivos. `settings.local.json` sí está ignorado por git.
- **Por qué importa:** higiene de la configuración de agentes: nada impide leer `.env` desde una sesión.
- **Recomendación:** `conviene un spec: /spec permisos deny para .env y comandos destructivos en .claude/settings.json`.
- **Historial:**
  - 2026-10-20 — Encontrado (B12 durante el SPEC 20).

### S-17 — `SUPABASE_PASSWORD` sin uso

- **Estado:** `[ ]` · **Severidad:** Info · **Área:** App
- **Dónde:** `.env` (ignorado por git); `CLAUDE.md` ya dice que la app no la usa; no está en `.env.example`
- **Evidencia:** ningún `process.env.SUPABASE_PASSWORD` en el código. Además `.env` línea 14 no es apta para `source` en shell (valor sin comillas con caracteres especiales); no afecta a Next.
- **Por qué importa:** una credencial de Postgres sin uso en un archivo local es superficie innecesaria.
- **Recomendación:** quitarla del `.env` si no se usa. No requiere spec.
- **Historial:**
  - 2026-10-20 — Encontrado (B2 durante el SPEC 20).

## Riesgos aceptados

| ID   | Riesgo                                                    | Razón (spec o decisión)                                                                 | Qué lo reabriría                                                          |
| ---- | --------------------------------------------------------- | --------------------------------------------------------------------------------------- | ------------------------------------------------------------------------- |
| S-01 | Ranking manipulable (insert de `score` 0 a 9.999.999)      | Antitrampas fuera de alcance en SPEC 18 y 19                                            | Aparecen puntuaciones sospechosas o un spec de antitrampas                |
| S-02 | Sin CSP ni HSTS                                            | SPEC 19; HSTS espera al despliegue con HTTPS                                            | Despliegue a producción con HTTPS                                         |
| S-03 | Leaked password protection desactivada                     | Solo existe en el plan Pro; el proyecto está en Free (SPEC 19)                          | El proyecto pasa a Pro                                                    |
| S-04 | Límite de 15 sign-ups/sign-ins por 5 min como límite global | Supabase ve la IP del servidor de Next (SPEC 19)                                        | Despliegue a producción, bots o abuso real                                |
| S-05 | Sin confirmación de correo; SMTP por defecto               | SPEC 18                                                                                 | Despliegue a producción o abuso de registros                              |
| S-06 | Sin CAPTCHA ni límite propio por IP                        | SPEC 19                                                                                 | Bots o abuso real                                                         |
| S-07 | Vinculación automática de identidades por correo verificado | SPEC 18                                                                                 | Un proveedor deja de verificar correos o un spec nuevo lo cambia          |
| S-08 | Alias ofensivos sin moderación                             | SPEC 18                                                                                 | Aparecen alias ofensivos en el ranking                                    |
| S-09 | Enumeración de correos en `signUp`                         | SPEC 20: sin confirmación de correo la diferencia se nota igual                         | Spec de confirmación de correo y SMTP propio                              |
| S-10 | Access tokens ya emitidos valen hasta 1 h (JWT 3600 s) tras cerrar sesiones; `getClaims()` no consulta a Auth | SPEC 20 (Riesgos); JWT expiry confirmado en 3600 s el 2026-10-20 | Se acorta el JWT, se valida contra Auth por petición o hay un robo de sesión |
| S-11 | `signOut({ scope: "others" })` es de mejor esfuerzo: devuelve `{ error }` sin lanzar y el resultado se ignora | SPEC 20 (Decisiones): la contraseña ya cambió y un error confundiría al jugador | Se quiere garantía de cierre (reintentar o avisar)                        |

## Huella del esquema

2026-10-20: tablas `games`, `profiles`, `scores` (RLS activo) y vista `leaderboard` (`security_invoker`). 5 políticas (`games` 1 select, `profiles` 1 select + 1 insert, `scores` 1 select + 1 insert). Grants: `anon` y `authenticated` solo `SELECT` en las 4 relaciones; `INSERT` por columna para `authenticated` en `profiles (alias,id)` y `scores (game_id,score)`. 3 funciones `security definer` en `public` (`handle_new_user`, `rls_auto_enable`, `set_score_owner`), todas con `search_path` fijo y sin `EXECUTE` para `anon`/`authenticated`. Triggers `on_auth_user_created` y `set_score_owner` habilitados. Event triggers: `ensure_rls` más los de Supabase. La rama `spec-20-auth-hardening` no tiene migraciones: esquema idéntico al de los SPEC 18 y 19.

## Preferencias y decisiones del usuario

- 2026-10-20 — El usuario confirmó los ajustes del panel de Supabase: Site URL `http://localhost:3000`, Redirect URLs solo `http://localhost:3000/**`, «Secure password change» activado y JWT expiry 3600 s.

## Historial de auditorías

- 2026-10-20 — Modo spec (`20-auth-hardening`): se revisaron A1, A2, A3, A4, A5, A6, A8, sondeos anon, B1 a B7, B10 a B14 (de 26 controles). 0 Críticos, 0 Altos; 2 Medios y 3 Bajos abiertos, 1 Info; 11 riesgos aceptados registrados. Los 6 hallazgos del spec (1, 4, 5, 6, 7, 8) están implementados en el código; la verificación en ejecución (dos navegadores, atributo `Secure` en respuestas, correo con `Origin` falso) queda pendiente porque exige una cuenta de prueba.
