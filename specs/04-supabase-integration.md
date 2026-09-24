# SPEC 04 — Integración base con Supabase

> **Estado:** Aprobado
> **Depende de:** SPEC 03
> **Fecha:** 2026-09-24
> **Objetivo:** Conectar la app de Next.js al proyecto de Supabase con clientes de navegador y servidor, un `proxy.ts` que refresca la sesión y una sonda `/api/health`, sin cambiar ninguna funcionalidad visible.

## Por qué existe este spec

Hoy todo el estado del jugador (sesión y puntuaciones) está simulado en `localStorage`, y el único código de servidor es el envío del formulario de contacto (SPEC 03). Los próximos specs van a mover la autenticación y el ranking a Supabase.

Este spec prepara esa base: instala los paquetes, define las variables de entorno y crea los clientes y el refresco de sesión que siguen el patrón oficial de `@supabase/ssr` para App Router. No crea tablas ni toca el login simulado. Al terminar, la app se ve y se comporta igual que antes, y existe una forma verificable de comprobar que el servidor alcanza a Supabase.

El proyecto de Supabase ya existe (`project_ref` `xanuntuhanyubcqiudlp`, conectado por MCP en `.mcp.json`) y su esquema `public` está vacío.

## Alcance

**Incluye:**

- **Dependencias:** `@supabase/supabase-js` y `@supabase/ssr` en `dependencies`.
- **Variables de entorno** `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, documentadas en `.env.example` y cargadas en `.env`.
- **Limpieza de `.env.example`:** se quita `SUPABASE_PASSWORD`, que la app no usa.
- **Lectura de variables** centralizada en `lib/supabase/env.ts`, que devuelve `null` si falta alguna en lugar de lanzar.
- **Cliente de navegador** en `lib/supabase/client.ts` (`createBrowserClient`).
- **Cliente de servidor** en `lib/supabase/server.ts` (`createServerClient` con `cookies()` de `next/headers`), para Server Components, Server Actions y Route Handlers.
- **Refresco de sesión** en `lib/supabase/proxy.ts` (`updateSession`) y un `proxy.ts` en la raíz que lo invoca en todas las rutas excepto los assets estáticos.
- **Modo degradado:** sin variables de Supabase, el proxy deja pasar la petición sin tocarla y el resto de la app funciona igual que hoy.
- **Sonda `GET /api/health`** (`app/api/health/route.ts`) que consulta el endpoint de salud de Auth de Supabase desde el servidor y responde el estado en JSON.
- **Documentación:** actualizar `CLAUDE.md` (estructura, rutas, variables de entorno, notas del stack y la frase sobre el código de servidor).

**Fuera de alcance (para futuros specs):**

- Autenticación real con Supabase Auth: el siguiente spec (SPEC 05) reemplaza el login y el registro simulados por email y contraseña.
- Google OAuth, GitHub OAuth e inicio de sesión anónimo de Supabase.
- Tablas, políticas RLS y migraciones. Los specs futuros las aplican con el MCP de Supabase sobre el proyecto remoto.
- Tipos de TypeScript generados desde el esquema (`database.types.ts`): no hay tablas que tipar.
- Ranking global y puntuaciones en la base de datos.
- Guardar los mensajes de contacto en la base de datos.
- Guardas de rutas o redirecciones según la sesión.
- Clave secreta (`SUPABASE_SECRET_KEY`) y cualquier cliente con privilegios de administrador.
- Carpeta `supabase/` y la Supabase CLI.
- Cambios en `lib/session.ts`, `lib/storage.ts`, `lib/local-scores.ts` o `components/auth/`.
- Modificar `specs/01-mvp-visual.md`, `specs/02-home-landing.md` o `specs/03-about-contact.md`.

## Rutas y archivos

```
app/
  api/health/route.ts           (nuevo) Route Handler GET: estado de la conexión con Supabase
lib/
  supabase/env.ts               (nuevo) readSupabaseEnv: URL y clave publicable, o null
  supabase/client.ts            (nuevo) createClient para Client Components
  supabase/server.ts            (nuevo) createClient async para código de servidor
  supabase/proxy.ts             (nuevo) updateSession: refresca la sesión en el proxy
