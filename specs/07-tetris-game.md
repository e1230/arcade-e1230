# SPEC 07 — TETRIS jugable en el Reproductor

> **Estado:** Aprobado
> **Depende de:** SPEC 05, SPEC 06
> **Fecha:** 2026-09-28
> **Objetivo:** Portar a TypeScript el TETRIS de `references/started-games/03-tetris/` y hacerlo jugable en `/games/tetris/play`, con su puntuación en el ranking global.

## Por qué existe este spec

TETRIS ya está en el catálogo (`games`, `sort_order` 2), pero su Reproductor muestra el placeholder IFRAME SANDBOX y SIMULAR PARTIDA. `references/started-games/03-tetris/` tiene un Tetris completo en canvas 2D (`game.js`, 305 líneas, sin dependencias, sin imágenes ni sonido). Este spec lo porta a TypeScript con el contrato del SPEC 05 y lo monta en el gabinete CRT. La puntuación final entra en el ranking global del SPEC 06 sin tocar su código.

La referencia tiene ocho piezas, no siete. Además de las estándar trae una «tuerca» (un anillo de 3×3 con el centro hueco) que su README no menciona. El port la conserva, y la descripción del catálogo se corrige para avisarla. La referencia también depende de la autorrepetición del sistema operativo para mover la pieza con la tecla sostenida. Como el teclado del motor ignora `event.repeat`, el port agrega una autorrepetición propia medida con `dt`.

Hay dos cosas que la plataforma todavía no cubre. Tetris no tiene vidas, así que `GameDefinition` gana un campo opcional `hud` que oculta la celda VIDAS; ASTEROIDS no cambia. Y el tablero es 1:2 mientras el CRT es 4:3, así que se dibuja centrado con celdas de 28 px, y LÍNEAS y SIGUIENTE ocupan un panel a la derecha dentro del mismo canvas. Como es el segundo juego con motor, `keyboard.ts` y `math.ts` pasan de `lib/arcade/asteroids/` a `lib/arcade/shared/` sin cambios de comportamiento.

## Alcance

**Incluye:**

- **Catálogo:** `long_description` de `tetris` corregida con la migración `update_tetris_description` (la tuerca y la subida de nivel cada 10 líneas). `short_description` no cambia.
- **Utilidades compartidas:** `keyboard.ts` y `math.ts` pasan de `lib/arcade/asteroids/` a `lib/arcade/shared/` sin cambios de comportamiento, y Asteroids importa desde ahí.
- **Port a TypeScript** en `lib/arcade/tetris/`, con la misma jugabilidad que `game.js`: tablero de 10×20, 8 piezas (las 7 estándar y la tuerca) con azar uniforme, rotación horaria con wall kicks `[0, −1, 1, −2, 2]`, pieza fantasma, soft drop (+1 por fila), hard drop (+2 por fila), líneas `[0, 100, 300, 500, 800] × nivel`, nivel cada 10 líneas y caída de `max(0.1, 1 − (nivel − 1) × 0.09)` s. La pieza se fija en cuanto toca fondo, sin lock delay.
- **Autorrepetición propia:** `←`/`→` y `↓` sostenidas repiten el movimiento con acumuladores de `dt`, en lugar de la repetición del sistema operativo.
- **Estilo neón:** cada pieza lleva un color del tema (I cian, O amarillo, T violeta, S verde, Z rosa, J plata, L bronce, tuerca gris), con relleno translúcido y borde brillante. Solo la pieza activa tiene glow y el fantasma es un contorno. El violeta es un token nuevo, `--neon-purple`, en `app/globals.css`.
- **Encuadre:** canvas de 800×600 con el tablero de 280×560 (celdas de 28 px) centrado y un panel a la derecha con SIGUIENTE y LÍNEAS.
- **HUD de la plataforma:** PUNTUACIÓN y NIVEL salen de los callbacks. La celda VIDAS se oculta. El canvas no dibuja SCORE, LEVEL, PAUSA ni GAME OVER; sí dibuja LÍNEAS y la siguiente pieza.
- **Ampliación del contrato:** campo opcional `hud?: { lives?: boolean }` en `GameDefinition`. `PlayerView` lo pasa a `PlayerHud`, que oculta la celda VIDAS.
- **Fin de partida:** cuando la pieza nueva no cabe, se abre `GameOverModal` con la puntuación. Detrás queda el tablero congelado, con la pieza que no cupo encima y sin fantasma.
- **Registro:** `tetris` se agrega a `DEFINITIONS`, así que `/games/tetris/play` deja de mostrar SIMULAR PARTIDA.
- **Ranking:** la puntuación final se guarda en `scores` con el flujo existente de `GameOverModal`, sin cambios en el código del ranking.
- **Documentación:** actualizar `CLAUDE.md`.

**Fuera de alcance (para futuros specs):**

- El selector de tema claro/oscuro de la referencia y su clave `tetris-theme` en `localStorage`: la plataforma es solo oscura.
- Sonido y música (la referencia no tiene).
- Cambios de jugabilidad respecto de la referencia: lock delay, pieza reservada (hold), rotación antihoraria, generador 7-bag, T-spins, animación al limpiar líneas o tope de nivel.
- LÍNEAS en el HUD de la plataforma (un callback `onStats` o celdas configurables).
- Controles táctiles.
- Validación antitrampas o topes de puntuación por juego.
- Cambios en la Biblioteca, el Home o el Salón de la Fama más allá de lo que da la fila del catálogo.
- Tests automatizados.
- Modificar `references/` o los specs 01 a 06.

