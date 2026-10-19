# SPEC 13 — Rendimiento de FROGGER

> **Estado:** Implementado
> **Depende de:** SPEC 11 (`specs/11-frogger-game.md`), SPEC 12 (`specs/12-frogger-skins.md`)
> **Fecha:** 2026-10-12
> **Objetivo:** Que FROGGER cumpla el presupuesto de rendimiento en todas sus skins (Clásico, Neón y Retro), sin cambiar su jugabilidad ni su look, eliminando el loop que sigue dibujando debajo del modal de fin de partida, los ~94 dibujos con `shadowBlur` por frame de Neón y el redibujo del terreno estático de Retro, y limpiando las asignaciones por frame.

## Por qué existe este spec

Es la primera revisión de rendimiento de FROGGER (y del proyecto). El motor es correcto en lo básico: un solo `requestAnimationFrame` vivo, `dt` acotado, `pause()` que cancela el loop (0 dibujos en pausa), callbacks al Reproductor solo cuando cambia el valor (0 mutaciones del DOM por segundo) y sin `getImageData`, gradientes ni `new Image`/`new Audio` en el loop. Los frames salen a 60 fps en las tres skins: el coste de dibujo de Neón y de Retro no aparece en el p95 de este equipo, pero sí en los contadores del contexto 2D, y en un celular de gama media (donde el `shadowBlur` se rasteriza en CPU o en una GPU modesta) sí pesaría.

Hay dos incumplimientos medidos del presupuesto y un tercer hallazgo de trabajo inútil:

1. **Tras `onGameOver` el loop sigue vivo** (`game.ts:394-400`) y dibuja 194,6 veces por frame en Clásico y 1469,9 en Retro mientras el modal «FIN DEL JUEGO» tapa el canvas. El presupuesto exige 0.
2. **Neón dibuja 94,4 veces por frame con `shadowBlur > 0`** (presupuesto: ≤ 10). Cada vehículo, tronco y tortuga aplica el glow en vivo, y cada rana de una boca ocupada cuesta 6 dibujos con glow.
3. **Retro redibuja el terreno entero cada frame**: unos 751 `fillRect` idénticos de 1444,7 por frame (cálculo leyendo `drawTerrain`). El JS del loop cuesta 0,415 ms por frame en Retro contra 0,053 ms en Clásico.

### Medición inicial (2026-10-12, servidor de desarrollo, 1280 × 900, sin estrangular salvo donde se indica)

| Skin    | Escenario      | p95 (ms)                                       | Frames > 33 ms | Glow/frame | Dibujos/frame | Mutaciones/s |
| ------- | -------------- | ---------------------------------------------- | -------------- | ---------- | ------------- | ------------ |
| Clásico | Normal (8 s)   | 17,6                                           | 0 %            | 0          | 206,5         | 0            |
| Clásico | CPU ×4 (8 s)   | 17,6                                           | 0 %            | 0          | 204,0         | 0            |
| Clásico | Pausa (2 s)    | 17,5                                           | 0 %            | 0          | **0**         | 0            |
| Clásico | Fin de partida | 17,5                                           | 0 %            | 0          | **194,6**     | 0            |
| Neón    | Normal (8 s)   | 17,6                                           | 0 %            | **94,4**   | 204,9         | 0            |
| Neón    | CPU ×4 (8 s)   | 17,6                                           | 0 %            | **95,2**   | 205,6         | 0,13         |
| Neón    | Pausa (2 s)    | 17,1                                           | 0 %            | 0          | **0**         | 0            |
| Neón    | Fin de partida | no medido (mismo camino de código que Clásico) |                |            |               |              |
| Retro   | Normal (8 s)   | 17,6                                           | 0 %            | 0          | 1444,7        | 0            |
| Retro   | CPU ×4 (8 s)   | 17,6                                           | 0 %            | 0          | 1448,4        | 0            |
| Retro   | Pausa (2 s)    | 17,5                                           | 0 %            | 0          | **0**         | 0            |
| Retro   | Fin de partida | 17,5                                           | 0 %            | 0          | **1469,9**    | 0            |

Medición complementaria: tiempo de JS de la función `loop` del motor (envolviendo `requestAnimationFrame`, 3 a 4 s por skin, sin la instrumentación de contadores): Clásico 0,053 ms de media (p95 0,2), Neón 0,079 ms (p95 0,3; con CPU ×4, 0,083 ms), Retro 0,415 ms (p95 0,9). El coste del glow de Neón se paga en el rasterizado, que no aparece en el JS.

Heap en ventanas de 8 s: entre −3,75 y +1,36 MB en las tres skins, normal y con ×4 (el recolector lo recupera: no hay fuga). No se midió la ventana de 60 s: la rana muere sola a los ~48 s sin entrada y la revisión de código no sospecha de fugas.

Salvedades de la medición:

- El p95 de frame sale pegado a 16,7 ms porque el equipo de prueba va a 60 fps con mucho margen; no discrimina entre skins. Los contadores y el JS del `loop` sí.
- El estrangulamiento CPU ×4 por CDP **no cambió** el JS del `loop` (Neón 0,079 → 0,083 ms), así que el p95 «con CPU ×4» no es informativo en este equipo. Por eso los criterios usan los contadores y el JS del `loop`, además del p95.
- La fila «Fin de partida» de Neón no se midió; comparte el camino de código con Clásico (el loop de `game.ts` no distingue skins).
- Capturas base: `.playwright-screenshots/performance/frogger/classic-base.png`, `neon-base.png` y `retro-base.png`.

