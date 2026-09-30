# SPEC GJ-cruce-B — CRUCE jugable en el Reproductor

> **Estado:** Borrador
> **Game jam:** tema «cruzar» · variante B de 2 (Red de cruces)
> **Depende de:** SPEC 05, SPEC 06, SPEC 07
> **Fecha:** 2026-09-30
> **Objetivo:** Crear un CRUCE jugable en `/games/cruce/play`, donde el jugador maneja a la vez los semáforos de cuatro cruces durante 120 s de hora pico, con choques posibles y TIEMPO en el HUD, y su puntuación en el ranking global.

## Por qué existe este spec

La game jam pidió el tema «cruzar». El clásico que primero viene a la mente, FROGGER, ya es una fila pendiente del catálogo (`games`, `sort_order` 7), así que este juego no puede ser «un bicho que salta de celda en celda entre carriles». CRUCE le da la vuelta: **el jugador no cruza, hace cruzar**. Maneja los semáforos de una red de calles y decide quién pasa y quién espera. El tema entra por los cruces mismos: cada auto atraviesa dos, y lo que vale es cuánto le cuesta cruzar.

Esta es la **variante B, «Red de cruces»**: la más ambiciosa. En lugar de un cruce hay **cuatro a la vez** (una red de 2×2, con una tecla por cruce), el cambio de luz es **instantáneo** y puede provocar choques (no hay despeje automático), la partida es **contra reloj de 120 s** en cuatro oleadas de tráfico creciente y **no hay vidas**: la puntuación cae con cada segundo que un auto espera y con cada choque. Se aparta de la **variante A, «Un solo cruce»**, que es un único cruce con semáforo seguro, tres vidas por atasco y dificultad continua, y que no amplía el contrato.

No hay referencia: el spec fija todas las reglas. La plataforma no alcanza en un punto: el reloj es el dato principal de una partida contra reloj y debe leerse de un vistazo junto a la puntuación, pero el HUD solo tiene PUNTUACIÓN, VIDAS, NIVEL y JUGADOR. Este spec **amplía el contrato** con dos campos **opcionales**: el callback `onTime?` de `GameCallbacks` y el campo `time?` de `hud`, que hace que `PlayerHud` muestre una celda TIEMPO. Como `GameCanvas` reenvía los callbacks uno por uno, también cambia. ASTEROIDS, TETRIS, ARKANOID y SNAKE no declaran nada de esto y siguen igual. El HUD de CRUCE oculta VIDAS (con `hud.lives: false`, del SPEC 07) y muestra TIEMPO.

## Alcance

**Incluye:**

- **Catálogo:** fila nueva `cruce` en `games` con la migración `add_cruce_game` (categoría «Puzles», acento rosa, al final de la lista).
- **Motor nuevo** en `lib/arcade/cruce/`, con: una red de 2×2 cruces (4 cruces, 8 carriles, cada auto atraviesa 2 cruces derecho); un semáforo por cruce que se alterna al instante con su tecla (`Q W A S`); autos de 28 px a 180 px/s con frenado, seguimiento y regla de no bloquear el cruce; puntos por auto de `max(10, 100 − 10 × segundos enteros detenido)`; choques cuando dos autos de ejes distintos se tocan (−200 puntos, los dos desaparecen y el cruce queda cerrado 1,5 s); partida de 120 s en 4 oleadas de 30 s con tráfico creciente.
- **Estilo:** fondo `--deep`, calles `--surface` y `--surface-2`, autos con relleno translúcido y borde neón, líneas de alto verdes y rosas, y una letra (`Q W A S`) en cada cruce.
- **Ampliación del contrato:** `onTime?` en `GameCallbacks` y `time?` en `GameHud`, con los cambios en `engine.ts`, `GameCanvas`, `PlayerView` y `PlayerHud`.
- **HUD de la plataforma:** PUNTUACIÓN, TIEMPO y NIVEL (la oleada, de 1 a 4) salen de los callbacks. La celda VIDAS se oculta. El canvas no dibuja puntos, tiempo, nivel, PAUSA ni GAME OVER.
- **Entrada:** `Q`, `W`, `A` y `S` alternan el semáforo del cruce que ocupa esa posición en la red (noroeste, noreste, suroeste y sureste).
- **Registro:** `cruce` se agrega a `DEFINITIONS`, así que `/games/cruce/play` es jugable.
- **Ranking:** la puntuación final se guarda en `scores` con el flujo existente de `GameOverModal`, sin cambios en el código del ranking.
- **Documentación:** actualizar `references/implemented-games.md` y `CLAUDE.md` (el contrato cambió).

**Fuera de alcance (para futuros specs):**

- Un solo cruce con despeje automático, vidas por atasco y dificultad continua (es la variante A).
- Giros, peatones, autobuses, ambulancias con prioridad, motos, obras y accidentes.
- Semáforos con ciclo automático y amarillo.
- Un reloj para otros juegos: `time` y `onTime` quedan disponibles, pero ningún otro motor los usa.
- Sonido y música (el SPEC 05 ya dejó el sonido fuera).
- Controles táctiles o de mouse. En un dispositivo táctil `StartScreen` sigue mostrando «ESTE JUEGO NECESITA TECLADO».
- Validación antitrampas o topes de puntuación por juego.
- Cambios en la Biblioteca, el Home o el Salón de la Fama más allá de lo que da la fila del catálogo.
- Tests automatizados.
- Modificar `references/` (salvo `references/implemented-games.md`) o los specs 01 a 09.

## Rutas y archivos

```
lib/
  arcade/engine.ts                (cambia) + onTime? en GameCallbacks y time? en GameHud
  arcade/registry.ts              (cambia) + cruce
  arcade/cruce/constants.ts       (nuevo) dimensiones, red, autos, oleadas, puntos, SCORE_MAX y COLORS
  arcade/cruce/lanes.ts           (nuevo) Axis, Light, LaneDef, LANES (8 carriles), BOXES (4 cruces) y laneRect
  arcade/cruce/cars.ts            (nuevo) Car, createCar, carRect, hasRoomAhead y advanceCar
  arcade/cruce/junctions.ts       (nuevo) Junction, createJunctions, lightOf, toggleJunction, updateJunction y lockJunction
  arcade/cruce/render.ts          (nuevo) drawScene: calles, cruces, líneas de alto, letras, autos y choques
  arcade/cruce/game.ts            (nuevo) createCruceEngine: estado, entrada, apariciones, choques, puntos, reloj, update, draw y loop
  arcade/cruce/index.ts           (nuevo) cruceDefinition: GameDefinition
components/game/
  GameCanvas.tsx                  (cambia) reenvía onTime
  PlayerHud.tsx                   (cambia) props opcionales showTime y time, y la celda TIEMPO
  PlayerView.tsx                  (cambia) estado time, callback onTime y props de PlayerHud
references/implemented-games.md   (cambia) fila y sección de CRUCE
CLAUDE.md                         (cambia) contrato: hud.time y onTime
```

Sin cambios: `lib/arcade/shared/`, los cuatro motores existentes (`lib/arcade/asteroids/`, `arkanoid/`, `tetris/` y `snake/`), `components/game/` salvo los tres archivos de arriba (`StartScreen`, `GameOverModal`, `CrtScreen` y `PixelLoader`), `app/games/[id]/play/page.tsx`, `app/globals.css`, `lib/games.ts`, `lib/format.ts`, `lib/catalog.ts`, `lib/leaderboard.ts`, `lib/leaderboard-client.ts`, `DetailLeaderboard`, `HallOfFameTable` y `lib/supabase/database.types.ts`.

Base de datos (proyecto `xanuntuhanyubcqiudlp`, con `apply_migration` del MCP de Supabase): migración `add_cruce_game`. No cambia el esquema (solo agrega una fila), así que los tipos no se regeneran. La categoría «Puzles» y el acento `pink` ya existen, así que no hacen falta `extend_games_category_check` ni `extend_games_accent_check`.

Convenciones:

- Las de `lib/arcade/` del SPEC 05: sin React ni `"use client"`, DOM solo dentro de `create()`, estado en el cierre de `createCruceEngine` y loop por `dt` sin `setTimeout` ni `setInterval`.
- `lanes.ts`, `cars.ts` y `junctions.ts` son funciones y tipos puros sobre los datos que reciben: no guardan estado de módulo.
- `createKeyboard`, `rand` y `randInt` se importan de `lib/arcade/shared/`; no se copian dentro de `lib/arcade/cruce/`.
- Código en inglés, comentarios en español latinoamericano, módulos sin JSX en kebab-case.

