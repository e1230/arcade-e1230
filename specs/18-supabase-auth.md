# SPEC 18 — Autenticación real con Supabase Auth

> **Estado:** Implementado
> **Depende de:** SPEC 01, SPEC 04, SPEC 06
> **Fecha:** 2026-10-19
> **Objetivo:** Reemplazar la sesión simulada de `localStorage` por cuentas reales de Supabase Auth (correo y contraseña, Google y GitHub) con un alias único por jugador, y ligar cada puntuación del ranking a su cuenta.

## Por qué existe este spec

Hoy `/login` no autentica a nadie. `AuthCard` guarda en `e1230_user` (`localStorage`) el nombre que se escriba, y los botones de Google y GitHub ponen nombres fijos (`JUGADOR_G`, `JUGADOR_GH`). Ese nombre es el que viaja a `scores`.

El SPEC 06 abrió `scores` a inserts anónimos con nombre libre y aceptó que se pudiera hacer trampa «hasta el spec de autenticación real». Este es ese spec. El SPEC 04 ya dejó listo todo lo necesario para la sesión: clientes de navegador y servidor con cookies, y un `proxy.ts` que refresca la sesión. Lo que falta es que alguien inicie sesión.

Con este spec cada jugador tiene una cuenta y un alias único que no puede falsear. Solo las cuentas guardan puntuaciones, y la base pone el alias y el dueño de cada fila: el navegador ya no los envía. El invitado sigue pudiendo jugar, pero no entra al ranking.

## Alcance

**Incluye:**

- **Registro e inicio de sesión con correo y contraseña** contra Supabase Auth, sin confirmación de correo. La contraseña tiene un mínimo de 8 caracteres.
- **Inicio de sesión con Google y GitHub** (OAuth con PKCE), con la ruta de vuelta `/auth/callback`.
- **Tabla `profiles`** con un alias único por cuenta (3 a 14 caracteres, `A-Z`, `0-9` y `_`, guardado en mayúsculas), que no se puede cambiar.
- **Alias al registrarse:** el formulario CREAR CUENTA lo pide, y un trigger crea el perfil con él.
- **Pantalla «ELIGE TU ALIAS»** (`/onboarding`) para las cuentas sin alias (OAuth, o un registro cuyo alias se tomó en el último segundo). `/auth/callback` lleva ahí tras el primer login con Google o GitHub. El jugador puede saltarla y navegar, pero no guarda puntuaciones hasta elegirlo.
- **Recuperación de contraseña:** enlace «¿Olvidaste tu contraseña?», página `/auth/forgot`, correo de Supabase con el SMTP y la plantilla por defecto, `/auth/callback` canjea el código del enlace y página `/auth/reset` para elegir la nueva.
- **Cerrar sesión** desde la Navbar y el menú móvil, sin salir de la página actual.
- **Sesión en el servidor:** el layout raíz lee el usuario y su perfil, y un `SessionProvider` cliente los reparte a la Navbar, el Reproductor y los rankings, sin parpadeo de «INICIAR SESIÓN».
- **Redirección con `?next=`:** los enlaces a `/login` desde el Salón de la Fama y el modal de fin de partida llevan la ruta de vuelta. Solo se aceptan rutas internas, y sin `next` se vuelve al Home. Con sesión, `/login` redirige directamente.
- **Invitado = sin sesión:** JUGAR COMO INVITADO lleva a `next` o a `/games`. El invitado juega, y al terminar el modal le ofrece iniciar sesión en lugar de guardar.
- **Puntuaciones ligadas a la cuenta:** `scores.user_id` obligatorio y referido a `profiles`. Un trigger pone `user_id` y `name` (el alias) en cada insert, y solo el rol `authenticated` puede insertar. Se borran las 9 puntuaciones anónimas actuales.
- **«TU MEJOR MARCA»** del Salón de la Fama se busca por `user_id`.
- **Configuración del proyecto de Supabase** (panel de Supabase, Google Cloud y GitHub), documentada como paso manual.
- **Limpieza:** se eliminan `SessionUser.guest`, `signIn`, los nombres fijos de Google y GitHub y `STORAGE_KEYS.user`. `e1230_user` se abandona sin migrar.
- **Documentación:** `CLAUDE.md` (proyecto, rutas, estructura, persistencia, servidor y esquema) y el comentario de `lib/supabase/proxy.ts`.

**Fuera de alcance (para futuros specs):**

- Confirmación de correo al registrarse.
- SMTP propio (Resend con dominio verificado) para los correos de Auth.
- Página de perfil: cambiar el alias, el correo o la contraseña con sesión, avatar, borrar la cuenta.
- Vincular o desvincular proveedores a mano desde la app.
- Magic link, OTP por SMS, passkeys u otros proveedores OAuth.
- Usuarios anónimos de Supabase (`signInAnonymously`).
- Guardar la puntuación de una partida jugada como invitado después de iniciar sesión.
- Proteger rutas en el proxy o bloquear la navegación hasta elegir alias.
- Validación antitrampas: topes por juego, firma de partidas, límite de envíos o captcha.
- Moderación de alias ofensivos.
- Dominio de producción en las Redirect URLs (se agrega cuando haya despliegue).
- Tests automatizados.
- Modificar los specs 01 a 17.

## Rutas y archivos