## Alcance

### Incluye

- `lib/arcade/frogger/game.ts`
  - El loop termina tras dibujar el último frame de `gameover`; `resume()` no lo reinicia en ese estado.
  - `readInput` sin `map`/`some` por frame; vista de dibujo reutilizada en lugar de un objeto nuevo por frame; `imageSmoothingEnabled = false` una sola vez; `state.clock` acotado al ciclo de las tortugas.
  - Crea en `create` la caché de sprites con glow (solo Neón) y la capa de terreno (solo Retro) y las pasa a los renderers.
- `lib/arcade/frogger/render.ts`
  - Literales y closures por frame pasan a constantes de módulo o a bucles.
  - Las funciones de entidades de los carriles se reúnen en `drawLaneEntity`, que usan tanto el dibujo en vivo (Clásico) como el constructor de sprites (Neón).
  - En Neón, vehículos, troncos, tortugas y ranas de las bocas se dibujan con `drawImage` desde la caché.
- `lib/arcade/frogger/glow-sprites.ts` (nuevo): la caché de sprites con el glow horneado.
- `lib/arcade/frogger/render-pixel.ts`
  - `drawTerrain` se exporta y se dibuja una sola vez en una capa; `drawGamePixels` la copia con un `drawImage`.
  - `[MEDIAN_ROW, START_ROW]` y el `forEach` de las bocas pasan a constante y bucle.
- `references/game-performance.md`: marcar `frogger` como `[x]` con la medición final.

### Fuera de alcance

- Los otros motores (arkanoid, tetris, snake, asteroids) y el catálogo sin motor.
- Cualquier cambio de jugabilidad (física, tiempos, puntuación, nivel, hitboxes) o de look (colores, `glow: 8`, grosores, sprites de Retro).
- `PlayerView`, `GameCanvas`, `PlayerHud`, `CrtScreen`, `MobileGamepad`, `lib/arcade/shared/` y `lib/arcade/engine.ts`: la medición no muestra renders ni mutaciones fuera de lo esperado (0 mutaciones/s), así que no hay «Cambios compartidos».
- Caché del fondo de Clásico y Neón, caché de las entidades de Retro, índices por fila en `lanes.ts`.
- Workers, `OffscreenCanvas`, `devicePixelRatio`, cambiar `width`/`height`, `ctx.filter`, dependencias nuevas y profiling formal con DevTools.

## Hallazgos

| #   | `archivo:línea`                                                                                | Función                                                                                                               | Patrón                                                                                                                                                                              | Frecuencia                            | Skins                | Severidad | Evidencia                                                                                                         |
| --- | ---------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------- | -------------------- | --------- | ----------------------------------------------------------------------------------------------------------------- |
| H1  | `game.ts:394-400` y `game.ts:427-434`                                                          | `loop`, `resume`                                                                                                      | Tras `finishGame()` (`game.ts:184-188`) el loop sigue llamando `update` y `draw` y pidiendo frames con el modal encima; `resume()` también lo reiniciaría                           | por frame, de forma indefinida        | Clásico, Neón, Retro | Alta      | 194,6 dibujos/frame (Clásico) y 1469,9 (Retro) con «FIN DEL JUEGO» visible; presupuesto 0                         |
| H2  | `render.ts:143-288`, `render.ts:325-385`                                                       | `drawCar`, `drawTractor`, `drawTruck`, `drawLog`, `drawTurtles`, `drawFrog`, `drawOccupiedGoals`                      | `applyGlow` por entidad: coche y tractor 1 dibujo con glow, camión 2, tronco 3 (relleno + 2 vetas), tortuga 2 por casco, rana 6 (4 patas + cuerpo + borde), 6 por cada boca ocupada | por entidad por frame (≈ 40 visibles) | Neón                 | Alta      | 94,4 dibujos con `shadowBlur > 0` por frame (95,2 con ×4); presupuesto ≤ 10                                       |
| H3  | `render-pixel.ts:202-258` y `render-pixel.ts:335`                                              | `drawTerrain` (llamada desde `drawGamePixels`)                                                                        | Terreno estático (fondo, 120 teselas de río, 20 de seto, rayas, franjas, bocas) redibujado en cada frame: ≈ 751 de los 1444,7 `fillRect`                                            | por frame                             | Retro                | Media     | JS del loop 0,415 ms contra 0,053 ms de Clásico; 1444,7 dibujos/frame contra ≈ 205 de Clásico/Neón                |
| H4  | `render.ts:104`, `156`, `212`, `245`, `337`, `341`, `361`, `380`; `render-pixel.ts:227`, `338` | `drawBackground`, `drawCar`, `drawTruck`, `drawLog`, `drawFrog`, `drawOccupiedGoals`, `drawTerrain`, `drawGamePixels` | Arreglos literales (`[MEDIAN_ROW, START_ROW]`, `[x + 4, x + width - 12]`, `[y + 10, y + 20]`, `[-1, 1]`), objeto `side` y closures `forEach` creados por frame o por entidad        | por frame / por entidad por frame     | Clásico, Neón, Retro | Baja      | Costo evidente: ~40 arreglos y closures por frame en Clásico; sin medición propia                                 |
| H5  | `game.ts:278`                                                                                  | `readInput`                                                                                                           | `codes.map(...).some(Boolean)` crea un arreglo por cada una de las 4 direcciones                                                                                                    | 4 arreglos por frame                  | Todas                | Baja      | Costo evidente; hay que seguir consumiendo todas las teclas del grupo (no cortocircuitar)                         |
| H6  | `game.ts:364-382`                                                                              | `buildView`                                                                                                           | Un `RenderState` nuevo con un objeto `frog` anidado por frame                                                                                                                       | 2 objetos por frame                   | Todas                | Baja      | Costo evidente; el render no retiene la vista                                                                     |
| H7  | `game.ts:387`                                                                                  | `draw`                                                                                                                | `ctx.imageSmoothingEnabled = false` reasignado en cada frame                                                                                                                        | por frame                             | Retro                | Baja      | Basta una vez en `create`: el canvas no cambia de tamaño                                                          |
| H8  | `game.ts:346`                                                                                  | `update`                                                                                                              | `state.clock += dt` crece sin límite y solo alimenta `wrap(clock + fase, TURTLE_CYCLE)` (`lanes.ts:80`)                                                                             | por frame                             | Todas                | Baja      | Acotarlo con `% TURTLE_CYCLE` no cambia el resultado de `turtleState` y evita perder precisión en sesiones largas |

