# SPEC 19 — Endurecimiento de seguridad básico

> **Estado:** Aprobado
> **Depende de:** SPEC 04, SPEC 06, SPEC 18
> **Fecha:** 2026-10-19
> **Objetivo:** Cerrar el checklist de `references/security/security-checklist.md` con headers de seguridad en Next.js, permisos mínimos en las tablas de Supabase, el límite de registros e inicios de sesión y los warnings del linter de seguridad.

## Por qué existe este spec

`references/security/security-checklist.md` trae cinco puntos y tres warnings del linter de Supabase. Al revisar el proyecto `xanuntuhanyubcqiudlp` el 2026-10-19, el estado era este:

| Punto del checklist                      | Estado al escribir el spec                                                                                                                             | Qué hace este spec            |
| ---------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------- |
| RLS en `games` y `scores`                | Ya activo en `games`, `scores` y `profiles`. La vista `leaderboard` usa `security_invoker`.                                                            | Solo verificar                |
| Contraseña de mínimo 8 caracteres        | Ya fijada en el panel por el SPEC 18.                                                                                                                  | Solo verificar                |
| Leaked password protection               | Desactivada. Solo existe en el plan Pro de Supabase, y el proyecto está en Free.                                                                       | Riesgo aceptado y documentado |
| Max signup rate                          | Valor por defecto del panel (30 cada 5 min por IP).                                                                                                    | Bajar a 15 cada 5 min         |
| Headers de seguridad en Next.js          | `next.config.ts` vacío: no se envía ningún header y sí `X-Powered-By: Next.js`.                                                                        | Agregar headers               |
| Warnings 0028 y 0029 (`rls_auto_enable`) | `anon` y `authenticated` pueden ejecutar `public.rls_auto_enable()`, la función `security definer` del event trigger `ensure_rls`, por `/rest/v1/rpc`. | Revocar `EXECUTE`             |

Además, `anon` y `authenticated` conservan los permisos que Supabase da por defecto a cada tabla: `TRUNCATE`, `UPDATE`, `DELETE`, `TRIGGER` y `REFERENCES` en `games`, `scores`, `profiles` y `leaderboard`, más `INSERT` en `games` y `leaderboard`. Hoy RLS frena el `UPDATE`, el `DELETE` y el `INSERT`, pero RLS no se aplica a `TRUNCATE`. PostgREST no expone `TRUNCATE`, así que no es explotable por la API: se revoca como defensa en profundidad. La app solo hace `select` y los dos `insert` por columna del SPEC 18.

## Alcance

**Incluye:**

- **Headers de seguridad** en `next.config.ts` para todas las rutas: `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy` y `Permissions-Policy`.
- **`poweredByHeader: false`**, para que las respuestas no anuncien `X-Powered-By: Next.js`.
- **Migración `revoke_rls_auto_enable_execute`:** quita `EXECUTE` de `public.rls_auto_enable()` a `public`, `anon` y `authenticated`. El event trigger `ensure_rls` sigue activando RLS en las tablas nuevas.
- **Migración `harden_public_grants`:** deja a `anon` y `authenticated` solo con `SELECT` en las cuatro relaciones de `public`, más los `INSERT` por columna del SPEC 18.
- **Límite de sign-ups y sign-ins** en el panel de Supabase: 15 peticiones cada 5 minutos por IP (paso manual).
- **Verificación** de RLS y de la contraseña mínima de 8 caracteres, sin cambiarlos.
- **Leaked password protection** documentada como riesgo aceptado mientras el proyecto esté en el plan Free.
- **Documentación:** `CLAUDE.md` y las casillas de `references/security/security-checklist.md`.

**Fuera de alcance (para futuros specs):**

- `Content-Security-Policy` (con nonce en `proxy.ts` o estática). Toca Supabase, OAuth, Resend, el canvas y los estilos inline.
- `Strict-Transport-Security`. Solo tiene efecto con HTTPS: va con el spec de despliegue.
- CAPTCHA (Cloudflare Turnstile u hCaptcha) en el registro y el inicio de sesión.
- Límite propio por IP del jugador dentro de las Server Actions.
- Activar leaked password protection (exige pasar al plan Pro).
- Cambiar `ALTER DEFAULT PRIVILEGES` para que las tablas futuras nazcan sin permisos de escritura.
- Antitrampas del ranking: topes por juego, firma de partidas o límite de envíos de puntuaciones.
- Confirmación de correo y SMTP propio.
- Tests automatizados.
- Modificar los specs 01 a 18.