```
app/
  layout.tsx                        (cambia) async: lee la sesión y envuelve todo en SessionProvider
  login/page.tsx                    (cambia) redirige si hay sesión; pasa next y error a AuthCard
  onboarding/page.tsx               (nuevo) «ELIGE TU ALIAS»; sin sesión → /login, con alias → next
  auth/actions.ts                   (nuevo) Server Actions de autenticación
  auth/callback/route.ts            (nuevo) GET: canjea el código OAuth o de recuperación por la sesión
  auth/forgot/page.tsx              (nuevo) pide el correo para recuperar la contraseña
  auth/reset/page.tsx               (nuevo) nueva contraseña; sin sesión → /login?error=link
lib/
  auth.ts                           (nuevo) validación y mensajes compartidos (sin JSX ni clientes)
  safe-next.ts                      (nuevo) safeNextPath
  session.ts                        (cambia) SessionUser nuevo, SessionContext, useSession, getPlayerName
  session-server.ts                 (nuevo, solo servidor) fetchSessionUser
  storage.ts                        (cambia) − STORAGE_KEYS.user
  leaderboard-client.ts             (cambia) insertScore sin name; fetchPersonalBest por userId
  supabase/database.types.ts        (cambia) regenerado con profiles y scores.user_id
  supabase/proxy.ts                 (cambia) solo el comentario sobre las guardas de rutas
components/
  auth/SessionProvider.tsx          (nuevo) contexto cliente con el usuario inicial del servidor
  auth/AuthPanel.tsx                (nuevo) marco de tarjeta neón compartido, extraído de AuthCard
  auth/AuthCard.tsx                 (cambia) login y registro reales, Google, GitHub, invitado, olvido
  auth/AuthField.tsx                (cambia) + name, autoComplete, disabled, maxLength
  auth/AliasForm.tsx                (nuevo) formulario de /onboarding
  auth/ForgotPasswordForm.tsx       (nuevo) formulario de /auth/forgot
  auth/ResetPasswordForm.tsx        (nuevo) formulario de /auth/reset
  layout/Navbar.tsx                 (cambia) alias, «ELIGE TU ALIAS», cerrar sesión con signOut
  layout/MobileMenu.tsx             (cambia) lo mismo que la Navbar
  game/PlayerView.tsx               (cambia) guarda sin nombre; decide la acción del modal
  game/GameOverModal.tsx            (cambia) saveMode en lugar de isGuest
  game/PlayingAs.tsx                (cambia) texto de invitado y de cuenta sin alias
  game/DetailLeaderboard.tsx        (cambia) isMine con el alias
  hall-of-fame/HallOfFameView.tsx   (cambia) enlace con ?next=/hall-of-fame
  hall-of-fame/HallOfFameTable.tsx  (cambia) isMine con el alias; mejor marca por userId
CLAUDE.md                           (cambia)
```

Base de datos (proyecto `xanuntuhanyubcqiudlp`, aplicada con `apply_migration` del MCP de Supabase): migraciones `create_profiles` y `link_scores_to_profiles`.

Convenciones:

- `lib/session-server.ts` importa `@/lib/supabase/server`, así que solo lo usan Server Components, Server Actions y Route Handlers.
- `lib/auth.ts` y `lib/safe-next.ts` no importan clientes de Supabase, para que los usen el servidor y el navegador (como `lib/contact.ts`).
- `fetchSessionUser` se envuelve con `cache()` de React: el layout y las páginas que lo llamen hacen una sola lectura por petición.
- Las Server Actions tratan su entrada como no confiable y la validan otra vez, como `sendContactMessage`.
- `proxy.ts` sigue sin redirigir. Las redirecciones por sesión viven en las páginas (`/login`, `/onboarding`, `/auth/reset`).
- No hay variables de entorno nuevas: las credenciales de Google y GitHub viven en el panel de Supabase.
- Se mantienen las convenciones del SPEC 01: código en inglés, comentarios en español latinoamericano y módulos sin JSX en kebab-case.

## Configuración del proyecto de Supabase (manual)

El MCP de Supabase no configura Auth, así que el paso 1 del plan lo hace el usuario en los paneles:

| Dónde                                                   | Qué                                                                                                                   |
| ------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| Supabase → Authentication → Sign In / Providers → Email | Email activado. **Confirm email desactivado.** Longitud mínima de contraseña: **8**.                                  |
| Supabase → Authentication → URL Configuration           | Site URL: `http://localhost:3000`. Redirect URLs: `http://localhost:3000/**`.                                         |
| Google Cloud → APIs & Services → Credentials            | Cliente OAuth «Aplicación web» con la URI de redirección `https://xanuntuhanyubcqiudlp.supabase.co/auth/v1/callback`. |
| GitHub → Settings → Developer settings → OAuth Apps     | App con Authorization callback URL `https://xanuntuhanyubcqiudlp.supabase.co/auth/v1/callback`.                       |
| Supabase → Authentication → Sign In / Providers         | Google y GitHub activados, con el Client ID y el Client Secret de cada app.                                           |

Cuando haya un dominio de producción, se agrega a Redirect URLs y Site URL pasa a ser ese dominio.

La plantilla «Reset Password» queda por defecto, en inglés: con el SMTP de Supabase el panel no deja editarla («Set up custom SMTP to edit templates»). Su enlace `{{ .ConfirmationURL }}` termina en el `redirectTo` de `requestPasswordReset` con un `code` de PKCE.