Lo que se revisó y está bien (sin hallazgo): un solo `requestAnimationFrame` vivo (`start`/`resume` llaman a `stopLoop()` antes), `dt` acotado con `MAX_DT` y `lastTime = null` en `start`/`resume`, `pause()` cancela el loop y suelta el teclado, `destroy()` cancela el loop y quita los listeners, `callbacks.on*` solo en `addScore`, `killFrog` y `handleGoal`/`start` (siempre al cambiar el valor), sin `createLinearGradient`/`getImageData`/`new Image`/`new Audio`/`Path2D`/`setLineDash`, sin `measureText` ni `fillText`, sin colecciones que crezcan, y el Reproductor sin renders continuos (0 mutaciones/s).

## Rutas y archivos

```
lib/arcade/frogger/
  game.ts            (cambia)  loop que termina en gameover, resume, readInput, vista reutilizada, clock acotado,
                               imageSmoothingEnabled una vez, crea la caché (Neón) y la capa de terreno (Retro)
  render.ts          (cambia)  constantes y bucles en lugar de literales, drawLaneEntity, dibujo con la caché en Neón
  render-pixel.ts    (cambia)  exporta drawTerrain, drawGamePixels copia la capa de terreno
  glow-sprites.ts    (nuevo)   createGlowSpriteCache: sprites de vehículos, troncos, tortugas y rana con el glow horneado
references/
  game-performance.md (cambia) frogger pasa a [x] con la medición final
```

**Sin cambios:** `lib/arcade/frogger/lanes.ts`, `constants.ts`, `skins.ts`, `sprites.ts`, `index.ts`; los otros motores (`arkanoid`, `asteroids`, `snake`, `tetris`); `lib/arcade/engine.ts`, `registry.ts` y `shared/`; `components/` (Reproductor, `GameCanvas`, `CrtScreen`, `MobileGamepad`); `public/`; el ranking y las páginas; el resto de `references/`.

## Modelo de datos

**Constantes de módulo nuevas** (`render.ts`):

```ts
const SAFE_ROWS = [MEDIAN_ROW, START_ROW] as const; // franjas con borde
const SIGNS = [-1, 1] as const; // patas y ojos de la rana
```

`render-pixel.ts` reutiliza `SAFE_ROWS` (se exporta desde `render.ts`) o declara la suya.

**Caché de sprites con glow** (`glow-sprites.ts`, solo para skins con `skin.glow > 0`, es decir Neón). Se construye **una vez en `createFroggerEngine`**, porque la skin no cambia durante la partida (si el jugador cambia de skin, `GameCanvas` destruye el motor y crea otro).

```ts
export interface GlowSprite {
  canvas: HTMLCanvasElement;
  pad: number; // px de margen para que el blur no se recorte (= skin.glow * 2 = 16)
}

export interface LaneSprites {
  body: GlowSprite; // vehículo, tronco o tortuga visible
  sinking: GlowSprite | null; // solo tortugas: grupo hundiéndose
  submerged: GlowSprite | null; // solo tortugas: solo el contorno
}

export interface GlowSpriteCache {
  lanes: (LaneSprites | undefined)[]; // índice = fila del tablero; las filas de LANES son únicas
  frogIdle: GlowSprite; // rana mirando arriba, para las bocas ocupadas
}

export function createGlowSpriteCache(skin: FroggerSkin): GlowSpriteCache;
```

Variantes que guarda (todas salen de `LANES`, sin depender del nivel porque la velocidad solo cambia por `speedFactor`, positivo, y el signo de `dir` no cambia):

| Carril (`LANES`)             | Sprites                                               | Tamaño del canvas           |
| ---------------------------- | ----------------------------------------------------- | --------------------------- |
| Filas 10 y 12 (`car`)        | 1 (rosa y amarillo, según `colorRole`)                | `(40 + 32) × (40 + 32)`     |
| Fila 9 (`racer`)             | 1                                                     | `72 × 72`                   |
| Fila 11 (`tractor`, derecha) | 1                                                     | `72 × 72`                   |
| Fila 8 (`truck`, izquierda)  | 1                                                     | `(80 + 32) × 72`            |
| Filas 1, 2, 4, 5 (`log`)     | 1 por fila (longitud 3, 2, 4, 3)                      | `(longitud × 40 + 32) × 72` |
| Filas 3 y 6 (`turtles`)      | 3 por fila: `body` (visible), `sinking` y `submerged` | `(longitud × 40 + 32) × 72` |
| Rana de las bocas            | 1 (`frogIdle`)                                        | `72 × 72`                   |

