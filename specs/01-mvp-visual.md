# SPEC 01 — MVP visual de Arcade E1230

> **Estado:** Terminado
> **Depende de:** Ninguno
> **Fecha:** 2026-09-23
> **Objetivo:** Portar a Next.js las cinco pantallas de `references/Arcade E1230.dc.html` (Biblioteca, Detalle, Reproductor, Autenticación y Salón de la Fama) con datos e interacciones simuladas y sin ningún juego real.

## Por qué existe este spec

La referencia es un prototipo de un solo archivo. Usa un micro-framework propio (`<sc-if>`, `<sc-for>`, `DCLogic`), estilos en línea y una sola página que cambia de pantalla según el estado. No se puede copiar tal cual al proyecto.

Este spec la traduce a App Router con rutas reales, componentes React y utilidades de Tailwind v4. Así queda la base visual sobre la que se construirán después la autenticación real, el backend de puntuaciones y los juegos. Todo lo simulado aquí (sesión, rankings, partida) está pensado para ser reemplazado sin rehacer la UI.

El tema neón (colores, fuentes, keyframes y utilidades de fondo) ya existe en `app/globals.css` y `app/layout.tsx`. Este spec lo consume y no lo redefine.

## Alcance

**Incluye:**

- **Layout global** (referencia, líneas 31–92 y 344–346):
  - Fondo con la cuadrícula synthwave en perspectiva, el resplandor cian superior y las scanlines fijas sobre toda la página.
  - Navbar sticky con el logo, los links «Biblioteca» y «Salón de la Fama» con estado activo, y a la derecha el botón INICIAR SESIÓN o el avatar con la inicial, el nombre y «cerrar sesión».
  - En pantallas angostas (menos de `md`), un botón hamburguesa que abre un menú lateral desde la derecha, con fondo oscuro que lo cierra al tocarlo.
- **`/` Biblioteca** (líneas 95–141):
  - Título «ARCADE E1230» con degradado animado y flicker, más el subtítulo «INSERTA UNA MONEDA PARA JUGAR» parpadeando.
  - Buscador que filtra por título, categoría y descripción corta, sin distinguir mayúsculas ni acentos.
  - Chips de categoría: Todos, Clásicos, Disparos, Puzles y Laberinto.
  - Grilla de 8 tarjetas con portada rayada, badge de categoría, título, descripción corta, caja «MEJOR PUNTUACIÓN» y botón JUGAR que lleva al Detalle.
  - Efecto tilt 3D al pasar el mouse sobre la tarjeta.
  - Estado vacío «NINGÚN JUEGO COINCIDE CON TU BÚSQUEDA».
- **`/games/[id]` Detalle** (líneas 143–178):
  - Botón «< VOLVER AL INICIO», badge de categoría, título con glow y captura placeholder 16:9.
  - Descripción larga, botón JUGAR AHORA con pulso neón, botón VOLVER AL INICIO y la línea «Jugando como …».
  - Panel «MEJORES PUNTUACIONES» con el top 10 del juego.
- **`/games/[id]/play` Reproductor** (líneas 180–267):
  - Barra con el título del juego y los botones PAUSA/SEGUIR y SALIR.
  - HUD con PUNTUACIÓN, VIDAS (■□), NIVEL y JUGADOR.
  - Gabinete CRT con overlay de scanlines y viñeta, más la etiqueta «E1230-CRT» y el LED.
  - Overlay «CARGANDO…» de ~1,1 s al entrar.
  - Placeholder «IFRAME SANDBOX» con `juegos/{id}.html`, el texto de instrucciones y el botón SIMULAR PARTIDA.
  - Overlay «PAUSA». La tecla P también pausa.
  - Modal «FIN DEL JUEGO» con la puntuación final, GUARDAR PUNTUACIÓN (más la nota de invitado), el mensaje «PUNTUACIÓN GUARDADA» escribiéndose letra por letra, JUGAR DE NUEVO y VOLVER AL INICIO.
- **`/login` Autenticación** (líneas 269–305):
  - Tarjeta con el logo, pestañas INICIAR SESIÓN / CREAR CUENTA y los campos Usuario, Correo electrónico (solo al crear cuenta) y Contraseña.
  - Mensajes de validación, botón ENTRAR / CREAR CUENTA, separador «o continúa con», botones Google y GitHub (simulados), JUGAR COMO INVITADO y la nota sobre el ranking global.
- **`/hall-of-fame` Salón de la Fama** (líneas 307–341):
  - Título, pestañas horizontales con los 8 juegos y tabla top 10 (RANGO, JUGADOR, PUNTUACIÓN, FECHA) con colores de podio.
  - Resaltado «· TÚ», fila «TU MEJOR MARCA» y el link «Inicia sesión» cuando no hay sesión.
