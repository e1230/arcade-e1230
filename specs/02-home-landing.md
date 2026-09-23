# SPEC 02 — Home de presentación de Arcade E1230

> **Estado:** Aprobado
> **Depende de:** SPEC 01
> **Fecha:** 2026-09-23
> **Objetivo:** Reemplazar la Biblioteca en `/` por una landing de presentación portada de `references/home-about/home.jsx` y mover la Biblioteca a `/games`.

## Por qué existe este spec

Hoy `/` abre directo en la grilla de juegos. La nueva referencia `references/home-about/` define una landing que presenta la plataforma antes de mostrar el catálogo: hero, características, vista previa de juegos, estadísticas, actividad, precios y un llamado final a jugar.

La referencia es un prototipo con React global (`window.Home`), navegación por estado (`navigate({ name })`) y un CSS propio (`styles.css`) con la marca «Arcade Vault». Este spec la traduce a App Router y a Tailwind v4 con los tokens de `app/globals.css`, la adapta a la marca Arcade E1230 y al catálogo real de 8 juegos, y reacomoda las rutas y los links que hoy asumen que `/` es la Biblioteca.

Solo se porta el home. La página «Acerca de» (`about.jsx`) queda fuera.

## Alcance

**Incluye:**

- **Nueva ruta de la Biblioteca `/games`:** el contenido actual de `app/page.tsx` (`LibraryHero` + `LibraryView`) se mueve sin cambios a `app/games/page.tsx`, con el título de pestaña `Biblioteca · Arcade E1230`.
- **Home en `/`** con siete secciones, en este orden (referencia `home.jsx`, líneas 98–295, y `styles.css`, líneas 930–1069 y 1621–1725):
  1. **Hero** a pantalla completa: siluetas pixel flotantes (8 SVG), eyebrow «▸ INSERTA UNA MONEDA_» con cursor parpadeante, título en tres líneas «EL ARCADE» / «CLÁSICO ESTÁ» / «DE VUELTA» (blanco, degradado cian y degradado rosa), subtítulo de dos líneas, botones «▶ EXPLORAR JUEGOS» (con pulso) y «✦ CREAR CUENTA», e indicador «DESLIZA ▼» con la flecha rebotando.
  2. **// 01 ¿POR QUÉ ARCADE E1230?:** 4 tarjetas de características (JUEGOS CLÁSICOS, 100% GRATIS, LADDER BOARDS, SIEMPRE CRECIENDO) con ícono pixel en SVG, cada una con su color (cian, amarillo, rosa, verde), que se elevan en hover.
  3. **// 02 JUEGOS DISPONIBLES AHORA:** riel con los 6 primeros juegos de `GAMES` en mini tarjetas cuadradas (portada, título y categoría) que llevan al Detalle, más el botón «VER TODOS LOS JUEGOS →».
  4. **Franja de estadísticas:** 3 bloques «8+ · JUEGOS · Y CONTANDO», «MILES · DE PARTIDAS · JUGADAS CADA DÍA» y «GLOBAL · RANKING · COMPITE CON EL MUNDO».
  5. **// 03 ACTIVIDAD EN VIVO:** tarjeta «▸ ÚLTIMAS PUNTUACIONES» con 7 filas que entran escalonadas, y tarjeta «▸ TOP JUGADORES · HOY» con 5 filas, colores de podio, fondo degradado decreciente y el link «VER SALÓN →».
  6. **// 04 PRECIOS:** tarjeta del plan único «JUGADOR E1230» a $0 con la lista de 6 beneficios, el botón «EMPEZAR GRATIS →», la nota al pie y el sello rotado «FREE PLAY», más 3 preguntas frecuentes.
  7. **CTA final:** «¿LISTO PARA JUGAR?» con degradado blanco-amarillo, botón «INSERTAR MONEDA →» con pulso y la línea «Gratis. Sin registro obligatorio. Empieza en segundos.».