## Rutas y archivos

```
app/
  globals.css                     (cambia) + token --neon-purple
lib/
  arcade/shared/keyboard.ts       (se mueve) desde lib/arcade/asteroids/, sin cambios
  arcade/shared/math.ts           (se mueve) desde lib/arcade/asteroids/, sin cambios
  arcade/asteroids/entities.ts    (cambia) imports de shared/
  arcade/asteroids/game.ts        (cambia) imports de shared/
  arcade/engine.ts                (cambia) + GameHud y campo opcional hud en GameDefinition
  arcade/registry.ts              (cambia) + tetris
  arcade/tetris/constants.ts      (nuevo) tablero, encuadre, tiempos, puntos, SCORE_MAX, COLORS y PIECE_COLORS
  arcade/tetris/pieces.ts         (nuevo) PieceType, Shape, PIECES (8 matrices) y createPiece
  arcade/tetris/board.ts          (nuevo) createBoard, collide, rotateCW, merge, clearFullRows, ghostY
  arcade/tetris/render.ts         (nuevo) drawBoard, drawPiece y drawPanel
  arcade/tetris/game.ts           (nuevo) createTetrisEngine: estado, entrada, gravedad, update, draw y loop
  arcade/tetris/index.ts          (nuevo) tetrisDefinition: GameDefinition
components/game/
  PlayerHud.tsx                   (cambia) prop opcional showLives
  PlayerView.tsx                  (cambia) pasa definition.hud.lives a PlayerHud
CLAUDE.md                         (cambia) proyecto, rutas y estructura
```

Sin cambios: `GameCanvas`, `StartScreen`, `GameOverModal`, `CrtScreen`, `PixelLoader`, `app/games/[id]/play/page.tsx`, `lib/games.ts`, `lib/catalog.ts`, `lib/leaderboard.ts`, `lib/leaderboard-client.ts`, `DetailLeaderboard`, `HallOfFameTable` y `lib/supabase/database.types.ts`.

Base de datos (proyecto `xanuntuhanyubcqiudlp`, con `apply_migration` del MCP de Supabase): migración `update_tetris_description`. No cambia el esquema, así que los tipos no se regeneran.

Convenciones:

- Las de `lib/arcade/` del SPEC 05: sin React ni `"use client"`, DOM solo dentro de `create()`, estado en el cierre de `createTetrisEngine` y loop por `dt` sin `setTimeout` ni `setInterval`.
- `board.ts` y `pieces.ts` son funciones puras sobre los datos que reciben: no guardan estado de módulo.
- `keyboard.ts` y `math.ts` se mueven con `git mv` para conservar su historial. No se copian dentro de `lib/arcade/tetris/`.
- Código en inglés, comentarios en español latinoamericano, módulos sin JSX en kebab-case.

## Modelo de datos

### Catálogo — migración `update_tetris_description`

```sql
update public.games
set long_description = 'Gira y coloca las piezas que caen para completar líneas horizontales. Cuidado con la tuerca: una pieza hueca que deja un agujero difícil de limpiar. Cada diez líneas subes de nivel y la caída se acelera. La partida termina cuando las piezas alcanzan el techo.'
where id = 'tetris';
```

Fila resultante (solo cambia `long_description`):

| Campo               | Valor                                                                                                                                                                                                                                                               |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `id`                | `tetris`                                                                                                                                                                                                                                                            |
| `title`             | `TETRIS`                                                                                                                                                                                                                                                            |
| `category`          | `Puzles`                                                                                                                                                                                                                                                            |
| `accent`            | `yellow`                                                                                                                                                                                                                                                            |
| `sort_order`        | `2`                                                                                                                                                                                                                                                                 |
| `short_description` | Encaja las piezas y limpia líneas sin parar.                                                                                                                                                                                                                        |
| `long_description`  | Gira y coloca las piezas que caen para completar líneas horizontales. Cuidado con la tuerca: una pieza hueca que deja un agujero difícil de limpiar. Cada diez líneas subes de nivel y la caída se acelera. La partida termina cuando las piezas alcanzan el techo. |

### Ampliación del contrato — `lib/arcade/engine.ts`

```ts
export interface GameHud {
  lives?: boolean; // por defecto true; false oculta la celda VIDAS del HUD
}

export interface GameDefinition {
  width: number; // resolución interna del canvas
  height: number;
  controls: GameControl[];
  hud?: GameHud; // opcional: sin él, el HUD muestra todas las celdas
  create(canvas: HTMLCanvasElement, callbacks: GameCallbacks): GameEngine;
}
```

- `PlayerHud` recibe `showLives?: boolean` (por defecto `true`). Con `false` no renderiza la celda VIDAS, y la grilla `auto-fit` reparte PUNTUACIÓN, NIVEL y JUGADOR.
- `PlayerView` pasa `showLives={definition?.hud?.lives ?? true}`. La celda se oculta desde el `PixelLoader`, porque la definición se conoce desde el montaje.
- ASTEROIDS no declara `hud` y los juegos simulados no tienen definición, así que los dos siguen mostrando VIDAS.
- `GameCallbacks` no cambia: `onLives` sigue siendo obligatorio (lo provee `PlayerView`). Un motor con `hud.lives: false` nunca lo llama.
- `hud` solo tiene `lives`. Tetris sí tiene nivel, y el contrato se limita a lo que hace falta hoy.

### Definición de TETRIS — `lib/arcade/tetris/index.ts`

