# SPEC 11 — FROGGER jugable en el Reproductor

> **Estado:** Aprobado
> **Depende de:** SPEC 05, SPEC 06, SPEC 09, SPEC 10
> **Fecha:** 2026-10-10
> **Objetivo:** Crear un FROGGER jugable en `/games/frogger/play`, con carretera, río, tortugas que se sumergen y cinco bocas destino, dibujado con primitivas de canvas y con su puntuación en el ranking global.

## Por qué existe este spec

FROGGER ya está en el catálogo (`games`, `sort_order` 7, categoría «Clásicos», acento `yellow`), pero su Reproductor muestra la partida simulada. Este spec nació en la game jam (`specs/game-jam/frogger/01-frogger-core.md`) y se promovió a `specs/11-frogger-game.md`. La versión de la game jam pedía un componente React propio (`components/games/FroggerGame.tsx`), una play-page dedicada, un `INSERT` en `games` y un canvas de 640×560. Nada de eso encaja con la plataforma actual. Este spec conserva la jugabilidad acordada (saltos de una celda, 5 carriles de tráfico, 6 de río, tortugas que se sumergen, 5 bocas, 3 vidas, temporizador y la tabla de puntos) y la lleva a la forma de los SPEC 07, 08 y 09:

- El motor vive en `lib/arcade/frogger/` y cumple el contrato `GameDefinition`/`GameEngine` de `lib/arcade/engine.ts`. Se monta con el `GameCanvas` del Reproductor genérico (`/games/[id]/play`), sin play-page propia.
- La fila `frogger` ya existe, así que no hay `INSERT`: una migración actualiza solo las descripciones.
- El CRT es 4:3 y `GameCanvas` estira el canvas a todo el CRT, así que el canvas mide 800×600: una grilla de 20×15 celdas de 40 px.
- PUNTUACIÓN, VIDAS y NIVEL los muestra `PlayerHud`, y el fin de partida, `GameOverModal`. El guardado en `scores` es el flujo existente. El canvas solo dibuja el tablero y la barra de tiempo.

No hay referencia en `references/started-games/` ni assets de Frogger en `references/`, así que este spec **diseña el juego completo** y fija cada regla y cada constante. **El contrato no se amplía**: `engine.ts`, `lib/arcade/shared/` y `components/game/` no cambian.

## Alcance

**Incluye:**

- **Catálogo:** `short_description` y `long_description` de `frogger` actualizadas con la migración `update_frogger_description`. `title`, `category`, `accent` y `sort_order` no cambian.
- **Motor nuevo** en `lib/arcade/frogger/`, con: grilla de 20×15 celdas de 40 px; rana que salta una celda por pulsación (120 ms); 5 carriles de tráfico y 6 de río con entidades en loop; tortugas con ciclo de inmersión; 5 bocas destino; 3 vidas; temporizador por viaje; nivel que sube al llenar las 5 bocas, con más velocidad y menos tiempo.
- **Estilo:** paleta del Frogger arcade (carretera negra, río azul oscuro, franjas seguras moradas, setos verdes), dibujada con primitivas de canvas, sin imágenes. Es la base de la futura skin Clásico.
- **HUD de la plataforma:** PUNTUACIÓN, VIDAS y NIVEL salen de los callbacks. El canvas solo dibuja la barra de tiempo; no dibuja puntos, vidas, nivel, PAUSA ni GAME OVER.
- **Entrada:** `← ↑ ↓ →` y `W A S D`, un salto por pulsación, con un salto pendiente como máximo.
- **Registro:** `frogger` se agrega a `DEFINITIONS`, así que `/games/frogger/play` deja de mostrar la partida simulada.
- **Ranking:** la puntuación final se guarda en `scores` con el flujo existente de `GameOverModal`, sin cambios en el código del ranking.
- **Documentación:** actualizar `references/implemented-games.md` y `CLAUDE.md`.

**Fuera de alcance (para futuros specs):**

- Skins Neón y Retro y el selector de skin. Las escribe `skin-designer` en su propio spec; este motor usa un solo `COLORS` y no declara `skins`.
- Controles táctiles. Los agrega `mobile-porter` después; hasta entonces `StartScreen` muestra «ESTE JUEGO NECESITA TECLADO» en un dispositivo táctil.
- Sprites o imágenes externas y sonido.
- Animaciones de muerte elaboradas (explosiones, partículas): solo hay una marca de choque de 1 s.
- Mosca bonus, cocodrilos, nutrias, serpientes, la rana dama y otros eventos del original.
- Pantalla de victoria: los niveles no terminan.
- Validación antitrampas o topes de puntuación por juego.
- Cambios en la Biblioteca, el Home o el Salón de la Fama más allá de lo que da la fila del catálogo.
- Tests automatizados.
- Modificar `references/` o los specs 01 a 10.

## Rutas y archivos

