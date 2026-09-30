# SPEC GJ-cruce-A — CRUCE jugable en el Reproductor

> **Estado:** Borrador
> **Game jam:** tema «cruzar» · variante A de 2 (Un solo cruce)
> **Depende de:** SPEC 05, SPEC 06, SPEC 07
> **Fecha:** 2026-09-30
> **Objetivo:** Crear un CRUCE jugable en `/games/cruce/play`, donde el jugador maneja el semáforo de un cruce de cuatro calles para que los autos crucen sin que las colas lleguen al borde, con tres vidas (atascos) y su puntuación en el ranking global.

## Por qué existe este spec

La game jam pidió el tema «cruzar». El clásico que primero viene a la mente, FROGGER, ya es una fila pendiente del catálogo (`games`, `sort_order` 7), así que este juego no puede ser «un bicho que salta de celda en celda entre carriles». CRUCE le da la vuelta: **el jugador no cruza, hace cruzar**. Es quien maneja el semáforo de un cruce de cuatro calles y decide en cada momento qué eje tiene el verde, el horizontal o el vertical. Cada auto que atraviesa el cruce suma puntos, y si la cola de una calle se llena hasta el borde de la pantalla y se queda ahí, se pierde una vida. El tema entra por el cruce mismo: todo el juego es decidir quién cruza primero y cuánto tiempo espera el otro.

Esta es la **variante A, «Un solo cruce»**: la más barata y la más fiel al tema. Hay un único cruce, un semáforo con amarillo y despeje automático (no hay choques posibles), tres vidas que se pierden por atascos y una dificultad que sube sin parar con el nivel. Se aparta de la **variante B, «Red de cruces»**, en que allí hay cuatro cruces a la vez, el cambio de luz es instantáneo y puede provocar choques, la partida es contra reloj de 120 s y el HUD gana una celda TIEMPO (con una ampliación del contrato). Aquí el contrato **no se amplía**.

No hay referencia que portar: en `references/started-games/` no existe un juego parecido y este spec fija todas las reglas y constantes, para que la implementación no tenga que improvisar. La plataforma ya cubre lo demás: el juego tiene vidas y niveles (el HUD por defecto le sirve), el canvas es 4:3 de 800×600 y las teclas que usa (flechas y `W A S D`) no exigen tocar `createKeyboard`, porque las flechas ya están bloqueadas y las letras no hacen scroll. `engine.ts`, `PlayerView`, `PlayerHud`, `GameCanvas`, `StartScreen` y los demás componentes compartidos no cambian.

## Alcance

**Incluye:**

- **Catálogo:** fila nueva `cruce` en `games` con la migración `add_cruce_game` (categoría «Puzles», acento rosa, al final de la lista).
- **Motor nuevo** en `lib/arcade/cruce/`, con: un cruce de dos calles de dos carriles (cuatro accesos, los autos solo van derecho); un semáforo de dos ejes con amarillo de 0,6 s y despeje automático, que solo da el verde al otro eje cuando el cruce está vacío; autos de 38 px a 160 px/s y autobuses de 76 px a 110 px/s desde el nivel 3; colas con frenado y seguimiento; 10 puntos por auto y 30 por autobús, más 5 si esperó menos de 2 s, multiplicado por el nivel; 3 vidas (cada atasco de 2,5 s cuesta una); nivel `1 + floor(autos cruzados / 15)` y tráfico cada vez más denso hasta un auto por segundo y por calle.
- **Estilo:** fondo `--deep`, calles `--surface` y `--surface-2`, autos con relleno translúcido y borde neón (cian, violeta y bronce), autobuses plata, y las líneas de alto que cambian a verde, amarillo o rosa según el semáforo.
- **HUD de la plataforma:** PUNTUACIÓN, VIDAS y NIVEL salen de los callbacks. El canvas no dibuja puntos, vidas, nivel, PAUSA ni GAME OVER.
- **Entrada:** `← →` o `A D` dan el verde al eje horizontal; `↑ ↓` o `W S` dan el verde al eje vertical.
- **Registro:** `cruce` se agrega a `DEFINITIONS`, así que `/games/cruce/play` es jugable.
- **Ranking:** la puntuación final se guarda en `scores` con el flujo existente de `GameOverModal`, sin cambios en el código del ranking.
- **Documentación:** actualizar `references/implemented-games.md`.

**Fuera de alcance (para futuros specs):**

- Varios cruces, cambio de luz instantáneo, choques y partida contra reloj (es la variante B).
- Giros (izquierda y derecha), peatones, ambulancias con prioridad, motos, obras y accidentes.
- Semáforos con ciclo automático o «onda verde» entre cruces.
- Sonido y música (el SPEC 05 ya dejó el sonido fuera).
- Controles táctiles o de mouse. En un dispositivo táctil `StartScreen` sigue mostrando «ESTE JUEGO NECESITA TECLADO».
- Validación antitrampas o topes de puntuación por juego.
- Cambios en la Biblioteca, el Home o el Salón de la Fama más allá de lo que da la fila del catálogo.
- Tests automatizados.
- Modificar `references/` (salvo `references/implemented-games.md`) o los specs 01 a 09.

## Rutas y archivos

```
lib/
  arcade/registry.ts              (cambia) + cruce
  arcade/cruce/constants.ts       (nuevo) dimensiones, cruce, autos, semáforo, apariciones, puntos, SCORE_MAX y COLORS
  arcade/cruce/lanes.ts           (nuevo) Axis, Light, LaneDef, LANES (4 accesos) y laneRect
  arcade/cruce/cars.ts            (nuevo) Car, createCar y advanceCar (frenado, seguimiento y decisión de detenerse)
  arcade/cruce/signal.ts          (nuevo) Signal, lightOf, requestAxis, updateSignal e isLaneClear
  arcade/cruce/render.ts          (nuevo) drawScene: calles, líneas de alto, autos y barras de atasco
  arcade/cruce/game.ts            (nuevo) createCruceEngine: estado, entrada, apariciones, atascos, puntos, update, draw y loop
  arcade/cruce/index.ts           (nuevo) cruceDefinition: GameDefinition
references/implemented-games.md   (cambia) fila y sección de CRUCE
```

Sin cambios: `CLAUDE.md`, `lib/arcade/engine.ts`, `lib/arcade/shared/`, `components/game/` (`PlayerView`, `PlayerHud`, `GameCanvas`, `StartScreen`, `GameOverModal`, `CrtScreen`, `PixelLoader`), `app/games/[id]/play/page.tsx`, `app/globals.css`, `lib/games.ts`, `lib/catalog.ts`, `lib/leaderboard.ts`, `lib/leaderboard-client.ts`, `DetailLeaderboard`, `HallOfFameTable` y `lib/supabase/database.types.ts`.

Base de datos (proyecto `xanuntuhanyubcqiudlp`, con `apply_migration` del MCP de Supabase): migración `add_cruce_game`. No cambia el esquema (solo agrega una fila), así que los tipos no se regeneran. La categoría «Puzles» y el acento `pink` ya existen, así que no hacen falta `extend_games_category_check` ni `extend_games_accent_check`.

Convenciones:

- Las de `lib/arcade/` del SPEC 05: sin React ni `"use client"`, DOM solo dentro de `create()`, estado en el cierre de `createCruceEngine` y loop por `dt` sin `setTimeout` ni `setInterval`.
- `lanes.ts`, `cars.ts` y `signal.ts` son funciones y tipos puros sobre los datos que reciben: no guardan estado de módulo.
- `createKeyboard`, `rand` y `randInt` se importan de `lib/arcade/shared/`; no se copian dentro de `lib/arcade/cruce/`.
- Código en inglés, comentarios en español latinoamericano, módulos sin JSX en kebab-case.

## Modelo de datos

### Catálogo — migración `add_cruce_game`

```sql
insert into public.games (id, title, category, accent, short_description, long_description, sort_order)
select 'cruce', 'CRUCE', 'Puzles', 'pink',
       'Dirige el semáforo y deja pasar a todos.',
       'Controla el semáforo de un cruce de cuatro calles y decide qué eje tiene el verde. Los autos que cruzan sin esperar valen más, y cada quince autos subes de nivel y llega más tráfico. Tienes tres vidas: si la cola de una calle llega al borde de la pantalla y se queda ahí, pierdes una.',
       coalesce(max(sort_order), 0) + 1
from public.games;
```

Fila resultante (con el catálogo actual de 8 juegos, `sort_order` vale 9):

| Campo               | Valor                                                                                                                                                                                                                                                                                        |
| ------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `id`                | `cruce`                                                                                                                                                                                                                                                                                      |
| `title`             | `CRUCE`                                                                                                                                                                                                                                                                                      |
| `category`          | `Puzles`                                                                                                                                                                                                                                                                                     |
| `accent`            | `pink`                                                                                                                                                                                                                                                                                       |
| `sort_order`        | `9` (el máximo actual más uno)                                                                                                                                                                                                                                                               |
| `short_description` | Dirige el semáforo y deja pasar a todos.                                                                                                                                                                                                                                                     |
| `long_description`  | Controla el semáforo de un cruce de cuatro calles y decide qué eje tiene el verde. Los autos que cruzan sin esperar valen más, y cada quince autos subes de nivel y llega más tráfico. Tienes tres vidas: si la cola de una calle llega al borde de la pantalla y se queda ahí, pierdes una. |

`id` cumple `^[a-z0-9-]+$`, el título tiene 5 caracteres (máximo 40) y `sort_order` no choca con ninguna fila. La fila queda fuera de los seis primeros, así que no aparece en «Juegos disponibles» del Home.

### Definición de CRUCE — `lib/arcade/cruce/index.ts`

- `width: 800`, `height: 600` (4:3, igual que el CRT). El cruce se dibuja centrado y las calles llegan hasta los bordes, sin paneles.
- Sin campo `hud`: el HUD muestra PUNTUACIÓN, VIDAS, NIVEL y JUGADOR.
- `controls`. Cada `action` es única porque `StartScreen` la usa como `key` de React:

| `keys`      | `action`         |
| ----------- | ---------------- |
| `← → / A D` | VERDE HORIZONTAL |
| `↑ ↓ / W S` | VERDE VERTICAL   |
| `P`         | PAUSA            |

### Constantes — `lib/arcade/cruce/constants.ts`

No hay referencia: son los valores fijados en este spec. Distancias en px de la resolución interna, velocidades en px/s, aceleraciones en px/s² y tiempos en s.

| Constante                               | Valor                                                                         |
| --------------------------------------- | ----------------------------------------------------------------------------- |
| `WIDTH` / `HEIGHT`                      | `800` / `600`                                                                 |
| `LANE_W`                                | `50` (cada calle tiene dos carriles, una por sentido: 100 px de ancho)        |
| `BOX_LEFT` / `BOX_RIGHT`                | `350` / `450`                                                                 |
| `BOX_TOP` / `BOX_BOTTOM`                | `250` / `350` (el cruce es un cuadrado de 100×100 en el centro)               |
| `STOP_GAP`                              | `8` (distancia entre el frente del auto detenido y el borde del cruce)        |
| `CAR_LEN` / `CAR_WID`                   | `38` / `26`                                                                   |
| `BUS_LEN` / `BUS_WID`                   | `76` / `30`                                                                   |
| `CAR_SPEED` / `BUS_SPEED`               | `160` / `110`                                                                 |
| `CAR_ACCEL` / `BUS_ACCEL`               | `320` / `160`                                                                 |
| `BRAKE`                                 | `480` (frenado máximo de cualquier vehículo)                                  |
| `FOLLOW_GAP`                            | `10` (separación entre vehículos detenidos)                                   |
| `SPAWN_CLEARANCE`                       | `10` (hueco mínimo que debe haber delante del borde para que entre otro auto) |
| `STOPPED_SPEED`                         | `5` (por debajo de esta velocidad un vehículo cuenta como detenido)           |
| `YELLOW_TIME`                           | `0.6` s                                                                       |
| `CLEAR_MIN`                             | `0.3` s (todo en rojo, como mínimo, antes del verde del otro eje)             |
| `INITIAL_LIVES`                         | `3`                                                                           |
| `CARS_PER_LEVEL`                        | `15` (nivel = `1 + floor(autos cruzados / 15)`)                               |
| `SPAWN_INTERVAL_START`                  | `4.5` s medios entre apariciones de cada acceso en el nivel 1                 |
| `SPAWN_INTERVAL_STEP`                   | `0.25` s menos por nivel                                                      |
| `SPAWN_INTERVAL_MIN`                    | `1.0` s (se alcanza en el nivel 15)                                           |
| `SPAWN_JITTER_MIN` / `SPAWN_JITTER_MAX` | `0.6` / `1.4` (el intervalo real es el medio × un azar uniforme de ese rango) |
| `FIRST_SPAWN_MIN` / `FIRST_SPAWN_MAX`   | `0.5` / `2.5` s (primera aparición de cada acceso)                            |
| `BUS_MIN_LEVEL` / `BUS_CHANCE`          | `3` / `0.15`                                                                  |
| `CAR_POINTS` / `BUS_POINTS`             | `10` / `30`                                                                   |
| `FAST_BONUS` / `FAST_WAIT`              | `5` / `2.0` s (bono si el vehículo estuvo detenido menos de 2 s)              |
| `JAM_LIMIT`                             | `2.5` s de desborde para que cuente como atasco                               |
| `JAM_PAUSE`                             | `3.0` s sin apariciones en la calle donde hubo un atasco                      |
| `STOP_LINE_THICK` / `STOP_LINE_WID`     | `4` / `44` (grosor y ancho de la línea de alto)                               |
| `SCORE_MAX`                             | `9_999_999`                                                                   |
| `MAX_DT`                                | `0.05` s                                                                      |

Derivadas:

| Derivada                          | Fórmula                                                                                                                      | Valor                                           |
| --------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------- |
| Intervalo medio de aparición      | `max(SPAWN_INTERVAL_MIN, SPAWN_INTERVAL_START − SPAWN_INTERVAL_STEP × (nivel − 1))`                                          | 4,5 s en el nivel 1, 1,0 s desde el 15          |
| Distancia de frenado              | `velocidad² / (2 × BRAKE)`                                                                                                   | 26,7 px a 160 px/s; 12,6 px a 110 px/s          |
| Posición de alto (`stopPos`)      | `BOX_LEFT − STOP_GAP` en calles horizontales; `BOX_TOP − STOP_GAP` en verticales                                             | `342` / `242`                                   |
| Posición de salida (`exitPos`)    | borde lejano del cruce medido desde el borde de entrada                                                                      | `450` / `350`                                   |
| Desplazamiento máximo por frame   | `CAR_SPEED × MAX_DT`                                                                                                         | 8 px (menos que el largo de un auto) |
| Capacidad de la cola (solo autos) | autos que caben enteros en pantalla: `n` máximo con `stopPos − CAR_LEN − (n − 1) × (CAR_LEN + FOLLOW_GAP) ≥ SPAWN_CLEARANCE` | 7 horizontales y 5 verticales                   |

Las calles verticales tienen menos cola porque el canvas es 4:3: el brazo vertical mide 250 px y el horizontal, 350 px. Es intencional: el eje vertical es el que se llena primero.

Colores del canvas (espejo de los tokens de `app/globals.css`, porque el canvas no puede leer clases de Tailwind):

```ts
export const COLORS = {
  background: "#05050a", // --deep
  road: "#0d0d15", // --surface
  box: "#11111a", // --surface-2
  curb: "#2a2a38", // --border
  divider: "#3a3a4c", // --border-strong
  headlight: "#e6f7ff", // --foreground
  green: "#00ff88", // --neon-green
  yellow: "#f5ff00", // --neon-yellow
  red: "#ff006e", // --neon-pink
} as const;

// Autos: un color al azar por auto; el autobús va siempre en plata
export const CAR_COLORS = [
  "#00f5ff", // --neon-cyan
  "#b026ff", // --neon-purple
  "#ff8c42", // --bronze
] as const;
export const BUS_COLOR = "#d6e2ee"; // --silver
```

Todos los tokens existen ya en `app/globals.css` (`--neon-purple` lo agregó el SPEC 07), así que no hay que tocar el CSS.

### Carriles — `lib/arcade/cruce/lanes.ts`

```ts
export type Axis = "h" | "v"; // h: calle horizontal, v: calle vertical
export type Light = "green" | "yellow" | "red";
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
  stopPos: number; // frente del auto detenido: 342 (horizontal) o 242 (vertical)
  exitPos: number; // el vehículo cruzó cuando pos − len >= exitPos: 450 o 350
}

export const LANES: LaneDef[]; // índice 0 a 3, en el orden de la tabla
export function laneRect(
  lane: LaneDef,
  pos: number,
  len: number,
  wid: number,
): Rect;
```

Los vehículos circulan por la derecha. `pos` es la distancia del **frente** del vehículo al borde por el que entra a la pantalla, así que el mismo número sirve para los cuatro sentidos:

| Índice | `heading` | `axis` | `center` | Entra por | `length` | `stopPos` | `exitPos` |
| ------ | --------- | ------ | -------- | --------- | -------- | --------- | --------- |
| 0      | `east`    | `h`    | `325`    | izquierda | `800`    | `342`     | `450`     |
| 1      | `west`    | `h`    | `275`    | derecha   | `800`    | `342`     | `450`     |
| 2      | `south`   | `v`    | `375`    | arriba    | `600`    | `242`     | `350`     |
| 3      | `north`   | `v`    | `425`    | abajo     | `600`    | `242`     | `350`     |

`laneRect` devuelve el rectángulo del vehículo en coordenadas del canvas:

| `heading` | `x`                | `y`                | `w`   | `h`   |
| --------- | ------------------ | ------------------ | ----- | ----- |
| `east`    | `pos − len`        | `center − wid / 2` | `len` | `wid` |
| `west`    | `WIDTH − pos`      | `center − wid / 2` | `len` | `wid` |
| `south`   | `center − wid / 2` | `pos − len`        | `wid` | `len` |
| `north`   | `center − wid / 2` | `HEIGHT − pos`     | `wid` | `len` |

### Autos — `lib/arcade/cruce/cars.ts`

```ts
export type CarKind = "car" | "bus";

export interface Car {
  kind: CarKind;
  color: string; // de CAR_COLORS o BUS_COLOR
  len: number;
  wid: number;
  maxSpeed: number;
  accel: number;
  pos: number; // frente del vehículo, medido desde el borde de entrada; empieza en 0 (todo el cuerpo fuera de pantalla)
  speed: number; // empieza en maxSpeed
  stoppedTime: number; // s acumulados con speed < STOPPED_SPEED
  stopping: boolean; // decidió detenerse en la línea de alto
  committed: boolean; // no alcanzaba a frenar cuando la luz dejó de estar en verde: cruza igual
  scored: boolean; // ya se le dieron sus puntos
}

export function createCar(kind: CarKind, colorIndex: number): Car;
export function advanceCar(
  car: Car,
  leader: Car | undefined, // el vehículo de adelante en el mismo acceso
  lane: LaneDef,
  light: Light,
  dt: number,
): void;
```

### Semáforo — `lib/arcade/cruce/signal.ts`

```ts
export type SignalMode = "green" | "yellow" | "clearing";

export interface Signal {
  mode: SignalMode;
  axis: Axis; // el eje que tiene el verde (o que lo acaba de tener, en "yellow" y "clearing")
  timer: number; // s desde que empezó el modo actual
}

export function lightOf(signal: Signal, axis: Axis): Light;
// Solo actúa en "green" y si axis es el otro eje: pasa a "yellow" con timer = 0
export function requestAxis(signal: Signal, axis: Axis): void;
// axisClear: true si el cruce está libre de vehículos del eje que tiene (o tenía) el verde
export function updateSignal(
  signal: Signal,
  dt: number,
  axisClear: boolean,
): void;
// true si ningún vehículo del carril está cruzando ni va a cruzar sin poder frenar
export function isLaneClear(cars: Car[], lane: LaneDef): boolean;
```

### Estado interno de la partida — `lib/arcade/cruce/game.ts`

```ts
type Phase = "playing" | "gameover";

interface Approach {
  cars: Car[]; // cars[0] es el más adelantado (mayor pos); las apariciones se agregan al final
  spawnTimer: number; // s hasta el próximo auto
  pending: boolean; // el próximo auto ya tocaba, pero no hay lugar para que entre
  jamTimer: number; // s acumulados en desborde, de 0 a JAM_LIMIT
  pauseTimer: number; // s restantes sin apariciones tras un atasco
}

// Estado encapsulado en el cierre de createCruceEngine (no se exporta)
interface CruceState {
  phase: Phase;
  signal: Signal;
  approaches: Approach[]; // 4, en el mismo orden que LANES
  crossed: number; // autos que ya cruzaron (se conserva toda la partida)
  score: number;
  lives: number;
  level: number;
}
```

### Reglas del juego

**Inicio**

- `start()` arma el estado y emite `onScore(0)`, `onLives(3)` y `onLevel(1)`. Conecta el teclado y arranca el loop con `lastTime = null`.
- Estado inicial: `signal = { mode: "green", axis: "h", timer: 0 }`, sin vehículos, `crossed = 0`, `score = 0`, `lives = 3`, `level = 1`. Cada acceso arranca con `spawnTimer = rand(FIRST_SPAWN_MIN, FIRST_SPAWN_MAX)`, `pending = false`, `jamTimer = 0` y `pauseTimer = 0`.
- No hay cuenta regresiva: la partida corre desde que `StartScreen` llama a `start()`.