- `width: 800`, `height: 600` (4:3, igual que el CRT). El tablero 1:2 se dibuja centrado (ver «Encuadre»).
- `hud: { lives: false }`.
- `controls`:

| `keys`    | `action` |
| --------- | -------- |
| `← →`     | MOVER    |
| `↑ X`     | ROTAR    |
| `↓`       | BAJAR    |
| `ESPACIO` | CAÍDA    |
| `P`       | PAUSA    |

### Constantes — `lib/arcade/tetris/constants.ts`

Los valores de jugabilidad se copian de `game.js` sin cambios. Los tiempos pasan de milisegundos a segundos.

| Constante                                                          | Valor                                                           |
| ------------------------------------------------------------------ | --------------------------------------------------------------- |
| `WIDTH` / `HEIGHT`                                                 | `800` / `600`                                                   |
| `COLS` / `ROWS`                                                    | `10` / `20`                                                     |
| `LINE_SCORES`                                                      | `[0, 100, 300, 500, 800]`, multiplicado por el nivel            |
| `SOFT_DROP_POINTS`                                                 | `1` por fila bajada                                             |
| `HARD_DROP_POINTS`                                                 | `2` por fila recorrida                                          |
| `LINES_PER_LEVEL`                                                  | `10` (nivel = `floor(líneas / 10) + 1`)                         |
| `DROP_INTERVAL_START` / `DROP_INTERVAL_STEP` / `DROP_INTERVAL_MIN` | `1 s` / `0.09 s` / `0.1 s` → `max(0.1, 1 − (nivel − 1) × 0.09)` |
| `ROTATION_KICKS`                                                   | `[0, -1, 1, -2, 2]` columnas                                    |
| `SCORE_MAX`                                                        | `9_999_999`                                                     |
| `MAX_DT`                                                           | `0.05 s`                                                        |

Constantes nuevas, que no están en la referencia:

| Constante                          | Valor                                                               |
| ---------------------------------- | ------------------------------------------------------------------- |
| `DAS_DELAY` / `DAS_REPEAT`         | `0.17 s` / `0.05 s` (espera y cadencia de la repetición de `←`/`→`) |
| `SOFT_DROP_REPEAT`                 | `0.05 s` (cadencia de `↓` sostenida)                                |
| `BLOCK`                            | `28 px` (la referencia usa `30`; solo cambia el dibujo)             |
| `BOARD_X` / `BOARD_Y`              | `260` / `20` (tablero de 280×560)                                   |
| `PANEL_X`                          | `580`                                                               |
| `NEXT_LABEL_Y` / `NEXT_BOX_Y`      | `34` (línea base) / `48`                                            |
| `NEXT_BOX_CELLS`                   | `4` (caja de 112×112)                                               |
| `LINES_LABEL_Y` / `LINES_VALUE_Y`  | `200` / `236` (líneas base)                                         |
| `BLOCK_FILL_ALPHA` / `GHOST_ALPHA` | `0.35` / `0.35`                                                     |
| `GLOW_BLUR`                        | `8`                                                                 |

Colores del canvas (espejo de los tokens de `app/globals.css`, porque el canvas no puede leer clases de Tailwind):

```ts
export const COLORS = {
  background: "#05050a", // --deep
  board: "#0d0d15", // --surface
  grid: "#2a2a38", // --border
  frame: "rgba(0, 245, 255, 0.25)", // --border-neon
  label: "#8a9bb0", // --muted
  value: "#e6f7ff", // --foreground
} as const;

// Un color por tipo de pieza, como el arreglo COLORS de game.js
export const PIECE_COLORS: Record<PieceType, string> = {
  1: "#00f5ff", // I — --neon-cyan
  2: "#f5ff00", // O — --neon-yellow
  3: "#b026ff", // T — --neon-purple (token nuevo)
  4: "#00ff88", // S — --neon-green
  5: "#ff006e", // Z — --neon-pink
  6: "#d6e2ee", // J — --silver
  7: "#ff8c42", // L — --bronze
  8: "#6d7d90", // tuerca — --subtle
};
```

En `app/globals.css`, el bloque «Colores neón principales» de `:root` suma `--neon-purple: #b026ff;`. No se agrega `--color-purple` a `@theme inline`, porque ninguna clase de Tailwind lo usa.

### Piezas — `lib/arcade/tetris/pieces.ts`

```ts
export type PieceType = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8; // I, O, T, S, Z, J, L, tuerca
export type Cell = 0 | PieceType; // 0 = celda vacía
export type Shape = Cell[][];

export interface ActivePiece {
  type: PieceType;
  shape: Shape;
  x: number; // columna de la esquina superior izquierda de la matriz
  y: number; // fila de la esquina superior izquierda de la matriz
}

export const PIECE_COUNT = 8;

// Matrices copiadas de PIECES en game.js
export const PIECES: Record<PieceType, Shape> = {
  1: [
    [0, 0, 0, 0],
    [1, 1, 1, 1],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
  ], // I
  2: [
    [2, 2],
    [2, 2],
  ], // O
  3: [
    [0, 3, 0],
    [3, 3, 3],
    [0, 0, 0],
  ], // T
  4: [
    [0, 4, 4],
    [4, 4, 0],
    [0, 0, 0],
  ], // S
  5: [
    [5, 5, 0],
    [0, 5, 5],
    [0, 0, 0],
  ], // Z
  6: [
    [6, 0, 0],
    [6, 6, 6],
    [0, 0, 0],
  ], // J
  7: [
    [0, 0, 7],
    [7, 7, 7],
    [0, 0, 0],
  ], // L
  8: [
    [8, 8, 8],
    [8, 0, 8],
    [8, 8, 8],
  ], // tuerca
};

// Copia la matriz; x = floor(COLS / 2) − floor(ancho / 2), y = 0 (igual que randomPiece)
export function createPiece(type: PieceType): ActivePiece;
```