proxy.ts                        (nuevo) proxy de Next 16 que llama a updateSession
.env.example                    (cambia) + 2 variables de Supabase, − SUPABASE_PASSWORD
.env                            (cambia, no versionado) valores reales de las 2 variables
package.json / package-lock.json (cambia) @supabase/supabase-js y @supabase/ssr
CLAUDE.md                       (cambia) sección «Proyecto» y «Notas del stack»
```

Convenciones:

- `lib/supabase/client.ts` no declara `"use client"`: es un módulo sin JSX que solo importan componentes cliente. No debe importar nada de `next/headers`.
- `lib/supabase/server.ts` importa `next/headers`, así que solo lo usan Server Components, Server Actions y Route Handlers.
- `lib/supabase/proxy.ts` solo lo importa `proxy.ts`.
- Los clientes se crean dentro de cada función (`createClient()`), nunca a nivel de módulo, igual que `new Resend()` en el SPEC 03.
- Se mantienen las convenciones del SPEC 01: código en inglés, comentarios en español latinoamericano y módulos sin JSX en kebab-case.

## Modelo de datos

Este spec no crea tablas ni claves nuevas de `localStorage`. Las estructuras nuevas son de configuración y de respuesta.

### Variables de entorno

| Variable                               | Obligatoria | Uso                                                                                                     |
| -------------------------------------- | ----------- | ------------------------------------------------------------------------------------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`             | Sí\*        | URL del proyecto (`https://xanuntuhanyubcqiudlp.supabase.co`). Se usa en el navegador y en el servidor. |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Sí\*        | Clave publicable (`sb_publishable_…`). Es pública por diseño: la protección de datos la darán las RLS.  |

\* Sin ellas la app funciona igual que hoy, pero `/api/health` responde `config`.

Las dos llevan el prefijo `NEXT_PUBLIC_` a propósito: Next las incluye en el bundle del cliente, que es donde las necesita `createBrowserClient`. Se leen siempre con el nombre literal (`process.env.NEXT_PUBLIC_SUPABASE_URL`), porque Next solo reemplaza accesos literales.

`SUPABASE_PASSWORD` (contraseña de Postgres) sale de `.env.example`. Ningún archivo de `app/`, `lib/`, `components/` ni `proxy.ts` la lee.

### Lectura de variables — `lib/supabase/env.ts`

```ts
export interface SupabaseEnv {
  url: string;
  publishableKey: string;
}

// Devuelve null si falta alguna de las dos variables (o está vacía después de trim)
export function readSupabaseEnv(): SupabaseEnv | null;
```

### Clientes — `lib/supabase/client.ts` y `lib/supabase/server.ts`

```ts
// client.ts: lanza un Error con el nombre de las variables faltantes si readSupabaseEnv() es null
export function createClient(): SupabaseClient;

// server.ts: usa await cookies(); lanza igual que el de navegador si faltan variables
export async function createClient(): Promise<SupabaseClient>;
```

- En `server.ts`, `setAll` escribe las cookies dentro de un `try/catch` vacío con un comentario: desde un Server Component no se pueden escribir cookies, y el refresco real lo hace el proxy.
- Ningún código de este spec llama todavía a estos dos clientes fuera de su propia definición: quedan listos para el SPEC 05.

### Refresco de sesión — `lib/supabase/proxy.ts`

```ts
export async function updateSession(
  request: NextRequest,
): Promise<NextResponse>;
```

1. Si `readSupabaseEnv()` es `null` → devuelve `NextResponse.next({ request })` sin hacer nada más.
2. Si no, crea un `createServerClient` cuyos `getAll`/`setAll` leen las cookies de `request` y las escriben tanto en `request` como en la respuesta, siguiendo la guía oficial de `@supabase/ssr` para Next.js.
3. Llama al método de `supabase.auth` que valida y refresca la sesión (`getClaims()` en la versión actual del SDK; se confirma en los tipos de `node_modules/@supabase/supabase-js` al implementar).
4. Devuelve la respuesta con las cookies actualizadas. No redirige nunca: las guardas de rutas quedan fuera de alcance.

Sin cookie de sesión (el caso de todos los visitantes hoy), el paso 3 no hace ninguna petición de red.

### Proxy — `proxy.ts`