## Modelo de datos

### Tabla `profiles` — migración `create_profiles`

```sql
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

revoke insert on public.profiles from anon, authenticated;
grant insert (id, alias) on public.profiles to authenticated;
```

- El `CHECK` exige mayúsculas, así que `unique` ya compara sin distinguir mayúsculas.
- Sin políticas de `update` ni `delete`: el alias es inmutable en este spec.
- La lectura es pública porque los alias ya se ven en el ranking. Sirve para comprobar si un alias está libre antes de registrarse.

Trigger de registro, en la misma migración:

```sql
-- Crea el perfil si el registro trae un alias válido y libre en raw_user_meta_data.
-- Si no lo trae (OAuth) o ya está tomado, no falla: la cuenta queda sin perfil y va a /onboarding.
create function public.handle_new_user() returns trigger
  language plpgsql security definer set search_path = ''
as $$ … insert into public.profiles (id, alias) … on conflict do nothing … $$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

revoke execute on function public.handle_new_user() from public, anon, authenticated;
```

El trigger valida la regex antes de insertar: los metadatos los puede mandar cualquiera con la clave publicable.

### Puntuaciones ligadas — migración `link_scores_to_profiles`

```sql
delete from public.scores; -- las 9 filas anónimas de prueba

alter table public.scores
  add column user_id uuid not null references public.profiles (id) on delete cascade;

drop index public.scores_game_name_idx;
create index scores_game_user_idx on public.scores (game_id, user_id);

-- La base pone el dueño y el alias: el navegador solo manda game_id y score
create function public.set_score_owner() returns trigger
  language plpgsql security definer set search_path = ''
as $$ … new.user_id := auth.uid(); new.name := (alias de profiles); si no hay perfil, raise … $$;

create trigger set_score_owner
  before insert on public.scores
  for each row execute function public.set_score_owner();

revoke execute on function public.set_score_owner() from public, anon, authenticated;

drop policy "anyone can submit a score" on public.scores;

create policy "players submit their own scores"
  on public.scores for insert
  to authenticated
  with check (
    user_id = (select auth.uid())
    and score between 0 and 9999999
  );

revoke insert on public.scores from anon, authenticated;
grant insert (game_id, score) on public.scores to authenticated;
```

- `scores.name` se conserva: es la copia del alias que lee la vista `leaderboard`, que no cambia. Como el alias es inmutable, la copia nunca se desactualiza.
- El `CHECK` de `name` del SPEC 06 (1 a 20 caracteres) sigue valiendo para alias de 3 a 14.
- Un `user_id` o un `name` enviados por el cliente fallan por el `GRANT`, y el trigger los pisa de todos modos.

### Sesión — `lib/session.ts` y `lib/session-server.ts`

```ts
// lib/session.ts (cliente)
export interface SessionUser {
  id: string;
  email: string | null;
  alias: string | null; // null = la cuenta todavía no eligió alias
}

export const SessionContext: React.Context<SessionUser | null>;

export function useSession(): {
  user: SessionUser | null;
  signOut(): Promise<void>;
};

export function getPlayerName(user: SessionUser | null): string; // alias, o "INVITADO"

// lib/session-server.ts (servidor)
export const fetchSessionUser: () => Promise<SessionUser | null>; // cache()
```

Reglas:

- `fetchSessionUser` usa `auth.getClaims()` y lee el perfil por `id`. Si faltan las variables de Supabase o algo falla, devuelve `null`: la app se ve como sin sesión y nunca lanza.
- `SessionProvider` recibe `initialUser` del layout y lo pone en `SessionContext`. Escucha `onAuthStateChange` y, ante `SIGNED_IN` o `SIGNED_OUT` (por ejemplo, desde otra pestaña), llama a `router.refresh()` para que el layout vuelva a leer la sesión.
- `signOut()` llama a la Server Action `signOut` y luego a `router.refresh()`. El usuario se queda en la página.
- Una cuenta sin alias muestra `"?"` en el avatar de la Navbar.

### Validación compartida — `lib/auth.ts`

```ts
export const ALIAS_PATTERN = /^[A-Z0-9_]{3,14}$/;
export const PASSWORD_MIN_LENGTH = 8;

export function normalizeAlias(input: string): string; // trim + toUpperCase

export type AuthErrorCode =
  | "invalid" // datos que no pasan la validación
  | "credentials" // correo o contraseña incorrectos
  | "email_taken" // ya existe una cuenta con ese correo
  | "alias_taken" // el alias ya está en uso
  | "weak_password" // menos de 8 caracteres
  | "rate_limit" // demasiados intentos o correos
  | "unavailable"; // faltan variables o Supabase no responde

export type AuthResult =
  { status: "success" } | { status: "error"; code: AuthErrorCode };

export const AUTH_ERROR_MESSAGES: Record<AuthErrorCode, string>;
```

| Código          | Mensaje                                                      |
| --------------- | ------------------------------------------------------------ |
| `invalid`       | Revisa los datos del formulario.                             |
| `credentials`   | Correo o contraseña incorrectos.                             |
| `email_taken`   | Ya existe una cuenta con ese correo.                         |
| `alias_taken`   | Ese alias ya está en uso. Prueba con otro.                   |
| `weak_password` | La contraseña debe tener al menos 8 caracteres.              |
| `rate_limit`    | Demasiados intentos. Espera unos minutos e intenta de nuevo. |
| `unavailable`   | No pudimos conectar con el servidor. Intenta de nuevo.       |

