# SPEC 20 — Endurecimiento de la autenticación

> **Estado:** Aprobado
> **Depende de:** SPEC 04, SPEC 18, SPEC 19
> **Fecha:** 2026-10-19
> **Objetivo:** Cerrar los hallazgos de la revisión de seguridad de la autenticación: cerrar las otras sesiones al cambiar la contraseña, fijar la URL del sitio para el correo de recuperación y para las cookies `Secure`, acotar la longitud de la contraseña y quitar dos decisiones frágiles de `chooseAlias` y `/auth/callback`.

## Por qué existe este spec

El 2026-10-19 se revisó a mano el código de autenticación del SPEC 18 (`app/auth/`, `lib/auth.ts`, `lib/safe-next.ts`, `lib/supabase/`, `proxy.ts` y `components/auth/`). No hay vulnerabilidades críticas: `safeNextPath` bloquea las redirecciones abiertas, las Server Actions validan su entrada, la sesión se lee con `getClaims()` y no hay `service_role` en el código. Sí aparecieron seis puntos corregibles, que este spec agrupa porque tocan los mismos archivos:

| #   | Sev.       | Dónde                                          | Problema                                                                                                                                                                                                   |
| --- | ---------- | ---------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Media      | `app/auth/actions.ts` (`updatePassword`)       | Cambiar la contraseña no cierra las otras sesiones: quien robó una sesión sigue dentro después del reseteo.                                                                                                |
| 4   | Media-baja | `app/auth/actions.ts` (`requestPasswordReset`) | El `redirectTo` del correo se arma con la cabecera `Origin`, que controla quien llame la acción con `curl`. Solo lo frena la lista de Redirect URLs del panel.                                             |
| 5   | Media-baja | `lib/supabase/{server,client,proxy}.ts`        | Las cookies de sesión salen con los valores por defecto de `@supabase/ssr` (`sameSite: lax`, `httpOnly: false`, sin `secure`). Sin CSP ni HSTS (riesgo aceptado), un tramo HTTP o un XSS expone la sesión. |
| 6   | Baja       | `app/auth/actions.ts` (`chooseAlias`)          | Distingue «ya tenías alias» de «alias en uso» con `error.message.includes("profiles_pkey")`, que depende del texto del error de Postgres.                                                                  |
| 7   | Baja       | `app/auth/callback/route.ts`                   | `type=recovery` lo manda el cliente y, si viene, el callback se salta la revisión de perfil.                                                                                                               |
| 8   | Baja       | `lib/auth.ts` (`isValidPassword`)              | La contraseña no tiene longitud máxima: bcrypt solo usa los primeros 72 bytes y el resto viaja hasta Supabase.                                                                                             |

El hallazgo 2 (dependencias: `next` 16.0 a 16.3.7, `sharp` y `source-map-js`) se resuelve con `npm audit fix` y no necesita spec. El hallazgo 3 (enumeración de correos en `signUp`) se acepta como riesgo: sin confirmación de correo, un registro nuevo entra con sesión y uno repetido no, así que la diferencia se nota aunque el mensaje sea genérico. Solo se cierra con confirmación de correo y SMTP propio.

## Alcance

**Incluye:**

- **Cierre de las otras sesiones** (1): `updatePassword` llama a `signOut({ scope: "others" })` después de `updateUser`.
- **URL fija del sitio** (4): variable `NEXT_PUBLIC_SITE_URL` y helper `lib/site-url.ts`. `requestPasswordReset` arma el `redirectTo` con ella y deja de leer `Origin`.
- **Cookies de sesión `Secure`** (5): helper `lib/supabase/cookie-options.ts` que decide `secure` según la URL del sitio, usado por los tres clientes de Supabase.
- **Longitud máxima de la contraseña** (8): 72 bytes, validada en `lib/auth.ts`, en `signUp`, en `updatePassword` y en los formularios CREAR CUENTA y NUEVA CONTRASEÑA, con un código de error y un mensaje propios.
- **`chooseAlias` sin leer `error.message`** (6): ante un `23505` consulta si la cuenta ya tiene perfil.
- **`/auth/callback` sin confiar en `type=recovery`** (7): siempre revisa el perfil; el parámetro solo elige el mensaje de error.
- **Verificación manual de ajustes del panel** de Supabase que el código no puede leer (ver «Configuración del proyecto de Supabase»).
- **Documentación:** `.env.example` y `CLAUDE.md` (variable nueva, cookies, riesgo aceptado del hallazgo 3).

**Fuera de alcance (para futuros specs):**