- Exporta `async function proxy(request: NextRequest)` que devuelve `updateSession(request)`.
- `config.matcher` excluye `_next/static`, `_next/image`, `favicon.ico` y archivos de imagen (`svg`, `png`, `jpg`, `jpeg`, `gif`, `webp`).
- No declara `runtime`: en Next 16 el proxy corre en Node.js y la opción `runtime` lanza un error.

### Sonda — `app/api/health/route.ts`

```ts
type HealthResponse =
  | { status: "ok"; supabase: "ok" } // HTTP 200
  | { status: "error"; supabase: "config" | "unreachable" }; // HTTP 503
```

| `supabase`    | Cuándo                                                                                                  |
| ------------- | ------------------------------------------------------------------------------------------------------- |
| `ok`          | `GET {url}/auth/v1/health` con la cabecera `apikey` respondió 2xx.                                      |
| `config`      | `readSupabaseEnv()` devolvió `null`.                                                                    |
| `unreachable` | La petición respondió no-2xx, lanzó una excepción o no respondió en 5 segundos (`AbortSignal.timeout`). |

- La respuesta no incluye la URL, la clave ni detalles del error. En los casos de error se hace `console.error` con el código y, si existe, el mensaje o el status HTTP.
- La respuesta se calcula en cada petición: no se prerenderiza en el build ni se cachea.

## Plan de implementación

Cada paso deja la app compilando (`npx tsc --noEmit`) y corriendo con `npm run dev`.

1. **Dependencias.** Correr `npm install @supabase/supabase-js @supabase/ssr`. Verificación: `npm ls @supabase/ssr @supabase/supabase-js` muestra ambas y `npm run build` pasa.
2. **Variables de entorno.** En `.env.example`, quitar `SUPABASE_PASSWORD` y agregar `NEXT_PUBLIC_SUPABASE_URL=` y `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=` vacías, con un comentario en español para cada una (de dónde sale el valor y que la clave publicable es pública por diseño). Obtener los valores reales con las herramientas `get_project_url` y `get_publishable_keys` del MCP de Supabase y agregarlos a `.env`. `SUPABASE_PASSWORD` se deja en `.env` si el usuario la tiene ahí. Verificación: `git status` no lista `.env`.
3. **Lectura de variables.** Crear `lib/supabase/env.ts` con `readSupabaseEnv` según el modelo de datos. Verificación: `npx tsc --noEmit` pasa.
4. **Clientes.** Antes de escribir, revisar los tipos de `node_modules/@supabase/ssr` para confirmar las firmas de `createBrowserClient`, `createServerClient` y de `cookies.getAll`/`setAll`. Crear `lib/supabase/client.ts` y `lib/supabase/server.ts` según el modelo de datos. Verificación: `npx tsc --noEmit` y `npm run lint` pasan.
5. **Refresco de sesión y proxy.** Leer `node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/proxy.md` (matcher y firma). Crear `lib/supabase/proxy.ts` con `updateSession` y `proxy.ts` en la raíz. Verificación: con `npm run dev`, `/`, `/games`, `/games/[id]`, `/login`, `/hall-of-fame` y `/about` cargan igual que antes, y la terminal no muestra errores del proxy.
6. **Sonda.** Leer la guía de Route Handlers en `node_modules/next/dist/docs/01-app/` para confirmar cómo evitar que un `GET` se prerenderice o cachee en Next 16. Crear `app/api/health/route.ts` según el modelo de datos. Verificación: `curl -i http://localhost:3000/api/health` responde `200` con `{"status":"ok","supabase":"ok"}`.
7. **Modo degradado.** Sin editar código: renombrar temporalmente las dos variables en `.env` y reiniciar `npm run dev`. Verificación: `/api/health` responde `503` con `supabase: "config"`, y todas las páginas cargan. Restaurar `.env`.
8. **Documentación.** Actualizar `CLAUDE.md`:
   - «Rutas»: agregar `/api/health`.
   - «Estructura»: agregar `lib/supabase/` con sus cuatro archivos, `proxy.ts` y `app/api/health/route.ts`.
   - «Variables de entorno»: agregar las dos variables de Supabase a la tabla y aclarar que las de Resend siguen siendo solo de la Server Action de contacto.
   - Ajustar la frase «El único código de servidor del proyecto es el envío del formulario de contacto» para incluir el proxy y la sonda.
   - «Notas del stack»: una línea sobre Supabase (`@supabase/ssr`, qué cliente usar en cada contexto, que en Next 16 el middleware se llama `proxy.ts`, y que las migraciones se aplican con el MCP de Supabase).

   Verificación: el texto describe el estado real del repo.