- **Reveal al hacer scroll:** las secciones 2 a 7 aparecen con fundido y desplazamiento vertical la primera vez que entran en pantalla.
- **Navegación:** navbar y menú móvil con los links «Inicio» (`/`), «Biblioteca» (`/games`) y «Salón de la Fama» (`/hall-of-fame`).
- **Links que hoy apuntan a `/`:**
  - «< VOLVER AL INICIO» y «VOLVER AL INICIO» del Detalle pasan a «< VOLVER A LA BIBLIOTECA» y «VOLVER A LA BIBLIOTECA» → `/games`.
  - «VOLVER AL INICIO» del modal FIN DEL JUEGO pasa a «VOLVER A LA BIBLIOTECA» → `/games`.
  - La 404, el logo y el redirect tras iniciar sesión siguen yendo a `/`, que ahora es el home.
- **Registro directo:** `/login?mode=register` abre la tarjeta de autenticación en la pestaña CREAR CUENTA. «✦ CREAR CUENTA» y «EMPEZAR GRATIS →» usan esa URL.
- **Textos adaptados a Arcade E1230:** los de la referencia, con «Arcade Vault» → «Arcade E1230», «12+» → «8+» y los juegos del ticker reemplazados por juegos del catálogo.
- **Movimiento reducido:** con `prefers-reduced-motion: reduce` se detienen las animaciones en bucle nuevas y las secciones se muestran sin reveal.
- **Documentación:** actualizar las rutas y la estructura en la sección «Proyecto» de `CLAUDE.md`.

**Fuera de alcance (para futuros specs):**

- La página «Acerca de» (`about.jsx`) y su link en el navbar.
- El contador «CRÉDITOS · 03» y la moneda del navbar de la referencia.
- El rebranding del logo o del navbar a «Arcade Vault».
- Las portadas ilustradas en CSS por juego (`cover-bricks`, `cover-snake`, etc.).
- Actividad y estadísticas reales o calculadas: todo el home usa datos fijos.
- Cambiar el home según haya o no sesión.
- Guardas de rutas y redirecciones por sesión.
- Modificar `specs/01-mvp-visual.md`: queda como registro histórico aunque este spec cambie la ruta de la Biblioteca.

## Rutas y archivos

```
app/
  page.tsx                      (reemplaza) Home de presentación
  games/page.tsx                (nuevo) Biblioteca, movida desde app/page.tsx
  games/[id]/page.tsx           (cambia) botones VOLVER A LA BIBLIOTECA → /games
  login/page.tsx                (cambia) lee ?mode=register y lo pasa a AuthCard
  globals.css                   (cambia) token verde, keyframes nuevos y reduced motion
components/
  home/     HomeHero.tsx, FloatingSilhouettes.tsx, SectionHeading.tsx, Reveal.tsx,
            FeatureGrid.tsx, FeatureIcon.tsx, GamesRail.tsx, MiniGameCard.tsx,
            StatsBand.tsx, LiveActivity.tsx, PricingSection.tsx, FinalCta.tsx
  layout/   nav-links.ts (nuevo), Navbar.tsx (cambia), MobileMenu.tsx (cambia)
  game/     GameCover.tsx (cambia, variante mini), GameOverModal.tsx (cambia)
  auth/     AuthCard.tsx (cambia, prop initialTab)
lib/
  activity.ts                   (nuevo) mock fijo de la actividad en vivo
CLAUDE.md                       (cambia) sección «Proyecto»
```

Convenciones:

- `app/page.tsx` es un Server Component que solo compone las secciones de `components/home/`.
- Solo `Reveal.tsx` es componente cliente (`"use client"`), porque usa `IntersectionObserver`. El resto del home se renderiza en el servidor.
- Los textos fijos de cada sección (características, estadísticas, beneficios y preguntas frecuentes) viven como constantes en el componente de esa sección. Solo la actividad va en `lib/`, porque son datos que un backend va a reemplazar.
- Se mantienen las convenciones del SPEC 01: código en inglés, comentarios en español latinoamericano, componentes en PascalCase y módulos sin JSX en kebab-case.

## Modelo de datos

### Actividad en vivo — `lib/activity.ts`