- Enumeración de correos en `signUp` (3): riesgo aceptado hasta el spec de confirmación de correo y SMTP propio.
- Actualizar `next`, `sharp` y `source-map-js` (2): `npm audit fix`, sin spec.
- `Content-Security-Policy` y `Strict-Transport-Security`: siguen como en el SPEC 19.
- Límite propio por IP en las Server Actions o CAPTCHA, para el límite global de 15 sign-ins por 5 minutos (riesgo aceptado en el SPEC 19).
- Cookies `HttpOnly`: el cliente de navegador necesita leer la sesión (OAuth, `insertScore`), así que `httpOnly` sigue en `false`.
- Cambiar el `redirectTo` de OAuth en `AuthCard` (usa `window.location.origin`, corre en el navegador y lo valida la lista de Redirect URLs).
- Pedir la contraseña actual al cambiarla, y cambiar la contraseña desde una página de perfil.
- Tope de longitud en el inicio de sesión (una cuenta antigua podría tener una contraseña más larga).
- Tests automatizados.
- Modificar los specs 01 a 19.

## Archivos

```
lib/site-url.ts                    (nuevo)   readSiteUrl(): origen fijo del sitio o null
lib/supabase/cookie-options.ts     (nuevo)   sessionCookieOptions(): { secure }
lib/supabase/server.ts             (cambia)  createServerClient con cookieOptions
lib/supabase/client.ts             (cambia)  createBrowserClient con cookieOptions
lib/supabase/proxy.ts              (cambia)  createServerClient con cookieOptions
lib/auth.ts                        (cambia)  PASSWORD_MAX_BYTES, isPasswordTooLong, código password_too_long
app/auth/actions.ts                (cambia)  hallazgos 1, 4, 6 y 8
app/auth/callback/route.ts         (cambia)  hallazgo 7
components/auth/AuthCard.tsx       (cambia)  tope en CREAR CUENTA
components/auth/ResetPasswordForm.tsx (cambia) tope en NUEVA CONTRASEÑA
.env.example                       (cambia)  NEXT_PUBLIC_SITE_URL
CLAUDE.md                          (cambia)  variable, cookies y riesgo aceptado
```

Convenciones:

- No hay cambios de esquema ni migraciones: `lib/supabase/database.types.ts` no se regenera.
- `proxy.ts` sigue sin redirigir; solo cambian las opciones de las cookies que escribe `lib/supabase/proxy.ts`.
- Se mantienen las convenciones del SPEC 01: código en inglés y comentarios en español latinoamericano.

## Configuración del proyecto de Supabase (manual)

El MCP de Supabase no lee estos ajustes, así que el paso 1 del plan los confirma el usuario en el panel:

| Dónde                                                   | Qué confirmar                                                                                                                                                              |
| ------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Supabase → Authentication → URL Configuration           | Site URL y Redirect URLs son solo `http://localhost:3000` y `http://localhost:3000/**` (sin comodines de otros dominios). El dominio de producción se agrega al desplegar. |
| Supabase → Authentication → Sign In / Providers → Email | Si existe el ajuste «Secure password change» (pedir sesión reciente para cambiar la contraseña), anotar si está activo. No se cambia en este spec.                         |
| Supabase → Authentication → Sessions                    | Anotar la duración del access token (JWT expiry), que acota la ventana descrita en «Riesgos».                                                                              |

## Modelo de datos

Este spec no agrega tablas ni columnas. Cambia constantes, un código de error y una variable de entorno.

### Variable de entorno

| Variable               | Obligatoria       | Uso                                                                                                                                              |
| ---------------------- | ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| `NEXT_PUBLIC_SITE_URL` | En producción: sí | Origen público de la app (`http://localhost:3000` en desarrollo). Fija el `redirectTo` de la recuperación y el atributo `Secure` de las cookies. |

Es `NEXT_PUBLIC_*` porque el cliente de navegador también escribe cookies de sesión (la del verificador PKCE de OAuth). Como todas las `NEXT_PUBLIC_*`, queda fija en `next build`.

### Helper — `lib/site-url.ts`

```ts
// Origen fijo del sitio (sin ruta ni barra final), o null si falta o no es una URL http(s)
export function readSiteUrl(): string | null;
```

- Se lee con el nombre literal `process.env.NEXT_PUBLIC_SITE_URL` (regla de `lib/supabase/env.ts`).
- Se normaliza con `new URL(value).origin` y se rechaza cualquier protocolo distinto de `http:` y `https:`.
- No hay valor por defecto dentro del helper: cada llamador decide qué hacer con `null`.

### Cookies — `lib/supabase/cookie-options.ts`