## Archivos

```
next.config.ts                              (cambia) poweredByHeader: false y headers() con securityHeaders
CLAUDE.md                                   (cambia) SPEC 19 en «Proyecto», headers y permisos en «Notas del stack»
references/security/security-checklist.md   (cambia) casillas marcadas y nota de leaked password protection
```

Base de datos (proyecto `xanuntuhanyubcqiudlp`, aplicada con `apply_migration` del MCP de Supabase): migraciones `revoke_rls_auto_enable_execute` y `harden_public_grants`. No cambia el esquema, así que `lib/supabase/database.types.ts` no se regenera.

Convenciones:

- No hay variables de entorno nuevas.
- No cambian `proxy.ts`, los clientes de `lib/supabase/` ni ningún componente. El proxy sigue solo refrescando la sesión (ver «Headers y proxy»).
- Se mantienen las convenciones del SPEC 01: código en inglés y comentarios en español latinoamericano.

## Configuración del proyecto de Supabase (manual)

El MCP de Supabase no configura Auth, así que el paso 1 del plan lo hace el usuario en el panel:

| Dónde                                                   | Qué                                                                                                                             |
| ------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| Supabase → Authentication → Rate Limits                 | «Rate limit for sign ups and sign ins»: **15** peticiones cada 5 minutos por IP. Guardar.                                       |
| Supabase → Authentication → Sign In / Providers → Email | Confirmar que la longitud mínima de contraseña sigue en **8** (no se cambia).                                                   |
| Supabase → Authentication → Sign In / Providers → Email | Confirmar que «Prevent use of leaked passwords» no está disponible en el plan Free. Si el toggle aparece habilitado, se activa. |

## Modelo de datos

Este spec no agrega tablas, columnas ni estructuras de la app. Solo cambia permisos y la configuración de Next.

### Headers — `next.config.ts`

```ts
const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), browsing-topics=()",
  },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  headers: async () => [{ source: "/(.*)", headers: securityHeaders }],
};
```

- `source: "/(.*)"` cubre todas las rutas, incluidos `/`, `/api/health`, la 404 y los assets de `public/` y `_next/static`.
- `X-Frame-Options: DENY`: nada embebe la app en un `iframe`, y OAuth y la recuperación de contraseña funcionan con redirecciones.
- `Permissions-Policy` apaga la cámara, el micrófono, la geolocalización y la Topics API, que la app no usa. No restringe `autoplay` (el sonido de Arkanoid) ni `fullscreen`.
- `strict-origin-when-cross-origin` es el valor por defecto de los navegadores modernos: fijarlo garantiza que las URLs con `?next=` o `?code=` no se filtren completas a otros dominios.

### Headers y proxy