```ts
export type ActivityColor = "cyan" | "pink" | "yellow" | "green";

export interface RecentScore {
  player: string; // "NEONFOX"
  gameId: string; // id de GAMES; el título se obtiene con getGame(gameId)
  score: number; // 184220, se muestra como "+184,220"
  timeAgo: string; // "hace 2 min"
  color: ActivityColor; // color del nombre del jugador
}

export interface TopPlayer {
  rank: number; // 1..5
  player: string;
  score: number;
}

export const RECENT_SCORES: RecentScore[]; // 7 filas
export const TOP_PLAYERS_TODAY: TopPlayer[]; // 5 filas
```

Valores de `RECENT_SCORES` (los de la referencia, con el juego inventado reemplazado por su equivalente del catálogo):

| player   | gameId    | score  | timeAgo     | color  | Juego en la referencia |
| -------- | --------- | ------ | ----------- | ------ | ---------------------- |
| NEONFOX  | tetris    | 184220 | hace 2 min  | pink   | Caída                  |
| PX_KAI   | pacman    | 96400  | hace 5 min  | yellow | Glotón                 |
| Z3R0COOL | invaders  | 54190  | hace 8 min  | green  | Invasores              |
| VAULT_07 | asteroids | 41200  | hace 12 min | cyan   | Rocas                  |
| GLITCHA  | arkanoid  | 28450  | hace 18 min | cyan   | Bloque Buster          |
| ARKADYA  | snake     | 7820   | hace 24 min | green  | Serpentina             |
| CYBER_LU | frogger   | 18900  | hace 31 min | yellow | Ranaria                |

Valores de `TOP_PLAYERS_TODAY`: `1 NEONFOX 312840`, `2 PX_KAI 248110`, `3 M00NRYU 196720`, `4 VAULT_07 154300`, `5 GLITCHA 138900`.

Reglas de presentación:

- Las puntuaciones usan `formatScore` de `lib/format.ts` (`es-MX`). El ticker les antepone `+`.
- El rango del top se muestra como `#` + `pad2(rank)`: `#01`.
- Los puestos 1 a 3 usan los colores `gold`, `silver` y `bronze` de los tokens del proyecto. Del 4 en adelante, el rango va en `subtle` y la puntuación en `cyan`.
- El fondo degradado de cada fila del top ocupa `(100 − i × 16)%` del ancho, con `i` = índice 0–4.

### Navegación — `components/layout/nav-links.ts`

```ts
export interface NavLink {
  href: string;
  label: string;
}

export const NAV_LINKS: NavLink[]; // Inicio "/", Biblioteca "/games", Salón de la Fama "/hall-of-fame"
export function getActiveHref(pathname: string): string | null;
```

`getActiveHref` devuelve:

- `"/"` solo cuando `pathname === "/"`.
- `"/games"` cuando `pathname` es `/games` o empieza con `/games/` (Detalle y Reproductor).
- `"/hall-of-fame"` cuando `pathname === "/hall-of-fame"`.
- `null` en cualquier otro caso (`/login` y URLs desconocidas).

`Navbar` y `MobileMenu` importan ambos desde este módulo en lugar de duplicarlos como hoy.

### Pestaña inicial de autenticación — `components/auth/AuthCard.tsx`

```ts
export type AuthTab = "login" | "register"; // ya existe; pasa a exportarse

interface AuthCardProps {
  initialTab?: AuthTab; // por defecto "login"
}
```

`app/login/page.tsx` recibe `searchParams` (una `Promise` en Next 16) y pasa `initialTab="register"` solo cuando `mode === "register"`. Cualquier otro valor, o su ausencia, abre `"login"`.

Esta feature no introduce nuevas claves de localStorage.

## Plan de implementación

Cada paso deja la app compilando (`npx tsc --noEmit`) y corriendo con `npm run dev`. Los estilos se toman de las líneas de `references/home-about/styles.css` que indica cada paso, traducidos a utilidades de Tailwind con los tokens de `app/globals.css` y valores arbitrarios cuando no hay token.