**Entrada**

- `createKeyboard()` de `lib/arcade/shared/keyboard.ts`, sin cambios. Cada frame, en `update`, se llama `consume` sobre las ocho teclas (sin cortocircuitar, para vaciar todas): `ArrowLeft`, `ArrowRight`, `KeyA` y `KeyD` piden el eje `"h"`; `ArrowUp`, `ArrowDown`, `KeyW` y `KeyS` piden el eje `"v"`. Se procesa primero el horizontal y luego el vertical.
- `requestAxis(signal, axis)` solo actúa si `signal.mode === "green"` y `axis !== signal.axis`. En cualquier otro caso (el eje pedido ya tiene el verde, o el semáforo está en `"yellow"` o `"clearing"`) la pulsación se descarta: no se guarda ni se cancela un cambio en curso.
- Las flechas ya están bloqueadas por `createKeyboard`, así que no hacen scroll. Espacio no tiene acción en el juego: solo inicia la partida desde `StartScreen`.

**Semáforo**

- `lightOf(signal, axis)`: en `"green"`, el eje de `signal.axis` está en verde y el otro en rojo; en `"yellow"`, el eje de `signal.axis` está en amarillo y el otro en rojo; en `"clearing"`, los dos están en rojo.
- `updateSignal(signal, dt, axisClear)` suma `dt` a `timer` y cambia de modo así:
  1. `"yellow"` → `"clearing"` cuando `timer >= YELLOW_TIME` (0,6 s), con `timer = 0`.
  2. `"clearing"` → `"green"` cuando `timer >= CLEAR_MIN` (0,3 s) **y** `axisClear` es `true`. En ese momento `axis` pasa al otro eje y `timer = 0`.
- `axisClear` lo calcula `game.ts` con `isLaneClear` sobre los dos carriles de `signal.axis`. Un carril está libre cuando **ningún** vehículo suyo cumple alguna de estas dos condiciones: (a) está cruzando o entre la línea de alto y el cruce (`pos > lane.stopPos` y `pos − len < lane.exitPos`); (b) está comprometido y todavía antes de la línea (`committed` y `pos <= lane.stopPos`).
- Con esto **nunca hay choques**: el otro eje no recibe el verde mientras queda un vehículo del primero dentro del cruce o a punto de entrar. Entre que se pulsa la tecla y el otro eje se pone en verde pasan al menos `YELLOW_TIME + CLEAR_MIN` = 0,9 s, y más si hay vehículos cruzando. El despeje no se queda trabado: todo vehículo comprometido o cruzando avanza sin obstáculos hasta salir (delante del cruce solo hay calle libre), y el peor caso, un autobús que arrancó de la línea justo cuando cambió la luz, tarda unos 2 s y siempre menos de 3 s.

**Autos: decisión de detenerse y velocidad — `advanceCar`**

Cada frame, para cada vehículo de cada acceso (de adelante hacia atrás, con el de adelante como `leader`):

```ts
// 1) ¿Hay que detenerse en la línea? Solo importa antes de la línea
if (car.pos <= lane.stopPos) {
  const required = light !== "green";
  if (!required) {
    car.stopping = false;
  } else if (!car.stopping && !car.committed) {
    // Primer cuadro en que se exige detenerse: ¿alcanza a frenar?
    const brakingDistance = (car.speed * car.speed) / (2 * BRAKE);
    if (lane.stopPos - car.pos >= brakingDistance) car.stopping = true;
    else car.committed = true; // ya no puede frenar: cruza con rojo
  }
} else {
  car.stopping = false;
}

// 2) Velocidad objetivo
let limit = car.maxSpeed;
if (leader) {
  const gap = leader.pos - leader.len - car.pos - FOLLOW_GAP; // espacio libre hasta el de adelante
  limit = Math.min(
    limit,
    Math.sqrt(leader.speed ** 2 + 2 * BRAKE * Math.max(0, gap)),
  );
}
if (car.stopping) {
  limit = Math.min(
    limit,
    Math.sqrt(2 * BRAKE * Math.max(0, lane.stopPos - car.pos)),
  );
}

// 3) Acelerar o frenar hacia la velocidad objetivo
if (car.speed < limit) car.speed = Math.min(limit, car.speed + car.accel * dt);
else car.speed = Math.max(limit, car.speed - BRAKE * dt);

// 4) Mover y acotar, para que con saltos de dt nada se atraviese
car.pos += car.speed * dt;
if (car.stopping && car.pos > lane.stopPos) {
  car.pos = lane.stopPos;
  car.speed = 0;
}
if (leader) {
  const maxPos = leader.pos - leader.len - FOLLOW_GAP;
  if (car.pos > maxPos) {
    car.pos = maxPos;
    car.speed = Math.min(car.speed, leader.speed);
  }
}
if (car.speed < STOPPED_SPEED) car.stoppedTime += dt;
```

- Un vehículo comprometido (`committed`) ignora el semáforo hasta salir del cruce. Es la «zona de dilema» de cualquier semáforo: quien está más cerca de la línea que su distancia de frenado (26,7 px un auto a 160 px/s, 12,6 px un autobús a 110 px/s) cruza aunque la luz haya cambiado.
- Un vehículo que espera en la línea arranca en cuanto su eje recibe el verde (`required = false` ⇒ `stopping = false`) y sigue al de adelante con el hueco de `FOLLOW_GAP`.
- Un auto detenido contra el borde de entrada, con parte del cuerpo aún fuera de la pantalla, es lo que alimenta el atasco (ver abajo).

**Apariciones y atascos (por acceso, cada frame)**

1. Si `pauseTimer > 0`: `pauseTimer −= dt`, `jamTimer = 0` y no se hace nada más con ese acceso.
2. `spawnTimer −= dt`. Si `spawnTimer <= 0`, `pending = true`.
3. Si `pending`: hay lugar cuando el acceso no tiene vehículos o el último tiene `pos − len >= SPAWN_CLEARANCE`. Si hay lugar, entra un vehículo nuevo con `pos = 0` y `speed = maxSpeed` (queda detrás de los demás en `cars`), `pending = false` y `spawnTimer = intervalo medio(nivel) × rand(SPAWN_JITTER_MIN, SPAWN_JITTER_MAX)`. El tipo sale así: si `level >= BUS_MIN_LEVEL` y `Math.random() < BUS_CHANCE`, es un autobús (`BUS_LEN`, `BUS_WID`, `BUS_SPEED`, `BUS_ACCEL`, `BUS_COLOR`); si no, es un auto (`CAR_LEN`, `CAR_WID`, `CAR_SPEED`, `CAR_ACCEL` y `CAR_COLORS[randInt(0, 2)]`). Si no hay lugar, el vehículo espera fuera de pantalla y se vuelve a intentar el siguiente frame.
4. **Desborde:** hay desborde cuando `pending` es `true` o el último vehículo del acceso está detenido (`speed < STOPPED_SPEED`) con parte del cuerpo fuera de pantalla (`pos − len < 0`). Con desborde, `jamTimer += dt`; sin desborde, `jamTimer = max(0, jamTimer − dt)`.
5. **Atasco:** cuando `jamTimer >= JAM_LIMIT` (2,5 s): `lives −= 1` y se emite `onLives(lives)`. Se retiran del acceso todos los vehículos que estén antes de la línea y no comprometidos (`pos <= lane.stopPos` y `!committed`), los que cruzan siguen. Luego `pending = false`, `jamTimer = 0`, `pauseTimer = JAM_PAUSE` (3 s) y `spawnTimer = intervalo medio(nivel) × rand(SPAWN_JITTER_MIN, SPAWN_JITTER_MAX)`. Con `lives <= 0` se fija `lives = 0` y termina la partida.