```
lib/
  arcade/registry.ts              (cambia) + frogger
  arcade/frogger/constants.ts     (nuevo) grilla, filas, bocas, carriles, tiempos, puntos, SCORE_MAX y COLORS
  arcade/frogger/lanes.ts         (nuevo) tipos de carril y entidad, buildLanes, moveLanes, turtleState, findSupport, hitsVehicle
  arcade/frogger/render.ts        (nuevo) dibujo del tablero, entidades, bocas, rana, marca de choque y barra de tiempo
  arcade/frogger/game.ts          (nuevo) createFroggerEngine: estado, entrada, saltos, muertes, bocas, niveles y loop
  arcade/frogger/index.ts         (nuevo) froggerDefinition: GameDefinition
references/implemented-games.md   (cambia) FROGGER pasa a jugable
CLAUDE.md                         (cambia) juegos sin skins y estructura de lib/arcade/
```

Sin cambios: `lib/arcade/engine.ts`, `lib/arcade/shared/`, `components/game/` (`PlayerView`, `PlayerHud`, `GameCanvas`, `StartScreen`, `GameOverModal`, `CrtScreen`, `PixelLoader`), `app/games/[id]/play/page.tsx`, `app/globals.css`, `lib/catalog.ts`, `lib/leaderboard.ts`, `lib/leaderboard-client.ts`, `DetailLeaderboard`, `HallOfFameTable` y `lib/supabase/database.types.ts`. No se crea `public/arcade/frogger/`.

Base de datos (proyecto `xanuntuhanyubcqiudlp`, con `apply_migration` del MCP de Supabase): migración `update_frogger_description`. No cambia el esquema, así que los tipos no se regeneran.

Convenciones:

- Las de `lib/arcade/` del SPEC 05: sin React ni `"use client"`, DOM (`window`) solo dentro de `create()` o de funciones que este llama, estado en el cierre de `createFroggerEngine` y loop por `dt` sin `setTimeout` ni `setInterval`.
- `createKeyboard` y `wrap` se importan de `lib/arcade/shared/`; no se copian dentro de `lib/arcade/frogger/`.
- `createFroggerEngine(canvas, callbacks, options?)` acepta `options` por el contrato del SPEC 10 y lo ignora: no hay skins todavía.
- Código en inglés, comentarios en español latinoamericano, módulos sin JSX en kebab-case.

## Modelo de datos

### Catálogo — migración `update_frogger_description`

```sql
update public.games
set short_description = 'Cruza la carretera y el río sin convertirte en papilla.',
    long_description = 'Guía a tu rana a través de una carretera repleta de coches y un río de troncos y tortugas que se sumergen. Llena las cinco bocas del otro lado para completar la ronda; cada nivel acelera el tráfico y acorta el tiempo. Tienes tres vidas y quince segundos por viaje.'
where id = 'frogger';
```

Antes de aplicarla se consulta la fila actual y se anotan sus valores en el resumen del paso. Fila resultante (solo cambian las descripciones):

| Campo               | Valor                                                   |
| ------------------- | ------------------------------------------------------- |
| `id`                | `frogger`                                               |
| `title`             | `FROGGER`                                               |
| `category`          | `Clásicos`                                              |
| `accent`            | `yellow`                                                |
| `sort_order`        | `7`                                                     |
| `short_description` | Cruza la carretera y el río sin convertirte en papilla. |
| `long_description`  | El texto de la migración.                               |

### Definición de FROGGER — `lib/arcade/frogger/index.ts`

- `width: 800`, `height: 600` (4:3, igual que el CRT). La grilla de 20×15 celdas de 40 px llena el canvas exacto.
- Sin campo `hud`: el HUD muestra PUNTUACIÓN, VIDAS, NIVEL y JUGADOR.
- Sin campo `skins` (las agrega el spec de skins).
- `controls`. Cada `action` debe ser única porque `StartScreen` la usa como `key` de React:

| `keys`              | `action` |
| ------------------- | -------- |
| `← ↑ ↓ → / W A S D` | SALTAR   |
| `P`                 | PAUSA    |

### Tablero

Filas de arriba (0) hacia abajo (14). Las columnas van de 0 a 19.

| Fila   | Zona            | Uso                                                                               |
| ------ | --------------- | --------------------------------------------------------------------------------- |
| `0`    | Metas           | Seto con 5 bocas de 2 columnas: columnas `1–2`, `5–6`, `9–10`, `13–14` y `17–18`. |
| `1–6`  | Río             | 6 carriles de troncos y tortugas. Fuera de ellos la rana se ahoga.                |
| `7`    | Mediana         | Franja segura.                                                                    |
| `8–12` | Carretera       | 5 carriles de tráfico.                                                            |
| `13`   | Inicio          | Franja segura donde aparece la rana, en la columna `9` (`x = 360`).               |
| `14`   | Barra de tiempo | No se puede pisar. Solo muestra el tiempo restante del viaje.                     |

### Constantes — `lib/arcade/frogger/constants.ts`

Los tiempos van en segundos y las velocidades en px/s.