## Criterios de aceptación

**Generales**

- [ ] `npm run build` termina sin errores.
- [ ] `npm run lint` termina sin errores.
- [ ] `package.json` lista `@supabase/supabase-js` y `@supabase/ssr` en `dependencies`.
- [ ] `.env.example` contiene `NEXT_PUBLIC_SUPABASE_URL=` y `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=` sin valores, y no contiene `SUPABASE_PASSWORD`.
- [ ] `grep -rn "SUPABASE_PASSWORD" app lib components proxy.ts` no devuelve nada.
- [ ] `git check-ignore .env` imprime `.env`.
- [ ] Existen `lib/supabase/env.ts`, `lib/supabase/client.ts`, `lib/supabase/server.ts`, `lib/supabase/proxy.ts`, `proxy.ts` y `app/api/health/route.ts`.
- [ ] No existe ningún archivo `middleware.ts` en el repo.
- [ ] `lib/supabase/client.ts` no importa `next/headers`.

**Sin regresiones** (con `.env` completo)

- [ ] `/`, `/games`, `/games/[id]`, `/games/[id]/play`, `/login`, `/hall-of-fame` y `/about` se ven y se comportan igual que antes del spec.
- [ ] Al recorrer esas rutas, la consola del navegador no muestra errores ni advertencias de hidratación, y la terminal de `npm run dev` no muestra errores.
- [ ] El login simulado, el invitado y el guardado de puntuaciones siguen usando `e1230_user` y `e1230_scores` en `localStorage`.
- [ ] El formulario de contacto de `/about` sigue enviando el correo con Resend.
- [ ] Una visita a `/` sin sesión no crea cookies `sb-…` en el navegador.

**Sonda**

- [ ] Con `.env` completo, `curl -i http://localhost:3000/api/health` responde `200` y `{"status":"ok","supabase":"ok"}`.
- [ ] Con `NEXT_PUBLIC_SUPABASE_URL=https://noexiste.invalid` en `.env`, `/api/health` responde `503` y `{"status":"error","supabase":"unreachable"}` en menos de 10 segundos, y la terminal muestra el `console.error`.
- [ ] Sin las dos variables de Supabase en `.env`, `/api/health` responde `503` y `{"status":"error","supabase":"config"}`.
- [ ] Ninguna respuesta de `/api/health` contiene la URL del proyecto ni la clave publicable.
- [ ] Después de `npm run build` y `npm run start`, cambiar `.env` a una URL inválida y reiniciar `npm run start` hace que `/api/health` pase de `ok` a `unreachable` (la respuesta no quedó congelada en el build).

**Modo degradado**

- [ ] Sin las dos variables de Supabase en `.env`, todas las rutas de «Sin regresiones» cargan sin errores.

## Decisiones