Son 16 canvases pequeños (unos 15 a 55 KB cada uno). El constructor lanza un error si dos entradas de `LANES` comparten fila (el índice por fila depende de que sean únicas).

**Capa de terreno de Retro** (`render-pixel.ts`): un `HTMLCanvasElement` de `WIDTH / pixelScale × HEIGHT / pixelScale` (160 × 120) con el resultado de `drawTerrain`, construido en `create` solo si `skin.pixelScale > 1`. `drawGamePixels(ctx, state, skin, terrain)` la copia con `ctx.drawImage(terrain, 0, 0)` en lugar de llamar a `drawTerrain`.

**Vista reutilizada** (`game.ts`): un único `RenderState` mutable creado en `create` (con su `frog` anidado), que `updateView()` rellena en cada frame y devuelve. Los renderers no retienen la vista.

No hay secciones de «Cambios compartidos»: ningún archivo de `components/`, `shared/` ni `engine.ts` cambia.

## Plan de implementación

Cada paso deja el juego funcional. Tras cada uno: `npx tsc --noEmit`, `npm run lint`, una partida en cada skin y el script **Medir** del paso.

### Paso 1 — El loop termina en `gameover` (H1)

En `game.ts`, `loop` deja de pedir frames cuando la partida terminó, y `resume()` no lo reinicia en ese estado.

```ts
// Antes (game.ts:394-400)
function loop(ts: number): void {
  const dt = lastTime === null ? 0 : Math.min((ts - lastTime) / 1000, MAX_DT);
  lastTime = ts;
  update(dt);
  draw();
  rafId = requestAnimationFrame(loop);
}

// Después
function loop(ts: number): void {
  const dt = lastTime === null ? 0 : Math.min((ts - lastTime) / 1000, MAX_DT);
  lastTime = ts;
  update(dt);
  draw();
  // Tras el fin de partida no hay nada que animar: el último frame queda bajo el modal.
  if (state.phase === "gameover") {
    rafId = null;
    return;
  }
  rafId = requestAnimationFrame(loop);
}
```

```ts
// Antes (game.ts:427-434)
resume() {
  if (destroyed) return;
  if (state.phase !== "gameover") keyboard.attach();
  lastTime = null;
  stopLoop();
  rafId = requestAnimationFrame(loop);
},

// Después
resume() {
  if (destroyed) return;
  // Tras el fin de partida el loop ya terminó, el teclado queda suelto y el canvas conserva el último frame.
  if (state.phase === "gameover") return;
  keyboard.attach();
  lastTime = null;
  stopLoop();
  rafId = requestAnimationFrame(loop);
},
```

El último frame se dibuja en el mismo tick en que `update` llama a `finishGame()`, así que la marca de choque fija sigue visible. JUGAR DE NUEVO desmonta `GameCanvas` (el estado pasa por `loading`) y crea un motor nuevo, así que no depende de `resume()`.

Verificación: **Medir** 2000 ms con el modal «FIN DEL JUEGO» abierto en cada skin: 0 dibujos por frame. Jugar de nuevo arranca una partida limpia con el loop vivo.

### Paso 2 — Higiene de asignaciones y estado (H4 a H8)

**`render.ts` y `render-pixel.ts` (H4).** Constantes de módulo y bucles sin closures:

```ts
// Antes (render.ts:104)
for (const row of [MEDIAN_ROW, START_ROW]) { … }
// Después
for (const row of SAFE_ROWS) { … }
```

```ts
// Antes (render.ts:156-159, drawCar; igual en drawTruck:212-215)
for (const wheelX of [x + 4, x + width - 12]) {
  drawWheel(ctx, skin, wheelX, y - 3, 8, 6);
  drawWheel(ctx, skin, wheelX, y + bodyHeight - 3, 8, 6);
}
// Después: mismo orden de dibujo, sin arreglo
drawWheelPair(ctx, skin, x + 4, y, bodyHeight);
drawWheelPair(ctx, skin, x + width - 12, y, bodyHeight);

function drawWheelPair(
  ctx: CanvasRenderingContext2D,
  skin: FroggerSkin,
  wheelX: number,
  y: number,
  bodyHeight: number,
): void {
  drawWheel(ctx, skin, wheelX, y - 3, 8, 6);
  drawWheel(ctx, skin, wheelX, y + bodyHeight - 3, 8, 6);
}
```

```ts
// Antes (render.ts:245, drawLog): for (const lineY of [y + 10, y + 20]) { … }
// Después
for (let vein = 1; vein <= 2; vein++) {
  const lineY = y + vein * 10;
  ctx.beginPath();
  ctx.moveTo(x + 6, lineY);
  ctx.lineTo(x + width - 6, lineY);
  ctx.stroke();
}
```

```ts
// Antes (render.ts:337, 341, 361 y 380, drawFrog y drawOccupiedGoals)
const side = { x: -forward.y, y: forward.x };
for (const legX of [-1, 1]) { for (const legY of [-1, 1]) { … } }
for (const sign of [-1, 1]) { … }
goals.forEach((occupied, index) => { … });
// Después
const sideX = -forward.y;
const sideY = forward.x;
for (const legX of SIGNS) { for (const legY of SIGNS) { … } }
for (const sign of SIGNS) { … }
for (let index = 0; index < goals.length; index++) {
  if (!goals[index]) continue;
  // …
}
```

En `render-pixel.ts`: `for (const row of SAFE_ROWS)` (línea 227) y el `forEach` de `drawGamePixels` (línea 338) pasa a `for`. Los trazos, el orden de dibujo y los colores no cambian.