Los mensajes de validación de cada campo (alias, correo, contraseña) se muestran antes de enviar, como hoy en `AuthCard`.

### Ruta de vuelta — `lib/safe-next.ts`

```ts
// Devuelve value si es una ruta interna ("/games/tetris"); si no, "/".
// Rechaza null, rutas sin "/" inicial, "//…" y "/\…" (redirecciones abiertas).
export function safeNextPath(
  value: string | string[] | null | undefined,
): string;
```

### Server Actions — `app/auth/actions.ts`

```ts
export async function signInWithPassword(input: {
  email: string;
  password: string;
  next: string;
}): Promise<AuthResult>;
export async function signUp(input: {
  alias: string;
  email: string;
  password: string;
  next: string;
}): Promise<AuthResult>;
export async function chooseAlias(input: {
  alias: string;
  next: string;
}): Promise<AuthResult>;
export async function requestPasswordReset(input: {
  email: string;
}): Promise<AuthResult>;
export async function updatePassword(input: {
  password: string;
}): Promise<AuthResult>;
export async function signOut(): Promise<void>;
```

- Si salen bien, `signInWithPassword`, `signUp`, `chooseAlias` y `updatePassword` terminan con `redirect()` y no devuelven `success`. `signInWithPassword` va a `/onboarding?next=…` si la cuenta no tiene perfil, y a `next` si lo tiene. `signUp` hace lo mismo según el trigger haya creado el perfil o no. `updatePassword` va al Home.
- `signUp` normaliza el alias y comprueba que esté libre (`select` en `profiles`) antes de llamar a `auth.signUp` con `options.data.alias`. Si está tomado, devuelve `alias_taken` sin crear la cuenta.
- `chooseAlias` inserta en `profiles` con el cliente de servidor. Una violación de `unique` devuelve `alias_taken`.
- `requestPasswordReset` siempre devuelve `success` salvo por `invalid`, `rate_limit` o `unavailable`, exista o no la cuenta: así no revela qué correos están registrados.
- Los errores de Supabase se traducen por `error.code` (`invalid_credentials`, `user_already_exists`, `weak_password`, `over_request_rate_limit`, `over_email_send_rate_limit`) a `AuthErrorCode`. Cualquier otro error pasa a `unavailable`.

### OAuth y enlaces de correo

- Google y GitHub se inician desde el navegador con `supabase.auth.signInWithOAuth({ provider, options: { redirectTo: origin + "/auth/callback?next=…" } })`. El verificador PKCE queda en una cookie del navegador.
- `GET /auth/callback?code&next` canjea el código con `exchangeCodeForSession`. Sin perfil, redirige a `/onboarding?next=…`. Con perfil, redirige a `safeNextPath(next)`. Si no hay código o el canje falla, redirige a `/login?error=oauth`.
- La recuperación usa la misma ruta. `requestPasswordReset` llama a `resetPasswordForEmail` con `redirectTo: origin + "/auth/callback?type=recovery&next=/auth/reset"`, y el verificador PKCE queda en una cookie que escribe la Server Action. Con `type=recovery`, `/auth/callback` redirige a `next` sin revisar el perfil, y si el canje falla, a `/login?error=link`.
- `/login` traduce `?error=oauth` a «No pudimos iniciar sesión con ese proveedor. Intenta de nuevo.» y `?error=link` a «El enlace no es válido o ya expiró. Pide uno nuevo.».

### Pantallas

Todas usan `AuthPanel`, el marco extraído de `AuthCard` (borde cian, glow y `Logo`), y `AuthField`.

- **`/login` — INICIAR SESIÓN:** Correo electrónico, Contraseña, ENTRAR, enlace «¿Olvidaste tu contraseña?» a `/auth/forgot`. El campo Usuario desaparece.
- **`/login` — CREAR CUENTA:** Alias (se pasa a mayúsculas mientras se escribe, `maxLength` 14), Correo electrónico, Contraseña, CREAR CUENTA.
- **Google / GitHub:** inician el OAuth real. Mientras redirigen, los dos botones quedan deshabilitados.
- **JUGAR COMO INVITADO:** navega a `next` si viene, o a `/games`. El texto de abajo pasa a «Sin cuenta puedes jugar, pero tus puntuaciones no entran al ranking.».
- **Pendiente:** mientras una acción corre, el botón principal muestra «ENTRANDO…», «CREANDO…», «GUARDANDO…» o «ENVIANDO…» y queda deshabilitado.
- **`/onboarding`:** título «ELIGE TU ALIAS», el texto «Así aparecerás en el ranking. No se puede cambiar.», campo Alias, botón LISTO y enlace «Ahora no» a `next`.
- **`/auth/forgot`:** campo Correo electrónico y ENVIAR ENLACE. Tras enviar, el mensaje fijo «Si existe una cuenta con ese correo, te enviamos un enlace para elegir una contraseña nueva.» y un enlace VOLVER a `/login`.
- **`/auth/reset`:** Nueva contraseña y Repite la contraseña (deben coincidir), y GUARDAR CONTRASEÑA.

### Navbar, Reproductor y rankings