1. **Mover la Biblioteca a `/games`.** Crear `app/games/page.tsx` con el contenido actual de `app/page.tsx` y `metadata.title = "Biblioteca"`. Dejar temporalmente `app/page.tsx` renderizando lo mismo. Verificación: `/games` muestra la Biblioteca completa y el título de pestaña es `Biblioteca · Arcade E1230`.
2. **Links de navegación.** Crear `components/layout/nav-links.ts` según el modelo de datos. Hacer que `Navbar.tsx` y `MobileMenu.tsx` lo usen y borrar sus copias locales de `NAV_LINKS` y `getActiveHref`. Verificación: el navbar muestra Inicio, Biblioteca y Salón de la Fama, y el subrayado sigue las reglas de `getActiveHref`.
3. **Links que salen del Detalle y del Reproductor.** En `app/games/[id]/page.tsx`, cambiar los dos botones a «< VOLVER A LA BIBLIOTECA» y «VOLVER A LA BIBLIOTECA» → `/games`. En `components/game/GameOverModal.tsx`, cambiar «VOLVER AL INICIO» a «VOLVER A LA BIBLIOTECA» → `/games`. Verificación: desde `/games/snake` y desde el modal se vuelve a `/games`.
4. **Pestaña inicial de registro.** Agregar la prop `initialTab` a `AuthCard` y leer `searchParams` en `app/login/page.tsx`, consultando antes `node_modules/next/dist/docs/` como pide `AGENTS.md`. Pasar también `key={initialTab}` para que el estado se reinicie si cambia el parámetro. Verificación: `/login?mode=register` abre CREAR CUENTA con el campo de correo, y `/login` abre INICIAR SESIÓN.
5. **Tokens y keyframes.** En `app/globals.css`:
   - Agregar `--neon-green: #00ff88` en `:root` y `--color-green` en `@theme inline`.
   - Agregar los keyframes `e-float` (siluetas: `translateY` 0 → −14px y `rotate` −2deg → 2deg), `e-bounce` (flecha: `translateY(6px)` a la mitad) y `e-tick` (filas del ticker: de `opacity 0` y `translateX(-8px)` a su lugar).
   - Declarar los tokens `--animate-float` (6 s, bucle), `--animate-bounce-arrow` (1,6 s, bucle) y `--animate-tick` (360 ms, una vez, `both`).
   - Agregar `.animate-float` y `.animate-bounce-arrow` al bloque `prefers-reduced-motion`.

   Verificación: `npx tsc --noEmit` y `npm run lint` pasan, y `/` no cambia.