**`game.ts` (H5 a H8).**

```ts
// Antes (game.ts:278)
const pressed = codes.map((code) => keyboard.consume(code)).some(Boolean);
// Después: consume todas las teclas del grupo, sin cortocircuitar
let pressed = false;
for (const code of codes) {
  if (keyboard.consume(code)) pressed = true;
}
```

```ts
// Antes (game.ts:346)
state.clock += dt;
// Después: el reloj solo alimenta el ciclo de las tortugas (lanes.ts:80)
state.clock = (state.clock + dt) % TURTLE_CYCLE;
```

(`TURTLE_CYCLE` se importa de `constants.ts`.)

```ts
// Antes (game.ts:364-382): buildView() devuelve un objeto nuevo
// Después: una vista creada una vez en create() y rellenada en cada frame
const view: RenderState = {
  phase: "playing",
  lanes: [],
  goals: [],
  clock: 0,
  frog: { x: 0, y: 0, facing: "up", hopping: false },
  tripFraction: 1,
  deathTimer: 0,
  deathX: 0,
  deathRow: START_ROW,
};

function updateView(): RenderState {
  const { frog } = state;
  view.phase = state.phase;
  view.lanes = state.lanes;
  view.goals = state.goals;
  view.clock = state.clock;
  view.frog.x = frogDrawX();
  view.frog.y = frogDrawRow() * CELL;
  view.frog.facing = frog.facing;
  view.frog.hopping = frog.hop !== null;
  view.tripFraction = state.tripLeft / tripTime(state.level);
  view.deathTimer = state.deathTimer;
  view.deathX = state.deathX;
  view.deathRow = state.deathRow;
  return view;
}
```

`updateView` reemplaza a `buildView` en `draw()`. `lanes` y `goals` se reasignan por referencia cada frame, así que `state.lanes = buildLanes(...)` y `state.goals = GOAL_COLS.map(...)` al completar una ronda se reflejan sin más.

```ts
// Antes (game.ts:387, dentro de draw): ctx!.imageSmoothingEnabled = false;
// Después: una sola vez en create(), cuando se crea el búfer de Retro
ctx.imageSmoothingEnabled = false;
```

(Se fija junto a la creación del búfer, solo si `skin.pixelScale > 1`. El canvas visible no cambia de tamaño después de `create`, así que la propiedad no se reinicia.)

Verificación: `npx tsc --noEmit` y `npm run lint`; una partida en cada skin con teclado (W A S D y flechas, también dos teclas a la vez) y con la tortuga que se hunde; **Medir** 8000 ms: dibujos por frame y glow iguales a la medición inicial (este paso no cambia lo que se dibuja).

### Paso 3 — Caché de sprites con glow para Neón (H2)

**`render.ts`.** Se reúne el `switch` de entidades en una función exportada que usan el dibujo en vivo y el constructor de sprites, y `drawTurtles` recibe el estado ya resuelto:

```ts
export function drawLaneEntity(
  ctx: CanvasRenderingContext2D,
  skin: FroggerSkin,
  entity: Entity,
  lane: Lane,
  turtle: TurtleState,
): void {
  switch (lane.kind) {
    case "car":
      drawCar(ctx, skin, entity, lane, 24);
      break;
    case "racer":
      drawCar(ctx, skin, entity, lane, 18);
      break;
    case "tractor":
      drawTractor(ctx, skin, entity, lane);
      break;
    case "truck":
      drawTruck(ctx, skin, entity, lane);
      break;
    case "log":
      drawLog(ctx, skin, entity, lane);
      break;
    case "turtles":
      drawTurtles(ctx, skin, entity, lane, turtle);
      break;
  }
}
```

`drawFrog` se exporta para que el constructor de sprites dibuje la rana de las bocas con el mismo código.

**`glow-sprites.ts` (nuevo).** El constructor reutiliza el dibujo en vivo: traslada el contexto del sprite `pad` px y dibuja con un carril sintético en la fila 0 y una entidad en `x = 0`, con el glow activo, así que el resultado es el mismo dibujo que hoy.

```ts
const ENTITY: Entity = { x: 0, dives: false };

function createSprite(
  skin: FroggerSkin,
  cells: number,
  paint: (ctx: CanvasRenderingContext2D) => void,
): GlowSprite {
  const pad = skin.glow * 2; // sigma del blur = glow / 2; 4 sigmas no se recortan
  const canvas = document.createElement("canvas");
  canvas.width = cells * CELL + 2 * pad;
  canvas.height = CELL + 2 * pad;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("No se pudo obtener el contexto 2D del sprite");
  ctx.translate(pad, pad);
  paint(ctx);
  return { canvas, pad };
}

export function createGlowSpriteCache(skin: FroggerSkin): GlowSpriteCache {
  const lanes: (LaneSprites | undefined)[] = [];
  for (const config of LANES) {
    if (lanes[config.row])
      throw new Error(`Fila duplicada en LANES: ${config.row}`);
    // Carril sintético: la fila 0 deja la entidad en (0, 0); solo importan el tipo, el largo, el signo y el color.
    const lane: Lane = {
      row: 0,
      kind: config.kind,
      length: config.length,
      velocity: config.dir,
      colorRole: config.colorRole ?? null,
      turtlePhase: 0,
      entities: [],
    };
    const make = (turtle: TurtleState) =>
      createSprite(skin, config.length, (ctx) =>
        drawLaneEntity(ctx, skin, ENTITY, lane, turtle),
      );
    lanes[config.row] = {
      body: make("visible"),
      sinking: config.kind === "turtles" ? make("sinking") : null,
      submerged: config.kind === "turtles" ? make("submerged") : null,
    };
  }
  const frogIdle = createSprite(skin, 1, (ctx) =>
    drawFrog(ctx, skin, 0, 0, "up", false),
  );
  return { lanes, frogIdle };
}
```