## Modelo de datos

### Catálogo — migración `add_cruce_game`

```sql
insert into public.games (id, title, category, accent, short_description, long_description, sort_order)
select 'cruce', 'CRUCE', 'Puzles', 'pink',
       'Dirige cuatro semáforos en plena hora pico.',
       'Maneja a la vez los semáforos de cuatro cruces durante dos minutos. Cambia cada luz con su tecla: los autos que cruzan sin detenerse valen más y cada segundo de espera les resta puntos. Si cambias una luz con un auto a punto de entrar, chocan: pierdes puntos y el cruce queda cerrado un momento.',
       coalesce(max(sort_order), 0) + 1
from public.games;
```

Fila resultante (con el catálogo actual de 8 juegos, `sort_order` vale 9):

| Campo               | Valor                                                                                                                                                                                                                                                                                                   |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `id`                | `cruce`                                                                                                                                                                                                                                                                                                 |
| `title`             | `CRUCE`                                                                                                                                                                                                                                                                                                 |
| `category`          | `Puzles`                                                                                                                                                                                                                                                                                                |
| `accent`            | `pink`                                                                                                                                                                                                                                                                                                  |
| `sort_order`        | `9` (el máximo actual más uno)                                                                                                                                                                                                                                                                          |
| `short_description` | Dirige cuatro semáforos en plena hora pico.                                                                                                                                                                                                                                                             |
| `long_description`  | Maneja a la vez los semáforos de cuatro cruces durante dos minutos. Cambia cada luz con su tecla: los autos que cruzan sin detenerse valen más y cada segundo de espera les resta puntos. Si cambias una luz con un auto a punto de entrar, chocan: pierdes puntos y el cruce queda cerrado un momento. |

`id` cumple `^[a-z0-9-]+$`, el título tiene 5 caracteres (máximo 40) y `sort_order` no choca con ninguna fila. La fila queda fuera de los seis primeros, así que no aparece en «Juegos disponibles» del Home.

### Ampliación del contrato — `lib/arcade/engine.ts`

```ts
export interface GameCallbacks {
  onScore(score: number): void;
  onLives(lives: number): void;
  onLevel(level: number): void;
  onTime?(secondsLeft: number): void; // opcional: solo lo llaman los juegos con hud.time
  onGameOver(finalScore: number): void; // se llama una sola vez por partida
}

export interface GameHud {
  lives?: boolean; // por defecto true; false oculta la celda VIDAS del HUD
  time?: boolean; // por defecto false; true muestra la celda TIEMPO con lo que emite onTime
}
```

- `GameCanvas` construye el objeto de callbacks del motor reenviando cada uno a `callbacksRef.current`; agrega `onTime: (seconds) => callbacksRef.current.onTime?.(seconds)`.
- `PlayerView` agrega `time: number` al estado (`INITIAL_STATE.time = 0`, así que JUGAR DE NUEVO lo reinicia), el callback `onTime: (time) => setState((s) => ({ ...s, time }))` y pasa `time={state.time}` y `showTime={definition?.hud?.time ?? false}` a `PlayerHud`.
- `PlayerHud` recibe `showTime?: boolean` (por defecto `false`) y `time?: number` (por defecto `0`). Con `showTime`, dibuja una celda **TIEMPO** entre VIDAS y NIVEL, con el mismo formato que las demás (`font-pixel text-base text-green`, sin text-shadow porque no hay token de glow verde) y el valor `m:ss`: `${Math.floor(time / 60)}:${pad2(time % 60)}` (por ejemplo `2:00`, `0:07`), con `time` redondeado hacia abajo y con piso en 0. `pad2` ya se importa de `lib/format.ts`. La celda se muestra desde el `PixelLoader`, porque la definición se conoce desde el montaje, y vale `0:00` hasta que `start()` emite `onTime(120)`.
- Los cuatro motores existentes no declaran `hud.time` ni llaman a `onTime`: su HUD no cambia (ASTEROIDS, ARKANOID y SNAKE siguen con VIDAS, NIVEL y sin TIEMPO; TETRIS sigue sin VIDAS y sin TIEMPO), y los juegos simulados tampoco.
- `onLives` sigue siendo obligatorio en `GameCallbacks`: un motor con `hud.lives: false` nunca lo llama (CRUCE no lo llama). `onLevel` sigue mostrándose siempre: aquí es la oleada.
- `StartScreen`, `GameOverModal` y `CrtScreen` no cambian.

### Definición de CRUCE — `lib/arcade/cruce/index.ts`

- `width: 800`, `height: 600` (4:3, igual que el CRT). La red de calles llena el canvas, sin paneles.
- `hud: { lives: false, time: true }`.
- `controls`. Cada `action` es única porque `StartScreen` la usa como `key` de React:

| `keys`      | `action`         |
| ----------- | ---------------- |
| `Q W / A S` | CAMBIAR SEMÁFORO |
| `P`         | PAUSA            |

### Constantes — `lib/arcade/cruce/constants.ts`

No hay referencia: son los valores fijados en este spec. Distancias en px de la resolución interna, velocidades en px/s, aceleraciones en px/s² y tiempos en s.

| Constante                               | Valor                                                                             |
| --------------------------------------- | --------------------------------------------------------------------------------- |
| `WIDTH` / `HEIGHT`                      | `800` / `600`                                                                     |
| `LANE_W`                                | `36` (cada calle tiene dos carriles, una por sentido: 72 px de ancho)             |
| `COL_X`                                 | `[280, 520]` (centros de las dos calles verticales)                               |
| `ROW_Y`                                 | `[200, 400]` (centros de las dos calles horizontales)                             |
| `BOX_SIZE`                              | `72` (cada cruce es un cuadrado de 72×72)                                         |
| `STOP_GAP`                              | `6` (distancia entre el frente del auto detenido y el borde del cruce)            |
| `CAR_LEN` / `CAR_WID`                   | `28` / `16`                                                                       |
| `CAR_SPEED`                             | `180`                                                                             |
| `CAR_ACCEL`                             | `350`                                                                             |
| `BRAKE`                                 | `500` (frenado máximo de cualquier auto)                                          |
| `FOLLOW_GAP`                            | `8` (separación entre autos detenidos)                                            |
| `SPAWN_CLEARANCE`                       | `8` (hueco mínimo delante del borde para que entre otro auto)                     |
| `STOPPED_SPEED`                         | `5` (por debajo de esta velocidad un auto cuenta como detenido)                   |
| `SWITCH_COOLDOWN`                       | `0.4` s (tiempo mínimo entre dos cambios de luz del mismo cruce)                  |
| `CRASH_LOCK`                            | `1.5` s (el cruce donde hubo un choque queda en rojo para los dos ejes)           |
| `CRASH_FX_TIME`                         | `0.5` s (duración del anillo de choque)                                           |
| `CRASH_PENALTY`                         | `200` puntos                                                                      |
| `TIME_LIMIT`                            | `120` s                                                                           |
| `WAVE_LENGTH`                           | `30` s (nivel = `min(4, 1 + floor(segundos transcurridos / 30))`)                 |
| `SPAWN_INTERVALS`                       | `[5.0, 4.0, 3.2, 2.6]` s medios entre apariciones de cada carril, por nivel 1 a 4 |
| `SPAWN_JITTER_MIN` / `SPAWN_JITTER_MAX` | `0.6` / `1.4` (el intervalo real es el medio × un azar uniforme de ese rango)     |
| `FIRST_SPAWN_MIN` / `FIRST_SPAWN_MAX`   | `0.5` / `3.0` s (primera aparición de cada carril)                                |
| `CAR_MAX_POINTS`                        | `100` (auto que no se detuvo nunca)                                               |
| `WAIT_PENALTY`                          | `10` puntos menos por cada segundo entero detenido                                |
| `CAR_MIN_POINTS`                        | `10` (piso de los puntos de un auto)                                              |
| `STOP_LINE_THICK` / `STOP_LINE_WID`     | `4` / `32` (grosor y ancho de la línea de alto)                                   |
| `SCORE_MAX`                             | `9_999_999`                                                                       |
| `MAX_DT`                                | `0.05` s                                                                          |