6. **Hero.** Crear `components/home/FloatingSilhouettes.tsx` con los 8 SVG de la referencia (líneas 15–84 de `home.jsx`), posiciones y tamaños de `styles.css` (líneas 976–986), `aria-hidden` y `animate-float` con los retrasos negativos de la referencia. Crear `components/home/HomeHero.tsx` (líneas 103–125 de `home.jsx` y 933–974 de `styles.css`) con `min-h-[calc(100svh-64px)]`. «▶ EXPLORAR JUEGOS» es un `NeonButton` cian `lg` con `motion-safe:animate-pulse-neon` → `/games`. «✦ CREAR CUENTA» es un `NeonButton` rosa `lg` → `/login?mode=register`. Reemplazar `app/page.tsx` para que solo renderice `HomeHero`. Verificación: `/` muestra el hero con las siluetas flotando y los dos botones navegan.
7. **Encabezado de sección y reveal.** Crear `components/home/SectionHeading.tsx` (props `kicker`, `kickerColor`, `title`; líneas 989–995 de `styles.css`) y `components/home/Reveal.tsx` (cliente). `Reveal` envuelve una sección y observa su elemento con `IntersectionObserver` (`threshold: 0.12`). La primera vez que entra en pantalla marca `visible` y deja de observar. Las clases son `motion-safe:opacity-0 motion-safe:translate-y-6` antes y `opacity-100 translate-y-0` después, con transición de 600 ms. Si `IntersectionObserver` no existe, arranca visible. El observer se desconecta al desmontar. Verificación: `npx tsc --noEmit` pasa.
8. **¿Por qué Arcade E1230?** Crear `components/home/FeatureIcon.tsx` con los 4 íconos pixel (`GAMEPAD`, `FREE`, `TROPHY`, `ROCKET`; líneas 297–336 de `home.jsx`) y `components/home/FeatureGrid.tsx` (líneas 128–148 de `home.jsx` y 997–1018 de `styles.css`) con la grilla de 4, 2 y 1 columnas. Montarla en `app/page.tsx` dentro de `Reveal`. Verificación: las 4 tarjetas se ven con su color y se elevan en hover.
9. **Juegos disponibles.** Agregar a `components/game/GameCover.tsx` la variante `mini`: cuadrada (`aspect-square`), con el patrón rayado y la inicial, sin la etiqueta de texto. Crear `components/home/MiniGameCard.tsx` (`Link` a `/games/{id}` con portada, título y categoría) y `components/home/GamesRail.tsx` con `GAMES.slice(0, 6)`, la grilla de 6, 3 y 2 columnas (líneas 1020–1028 de `styles.css`) y «VER TODOS LOS JUEGOS →» → `/games`. Montarla en `app/page.tsx` dentro de `Reveal`. Verificación: se ven ARKANOID, TETRIS, SNAKE, PAC-MAN, SPACE INVADERS y ASTEROIDS, y cada tarjeta lleva a su Detalle.
10. **Estadísticas.** Crear `components/home/StatsBand.tsx` (líneas 168–182 de `home.jsx` y 1030–1047 de `styles.css`): franja de ancho completo con bordes cian, resplandor amarillo radial y 3 bloques separados por líneas verticales, que pasan a horizontales debajo de 720 px. Montarla en `app/page.tsx` dentro de `Reveal`. Verificación: se leen «8+», «MILES» y «GLOBAL».
11. **Datos de actividad.** Crear `lib/activity.ts` con los tipos y las constantes del modelo de datos. Verificación: `npx tsc --noEmit` pasa.
12. **Actividad en vivo.** Crear `components/home/LiveActivity.tsx` (líneas 185–239 de `home.jsx` y 1621–1670 de `styles.css`) con la grilla `1.2fr 1fr`, que pasa a una columna debajo de 900 px. Cada fila del ticker usa `animate-tick` con `animation-delay: i × 60ms`. «VER SALÓN →» es un `Link` a `/hall-of-fame`. Montarla en `app/page.tsx` dentro de `Reveal`. Verificación: los criterios de Actividad en vivo.
13. **Precios.** Crear `components/home/PricingSection.tsx` (líneas 242–285 de `home.jsx` y 1673–1725 de `styles.css`): tarjeta verde con borde punteado interior, monto «$0» con degradado blanco-verde, «/ SIEMPRE», lista con los ✔ en verde, «EMPEZAR GRATIS →» a ancho completo con pulso → `/login?mode=register`, nota al pie, sello «FREE PLAY» rotado 14° y las 3 preguntas frecuentes con borde izquierdo cian, rosa y amarillo. Montarla en `app/page.tsx` dentro de `Reveal`. Verificación: el sello no provoca scroll horizontal a 375 px.
14. **CTA final.** Crear `components/home/FinalCta.tsx` (líneas 288–292 de `home.jsx` y 1049–1066 de `styles.css`) con las dos líneas de degradado cian arriba y abajo. «INSERTAR MONEDA →» va → `/games` con pulso. Montarla en `app/page.tsx` dentro de `Reveal`. Verificación: el home completo se recorre de arriba abajo con las 7 secciones.
15. **Documentación.** Actualizar la sección «Proyecto» de `CLAUDE.md`: la ruta `/` pasa a ser el home, se agrega `/games` como Biblioteca y se agregan la carpeta `components/home/`, `components/layout/nav-links.ts` y `lib/activity.ts`. Verificación: el texto describe el estado real del repo.

## Criterios de aceptación

**Generales**