**`render.ts`: dibujo con la caché.** `drawGame` recibe `sprites: GlowSpriteCache | null` (`null` en Clásico). Con caché, cada entidad es un `drawImage` con coordenadas enteras; sin caché, el dibujo en vivo de siempre:

```ts
function drawLanes(
  ctx,
  skin,
  lanes,
  clock,
  sprites: GlowSpriteCache | null,
): void {
  for (const lane of lanes) {
    const laneSprites = sprites?.lanes[lane.row];
    for (const entity of lane.entities) {
      if (entity.x + lane.length * CELL <= 0 || entity.x >= WIDTH) continue;
      const turtle = turtleState(lane, entity, clock);
      if (laneSprites) {
        const sprite =
          turtle === "sinking"
            ? laneSprites.sinking!
            : turtle === "submerged"
              ? laneSprites.submerged!
              : laneSprites.body;
        ctx.drawImage(
          sprite.canvas,
          Math.round(entity.x) - sprite.pad,
          lane.row * CELL - sprite.pad,
        );
      } else {
        drawLaneEntity(ctx, skin, entity, lane, turtle);
      }
    }
  }
}
```

`drawOccupiedGoals` dibuja `sprites.frogIdle` en `(centerX - CELL / 2 - pad, GOAL_ROW * CELL - pad)` (enteros: `centerX - CELL / 2` es múltiplo de 20) cuando hay caché, y `drawFrog` en vivo si no. La rana que se mueve, la barra de tiempo y la marca de choque se quedan con glow en vivo (una sola vez por frame).

**`game.ts`.** En `create`: `const sprites = skin.glow > 0 ? createGlowSpriteCache(skin) : null;` y `draw()` pasa `sprites` a `drawGame`. Los colores, el orden de dibujo (carriles en orden, entidades en orden) y el `glow` de `skins.ts` no cambian.

Cuenta esperada de dibujos con glow por frame en Neón: rana en vivo 6 + barra de tiempo 1 = 7 (con la marca de choque en lugar de la rana: 1 + 1).

Verificación: **Medir** 8000 ms en Neón: `glowDraws` ≤ 10 (esperado ≈ 7); dibujos por frame no mayores que los 204,9 iniciales; comparar a ojo con `.playwright-screenshots/performance/frogger/neon-base.png` (vehículos, troncos, tortugas visibles/hundiéndose/sumergidas, ranas en las bocas ocupadas). Clásico y Retro: sin cambios en `glowDraws` (0).

### Paso 4 — Capa de terreno de Retro (H3)

Esta es la última corrección porque es la de menor beneficio medido: entra porque Retro es la skin con más dibujos (1444,7 por frame) y su JS del loop es 8 veces el de Clásico, y porque el terreno es idéntico entre frames (solo depende de la skin).

En `render-pixel.ts`, `drawTerrain` se exporta y se agrega:

```ts
export function createTerrainLayer(skin: FroggerSkin): HTMLCanvasElement {
  const width = WIDTH / skin.pixelScale;
  const height = HEIGHT / skin.pixelScale;
  const layer = document.createElement("canvas");
  layer.width = width;
  layer.height = height;
  const layerCtx = layer.getContext("2d");
  if (!layerCtx)
    throw new Error("No se pudo obtener el contexto 2D de la capa de terreno");
  drawTerrain(layerCtx, skin, width, height);
  return layer;
}
```

```ts
// Antes (render-pixel.ts:335)
drawTerrain(ctx, skin, width, height);
// Después: la capa es opaca y cubre todo el búfer, así que no hace falta limpiarlo
ctx.drawImage(terrain, 0, 0);
```

`drawGamePixels(ctx, state, skin, terrain)` recibe la capa. En `game.ts`, junto a la creación del búfer: `const terrain = skin.pixelScale > 1 ? createTerrainLayer(skin) : null;` y `draw()` la pasa. Todo son enteros de píxeles lógicos: el resultado es idéntico píxel a píxel.

Verificación: **Medir** 8000 ms en Retro: dibujos por frame ≤ 720 (1444,7 − ≈ 751 + 1 ≈ 695 esperado); JS del `loop` menor que los 0,415 ms iniciales; la captura coincide con `retro-base.png`.

### Paso 5 — Documentación

Marcar `frogger` como `[x]` en `references/game-performance.md` (resumen y detalle) con la medición final por skin y escenario, y añadir la línea al historial. No se toca ningún otro archivo de `references/`.

## Criterios de aceptación

### Generales

- [ ] `npx tsc --noEmit` y `npm run lint` pasan sin errores.
- [ ] `git diff main -- public/ references/` solo muestra `references/game-performance.md`.
- [ ] Ningún otro motor cambia (`git diff main --stat` solo lista `lib/arcade/frogger/`, `specs/13-frogger-performance.md` y `references/game-performance.md`), y no cambia ningún archivo de `components/`, `lib/arcade/shared/` ni `lib/arcade/engine.ts`.

### Rendimiento (medido con **Instrumentar** y **Medir** de `game-performance-booster`, `npm run dev`, 1280 × 900)