El tipo de cada pieza nueva sale de `randInt(1, PIECE_COUNT)` de `lib/arcade/shared/math.ts`, que equivale a `Math.floor(Math.random() * 8) + 1` de la referencia.

### Modelo del tablero — `lib/arcade/tetris/board.ts`

```ts
export type Board = Cell[][]; // ROWS × COLS

export function createBoard(): Board; // todo en 0
// true si alguna celda sale por los lados o el fondo, o cae sobre una celda ocupada;
// las celdas con fila < 0 no se comparan con el tablero (igual que collide de game.js)
export function collide(
  board: Board,
  shape: Shape,
  x: number,
  y: number,
): boolean;
export function rotateCW(shape: Shape): Shape; // transpuesta + filas invertidas
export function merge(board: Board, piece: ActivePiece): void; // fija la pieza en el tablero
// Recorre de abajo hacia arriba, quita cada fila llena e inserta una vacía arriba; devuelve cuántas quitó
export function clearFullRows(board: Board): number;
export function ghostY(board: Board, piece: ActivePiece): number; // fila donde aterrizaría
```

La rotación prueba `rotateCW(shape)` con cada desplazamiento de `ROTATION_KICKS`, en orden, y se queda con el primero que no choca. Si ninguno sirve, la pieza no rota.

### Estado interno de la partida — `lib/arcade/tetris/game.ts`

```ts
type Phase = "playing" | "gameover"; // game.js usa los flags paused y gameOver; la pausa ahora es de la plataforma

// Estado encapsulado en el cierre de createTetrisEngine (no se exporta)
interface TetrisState {
  phase: Phase;
  board: Board;
  current: ActivePiece;
  next: ActivePiece;
  score: number;
  lines: number;
  level: number;
  dropInterval: number; // s entre caídas automáticas
  dropTimer: number; // s acumulados desde la última caída (dropAccum de game.js)
  shiftDirection: -1 | 0 | 1; // dirección que repite la autorrepetición; 0 = ninguna
  shiftTimer: number; // s sostenidos en esa dirección
  softDropTimer: number; // s sostenidos con ↓
}
```

### Entrada y orden de `update`

El teclado es `createKeyboard()` de `lib/arcade/shared/keyboard.ts`, sin cambios. Su conjunto de teclas bloqueadas ya incluye las flechas y Espacio. `KeyX` no se bloquea porque no hace scroll.

En `"playing"`, cada frame procesa en este orden. Si una acción termina la partida, `update` sale sin procesar lo que sigue:

1. **Rotar:** cada `consume("ArrowUp")` y cada `consume("KeyX")` rota una vez. Mantener la tecla no vuelve a rotar.
2. **Mover:** `consume("ArrowLeft")` mueve una columna a la izquierda si no choca, pone `shiftDirection = -1` y `shiftTimer = 0`; `ArrowRight` hace lo mismo hacia la derecha. Se procesa primero la izquierda y luego la derecha, así que la última pulsación manda. Si la tecla de `shiftDirection` sigue sostenida (`isDown`), `shiftTimer += dt`, y mientras `shiftTimer >= DAS_DELAY` la pieza se mueve una columna y `shiftTimer -= DAS_REPEAT`. Si se suelta, `shiftDirection = 0`.
3. **Bajar:** `consume("ArrowDown")` hace un soft drop y pone `softDropTimer = 0`. Si no hubo pulsación nueva en este frame y `↓` sigue sostenida, `softDropTimer += dt`, y mientras `softDropTimer >= SOFT_DROP_REPEAT` hace otro soft drop y `softDropTimer -= SOFT_DROP_REPEAT`. Un soft drop baja una fila y suma `SOFT_DROP_POINTS`; si la pieza no puede bajar, la fija (igual que `softDrop` de `game.js`).
4. **Caída:** `consume("Space")` baja la pieza hasta `ghostY`, suma `HARD_DROP_POINTS × filas recorridas` y la fija.
5. **Gravedad:** `dropTimer += dt`. Si `dropTimer >= dropInterval`, `dropTimer = 0` y la pieza baja una fila, o se fija si no puede.

Fijar una pieza (`lockPiece`):

- `merge`, y luego `clearFullRows`.
- Si se quitaron `n > 0` filas, `lines += n` y suma `LINE_SCORES[n] × nivel`, con el nivel de antes de subir. Después, `level = floor(lines / 10) + 1` y `dropInterval = max(0.1, 1 − (level − 1) × 0.09)`.
- `spawn`: `current = next` y `next` es una pieza nueva al azar. Si `current` choca en su posición inicial, la partida termina.

`dropTimer` no se reinicia al aparecer una pieza ni con el soft drop, igual que `dropAccum` en la referencia.

### Dibujo — `lib/arcade/tetris/render.ts`

Encuadre en la resolución interna de 800×600:

| Elemento           | Posición y tamaño                                          |
| ------------------ | ---------------------------------------------------------- |
| Fondo              | Todo el canvas, `COLORS.background`                        |
| Tablero            | x `260`–`540`, y `20`–`580` (10×20 celdas de 28 px)        |
| Etiqueta SIGUIENTE | x `580`, línea base y `34`                                 |
| Caja SIGUIENTE     | x `580`, y `48`, 112×112 (4×4 celdas de 28 px)             |
| Etiqueta LÍNEAS    | x `580`, línea base y `200`                                |
| Valor LÍNEAS       | x `580`, línea base y `236`, número entero sin separadores |