- [ ] `npm run build` termina sin errores.
- [ ] `npm run lint` termina sin errores.
- [ ] Al recorrer `/`, `/games`, `/games/snake`, `/games/snake/play`, `/login` y `/hall-of-fame`, la consola del navegador no muestra errores ni advertencias de hidratación.
- [ ] `grep -rn "Vault\|VAULT" app components lib` solo devuelve el nombre de jugador `VAULT_07` de `lib/activity.ts`.
- [ ] El título de pestaña de `/` es `Arcade E1230` y el de `/games` es `Biblioteca · Arcade E1230`.

**Rutas y navegación**

- [ ] `/games` muestra la Biblioteca del SPEC 01 sin cambios: el hero «ARCADE E1230», el buscador, los chips y las 8 tarjetas.
- [ ] El navbar de escritorio muestra, en orden, «Inicio», «Biblioteca» y «Salón de la Fama».
- [ ] En `/` está activo «Inicio». En `/games`, `/games/snake` y `/games/snake/play` está activo «Biblioteca». En `/hall-of-fame` está activo «Salón de la Fama». En `/login` y en `/cualquier-cosa` no hay ninguno activo.
- [ ] El menú móvil (375 px) muestra los mismos tres links con el mismo estado activo.
- [ ] A 768 px de ancho, el navbar entra en una sola línea y no genera scroll horizontal.
- [ ] Hacer clic en el logo lleva a `/`.
- [ ] En `/games/snake`, «< VOLVER A LA BIBLIOTECA» y «VOLVER A LA BIBLIOTECA» llevan a `/games`.
- [ ] En el modal FIN DEL JUEGO, «VOLVER A LA BIBLIOTECA» lleva a `/games`.
- [ ] La 404 sigue mostrando «VOLVER AL INICIO», que lleva a `/`.
- [ ] Iniciar sesión con `maria` / `1234` lleva a `/` (el home).
- [ ] `grep -rn "VOLVER AL INICIO" app components` solo devuelve `app/not-found.tsx`.

**Hero**

- [ ] `/` muestra «▸ INSERTA UNA MONEDA_» con el `_` parpadeando y el título en tres líneas «EL ARCADE», «CLÁSICO ESTÁ» y «DE VUELTA» en blanco, cian y rosa.
- [ ] Se ven 8 siluetas pixel que flotan, y no reciben clics (`pointer-events: none`).
- [ ] «▶ EXPLORAR JUEGOS» pulsa y lleva a `/games`.
- [ ] «✦ CREAR CUENTA» lleva a `/login?mode=register`, que abre en la pestaña CREAR CUENTA con el campo «Correo electrónico» visible.
- [ ] `/login` sin parámetro abre en INICIAR SESIÓN. `/login?mode=otra-cosa` también.
- [ ] «DESLIZA ▼» se ve al pie del hero con la flecha rebotando.
- [ ] A 375 px de ancho, el título entra sin scroll horizontal y los dos botones se apilan.

**Secciones**

- [ ] «// 01 ¿POR QUÉ ARCADE E1230?» muestra 4 tarjetas en 4 columnas a 1280 px, en 2 a 800 px y en 1 a 375 px.
- [ ] «// 02 JUEGOS DISPONIBLES AHORA» muestra ARKANOID, TETRIS, SNAKE, PAC-MAN, SPACE INVADERS y ASTEROIDS, en 6 columnas a 1280 px, en 3 a 800 px y en 2 a 375 px.
- [ ] Hacer clic en la mini tarjeta de SNAKE lleva a `/games/snake`.
- [ ] «VER TODOS LOS JUEGOS →» lleva a `/games`.
- [ ] La franja de estadísticas muestra «8+ · JUEGOS · Y CONTANDO», «MILES · DE PARTIDAS · JUGADAS CADA DÍA» y «GLOBAL · RANKING · COMPITE CON EL MUNDO».
- [ ] «// 04 PRECIOS» muestra «JUGADOR E1230», «$0», «/ SIEMPRE», los 6 beneficios, el sello «FREE PLAY» y las 3 preguntas frecuentes.
- [ ] La respuesta de «¿REALMENTE ES GRATIS?» empieza con «Sí. Arcade E1230 es un proyecto sin fines de lucro».
- [ ] «EMPEZAR GRATIS →» lleva a `/login?mode=register`.
- [ ] «INSERTAR MONEDA →» lleva a `/games`.
- [ ] A 375 px de ancho, ninguna sección del home genera scroll horizontal.