Derivadas:

| Derivada                             | Fórmula                                                                   | Valor                                                |
| ------------------------------------ | ------------------------------------------------------------------------- | ---------------------------------------------------- |
| Cruces (`BOXES`)                     | cuadrado de `BOX_SIZE` centrado en cada par `(COL_X[c], ROW_Y[r])`        | ver la tabla de `lanes.ts`                           |
| Distancia de frenado                 | `CAR_SPEED² / (2 × BRAKE)`                                                | 32,4 px                                              |
| Desplazamiento máximo por frame      | `CAR_SPEED × MAX_DT`                                                      | 9 px (menos que el largo de un auto, 28 px)          |
| Autos que caben enteros en un acceso | `n` máximo con `stopPos − CAR_LEN − (n − 1) × (CAR_LEN + FOLLOW_GAP) ≥ 0` | 6 en los accesos horizontales y 4 en los verticales  |
| Autos que caben entre dos cruces     | misma cuenta entre la salida de uno y la línea del siguiente              | 4 en los carriles horizontales y 3 en los verticales |
| Nivel por tiempo                     | `min(4, 1 + floor((TIME_LIMIT − timeLeft) / WAVE_LENGTH))`                | 1 (0 a 30 s), 2, 3 y 4 (90 a 120 s)                  |

Colores del canvas (espejo de los tokens de `app/globals.css`, porque el canvas no puede leer clases de Tailwind):

```ts
export const COLORS = {
  background: "#05050a", // --deep
  road: "#0d0d15", // --surface
  box: "#11111a", // --surface-2
  curb: "#2a2a38", // --border
  divider: "#3a3a4c", // --border-strong
  label: "#8a9bb0", // --muted
  headlight: "#e6f7ff", // --foreground
  green: "#00ff88", // --neon-green
  red: "#ff006e", // --neon-pink
} as const;

// Autos: un color al azar por auto
export const CAR_COLORS = [
  "#00f5ff", // --neon-cyan
  "#b026ff", // --neon-purple
  "#ff8c42", // --bronze
  "#d6e2ee", // --silver
] as const;
```

Todos los tokens existen ya en `app/globals.css` (`--neon-purple` lo agregó el SPEC 07), así que no hay que tocar el CSS. Los autos no usan verde ni rosa para no confundirse con las líneas de alto.

### Red de calles — `lib/arcade/cruce/lanes.ts`

```ts
export type Axis = "h" | "v"; // h: calle horizontal, v: calle vertical
export type Light = "green" | "red";
export type Heading = "east" | "west" | "south" | "north";

export interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface LaneDef {
  heading: Heading;
  axis: Axis;
  center: number; // coordenada fija del centro del carril: y si es horizontal, x si es vertical
  length: number; // 800 (horizontal) o 600 (vertical)
  boxes: [number, number]; // índices de los dos cruces que atraviesa, en orden de recorrido
  stopPos: [number, number]; // frente del auto detenido ante cada cruce
  exitPos: [number, number]; // el auto salió del cruce cuando pos − CAR_LEN >= exitPos
}

export const BOXES: Rect[]; // 4 cruces, índice 0 a 3
export const LANES: LaneDef[]; // 8 carriles, índice 0 a 7
export function laneRect(
  lane: LaneDef,
  pos: number,
  len: number,
  wid: number,
): Rect;
```

Los cruces, en orden, con su tecla:

| Índice | Posición | `x`   | `y`   | Tamaño | Tecla | Eje con verde al empezar |
| ------ | -------- | ----- | ----- | ------ | ----- | ------------------------ |
| 0      | noroeste | `244` | `164` | 72×72  | `Q`   | `h`                      |
| 1      | noreste  | `484` | `164` | 72×72  | `W`   | `v`                      |
| 2      | suroeste | `244` | `364` | 72×72  | `A`   | `v`                      |
| 3      | sureste  | `484` | `364` | 72×72  | `S`   | `h`                      |

Las calles tienen 72 px: las horizontales ocupan `y` de 164 a 236 y de 364 a 436, y las verticales `x` de 244 a 316 y de 484 a 556. Los vehículos circulan por la derecha. `pos` es la distancia del **frente** del auto al borde por el que entra a la pantalla, así que el mismo número sirve para los cuatro sentidos. Los carriles:

| Índice | Nombre | `heading` | `axis` | `center` | `length` | `boxes`  | `stopPos`    | `exitPos`    |
| ------ | ------ | --------- | ------ | -------- | -------- | -------- | ------------ | ------------ |
| 0      | E1     | `east`    | `h`    | `218`    | `800`    | `[0, 1]` | `[238, 478]` | `[316, 556]` |
| 1      | W1     | `west`    | `h`    | `182`    | `800`    | `[1, 0]` | `[238, 478]` | `[316, 556]` |
| 2      | E2     | `east`    | `h`    | `418`    | `800`    | `[2, 3]` | `[238, 478]` | `[316, 556]` |
| 3      | W2     | `west`    | `h`    | `382`    | `800`    | `[3, 2]` | `[238, 478]` | `[316, 556]` |
| 4      | S1     | `south`   | `v`    | `262`    | `600`    | `[0, 2]` | `[158, 358]` | `[236, 436]` |
| 5      | N1     | `north`   | `v`    | `298`    | `600`    | `[2, 0]` | `[158, 358]` | `[236, 436]` |
| 6      | S2     | `south`   | `v`    | `502`    | `600`    | `[1, 3]` | `[158, 358]` | `[236, 436]` |
| 7      | N2     | `north`   | `v`    | `538`    | `600`    | `[3, 1]` | `[158, 358]` | `[236, 436]` |

Las cifras de `stopPos` y `exitPos` salen de la geometría: en un carril horizontal que entra por la izquierda, el primer cruce empieza en `x = 244` y termina en `316`, así que `stopPos = 244 − 6 = 238` y `exitPos = 316`; el segundo, entre `484` y `556`, da `478` y `556`. Los carriles que entran por la derecha (`west`) o por abajo (`north`) miden `pos` desde su borde, y por simetría dan los mismos números. En los verticales, los cruces cubren `y` de 164 a 236 y de 364 a 436: `158`, `236`, `358` y `436`.

`laneRect` devuelve el rectángulo de un auto en coordenadas del canvas:

| `heading` | `x`                | `y`                | `w`   | `h`   |
| --------- | ------------------ | ------------------ | ----- | ----- |
| `east`    | `pos − len`        | `center − wid / 2` | `len` | `wid` |
| `west`    | `WIDTH − pos`      | `center − wid / 2` | `len` | `wid` |
| `south`   | `center − wid / 2` | `pos − len`        | `wid` | `len` |
| `north`   | `center − wid / 2` | `HEIGHT − pos`     | `wid` | `len` |

### Autos — `lib/arcade/cruce/cars.ts`

```ts
export interface Car {
  color: string; // de CAR_COLORS
  pos: number; // frente del auto, medido desde el borde de entrada; empieza en 0 (todo el cuerpo fuera de pantalla)
  speed: number; // empieza en CAR_SPEED
  stoppedTime: number; // s acumulados con speed < STOPPED_SPEED, desde que apareció
  boxIndex: 0 | 1 | 2; // 0 y 1: el cruce que le falta atravesar; 2: ya cruzó los dos
  stopping: boolean; // decidió detenerse en la línea de alto del cruce que sigue
  committed: boolean; // no alcanzaba a frenar cuando la luz se puso en rojo: cruza igual ese cruce
  scored: boolean; // ya se le dieron sus puntos
}

export function createCar(colorIndex: number): Car;
export function carRect(car: Car, lane: LaneDef): Rect; // laneRect(lane, car.pos, CAR_LEN, CAR_WID)
// true si el auto cabe del otro lado del cruce que sigue sin quedarse dentro de él
export function hasRoomAhead(
  car: Car,
  leader: Car | undefined,
  lane: LaneDef,
): boolean;
export function advanceCar(
  car: Car,
  leader: Car | undefined, // el auto de adelante en el mismo carril
  lane: LaneDef,
  light: Light, // luz de su eje en el cruce que sigue; "green" si boxIndex es 2
  dt: number,
): void;
```

