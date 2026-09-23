# CLAUDE.md

Este archivo le da contexto a Claude Code (claude.ai/code) al trabajar en este repositorio.

@AGENTS.md

## Proyecto

Arcade E1230 es una plataforma online para jugar y competir por la mayor cantidad de puntos. Por ahora es el scaffold recién creado por Create Next App (solo existen `app/layout.tsx`, `app/page.tsx` y `app/globals.css`); las funcionalidades reales todavía no están construidas. El README y los specs están escritos en español, así que las nuevas specs también deben escribirse en español.

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