| Constante                    | Valor                                                                                |
| ---------------------------- | ------------------------------------------------------------------------------------ |
| `WIDTH` / `HEIGHT`           | `800` / `600`                                                                        |
| `CELL`                       | `40` px                                                                              |
| `COLS` / `ROWS`              | `20` / `15`                                                                          |
| `GOAL_ROW`                   | `0`                                                                                  |
| `RIVER_TOP` / `RIVER_BOTTOM` | `1` / `6`                                                                            |
| `MEDIAN_ROW`                 | `7`                                                                                  |
| `ROAD_TOP` / `ROAD_BOTTOM`   | `8` / `12`                                                                           |
| `START_ROW` / `START_COL`    | `13` / `9`                                                                           |
| `TIMER_ROW`                  | `14`                                                                                 |
| `GOAL_COLS`                  | `[1, 5, 9, 13, 17]` (columna izquierda de cada boca; cada una mide 2)                |
| `INITIAL_LIVES`              | `3`                                                                                  |
| `HOP_TIME`                   | `0.12` s                                                                             |
| `DEATH_DELAY`                | `1` s                                                                                |
| `TRIP_TIME_BASE`             | `15` s                                                                               |
| `TRIP_TIME_STEP`             | `0.5` s menos por nivel                                                              |
| `TRIP_TIME_MIN`              | `10` s (se alcanza en el nivel 11)                                                   |
| `SPEED_STEP`                 | `0.15` (+15 % por nivel sobre la velocidad base del carril)                          |
| `SPEED_MAX_FACTOR`           | `2.5` (se alcanza en el nivel 11)                                                    |
| `LANE_EXTRA`                 | `160` px (4 celdas fuera de pantalla a cada lado)                                    |
| `LANE_LOOP`                  | `WIDTH + 2 × LANE_EXTRA` = `1120` px                                                 |
| `FROG_INSET`                 | `8` px (margen lateral del hitbox de la rana)                                        |
| `VEHICLE_INSET`              | `4` px (margen lateral del hitbox de cada vehículo)                                  |
| `TURTLE_CYCLE`               | `5` s: visible de `0` a `3`, hundiéndose de `3` a `3.5`, bajo el agua de `3.5` a `5` |
| `POINTS_STEP`                | `10` por fila nueva alcanzada en el viaje                                            |
| `POINTS_GOAL`                | `50` por boca ocupada                                                                |
| `POINTS_TIME`                | `10` por segundo entero restante al ocupar una boca                                  |
| `POINTS_ROUND`               | `200` al llenar las 5 bocas                                                          |
| `SCORE_MAX`                  | `9_999_999`                                                                          |
| `MAX_DT`                     | `0.05` s                                                                             |

Derivadas, con `level` desde 1:

- `speedFactor(level) = min(SPEED_MAX_FACTOR, 1 + SPEED_STEP × (level − 1))`.
- `tripTime(level) = max(TRIP_TIME_MIN, TRIP_TIME_BASE − TRIP_TIME_STEP × (level − 1))`.

### Carriles — `LANES` en `constants.ts`

Cada carril tiene entidades del mismo largo, repartidas a intervalos iguales (`spacing = LANE_LOOP / count`). La entidad `i` arranca en `x = offset + i × spacing − LANE_EXTRA`. La velocidad es `speed × speedFactor(level)` en el sentido `dir` (`-1` izquierda, `1` derecha).

| Fila | `kind`    | Largo (celdas) | `count` | `speed` | `dir` | `offset` | Notas                                |
| ---- | --------- | -------------- | ------- | ------- | ----- | -------- | ------------------------------------ |
| `1`  | `log`     | 3              | 4       | 40      | `-1`  | `20`     |                                      |
| `2`  | `log`     | 2              | 5       | 55      | `1`   | `100`    |                                      |
| `3`  | `turtles` | 2              | 5       | 60      | `-1`  | `40`     | El grupo 0 se sumerge (fase `2.5` s) |
| `4`  | `log`     | 4              | 3       | 70      | `1`   | `160`    |                                      |
| `5`  | `log`     | 3              | 4       | 45      | `1`   | `80`     |                                      |
| `6`  | `turtles` | 3              | 4       | 55      | `-1`  | `0`      | El grupo 0 se sumerge (fase `0` s)   |
| `8`  | `truck`   | 2              | 3       | 70      | `-1`  | `40`     |                                      |
| `9`  | `racer`   | 1              | 2       | 150     | `1`   | `200`    |                                      |
| `10` | `car`     | 1              | 4       | 80      | `-1`  | `60`     | Coche rosa                           |
| `11` | `tractor` | 1              | 3       | 50      | `1`   | `120`    |                                      |
| `12` | `car`     | 1              | 4       | 60      | `-1`  | `0`      | Coche amarillo                       |

Con estos valores el hueco mínimo en la carretera es de 240 px (6 celdas) y todos los carriles del río tienen entidades a la vista en todo momento.

Colores del canvas, inspirados en el Frogger arcade:

```ts
export const COLORS = {
  road: "#000000", // carretera y fondo general
  river: "#000047", // agua del río y de las bocas
  safe: "#5b2a86", // mediana e inicio
  hedge: "#1f8f1f", // seto de la fila de metas
  hedgeDark: "#126312", // borde y textura del seto
  timerBar: "#00e000", // barra de tiempo con más del 50 %
  timerWarn: "#ffd800", // entre 25 % y 50 %
  timerDanger: "#ff2020", // menos del 25 %
  frog: "#3ee03e",
  frogDark: "#1a7a1a",
  eye: "#ffffff",
  pupil: "#000000",
  carYellow: "#ffd800", // fila 12
  carPink: "#ff4fd8", // fila 10
  racer: "#ffffff", // fila 9
  tractor: "#30c0ff", // fila 11
  truck: "#e0e0e0", // fila 8, caja
  truckCab: "#ff3030", // fila 8, cabina
  wheel: "#202020",
  log: "#8b4a1c",
  logLine: "#5a2e0e",
  turtle: "#c0392b", // caparazón
  turtleHead: "#2ecc40",
  turtleSinking: "#5a1a1a", // grupo hundiéndose (todavía sostiene)
  splat: "#ff2020", // marca de choque
} as const;
```

### Carriles y entidades — `lib/arcade/frogger/lanes.ts`

```ts
type LaneKind = "car" | "racer" | "tractor" | "truck" | "log" | "turtles";

interface Entity {
  x: number; // px del borde izquierdo, entre −LANE_EXTRA y WIDTH + LANE_EXTRA
  dives: boolean; // solo tortugas: este grupo se sumerge
}

interface Lane {
  row: number;
  kind: LaneKind;
  length: number; // celdas
  velocity: number; // px/s con signo, ya multiplicada por speedFactor(level)
  color: string; // solo vehículos: el de COLORS que le toca
  turtlePhase: number; // s de desfase del ciclo de inmersión
  entities: Entity[];
}

type TurtleState = "visible" | "sinking" | "submerged";

export function buildLanes(level: number): Lane[];
export function moveLanes(lanes: Lane[], dt: number): void; // x = wrap(x + velocity × dt + LANE_EXTRA, LANE_LOOP) − LANE_EXTRA
export function turtleState(
  lane: Lane,
  entity: Entity,
  clock: number,
): TurtleState; // "visible" si !entity.dives
export function findSupport(
  lanes: Lane[],
  row: number,
  centerX: number,
  clock: number,
): Lane | null;
export function hitsVehicle(
  lanes: Lane[],
  row: number,
  left: number,
  right: number,
): boolean;
```

- `wrap` es el de `shared/math.ts`. Como ninguna entidad mide más de 4 celdas (160 px), cada una desaparece del todo antes de reaparecer por el lado opuesto.
- `turtleState` usa `t = (clock + turtlePhase) mod TURTLE_CYCLE`: visible si `t < 3`, `"sinking"` si `t < 3.5`, `"submerged"` si no.
- `findSupport` devuelve el carril si `centerX` cae en `[x, x + length × CELL)` de alguna entidad de esa fila que no esté `"submerged"` (un grupo `"sinking"` todavía sostiene). Si no, `null`.
- `hitsVehicle` es `true` si el intervalo `[left, right]` se cruza con `[x + VEHICLE_INSET, x + length × CELL − VEHICLE_INSET]` de algún vehículo de esa fila.
- `clock` es el reloj de la partida (s acumulados con `dt`), así que la pausa congela las tortugas.

### Estado interno de la partida — `lib/arcade/frogger/game.ts`

```ts
type Phase = "playing" | "dying" | "gameover";
type Direction = "up" | "down" | "left" | "right";

interface Frog {
  x: number; // px del borde izquierdo (continuo: el río la arrastra)
  row: number; // fila lógica, 0 a 13
  facing: Direction; // para orientar el dibujo
  hop: {
    fromX: number;
    fromRow: number;
    toX: number;
    toRow: number;
    t: number;
  } | null;
}

// Estado encapsulado en el cierre de createFroggerEngine (no se exporta)
interface FroggerState {
  phase: Phase;
  frog: Frog;
  pendingHop: Direction | null; // un salto guardado mientras otro está en el aire
  lanes: Lane[];
  goals: boolean[]; // 5 bocas, true si está ocupada
  clock: number; // s de partida, para las tortugas
  tripLeft: number; // s restantes del viaje
  bestRow: number; // fila más alta alcanzada en el viaje (empieza en START_ROW)
  deathTimer: number; // s transcurridos en "dying"
  deathX: number; // dónde se dibuja la marca de choque
  deathRow: number;
  score: number;
  lives: number;
  level: number;
}
```

### Reglas del juego

**Inicio, viaje y reaparición**

- `start()` arma el estado con `level = 1`, `lanes = buildLanes(1)`, las 5 bocas libres y `clock = 0`; emite `onScore(0)`, `onLives(3)` y `onLevel(1)`; conecta el teclado y arranca el loop con `lastTime = null`. La partida empieza directamente en `"playing"`: la rana no se mueve sola.
- `resetFrog()` empieza un viaje: rana en `x = START_COL × CELL`, `row = START_ROW`, `facing = "up"`, `hop = null`, `pendingHop = null`, `bestRow = START_ROW` y `tripLeft = tripTime(level)`.

**Entrada y saltos**