- **Sí:** solo infraestructura en este spec. La autenticación real va en el SPEC 05 y el ranking global en otro. Así cada spec tiene un objetivo de una sola oración.
- **Sí:** email y contraseña como el método de auth del SPEC 05. Se eligió en la fase de preguntas y se anota aquí para no perderlo.
- **Sí:** `@supabase/ssr` con clientes separados de navegador y servidor. Es el patrón oficial para App Router y guarda la sesión en cookies, legibles desde el servidor.
- **No:** solo `@supabase/supabase-js` con `createClient` único. Guarda la sesión en `localStorage` y el servidor no la ve.
- **Sí:** `proxy.ts` con `updateSession` desde este spec. Deja resuelto el refresco de sesión antes de que exista auth, y sin cookie de sesión no hace peticiones de red.
- **No:** posponer el proxy al SPEC 05. Separaría la plomería de sesión de los clientes que la necesitan.
- **Sí:** `proxy.ts` y no `middleware.ts`. En Next 16 el middleware está deprecado y renombrado a proxy.
- **Sí:** el proxy nunca redirige. Las guardas de rutas son una decisión de producto del spec de auth.
- **Sí:** modo degradado cuando faltan variables. El proxy corre en todas las rutas; si lanzara, un clon del repo sin `.env` no podría abrir ninguna página.
- **Sí:** clientes que lanzan si faltan variables. A diferencia del proxy, se llaman solo desde funcionalidades que dependen de Supabase, y un error claro con el nombre de la variable es mejor que un fallo opaco del SDK.
- **Sí:** sonda `GET /api/health` como verificación permanente. Sin tablas no hay otra consulta con la que probar la conexión, y sirve después para monitorear el despliegue.
- **No:** página `/dev/supabase` visible en desarrollo. Agrega UI que luego hay que esconder o borrar.
- **Sí:** la sonda consulta `{url}/auth/v1/health` con `fetch` y la cabecera `apikey`. Comprueba a la vez que la URL alcanza el proyecto y que la clave es aceptada, sin depender de ninguna tabla.
- **No:** usar el cliente de Supabase en la sonda. Sin sesión ni tablas, sus métodos no hacen una petición real que confirme la conexión.
- **Sí:** timeout de 5 segundos en la sonda. Una sonda que cuelga no sirve para diagnosticar.
- **Sí:** solo `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`. Son las dos que necesitan los clientes y el proxy.
- **Sí:** clave publicable (`sb_publishable_…`) y no la clave `anon` antigua. Es el formato actual de Supabase y se puede rotar sin cortar sesiones.
- **No:** `SUPABASE_SECRET_KEY`. Nada la usaría hoy, y una clave con privilegios de administrador sin uso es solo superficie de riesgo.
- **Sí:** quitar `SUPABASE_PASSWORD` de `.env.example`. La app de Next no se conecta directo a Postgres; documentarla sugiere que hace falta.
- **Sí:** las migraciones de los specs futuros se aplican con el MCP de Supabase sobre el proyecto remoto, sin carpeta `supabase/` en el repo. Lo eligió el usuario.
- **No:** Supabase CLI y `supabase/migrations/`. Descartado por el usuario.
- **No:** generar `database.types.ts` en este spec. No hay tablas; se genera en el primer spec que cree una.
- **Sí:** no tocar `lib/session.ts`, `lib/storage.ts`, `lib/local-scores.ts` ni `components/auth/`. El objetivo es cero cambios visibles.
- **Sí:** no modificar los specs 01, 02 y 03. Son el registro de lo implementado.

## Riesgos

| Riesgo                                                                                                   | Mitigación                                                                                                                 |
| -------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| El proxy corre en cada petición y agrega latencia a todas las páginas.                                   | Sin cookie de sesión no hay petición de red. El `matcher` excluye los assets estáticos.                                    |
| Un error en el proxy rompe todas las rutas de la app.                                                    | Modo degradado sin variables y criterios de «Sin regresiones» sobre todas las rutas.                                       |
| La API de `@supabase/ssr` o de `supabase.auth` cambió respecto de la guía conocida (p. ej. `getClaims`). | Los pasos 4 y 5 revisan los tipos en `node_modules` antes de escribir, y `npx tsc --noEmit` detecta diferencias.           |
| `/api/health` se prerenderiza en el build y responde siempre el estado de ese momento.                   | El paso 6 revisa la guía de Route Handlers de Next 16, y hay un criterio que cambia `.env` después del build.              |
| La clave publicable queda visible en el bundle del cliente.                                              | Es pública por diseño. Sin tablas no hay datos expuestos; los specs que creen tablas deben activar RLS.                    |
| Se cachea en `fetch` la respuesta de la sonda y oculta una caída real.                                   | La petición a Supabase se hace con `cache: "no-store"`.                                                                    |
| El proyecto gratuito de Supabase se pausa por inactividad y la sonda responde `unreachable`.             | Es el comportamiento esperado de la sonda: ese es justo el caso que debe detectar. Se reactiva desde el panel de Supabase. |

## Lo que **no** entra en este spec

- Autenticación real (email y contraseña, OAuth o anónimo).
- Tablas, RLS, migraciones y tipos generados.
- Ranking global o puntuaciones en la base de datos.
- Guardar los mensajes de contacto.
- Guardas de rutas.
- Clave secreta y clientes de administrador.
- Carpeta `supabase/` y Supabase CLI.
- Cambios en la sesión simulada, el guardado local de puntuaciones o `components/auth/`.
- Cambios en los specs 01, 02 y 03.

Si alguna de estas llega, va en su propio spec.
