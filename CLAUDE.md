# CLAUDE.md

Este archivo le da contexto a Claude Code (claude.ai/code) al trabajar en este repositorio.

@AGENTS.md

## Proyecto

Arcade E1230 es una plataforma online para jugar y competir por la mayor cantidad de puntos. El MVP visual (spec `specs/01-mvp-visual.md`) ya está implementado: las cinco pantallas de `references/Arcade E1230.dc.html` están portadas a App Router con datos e interacciones simuladas y sin ningún juego real. El home de presentación (spec `specs/02-home-landing.md`) también está implementado: `/` pasó a ser una landing y la Biblioteca se movió a `/games`. La página «Acerca de» (spec `specs/03-about-contact.md`) también está implementada: agrega `/about` con un formulario de contacto que envía un correo real al equipo con Resend, la primera funcionalidad del proyecto que ejecuta código propio en el servidor. La integración base con Supabase (spec `specs/04-supabase-integration.md`) también está implementada: clientes de navegador y servidor, un `proxy.ts` que refresca la sesión y la sonda `/api/health`, sin cambios visibles en la app. El README y los specs están escritos en español, así que las nuevas specs también deben escribirse en español.

### Rutas

- `/` — Home de presentación: hero con siluetas flotantes, secciones ¿Por qué?, juegos disponibles, estadísticas, actividad en vivo, precios con FAQ y el cierre «¿Listo para jugar?».
- `/games` — Biblioteca: hero animado, buscador, chips de categoría y grilla de 8 tarjetas con tilt 3D.
- `/games/[id]` — Detalle del juego, con el ranking de mejores puntuaciones.
- `/games/[id]/play` — Reproductor: HUD, gabinete CRT, carga simulada, pausa y partida simulada con modal de fin de juego.
- `/login` — Autenticación simulada (usuario/contraseña, Google, GitHub, invitado). Acepta `?mode=register` para abrir directo en CREAR CUENTA.
- `/hall-of-fame` — Salón de la Fama con pestañas por juego y marca personal.
- `/about` — Página «Acerca de»: hero con misión y tarjetas destacadas, divisor de píxeles y formulario de contacto que envía un correo real al equipo con Resend.
- `/api/health` — Sonda de salud (Route Handler `GET`): consulta el endpoint de salud de Auth de Supabase y responde `200 {"status":"ok","supabase":"ok"}`, o `503` con `supabase: "config"` (faltan variables) o `"unreachable"` (Supabase no responde en 5 s o devuelve error).
- `app/not-found.tsx` — 404 temática para cualquier URL desconocida (incluidos ids de juego inexistentes).

### Estructura

- `components/layout/` — `BackgroundEffects`, `Navbar`, `MobileMenu`, `nav-links.ts`.
- `components/ui/` — `Logo`, `NeonButton`, `rank-styles.ts`.
- `components/home/` — `HomeHero`, `FloatingSilhouettes`, `SectionHeading`, `Reveal`, `FeatureGrid`, `FeatureIcon`, `GamesRail`, `MiniGameCard`, `StatsBand`, `LiveActivity`, `PricingSection`, `FinalCta`.
- `components/library/` — `LibraryHero`, `LibraryView`, `SearchBar`, `CategoryFilter`, `GameCard`.
- `components/game/` — `GameCover`, `PlayingAs`, `DetailLeaderboard`, `PlayerView`, `PlayerHud`, `CrtScreen`, `PixelLoader`, `GameOverModal`.
- `components/auth/` — `AuthCard`, `AuthField`.
- `components/hall-of-fame/` — `HallOfFameView`, `GameTabs`, `HallOfFameTable`.
- `components/about/` — `AboutHero`, `HighlightIcon`, `PixelDivider`, `ContactSection`, `ContactForm`, `ContactField`, `ContactTerminal`.
- `lib/` — `format.ts`, `games.ts`, `scores.ts`, `storage.ts`, `session.ts`, `local-scores.ts`, `activity.ts`, `contact.ts`, `contact-email.ts`.
- `lib/supabase/` — `env.ts` (`readSupabaseEnv`: URL y clave publicable, o `null`), `client.ts` (`createClient` para Client Components), `server.ts` (`createClient` async para Server Components, Server Actions y Route Handlers) y `proxy.ts` (`updateSession`, refresca la sesión).
- `proxy.ts` — Proxy de Next 16 (antes `middleware.ts`): llama a `updateSession` en todas las rutas excepto assets estáticos e imágenes. Nunca redirige.
- `app/about/actions.ts` — Server Action `sendContactMessage` que valida el mensaje de contacto y lo envía por Resend.
- `app/api/health/route.ts` — Sonda `GET /api/health` de la conexión con Supabase.

### Persistencia simulada (localStorage)

- `e1230_user` — sesión simulada (`SessionUser`): login, registro, Google, GitHub e invitado.
- `e1230_scores` — puntuaciones locales por juego, mezcladas con los rankings mock deterministas de `lib/scores.ts`.

Autenticación real, backend y ranking global en servidor quedan fuera de este spec; ver la sección «Fuera de alcance» de `specs/01-mvp-visual.md`. El código de servidor del proyecto es el envío del formulario de contacto (`app/about/actions.ts`), el proxy de sesión de Supabase (`proxy.ts`) y la sonda `/api/health`. Supabase todavía no guarda datos de la app: la sesión y las puntuaciones siguen simuladas en `localStorage`.

### Variables de entorno

Se definen en `.env` (no versionado), documentadas sin valores en `.env.example`.