- **Tablero:** fondo `COLORS.board`, líneas interiores de la grilla en `COLORS.grid` con `lineWidth = 0.5` y marco de 1 px en `COLORS.frame`.
- **Celda fijada y siguiente pieza:** relleno del color de la pieza con `globalAlpha = BLOCK_FILL_ALPHA` en `(x + 1, y + 1, 26, 26)`, y borde de 2 px con alfa 1 en `(x + 2, y + 2, 24, 24)`. Sin glow.
- **Pieza activa:** igual que una celda fijada, más `shadowBlur = GLOW_BLUR` y `shadowColor` igual a su color.
- **Fantasma:** solo el borde de 2 px, con `globalAlpha = GHOST_ALPHA`, sin relleno ni glow.
- **Panel:** las etiquetas van en `14px monospace` con `COLORS.label` y el valor de LÍNEAS en `bold 28px monospace` con `COLORS.value`. La caja SIGUIENTE tiene fondo `COLORS.board` y marco de 1 px en `COLORS.frame`. La pieza va centrada con `offX = floor((4 − ancho) / 2)` y `offY = floor((4 − alto) / 2)`, como `drawNext` de `game.js`.
- Cada función deja `globalAlpha = 1` y `shadowBlur = 0` al terminar.
- Orden en `"playing"`: fondo, tablero con celdas fijadas, fantasma, pieza activa y panel.
- Orden en `"gameover"`: fondo, tablero con celdas fijadas, la pieza que no cupo (con el estilo de pieza activa, superpuesta) y panel. Sin fantasma.

### Reglas del port que difieren de `game.js`

- `start()` arma el estado, emite `onScore(0)` y `onLevel(1)`, conecta el teclado y arranca el loop con `lastTime = null`. Nunca llama a `onLives`.
- `onScore` se emite cada vez que cambia `score` (soft drop, hard drop y líneas). `onLevel` se emite solo cuando sube el nivel.
- El canvas no dibuja SCORE, LEVEL, PAUSA ni GAME OVER. LÍNEAS y SIGUIENTE, que en la referencia estaban en el DOM y en un segundo canvas, se dibujan en el panel del canvas principal.
- Se quitan la tecla P (la pausa es de `PlayerView`), el botón Reiniciar (lo reemplaza JUGAR DE NUEVO), el selector de tema y el título y la lista de controles del DOM (los controles salen de `definition.controls` en `StartScreen`).
- Las acciones del `keydown` del documento pasan a `consume()` dentro de `update`, para que la pausa y el fin de partida las ignoren.
- La repetición de `←`/`→` y `↓` sostenidas la hace el motor con `DAS_DELAY`, `DAS_REPEAT` y `SOFT_DROP_REPEAT`, y no el sistema operativo. `↑`, X y Espacio actúan una vez por pulsación: mantener Espacio ya no encadena hard drops y mantener `↑` ya no rota en bucle.
- `dropAccum` en milisegundos pasa a `dropTimer` en segundos, y el `dt` tiene tope `MAX_DT`. `resume()` pone `lastTime = null`, así que el primer frame tras la pausa tiene `dt = 0`.
- Fin de partida: al no caber la pieza nueva, `phase` pasa a `"gameover"`, el teclado se desconecta y se llama `onGameOver(score)` una sola vez. El loop sigue corriendo hasta `destroy()`: `update` no hace nada y `draw` muestra el tablero congelado con la pieza que no cupo. La referencia cancela el `requestAnimationFrame` y no llega a dibujar esa pieza.
- La puntuación se suma con `Math.min(SCORE_MAX, score + puntos)`.
- Estilo: colores neón en lugar de la paleta pastel, celdas con relleno translúcido y borde en lugar de relleno sólido con franja de brillo, fantasma con contorno al 0,35 en lugar de relleno al 0,2, y celdas de 28 px en lugar de 30.

## Plan de implementación

1. **Catálogo.** Aplicar `update_tetris_description`. Verificación: `select id, title, category, accent, sort_order, short_description, long_description from public.games order by sort_order` muestra el texto nuevo en `tetris` y las otras 7 filas sin cambios, y `get_advisors` (security) no reporta alertas nuevas. `/games/tetris` muestra la descripción nueva y `/games/tetris/play` sigue con SIMULAR PARTIDA.
2. **Utilidades compartidas.** Mover `lib/arcade/asteroids/keyboard.ts` y `math.ts` a `lib/arcade/shared/` con `git mv`, sin cambiar su contenido, y actualizar los imports de `lib/arcade/asteroids/entities.ts` y `game.ts`. Verificación: `npx tsc --noEmit` y `npm run lint` pasan, y ASTEROIDS se juega igual.
3. **Contrato y HUD.** Agregar `GameHud` y `hud?` a `lib/arcade/engine.ts`, la prop `showLives` a `PlayerHud` y `showLives={definition?.hud?.lives ?? true}` en `PlayerView`. Verificación: `npx tsc --noEmit` pasa; ASTEROIDS y un juego simulado siguen mostrando VIDAS.
4. **Token y datos.** Agregar `--neon-purple` a `app/globals.css`, y crear `lib/arcade/tetris/constants.ts` y `pieces.ts`. Verificación: `npx tsc --noEmit` pasa y la app se ve igual.
5. **Modelo del tablero.** Crear `lib/arcade/tetris/board.ts`. Verificación: `npx tsc --noEmit` pasa.
6. **Dibujo.** Crear `lib/arcade/tetris/render.ts`. Verificación: `npx tsc --noEmit` pasa.
7. **Motor.** Crear `lib/arcade/tetris/game.ts` con `createTetrisEngine` (estado, entrada, gravedad, `lockPiece`, `spawn`, `update`, `draw`, loop y `start`/`pause`/`resume`/`destroy`) e `index.ts` con `tetrisDefinition`. Todavía no se registra. Verificación: `npx tsc --noEmit` y `npm run lint` pasan.
8. **Registrar y conectar.** Agregar `tetris: tetrisDefinition` a `DEFINITIONS`. Verificación: en `/games/tetris/play` se juega una partida completa hasta el modal, y GUARDAR PUNTUACIÓN crea una fila en `scores` con `game_id = 'tetris'` que aparece en `/games/tetris`.
9. **Documentación.** Actualizar `CLAUDE.md`: el párrafo de «Proyecto» (SPEC 07 implementado y TETRIS jugable), «Rutas» → `/games/[id]/play` (ASTEROIDS y TETRIS con motor real) y «Estructura» → `lib/arcade/` (`shared/` con `keyboard.ts` y `math.ts`, `tetris/` con sus seis archivos, el campo `hud` del contrato y el registro con `asteroids` y `tetris`). Verificación: `npm run format:check` pasa.