Referencia: [Proxy](https://nextjs.org/docs/app/getting-started/proxy), con su copia local en `node_modules/next/dist/docs/01-app/01-getting-started/16-proxy.md`, y la sección «Execution order» de `node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/proxy.md`.

- **Orden de ejecución.** Next aplica primero los `headers` de `next.config.ts` y después corre el proxy. Por eso los headers de seguridad llegan también a las rutas que el `matcher` de `proxy.ts` excluye (`_next/static`, `_next/image`, `favicon.ico` e imágenes `.svg`, `.png`, `.jpg`, `.jpeg`, `.gif` y `.webp`). Si vivieran en el proxy, esas respuestas saldrían sin ellos.
- **Respuesta del proxy.** `updateSession` crea un `NextResponse.next({ request })` nuevo cuando Supabase reescribe las cookies de sesión, y solo agrega `Set-Cookie` y las cabeceras anti-caché de `@supabase/ssr`. No define ninguno de los cuatro headers de seguridad, así que no los pisa.
- **El proxy no es la barrera de seguridad.** La documentación avisa que el proxy no debe usarse como solución completa de sesión ni de autorización. Además, las Server Functions no son rutas propias: llegan como `POST` a la página donde se usan, y un cambio en el `matcher` les quita el proxy sin avisar. Por eso la seguridad de este spec vive en la base (RLS y permisos) y en las Server Actions, que ya validan su entrada y la sesión desde el SPEC 18. El proxy sigue sin redirigir ni autorizar.
- **CSP con nonce.** Es el único header de seguridad que sí tendría que generarse en el proxy, un nonce por petición. Queda fuera de alcance.

### Función del event trigger — migración `revoke_rls_auto_enable_execute`

```sql
-- La función solo debe correr desde el event trigger ensure_rls, nunca por /rest/v1/rpc
revoke execute on function public.rls_auto_enable() from public, anon, authenticated;
```

- PostgreSQL no comprueba `EXECUTE` al disparar un event trigger, así que `ensure_rls` sigue funcionando.
- Se queda `security definer`: la necesita para activar RLS en tablas de otros dueños.
- Se queda en `public`: la creó el panel de Supabase («Enable automatic RLS»), y moverla podría romper ese ajuste.

### Permisos de tabla — migración `harden_public_grants`

```sql
-- Mínimo privilegio: la app solo lee y hace los dos insert por columna del SPEC 18
revoke update, delete, truncate, trigger, references
  on public.games, public.scores, public.profiles
  from anon, authenticated;

revoke insert, update, delete, truncate, trigger, references
  on public.games, public.leaderboard
  from anon, authenticated;
```

Permisos que quedan para `anon` y `authenticated`:

| Relación      | `anon`   | `authenticated`                     |
| ------------- | -------- | ----------------------------------- |
| `games`       | `SELECT` | `SELECT`                            |
| `leaderboard` | `SELECT` | `SELECT`                            |
| `profiles`    | `SELECT` | `SELECT`, `INSERT (id, alias)`      |
| `scores`      | `SELECT` | `SELECT`, `INSERT (game_id, score)` |

- **No** se revoca `INSERT` a nivel de tabla en `profiles` ni en `scores`. En PostgreSQL, revocar un permiso de tabla también revoca el mismo permiso en todas sus columnas, y eso borraría los `GRANT INSERT (…)` del SPEC 18. Esas tablas ya no tienen `INSERT` de tabla desde ese spec.
- Las políticas RLS no cambian.
- `service_role` y `postgres` no se tocan: el panel y el MCP siguen pudiendo escribir.
- Las secuencias no se tocan.

## Plan de implementación

1. **Configuración de Supabase (manual, la hace el usuario).** Aplicar la tabla de «Configuración del proyecto de Supabase». Verificación: Authentication → Rate Limits muestra 15 para sign-ups y sign-ins, y la contraseña mínima sigue en 8. La app no cambia.
2. **Headers de seguridad.** Agregar `securityHeaders`, `headers()` y `poweredByHeader: false` a `next.config.ts`. Verificación: con `npm run dev`, `curl -sI http://localhost:3000/`, `curl -sI http://localhost:3000/api/health`, `curl -sI http://localhost:3000/no-existe` y `curl -sI http://localhost:3000/arcade/arkanoid/spritesheet-breakout.png` (excluido por el `matcher` del proxy) muestran los cuatro headers y ninguno trae `X-Powered-By`. El Home, un juego y el login con GitHub siguen funcionando.
3. **Función del event trigger.** Aplicar `revoke_rls_auto_enable_execute`. Verificación con `execute_sql`: `has_function_privilege('anon', 'public.rls_auto_enable()', 'EXECUTE')` y lo mismo con `authenticated` dan `false`. Dentro de una transacción con `rollback`, crear `public.rls_probe (id int)` y comprobar que nace con `relrowsecurity = true`. `get_advisors` (security) ya no reporta los lints 0028 ni 0029.
4. **Permisos de tabla.** Aplicar `harden_public_grants`. Verificación con `execute_sql`: `information_schema.role_table_grants` y `column_privileges` coinciden con la tabla de permisos que quedan. Con la app, el Home, la Biblioteca, el Detalle y el Salón de la Fama cargan, una cuenta con alias guarda una partida de SNAKE y una cuenta nueva de Google o GitHub elige su alias en `/onboarding`.
5. **Documentación.** Actualizar `CLAUDE.md`: el párrafo de «Proyecto» (SPEC 19), `next.config.ts` con los headers y los permisos de las tablas en «Notas del stack», y el límite de 15 sign-ups y sign-ins en la sección de autenticación. Marcar las casillas de `references/security/security-checklist.md` y dejar en «Leaked password protection» la nota de riesgo aceptado por el plan Free. Verificación: `npm run format:check` pasa.

## Criterios de aceptación

**Headers de Next.js**

- [ ] `GET /` responde con `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy: strict-origin-when-cross-origin` y `Permissions-Policy: camera=(), microphone=(), geolocation=(), browsing-topics=()`.
- [ ] `GET /api/health`, `GET /games/snake/play`, una URL inexistente (404) y `GET /arcade/arkanoid/ball-bounce.mp3` traen los mismos cuatro headers.
- [ ] Las rutas que el `matcher` de `proxy.ts` excluye también los traen: `GET /arcade/arkanoid/spritesheet-breakout.png` y un archivo de `/_next/static/`.
- [ ] Con sesión iniciada, una respuesta en la que el proxy escribe `Set-Cookie` (por ejemplo, el primer `GET /` tras iniciar sesión) trae los cuatro headers.
- [ ] La redirección de `GET /auth/callback` sin `code` (a `/login?error=oauth`) trae los cuatro headers.
- [ ] `proxy.ts` y `lib/supabase/proxy.ts` no cambian.
- [ ] Ninguna de esas respuestas trae `X-Powered-By`.
- [ ] Con `npm run build && npm run start`, `GET /` trae los mismos headers y no trae `X-Powered-By`.
- [ ] Una página HTML local con `<iframe src="http://localhost:3000/">` no muestra la app (el navegador la bloquea).
- [ ] El login con correo, el login con GitHub, la recuperación de contraseña, el formulario de contacto y el sonido de Arkanoid funcionan igual que antes.

**Base de datos**

- [ ] `relrowsecurity` es `true` en `games`, `scores` y `profiles`, y `leaderboard` tiene `security_invoker = true`.
- [ ] `anon` y `authenticated` no tienen `EXECUTE` sobre `public.rls_auto_enable()`, y `POST /rest/v1/rpc/rls_auto_enable` con la clave publicable falla.
- [ ] Una tabla nueva creada en `public` nace con RLS activo.
- [ ] `anon` y `authenticated` solo tienen `SELECT` a nivel de tabla en `games`, `scores`, `profiles` y `leaderboard`.
- [ ] `authenticated` conserva `INSERT` en las columnas `id` y `alias` de `profiles`, y en `game_id` y `score` de `scores`. `anon` no tiene `INSERT` en ninguna columna.
- [ ] Con la clave publicable, un `PATCH` o un `DELETE` sobre `games`, `scores` o `profiles` responde con error de permisos.
- [ ] Una cuenta con alias guarda una puntuación y aparece en el Detalle del juego.
- [ ] Una cuenta sin alias guarda su alias en `/onboarding`.
- [ ] `get_advisors` (security) solo reporta `auth_leaked_password_protection`.

**Auth**

- [ ] Authentication → Rate Limits muestra 15 sign-ups y sign-ins cada 5 minutos.
- [ ] `POST /auth/v1/signup` con la clave publicable y una contraseña de 7 caracteres responde con el error `weak_password` y no crea ninguna fila en `auth.users`.
- [ ] Al superar el límite, ENTRAR muestra «Demasiados intentos. Espera unos minutos e intenta de nuevo.» (prueba opcional: bloquea los inicios de sesión durante 5 minutos).

**Documentación y build**

- [ ] `CLAUDE.md` menciona el SPEC 19, los headers de `next.config.ts`, los permisos mínimos y el límite de 15.
- [ ] `references/security/security-checklist.md` tiene marcadas las cuatro casillas resueltas y la nota del plan Free en la de leaked password protection.
- [ ] `npm run build`, `npm run lint`, `npx tsc --noEmit` y `npm run format:check` pasan.

## Decisiones

- **Sí:** los tres headers del checklist más `Permissions-Policy` y `poweredByHeader: false`. Lo eligió el usuario. Son seguros para la app: no dependen de dominios externos ni cambian el comportamiento.
- **Sí:** `X-Frame-Options: DENY` y no `SAMEORIGIN`. La app no se embebe a sí misma en ningún `iframe`.
- **No:** `Content-Security-Policy` en este spec. Exige listar Supabase, los proveedores OAuth y las fuentes, decidir sobre los estilos inline y quizá nonces en `proxy.ts`. Va en su propio spec.
- **No:** `Strict-Transport-Security` todavía. Los navegadores lo ignoran por HTTP, y en `localhost` no aporta nada. Va con el spec de despliegue.
- **Sí:** headers en `next.config.ts` y no en `proxy.ts`. Lo propone el checklist, y según el orden de ejecución de Next los `headers` del config se aplican antes del proxy, así que también llegan a los assets que el `matcher` excluye. Además mantiene `proxy.ts` limitado a refrescar la sesión.
- **No:** headers de seguridad con `response.headers.set` en `updateSession`. Habría que repetirlos en cada `NextResponse.next()` que crea, y no cubrirían las rutas excluidas por el `matcher`.
- **No:** ampliar el `matcher` del proxy para cubrir los assets. Haría correr `getClaims` en cada imagen y archivo de `_next/static` sin ninguna ganancia.
- **Sí:** la seguridad no depende del proxy. Lo recomienda la documentación de Proxy: no es una solución de autorización, y las Server Functions pueden quedar fuera de su `matcher` sin aviso. RLS, los permisos y la validación dentro de cada Server Action son la barrera.
- **Sí:** quitar `EXECUTE` de `rls_auto_enable()` sin pasarla a `security invoker` ni moverla de esquema. Es el arreglo mínimo que proponen los lints 0028 y 0029, y no rompe el event trigger `ensure_rls` ni el ajuste del panel.
- **Sí:** mínimo privilegio en las tablas actuales. Lo eligió el usuario. RLS ya protegía las escrituras, pero no aplica a `TRUNCATE`, y un permiso que nadie usa no debe existir.
- **No:** revocar `INSERT` a nivel de tabla en `profiles` y `scores`. Revocaría también los `GRANT INSERT` por columna del SPEC 18.
- **No:** cambiar `ALTER DEFAULT PRIVILEGES`. Lo eligió el usuario. Las tablas futuras siguen naciendo con RLS gracias a `ensure_rls`, y cada spec que cree una tabla revoca lo que no use.
- **Sí:** límite de 15 sign-ups y sign-ins cada 5 minutos en el panel. Lo eligió el usuario. Frena una ráfaga de bots y sobra para el tráfico actual.
- **No:** límite propio por IP en las Server Actions. Un contador en memoria se reinicia con cada arranque y no se comparte entre instancias.
- **No:** CAPTCHA en este spec. Agrega un script externo, una variable de entorno secreta y UI. Va en su propio spec si aparecen bots.
- **Sí:** leaked password protection queda como riesgo aceptado. El proyecto está en el plan Free y la función solo existe desde Pro. El warning del linter seguirá apareciendo.
- **Sí:** RLS y la contraseña mínima de 8 solo se verifican. Ya los dejaron listos los SPEC 06 y 18.

## Riesgos

| Riesgo                                                                                                                                                                                   | Mitigación                                                                                                                                                                                  |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| El correo y la contraseña pasan por Server Actions, así que Supabase ve la IP del servidor de Next y no la del jugador: el límite de 15 por IP funciona como un límite global de la app. | Con el tráfico actual (`localhost`, pocos jugadores) alcanza. La acción ya traduce `over_request_rate_limit` a «Demasiados intentos…». Al desplegar se revisa el valor o se pasa a CAPTCHA. |
| Contraseñas filtradas en HaveIBeenPwned se aceptan mientras el proyecto esté en Free.                                                                                                    | El mínimo de 8 caracteres sigue activo. Se activa si el proyecto pasa a Pro.                                                                                                                |
| Apagar y volver a encender «Enable automatic RLS» en el panel puede recrear `rls_auto_enable()` con `EXECUTE` para todos.                                                                | `get_advisors` (security) vuelve a mostrar los lints 0028 y 0029. Se reaplica la migración `revoke_rls_auto_enable_execute`.                                                                |
| Un spec futuro que necesite `UPDATE` o `DELETE` (por ejemplo, la página de perfil) fallará por permisos aunque escriba la política RLS.                                                  | Ese spec debe incluir su propio `GRANT`. Queda dicho en «Notas del stack» de `CLAUDE.md`.                                                                                                   |
| Las tablas futuras nacen con todos los permisos por defecto de Supabase.                                                                                                                 | `ensure_rls` les activa RLS al crearlas, y cada spec revoca lo que no use, como `harden_public_grants`.                                                                                     |

## Lo que **no** entra en este spec

- `Content-Security-Policy` y `Strict-Transport-Security`.
- CAPTCHA y límite propio por IP.
- Leaked password protection (plan Pro).
- Cambios en `ALTER DEFAULT PRIVILEGES`.
- Antitrampas del ranking.
- Confirmación de correo y SMTP propio.
- Tests automatizados.
- Cambios en los specs 01 a 18.

Si alguna de estas llega, va en su propio spec.