### Cruces y semáforos — `lib/arcade/cruce/junctions.ts`

```ts
export interface Junction {
  axis: Axis; // el eje que tiene el verde
  cooldown: number; // s que faltan para aceptar otro cambio
  lockTimer: number; // s que faltan para reabrir tras un choque; con lockTimer > 0 los dos ejes están en rojo
}

export function createJunctions(): Junction[]; // 4: ejes iniciales "h", "v", "v" y "h" (tablero de ajedrez)
export function lightOf(junction: Junction, axis: Axis): Light;
// Si cooldown <= 0 y lockTimer <= 0: alterna el eje, pone cooldown = SWITCH_COOLDOWN y devuelve true
export function toggleJunction(junction: Junction): boolean;
export function updateJunction(junction: Junction, dt: number): void; // baja cooldown y lockTimer, con piso en 0
export function lockJunction(junction: Junction): void; // lockTimer = CRASH_LOCK
```

### Estado interno de la partida — `lib/arcade/cruce/game.ts`

```ts
type Phase = "playing" | "gameover";

interface LaneState {
  cars: Car[]; // cars[0] es el más adelantado (mayor pos); las apariciones se agregan al final
  spawnTimer: number; // s hasta el próximo auto; en 0 o menos, el auto espera lugar para entrar
}

interface CrashFx {
  x: number; // centro del choque
  y: number;
  elapsed: number; // s desde el choque
}

// Estado encapsulado en el cierre de createCruceEngine (no se exporta)
interface CruceState {
  phase: Phase;
  junctions: Junction[]; // 4, en el mismo orden que BOXES
  lanes: LaneState[]; // 8, en el mismo orden que LANES
  effects: CrashFx[];
  score: number;
  level: number; // 1 a 4
  timeLeft: number; // s restantes, de TIME_LIMIT a 0
  shownSecond: number; // último valor enviado con onTime
}
```

### Reglas del juego

**Inicio**

- `start()` arma el estado y emite `onScore(0)`, `onLevel(1)` y `onTime(120)`. **Nunca llama a `onLives`.** Conecta el teclado y arranca el loop con `lastTime = null`.
- Estado inicial: `junctions = createJunctions()`, los 8 carriles sin autos con `spawnTimer = rand(FIRST_SPAWN_MIN, FIRST_SPAWN_MAX)`, `score = 0`, `level = 1`, `timeLeft = TIME_LIMIT` y `shownSecond = 120`.
- No hay cuenta regresiva: el reloj corre desde que `StartScreen` llama a `start()`.

**Reloj y oleadas**

- Cada frame en `"playing"`: `timeLeft = max(0, timeLeft − dt)`. Si `ceil(timeLeft) !== shownSecond`, `shownSecond = ceil(timeLeft)` y se emite `onTime(shownSecond)`. El HUD muestra `2:00` hasta que pasa 1 s y llega a `0:00` al terminar.
- `level = min(4, 1 + floor((TIME_LIMIT − timeLeft) / WAVE_LENGTH))`. Si cambió, se emite `onLevel(level)`: el HUD pasa a `NIVEL 02` a los 30 s, `NIVEL 03` a los 60 s y `NIVEL 04` a los 90 s.
- El nivel solo cambia el intervalo medio de aparición: `SPAWN_INTERVALS[level − 1]`, o sea 5,0 s, 4,0 s, 3,2 s y 2,6 s por carril (alrededor de 1,6, 2,0, 2,5 y 3,1 autos por segundo entre los 8 carriles).

**Entrada**

- `createKeyboard()` de `lib/arcade/shared/keyboard.ts`, sin cambios. Cada frame, en `update`, se llama `consume` sobre `KeyQ`, `KeyW`, `KeyA` y `KeyS`; cada pulsación llama a `toggleJunction` del cruce 0, 1, 2 y 3 respectivamente. Se procesan en ese orden.
- `toggleJunction` se descarta (devuelve `false`) si el cruce sigue en `cooldown` (0,4 s desde su último cambio) o está cerrado por un choque (`lockTimer > 0`). Una pulsación descartada no se guarda.
- Las letras no hacen scroll, así que `createKeyboard` no cambia. Espacio no tiene acción en el juego: solo inicia la partida desde `StartScreen`.

**Semáforos**

- `lightOf(junction, axis)`: con `lockTimer > 0`, los dos ejes están en rojo; si no, el eje de `junction.axis` está en verde y el otro en rojo. **No hay amarillo ni despeje**: el cambio es instantáneo, y por eso puede haber choques.

**Autos: decisión de detenerse y velocidad — `advanceCar`**

Cada frame, para cada auto de cada carril (de adelante hacia atrás, con el de adelante como `leader`). La luz que se le pasa es la de su eje en el cruce `lane.boxes[car.boxIndex]`, o `"green"` si `boxIndex` es 2.

```ts
const k = car.boxIndex; // 0 o 1: cruce que sigue; 2: sin más cruces
// 1) ¿Hay que detenerse en la línea? Solo importa antes de la línea del cruce que sigue
if (k < 2 && car.pos <= lane.stopPos[k]) {
  const required = light !== "green" || !hasRoomAhead(car, leader, lane);
  if (!required) {
    car.stopping = false;
  } else if (!car.stopping && !car.committed) {
    // Primer cuadro en que se exige detenerse: ¿alcanza a frenar?
    const brakingDistance = (car.speed * car.speed) / (2 * BRAKE);
    if (lane.stopPos[k] - car.pos >= brakingDistance) car.stopping = true;
    else car.committed = true; // ya no puede frenar: cruza este cruce aunque esté en rojo
  }
} else {
  car.stopping = false;
}

// 2) Velocidad objetivo
let limit = CAR_SPEED;
if (leader) {
  const gap = leader.pos - CAR_LEN - car.pos - FOLLOW_GAP; // espacio libre hasta el de adelante
  limit = Math.min(
    limit,
    Math.sqrt(leader.speed ** 2 + 2 * BRAKE * Math.max(0, gap)),
  );
}
if (car.stopping) {
  limit = Math.min(
    limit,
    Math.sqrt(2 * BRAKE * Math.max(0, lane.stopPos[k] - car.pos)),
  );
}

// 3) Acelerar o frenar hacia la velocidad objetivo
if (car.speed < limit) car.speed = Math.min(limit, car.speed + CAR_ACCEL * dt);
else car.speed = Math.max(limit, car.speed - BRAKE * dt);

// 4) Mover y acotar, para que con saltos de dt nada se atraviese
car.pos += car.speed * dt;
if (car.stopping && car.pos > lane.stopPos[k]) {
  car.pos = lane.stopPos[k];
  car.speed = 0;
}
if (leader) {
  const maxPos = leader.pos - CAR_LEN - FOLLOW_GAP;
  if (car.pos > maxPos) {
    car.pos = maxPos;
    car.speed = Math.min(car.speed, leader.speed);
  }
}
if (car.speed < STOPPED_SPEED) car.stoppedTime += dt;

// 5) ¿Salió del cruce? Pasa al siguiente (o a 2) y se "descompromete"
if (k < 2 && car.pos - CAR_LEN >= lane.exitPos[k]) {
  car.boxIndex = k + 1;
  car.committed = false;
  car.stopping = false;
}
```

- Un auto comprometido (`committed`) ignora el semáforo de ese cruce hasta salir de él. Es la «zona de dilema» real: quien está más cerca de la línea que su distancia de frenado (32,4 px a 180 px/s) cruza aunque la luz haya cambiado. Un auto que se exige detenerse más lejos frena y espera en la línea.
- **Regla de no bloquear el cruce** (`hasRoomAhead`): con `leader`, un auto solo puede entrar al cruce que sigue si `leader.pos − CAR_LEN >= lane.exitPos[car.boxIndex] + CAR_LEN + FOLLOW_GAP`, es decir, si del otro lado del cruce hay lugar para un auto entero más su separación. Sin `leader` siempre hay lugar. Si no hay lugar, el auto se detiene en la línea aunque la luz esté en verde. Así un auto nunca queda parado dentro de un cruce, y una cola que llena el tramo entre dos cruces no traba al eje contrario. La cuenta es estricta a propósito (no mira si el de adelante se está moviendo): con 4 autos entre el noroeste y el noreste, el quinto espera en la línea aunque haya verde.
- Un auto que espera en la línea arranca en cuanto su eje recibe el verde y hay lugar (`required = false` ⇒ `stopping = false`), y sigue al de adelante con el hueco de `FOLLOW_GAP`.