- `createKeyboard()` de `lib/arcade/shared/keyboard.ts`, sin cambios. Cada frame, en `update`, se llama `consume` sobre `ArrowUp`/`KeyW`, `ArrowDown`/`KeyS`, `ArrowLeft`/`KeyA` y `ArrowRight`/`KeyD`, en ese orden. Fuera de `"playing"` las pulsaciones se consumen y se descartan.
- Si la rana está en el suelo, la pulsación inicia un salto. Si está en el aire, queda en `pendingHop` y reemplaza a la anterior; se ejecuta al aterrizar si la rana sigue viva.
- Un salto va de la posición actual a: `row − 1` (arriba), `row + 1` (abajo), `x − CELL` (izquierda) o `x + CELL` (derecha). Se **ignora** (sin gastar la pulsación en un salto) si sale de las filas 0 a 13 o si `x` quedaría fuera de `[0, WIDTH − CELL]`.
- El salto dura `HOP_TIME`. La posición dibujada se interpola linealmente entre origen y destino. Durante el salto el río no arrastra a la rana.
- Al aterrizar en una fila de tierra (7 a 13), `x` se redondea a la columna más cercana (`round(x / CELL) × CELL`, acotado a `[0, WIDTH − CELL]`). En el río no se redondea.
- Las flechas y Espacio ya están bloqueadas por `createKeyboard`. Espacio no tiene acción: solo inicia la partida desde `StartScreen`.

**Puntos por avance**

- Al aterrizar en una fila menor que `bestRow` y mayor que `GOAL_ROW`, `bestRow = row` y se suman `POINTS_STEP`. Bajar y volver a subir no da puntos de nuevo en el mismo viaje.

**Muertes — se revisan cada frame en `"playing"`**

1. **Tráfico:** en la carretera, con el hitbox `[x + FROG_INSET, x + CELL − FROG_INSET]` en la posición dibujada. Durante un salto la fila que cuenta es la de origen en la primera mitad (`t < HOP_TIME / 2`) y la de destino en la segunda.
2. **Agua:** con la rana en el suelo en una fila de río, si `findSupport` devuelve `null` (no hay tronco ni tortuga bajo su centro, o la tortuga está bajo el agua).
3. **Borde del río:** si el arrastre deja el centro de la rana (`x + CELL / 2`) fuera de `[0, WIDTH]`.
4. **Tiempo:** si `tripLeft` llega a `0`.
5. **Metas:** al aterrizar en `GOAL_ROW`, si el centro de la rana no cae dentro de una boca (choca con el seto) o la boca ya está ocupada.

Con la rana en el suelo sobre un soporte del río, `x += lane.velocity × dt` cada frame.

`killFrog()`: `lives −= 1` y se emite `onLives(lives)`; se guardan `deathX` y `deathRow`. Con `lives <= 0` se fija `lives = 0`, `phase = "gameover"`, se desconecta el teclado y se llama `onGameOver(score)` una sola vez. Si no, `phase = "dying"` con `deathTimer = 0`. Durante `DEATH_DELAY` los carriles siguen moviéndose, el temporizador del viaje no corre y las teclas se descartan; al cumplirse se llama `resetFrog()` y la fase vuelve a `"playing"`. La puntuación, el nivel y las bocas ocupadas se conservan al perder una vida.

**Bocas y niveles**

- Al aterrizar en una boca libre, se marca como ocupada y se suman `POINTS_GOAL + floor(tripLeft) × POINTS_TIME`, con `score = min(SCORE_MAX, …)` y `onScore(score)`. Después:
  - Si quedan bocas libres, `resetFrog()` (empieza otro viaje).
  - Si las 5 están ocupadas, se suman `POINTS_ROUND`, `level += 1` y se emite `onLevel(level)`, se vacían las bocas, `lanes = buildLanes(level)` y `resetFrog()`.
- No hay victoria: los niveles siguen y la velocidad y el tiempo dejan de cambiar en el nivel 11.
- Cada cambio de puntuación emite `onScore(score)` con el valor ya acotado.

**Puntuación máxima:** un viaje perfecto da como mucho 12 × 10 + 50 + 15 × 10 = 320 puntos, y una ronda, menos de 1.800. `SCORE_MAX` se conserva por el `CHECK` de `scores`.

### Dibujo — `render.ts`

Orden en cualquier fase:

1. **Fondo por zonas:** fila 0 en `hedge` con las 5 bocas en `river` (rectángulos de 2 × 1 celdas, con un margen de 4 px); filas 1–6 en `river`; filas 7 y 13 en `safe`; filas 8–12 en `road`; fila 14 en `road`.
2. **Entidades** de cada carril, solo las que se ven en pantalla:
   - `car`: rectángulo de 32×24 px centrado en su celda con el color del carril, y 4 ruedas de 8×6 px en `wheel`.
   - `racer`: igual que `car`, más bajo (32×18) y con una franja central en `road`.
   - `tractor`: cuerpo de 28×24 en `tractor` y dos ruedas traseras más grandes (12×10) en `wheel`.
   - `truck`: caja de 56×26 en `truck` y cabina de 20×26 en `truckCab` del lado hacia donde avanza.
   - `log`: rectángulo redondeado de `length × CELL − 4` × 30 px en `log`, con 2 líneas horizontales en `logLine`.
   - `turtles`: un círculo de 15 px de radio por celda, en `turtle` con una cabeza de 5 px en `turtleHead` hacia donde avanzan. `"sinking"` se dibuja en `turtleSinking` y `"submerged"`, solo como un contorno de 1 px en `turtleSinking`.