```ts
// Opciones que se suman a las de @supabase/ssr en los tres clientes
export function sessionCookieOptions(): { secure: boolean };
```

Regla de `secure`:

| `NEXT_PUBLIC_SITE_URL` | `secure`                                |
| ---------------------- | --------------------------------------- |
| `https://…`            | `true`                                  |
| `http://…`             | `false`                                 |
| ausente o inválida     | `process.env.NODE_ENV === "production"` |

- Un despliegue que olvide la variable queda con cookies `Secure` (el lado seguro). El desarrollo con `npm run start` sobre `http://localhost` debe definir `NEXT_PUBLIC_SITE_URL=http://localhost:3000` para que el login funcione en Safari.
- Los demás atributos (`sameSite: lax`, `httpOnly: false`, `path`, `maxAge`) los sigue poniendo `@supabase/ssr`.
- El `setAll` de `lib/supabase/proxy.ts` recibe las opciones ya mezcladas por la librería, así que basta con pasarle `cookieOptions` a `createServerClient`.

### Contraseña — `lib/auth.ts`

```ts
export const PASSWORD_MAX_BYTES = 72; // límite real de bcrypt

export function isPasswordTooLong(password: string): boolean; // new TextEncoder().encode(password).length > PASSWORD_MAX_BYTES

// AuthErrorCode gana un valor:
//   | "password_too_long" // más de 72 bytes
```

- `FIELD_MESSAGES.passwordMax`: «La contraseña no puede pasar de 72 bytes (unos 72 caracteres; menos si usas acentos o emojis).»
- `AUTH_ERROR_MESSAGES.password_too_long` reutiliza ese texto.
- `isValidPassword` no cambia (sigue siendo el mínimo de 8 caracteres): quien valida una contraseña nueva llama a las dos funciones.

## Plan de implementación

1. **Verificación manual del panel (la hace el usuario).** Aplicar la tabla de «Configuración del proyecto de Supabase» y anotar las respuestas en el PR. La app no cambia.
2. **URL del sitio y variable.** Crear `lib/site-url.ts` y agregar `NEXT_PUBLIC_SITE_URL` a `.env.example` (comentada con el formato y la advertencia de `next build`) y al `.env` local con `http://localhost:3000`. Verificación: `npx tsc --noEmit` pasa y la app arranca igual.
3. **Cookies `Secure`.** Crear `lib/supabase/cookie-options.ts` y pasar `cookieOptions: sessionCookieOptions()` en `server.ts`, `client.ts` y `proxy.ts`. Verificación: con `NEXT_PUBLIC_SITE_URL=http://localhost:3000`, iniciar sesión funciona y las cookies `sb-*` no llevan `Secure`; el login con GitHub sigue funcionando.
4. **`redirectTo` fijo.** En `requestPasswordReset`, reemplazar la lectura de `Origin` por `readSiteUrl()`: sin valor, en desarrollo se usa `http://localhost:3000` y en producción responde `unavailable`. Quitar el import de `headers`. Verificación: un `curl` a la acción con `Origin: https://evil.test` ya no cambia el enlace del correo (llega a `localhost:3000`), y el flujo normal de recuperación sigue funcionando.
5. **Tope de la contraseña.** Agregar `PASSWORD_MAX_BYTES`, `isPasswordTooLong`, `password_too_long` y los mensajes en `lib/auth.ts`. Validar en `signUp` y `updatePassword` (después del mínimo) y en `AuthCard` (solo la pestaña CREAR CUENTA) y `ResetPasswordForm`. Verificación: una contraseña de 73 bytes se rechaza en servidor y en los formularios; una de 72 bytes se acepta.
6. **Cerrar las otras sesiones.** En `updatePassword`, después de `updateUser`, llamar a `supabase.auth.signOut({ scope: "others" })`. Es de mejor esfuerzo: si falla, no se deshace el cambio ni se muestra un error, porque la contraseña ya cambió. Verificación: ver los criterios de aceptación (dos navegadores).
7. **`chooseAlias` sin `error.message`.** Ante un `23505`, llamar a `hasProfile(supabase, userId)`: si hay perfil, seguir a `next`; si no, responder `alias_taken`. Quitar la comprobación de `profiles_pkey`. Verificación: elegir un alias ya tomado muestra «Ese alias ya está en uso»; repetir el envío estando ya con alias lleva a `next`.
8. **`/auth/callback` siempre revisa el perfil.** Sacar la rama `isRecovery` del destino exitoso: tras `exchangeCodeForSession` siempre se consulta `profiles`, con perfil se va a `next` y sin perfil a `/onboarding?next=…`. `type=recovery` solo decide el destino de error (`/login?error=link` o `/login?error=oauth`). Verificación: la recuperación de una cuenta con alias llega a `/auth/reset`; el login con GitHub de una cuenta nueva llega a `/onboarding`.
9. **Documentación.** Actualizar `CLAUDE.md`: el párrafo de «Proyecto» (SPEC 20), la tabla de variables de entorno, las cookies `Secure` en «Autenticación», y el riesgo aceptado de la enumeración de correos. Verificación: `npm run format:check` pasa.