| Variable                               | Obligatoria | Uso                                                                                                                  |
| -------------------------------------- | ----------- | -------------------------------------------------------------------------------------------------------------------- |
| `RESEND_API_KEY`                       | Sí          | Clave de API de Resend. Solo se lee dentro de la Server Action de contacto.                                          |
| `CONTACT_TO_EMAIL`                     | Sí          | Correo que recibe los mensajes. En el entorno del usuario: su correo de la cuenta de Resend.                         |
| `CONTACT_FROM_EMAIL`                   | No          | Remitente. Si falta, se usa `Arcade E1230 <onboarding@resend.dev>`.                                                  |
| `NEXT_PUBLIC_SUPABASE_URL`             | Sí\*        | URL del proyecto de Supabase (`https://xanuntuhanyubcqiudlp.supabase.co`). Se usa en el navegador y en el servidor.  |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Sí\*        | Clave publicable (`sb_publishable_…`). Es pública por diseño; la protección de los datos la darán las políticas RLS. |

\* Sin las variables de Supabase la app funciona igual (el proxy no hace nada), pero `/api/health` responde `config` y los clientes de `lib/supabase/` lanzan un error. Las variables de Resend siguen siendo solo de la Server Action de contacto. `SUPABASE_PASSWORD` (contraseña de Postgres) no la usa la app.

Las variables `NEXT_PUBLIC_*` se incrustan durante `next build`, también en el código de servidor. En `npm run dev` se leen de `.env` en cada arranque, pero en un build de producción quedan fijas: cambiarlas exige volver a correr `npm run build`.

Con el remitente por defecto (`onboarding@resend.dev`), Resend solo permite enviar al correo de la cuenta de Resend: mientras no haya un dominio propio verificado, `CONTACT_TO_EMAIL` debe ser ese mismo correo.

## Comandos

- `npm run dev`: servidor de desarrollo en http://localhost:3000
- `npm run build`: build de producción (también hace type-check)
- `npm run lint`: ESLint (config flat en `eslint.config.mjs`, extiende `eslint-config-next` core-web-vitals y typescript)
- `npx tsc --noEmit`: solo type-check
- `npm run format`: formatea todo el repo con Prettier (`npm run format:check` solo verifica)

Todavía no hay un framework de tests configurado.

### Formato automático (hook de Claude Code)

`.claude/settings.json` registra un hook `PostToolUse` (Write/Edit) que ejecuta `.claude/hooks/format-and-lint.sh` sobre cada archivo creado o modificado: Prettier (`.prettierrc.json`, con `prettier-plugin-tailwindcss` para ordenar clases) sobre cualquier tipo que soporte, y `eslint --fix` en archivos JS/TS. Si ESLint deja errores sin corregir, el hook sale con código 2 y Claude recibe el mensaje para arreglarlos. Lo que está en `.prettierignore` (p. ej. `references/`) no se toca.

## Notas del stack

- **Next.js 16.3 y React 19.2, App Router** (`app/`). Como dice AGENTS.md, las APIs difieren de versiones anteriores de Next.js. Revisa `node_modules/next/dist/docs/` antes de usar una API de Next de la que no estés seguro. Por ejemplo, el layout usa el tipo global `LayoutProps<"/">`, que Next genera automáticamente.
- **Tailwind CSS v4** a través de `@tailwindcss/postcss`. No hay `tailwind.config.*`. Los tokens del tema se declaran con `@theme inline` en `app/globals.css`, y los colores claro/oscuro son variables CSS en `:root`.
- **Supabase** con `@supabase/ssr` y `@supabase/supabase-js` (proyecto `xanuntuhanyubcqiudlp`, conectado por MCP en `.mcp.json`). La sesión vive en cookies. Usa `createClient` de `lib/supabase/client.ts` en Client Components y el de `lib/supabase/server.ts` (async) en Server Components, Server Actions y Route Handlers; nunca compartas un cliente entre peticiones. En Next 16 el middleware se llama `proxy.ts`. Las tablas, RLS y migraciones se aplican con el MCP de Supabase sobre el proyecto remoto (no hay carpeta `supabase/` ni Supabase CLI), y los tipos (`database.types.ts`) se generan en el primer spec que cree una tabla.
- TypeScript está en modo estricto. El alias de rutas `@/*` apunta a la raíz del repo.
- Las fuentes son Courier Prime (cuerpo, `font-sans`/`font-mono`) y Press Start 2P (títulos pixelados, `font-pixel`), cargadas con `next/font/google` en el layout raíz. El tema neón (colores, glows, animaciones) sale de `references/Arcade E1230.dc.html` y vive en `app/globals.css`.

## Workflow: Spec Driven Design

Las funcionalidades siguen el método spec-driven de [Klerith/fernando-skills](https://github.com/Klerith/fernando-skills). Los skills están instalados en `.agents/skills/` (y quedan registrados en `skills-lock.json`):

- `/spec <descripción>`: hace preguntas de aclaración y luego escribe `specs/NN-slug.md` con el estado en Borrador (Draft). Crea `specs/.spec-config.yml` si el archivo no existe. Nunca escribe código.
- `/spec-impl NN-slug`: solo corre cuando el estado del spec es Aprobado (Approved). Crea y cambia a una rama `spec-NN-slug` (controlado por `AutoCreateBranch` en `specs/.spec-config.yml`), luego implementa el plan paso a paso y se detiene para que el usuario revise cada diff. Nunca hace commit automáticamente.

No implementes funcionalidades grandes sin un spec aprobado en `specs/`. El usuario también instaló el skill `frontend-design` de Anthropic para trabajo de UI.

## Idiomas

- El codigo que se implemente en el proyecto debe estar en inglés
- Los comentarios del codigo deben ser español latinoamericano
- Las respuestas por la consola claude son en español

## Detalles adicionales

- Cuando se utilice el mcp playwright, este debe guardar pantallazos en la carpeta .playwright-screenshots