3. **Bocas ocupadas:** una rana en reposo (mismo dibujo que la rana) centrada en la boca.
4. **Rana** en `"playing"`: elipse de 28×24 px en `frog` con borde de 2 px en `frogDark`, dos ojos de 5 px en `eye` con pupila de 2 px en `pupil` hacia `facing`, y cuatro patas de 6×4 px en `frogDark` que se separan 4 px más durante el salto.
5. **Marca de choque** en `"dying"` y `"gameover"`: una «X» de 28 px y 4 px de grosor en `splat`, en `(deathX, deathRow)`. En `"dying"` parpadea cada 0,15 s; en `"gameover"` queda fija.
6. **Barra de tiempo** en la fila 14: rectángulo de 12 px de alto centrado en la fila, desde `x = 0` hasta `WIDTH × tripLeft / tripTime(level)`, en `timerBar`, `timerWarn` o `timerDanger` según el porcentaje restante. En `"dying"` se dibuja el último valor.

El canvas no dibuja puntuación, nivel, vidas, PAUSA ni GAME OVER: eso lo muestran `PlayerHud`, `GameOverModal` y el overlay de `CrtScreen`.

### Reglas del loop

- El loop corre con `requestAnimationFrame`; `dt` se calcula en segundos con tope `MAX_DT`. `resume()` pone `lastTime = null`, así que el primer frame tras la pausa tiene `dt = 0`.
- Sin `setTimeout` ni `setInterval`: `clock`, `tripLeft`, el salto y `deathTimer` avanzan con `dt`, así que la pausa los congela.
- `pause()` cancela el frame y desconecta el teclado (vacía las teclas sostenidas y `pendingHop`). `resume()` lo reconecta. `destroy()` cancela el loop, quita todos los listeners y es idempotente (React Strict Mode monta y desmonta dos veces en desarrollo).
- En `"gameover"` los carriles siguen moviéndose y el loop sigue redibujando hasta `destroy()`, sin volver a llamar `onGameOver`.

## Plan de implementación

1. **Catálogo.** Consultar la fila `frogger` (`select id, title, category, accent, sort_order, short_description, long_description from public.games order by sort_order`) y aplicar `update_frogger_description`. Verificación: la misma consulta muestra las descripciones nuevas en `frogger` y las otras 7 filas sin cambios, y `get_advisors` (security) no reporta alertas nuevas. `/games/frogger` muestra la descripción nueva y `/games/frogger/play` sigue con la partida simulada.
2. **Constantes y carriles.** Crear `lib/arcade/frogger/constants.ts` y `lanes.ts`. Verificación: `npx tsc --noEmit` y `npm run lint` pasan, `LANES` tiene 11 carriles (6 de río y 5 de carretera) y `GOAL_COLS` tiene 5 bocas.
3. **Dibujo.** Crear `lib/arcade/frogger/render.ts`. Verificación: `npx tsc --noEmit` y `npm run lint` pasan.
4. **Motor.** Crear `lib/arcade/frogger/game.ts` con `createFroggerEngine` (estado, entrada, saltos, muertes, bocas, niveles, `update`, `draw`, loop y `start`/`pause`/`resume`/`destroy`) e `index.ts` con `froggerDefinition`. Todavía no se registra. Verificación: `npx tsc --noEmit` y `npm run lint` pasan.
5. **Registrar y conectar.** Agregar `frogger: froggerDefinition` a `DEFINITIONS` en `lib/arcade/registry.ts`. Verificación: en `/games/frogger/play` se juega una partida hasta el modal, y GUARDAR PUNTUACIÓN crea una fila en `scores` con `game_id = 'frogger'` que aparece en `/games/frogger`.
6. **Documentación.** En `references/implemented-games.md`: FROGGER pasa a la tabla de jugables (5 de 8) con su sección (id, categoría, acento, orden, descripciones e «Implementación: diseñado desde cero, dibujado con primitivas de canvas, spec `specs/11-frogger-game.md`») y sale de «Pendientes». En `CLAUDE.md`: agregar FROGGER a la lista de juegos que siguen sin skins. Verificación: `npm run format:check` pasa.

## Criterios de aceptación

**Generales**

- [ ] `npm run build`, `npm run lint` y `npx tsc --noEmit` terminan sin errores.
- [ ] Existen los cinco archivos de `lib/arcade/frogger/` (`constants.ts`, `lanes.ts`, `render.ts`, `game.ts` e `index.ts`).
- [ ] Ningún archivo de `lib/arcade/` importa `react` ni declara `"use client"`, y ninguno toca `window` ni `document` a nivel de módulo.
- [ ] `lib/arcade/engine.ts`, `lib/arcade/shared/` y `components/game/` no cambian, y `git diff main -- references/` solo muestra `references/implemented-games.md`.
- [ ] No existen `components/games/FroggerGame.tsx` ni `app/games/frogger/`.
- [ ] Al jugar una partida completa en `/games/frogger/play`, la consola del navegador no muestra errores ni advertencias de hidratación, ni advertencias de claves duplicadas en `StartScreen`.