## Criterios de aceptación

**Sesiones (1)**

- [ ] Con la misma cuenta abierta en dos navegadores A y B, completar la recuperación de contraseña en A deja a A con sesión y hace que el `refresh_token` anterior de B falle en `POST /auth/v1/token?grant_type=refresh_token` de Supabase.
- [ ] Tras cambiar la contraseña, B ya no puede renovar su sesión: al vencer su access token, el siguiente `GET /` en B lo trata como sin sesión.
- [ ] `updatePassword` sigue redirigiendo a `/` y A conserva su sesión.

**URL del sitio (4)**

- [ ] `requestPasswordReset` no lee la cabecera `Origin`: el archivo no importa `headers` de `next/headers`.
- [ ] Una petición a la acción con `Origin: https://evil.test` genera un correo cuyo enlace de retorno apunta a `NEXT_PUBLIC_SITE_URL` y no a `evil.test`.
- [ ] Sin `NEXT_PUBLIC_SITE_URL` en un build de producción, `requestPasswordReset` responde «No pudimos conectar con el servidor».
- [ ] El flujo completo (pedir enlace, abrirlo en el mismo navegador, elegir contraseña nueva) funciona igual que antes.

**Cookies (5)**

- [ ] Con `NEXT_PUBLIC_SITE_URL=http://localhost:3000`, las cookies `sb-*` se escriben sin `Secure` y el login con correo y con GitHub funciona en `http://localhost:3000`.
- [ ] Con `NEXT_PUBLIC_SITE_URL=https://…` (túnel HTTPS o despliegue), las cookies `sb-*` escritas por el servidor, por el proxy y por el navegador (verificador PKCE) llevan `Secure`.
- [ ] Sin la variable, un build de producción escribe las cookies con `Secure`.
- [ ] `sameSite` sigue en `lax` y `httpOnly` en `false`.

**Contraseña (8)**

- [ ] `PASSWORD_MAX_BYTES` vale 72 y `isPasswordTooLong` cuenta bytes UTF-8: 72 caracteres ASCII pasan, 73 no, y 37 caracteres de 2 bytes (74 bytes) no.
- [ ] `signUp` y `updatePassword` responden `password_too_long` con el mensaje de `FIELD_MESSAGES.passwordMax` para una contraseña de 73 bytes, también si se invocan sin pasar por la UI.
- [ ] CREAR CUENTA y NUEVA CONTRASEÑA muestran ese mensaje antes de enviar. ENTRAR no cambia.
- [ ] Una contraseña de 8 a 72 bytes sigue funcionando en el registro, la recuperación y el inicio de sesión.

**`chooseAlias` y callback (6 y 7)**

- [ ] `app/auth/actions.ts` no contiene `profiles_pkey` ni lee `error.message`.
- [ ] Elegir un alias que ya usa otra cuenta muestra «Ese alias ya está en uso. Prueba con otro.»
- [ ] Enviar `chooseAlias` estando ya con alias redirige a `next` sin error.
- [ ] `GET /auth/callback?code=<código OAuth>&type=recovery&next=/games` con una cuenta sin alias va a `/onboarding?next=%2Fgames`, no a `/games`.
- [ ] `GET /auth/callback` sin `code` va a `/login?error=oauth`, y con `type=recovery` sin `code` va a `/login?error=link`.
- [ ] La recuperación de contraseña de una cuenta con alias llega a `/auth/reset`.

**Documentación y build**

- [ ] `.env.example` y `CLAUDE.md` documentan `NEXT_PUBLIC_SITE_URL`, las cookies `Secure` y el riesgo aceptado de la enumeración de correos.
- [ ] Las respuestas de la verificación manual del panel están anotadas en el PR.
- [ ] `npm run build`, `npm run lint`, `npx tsc --noEmit` y `npm run format:check` pasan.

## Decisiones