Con solo autos, la cola de un acceso horizontal acepta 7 autos enteros en pantalla y el octavo, que queda detenido con parte del cuerpo fuera, inicia el contador de atasco; en uno vertical caben 5 y el sexto lo inicia.

**Cruce y puntos**

- Un vehículo **cruzó** cuando `!scored` y `pos − len >= lane.exitPos` (su cola salió del cruce). En ese frame: `scored = true`, `points = (base + bono) × level`, donde `base` es `CAR_POINTS` (10) o `BUS_POINTS` (30), `bono` es `FAST_BONUS` (5) si `stoppedTime < FAST_WAIT` (2,0 s) y `0` si no, y `level` es el nivel **anterior** a contarlo. Luego `score = min(SCORE_MAX, score + points)`, se emite `onScore(score)` y `crossed += 1`.
- Después de sumar, `level = 1 + floor(crossed / CARS_PER_LEVEL)`. Si cambió, se emite `onLevel(level)`.
- Un vehículo se retira cuando `pos − len >= lane.length` (salió entero de la pantalla).

Ejemplos: en el nivel 1, un auto que cruza sin esperar suma 15 y uno que esperó 2 s o más suma 10; un autobús suma 35 o 30. En el nivel 2, esos valores se duplican.

**Niveles y dificultad**

- Nivel = `1 + floor(autos cruzados / 15)`. No tiene tope.
- El intervalo medio de aparición de cada acceso baja 0,25 s por nivel, de 4,5 s en el nivel 1 a 1,0 s en el 15 (más o menos 1 auto por segundo y por acceso, 4 autos por segundo en total). El intervalo real de cada aparición es ese medio por un azar de 0,6 a 1,4.
- A partir del nivel 3, el 15 % de las apariciones son autobuses: largos (76 px), lentos (110 px/s) y que tardan más en despejar el cruce, pero valen el triple.
- El tráfico supera la capacidad de las colas (7 + 7 + 5 + 5 = 24 autos) con intervalos de 1,0 a 1,7 s, o sea alrededor de los niveles 12 a 15. La partida termina por atascos antes de llegar a ahí, en la gran mayoría de los casos.

**Fin de partida**

- `lives` llega a 0 con un atasco: `phase = "gameover"`, se desconecta el teclado y se llama `onGameOver(score)` **una sola vez**, con el mismo valor que mostraba el HUD.
- No hay victoria: la partida sigue hasta que el jugador pierde la tercera vida.
- Tras el fin de partida, `update` no hace nada: los vehículos quedan congelados detrás del modal.

**Puntaje máximo práctico**

- Puntos por vehículo: como máximo `(30 + 5) × nivel` (un autobús rápido) y `(10 + 5) × nivel` un auto. Con el nivel `1 + floor(n / 15)` tras `n` cruces, una partida de `n` vehículos rápidos suma alrededor de `15 × n + n² / 2`. Una partida fuerte, de 150 a 200 autos antes de los atascos finales, queda entre 10.000 y 20.000 puntos.
- Llegar a 9.999.999 exigiría más de 2.900 vehículos (con el máximo teórico de 35 puntos por vehículo: `35 × n + 35 × n² / 30 ≥ 10⁷`), o sea más de 7 minutos de flujo perfecto en niveles 15 y superiores, donde entran 4 autos por segundo y la capacidad real del cruce (menos de 5 por segundo con sus tiempos muertos de amarillo y despeje) deja las colas sin lugar en segundos. `SCORE_MAX` se conserva por el `CHECK` de `scores`.

### Dibujo — `lib/arcade/cruce/render.ts`

Encuadre en la resolución interna de 800×600, sin paneles:

| Elemento            | Posición y tamaño                                                                                                                               |
| ------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| Fondo               | Todo el canvas, `COLORS.background`                                                                                                             |
| Calle horizontal    | `(0, 250, 800, 100)`, `COLORS.road`                                                                                                             |
| Calle vertical      | `(350, 0, 100, 600)`, `COLORS.road`                                                                                                             |
| Cruce               | `(350, 250, 100, 100)`, `COLORS.box`                                                                                                            |
| Bordes de calle     | Líneas de 2 px en `COLORS.curb` en `y = 250` y `y = 350` (x de 0 a 350 y de 450 a 800) y en `x = 350` y `x = 450` (y de 0 a 250 y de 350 a 600) |
| Divisores de carril | Línea discontinua de 2 px (segmentos de 14 px y huecos de 14 px) en `COLORS.divider`, en `y = 300` y `x = 400`, sin entrar al cruce             |

Orden en cualquier fase: fondo, calles y cruce, bordes, divisores, líneas de alto, vehículos y barras de atasco.

- **Líneas de alto:** una por carril, un rectángulo de `STOP_LINE_THICK × STOP_LINE_WID` (4×44) centrado en el carril, que ocupa de `stopPos + 2` a `stopPos + 6` (con `laneRect(lane, stopPos + 6, 4, 44)`). El color depende de `lightOf(signal, lane.axis)`: `COLORS.green`, `COLORS.yellow` o `COLORS.red`, con `shadowBlur = 8` y `shadowColor` del mismo color. Solo hay cuatro, así que el glow no pesa.
- **Vehículos:** relleno de su color con `globalAlpha = 0.35`, borde de 2 px con alfa 1, y dos faros de 3×3 px en `COLORS.headlight`, a 2 px del borde delantero y a 3 px de cada costado. Sin glow (puede haber 30 o más vehículos en pantalla). El rectángulo sale de `laneRect(lane, car.pos, car.len, car.wid)`.
- **Barras de atasco:** un rectángulo de 8×44 px pegado al borde de entrada de cada acceso (`laneRect(lane, 8, 8, 44)`) en `COLORS.red`, que solo se dibuja cuando hay desborde en ese acceso, con `globalAlpha = 0.25 + 0.75 × jamTimer / JAM_LIMIT`. Avisa al jugador de que una calle está a punto de fallar, incluso cuando el auto que espera todavía no se ve.
- Cada función deja `globalAlpha = 1` y `shadowBlur = 0` al terminar.
- Con `"gameover"` se sigue dibujando el último estado, sin cambios.
- El canvas no dibuja puntuación, nivel, vidas, PAUSA ni GAME OVER: eso lo muestran `PlayerHud`, `GameOverModal` y el overlay de `CrtScreen`.

### Reglas del loop