**Catálogo**

- [ ] La fila `frogger` de `games` tiene las descripciones nuevas, y `title`, `category`, `accent` y `sort_order` no cambiaron. Las otras 7 filas no cambiaron.
- [ ] `/games/frogger` muestra la descripción nueva.

**Flujo del Reproductor**

- [ ] `/games/frogger/play` muestra el `PixelLoader` y luego `StartScreen` con «FROGGER», las dos filas de controles (`← ↑ ↓ → / W A S D` SALTAR y `P` PAUSA), «PRESIONA ESPACIO» e INICIAR, sin selector de skin.
- [ ] Al iniciar, la rana aparece en la columna 9 de la fila de inicio y el HUD muestra `PUNTUACIÓN 0`, `VIDAS ■■■` y `NIVEL 01`.
- [ ] Con una ventana más baja que la página, las flechas y Espacio no hacen scroll durante la partida.
- [ ] Emulando un dispositivo táctil (`pointer: coarse`), `StartScreen` muestra «ESTE JUEGO NECESITA TECLADO» y no muestra INICIAR.

**Jugabilidad**

- [ ] El canvas se ve sin deformar dentro del CRT, con las zonas diferenciadas: seto con 5 bocas, río, mediana, carretera, inicio y barra de tiempo.
- [ ] Cada pulsación de flecha o WASD mueve la rana exactamente una celda en 120 ms. Una pulsación durante el salto se ejecuta al aterrizar; dos pulsaciones durante el mismo salto solo ejecutan la última.
- [ ] La rana no sale por los bordes laterales ni baja de la fila de inicio.
- [ ] Coches, tractores, camiones, troncos y tortugas se mueven en loop por sus carriles, con los sentidos y velocidades de `LANES`, y reaparecen por el lado opuesto sin cortes visibles.
- [ ] Sobre un tronco o una tortuga la rana avanza con él. Al aterrizar en la mediana o en el inicio queda alineada a la grilla.
- [ ] El grupo 0 de cada carril de tortugas cumple el ciclo visible (3 s), hundiéndose (0,5 s) y bajo el agua (1,5 s). Hundiéndose todavía sostiene; bajo el agua, no.
- [ ] La rana muere con un vehículo, al caer al agua, cuando la tortuga que la sostiene queda bajo el agua, cuando el río la saca por un borde, al acabarse el tiempo, al chocar con el seto y al saltar a una boca ocupada.
- [ ] Al morir, el HUD pasa a `VIDAS ■■□`, se ve la marca de choque parpadeando 1 s y la rana reaparece en el inicio con el tiempo lleno. Las bocas ocupadas, la puntuación y el nivel se conservan.
- [ ] Avanzar a una fila nueva suma 10 puntos; bajar y volver a subir en el mismo viaje no suma.
- [ ] Ocupar una boca libre suma `50 + 10 × segundos enteros restantes`, dibuja una rana en la boca y empieza otro viaje.
- [ ] Llenar las 5 bocas suma 200, el HUD pasa a `NIVEL 02`, las bocas se vacían, el tráfico va un 15 % más rápido y el viaje dura 14,5 s.
- [ ] La barra de tiempo se vacía en 15 s en el nivel 1 y cambia de verde a amarillo (50 %) y a rojo (25 %).
- [ ] El canvas no dibuja puntuación, nivel, vidas, PAUSA ni GAME OVER.

**Pausa**

- [ ] P y el botón PAUSA congelan el juego (tráfico, tortugas, salto y tiempo) y muestran el overlay PAUSA; P y SEGUIR lo reanudan sin saltos.
- [ ] Mantener una flecha durante la pausa y soltarla no deja un salto pendiente al reanudar.
- [ ] Cambiar de pestaña o hacer clic fuera de la ventana durante la partida la deja en PAUSA.

**Fin de partida y ranking**

- [ ] Perder la tercera vida abre `GameOverModal` con la misma puntuación que mostraba el HUD, y el HUD muestra `VIDAS □□□`.
- [ ] GUARDAR PUNTUACIÓN crea exactamente una fila en `scores` con `game_id = 'frogger'`, y aparece en `/games/frogger` y en la pestaña FROGGER del Salón de la Fama si entra en el top 10.
- [ ] La tarjeta de FROGGER en `/games` muestra esa puntuación como MEJOR PUNTUACIÓN si es la primera.
- [ ] JUGAR DE NUEVO vuelve a `PixelLoader` y `StartScreen`, y la nueva partida arranca desde cero.
- [ ] SALIR durante la partida lleva a `/games/frogger`, y volver a jugar no deja dos loops corriendo.

**Sin regresiones**