## Criterios de aceptación

**Generales**

- [ ] `npm run build`, `npm run lint` y `npx tsc --noEmit` terminan sin errores.
- [ ] Existen `lib/arcade/shared/keyboard.ts`, `lib/arcade/shared/math.ts` y los seis archivos de `lib/arcade/tetris/` (`constants.ts`, `pieces.ts`, `board.ts`, `render.ts`, `game.ts` e `index.ts`).
- [ ] `lib/arcade/asteroids/keyboard.ts` y `lib/arcade/asteroids/math.ts` no existen.
- [ ] Ningún archivo de `lib/arcade/` importa `react` ni declara `"use client"`.
- [ ] `git diff main -- references/` no muestra cambios.
- [ ] Al jugar una partida completa en `/games/tetris/play`, la consola del navegador no muestra errores ni advertencias de hidratación.

**Catálogo**

- [ ] La fila `tetris` de `games` tiene la `long_description` nueva, y `title`, `category`, `accent`, `sort_order` y `short_description` no cambiaron. Las otras 7 filas no cambiaron.
- [ ] `/games/tetris` muestra la descripción nueva, que menciona la tuerca.

**Flujo del Reproductor**

- [ ] `/games/tetris/play` muestra el `PixelLoader` y luego `StartScreen` con «TETRIS», las cinco filas de controles (`← →` MOVER, `↑ X` ROTAR, `↓` BAJAR, `ESPACIO` CAÍDA, `P` PAUSA), «PRESIONA ESPACIO» e INICIAR.
- [ ] Presionar Espacio en `StartScreen` inicia la partida sin hacer hard drop: la primera pieza aparece arriba y baja una fila por segundo.
- [ ] Hacer clic en INICIAR inicia la partida.
- [ ] Desde el `PixelLoader`, el HUD muestra PUNTUACIÓN, NIVEL y JUGADOR, sin celda VIDAS. Con la partida iniciada muestra `PUNTUACIÓN 0` y `NIVEL 01`.
- [ ] Con una ventana más baja que la página, las flechas y Espacio no hacen scroll durante la partida.
- [ ] Emulando un dispositivo táctil (`pointer: coarse`), `StartScreen` muestra «ESTE JUEGO NECESITA TECLADO» y no muestra INICIAR.

**Jugabilidad (idéntica a la referencia salvo la autorrepetición)**

- [ ] El tablero de 10×20 se ve centrado, y a la derecha hay un panel con SIGUIENTE (la próxima pieza) y `LÍNEAS 0`.
- [ ] Cada pieza aparece centrada en la parte superior, y en el nivel 1 baja una fila por segundo.
- [ ] `←` y `→` mueven la pieza una columna por pulsación. Sostenidas, mueven una columna enseguida y, pasados unos 0,17 s, 20 columnas por segundo hasta el borde. La pieza nunca atraviesa los bordes ni los bloques fijados.
- [ ] `↑` y X rotan la pieza en sentido horario una vez por pulsación; mantenerlas no vuelve a rotar. Pegada a una pared, la pieza rota desplazándose hasta 2 columnas; si no hay lugar, no rota.
- [ ] `↓` baja la pieza una fila y suma 1 punto por fila. Sostenida, baja 20 filas por segundo. Con la pieza apoyada, `↓` la fija.
- [ ] Espacio deja caer la pieza hasta donde marca el fantasma, la fija y suma 2 puntos por fila recorrida. Mantener Espacio no deja caer la pieza siguiente.
- [ ] El contorno del fantasma muestra dónde va a aterrizar la pieza.
- [ ] En el nivel 1, completar 1 línea suma 100 puntos, 2 a la vez suman 300, 3 suman 500 y 4 suman 800, más los puntos de la caída. LÍNEAS aumenta en el panel.
- [ ] Al llegar a 10 líneas, el HUD pasa a `NIVEL 02`, la siguiente línea simple suma 200 y la pieza baja más rápido (una fila cada 0,91 s).
- [ ] En una partida de 40 piezas aparece al menos una tuerca: un anillo gris de 3×3 con el centro vacío (la probabilidad de que no salga es menor al 0,5 %). Rotarla no cambia su forma, y al fijarla su centro queda vacío.
- [ ] La pieza que aparece es la que mostraba SIGUIENTE.
- [ ] El canvas no dibuja SCORE, NIVEL, vidas, PAUSA ni GAME OVER.
- [ ] Colores: I cian, O amarillo, T violeta, S verde, Z rosa, J plata, L bronce y tuerca gris. El fondo es `#05050a` y el tablero `#0d0d15` con grilla. La pieza activa tiene glow y las fijadas no. El overlay de scanlines del CRT se ve encima del juego.