- [ ] Clásico: p95 ≤ 20 ms y < 1 % de frames > 33 ms (inicial 17,6 ms y 0 %); con CPU ×4, p95 ≤ 33 ms (inicial 17,6 ms).
- [ ] Neón: p95 ≤ 20 ms y < 1 % de frames > 33 ms (inicial 17,6 ms y 0 %); con CPU ×4, p95 ≤ 33 ms (inicial 17,6 ms).
- [ ] Retro: p95 ≤ 20 ms y < 1 % de frames > 33 ms (inicial 17,6 ms y 0 %); con CPU ×4, p95 ≤ 33 ms (inicial 17,6 ms).
- [ ] Neón: dibujos con `shadowBlur > 0` por frame de 94,4 a ≤ 10 (esperado ≈ 7), con 0 a 5 ranas en las bocas ocupadas.
- [ ] Clásico y Retro: dibujos con `shadowBlur > 0` por frame siguen en 0.
- [ ] Retro: dibujos por frame de 1444,7 a ≤ 720 y JS del `loop` por debajo de 0,415 ms de media.
- [ ] Neón: dibujos por frame no superan los 204,9 iniciales; Clásico no supera los 206,5.
- [ ] Mutaciones del DOM por segundo ≤ 10 en las tres skins (inicial 0).
- [ ] `setLineDash`, gradientes e `imageData` por frame siguen en 0 (inicial 0 en las tres skins).
- [ ] Heap en una partida: sin crecimiento sostenido (> 5 MB entre 10 s y 60 s es sospecha) en Neón, medido con la rana viva durante 60 s (con entrada sintética en `window`) o, si no se puede, deltas de 8 s entre −5 y +5 MB como en la medición inicial.

### Pausa y fin

- [ ] Pausa (P): 0 dibujos por frame en las tres skins (inicial 0). P y SEGUIR reanudan sin salto de las entidades ni de la barra de tiempo.
- [ ] Fin de partida con el modal abierto: 0 dibujos por frame en las tres skins (inicial: Clásico 194,6; Retro 1469,9; Neón sin medir).
- [ ] JUGAR DE NUEVO tras el fin de partida arranca una partida limpia (3 vidas, nivel 1, puntuación 0) con el loop vivo; el motor no deja dos loops (`requestAnimationFrame`) vivos.

### Sin regresiones visuales

- [ ] Clásico se ve igual que `.playwright-screenshots/performance/frogger/classic-base.png`.
- [ ] Neón se ve igual que `neon-base.png`: mismo glow en coches, camión, tractor, troncos, tortugas (visibles, hundiéndose y sumergidas) y ranas de las bocas; sin recortes del blur en los bordes de los sprites.
- [ ] Retro se ve igual que `retro-base.png`, píxel a píxel (terreno, río, seto, rayas, bocas y sprites).
- [ ] Verificado a 320, 375, 768 y 1280 px de ancho, como en el SPEC 12.

### Sin regresiones de juego

- [ ] Misma puntuación por acción (10 por fila nueva, 50 por boca, 10 por segundo restante, 200 por ronda), mismas vidas (3), mismo avance de nivel y mismos tiempos de viaje.
- [ ] Las tortugas siguen el mismo ciclo: visibles 3 s, hundiéndose 0,5 s, sumergidas 1,5 s; la rana sigue cayendo al agua sobre un grupo sumergido.
- [ ] Teclado (flechas y W A S D, con salto guardado durante el vuelo) y gamepad táctil se comportan igual.
- [ ] Al terminar la partida el canvas queda congelado en el último frame (con la marca de choque) bajo el modal, y GUARDAR PUNTUACIÓN sigue funcionando.

## Decisiones

- **Sí:** terminar el loop en `gameover` con un último `draw()` y un `resume()` que no lo reinicia, porque el presupuesto exige 0 dibujos tras `onGameOver` y no hay animación posterior que mostrar (el canvas queda congelado bajo el modal).
- **Sí:** caché de sprites solo en Neón (`skin.glow > 0`) y construida una vez en `create`; Clásico sigue con dibujo en vivo porque no tiene glow. Como la skin se fija al crear el motor, no hay «reconstruir al cambiar de skin».
- **Sí:** el constructor de sprites reutiliza las mismas funciones de dibujo que el modo en vivo (carril sintético en la fila 0 y `translate`), para garantizar el mismo look sin duplicar código.
- **Sí:** un sprite por tipo de carril indexado por fila (`LANES` tiene filas únicas), sin armar claves de texto por frame; las tortugas tienen un sprite por estado (visible, hundiéndose, sumergida).
- **Sí:** coordenadas enteras (`Math.round`) en los `drawImage` de los sprites; la lógica (hitboxes, `entity.x`) no cambia.
- **Sí:** `pad = skin.glow * 2` (16 px con `glow: 8`): el blur gaussiano tiene sigma = `shadowBlur / 2` y 4 sigmas no se recortan de forma visible.
- **Sí:** la rana en vivo, la barra de tiempo y la marca de choque conservan el glow en vivo: son 7 dibujos por frame, dentro del presupuesto de 10.
- **Sí:** capa de terreno de Retro (H3), aunque Retro ya cumple los frames, porque el terreno es el 52 % de sus dibujos, es idéntico entre frames y se resuelve con un canvas auxiliar de 160 × 120 sin cambiar un píxel.
- **Sí:** acotar `state.clock` con `% TURTLE_CYCLE`; solo alimenta `turtleState`, que ya hace `wrap` con ese mismo ciclo.
- **No:** fusionar las cuatro patas de la rana en un solo trazo con glow. Los glows de cuatro rellenos se suman donde se superponen y uno solo no; sería un cambio sutil de look, y no hace falta: la rana en vivo cuesta 6 de los 10 dibujos permitidos.
- **No:** bajar `SKINS.neon.glow` (8) para ahorrar coste. El SPEC 12 lo dejó como plan B, pero cambia el look; la caché resuelve el coste sin tocarlo.
- **No:** caché del fondo de Clásico y Neón. Son unos 60 `fillRect` por frame y el JS del loop cuesta 0,05 a 0,08 ms; la medición no lo justifica.
- **No:** caché de los sprites de entidades de Retro (≈ 690 `fillRect` por frame tras el paso 4). El JS del loop quedaría muy por debajo de 1 ms; si más adelante una medición en un celular real lo pide, va en otro spec.
- **No:** índices por fila en `lanes.ts` para `findSupport` y `hitsVehicle`. Recorren 11 carriles filtrando por fila (≈ 40 entidades): coste despreciable.
- **No:** `React.memo` ni pasar el HUD a refs. `GameCanvas` ya aísla el motor y se midieron 0 mutaciones por segundo.
- **No:** `devicePixelRatio`, `OffscreenCanvas`, workers ni cambiar `width`/`height` (el canvas mantiene 800 × 600).
- **No:** medir el heap a 60 s como requisito de entrada; sin entrada la rana muere a los ~48 s y el código no tiene colecciones que crezcan. El criterio de aceptación sí lo pide con entrada sintética.