**Apariciones (por carril, cada frame)**

1. `spawnTimer −= dt`. Si `spawnTimer <= 0`, el carril intenta hacer entrar un auto.
2. Hay lugar cuando el carril no tiene autos o el último tiene `pos − CAR_LEN >= SPAWN_CLEARANCE`. Si hay lugar, entra un auto nuevo con `createCar(randInt(0, 3))` (`pos = 0`, `speed = CAR_SPEED`, `boxIndex = 0`), queda al final de `cars` y `spawnTimer = SPAWN_INTERVALS[level − 1] × rand(SPAWN_JITTER_MIN, SPAWN_JITTER_MAX)`. Si no hay lugar, el auto espera fuera de pantalla y se vuelve a intentar el siguiente frame, sin ninguna penalización.
3. Como el auto entra con el cuerpo fuera de pantalla, nunca «aparece de golpe»: entra a 180 px/s y frena detrás de la cola si hace falta. Con autos de 28 px, en un acceso horizontal caben 6 enteros y en uno vertical 4; el siguiente espera con parte del cuerpo fuera de pantalla.

**Cruces completados y puntos**

- Cuando `boxIndex` llega a 2 y `!scored`, el auto **completó su viaje** (salió del segundo cruce). En ese frame: `scored = true`, `points = max(CAR_MIN_POINTS, CAR_MAX_POINTS − WAIT_PENALTY × floor(stoppedTime))`, `score = min(SCORE_MAX, score + points)` y se emite `onScore(score)`.
- Por ejemplo: un auto que nunca se detuvo da 100; uno detenido 1,5 s, 90; uno detenido 3,4 s, 70; uno detenido 9 s o más, 10 (el piso).
- Un auto se retira cuando `pos − CAR_LEN >= lane.length` (salió entero de la pantalla). Los autos que siguen en la pantalla al terminar el reloj no puntúan.

**Choques**

- Después de mover todos los autos, cada frame se comparan los autos de los carriles horizontales (0 a 3) con los de los verticales (4 a 7) por rectángulo (`carRect`). Dos autos que se solapan (intersección de ancho y alto positivos) **chocan**. Los autos del mismo eje nunca se tocan (el seguimiento lo impide), y un solape siempre ocurre dentro de un cruce.
- Un choque: (1) los dos autos se retiran; (2) `score = max(0, score − CRASH_PENALTY)` y se emite `onScore(score)`; (3) el cruce que contiene el centro del solape recibe `lockJunction` (`lockTimer = 1,5 s`: los dos ejes en rojo, el `cooldown` no importa); (4) se agrega un efecto `CrashFx` en el centro del solape. Un auto que ya chocó en este frame no se vuelve a considerar.
- Con el cruce cerrado, los autos que aún no pasaron la línea deben detenerse (los que no alcanzan a frenar cruzan, como siempre), y las pulsaciones de su tecla se descartan hasta que se reabre. Al reabrir conserva el eje que tenía.
- Cuándo hay choque: solo si un auto de un eje está todavía dentro del cruce (o a menos de 32,4 px de entrar, comprometido) cuando el otro eje recibe el verde y en ese otro eje hay un auto esperando en su línea o llegando. Ejemplo en el cruce noroeste con el eje horizontal en verde y un auto de N1 detenido en su línea: si se pulsa `Q` cuando el frente de un auto de E1, a velocidad de crucero, está entre `210` y `270` px (desde 28 px antes de su línea, que está en `238`, hasta 32 px después), el auto de N1 arranca y lo toca entre 0,3 s y 0,5 s después, y hay choque. Si el auto de E1 está a más de 33 px de la línea (frente antes de `205`), frena y espera sin choque.
- Un efecto dura `CRASH_FX_TIME` (0,5 s) y luego se descarta.

**Fin de partida**

- Cuando `timeLeft` llega a 0, al final del `update` de ese frame: `phase = "gameover"`, se desconecta el teclado, se emite `onTime(0)` y se llama `onGameOver(score)` **una sola vez**, con el mismo valor que mostraba el HUD.
- No hay derrota por fallas ni victoria: la partida dura siempre 120 s de juego (sin contar las pausas).
- Tras el fin de partida, `update` no hace nada: los autos quedan congelados detrás del modal.

**Puntaje máximo práctico**

- Cota dura: cada carril aparece un auto como mucho cada `0,6 × intervalo` s, o sea a lo sumo `8 × (30 / 3,0 + 30 / 2,4 + 30 / 1,92 + 30 / 1,56) + 8 ≈ 467` autos en toda la partida, y cada uno suma 100 como máximo: **menos de 47.000 puntos**, muy por debajo de 9.999.999.
- Práctico: entran en promedio unos 275 autos y una partida muy buena completa casi todos con una espera media de 2 a 3 s: entre 15.000 y 22.000 puntos. Cada choque resta 200 (dos autos sin espera). `SCORE_MAX` se conserva por el `CHECK` de `scores`.

### Dibujo — `lib/arcade/cruce/render.ts`

Encuadre en la resolución interna de 800×600, sin paneles:

| Elemento            | Posición y tamaño                                                                                                                                       |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Fondo               | Todo el canvas, `COLORS.background`                                                                                                                     |
| Calles horizontales | `(0, 164, 800, 72)` y `(0, 364, 800, 72)`, `COLORS.road`                                                                                                |
| Calles verticales   | `(244, 0, 72, 600)` y `(484, 0, 72, 600)`, `COLORS.road`                                                                                                |
| Cruces              | Los 4 rectángulos de `BOXES`, `COLORS.box`                                                                                                              |
| Bordes de calle     | Líneas de 2 px en `COLORS.curb` en los bordes de cada calle, sin entrar a los cruces ni cruzar otra calle                                               |
| Divisores de carril | Línea discontinua de 2 px (segmentos y huecos de 12 px) en `COLORS.divider`, en `y = 200`, `y = 400`, `x = 280` y `x = 520`, interrumpida en los cruces |

Orden en cualquier fase: fondo, calles y cruces, bordes, divisores, líneas de alto, letras y cierres, autos y efectos de choque.

- **Líneas de alto:** una por carril y por cruce (16), un rectángulo de `STOP_LINE_THICK × STOP_LINE_WID` (4×32) centrado en el carril, que ocupa de `stopPos + 2` a `stopPos + 6` (con `laneRect(lane, stopPos[k] + 6, 4, 32)`). El color depende de `lightOf(junctions[lane.boxes[k]], lane.axis)`: `COLORS.green` o `COLORS.red`, con `shadowBlur = 6` y `shadowColor` del mismo color.
- **Letras:** en el centro de cada cruce, `Q`, `W`, `A` o `S` en `bold 16px monospace`, centrada, en `COLORS.label`; en `COLORS.red` si el cruce está cerrado.
- **Cruce cerrado (`lockTimer > 0`):** borde de 2 px en `COLORS.red` y una cruz diagonal (dos líneas de esquina a esquina del cruce) con `globalAlpha = 0.5`.
- **Autos:** relleno de su color con `globalAlpha = 0.35`, borde de 2 px con alfa 1 y dos faros de 3×3 px en `COLORS.headlight`, a 2 px del borde delantero y a 3 px de cada costado. Sin glow (puede haber más de 25 autos en pantalla).
- **Choques:** un anillo de 3 px en `COLORS.red` centrado en el choque, con radio `6 + 28 × elapsed / CRASH_FX_TIME` y `globalAlpha = 1 − elapsed / CRASH_FX_TIME`.
- Cada función deja `globalAlpha = 1` y `shadowBlur = 0` al terminar.
- Con `"gameover"` se sigue dibujando el último estado, sin cambios.
- El canvas no dibuja puntuación, tiempo, nivel, PAUSA ni GAME OVER: eso lo muestran `PlayerHud`, `GameOverModal` y el overlay de `CrtScreen`.

### Reglas del loop