- **404 temática** en `app/not-found.tsx` para ids de juego inexistentes y para cualquier URL desconocida.
- **Sesión simulada** en localStorage (`e1230_user`) para el login, el registro, Google, GitHub y el modo invitado.
- **Puntuaciones locales** en localStorage (`e1230_scores`), mezcladas con los rankings mock.
- **Accesibilidad de movimiento:** con `prefers-reduced-motion: reduce` se apagan las animaciones en bucle y el tilt 3D.
- **Textos en español latino:** los mismos textos de la referencia con dos mensajes de validación adaptados, y números con formato `es-MX`.
- **Limpieza del scaffold:** `app/page.tsx` deja de mostrar el contenido de Create Next App. `<html lang="es">` y metadata en español.
- **Documentación:** actualizar la sección «Proyecto» de `CLAUDE.md` con las rutas y la estructura nuevas.

**Fuera de alcance (para futuros specs):**

- Cualquier juego real: el Snake en canvas de la referencia, la carga de `juegos/{id}.html` en un iframe y el protocolo `postMessage` (`{ tipo: 'puntuacion' }`, `{ tipo: 'fin' }`).
- Autenticación real (Supabase u OAuth de Google/GitHub) y cualquier backend o API.
- Ranking global persistido en servidor.
- D-pad móvil y la pista «Flechas o WASD»: son controles exclusivos del Snake.
- Guardas de rutas, por ejemplo redirigir `/login` cuando ya hay sesión.
- Imágenes reales de portada y captura.
- Toggles configurables de efectos (`scanlines`, `perspectiveGrid`, `cardTilt` de la referencia).
- Tema claro.
- Framework de tests.
- Selección de juego del Salón de la Fama en la URL (`?game=`).
- Borrar los SVG del scaffold que quedan en `public/`.

## Rutas y archivos

```
app/
  layout.tsx                    (cambia) lang="es", metadata, fondo y navbar
  page.tsx                      (reemplaza) Biblioteca
  not-found.tsx                 (nuevo) 404 temática
  globals.css                   (cambia) bloque prefers-reduced-motion
  games/[id]/page.tsx           (nuevo) Detalle
  games/[id]/play/page.tsx      (nuevo) Reproductor
  login/page.tsx                (nuevo) Autenticación
  hall-of-fame/page.tsx         (nuevo) Salón de la Fama
components/
  layout/   BackgroundEffects.tsx, Navbar.tsx, MobileMenu.tsx
  ui/       Logo.tsx, NeonButton.tsx, rank-styles.ts
  library/  LibraryHero.tsx, LibraryView.tsx, SearchBar.tsx, CategoryFilter.tsx, GameCard.tsx
  game/     GameCover.tsx, PlayingAs.tsx, DetailLeaderboard.tsx,
            PlayerView.tsx, PlayerHud.tsx, CrtScreen.tsx, PixelLoader.tsx, GameOverModal.tsx
  auth/     AuthCard.tsx, AuthField.tsx
  hall-of-fame/ HallOfFameView.tsx, GameTabs.tsx, HallOfFameTable.tsx
lib/
  format.ts, games.ts, scores.ts, storage.ts, session.ts, local-scores.ts
CLAUDE.md                       (cambia) sección «Proyecto»
```

Convenciones:

- Cada `page.tsx` es un Server Component delgado: exporta la metadata y renderiza una vista cliente cuando hace falta estado.
- Los componentes usan PascalCase. Los módulos sin JSX (`rank-styles.ts` y todo `lib/`) usan kebab-case.
- El código va en inglés y los comentarios en español latinoamericano (ver `CLAUDE.md`).
- Títulos de pestaña: `Arcade E1230` en `/`. En el resto se usa el template `%s · Arcade E1230`: `SNAKE`, `Jugando SNAKE`, `Iniciar sesión`, `Salón de la Fama`.

## Modelo de datos

### Catálogo — `lib/games.ts`

```ts
export type Accent = "cyan" | "pink" | "yellow";

// Hex y tinte translúcido de cada acento (valores de la función tint() de la referencia)
export const ACCENTS: Record<Accent, { hex: string; tint: string }> = {
  cyan: { hex: "#00f5ff", tint: "rgba(0,245,255,.14)" },
  pink: { hex: "#ff006e", tint: "rgba(255,0,110,.16)" },
  yellow: { hex: "#f5ff00", tint: "rgba(245,255,0,.12)" },
};

export type GameCategory = "Clásicos" | "Disparos" | "Puzles" | "Laberinto";

export interface Game {
  id: string; // slug de la URL: "snake"
  title: string; // "SNAKE"
  category: GameCategory;
  accent: Accent;
  shortDescription: string;
  longDescription: string;
}

export const GAMES: Game[]; // los 8 juegos de la referencia, en el mismo orden
export const CATEGORY_FILTERS = ["Todos", "Clásicos", "Disparos", "Puzles", "Laberinto"] as const;
export type CategoryFilter = (typeof CATEGORY_FILTERS)[number];
export function getGame(id: string): Game | undefined;
```