- El loop corre con `requestAnimationFrame`; `dt` se calcula en segundos con tope `MAX_DT` (`0.05 s`). `resume()` pone `lastTime = null`, así que el primer frame tras la pausa tiene `dt = 0`.
- Sin `setTimeout` ni `setInterval`: `signal.timer`, `spawnTimer`, `jamTimer`, `pauseTimer` y `stoppedTime` avanzan con `dt`, así que la pausa los congela.
- Orden de `update(dt)` en `"playing"`: (1) leer la entrada y pedir el eje; (2) `updateSignal`; (3) apariciones y atascos de los cuatro accesos (si un atasco termina la partida, `update` sale); (4) `advanceCar` de cada vehículo, de adelante hacia atrás, con cruces, puntos y retiro de los que salieron.
- A 160 px/s un vehículo recorre como máximo 8 px por frame: el tope de `dt` y las acotaciones de `advanceCar` (línea de alto y vehículo de adelante) impiden que atraviese la línea o a otro vehículo.
- `pause()` cancela el frame y desconecta el teclado (vacía las teclas sostenidas). `resume()` lo reconecta, salvo que la partida haya terminado. `destroy()` cancela el loop, quita todos los listeners y es idempotente (React Strict Mode monta y desmonta dos veces en desarrollo).
- Al terminar la partida, `onGameOver` se llama una sola vez, se desconecta el teclado y el loop sigue redibujando hasta `destroy()`.

## Plan de implementación

1. **Catálogo.** Aplicar `add_cruce_game`. Verificación: `select id, title, category, accent, sort_order, short_description, long_description from public.games order by sort_order` muestra la fila `cruce` con `sort_order` 9 y las otras 8 sin cambios, y `get_advisors` (security) no reporta alertas nuevas. `/games` muestra CRUCE al final, el chip «Puzles» lo filtra y `/games/cruce/play` muestra SIMULAR PARTIDA.
2. **Constantes y carriles.** Crear `lib/arcade/cruce/constants.ts` y `lanes.ts`. Verificación: `npx tsc --noEmit` pasa, `LANES` tiene 4 entradas y `laneRect` de un auto en `stopPos` del carril `east` da `x = 304` y del carril `west` da `x = 458`.
3. **Autos y semáforo.** Crear `lib/arcade/cruce/cars.ts` y `signal.ts`. Verificación: `npx tsc --noEmit` y `npm run lint` pasan.
4. **Dibujo.** Crear `lib/arcade/cruce/render.ts`. Verificación: `npx tsc --noEmit` pasa.
5. **Motor.** Crear `lib/arcade/cruce/game.ts` con `createCruceEngine` (estado, entrada, apariciones, atascos, puntos, `update`, `draw`, loop y `start`/`pause`/`resume`/`destroy`) e `index.ts` con `cruceDefinition`. Todavía no se registra. Verificación: `npx tsc --noEmit` y `npm run lint` pasan.
6. **Registrar y conectar.** Agregar `cruce: cruceDefinition` a `DEFINITIONS` en `lib/arcade/registry.ts`. Verificación: en `/games/cruce/play` se juega una partida hasta perder las tres vidas y abrir el modal, y GUARDAR PUNTUACIÓN crea una fila en `scores` con `game_id = 'cruce'` que aparece en `/games/cruce`.
7. **Documentación.** Actualizar `references/implemented-games.md`: fila 5 en la tabla (`cruce`, CRUCE, Puzles, `pink`, `/games/cruce/play`, `lib/arcade/cruce/`, el spec con el que se promueva), el resumen («5 juegos jugables de los 9 que hay en el catálogo»), la fecha de consulta de la tabla `games` y una sección CRUCE con sus descripciones y la nota «diseñado desde cero (game jam, tema «cruzar»)». `CLAUDE.md` no cambia: no hay cambios de contrato, de estructura ni de esquema. Verificación: `npm run format:check` pasa y `git diff main -- references/` solo muestra `references/implemented-games.md`.

## Criterios de aceptación

**Generales**

- [ ] `npm run build`, `npm run lint` y `npx tsc --noEmit` terminan sin errores.
- [ ] Existen los siete archivos de `lib/arcade/cruce/` (`constants.ts`, `lanes.ts`, `cars.ts`, `signal.ts`, `render.ts`, `game.ts` e `index.ts`).
- [ ] Ningún archivo de `lib/arcade/` importa `react` ni declara `"use client"`, y ninguno toca `window` ni `document` a nivel de módulo.
- [ ] `git diff main -- references/` solo muestra cambios en `references/implemented-games.md`.
- [ ] `lib/arcade/engine.ts`, `lib/arcade/shared/`, `components/game/` y `CLAUDE.md` no cambian.
- [ ] Al jugar una partida completa en `/games/cruce/play`, la consola del navegador no muestra errores ni advertencias de hidratación, ni advertencias de claves duplicadas en `StartScreen`.

**Catálogo**

- [ ] `games` tiene la fila `cruce` con título `CRUCE`, categoría `Puzles`, acento `pink`, los textos del spec y `sort_order` 9, y las otras 8 filas no cambiaron.
- [ ] `/games` muestra CRUCE al final de la grilla, el chip «Puzles» lo muestra junto a TETRIS y `/games/cruce` muestra su descripción.

**Flujo del Reproductor**

- [ ] `/games/cruce/play` muestra el `PixelLoader` y luego `StartScreen` con «CRUCE», las tres filas de controles (`← → / A D` VERDE HORIZONTAL, `↑ ↓ / W S` VERDE VERTICAL y `P` PAUSA), «PRESIONA ESPACIO» e INICIAR.
- [ ] Presionar Espacio en `StartScreen` (o hacer clic en INICIAR) inicia la partida sin que Espacio haga nada en el juego: el cruce aparece con las líneas de alto de las calles horizontales en verde y las de las verticales en rojo, y el primer vehículo entra entre 0,5 s y 2,5 s después.
- [ ] Con la partida iniciada, el HUD muestra `PUNTUACIÓN 0`, `VIDAS ■■■` y `NIVEL 01`.
- [ ] Con una ventana más baja que la página, las flechas y Espacio no hacen scroll durante la partida.
- [ ] Emulando un dispositivo táctil (`pointer: coarse`), `StartScreen` muestra «ESTE JUEGO NECESITA TECLADO» y no muestra INICIAR.

**Jugabilidad**