| Estado                | Navbar y menú móvil                                   | `PlayingAs`                                                           | Modal de fin de partida                                                                |
| --------------------- | ----------------------------------------------------- | --------------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| Sin sesión (invitado) | INICIAR SESIÓN                                        | «Jugando como INVITADO · inicia sesión para guardar tus puntuaciones» | Botón INICIA SESIÓN PARA GUARDAR → `/login?next=/games/<id>/play`, en lugar de GUARDAR |
| Cuenta sin alias      | Avatar `?`, enlace «ELIGE TU ALIAS» y «cerrar sesión» | «Jugando sin alias · elige uno para guardar tus puntuaciones»         | Botón ELIGE TU ALIAS PARA GUARDAR → `/onboarding?next=/games/<id>/play`                |
| Cuenta con alias      | Avatar con la inicial, alias y «cerrar sesión»        | «Jugando como <ALIAS>»                                                | GUARDAR PUNTUACIÓN, con los estados `SaveStatus` del SPEC 06                           |

```ts
// components/game/GameOverModal.tsx: reemplaza isGuest
type SaveMode = "save" | "login" | "alias";
```

- `insertScore({ gameId, score })` deja de recibir `name`.
- `fetchPersonalBest(gameId, userId)` filtra por `user_id` en lugar de `name`.
- `DetailLeaderboard` y `HallOfFameTable` marcan `isMine` comparando `name` con `user.alias`. Sin alias o sin sesión, ninguna fila es propia.
- El enlace «Inicia sesión» del Salón de la Fama pasa a `/login?next=/hall-of-fame`.
- La partida que se deja para iniciar sesión se pierde. El modal no lo advierte con un texto aparte: el botón ya dice «para guardar».

## Plan de implementación

1. **Configuración de Supabase (manual, la hace el usuario).** Aplicar la tabla de «Configuración del proyecto de Supabase». Verificación: en Authentication → Providers, Email, Google y GitHub aparecen activados, y Confirm email está desactivado. La app no cambia.
2. **Tabla `profiles` y trigger de registro.** Aplicar `create_profiles` y regenerar `lib/supabase/database.types.ts`. Verificación con `execute_sql`: insertar en `auth.users` una fila de prueba con `raw_user_meta_data = {"alias":"PRUEBA_1"}` crea su perfil; otra con el mismo alias, o sin alias, queda sin perfil y sin error. Bajo `set role anon`, el insert en `profiles` falla. Borrar las filas de prueba. `get_advisors` (security) sin alertas nuevas. La app no cambia.
3. **Módulos compartidos.** Crear `lib/auth.ts` y `lib/safe-next.ts`. Todavía nada los usa. Verificación: `npx tsc --noEmit` y `npm run lint` pasan.
4. **Server Actions.** Crear `app/auth/actions.ts` con `signInWithPassword`, `signUp`, `chooseAlias` y `signOut`. Todavía nada las usa. Verificación: `npx tsc --noEmit` pasa.
5. **Sesión real.** Crear `lib/session-server.ts` y `components/auth/SessionProvider.tsx`, reescribir `lib/session.ts` y hacer async el layout raíz. Adaptar la Navbar, el menú móvil, `PlayingAs`, `DetailLeaderboard`, `HallOfFameView`, `HallOfFameTable` y `PlayerView` al nuevo `SessionUser`. Mientras no exista el paso 7, `PlayerView` sigue guardando con `getPlayerName(user)`. Extraer `AuthPanel` y conectar las pestañas de correo y contraseña de `AuthCard` a las acciones. JUGAR COMO INVITADO navega sin crear sesión, y Google y GitHub quedan deshabilitados. Eliminar `STORAGE_KEYS.user`. Verificación: crear la cuenta `PRUEBA_1`, ver el alias en la Navbar, recargar y seguir con sesión, cerrar sesión y volver a entrar.
6. **Google, GitHub y alias.** Habilitar los botones con `signInWithOAuth`, crear `/auth/callback`, `/onboarding` y `AliasForm`, y mostrar «ELIGE TU ALIAS» en la Navbar y el menú móvil. Verificación: el primer login con GitHub lleva a `/onboarding`; elegir un alias vuelve a `next`; «Ahora no» deja navegar con el avatar `?`.
7. **Puntuaciones ligadas a la cuenta.** Aplicar `link_scores_to_profiles` y regenerar los tipos. En el mismo paso, cambiar `insertScore` y `fetchPersonalBest` y agregar `SaveMode` a `PlayerView` y `GameOverModal`. Verificación con `execute_sql`: bajo `set role anon` el insert en `scores` falla. Con una cuenta, una partida de SNAKE guardada aparece en `/games/snake` con su alias y resaltada.
8. **Recuperación de contraseña.** Agregar `requestPasswordReset` y `updatePassword`, el caso `type=recovery` de `/auth/callback`, crear `/auth/forgot`, `/auth/reset`, `ForgotPasswordForm` y `ResetPasswordForm`, y el enlace «¿Olvidaste tu contraseña?». Verificación: pedir el enlace para la cuenta de prueba, abrirlo, elegir una contraseña nueva y entrar con ella.
9. **Redirecciones y errores de `/login`.** `/login` redirige si ya hay sesión, pasa `next` a todos los flujos y muestra `?error=oauth` y `?error=link`. Los enlaces del Salón de la Fama y del modal llevan `?next=`. Verificación: desde el modal de fin de partida de un invitado, iniciar sesión vuelve a `/games/<id>/play`.
10. **Documentación.** Actualizar `CLAUDE.md`: el párrafo de «Proyecto» (SPEC 18), las rutas nuevas, la estructura (`components/auth/`, `lib/auth.ts`, `lib/safe-next.ts`, `lib/session-server.ts`, `app/auth/`), la persistencia simulada (queda solo `e1230_skins`), la frase sobre el código de servidor y el esquema (`profiles`, `scores.user_id` y sus triggers) en «Notas del stack». Actualizar el comentario de `lib/supabase/proxy.ts`. Verificación: `npm run format:check` pasa.