- [ ] ASTEROIDS (con sus tres skins), TETRIS, ARKANOID y SNAKE se juegan igual que antes del spec.
- [ ] Los juegos sin motor (PAC-MAN, SPACE INVADERS y GALAGA) siguen con la partida simulada.
- [ ] `/`, `/games`, `/hall-of-fame` y `/about` se ven igual que antes del spec, salvo FROGGER donde corresponda.

## Decisiones

- **Sí:** motor en TypeScript dentro del bundle, en `lib/arcade/frogger/`, con el contrato del SPEC 05 y el Reproductor genérico. **No:** el componente `FroggerGame.tsx` ni la play-page `app/games/frogger/play/page.tsx` de la game jam. El Reproductor `[id]/play` ya monta cualquier motor del registro, y sin registro `skin-designer` y `mobile-porter` no podrían trabajar el juego.
- **Sí:** `update_frogger_description` sobre la fila existente. **No:** el `INSERT` de la game jam, que fallaría por clave duplicada y usaba columnas que no existen (`cat`, `cover`, `color`). La fila conserva `Clásicos` y `yellow`.
- **Sí:** canvas de 800×600 (20×15 celdas de 40 px). **No:** 640×560 de la game jam: el CRT es 4:3 y `GameCanvas` estira el canvas, así que se deformaría. La fila extra se usa para la barra de tiempo y las columnas extra, para bocas simétricas.
- **Sí:** mantener la jugabilidad de la game jam: saltos de una celda en 120 ms, 5 carriles de tráfico, 6 de río, tortugas que se sumergen, 5 bocas de 2 columnas, 3 vidas, +10/+50/+200 puntos, bono de 10 por segundo y +15 % de velocidad por nivel.
- **Sí:** temporizador de 15 s **por viaje** (se reinicia al ocupar una boca o al morir), con −0,5 s por nivel hasta 10 s. Es la única lectura en la que el bono por tiempo restante tiene sentido: 15 s para las 5 bocas no alcanzan.
- **Sí:** la `x` de la rana es continua para que el río la arrastre, y se alinea a la grilla al pisar tierra. Las colisiones con vehículos usan hitboxes con margen (8 px la rana, 4 px los vehículos), no la comparación de columnas enteras.
- **Sí:** un solo salto pendiente durante el aire, que reemplaza al anterior.
- **Sí:** HUD de la plataforma; el canvas solo agrega la barra de tiempo, que no tiene celda en `PlayerHud`. **No:** el doble HUD de la game jam (puntos, nivel y vidas dentro del canvas): ningún juego actual lo hace.
- **Sí:** guardado con `GameOverModal` y `insertScore`. **No:** `av_player_name`, `player_name` ni `user_id`, que no existen en la plataforma.
- **Sí:** primitivas de canvas con la paleta del arcade, sin imágenes, en un solo `COLORS`. Las skins quedan para el spec de `skin-designer`.
- **Sí:** una marca de choque de 1 s antes de reaparecer, con el mundo en movimiento. **No:** animaciones de muerte elaboradas.
- **No:** controles táctiles, sonido, mosca bonus, cocodrilos ni otros eventos del original.

## Riesgos

| Riesgo                                                                                 | Mitigación                                                                                                                         |
| -------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| En desarrollo, React Strict Mode monta el efecto dos veces y deja dos loops corriendo. | `destroy()` cancela el `requestAnimationFrame` y quita todos los listeners. Hay un criterio de «volver a jugar no deja dos loops». |
| Acceder a `window` o `document` al importar `lib/arcade/frogger/` rompe el prerender.  | La convención obliga a tocar el DOM solo dentro de `create()`. `npm run build` lo detecta.                                         |
| El salto de `dt` al reanudar mueve el tráfico de golpe o mata a la rana.               | `resume()` pone `lastTime = null` y el tope de `dt` es de 50 ms.                                                                   |
| 15 s por viaje resultan demasiado ajustados con las velocidades de `LANES`.            | Se prueba en el Paso 5. Si un viaje sin errores no cabe en 15 s, se ajusta `TRIP_TIME_BASE` en el spec antes de seguir.            |
| La rana muere «injustamente» al rozar un vehículo.                                     | Hitboxes con margen (`FROG_INSET`, `VEHICLE_INSET`) y fila de colisión que cambia a mitad del salto.                               |
| Una entidad se ve «saltar» al reaparecer.                                              | `LANE_EXTRA` de 160 px es igual al largo máximo, así que el salto de `wrap` siempre pasa fuera de pantalla.                        |
| Una puntuación mayor que 9.999.999 hace fallar el guardado por el `CHECK` de `scores`. | `SCORE_MAX` en el motor. En la práctica no se alcanza (menos de 1.800 puntos por ronda).                                           |

## Lo que **no** entra en este spec

- Skins Neón y Retro y su selector.
- Controles táctiles.
- Sprites, imágenes y sonido.
- Animaciones de muerte elaboradas.
- Mosca bonus, cocodrilos y otros eventos del original.
- Antitrampas y topes por juego.
- Cambios en la Biblioteca, el Home o el Salón de la Fama más allá de la fila del catálogo.
- Tests automatizados.

Si alguna de estas llega, va en su propio spec.