- [ ] Las cuatro calles entran por sus bordes y los autos circulan por la derecha: los que van al este, por la mitad inferior de la calle horizontal; los del oeste, por la superior; los del sur, por la mitad izquierda de la calle vertical; los del norte, por la derecha.
- [ ] Un auto libre avanza a unos 160 px/s: cruza el ancho del canvas (800 px más su largo) en 5,2 s, con tolerancia de 0,3 s.
- [ ] `← →` o `A D` dan el verde al eje horizontal y `↑ ↓` o `W S` al vertical. Pedir el eje que ya tiene el verde no hace nada.
- [ ] Al pedir el otro eje, las líneas del eje actual pasan a amarillo durante 0,6 s y después a rojo; las del otro eje siguen en rojo. Entre la pulsación y el verde del otro eje pasan al menos 0,9 s.
- [ ] Pulsar una tecla de eje durante el amarillo o el rojo de despeje no cambia ni cancela el ciclo.
- [ ] Un auto que a la hora del amarillo está a menos de 20 px de su línea de alto cruza aunque la luz haya cambiado; uno que está a más de 35 px frena y se detiene con el frente en la línea (`stopPos`), sin pasarse. El otro eje no recibe el verde hasta que el auto que cruzó sale del cruce, así que nunca hay dos vehículos de ejes distintos dentro del cruce.
- [ ] Los autos detenidos hacen cola separados por unos 10 px, y al darse el verde arrancan uno tras otro, sin traslaparse nunca.
- [ ] Con solo autos (niveles 1 y 2) y un eje en rojo, la cola de una calle horizontal acepta 7 autos enteros en pantalla y el octavo, detenido con parte del cuerpo fuera, inicia el contador de atasco; en una calle vertical caben 5 y el sexto lo inicia.
- [ ] Mientras hay desborde en un acceso, aparece en su borde una barra rosa cada vez más opaca. Si el desborde dura 2,5 s, el HUD pasa a `VIDAS ■■□`, se retiran los autos detenidos de esa calle (los que cruzan siguen) y no aparecen autos nuevos en ella durante 3 s. Si el jugador libera la cola antes de los 2,5 s, el contador baja y no se pierde la vida.
- [ ] Un auto que cruza sin haber esperado suma 15 puntos en el nivel 1; uno que esperó 2 s o más suma 10. Tras el auto 15, el HUD pasa a `NIVEL 02` y los puntos se duplican (30 y 20).
- [ ] Un autobús aparece solo a partir del nivel 3: en los 30 vehículos siguientes a llegar al nivel 3 aparece al menos uno (la probabilidad de que no salga es 0,85³⁰, menos del 1 %, así que la regla se verifica con esa partida); es de plata, mide 76 px, avanza a unos 110 px/s y en el nivel 3 suma 105 (sin esperar) o 90 (esperando).
- [ ] El intervalo entre apariciones baja con el nivel: el código usa `max(1.0, 4.5 − 0.25 × (nivel − 1))` como intervalo medio por acceso (4,5 s en el nivel 1, 3,5 s en el 5 y 1,0 s desde el 15) y, en el nivel 1, los primeros 15 autos tardan entre 15 y 35 s en cruzar (cuatro accesos con un auto cada 4,5 s en promedio, más el tiempo de espera y de recorrido).
- [ ] El canvas no dibuja puntuación, nivel, vidas, PAUSA ni GAME OVER.
- [ ] Estilo: fondo `#05050a`, calles `#0d0d15`, cruce `#11111a`, autos cian, violeta o bronce con relleno translúcido y borde neón, autobuses plata, y líneas de alto verde `#00ff88`, amarillo `#f5ff00` o rosa `#ff006e`; el overlay CRT se ve encima.

**Pausa**

- [ ] P y el botón PAUSA congelan el juego y muestran el overlay PAUSA; P y SEGUIR lo reanudan sin saltos (ningún auto da un salto de posición).
- [ ] Mantener una tecla de eje durante la pausa y soltarla no deja una petición «pegada» al reanudar.
- [ ] Cambiar de pestaña o hacer clic fuera de la ventana durante la partida la deja en PAUSA.
- [ ] Los temporizadores del juego (amarillo, despeje, apariciones, contador de atasco y pausa de atasco) no avanzan durante la pausa.

**Fin de partida y ranking**

- [ ] Perder la tercera vida por un atasco abre `GameOverModal` con la misma puntuación que mostraba el HUD, el HUD muestra `VIDAS □□□` y detrás quedan los vehículos congelados.
- [ ] `onGameOver` se llama una sola vez por partida (el modal no se reabre ni se guarda dos veces).
- [ ] GUARDAR PUNTUACIÓN crea exactamente una fila en `scores` con `game_id = 'cruce'`, y aparece en `/games/cruce` y en la pestaña CRUCE del Salón de la Fama si entra en el top 10.
- [ ] La tarjeta de CRUCE en `/games` muestra esa puntuación como MEJOR PUNTUACIÓN si es la primera.
- [ ] JUGAR DE NUEVO vuelve al `PixelLoader` y a `StartScreen`, y la nueva partida arranca desde cero (calle horizontal en verde, sin autos, `PUNTUACIÓN 0`, `VIDAS ■■■`, `NIVEL 01`).
- [ ] SALIR durante la partida lleva a `/games/cruce`, y volver a jugar no deja dos loops corriendo (los autos no avanzan al doble de velocidad).

**Sin regresiones**

- [ ] ASTEROIDS, TETRIS, ARKANOID y SNAKE se juegan igual que antes del spec (HUD, pausa, fin de partida y guardado).
- [ ] Los juegos sin motor (PAC-MAN, SPACE INVADERS, FROGGER y GALAGA) siguen mostrando SIMULAR PARTIDA.
- [ ] `/`, `/games`, `/hall-of-fame` y `/about` se ven igual que antes del spec, salvo CRUCE donde corresponda (la Biblioteca y el Salón de la Fama lo listan; el Home no cambia).

## Decisiones