El orden de `GAMES` importa porque su índice alimenta el generador de rankings: `arkanoid` 0, `tetris` 1, `snake` 2, `pacman` 3, `invaders` 4, `asteroids` 5, `frogger` 6, `galaga` 7.

### Formato — `lib/format.ts`

- `formatScore(n)`: `Intl.NumberFormat("es-MX")`, así `42000` se muestra como `42,000`.
- `pad2(n)`: `7` se muestra como `07`, para rangos, niveles y fechas.
- `formatToday()`: la fecha actual como `dd/mm/aaaa`.
- `normalizeText(s)`: pasa a minúsculas y quita los acentos (NFD), para el buscador.

### Rankings — `lib/scores.ts`

```ts
export interface ScoreEntry {
  name: string;
  score: number;
  date: string; // "dd/mm/aaaa"
}

export type LocalScores = Record<string, ScoreEntry[]>; // clave: game.id

export interface LeaderboardRow extends ScoreEntry {
  rank: number; // 1..10
  isMine: boolean; // true si name coincide con el usuario con sesión (no invitado)
}

export const MOCK_PLAYER_NAMES: string[]; // los 12 nombres de la referencia, en el mismo orden
export function getMockScores(gameIndex: number): ScoreEntry[]; // 10 entradas
export function buildLeaderboard(gameId: string, local: LocalScores, userName: string | null): LeaderboardRow[];
export function getBestScore(gameId: string, local: LocalScores): number;
```

El generador es determinista y se porta idéntico a `mock()` de la referencia. Para el índice `g` y la fila `i` (0–9):

- `base = 42000 + g × 7300`
- `score = round(base × (1 − i × 0.085) / 10) × 10`
- `name = MOCK_PLAYER_NAMES[(i × 5 + g × 3) % 12]`
- `date = pad2(((i × 7 + g × 3) % 28) + 1) + "/" + pad2(9 − (i % 4)) + "/2026"`

`buildLeaderboard` junta el mock con `local[gameId]`, ordena de mayor a menor y devuelve el top 10. `getBestScore` es el máximo entre el primer puesto mock y las puntuaciones locales.

### Almacenamiento y sesión — `lib/storage.ts`, `lib/session.ts`, `lib/local-scores.ts`

```ts
// lib/storage.ts
export const STORAGE_KEYS = { user: "e1230_user", scores: "e1230_scores" } as const;
export function useStoredValue<T>(key: string, fallback: T): T; // fallback debe ser una constante estable
export function writeStoredValue<T>(key: string, value: T | null): void; // null elimina la clave

// lib/session.ts
export interface SessionUser {
  name: string; // en mayúsculas, máximo 14 caracteres
  guest: boolean;
}
export function useSession(): { user: SessionUser | null; signIn(user: SessionUser): void; signOut(): void };
export function getPlayerName(user: SessionUser | null): string; // user?.name ?? "INVITADO"

// lib/local-scores.ts
export function useLocalScores(): { scores: LocalScores; saveScore(gameId: string, entry: ScoreEntry): void };
```

`useStoredValue` usa `useSyncExternalStore`, con estas reglas:

- **Server snapshot:** siempre es `fallback`.
- **Caché:** guarda el valor parseado según el string crudo, así `getSnapshot` devuelve la misma referencia mientras el valor no cambie.
- **Notificación:** avisa a los suscriptores en cada escritura y con el evento `storage` de otras pestañas.
- **Errores:** toda lectura y escritura va dentro de `try/catch`. Un JSON corrupto o un localStorage bloqueado devuelve `fallback`.

Valores fijos de sesión que vienen de la referencia:

| Acción                       | `SessionUser` guardado                                              |
| ---------------------------- | ------------------------------------------------------------------- |
| ENTRAR / CREAR CUENTA válido | `{ name: usuario.trim().toUpperCase().slice(0, 14), guest: false }` |
| Google                       | `{ name: "JUGADOR_G", guest: false }`                               |
| GitHub                       | `{ name: "JUGADOR_GH", guest: false }`                              |
| JUGAR COMO INVITADO          | `{ name: "INVITADO", guest: true }`                                 |

### Estilos de podio — `components/ui/rank-styles.ts`

```ts
// Oro, plata y bronce para los tres primeros puestos (valores de RANK en la referencia)
export const RANK_STYLES: { color: string; glow: string; bg: string; edge: string }[];
```