## Criterios de aceptación

**Base de datos**

- [ ] `profiles` existe con RLS activo, y `alias` rechaza minúsculas, menos de 3 o más de 14 caracteres y símbolos fuera de `_`.
- [ ] Con la clave publicable (rol `anon`), `select` sobre `profiles` funciona, e `insert`, `update` y `delete` fallan o no afectan filas.
- [ ] Una cuenta autenticada no puede insertar un perfil con un `id` distinto del suyo, ni actualizar su alias.
- [ ] `scores` arranca vacía y `scores.user_id` es `not null` y referencia `profiles`.
- [ ] Con el rol `anon`, cualquier insert en `scores` falla.
- [ ] Con una cuenta con alias, un insert con solo `game_id` y `score` crea la fila con su `user_id` y su alias en `name`.
- [ ] Un insert que intente mandar `name` o `user_id` falla.
- [ ] Una cuenta sin perfil no puede insertar en `scores`.
- [ ] `get_advisors` (security) no reporta tablas sin RLS ni funciones `security definer` ejecutables por `anon` o `authenticated`.

**Registro e inicio de sesión**

- [ ] CREAR CUENTA con el alias `neon_1`, un correo nuevo y una contraseña de 8 caracteres crea la cuenta, guarda el alias `NEON_1` y deja la sesión iniciada sin pedir confirmación de correo.
- [ ] Registrarse con un alias ya tomado muestra «Ese alias ya está en uso. Prueba con otro.» y no crea ninguna fila en `auth.users`.
- [ ] Registrarse con un correo ya registrado muestra «Ya existe una cuenta con ese correo.».
- [ ] Una contraseña de 7 caracteres muestra el aviso de 8 caracteres antes de enviar.
- [ ] ENTRAR con una contraseña incorrecta muestra «Correo o contraseña incorrectos.».
- [ ] Tras iniciar sesión, la Navbar muestra el alias y la inicial sin parpadear «INICIAR SESIÓN» al recargar.
- [ ] «cerrar sesión» en la Navbar y en el menú móvil cierra la sesión y deja al usuario en la misma página.
- [ ] Cerrar sesión en una pestaña hace que otra pestaña abierta deje de mostrar el alias sin recargar a mano.
- [ ] Con sesión, `/login` redirige a `next` o al Home.

**Google, GitHub y alias**

- [ ] El primer login con GitHub (y con Google) termina en `/onboarding`.
- [ ] Elegir un alias libre en `/onboarding` lo guarda en mayúsculas y vuelve a `next`. Uno tomado muestra «Ese alias ya está en uso. Prueba con otro.».
- [ ] Con «Ahora no», la Navbar muestra el avatar `?` y el enlace «ELIGE TU ALIAS».
- [ ] Un segundo login con el mismo proveedor y alias ya elegido va directo a `next`, sin pasar por `/onboarding`.
- [ ] Entrar con un segundo proveedor que comparte un correo verificado con la cuenta (por ejemplo, Google y luego GitHub) usa la misma cuenta y el mismo alias, sin pasar por `/onboarding`.
- [ ] `/onboarding` sin sesión redirige a `/login`, y con alias redirige a `next`.
- [ ] Si se cancela el OAuth en el proveedor, `/login` muestra «No pudimos iniciar sesión con ese proveedor. Intenta de nuevo.».

**Recuperación de contraseña**

- [ ] «¿Olvidaste tu contraseña?» lleva a `/auth/forgot`.
- [ ] Pedir el enlace con un correo registrado y con uno no registrado muestra el mismo mensaje.
- [ ] El enlace del correo, abierto en el mismo navegador, pasa por `/auth/callback` y termina en `/auth/reset` con sesión.
- [ ] Guardar una contraseña nueva de 8 o más caracteres permite entrar con ella y ya no con la anterior.
- [ ] Contraseñas que no coinciden en `/auth/reset` muestran un aviso y no se envían.
- [ ] Un enlace ya usado o alterado termina en `/login` con «El enlace no es válido o ya expiró. Pide uno nuevo.».
- [ ] `/auth/reset` sin sesión redirige a `/login?error=link`.

**Invitado, puntuaciones y rankings**