Lo decidió el agente (game-performance-booster).

## Riesgos

| Riesgo                                                                                                                                                        | Mitigación                                                                                                                                                                                                                 |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Un sprite cacheado se ve distinto al dibujo en vivo (blur recortado en los bordes, glow más tenue o intenso).                                                 | `pad` de 16 px (4 sigmas), sprites construidos con las mismas funciones de dibujo, y criterio de comparar cada tipo de entidad con `neon-base.png`. Si se nota un recorte, subir `pad` (una sola constante).               |
| Coordenadas enteras: los carriles lentos (40 a 60 px/s, 0,7 a 1 px por frame) avanzan a saltos de 1 px y se ven menos suaves que con `fillRect` fraccionario. | Es el costo de evitar la interpolación de `drawImage`. Solo cambia el dibujo, no la lógica. Si se nota, probar `entity.x` sin redondear solo en `x` (suaviza a costa de bordes algo borrosos) y decidirlo con captura.     |
| La caché depende de que las filas de `LANES` sean únicas.                                                                                                     | El constructor lanza un error con una fila duplicada. Así, un cambio futuro de `LANES` falla de forma visible y no en silencio.                                                                                            |
| La caché se construye antes de que carguen las imágenes.                                                                                                      | No aplica: FROGGER no usa imágenes ni sonido; los sprites se pintan solo con primitivas de canvas, así que están listos al terminar `create`.                                                                              |
| La vista reutilizada se filtra entre frames (un renderer que guarde la referencia, o `lanes`/`goals` obsoletos).                                              | `updateView()` reasigna cada campo en cada frame, incluidos `lanes` y `goals` por referencia; los renderers no guardan la vista. Se verifica pasando de ronda (las cinco bocas se vacían y los carriles se reconstruyen).  |
| Congelar el canvas tras el fin de partida cambia lo que se ve bajo el modal (antes los carriles seguían moviéndose).                                          | Es el comportamiento que pide el presupuesto («0 dibujos tras `onGameOver`»). El último frame muestra la marca de choque fija y el modal lo cubre; se registra como decisión.                                              |
| `resume()` sin efecto en `gameover` esconde un caso: P pulsado justo al morir.                                                                                | `PlayerView.togglePause` ignora la pausa fuera de `playing`/`simulating`, y el modal pone `paused: false`; `GameCanvas` no llama a `resume()` si `paused` no cambió. Se verifica pulsando P y SEGUIR en el fin de partida. |
| Los números de desarrollo no son los de producción (`npm run dev` no minifica ni optimiza).                                                                   | Los criterios son relativos (antes/después en la misma máquina). Los contadores de dibujos y de glow no dependen del modo. Conviene repetir el **Medir** con `npm run build && npm start` si se quiere confirmar.          |
| La medición con CPU ×4 no estranguló el JS (0,079 → 0,083 ms) y el p95 de frame no discrimina.                                                                | Los criterios de glow, dibujos por frame y JS del `loop` son los que deciden; el p95 queda como comprobación de que no hay regresión.                                                                                      |
| Reconstruir 16 canvases al cambiar de skin o al «jugar de nuevo» añade un coste de arranque.                                                                  | Son 16 canvases de unos 15 a 55 KB creados en `create`, una vez por motor; se mide el arranque a ojo en el paso 3 (no debe notarse un salto).                                                                              |

## Lo que no entra en este spec

- Otros juegos y el catálogo sin motor.
- Cambios de jugabilidad o de look (incluida cualquier bajada del glow de Neón).
- Cambios compartidos en `PlayerView`, `GameCanvas`, `CrtScreen`, `MobileGamepad`, `shared/` o `engine.ts`: la medición no los justifica.
- Caché del fondo de Clásico y Neón, caché de las entidades de Retro e índices por fila en `lanes.ts`.
- Workers, `OffscreenCanvas`, `devicePixelRatio`, `ctx.filter`, dependencias nuevas y profiling formal con DevTools.

Si alguna de estas llega, va en su propio spec.