- El loop corre con `requestAnimationFrame`; `dt` se calcula en segundos con tope `MAX_DT` (`0.05 s`). `resume()` pone `lastTime = null`, así que el primer frame tras la pausa tiene `dt = 0`.
- Sin `setTimeout` ni `setInterval`: `timeLeft`, los `cooldown` y `lockTimer`, `spawnTimer`, `stoppedTime` y `elapsed` de los efectos avanzan con `dt`, así que la pausa los congela y el reloj del HUD se detiene.
- Orden de `update(dt)` en `"playing"`: (1) reloj, nivel y `onTime`; (2) entrada y `toggleJunction`; (3) `updateJunction` de los 4 cruces; (4) apariciones de los 8 carriles; (5) `advanceCar` de cada auto, de adelante hacia atrás, con los puntos de los que completaron su viaje y el retiro de los que salieron; (6) choques; (7) efectos; (8) fin de partida si `timeLeft` es 0.
- A 180 px/s un auto recorre como máximo 9 px por frame, menos que su largo (28 px) y que el ancho de un auto en el cruce: el tope de `dt` y las acotaciones de `advanceCar` (línea de alto y auto de adelante) impiden que atraviese la línea o a otro auto, y los choques se detectan por solape de rectángulos sin perder ninguno.
- `pause()` cancela el frame y desconecta el teclado (vacía las teclas sostenidas). `resume()` lo reconecta, salvo que la partida haya terminado. `destroy()` cancela el loop, quita todos los listeners y es idempotente (React Strict Mode monta y desmonta dos veces en desarrollo).
- Al terminar la partida, `onGameOver` se llama una sola vez, se desconecta el teclado y el loop sigue redibujando hasta `destroy()`.

## Plan de implementación

1. **Catálogo.** Aplicar `add_cruce_game`. Verificación: `select id, title, category, accent, sort_order, short_description, long_description from public.games order by sort_order` muestra la fila `cruce` con `sort_order` 9 y las otras 8 sin cambios, y `get_advisors` (security) no reporta alertas nuevas. `/games` muestra CRUCE al final, el chip «Puzles» lo filtra y `/games/cruce/play` muestra SIMULAR PARTIDA.
2. **Contrato y HUD.** En `lib/arcade/engine.ts`, agregar `onTime?` a `GameCallbacks` y `time?` a `GameHud`. En `components/game/GameCanvas.tsx`, reenviar `onTime`. En `PlayerHud.tsx`, agregar las props `showTime` y `time` y la celda TIEMPO. En `PlayerView.tsx`, agregar `time` al estado, el callback `onTime` y las dos props nuevas a `PlayerHud`. Verificación: `npx tsc --noEmit` y `npm run lint` pasan; ASTEROIDS, ARKANOID y SNAKE siguen mostrando VIDAS y NIVEL sin TIEMPO, TETRIS sigue mostrando PUNTUACIÓN y NIVEL sin VIDAS ni TIEMPO, y un juego simulado sigue mostrando VIDAS.
3. **Constantes y red.** Crear `lib/arcade/cruce/constants.ts` y `lanes.ts`. Verificación: `npx tsc --noEmit` pasa, `LANES` tiene 8 carriles y `BOXES` 4 cruces, y `laneRect` de un auto detenido en `stopPos[0]` da `x = 210` en el carril `E1` (`238 − 28`) y `x = 562` en el carril `W1` (`WIDTH − 238`).
4. **Autos y cruces.** Crear `lib/arcade/cruce/cars.ts` y `junctions.ts`. Verificación: `npx tsc --noEmit` y `npm run lint` pasan.
5. **Dibujo.** Crear `lib/arcade/cruce/render.ts`. Verificación: `npx tsc --noEmit` pasa.
6. **Motor.** Crear `lib/arcade/cruce/game.ts` con `createCruceEngine` (estado, entrada, reloj, apariciones, choques, puntos, `update`, `draw`, loop y `start`/`pause`/`resume`/`destroy`) e `index.ts` con `cruceDefinition`. Todavía no se registra. Verificación: `npx tsc --noEmit` y `npm run lint` pasan.
7. **Registrar y conectar.** Agregar `cruce: cruceDefinition` a `DEFINITIONS` en `lib/arcade/registry.ts`. Verificación: en `/games/cruce/play` se juega una partida completa de 120 s hasta el modal, y GUARDAR PUNTUACIÓN crea una fila en `scores` con `game_id = 'cruce'` que aparece en `/games/cruce`.
8. **Documentación.** Actualizar `references/implemented-games.md`: fila 5 en la tabla (`cruce`, CRUCE, Puzles, `pink`, `/games/cruce/play`, `lib/arcade/cruce/`, el spec con el que se promueva), el resumen («5 juegos jugables de los 9 que hay en el catálogo»), la fecha de consulta de la tabla `games` y una sección CRUCE con sus descripciones y la nota «diseñado desde cero (game jam, tema «cruzar»), con `hud: { lives: false, time: true }`». Actualizar `CLAUDE.md`: el párrafo de «Proyecto» y la entrada de `lib/arcade/engine.ts` de «Estructura» dicen que `GameDefinition.hud` también tiene `time?`, que muestra la celda TIEMPO con lo que emite el callback opcional `onTime`. Verificación: `npm run format:check` pasa y `git diff main -- references/` solo muestra `references/implemented-games.md`.

## Criterios de aceptación

**Generales**

- [ ] `npm run build`, `npm run lint` y `npx tsc --noEmit` terminan sin errores.
- [ ] Existen los siete archivos de `lib/arcade/cruce/` (`constants.ts`, `lanes.ts`, `cars.ts`, `junctions.ts`, `render.ts`, `game.ts` e `index.ts`).
- [ ] Ningún archivo de `lib/arcade/` importa `react` ni declara `"use client"`, y ninguno toca `window` ni `document` a nivel de módulo.
- [ ] `git diff main -- references/` solo muestra cambios en `references/implemented-games.md`.
- [ ] `lib/arcade/shared/` y las carpetas de los cuatro motores existentes no cambian, y `components/game/` solo cambia en `GameCanvas.tsx`, `PlayerHud.tsx` y `PlayerView.tsx`.
- [ ] `onTime` y `hud.time` son opcionales en `engine.ts`: ningún motor existente necesita cambios para compilar.
- [ ] Al jugar una partida completa en `/games/cruce/play`, la consola del navegador no muestra errores ni advertencias de hidratación, ni advertencias de claves duplicadas en `StartScreen`.

**Catálogo**

- [ ] `games` tiene la fila `cruce` con título `CRUCE`, categoría `Puzles`, acento `pink`, los textos del spec y `sort_order` 9, y las otras 8 filas no cambiaron.
- [ ] `/games` muestra CRUCE al final de la grilla, el chip «Puzles» lo muestra junto a TETRIS y `/games/cruce` muestra su descripción.

**Flujo del Reproductor**

- [ ] `/games/cruce/play` muestra el `PixelLoader` y luego `StartScreen` con «CRUCE», las dos filas de controles (`Q W / A S` CAMBIAR SEMÁFORO y `P` PAUSA), «PRESIONA ESPACIO» e INICIAR.
- [ ] Presionar Espacio en `StartScreen` (o hacer clic en INICIAR) inicia la partida sin que Espacio haga nada en el juego: aparece la red de 2×2 cruces con los semáforos en tablero de ajedrez (noroeste y sureste con el eje horizontal en verde, noreste y suroeste con el vertical) y el primer auto entra entre 0,5 s y 3,0 s después.
- [ ] Desde el `PixelLoader`, el HUD muestra PUNTUACIÓN, TIEMPO, NIVEL y JUGADOR, sin celda VIDAS. Con la partida iniciada muestra `PUNTUACIÓN 0`, `TIEMPO 2:00` y `NIVEL 01`.
- [ ] Con una ventana más baja que la página, Espacio y las flechas no hacen scroll durante la partida.
- [ ] Emulando un dispositivo táctil (`pointer: coarse`), `StartScreen` muestra «ESTE JUEGO NECESITA TECLADO» y no muestra INICIAR.

**Jugabilidad**