- [ ] JUGAR COMO INVITADO lleva a `/games` (o a `next`) y no escribe nada en `localStorage` ni en cookies de sesión.
- [ ] Como invitado, `PlayingAs` dice «Jugando como INVITADO · inicia sesión para guardar tus puntuaciones».
- [ ] Como invitado, el modal de fin de partida muestra INICIA SESIÓN PARA GUARDAR. Iniciar sesión desde ahí vuelve a `/games/<id>/play`.
- [ ] Con una cuenta sin alias, el modal muestra ELIGE TU ALIAS PARA GUARDAR, que lleva a `/onboarding` y vuelve al Reproductor.
- [ ] Con una cuenta con alias, GUARDAR PUNTUACIÓN crea exactamente una fila en `scores` y la puntuación aparece en el Detalle con el alias, resaltada como propia.
- [ ] Con otra cuenta, esa misma fila no aparece resaltada.
- [ ] «TU MEJOR MARCA» del Salón de la Fama muestra la mejor puntuación de la cuenta aunque esté fuera del top 10.
- [ ] El enlace «Inicia sesión» del Salón de la Fama vuelve a `/hall-of-fame` tras iniciar sesión.

**Seguridad de redirecciones**

- [ ] `/login?next=https://evil.com`, `/login?next=//evil.com` y `/login?next=/\evil.com` terminan en el Home tras iniciar sesión.

**Modo degradado, limpieza y build**

- [ ] Sin `NEXT_PUBLIC_SUPABASE_URL`, todas las páginas cargan como sin sesión, y ENTRAR muestra «No pudimos conectar con el servidor. Intenta de nuevo.».
- [ ] `STORAGE_KEYS.user`, `signIn`, `guest`, `JUGADOR_G` y `JUGADOR_GH` no aparecen en `app/`, `components/` ni `lib/`.
- [ ] Iniciar sesión no escribe `e1230_user` en `localStorage`.
- [ ] `npm run build`, `npm run lint` y `npx tsc --noEmit` pasan. `npm run build` pasa también sin las variables de Supabase.

## Decisiones

- **Sí:** correo y contraseña, Google y GitHub en el mismo spec. Lo eligió el usuario. Los botones ya están en `AuthCard` y no se dejan simulados.
- **Sí:** un solo spec con plan por fases. Lo eligió el usuario. Partirlo dejaría un estado intermedio con la sesión real conviviendo con `e1230_user`.
- **Sí:** alias único elegido por el jugador y login con correo. Lo eligió el usuario. Supabase Auth autentica por correo, y el alias es el nombre público del ranking.
- **No:** iniciar sesión con el alias. Exige una función que resuelva alias a correo y permite descubrir qué alias tienen cuenta.
- **Sí:** alias de 3 a 14 caracteres con `A-Z`, `0-9` y `_`, en mayúsculas. Lo eligió el usuario. Sigue el estilo del login simulado (mayúsculas, 14 caracteres) y cabe en el `CHECK` de 20 de `scores.name`.
- **Sí:** alias inmutable en este spec. Así `scores.name` puede seguir siendo una copia sin tener que sincronizarse. Cambiar el alias va en el spec de perfil.
- **Sí:** pantalla `/onboarding` para las cuentas OAuth. Lo eligió el usuario. Cada jugador controla su nombre público.
- **No:** alias automático a partir del usuario de GitHub o el nombre de Google. Puede salir con caracteres inválidos o sufijos feos.
- **Sí:** se acepta la vinculación automática de identidades de Supabase: una persona es una cuenta y tiene un solo alias, entre con el proveedor que entre. Lo eligió el usuario durante la implementación, después de que Google y GitHub terminaran en la misma cuenta. Supabase compara todos los correos verificados que entrega el proveedor (GitHub, con `user:email`, entrega también los secundarios) y no permite desactivar esa vinculación.
- **No:** una cuenta separada por proveedor con un correo verificado compartido. Supabase no lo permite.
- **No:** avisar en pantalla cuando un proveedor se une a una cuenta existente. Se descartó por ahora: el jugador ve su propio alias en la Navbar.
- **Sí:** tras el login se redirige a `/onboarding`, pero después el jugador navega libre. Lo eligió el usuario. Mantiene el proxy sin consultas extra y sin redirecciones.
- **No:** bloquear la navegación hasta elegir el alias. Exige consultar el perfil en el proxy en cada petición.
- **Sí:** el trigger de registro crea el perfil y, si el alias está tomado, no falla. La cuenta queda sin perfil y cae en el mismo flujo de `/onboarding` que OAuth. Así se evita el error genérico «Database error saving new user» de Supabase.
- **Sí:** comprobar el alias antes de `auth.signUp`. Da el mensaje claro en el caso normal. La carrera entre dos registros simultáneos la resuelve el `on conflict` del trigger.
- **Sí:** sin confirmación de correo. Lo eligió el usuario. El SMTP por defecto de Supabase envía pocos correos por hora, y Resend no tiene dominio verificado.
- **Sí:** recuperación de contraseña en este spec, con el SMTP por defecto de Supabase. Lo eligió el usuario. Se acepta su límite de envíos como riesgo.
- **Sí:** enlace de recuperación con `code` de PKCE, canjeado en `/auth/callback`. Lo eligió el usuario durante la implementación. Es lo único posible con la plantilla por defecto, que no se puede editar sin SMTP propio.
- **No:** enlace con `token_hash` y una ruta `/auth/confirm` (`verifyOtp`). Funcionaría en cualquier navegador, pero exige editar la plantilla y, por tanto, un SMTP propio. Vuelve con el spec de SMTP.
- **No:** Resend como SMTP para poder editar la plantilla. Sin dominio verificado solo llega al correo de la cuenta de Resend.
- **Sí:** `requestPasswordReset` responde lo mismo exista o no la cuenta. No revela qué correos están registrados.
- **Sí:** contraseña de mínimo 8 caracteres. Lo eligió el usuario. Se fija en Supabase y se valida igual en el formulario.
- **Sí:** el invitado es simplemente no tener sesión. Lo eligió el usuario. Desaparece `SessionUser.guest`.
- **No:** usuarios anónimos de Supabase. Llenan `auth.users` de filas temporales y complican el ranking.
- **Sí:** solo las cuentas con alias guardan puntuaciones. Lo eligió el usuario. Cierra la trampa del nombre libre que el SPEC 06 aceptó de forma temporal.
- **Sí:** la base pone `user_id` y `name` con un trigger, y el cliente solo puede mandar `game_id` y `score`. Nadie puede guardar con el alias de otro.
- **Sí:** borrar las 9 puntuaciones anónimas actuales. Lo eligió el usuario. Son pruebas de un solo nombre, y así `user_id` puede ser `not null`.
- **Sí:** `scores.user_id` referencia `profiles` y no `auth.users`. Garantiza que toda puntuación tiene alias.
- **Sí:** la vista `leaderboard` no cambia y `isMine` se compara con el alias. El alias es único e inmutable, y no hace falta exponer `user_id` en la vista.
- **Sí:** `SessionProvider` con el usuario inicial leído en el layout. Lo eligió el usuario. Evita el parpadeo de la Navbar.
- **Sí:** se acepta que todas las páginas pasen a renderizarse por petición, porque el layout lee cookies. Casi todas ya lo eran desde el SPEC 06. `/about`, `/login` y la 404 dejan de ser estáticas.
- **No:** leer la sesión solo en el navegador. La Navbar parpadearía en cada carga.
- **Sí:** correo, contraseña, alias, recuperación y cierre de sesión con Server Actions. Las cookies de sesión se escriben en el servidor, como el formulario de contacto.
- **Sí:** OAuth iniciado desde el navegador con `signInWithOAuth`. Es el flujo PKCE estándar de `@supabase/ssr`: el verificador queda en una cookie del navegador y `/auth/callback` lo canjea.
- **Sí:** `?next=` con `safeNextPath` y Home por defecto. Lo eligió el usuario. Quien estaba jugando vuelve al Reproductor, y la validación impide redirecciones abiertas.
- **Sí:** solo `http://localhost:3000` en Site URL y Redirect URLs. Lo eligió el usuario. El dominio de producción se agrega cuando haya despliegue.
- **No:** variables de entorno nuevas para OAuth. Las credenciales viven en el panel de Supabase, no en la app.
- **Sí:** `proxy.ts` sigue sin redirigir. Las guardas por sesión viven en las tres páginas que las necesitan.
- **Sí:** abandonar `e1230_user` sin migrar. Las sesiones simuladas no corresponden a ninguna cuenta real.