Del 4.º puesto en adelante: `color: "#e6f7ff"`, sin glow, fondo y borde transparentes. Una fila propia (`isMine`) usa el fondo `rgba(255,0,110,.12)` y el borde `#ff006e`.

### Estado del reproductor — `components/game/PlayerView.tsx`

```ts
type PlayerStatus = "loading" | "ready" | "simulating" | "over";

interface PlayerState {
  status: PlayerStatus;
  paused: boolean;
  score: number;
  lives: number; // 0..3; se muestra como "■" × lives + "□" × (3 − lives)
  level: number; // se muestra con pad2
  saved: boolean;
  typedMessage: string; // "PUNTUACIÓN GUARDADA" escribiéndose letra por letra
}
```

La simulación se porta igual que `simulate()` de la referencia:

- Un tick cada 100 ms, que se ignora mientras `paused`.
- Cada tick suma `(floor(random × 90) + 10) × 10` puntos.
- `level = 1 + floor(t / 12)`.
- Cada 12 ticks se pierde una vida.
- En `t = 36` pasa a `over`.

## Plan de implementación

Cada paso deja la app compilando (`npx tsc --noEmit`) y corriendo con `npm run dev`. Los estilos exactos se toman de las líneas de la referencia que indica cada paso, usando los tokens de `app/globals.css` y valores arbitrarios de Tailwind para lo que no tenga token.