- [ ] Hay 4 cruces en una red de 2×2, cada uno con una letra (`Q` arriba a la izquierda, `W` arriba a la derecha, `A` abajo a la izquierda y `S` abajo a la derecha), y 8 carriles de entrada. Los autos circulan por la derecha y atraviesan dos cruces derecho.
- [ ] Un auto libre avanza a unos 180 px/s: cobra sus puntos al salir del segundo cruce, unos 3,2 s después de entrar en un carril horizontal y unos 2,6 s después en uno vertical.
- [ ] `Q`, `W`, `A` y `S` alternan el semáforo del noroeste, noreste, suroeste y sureste respectivamente: las líneas de alto de los dos ejes de ese cruce cambian de verde a rosa y al revés al instante.
- [ ] Pulsar dos veces la misma tecla en menos de 0,4 s solo cuenta la primera.
- [ ] Un auto que a la hora del cambio de luz está a más de 33 px de su línea de alto frena y se detiene con el frente en la línea (`stopPos`), sin pasarse. Uno que está a menos de 32 px la cruza aunque la luz se haya puesto en rojo.
- [ ] Los autos detenidos hacen cola separados por unos 8 px, y al darse el verde arrancan uno tras otro, sin traslaparse nunca.
- [ ] Un auto no entra a un cruce si del otro lado no hay lugar para él: con 4 autos detenidos entre el noroeste y el noreste (carril E1), un quinto espera en la línea del noroeste aunque esté en verde, y nunca queda parado dentro de un cruce.
- [ ] Un auto que nunca se detuvo suma 100 puntos al completar su viaje; uno detenido entre 1 y 2 s suma 90; uno detenido 3,4 s suma 70; y uno detenido 9 s o más suma 10.
- [ ] Un choque se provoca con el cruce noroeste con el eje horizontal en verde, un auto de N1 detenido en su línea y un auto de E1, a velocidad de crucero, con el frente entre 210 y 270 px cuando se pulsa `Q`: los dos autos desaparecen con un anillo rosa, la puntuación baja 200 (con piso en 0), el cruce queda cerrado 1,5 s (borde y cruz rosas, letra rosa, las dos líneas en rojo) y `Q` no responde en ese lapso. Con el frente del auto de E1 a más de 205 px la misma pulsación no produce choque.
- [ ] Tras un choque, el cruce se reabre a los 1,5 s con el mismo eje en verde que tenía y los autos que esperaban arrancan.
- [ ] Las oleadas: el HUD pasa a `NIVEL 02` a los 30 s, a `NIVEL 03` a los 60 s y a `NIVEL 04` a los 90 s (con el reloj en `1:30`, `1:00` y `0:30`), y nunca pasa de 04. El intervalo medio de aparición de cada carril es de 5,0, 4,0, 3,2 y 2,6 s en cada oleada (se verifica contando las entradas de un carril a lo largo de una oleada, con tolerancia de ±35 %).
- [ ] El reloj del HUD cuenta de `2:00` a `0:00` en 120 s de juego, un segundo por segundo.
- [ ] El canvas no dibuja puntuación, tiempo, nivel, PAUSA ni GAME OVER.
- [ ] Estilo: fondo `#05050a`, calles `#0d0d15`, cruces `#11111a`, autos cian, violeta, bronce o plata con relleno translúcido y borde neón, y líneas de alto verde `#00ff88` o rosa `#ff006e`; el overlay CRT se ve encima.

**Pausa**

- [ ] P y el botón PAUSA congelan el juego y el reloj del HUD, y muestran el overlay PAUSA; P y SEGUIR lo reanudan sin saltos (ningún auto da un salto de posición y el reloj sigue donde estaba).
- [ ] Mantener `Q`, `W`, `A` o `S` durante la pausa y soltarla no deja un cambio de luz «pegado» al reanudar.
- [ ] Cambiar de pestaña o hacer clic fuera de la ventana durante la partida la deja en PAUSA.
- [ ] Los temporizadores del juego (reloj, enfriamiento de luces, cierre por choque, apariciones y animación de choque) no avanzan durante la pausa.

**Fin de partida y ranking**

- [ ] Al llegar el reloj a `0:00` se abre `GameOverModal` con la misma puntuación que mostraba el HUD, y detrás quedan los autos congelados. Es el único final: no hay modal antes de los 120 s.
- [ ] `onGameOver` se llama una sola vez por partida (el modal no se reabre ni se guarda dos veces).
- [ ] GUARDAR PUNTUACIÓN crea exactamente una fila en `scores` con `game_id = 'cruce'`, y aparece en `/games/cruce` y en la pestaña CRUCE del Salón de la Fama si entra en el top 10.
- [ ] La tarjeta de CRUCE en `/games` muestra esa puntuación como MEJOR PUNTUACIÓN si es la primera.
- [ ] JUGAR DE NUEVO vuelve al `PixelLoader` y a `StartScreen`, y la nueva partida arranca desde cero (sin autos, `PUNTUACIÓN 0`, `TIEMPO 2:00` y `NIVEL 01`, con el HUD de TIEMPO en `0:00` mientras carga).
- [ ] SALIR durante la partida lleva a `/games/cruce`, y volver a jugar no deja dos loops corriendo (los autos no avanzan al doble de velocidad y el reloj no corre al doble).

**Sin regresiones**

- [ ] ASTEROIDS, ARKANOID y SNAKE se juegan igual que antes del spec y su HUD muestra PUNTUACIÓN, VIDAS, NIVEL y JUGADOR, sin celda TIEMPO.
- [ ] TETRIS se juega igual que antes del spec y su HUD sigue mostrando PUNTUACIÓN, NIVEL y JUGADOR, sin VIDAS ni TIEMPO.
- [ ] Los juegos sin motor (PAC-MAN, SPACE INVADERS, FROGGER y GALAGA) siguen mostrando SIMULAR PARTIDA, y su HUD muestra VIDAS y no muestra TIEMPO.
- [ ] `/`, `/games`, `/hall-of-fame` y `/about` se ven igual que antes del spec, salvo CRUCE donde corresponda (la Biblioteca y el Salón de la Fama lo listan; el Home no cambia).

## Decisiones

