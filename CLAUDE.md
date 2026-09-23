# CLAUDE.md

Este archivo le da contexto a Claude Code (claude.ai/code) al trabajar en este repositorio.

@AGENTS.md

## Proyecto

Arcade E1230 es una plataforma online para jugar y competir por la mayor cantidad de puntos. El MVP visual (spec `specs/01-mvp-visual.md`) ya está implementado: las cinco pantallas de `references/Arcade E1230.dc.html` están portadas a App Router con datos e interacciones simuladas y sin ningún juego real. El home de presentación (spec `specs/02-home-landing.md`) también está implementado: `/` pasó a ser una landing y la Biblioteca se movió a `/games`. El README y los specs están escritos en español, así que las nuevas specs también deben escribirse en español.

### Rutas

- `/` — Home de presentación: hero con siluetas flotantes, secciones ¿Por qué?, juegos disponibles, estadísticas, actividad en vivo, precios con FAQ y el cierre «¿Listo para jugar?».
- `/games` — Biblioteca: hero animado, buscador, chips de categoría y grilla de 8 tarjetas con tilt 3D.
- `/games/[id]` — Detalle del juego, con el ranking de mejores puntuaciones.
- `/games/[id]/play` — Reproductor: HUD, gabinete CRT, carga simulada, pausa y partida simulada con modal de fin de juego.
- `/login` — Autenticación simulada (usuario/contraseña, Google, GitHub, invitado). Acepta `?mode=register` para abrir directo en CREAR CUENTA.
- `/hall-of-fame` — Salón de la Fama con pestañas por juego y marca personal.
- `app/not-found.tsx` — 404 temática para cualquier URL desconocida (incluidos ids de juego inexistentes).

### Estructura

- `components/layout/` — `BackgroundEffects`, `Navbar`, `MobileMenu`, `nav-links.ts`.
- `components/ui/` — `Logo`, `NeonButton`, `rank-styles.ts`.
- `components/home/` — `HomeHero`, `FloatingSilhouettes`, `SectionHeading`, `Reveal`, `FeatureGrid`, `FeatureIcon`, `GamesRail`, `MiniGameCard`, `StatsBand`, `LiveActivity`, `PricingSection`, `FinalCta`.
- `components/library/` — `LibraryHero`, `LibraryView`, `SearchBar`, `CategoryFilter`, `GameCard`.
- `components/game/` — `GameCover`, `PlayingAs`, `DetailLeaderboard`, `PlayerView`, `PlayerHud`, `CrtScreen`, `PixelLoader`, `GameOverModal`.
- `components/auth/` — `AuthCard`, `AuthField`.
- `components/hall-of-fame/` — `HallOfFameView`, `GameTabs`, `HallOfFameTable`.
- `lib/` — `format.ts`, `games.ts`, `scores.ts`, `storage.ts`, `session.ts`, `local-scores.ts`, `activity.ts`.

### Persistencia simulada (localStorage)

- `e1230_user` — sesión simulada (`SessionUser`): login, registro, Google, GitHub e invitado.
- `e1230_scores` — puntuaciones locales por juego, mezcladas con los rankings mock deterministas de `lib/scores.ts`.

Autenticación real, backend y ranking global en servidor quedan fuera de este spec; ver la sección «Fuera de alcance» de `specs/01-mvp-visual.md`.

## Comandos

- `npm run dev`: servidor de desarrollo en http://localhost:3000
- `npm run build`: build de producción (también hace type-check)
- `npm run lint`: ESLint (config flat en `eslint.config.mjs`, extiende `eslint-config-next` core-web-vitals y typescript)
- `npx tsc --noEmit`: solo type-check

Todavía no hay un framework de tests configurado.

## Notas del stack

- **Next.js 16.3 y React 19.2, App Router** (`app/`). Como dice AGENTS.md, las APIs difieren de versiones anteriores de Next.js. Revisa `node_modules/next/dist/docs/` antes de usar una API de Next de la que no estés seguro. Por ejemplo, el layout usa el tipo global `LayoutProps<"/">`, que Next genera automáticamente.
- **Tailwind CSS v4** a través de `@tailwindcss/postcss`. No hay `tailwind.config.*`. Los tokens del tema se declaran con `@theme inline` en `app/globals.css`, y los colores claro/oscuro son variables CSS en `:root`.
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