- **Sí:** `signOut({ scope: "others" })` después de cambiar la contraseña. Es el cierre estándar de sesiones tras un reseteo, y no cuesta nada al flujo normal.
- **Sí:** el cierre de las otras sesiones es de mejor esfuerzo. Si falla, la contraseña ya cambió y mostrar un error confundiría al jugador; el riesgo queda documentado.
- **No:** `scope: "global"`. Cerraría también la sesión que acaba de abrir el enlace de recuperación.
- **Sí:** `NEXT_PUBLIC_SITE_URL` única para el `redirectTo` y para `Secure`. Sirve en servidor y navegador, y evita que `npm run start` sobre `http://localhost` rompa el login en Safari (las cookies `Secure` sobre HTTP no se guardan allí).
- **No:** `SITE_URL` solo de servidor con `NODE_ENV`. El cliente de navegador no la ve, y `Secure` quedaría atado a `NODE_ENV` aunque se pruebe en local con `next start`.
- **Sí:** sin variable, `Secure` queda activo en producción. Un despliegue olvidadizo falla del lado seguro.
- **No:** `httpOnly: true`. El cliente de navegador de `@supabase/ssr` lee la sesión (OAuth con PKCE, `insertScore`), así que no se puede.
- **Sí:** tope de 72 bytes y no de 72 caracteres ni de 128. Es el límite real de bcrypt; contarlo en bytes evita que una contraseña con acentos o emojis se trunque sin avisar.
- **No:** tope en el inicio de sesión. Una cuenta antigua creada por la API directa podría tener una contraseña más larga y quedaría fuera.
- **Sí:** `password_too_long` como código propio y no reutilizar `weak_password`, cuyo mensaje habla del mínimo de 8 caracteres.
- **Sí:** ante un `23505` en `chooseAlias`, consultar el perfil con `hasProfile` y no el texto del error. Cuesta una consulta en un caso poco frecuente y no depende del nombre de la restricción.
- **Sí:** `/auth/callback` siempre revisa el perfil, y `type=recovery` solo elige el mensaje de error. Una cuenta de OAuth sin alias que recupera su contraseña pasa por `/onboarding` y vuelve a `/auth/reset` gracias a `next`.
- **No:** crear una ruta aparte para la recuperación (`/auth/recovery`). Obligaría a cambiar la plantilla del correo, que sin SMTP propio no se puede editar.
- **Sí:** la enumeración de correos en `signUp` queda como riesgo aceptado. Sin confirmación de correo, la diferencia entre registro nuevo (con sesión) y repetido (sin sesión) se nota igual, así que un mensaje genérico sería cosmético.
- **No:** confirmación de correo en este spec. Exige SMTP propio y cambia el flujo de registro; va en su propio spec.
- **No:** subir las dependencias en este spec. `npm audit fix` es un cambio mecánico que no necesita contrato.

## Riesgos

| Riesgo                                                                                                                                                                                | Mitigación                                                                                                                                                                   |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `signOut({ scope: "others" })` revoca los refresh tokens, pero los access tokens ya emitidos siguen siendo válidos hasta vencer, y `getClaims()` los acepta sin consultar a Supabase. | La ventana la acota la duración del JWT (por defecto 1 hora). El paso 1 anota el valor del panel. Acortarlo o validar contra Auth en cada petición queda fuera de este spec. |
| Cookies `Secure` con la variable mal definida (`http://` en producción) dejan la sesión sin `Secure`.                                                                                 | `.env.example` documenta el formato. El criterio de aceptación comprueba el valor `https://` y el caso sin variable.                                                         |
| `NEXT_PUBLIC_SITE_URL` queda fija en `next build`: cambiar de dominio exige volver a construir.                                                                                       | Está dicho en `.env.example` y `CLAUDE.md`, igual que las variables de Supabase.                                                                                             |
| Si falla `signOut({ scope: "others" })`, las otras sesiones sobreviven sin aviso.                                                                                                     | Es el trade-off elegido (mejor esfuerzo). El criterio de aceptación verifica el camino feliz.                                                                                |
| El correo de recuperación seguirá usando el Site URL del panel si `redirectTo` no está en la lista de Redirect URLs.                                                                  | El paso 1 confirma que la lista solo trae `localhost:3000`. Al desplegar se agrega el dominio de producción.                                                                 |

## Lo que **no** entra en este spec

- Enumeración de correos en `signUp` (riesgo aceptado) y confirmación de correo.
- Actualizar dependencias (`npm audit fix`).
- `Content-Security-Policy`, `Strict-Transport-Security`, CAPTCHA y límite propio por IP.
- Cookies `HttpOnly`, contraseña actual al cambiarla y página de perfil.
- Acortar el JWT o validar la sesión contra Auth en cada petición.
- Tests automatizados.
- Cambios en los specs 01 a 19.

Si alguna de estas llega, va en su propio spec.