- **Sí:** interpretar «cruzar» como **hacer cruzar**: el jugador maneja los semáforos y los autos cruzan. **No:** que el jugador cruce saltando entre carriles y troncos. Esa es la mecánica de FROGGER, que sigue pendiente en el catálogo. Lo decidió el agente (game jam).
- **Sí:** motor en TypeScript dentro del bundle, con el contrato del SPEC 05, sin iframe. Fin de partida de la plataforma; el HUD de la plataforma con la celda TIEMPO nueva. Lo decidió el agente (game jam).
- **Sí:** una red de 2×2 cruces con 8 carriles y una tecla por cruce (`Q W A S`, en la misma disposición que los cruces). **No:** un solo cruce con selección por eje (es la variante A) ni una red de 3×3, que no cabe con carriles legibles en 800×600. Lo decidió el agente (game jam).
- **Sí:** cambio de luz instantáneo y choques posibles, para que la habilidad sea anticipar cuándo cambiar. **No:** amarillo y despeje automático que impiden los choques (la variante A). Lo decidió el agente (game jam).
- **Sí:** partida contra reloj de 120 s y sin vidas; el final es el reloj. **No:** vidas por atasco, como en la variante A: con 8 carriles y colas que se pueden desbordar sin penalización, el tráfico atascado ya cuesta puntos porque los autos esperando valen menos. Lo decidió el agente (game jam).
- **Sí:** cuatro oleadas de 30 s con intervalos de 5,0, 4,0, 3,2 y 2,6 s por carril, mostradas como NIVEL 01 a 04. **No:** dificultad continua sin tope (variante A) ni un nivel que no cambie el tráfico. Lo decidió el agente (game jam).
- **Sí:** cada auto vale `max(10, 100 − 10 × segundos enteros detenido)`: el objetivo es que nadie espere, no solo que crucen. **No:** puntos fijos por auto (como la variante A), que no distinguen un cruce fluido de uno a los empujones, ni combos de rachas, que se romperían con cada auto que espera. Lo decidió el agente (game jam).
- **Sí:** choque = −200 puntos, los dos autos desaparecen y el cruce se cierra 1,5 s. **No:** restar tiempo al reloj (mezcla dos recursos) ni terminar la partida (desproporcionado para un error de 0,4 s). Lo decidió el agente (game jam).
- **Sí:** enfriamiento de 0,4 s por cruce entre cambios de luz. **No:** dejarlo sin límite: alternar a mano sin parar mantendría a todos los autos en modo frenado y arranque sin costo, y desfiguraría la decisión del jugador. Lo decidió el agente (game jam).
- **Sí:** el auto que no alcanza a frenar (más cerca de la línea que su distancia de frenado) cruza aunque haya cambiado la luz. Es la «zona de dilema» real y es lo que da sentido al riesgo de cambiar tarde. **No:** frenado instantáneo en la línea, que se vería artificial y eliminaría los choques. Lo decidió el agente (game jam).
- **Sí:** regla estricta de no bloquear el cruce: un auto solo entra si del otro lado hay lugar para él entero, sin importar si el de adelante se mueve. **No:** dejar entrar mientras el de adelante se mueva, que puede dejar un auto atravesado en el cruce y provocar choques injustos, ni permitir el bloqueo sin más, que puede trabar toda la red. Lo decidió el agente (game jam).
- **Sí:** letras `Q W A S` para los cruces, en la misma disposición que la red. **No:** usar Espacio para alternar (ya inicia la partida desde `StartScreen`), números (`1 a 4`, sin relación espacial) ni selección con flechas más una tecla de acción (dos pasos por cambio). Lo decidió el agente (game jam).
- **Sí:** ampliar el contrato con `onTime?` y `hud.time?`, para mostrar TIEMPO en la celda del HUD junto a PUNTUACIÓN. **No:** dibujar el reloj en el canvas (se perdería entre los autos y duplicaría lo que el HUD ya hace para los demás datos de la partida), ni reusar la celda VIDAS o NIVEL con otro significado (mostraría un dato falso). Lo decidió el agente (game jam).
- **Sí:** `hud.time` y `onTime` opcionales; `GameCanvas` los reenvía, `PlayerView` los guarda y `PlayerHud` los muestra. Es la única variante que toca el contrato: las otras opciones del skill (callback genérico `onStats`) son más grandes. **No:** un campo `hud.level`: NIVEL aquí es la oleada y se queda. Lo decidió el agente (game jam).
- **Sí:** `hud: { lives: false, time: true }`: no hay vidas, así que VIDAS se oculta con el campo que ya creó el SPEC 07. Lo decidió el agente (game jam).
- **Sí:** la pantalla muestra `0:00` en TIEMPO desde el `PixelLoader` hasta que `start()` emite `onTime(120)`. **No:** poner un valor inicial propio en `PlayerView` (tendría que conocer `TIME_LIMIT`, que es del motor). Es el mismo comportamiento de PUNTUACIÓN, que vale 0 desde el principio. Lo decidió el agente (game jam).
- **Sí:** categoría «Puzles» y acento `pink`. **No:** «Clásicos» (donde está FROGGER) ni una categoría nueva, que exigiría una migración `extend_games_category_check` y cambios en `lib/games.ts`. Lo decidió el agente (game jam).
- **Sí:** `id` `cruce` y título `CRUCE`. Lo decidió el agente (game jam).
- **Sí:** colores neón del tema con `COLORS` espejo de los tokens (sin tokens nuevos) y glow solo en las 16 líneas de alto. **No:** sprites: no hay assets útiles en `references/source-assets/`. Lo decidió el agente (game jam).
- **Sí:** sin sonido, sin controles táctiles, sin antitrampas y sin tests, como los SPEC 05 a 09. Lo decidió el agente (game jam).
- **Sí:** el loop sigue corriendo tras `"gameover"` hasta `destroy()`, como en los otros motores. Lo decidió el agente (game jam).
- **Sí:** se actualizan `references/implemented-games.md` (lo pide `CLAUDE.md` al implementar un juego) y `CLAUDE.md`, porque el contrato cambia. Lo decidió el agente (game jam).

## Riesgos

| Riesgo                                                                                                               | Mitigación                                                                                                                                                                                                                       |
| -------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| En desarrollo, React Strict Mode monta el efecto dos veces y deja dos loops corriendo.                               | `destroy()` cancela el `requestAnimationFrame` y quita todos los listeners. Hay un criterio de «volver a jugar no deja dos loops».                                                                                               |
| Acceder a `window` o `document` al importar `lib/arcade/cruce/` rompe el prerender.                                  | La convención obliga a tocar el DOM solo dentro de `create()`. `npm run build` lo detecta.                                                                                                                                       |
| El salto de `dt` al reanudar mueve los autos de golpe o descuenta tiempo del reloj.                                  | `resume()` pone `lastTime = null` y el tope de `dt` es de 50 ms.                                                                                                                                                                 |
| Un auto atraviesa su línea de alto o a otro auto con un `dt` grande.                                                 | A 180 px/s recorre como máximo 9 px por frame; `advanceCar` acota la posición a `stopPos` y al auto de adelante.                                                                                                                 |
| La pulsación de Espacio que inicia la partida también actúa en el juego.                                             | Espacio no tiene acción en CRUCE; además `consume()` ignora `event.repeat`. Hay un criterio de aceptación.                                                                                                                       |
| Una puntuación mayor que 9.999.999 hace fallar el guardado por el `CHECK` de `scores`.                               | `SCORE_MAX` en el motor. La cota dura es de unos 47.000 puntos.                                                                                                                                                                  |
| Ampliar el contrato rompe el HUD de los otros juegos.                                                                | `onTime` y `time` son opcionales y valen «no mostrar» por defecto; ningún motor existente los declara. Hay criterios de «Sin regresiones» para los cuatro motores y para los juegos simulados.                                   |
| `GameCanvas` no reenvía `onTime` y el reloj del HUD se queda en `0:00`.                                              | El spec lista `GameCanvas.tsx` como archivo que cambia y hay un criterio de que el reloj cuenta de `2:00` a `0:00`.                                                                                                              |
| La dificultad no se pudo probar jugando: los intervalos de las oleadas y los choques podrían quedar fáciles o duros. | Todas las cifras están en `constants.ts` (`SPAWN_INTERVALS`, `CRASH_PENALTY`, `CRASH_LOCK`, `SWITCH_COOLDOWN`, `WAVE_LENGTH`, `TIME_LIMIT`) y se ajustan sin tocar el contrato ni el resto del código.                           |
| El choque parece injusto porque el jugador no ve bien qué auto está por entrar.                                      | La ventana de riesgo es corta y conocida: un auto a menos de 32 px de su línea o dentro del cruce. Las líneas de alto se ven, el cruce cerrado se marca con un anillo, y el enfriamiento evita cambios accidentales repetidos.   |
| Una cola de autos llena el tramo entre dos cruces y traba la red.                                                    | La regla de no bloquear el cruce impide que un auto se detenga dentro de un cruce, así que el eje contrario siempre puede pasar; la cola se libera en cuanto el jugador da verde a su carril.                                    |
| Dos autos de un mismo eje se superponen en un cruce.                                                                 | El seguimiento y la acotación de `advanceCar` mantienen al menos 8 px entre autos del mismo carril, y los dos carriles de un mismo eje van en sentidos opuestos, en calles de dos carriles.                                      |
| Se detecta un choque entre dos autos que solo se rozan en el borde de un carril.                                     | Los rectángulos son de 28×16 px sobre carriles de 36 px: solo hay solape real dentro de un cruce, cuando un auto atraviesa el camino de otro. El borde de carril a carril de una misma calle nunca se toca (carriles paralelos). |
| Las letras `Q W A S` no están en `PREVENTED_CODES`.                                                                  | No hace falta: las letras no hacen scroll. `createKeyboard` no cambia.                                                                                                                                                           |
| El reloj del HUD muestra `0:00` antes de empezar, un valor engañoso.                                                 | Es el mismo caso que PUNTUACIÓN `0` en el `PixelLoader`; `start()` emite `onTime(120)` de inmediato. Queda como decisión documentada.                                                                                            |

## Lo que **no** entra en este spec

- Un cruce con despeje automático, vidas por atasco y dificultad continua (variante A).
- Giros, peatones, autobuses, ambulancias, motos, obras y accidentes.
- Semáforos con amarillo o con ciclo automático.
- Sonido y música.
- Controles táctiles o de mouse.
- Antitrampas o topes de puntuación por juego.
- Cambios en la Biblioteca, el Home o el Salón de la Fama más allá de la fila del catálogo.
- Tests automatizados.
- Cambios en `references/` (salvo `references/implemented-games.md`) o en los specs 01 a 09.

Si alguna de estas llega, va en su propio spec.