**Actividad en vivo**

- [ ] La primera fila del ticker es `NEONFOX · ▸ TETRIS · +184,220 · hace 2 min`, con NEONFOX en rosa.
- [ ] La última fila del ticker es `CYBER_LU · ▸ FROGGER · +18,900 · hace 31 min`.
- [ ] Las filas del ticker entran de izquierda a derecha, una tras otra.
- [ ] El top empieza con `#01 · NEONFOX · 312,840` en dorado y termina con `#05 · GLITCHA · 138,900`.
- [ ] El fondo degradado de la fila `#05` es visiblemente más corto que el de la `#01`.
- [ ] «VER SALÓN →» lleva a `/hall-of-fame`.

**Reveal y movimiento reducido**

- [ ] Al cargar `/`, las secciones que están fuera de pantalla aparecen con fundido al hacer scroll hasta ellas, y no vuelven a ocultarse al subir.
- [ ] Con `prefers-reduced-motion: reduce` emulado en DevTools, todas las secciones se ven sin hacer scroll y no se animan en bucle las siluetas, la flecha de «DESLIZA», el cursor `_` ni los botones con pulso.

## Decisiones

- **Sí:** la Biblioteca se mueve a `/games`. Queda en la misma jerarquía que `/games/[id]` y `/games/[id]/play`.
- **No:** `/library`. Rompe la jerarquía: la lista y el detalle quedarían en ramas distintas.
- **Sí:** las 7 secciones de la referencia. El usuario quiere la landing completa.
- **Sí:** textos adaptados a la marca («Arcade E1230», «8+», juegos del catálogo). Una landing que promete 12 juegos inexistentes o nombra otra marca confunde.
- **No:** copia literal de la referencia.
- **Sí:** «LADDER BOARDS» se mantiene tal cual. Es el único cambio de marca no pedido, y el resto de los textos respeta la referencia.
- **Sí:** mock fijo en `lib/activity.ts`, con los mismos jugadores y puntuaciones de la referencia. Es determinista, permite criterios exactos y un backend lo reemplaza sin tocar la UI.
- **No:** derivar la actividad de `lib/scores.ts`. Los tiempos «hace X min» serían inventados igual y los números dejarían de coincidir con la referencia.
- **Sí:** mapear cada juego inventado del ticker a su equivalente del catálogo (Caída → TETRIS, Glotón → PAC-MAN, Invasores → SPACE INVADERS, Rocas → ASTEROIDS, Bloque Buster → ARKANOID, Serpentina → SNAKE, Ranaria → FROGGER).
- **Sí:** navbar con Inicio, Biblioteca y Salón de la Fama.
- **No:** «Acerca de» ni el contador de créditos. La página «Acerca de» no existe en este spec y el contador es decorativo sin función.
- **Sí:** `NAV_LINKS` y `getActiveHref` en `components/layout/nav-links.ts`. Hoy están duplicados en `Navbar` y `MobileMenu`, y los dos cambian en este spec.
- **Sí:** Detalle y modal FIN DEL JUEGO vuelven a `/games` con el texto «VOLVER A LA BIBLIOTECA». Vuelven a la lista de juegos, que es de donde vino el usuario.
- **Sí:** la 404 y el redirect del login van a `/` (home).
- **No:** mandar todo a `/games` ni todo a `/`.
- **Sí:** `/login?mode=register` para abrir CREAR CUENTA. El botón dice «CREAR CUENTA» y debe llevar a esa pestaña.
- **Sí:** leer `searchParams` en el Server Component de `/login` y pasarlo como prop.
- **No:** `useSearchParams` en `AuthCard`. Obliga a envolverlo en `Suspense` y no aporta nada.
- **Sí:** el home se ve igual con y sin sesión. Casi todo se renderiza en el servidor y no hay cambios visibles tras hidratar.
- **No:** cambiar los CTA de registro según la sesión.
- **Sí:** reutilizar `GameCover` con una variante `mini` cuadrada. Mantiene la coherencia visual con la Biblioteca.
- **No:** portar las portadas CSS de la referencia. Son unas 120 líneas de CSS y solo cubren parte del catálogo.
- **Sí:** reutilizar `NeonButton` (`outline`, tamaño `lg`) con `motion-safe:animate-pulse-neon` para los CTA con pulso.
- **No:** una variante `xl` nueva en `NeonButton`. El tamaño `lg` ya es cercano al `.btn.xl` de la referencia.
- **Sí:** los colores de podio de los tokens del proyecto (`gold`, `silver`, `bronze`). Coinciden con el Salón de la Fama y el Detalle.
- **No:** los valores de `--gold`, `--silver` y `--bronze` de `references/home-about/styles.css`.
- **Sí:** token `--color-green` (`#00ff88`). Lo usan la tarjeta de características, los precios y el ticker. El violeta `#aa00ff`, el rojo `#ff3060` y el celeste `#00d4ff` de las siluetas quedan como `fill` en el SVG, porque solo se usan ahí.
- **Sí:** el fondo degradado del top ocupa `(100 − i × 16)%` del ancho. En la referencia, `.tp-fill` recibe ese ancho pero no tiene estilos, así que la intención se aplica al degradado.
- **No:** `transitionDelay` en las tarjetas de características. En la referencia retrasa el hover y no el reveal.
- **Sí:** todas las animaciones, respetando `prefers-reduced-motion`. Mismo criterio que el SPEC 01.
- **Sí:** reveal con un componente cliente `Reveal` por sección, que deja de observar tras la primera aparición.
- **No:** un solo `useReveal` con `querySelectorAll` como la referencia. Depende del DOM global y obligaría a volver cliente a todo el home.
- **Sí:** `100svh` para el alto del hero. En móviles no salta al mostrar u ocultar la barra del navegador.
- **Sí:** no tocar `specs/01-mvp-visual.md`. Es el registro de lo que se implementó en su momento.
- **Sí:** actualizar `CLAUDE.md` al final, igual que en el SPEC 01.