1. **Utilidades de formato.** Crear `lib/format.ts` con `formatScore`, `pad2`, `formatToday` y `normalizeText`. Verificación: `npx tsc --noEmit` pasa.
2. **Catálogo.** Crear `lib/games.ts` con los tipos, `ACCENTS`, los 8 juegos de la referencia (líneas 350–360), `CATEGORY_FILTERS` y `getGame`. Verificación: `npx tsc --noEmit` pasa.
3. **Rankings simulados.** Crear `lib/scores.ts` con los tipos, `MOCK_PLAYER_NAMES`, `getMockScores`, `buildLeaderboard` y `getBestScore`, según el modelo de datos. Verificación: `npx tsc --noEmit` pasa.
4. **Almacenamiento reactivo.** Crear `lib/storage.ts`, `lib/session.ts` y `lib/local-scores.ts`. Verificación: `npx tsc --noEmit` pasa.
5. **Hero de la Biblioteca.** Crear `components/library/LibraryHero.tsx` (líneas 98–101) y reemplazar todo el contenido de `app/page.tsx` para que solo lo renderice. Verificación: en `/` desaparece el logo de Next y se ve el título con degradado animado y el subtítulo parpadeando.
6. **Layout raíz y fondo.** Crear `components/layout/BackgroundEffects.tsx` con la cuadrícula synthwave, el resplandor superior y las scanlines fijas (líneas 32–35 y 344–346). En `app/layout.tsx`: `lang="es"`, metadata con template y descripción en español, `BackgroundEffects` y un `<main>` por encima del fondo. Agregar a `app/globals.css` el bloque `@media (prefers-reduced-motion: reduce)` que desactiva las animaciones en bucle. Verificación: la cuadrícula se mueve y las scanlines cubren la página. Con reduced motion emulado en DevTools, la cuadrícula y el título quedan quietos.
7. **Componentes UI base.** Crear `components/ui/Logo.tsx` (tamaños `nav` y `card`, líneas 39 y 273) y `components/ui/NeonButton.tsx` con las variantes `outline`, `solid`, `dashed` y `ghost`, las props `accent` y `size`, y `Link` cuando recibe `href`. Verificación: `npx tsc --noEmit` y `npm run lint` pasan.
8. **Navbar de escritorio.** Crear `components/layout/Navbar.tsx` (cliente, líneas 37–61) y montarlo en el layout. El estado activo sale de `usePathname()`: `/hall-of-fame` activa «Salón de la Fama», `/login` no activa ninguno y el resto activa «Biblioteca». A la derecha va INICIAR SESIÓN (→ `/login`) o el avatar, según `useSession()`. Verificación: los links navegan y el subrayado cian sigue a la ruta activa.
9. **Menú móvil.** Crear `components/layout/MobileMenu.tsx` (líneas 62–92). Debajo de `md`, el navbar oculta los links y la zona de sesión, y muestra el botón hamburguesa (`aria-label="Menú"`). El menú se cierra con X, con el fondo oscuro y al navegar. Verificación: a 375 px de ancho el menú abre, navega y se cierra.
10. **404 temática.** Crear `app/not-found.tsx` con el título pixelado rosa «GAME OVER», el texto «PÁGINA NO ENCONTRADA» y el botón VOLVER AL INICIO. Verificación: `/cualquier-cosa` muestra esa pantalla dentro del layout.
11. **Tarjetas de juego.** Crear `components/game/GameCover.tsx` con las variantes `card` (4:3, con la inicial y «portada: {id}») y `screenshot` (16:9, con «captura del juego: {id}»). Crear `components/library/GameCard.tsx` (líneas 121–137) y `components/library/LibraryView.tsx` (cliente) con la grilla `repeat(auto-fill, minmax(260px, 1fr))`, y renderizarla en `app/page.tsx`. El color de cada juego se pasa con las variables CSS `--accent` y `--accent-tint` en estilo en línea. Verificación: se ven 8 tarjetas y JUGAR lleva a `/games/{id}`.
12. **Tilt 3D.** En `GameCard`, calcular la rotación con el mouse (`rx = −py × 10`, `ry = px × 12`) y escribirla en las variables CSS `--rx` y `--ry`. El hover eleva la tarjeta y cambia el borde y el glow al color del juego. La rotación y la elevación solo aplican con la variante `motion-safe:`. Verificación: la tarjeta se inclina siguiendo el mouse. Con reduced motion solo cambian el borde y el glow.
13. **Búsqueda y categorías.** Crear `components/library/SearchBar.tsx` y `components/library/CategoryFilter.tsx` (líneas 103–117) y filtrar en `LibraryView` con `normalizeText`. Agregar el estado vacío. Verificación: los casos de búsqueda de los criterios de aceptación.
14. **Detalle.** Crear `app/games/[id]/page.tsx` con `generateStaticParams` desde `GAMES`, `dynamicParams = false`, `generateMetadata` y `notFound()` si `getGame` no encuentra el juego. Renderizar la columna principal (líneas 145–160), con JUGAR AHORA → `/games/{id}/play`. Crear `components/game/PlayingAs.tsx` (cliente) para la línea «Jugando como …». Verificación: `/games/snake` muestra el contenido y `/games/xyz` muestra la 404.
15. **Ranking del Detalle.** Crear `components/ui/rank-styles.ts` y `components/game/DetailLeaderboard.tsx` (cliente, líneas 161–175) con `buildLeaderboard` y `useLocalScores`. Las filas entran escalonadas (`i × 0.06 s`). Verificación: el top 10 de `/games/snake` coincide con los criterios.
16. **Maqueta del Reproductor.** Crear `app/games/[id]/play/page.tsx` (con los mismos `generateStaticParams`, `dynamicParams` y `notFound`), `components/game/PlayerView.tsx` (cliente), `components/game/PlayerHud.tsx` y `components/game/CrtScreen.tsx`. `CrtScreen` incluye el gabinete, la pantalla 4:3, el overlay CRT, «E1230-CRT», el LED y el placeholder IFRAME SANDBOX (líneas 182–231). SALIR lleva a `/games/{id}`. Verificación: se ve la maqueta completa con el HUD en `0`, `■■■` y `01`.
17. **Carga y pausa.** Crear `components/game/PixelLoader.tsx` (líneas 209–219). Al montar, el estado `loading` dura ~1100 ms y luego pasa a `ready`. Agregar el overlay PAUSA, el texto PAUSA/SEGUIR y la tecla P. Pausar no hace nada durante `loading` ni `over`. Los timers y listeners se limpian al desmontar. Verificación: CARGANDO… aparece y desaparece, y PAUSA y P alternan el overlay.
18. **Simulación de partida.** SIMULAR PARTIDA pasa a `simulating` y corre los ticks según el modelo de datos. Un segundo clic no arranca otra simulación. Verificación: el HUD sube la puntuación y el nivel y baja las vidas hasta `□□□`.
19. **Fin del juego.** Crear `components/game/GameOverModal.tsx` (líneas 243–266). GUARDAR PUNTUACIÓN llama a `saveScore` con `{ name: getPlayerName(user), score, date: formatToday() }`, oculta el botón y escribe «PUNTUACIÓN GUARDADA» a 60 ms por letra con un cursor `_` que parpadea. La nota de invitado se muestra cuando no hay sesión o la sesión es de invitado. JUGAR DE NUEVO reinicia el estado y vuelve a `loading`. Verificación: los criterios del Reproductor.
20. **Maqueta y validación de Autenticación.** Crear `app/login/page.tsx`, `components/auth/AuthCard.tsx` (cliente, líneas 271–303) y `components/auth/AuthField.tsx`. Las validaciones van en este orden: «Ingresa tu usuario.», luego (solo al crear cuenta, regex `/.+@.+\..+/`) «Ingresa un correo electrónico válido.», y luego «La contraseña debe tener al menos 4 caracteres.». Cambiar de pestaña borra el error. Verificación: los mensajes de los criterios.
21. **Sesión simulada.** Un envío válido, Google, GitHub o JUGAR COMO INVITADO llaman a `signIn` con los valores de la tabla del modelo de datos, limpian el formulario y hacen `router.push("/")`. «cerrar sesión» (navbar y menú móvil) llama a `signOut` y cierra el menú. Verificación: los criterios de sesión.
22. **Salón de la Fama.** Crear `app/hall-of-fame/page.tsx`, `components/hall-of-fame/HallOfFameView.tsx` (cliente, juego seleccionado en estado local, por defecto `arkanoid`), `components/hall-of-fame/GameTabs.tsx` (con scroll horizontal) y `components/hall-of-fame/HallOfFameTable.tsx` (líneas 309–327). Verificación: cambiar de pestaña cambia la tabla.
23. **Marca personal.** En `HallOfFameTable`, agregar la etiqueta «· TÚ» y el borde rosa en las filas `isMine`, y la fila «TU MEJOR MARCA» con la mejor puntuación local del usuario con sesión (no invitado) para el juego seleccionado (líneas 328–335). En `HallOfFameView`, agregar el párrafo con el link «Inicia sesión» (→ `/login`) cuando no hay sesión (líneas 337–339). Verificación: los criterios del Salón de la Fama.
24. **Documentación.** Reescribir la sección «Proyecto» de `CLAUDE.md`: ya no es un scaffold, y se agregan las rutas, las carpetas `components/` y `lib/` y las claves de localStorage. Verificación: el texto describe el estado real del repo.