**Pausa**

- [ ] P y el botón PAUSA congelan el juego y muestran el overlay PAUSA. P y SEGUIR lo reanudan sin que la pieza salte filas.
- [ ] Mantener `←` mientras se pausa y soltarla durante la pausa no deja la pieza moviéndose al reanudar.
- [ ] Cambiar de pestaña o hacer clic fuera de la ventana durante la partida la deja en PAUSA.
- [ ] Con la partida en pausa durante 5 s, la pieza no baja. Al reanudar en el nivel 1, la siguiente caída llega en menos de 1 s.
- [ ] En `StartScreen`, P no muestra el overlay PAUSA.

**Fin de partida y ranking**

- [ ] Al apilar piezas hasta que la nueva no cabe, se abre `GameOverModal` con la misma puntuación que mostraba el HUD. Detrás se ve el tablero congelado, con la pieza que no cupo encima y sin fantasma.
- [ ] Con el modal abierto, las flechas y Espacio no mueven piezas, y Espacio sobre JUGAR DE NUEVO con foco activa el botón.
- [ ] GUARDAR PUNTUACIÓN crea exactamente una fila en `scores` con `game_id = 'tetris'` y la puntuación del HUD. Esa fila aparece en `/games/tetris` y en la pestaña TETRIS del Salón de la Fama si entra en el top 10.
- [ ] La tarjeta de TETRIS en `/games` muestra esa puntuación como MEJOR PUNTUACIÓN si es la primera.
- [ ] JUGAR DE NUEVO vuelve al `PixelLoader` y a `StartScreen`, y la nueva partida arranca con el tablero vacío, `PUNTUACIÓN 0`, `NIVEL 01` y `LÍNEAS 0`.
- [ ] SALIR durante la partida lleva a `/games/tetris`. Volver a JUGAR AHORA inicia una partida nueva con una sola pieza que baja una fila por segundo (sin dos loops corriendo).

**Sin regresiones**

- [ ] ASTEROIDS se juega igual que antes del spec: HUD con `VIDAS ■■■`, pausa, fin de partida y guardado.
- [ ] Los juegos sin motor (por ejemplo `/games/snake/play`) siguen mostrando SIMULAR PARTIDA, y su HUD muestra VIDAS.
- [ ] `/`, `/games`, `/hall-of-fame` y `/about` se ven igual que antes del spec. Solo cambia la descripción de TETRIS en su Detalle.

## Decisiones

- **Sí:** port a TypeScript dentro del bundle, con el contrato del SPEC 05. Es el camino que ya sigue ASTEROIDS.
- **Sí:** 8 piezas, con la tuerca. Lo eligió el usuario. Es un port, y `game.js` la incluye aunque su README hable de 7.
- **No:** solo las 7 piezas estándar. Cambiaría la jugabilidad de la referencia.
- **Sí:** reglas idénticas a la referencia: puntos, niveles, caída, wall kicks, fantasma, azar uniforme y fijado inmediato. Lo eligió el usuario.
- **No:** lock delay de 0,5 s. Es un cambio de jugabilidad y queda para otro spec.
- **Sí:** autorrepetición propia con acumuladores de `dt` (`←`/`→`: 0,17 s y luego 0,05 s; `↓`: 0,05 s). Lo eligió el usuario. Se siente igual en todos los equipos, se congela en pausa y `keyboard.ts` no cambia.
- **No:** usar la repetición del sistema operativo, como la referencia. La velocidad dependería de cada equipo, y `consume()` tendría que aceptar `event.repeat`, que es lo que evita que el Espacio que inicia la partida haga un hard drop.
- **No:** un paso por pulsación sin repetición. Mover una pieza de un borde al otro exigiría 9 pulsaciones.
- **Sí:** `↑` y X rotan. Lo eligió el usuario. X no se agrega a las teclas bloqueadas porque no hace scroll, así que `createKeyboard` mantiene su firma.
- **No:** rotación antihoraria con Z. Es un cambio de jugabilidad.
- **Sí:** `keyboard.ts` y `math.ts` pasan a `lib/arcade/shared/` sin cambios. Tetris es el primer juego después de ASTEROIDS que los necesita (`createKeyboard` y `randInt`), como indica la guía del skill.
- **Sí:** campo opcional `hud.lives` en `GameDefinition`, y `PlayerHud` oculta VIDAS. Lo eligió el usuario. Tetris no tiene vidas, y ASTEROIDS y los juegos simulados no cambian.
- **No:** convertir la celda VIDAS en LÍNEAS con un callback `onStats`. Toca cuatro componentes compartidos por un solo dato.
- **No:** emitir `onLives(1)` fijo. Mostraría un dato que Tetris no tiene.
- **Sí:** `hud` solo tiene `lives`. El contrato se amplía con lo que hace falta hoy.
- **Sí:** LÍNEAS y SIGUIENTE en un panel dentro del canvas. No hace falta tocar el contrato más allá de `hud`.
- **Sí:** celdas de 28 px, tablero en x 260 e y 20, panel en x 580. Lo eligió el usuario. Los 20 px de margen alejan la fila de aparición del viñeteado y de las esquinas redondeadas del CRT.
- **No:** celdas de 30 px a toda la altura. La primera y la última fila quedarían bajo el viñeteado.
- **No:** LÍNEAS a la izquierda y SIGUIENTE a la derecha. Dispersa el panel sin ganancia.
- **Sí:** estilo neón con un violeta nuevo (`--neon-purple: #b026ff`). Lo eligió el usuario. Los colores quedan cerca de los de la referencia: T violeta, Z roja → rosa, L naranja → bronce, J azul pálido → plata, tuerca gris.
- **Sí:** el token nuevo va solo en `:root`, sin `--color-purple` en `@theme inline`. Ninguna clase de Tailwind lo usa todavía.
- **No:** solo los tokens existentes. Amarillo, oro y bronce se confunden entre sí.
- **No:** la paleta pastel de la referencia. Desentona con el gabinete neón.
- **Sí:** glow solo en la pieza activa. El tablero puede tener hasta 200 celdas fijadas, y `shadowBlur` en todas baja los fps.
- **Sí:** al terminar, el tablero queda congelado con la pieza que no cupo encima y sin fantasma. Lo eligió el usuario. Se ve por qué terminó la partida.
- **No:** congelar el tablero sin la pieza nueva, ni apagarlo a gris.
- **Sí:** corregir `long_description` con `update_tetris_description`. Lo eligió el usuario. Avisa de la tuerca y de que el nivel sube cada 10 líneas, en lugar de «cada línea eliminada acelera la caída».
- **Sí:** `SCORE_MAX` como tope de seguridad. En la práctica no se alcanza: en el nivel 100 (990 líneas), cuatro líneas a la vez suman 80.000.
- **Sí:** el nivel no tiene tope y la caída queda en 0,1 s desde el nivel 11, igual que la referencia. `pad2` muestra el nivel 100 con tres dígitos.
- **Sí:** sin sonido ni assets. La referencia no tiene.
- **Sí:** el selector de tema claro/oscuro queda fuera. La plataforma es solo oscura.
- **Sí:** el loop sigue corriendo en `"gameover"` hasta `destroy()`, como en ASTEROIDS. `update` no hace nada y redibujar el tablero es barato.