## Riesgos

| Riesgo                                                                                                       | Mitigación                                                                                                                         |
| ------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------- |
| Con 3 links, el navbar no entra en una línea entre 768 px y ~900 px.                                         | Hay un criterio a 768 px. Si falla, el navbar y el menú móvil pasan del breakpoint `md` al `lg`.                                   |
| Con JavaScript lento o desactivado, las secciones con reveal quedan invisibles (`opacity-0`) hasta hidratar. | Se acepta. Sin JS no hay reveal, y el hero, que es lo primero que se ve, no usa `Reveal`.                                          |
| El sello «FREE PLAY» (`top: -18px; right: -18px`) sale del contenedor y genera scroll horizontal en móvil.   | Criterio a 375 px. Si ocurre, el sello se mete dentro de la tarjeta debajo de `md`.                                                |
| Las siluetas pueden tapar el título del hero en pantallas angostas.                                          | Tienen `opacity: 0.55`, `z-index` menor que el contenido y `pointer-events: none`. Si molestan, se ocultan algunas debajo de `md`. |
| `searchParams` en `/login` vuelve la ruta dinámica.                                                          | Se acepta: la página es liviana y solo se renderiza la tarjeta.                                                                    |
| Next.js 16 cambia la API de `searchParams` (es una `Promise`).                                               | Consultar `node_modules/next/dist/docs/` antes del paso 4, como pide `AGENTS.md`.                                                  |

## Lo que **no** entra en este spec

- La página «Acerca de» y su link.
- El contador de créditos del navbar.
- Portadas ilustradas por juego.
- Actividad, estadísticas o rankings reales.
- Un home distinto según la sesión.
- Cambios en `specs/01-mvp-visual.md`.

Si alguna de estas llega, va en su propio spec.