- **Sí:** interpretar «cruzar» como **hacer cruzar**: el jugador maneja el semáforo de un cruce y los autos son quienes cruzan. **No:** que el jugador cruce saltando entre carriles y troncos. Esa es la mecánica de FROGGER, que sigue pendiente en el catálogo. Lo decidió el agente (game jam).
- **Sí:** motor en TypeScript dentro del bundle, con el contrato del SPEC 05, sin iframe. HUD y fin de partida de la plataforma; el canvas solo dibuja la escena. Lo decidió el agente (game jam).
- **Sí:** un único cruce de dos calles de dos carriles, con cuatro accesos y vehículos que solo van derecho. **No:** una red de 2×2 cruces con cambio de luz instantáneo y choques. Es la variante B. Lo decidió el agente (game jam).
- **No:** giros a izquierda y derecha, peatones y ambulancias. Multiplican los conflictos y las reglas, y el MVP debe caber en dos frases. Lo decidió el agente (game jam).
- **Sí:** semáforo de dos ejes con amarillo de 0,6 s y despeje automático (el otro eje no recibe el verde hasta que el cruce está vacío). No hay choques. **No:** cambio instantáneo con choques posibles, como en la variante B. Aquí la habilidad es decidir cuándo cambiar, no apurar un margen de milisegundos. Lo decidió el agente (game jam).
- **Sí:** 3 vidas, que se pierden por atasco (la cola de un acceso desbordada durante 2,5 s), y al perder una se retiran los autos detenidos de esa calle. **No:** partida contra reloj sin vidas, como la variante B, ni perder una vida al primer desborde (sería injusto con el auto que todavía no se ve). Lo decidió el agente (game jam).
- **Sí:** dificultad continua: nivel cada 15 autos cruzados y menos intervalo entre apariciones, sin techo de niveles. **No:** oleadas de tiempo fijo, como la variante B, ni niveles con patrones distintos. Lo decidió el agente (game jam).
- **Sí:** el eje se pide directamente con `← →` / `A D` (horizontal) y `↑ ↓` / `W S` (vertical), sin alternar. **No:** una sola tecla de alternar con Espacio, porque Espacio ya inicia la partida desde `StartScreen` y obligaría a proteger esa pulsación; tampoco una tecla por cruce (`Q W A S`), que es de la variante B. Lo decidió el agente (game jam).
- **Sí:** el vehículo que no alcanza a frenar (está más cerca de la línea que su distancia de frenado) cruza aunque haya cambiado la luz. Es la «zona de dilema» real y es la razón por la que el despeje debe esperar. **No:** frenado instantáneo en la línea, que se vería artificial. Lo decidió el agente (game jam).
- **Sí:** el despeje espera a que el cruce esté libre, sin importar cuánto tarde. **No:** un tiempo fijo de todo-rojo, que con autobuses (1,6 s de cruce) no alcanzaría. Lo decidió el agente (game jam).
- **Sí:** puntos `(base 10 o 30, más 5 si esperó menos de 2 s) × nivel`. **No:** puntos fijos sin multiplicador, que premiarían poco la supervivencia, ni puntos que bajan con cada segundo de espera (es la idea de la variante B). Lo decidió el agente (game jam).
- **Sí:** autobuses a partir del nivel 3 (15 % de las apariciones): más puntos y más riesgo, sin reglas nuevas. **No:** ambulancias con prioridad ni obras, que quedan para otro spec. Lo decidió el agente (game jam).
- **Sí:** el eje vertical tiene 5 lugares de cola y el horizontal 7, por la proporción 4:3 del canvas. **No:** acortar los brazos horizontales para igualarlos, que recortaría el cruce y dejaría calles de pantalla sin usar. Lo decidió el agente (game jam).
- **Sí:** el contador de desborde baja cuando la cola se libera (`−1 s` por segundo). **No:** reiniciarlo a cero de golpe, porque un jugador que alterna sobre el límite no tendría ninguna señal. Lo decidió el agente (game jam).
- **Sí:** la barra rosa en el borde avisa del desborde, incluso con un auto pendiente que todavía no se ve. **No:** texto en el canvas, porque el HUD ya tiene VIDAS. Lo decidió el agente (game jam).
- **Sí:** categoría «Puzles» y acento `pink`. **No:** «Clásicos» (donde está FROGGER y el juego no es un clásico) ni una categoría nueva como «Estrategia», que exigiría una migración `extend_games_category_check` y cambios en `lib/games.ts` por un solo juego. El rosa es el acento menos usado del catálogo. Lo decidió el agente (game jam).
- **Sí:** `id` `cruce` y título `CRUCE`. **No:** un título largo como «CRUCE DE CALLES». Lo decidió el agente (game jam).
- **Sí:** colores neón del tema con `COLORS` espejo de los tokens (sin tokens nuevos), autos con relleno translúcido y borde, y glow solo en las cuatro líneas de alto. **No:** sprites. No hay assets útiles en `references/source-assets/` para un cruce. Lo decidió el agente (game jam).
- **Sí:** sin sonido, sin controles táctiles, sin antitrampas y sin tests, como los SPEC 05 a 09. Lo decidió el agente (game jam).
- **Sí:** el contrato no se amplía ni `keyboard.ts` cambia. El juego tiene vidas y nivel, y las flechas ya están bloqueadas. Lo decidió el agente (game jam).
- **Sí:** `SCORE_MAX` como tope de seguridad (el máximo práctico es de unas decenas de miles). Lo decidió el agente (game jam).
- **Sí:** el loop sigue corriendo tras `"gameover"` hasta `destroy()`, como en los otros motores; `update` no hace nada y redibujar la escena es barato. Lo decidió el agente (game jam).
- **Sí:** se actualiza `references/implemented-games.md` (lo pide `CLAUDE.md` al implementar un juego). **No:** tocar `CLAUDE.md`, porque no cambia el contrato, la estructura ni el esquema. Lo decidió el agente (game jam).

## Riesgos

| Riesgo                                                                                                     | Mitigación                                                                                                                                                                                                                    |
| ---------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| En desarrollo, React Strict Mode monta el efecto dos veces y deja dos loops corriendo.                     | `destroy()` cancela el `requestAnimationFrame` y quita todos los listeners. Hay un criterio de «volver a jugar no deja dos loops».                                                                                            |
| Acceder a `window` o `document` al importar `lib/arcade/cruce/` rompe el prerender.                        | La convención obliga a tocar el DOM solo dentro de `create()`. `npm run build` lo detecta.                                                                                                                                    |
| El salto de `dt` al reanudar mueve los vehículos de golpe.                                                 | `resume()` pone `lastTime = null` y el tope de `dt` es de 50 ms.                                                                                                                                                              |
| Un vehículo atraviesa su línea de alto o a otro vehículo con un `dt` grande.                               | A 160 px/s recorre como máximo 8 px por frame; `advanceCar` acota la posición a `stopPos` y al vehículo de adelante.                                                                                                          |
| La pulsación de Espacio que inicia la partida también actúa en el juego.                                   | Espacio no tiene acción en CRUCE; además `consume()` ignora `event.repeat`. Hay un criterio de aceptación.                                                                                                                    |
| Una puntuación mayor que 9.999.999 hace fallar el guardado por el `CHECK` de `scores`.                     | `SCORE_MAX` en el motor. En la práctica no se alcanza (máximo práctico de 10.000 a 20.000).                                                                                                                                   |
| El despeje se queda trabado y el otro eje nunca recibe el verde.                                           | Solo espera vehículos cruzando o comprometidos, que siempre salen por una calle libre: unos 2 s y siempre menos de 3 s en el peor caso (un autobús). Hay un criterio de «al menos 0,9 s» y basta jugar unos minutos para ver que nunca se traba. |
| El desborde parece injusto porque el auto que lo causa está fuera de pantalla.                             | La barra rosa del borde crece con el contador y hay 2,5 s de margen; el contador baja solo cuando la cola se libera.                                                                                                          |
| La dificultad no se pudo probar jugando: los intervalos y los límites podrían quedar fáciles o duros.      | Todas las cifras están en `constants.ts` (`SPAWN_INTERVAL_*`, `JAM_LIMIT`, `CARS_PER_LEVEL`, `YELLOW_TIME`, `CLEAR_MIN`) y se ajustan sin tocar el contrato ni el resto del código.                                           |
| Los autobuses llenan la cola antes de lo esperado (76 px más 10 de hueco ocupan casi dos lugares de auto). | Es parte del riesgo que los hace valer el triple. La capacidad de 7 y 5 lugares vale solo con autos; el criterio lo dice. Desde el nivel 3 la cola real puede tener un lugar menos.                                           |
| Los colores de los autos se confunden con las líneas de alto (amarillo y rosa).                            | Los autos no usan amarillo, verde ni rosa: cian, violeta, bronce y plata.                                                                                                                                                     |
| Letras `A D W S` no están en `PREVENTED_CODES`.                                                            | No hace falta: las letras no hacen scroll. `createKeyboard` no cambia.                                                                                                                                                        |

## Lo que **no** entra en este spec

- Varios cruces, cambio instantáneo de luz, choques y partida contra reloj (variante B).
- Giros, peatones, ambulancias, motos, obras y accidentes.
- Ciclos automáticos de semáforo u «onda verde».
- Sonido y música.
- Controles táctiles o de mouse.
- Antitrampas o topes de puntuación por juego.
- Cambios en la Biblioteca, el Home o el Salón de la Fama más allá de la fila del catálogo.
- Tests automatizados.
- Cambios en `references/` (salvo `references/implemented-games.md`) o en los specs 01 a 09.

Si alguna de estas llega, va en su propio spec.