## Riesgos

| Riesgo                                                                                           | Mitigación                                                                                                                                             |
| ------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| En desarrollo, React Strict Mode monta el efecto dos veces y deja dos loops corriendo.           | `destroy()` cancela el `requestAnimationFrame` y quita todos los listeners. Hay un criterio de «una sola pieza que baja una fila por segundo».         |
| Acceder a `window` o `document` al importar `lib/arcade/tetris/` rompe el prerender.             | La convención obliga a tocar el DOM solo dentro de `create()`. `npm run build` lo detecta.                                                             |
| El salto de `dt` al reanudar hace caer la pieza de golpe.                                        | `resume()` pone `lastTime = null` y el tope de `dt` es de 50 ms. Con `dropInterval` de al menos 0,1 s, hay como máximo una caída automática por frame. |
| El Espacio que inicia la partida también hace un hard drop.                                      | `consume()` ignora `event.repeat` y la transición a `playing` solo ocurre desde `ready`. Hay un criterio para esto.                                    |
| Una puntuación mayor que 9.999.999 hace fallar el guardado por el `CHECK` de `scores`.           | `SCORE_MAX` en el motor.                                                                                                                               |
| Mover `keyboard.ts` y `math.ts` rompe ASTEROIDS.                                                 | Es un paso propio, con `git mv` y sin cambios de contenido, verificado con una partida de ASTEROIDS.                                                   |
| Ocultar VIDAS cambia el HUD de otros juegos.                                                     | `showLives` vale `true` por defecto y solo `tetrisDefinition` declara `hud`. Hay criterios para ASTEROIDS y los juegos simulados.                      |
| La autorrepetición se siente distinta de la del sistema operativo.                               | `DAS_DELAY`, `DAS_REPEAT` y `SOFT_DROP_REPEAT` están en `constants.ts` y se ajustan sin tocar el contrato.                                             |
| Mantener `↓` al fijar una pieza sigue bajando la siguiente y la fija enseguida.                  | Es el comportamiento de la referencia con la repetición del sistema. Se conserva para no cambiar la jugabilidad.                                       |
| La tuerca gris (`--subtle`) se distingue poco del tablero.                                       | Lleva el mismo borde de 2 px con alfa 1 que las demás. Si no alcanza, se cambia una sola entrada de `PIECE_COLORS`.                                    |
| Los textos del panel («LÍNEAS», «SIGUIENTE») usan `monospace` y no la fuente pixelada del sitio. | Es la decisión del SPEC 05 para el canvas: las fuentes de `next/font` tienen nombres generados y habría que esperar a que carguen.                     |

## Lo que **no** entra en este spec

- Selector de tema claro/oscuro.
- Sonido y música.
- Lock delay, pieza reservada, rotación antihoraria, 7-bag, T-spins, animación de líneas o tope de nivel.
- LÍNEAS en el HUD de la plataforma.
- Controles táctiles.
- Antitrampas o topes de puntuación por juego.
- Cambios en la Biblioteca, el Home o el Salón de la Fama más allá de la descripción del catálogo.
- Tests automatizados.
- Cambios en `references/` o en los specs 01 a 06.

Si alguna de estas llega, va en su propio spec.