## Criterios de aceptación

**Generales**

- [x] `npm run build` termina sin errores.
- [x] `npm run lint` termina sin errores.
- [x] Al recorrer las cinco pantallas, la consola del navegador no muestra errores ni advertencias de hidratación.
- [x] `/` ya no muestra nada del scaffold (logo de Next, «To get started», botones Deploy/Documentation).
- [x] `<html>` tiene `lang="es"`.
- [ ] Las puntuaciones usan formato `es-MX`: el primer puesto de ARKANOID se muestra como `42,000`.
- [ ] `grep -rn "Introduce" app components lib` no devuelve resultados.

**Layout y navegación**

- [ ] En `/` y `/games/snake` el link «Biblioteca» está activo. En `/hall-of-fame`, «Salón de la Fama» está activo. En `/login` ninguno lo está.
- [ ] Hacer clic en el logo lleva a `/`.
- [ ] A 375 px de ancho no se ven los links ni INICIAR SESIÓN, y el botón hamburguesa abre el menú lateral.
- [ ] El menú lateral se cierra con X, al tocar el fondo oscuro y al elegir un link.
- [ ] `/games/xyz` y `/cualquier-cosa` muestran la 404 temática con VOLVER AL INICIO, que lleva a `/`.

**Biblioteca**

- [ ] `/` muestra 8 tarjetas. La de SNAKE dice «MEJOR PUNTUACIÓN 56,600» cuando no hay puntuaciones locales.
- [ ] Buscar `tetr` deja solo TETRIS.
- [ ] Buscar `clasicos` (sin acento) deja ARKANOID, SNAKE y FROGGER.
- [ ] Buscar `zzz` muestra «NINGÚN JUEGO COINCIDE CON TU BÚSQUEDA».
- [ ] El chip «Disparos» deja SPACE INVADERS, ASTEROIDS y GALAGA, y se muestra en rosa como activo.
- [ ] Al pasar el mouse sobre una tarjeta, esta se inclina y su borde toma el color del juego.

**Detalle**

- [ ] `/games/snake` muestra el badge «Clásicos», el título SNAKE, la captura placeholder, la descripción larga y JUGAR AHORA con pulso.
- [ ] El ranking de `/games/snake` empieza con `01 · VOXEL · 07/09/2026 · 56,600` en dorado y termina en el puesto `10` con `13,300`.
- [ ] Sin sesión se lee «Jugando como INVITADO · las puntuaciones solo se guardan en este dispositivo».

**Reproductor**

- [ ] `/games/snake/play` muestra «CARGANDO…» durante ~1 s y luego el placeholder con `juegos/snake.html`.
- [ ] PAUSA muestra el overlay «PAUSA» y cambia el botón a SEGUIR. La tecla P hace lo mismo.
- [ ] Durante «CARGANDO…», PAUSA y la tecla P no hacen nada.
- [ ] SIMULAR PARTIDA hace subir la puntuación. Las vidas pasan de `■■■` a `□□□` y el modal «FIN DEL JUEGO» aparece a los ~3,6 s con el nivel en `04`.
- [ ] GUARDAR PUNTUACIÓN escribe «PUNTUACIÓN GUARDADA» letra por letra, desaparece, y `localStorage.e1230_scores.snake` contiene la nueva entrada con la fecha de hoy.
- [ ] Tras guardar una partida de SNAKE, esa puntuación aparece en el ranking de `/games/snake` (cualquier partida simulada supera los 13,300 puntos del puesto 10).
- [ ] JUGAR DE NUEVO vuelve a «CARGANDO…» y deja el HUD en `0`, `■■■` y `01`.
- [ ] SALIR lleva a `/games/snake`. Salir a mitad de una simulación no deja errores en la consola.