## Riesgos

| Riesgo                                                                                                                                                                   | Mitigación                                                                                                                                                                                                  |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| El SMTP por defecto de Supabase envía pocos correos por hora: la recuperación puede fallar con varios pedidos seguidos.                                                  | La acción traduce `over_email_send_rate_limit` a «Demasiados intentos…». El SMTP propio va en otro spec.                                                                                                    |
| Sin confirmación de correo, alguien puede registrarse con el correo de otra persona. Si esa persona entra después con Google, Supabase puede vincular ambas identidades. | Se acepta mientras no haya confirmación de correo. Va como motivo principal del spec de confirmación. La recuperación de contraseña permite a la víctima retomar la cuenta.                                 |
| Una app OAuth mal configurada (URI de redirección distinta) deja los botones sin funcionar.                                                                              | El paso 1 fija la URI exacta, y `/auth/callback` cae en `/login?error=oauth` con un mensaje en lugar de romperse.                                                                                           |
| Cuentas OAuth que nunca eligen alias.                                                                                                                                    | Pueden jugar, pero no guardar. La Navbar y el modal les recuerdan elegirlo.                                                                                                                                 |
| Alias ofensivos.                                                                                                                                                         | La regex limita los caracteres. Se pueden borrar perfiles desde el panel de Supabase, y la moderación va en otro spec.                                                                                      |
| El layout async con cookies hace que todas las páginas se rendericen por petición y consulten `profiles`.                                                                | `fetchSessionUser` usa `cache()` (una consulta por petición), y sin cookie de sesión `getClaims` no hace ninguna petición de red.                                                                           |
| El enlace de recuperación solo funciona en el navegador donde se pidió (el verificador PKCE vive en sus cookies), y el correo llega en inglés.                           | Si se abre en otro navegador, `/auth/callback` cae en `/login?error=link` con «El enlace no es válido o ya expiró. Pide uno nuevo.». El `token_hash` y la plantilla en español vuelven con el spec de SMTP. |

## Lo que **no** entra en este spec

- Confirmación de correo y SMTP propio.
- Página de perfil: cambiar alias, correo o contraseña, avatar o borrar la cuenta.
- Vincular proveedores a mano, magic link, SMS, passkeys u otros proveedores.
- Usuarios anónimos de Supabase.
- Recuperar la puntuación de una partida de invitado tras iniciar sesión.
- Guardas de rutas en el proxy.
- Antitrampas y moderación de alias.
- Dominio de producción.
- Tests automatizados.
- Cambios en los specs 01 a 17.

Si alguna de estas llega, va en su propio spec.