**Autenticación**

- [ ] El campo «Correo electrónico» solo aparece en la pestaña CREAR CUENTA, y el botón de envío dice ENTRAR o CREAR CUENTA según la pestaña.
- [ ] Enviar con el usuario vacío muestra «Ingresa tu usuario.».
- [ ] En CREAR CUENTA, con el usuario `maria` y el correo `maria`, se muestra «Ingresa un correo electrónico válido.».
- [ ] Con el usuario `maria` y la contraseña `abc` se muestra «La contraseña debe tener al menos 4 caracteres.».
- [ ] Cambiar de pestaña borra el mensaje de error.
- [ ] ENTRAR con `maria` / `1234` lleva a `/` y el navbar muestra el avatar «M» y el nombre «MARIA». Recargar la página conserva la sesión.
- [ ] «cerrar sesión» vuelve a mostrar INICIAR SESIÓN.
- [ ] Google deja la sesión como «JUGADOR_G» y GitHub como «JUGADOR_GH».
- [ ] JUGAR COMO INVITADO deja la sesión como «INVITADO». En ese estado el modal «FIN DEL JUEGO» muestra «Como invitado, se guarda solo en este dispositivo.».

**Salón de la Fama**

- [ ] `/hall-of-fame` abre con la pestaña ARKANOID activa y la primera fila `01 · NEÓN_77 · 42,000 · 01/09/2026`.
- [ ] Elegir otra pestaña cambia la tabla al ranking de ese juego.
- [ ] Sin sesión se ve «Inicia sesión para ver tu mejor marca destacada.» y el link lleva a `/login`.
- [ ] Con sesión como MARIA y una partida de SNAKE guardada, la pestaña SNAKE muestra la fila «TU MEJOR MARCA» con esa puntuación, y la fila de MARIA en la tabla lleva «· TÚ» y el borde rosa.

**Movimiento reducido**

- [ ] Con `prefers-reduced-motion: reduce` emulado en DevTools, no se anima en bucle ninguno de estos elementos: título de la Biblioteca, «INSERTA UNA MONEDA PARA JUGAR», cuadrícula, JUGAR AHORA, «CARGANDO…» y «PAUSA».
- [ ] En ese mismo modo, las tarjetas no rotan ni se elevan en hover.

## Decisiones

- **Sí:** rutas reales en inglés (`/`, `/games/[id]`, `/games/[id]/play`, `/login`, `/hall-of-fame`). Los nombres de carpeta son código y la regla del repo es código en inglés. Además cada pantalla se puede enlazar y funciona con el historial.
- **No:** URLs en español. Rompen la regla de código en inglés.
- **No:** una sola página con estado como la referencia. No habría URLs ni historial.
- **Sí:** interactividad simulada completa (filtros, validación, sesión y partida simulada). Permite ver y revisar todos los estados de la UI antes de tener backend.
- **No:** maqueta estática. Dejaría sin validar estados como el avatar, «· TÚ» o «TU MEJOR MARCA».
- **Sí:** localStorage con las mismas claves de la referencia (`e1230_user`, `e1230_scores`). Es suficiente para simular y la auth real lo va a reemplazar.
- **No:** cookies ni sesión en servidor. Sería construir auth a medias.
- **Sí:** `useSyncExternalStore` en `lib/storage.ts`. El layout sigue siendo Server Component, el navbar se actualiza al instante tras el login y el server snapshot evita advertencias de hidratación.
- **No:** Context Provider global. Obligaría a volver cliente al layout sin ganar nada.
- **No:** `useState` + `useEffect` leyendo localStorage en cada componente. Duplica lecturas y los componentes pueden quedar desincronizados.
- **Sí:** `generateStaticParams` + `dynamicParams = false` + `notFound()` en el Detalle y el Reproductor. Los 8 juegos se prerenderizan y cualquier otro id da 404. `notFound()` también sirve para acotar el tipo en TypeScript.
- **Sí:** `app/not-found.tsx` temático, genérico para cualquier URL («PÁGINA NO ENCONTRADA»).
- **No:** `global-not-found.js`. Es experimental, requiere un flag y no hace falta con un solo root layout.
- **Sí:** el color de cada juego como variables CSS (`--accent`, `--accent-tint`) en estilo en línea, consumidas con utilidades como `text-(--accent)`.
- **No:** clases interpoladas (`` `text-${color}` ``). Tailwind no las detecta al escanear el código.
- **Sí:** SIMULAR PARTIDA idéntico a la referencia (100 ms por tick, 36 ticks). Muestra todos los estados del HUD y termina en el modal.
- **No:** un botón que abra el modal directamente. No se vería el HUD animándose.
- **Sí:** guardar la puntuación en localStorage y mezclarla con los rankings. Sin eso no se pueden ver «· TÚ» ni «TU MEJOR MARCA».
- **Sí:** tecla P para pausar.
- **No:** d-pad y pista de teclado. Son exclusivos del Snake y vuelven con ese juego.
- **Sí:** portadas con placeholder rayado. No depende de assets.
- **No:** imágenes reales por ahora.
- **Sí:** efectos siempre activos, respetando `prefers-reduced-motion`. Mejora la accesibilidad con poco código.
- **No:** toggles configurables. No hay nadie que los cambie en tiempo de ejecución.
- **Sí:** tilt con variables CSS (`--rx`, `--ry`) y la variante `motion-safe:`. Respeta el movimiento reducido sin un hook de JS.
- **Sí:** breakpoint `md` de Tailwind (768 px) en lugar de los 760 px de la referencia. La diferencia es irrelevante y evita un breakpoint personalizado.
- **Sí:** textos de la referencia adaptados a español latino. Solo cambian «Introduce tu usuario.» → «Ingresa tu usuario.» y «Introduce un correo electrónico válido.» → «Ingresa un correo electrónico válido.», además del formato de números `es-ES` → `es-MX`.
- **Sí:** los 8 juegos, los 12 nombres y el generador determinista de la referencia. Los rankings son reproducibles y permiten criterios de aceptación exactos.
- **Sí:** `/login` muestra el formulario aunque haya sesión. Un nuevo login reemplaza la sesión simulada.
- **No:** guardas de rutas. La auth real las va a definir.
- **Sí:** el Reproductor no exige sesión (juega como INVITADO), igual que la referencia.
- **Sí:** el juego del Salón de la Fama en estado local.
- **No:** `?game=` en la URL. Se puede agregar después sin tocar la tabla.
- **Sí:** un solo spec. Todo es la misma área (UI con datos mock) y comparte catálogo y componentes.
- **No:** dividir en dos specs.
- **Sí:** `components/` por pantalla y `lib/` en la raíz, importados con `@/`.
- **No:** `app/_components/`. Mezcla UI con rutas.
- **Sí:** actualizar `CLAUDE.md` al final. Hoy dice que el repo es solo el scaffold, y eso dejaría de ser cierto.

## Riesgos

| Riesgo                                                                                                                     | Mitigación                                                                                                                               |
| -------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| El servidor no conoce localStorage: en la primera carga el navbar muestra INICIAR SESIÓN y cambia al avatar tras hidratar. | Se acepta en el MVP. El server snapshot devuelve `null`, así que React actualiza sin advertencias. La auth real con cookies lo resuelve. |
| Si `getSnapshot` devuelve un objeto nuevo en cada llamada, se produce un bucle infinito de renders.                        | Caché por string crudo en `lib/storage.ts`. `fallback` siempre es una constante de módulo.                                               |
| localStorage bloqueado (modo privado o cookies bloqueadas) o con JSON corrupto.                                            | `try/catch` en lectura y escritura con fallback al valor por defecto. La UI funciona sin persistir.                                      |
| `Intl.NumberFormat("es-MX")` formatea distinto en Node y en el navegador, lo que causa un mismatch de hidratación.         | Node 24 incluye ICU completo. Si aparece la advertencia, `formatScore` pasa a un formateador manual con comas.                           |
| Timers de carga, simulación o escritura siguen vivos al salir del Reproductor.                                             | Se limpian en el cleanup de cada `useEffect`. Hay un criterio de aceptación para salir a mitad de partida.                               |
| Scanlines con `mix-blend-mode`, `backdrop-filter` y la cuadrícula animada pesan en móviles de gama baja.                   | Se acepta en el MVP. Con movimiento reducido se detiene la cuadrícula.                                                                   |
| Next.js 16 tiene APIs distintas a las conocidas (`params` es una `Promise` y `PageProps` es global).                       | Consultar `node_modules/next/dist/docs/` antes de cada API dudosa, como pide `AGENTS.md`.                                                |

## Lo que **no** entra en este spec

- Ningún juego: ni el Snake, ni el iframe, ni `postMessage`.
- Autenticación real, OAuth, backend o ranking global en servidor.
- D-pad móvil y pistas de teclado de juegos.
- Guardas de rutas y redirecciones por sesión.
- Imágenes reales de portada.
- Toggles de efectos, tema claro y selección de juego en la URL.
- Framework de tests.
- Limpieza de los SVG de `public/`.

Si alguna de estas llega, va en su propio spec.
