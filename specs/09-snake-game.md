# SPEC 09 — SNAKE jugable en el Reproductor

> **Estado:** Aprobado
> **Depende de:** SPEC 05, SPEC 06, SPEC 07, SPEC 08
> **Fecha:** 2026-09-28
> **Objetivo:** Crear un SNAKE jugable en `/games/snake/play`, con serpiente neón, frutas dibujadas con los sprites de `references/source-assets/snake-assets/` y su puntuación en el ranking global.

## Por qué existe este spec

SNAKE ya está en el catálogo (`games`, `sort_order` 3, categoría «Clásicos», acento rosa), pero su Reproductor muestra el placeholder IFRAME SANDBOX y SIMULAR PARTIDA. A diferencia de ASTEROIDS, TETRIS y ARKANOID, **no hay referencia que portar**: en `references/started-games/` no existe una carpeta de Snake. Lo único que hay es `references/source-assets/snake-assets/`, con `fruits.png` (3790×442, tres filas de frutas; obra de terceros, según el comentario de `sprites.js`: The Spriters Resource, «Google Snake Game») y `sprites.js`, un atlas que recorta 22 frutas de la fila del medio (la de estilo pixel-art, de `y = 136` a `295`). Por eso este spec **diseña el juego completo** y fija cada regla y cada constante, para que la implementación no tenga que improvisar.

El juego es un Snake clásico sobre una grilla de 20×15 celdas de 40 px (800×600, 4:3 exacto), con 3 vidas, nivel que sube cada 5 frutas y velocidad creciente. La serpiente y el tablero se dibujan en neón con los tokens del tema, como Asteroids y Tetris; solo las frutas son sprites. Es el primer juego que reúne vidas, niveles e imágenes sin sonido ni mouse.

La plataforma ya cubre todo lo demás: el juego tiene vidas y niveles, el canvas es 4:3 y las teclas que necesita (flechas y WASD) no exigen tocar `createKeyboard`, cuyo conjunto de teclas bloqueadas ya incluye las flechas y Espacio (las letras no hacen scroll). **El contrato no se amplía**: `engine.ts`, `PlayerView`, `PlayerHud`, `StartScreen` y los demás componentes compartidos no cambian. Lo único que cambia fuera del motor es la `long_description` del catálogo, que dice «come los píxeles» cuando el juego usa frutas.

## Alcance

**Incluye:**

- **Catálogo:** `long_description` de `snake` corregida con la migración `update_snake_description` (frutas en lugar de píxeles, tres vidas, reaparición desde el centro). `short_description` no cambia.
- **Assets:** copia, sin modificar, de `fruits.png` a `public/arcade/snake/`. `sprites.js` no se copia: sus coordenadas pasan a `sprites.ts`.
- **Motor nuevo** en `lib/arcade/snake/`, con: grilla de 20×15 celdas de 40 px; serpiente de largo inicial 3 que avanza una celda por paso; una fruta a la vez, elegida al azar entre 22 sprites sin repetir la anterior; 10 × nivel puntos por fruta; 3 vidas (chocar con una pared o con el propio cuerpo cuesta una); nivel `1 + floor(frutas / 5)`; velocidad `min(16, 8 + nivel − 1)` celdas/s; victoria si la serpiente llena las 300 celdas.
- **Estilo:** fondo `--deep` con cuadrícula tenue, cuerpo rosa `--neon-pink`, cabeza más clara con ojos y glow, y frutas con sprites.
- **HUD de la plataforma:** PUNTUACIÓN, VIDAS y NIVEL salen de los callbacks. El canvas no dibuja puntos, vidas, nivel, PAUSA ni GAME OVER.
- **Entrada:** `← ↑ ↓ →` y `W A S D`, con cola de 2 giros y sin giros de 180°.
- **Registro:** `snake` se agrega a `DEFINITIONS`, así que `/games/snake/play` deja de mostrar SIMULAR PARTIDA.
- **Ranking:** la puntuación final se guarda en `scores` con el flujo existente de `GameOverModal`, sin cambios en el código del ranking.
- **Documentación:** actualizar `CLAUDE.md`, con el crédito de origen de los sprites.

**Fuera de alcance (para futuros specs):**

- Sonido (no hay audio en `snake-assets`; el SPEC 05 ya lo dejó fuera).
- Frutas bonus, power-ups, obstáculos, atravesar bordes, modos de juego y niveles con mapas distintos.
- Las otras dos filas de `fruits.png` (la fila de arriba, en estilo vectorial, y la de abajo, en fotografías) y las frutas sin recorte en `sprites.js`.
- Controles táctiles o de mouse. En un dispositivo táctil `StartScreen` sigue mostrando «ESTE JUEGO NECESITA TECLADO».
- Cambios de jugabilidad respecto de lo acordado en este spec.
- Validación antitrampas o topes de puntuación por juego.
- Cambios en la Biblioteca, el Home o el Salón de la Fama más allá de lo que da la fila del catálogo.
- Tests automatizados.
- Modificar `references/` o los specs 01 a 08.

## Rutas y archivos

```
public/arcade/snake/
  fruits.png                      (nuevo) copia de references/source-assets/snake-assets/fruits.png
lib/
  arcade/registry.ts              (cambia) + snake
  arcade/snake/constants.ts       (nuevo) grilla, velocidades, puntos, tiempos, SCORE_MAX, COLORS y ruta del asset
  arcade/snake/sprites.ts         (nuevo) atlas de 22 frutas, loadFruitSprites y drawFruit
  arcade/snake/game.ts            (nuevo) createSnakeEngine: estado, entrada, pasos, colisiones, dibujo y loop
  arcade/snake/index.ts           (nuevo) snakeDefinition: GameDefinition
CLAUDE.md                         (cambia) proyecto, rutas y estructura
```

Sin cambios: `lib/arcade/engine.ts`, `lib/arcade/shared/`, `components/game/` (`PlayerView`, `PlayerHud`, `GameCanvas`, `StartScreen`, `GameOverModal`, `CrtScreen`, `PixelLoader`), `app/games/[id]/play/page.tsx`, `app/globals.css`, `lib/games.ts`, `lib/catalog.ts`, `lib/leaderboard.ts`, `lib/leaderboard-client.ts`, `DetailLeaderboard`, `HallOfFameTable` y `lib/supabase/database.types.ts`.

Base de datos (proyecto `xanuntuhanyubcqiudlp`, con `apply_migration` del MCP de Supabase): migración `update_snake_description`. No cambia el esquema, así que los tipos no se regeneran.

Convenciones:

- Las de `lib/arcade/` del SPEC 05: sin React ni `"use client"`, DOM (`Image`, `window`) solo dentro de `create()` o de funciones que este llama, estado en el cierre de `createSnakeEngine` y loop por `dt` sin `setTimeout` ni `setInterval`.
- `sprites.ts` no guarda estado de módulo: cada `loadFruitSprites()` devuelve su propio objeto con su propio `Image`.
- `createKeyboard` y `randInt` se importan de `lib/arcade/shared/`; no se copian dentro de `lib/arcade/snake/`.
- El asset se **copia** con `cp` (no se mueve) y `references/` queda intacto.
- Código en inglés, comentarios en español latinoamericano, módulos sin JSX en kebab-case.

## Modelo de datos

### Catálogo — migración `update_snake_description`

```sql
update public.games
set long_description = 'Guía a la serpiente por la pantalla y come las frutas para crecer. Cada cinco frutas subes de nivel y la serpiente va más rápido. Tienes tres vidas: chocar con las paredes o contigo mismo te cuesta una y la serpiente vuelve a empezar desde el centro.'
where id = 'snake';
```

Fila resultante (solo cambia `long_description`):

| Campo               | Valor                                                                                                                                                                                                                                                      |
| ------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `id`                | `snake`                                                                                                                                                                                                                                                    |
| `title`             | `SNAKE`                                                                                                                                                                                                                                                    |
| `category`          | `Clásicos`                                                                                                                                                                                                                                                 |
| `accent`            | `pink`                                                                                                                                                                                                                                                     |
| `sort_order`        | `3`                                                                                                                                                                                                                                                        |
| `short_description` | Come, crece y no te muerdas la cola.                                                                                                                                                                                                                       |
| `long_description`  | Guía a la serpiente por la pantalla y come las frutas para crecer. Cada cinco frutas subes de nivel y la serpiente va más rápido. Tienes tres vidas: chocar con las paredes o contigo mismo te cuesta una y la serpiente vuelve a empezar desde el centro. |

### Definición de SNAKE — `lib/arcade/snake/index.ts`

- `width: 800`, `height: 600` (4:3, igual que el CRT). La grilla de 20×15 celdas de 40 px llena el canvas exacto, sin márgenes ni paneles.
- Sin campo `hud`: el HUD muestra PUNTUACIÓN, VIDAS, NIVEL y JUGADOR.
- `controls`. Cada `action` debe ser única porque `StartScreen` la usa como `key` de React:

| `keys`              | `action` |
| ------------------- | -------- |
| `← ↑ ↓ → / W A S D` | MOVER    |
| `P`                 | PAUSA    |

### Assets — `public/arcade/snake/`

| Destino                          | Origen                                             |
| -------------------------------- | -------------------------------------------------- |
| `public/arcade/snake/fruits.png` | `references/source-assets/snake-assets/fruits.png` |

La copia es byte a byte (`cmp` sin diferencias). Se carga con la ruta absoluta `/arcade/snake/fruits.png`. La hoja mide 3790×442 y pesa unos 580 KB; se carga completa, sin recortarla ni editarla. `CLAUDE.md` deja anotado el origen que declara `sprites.js` (The Spriters Resource, «Google Snake Game»).

### Constantes — `lib/arcade/snake/constants.ts`

Los valores son los acordados en este spec (no hay referencia). Los tiempos van en segundos.

| Constante                   | Valor                                                                           |
| --------------------------- | ------------------------------------------------------------------------------- |
| `WIDTH` / `HEIGHT`          | `800` / `600`                                                                   |
| `CELL`                      | `40` px                                                                         |
| `COLS` / `ROWS`             | `20` / `15` (300 celdas)                                                        |
| `INITIAL_LENGTH`            | `3` celdas                                                                      |
| `START_COL` / `START_ROW`   | `10` / `7` (celda de la cabeza; el cuerpo ocupa `(9, 7)` y `(8, 7)`)            |
| `INITIAL_LIVES`             | `3`                                                                             |
| `FRUITS_PER_LEVEL`          | `5` (nivel = `1 + floor(frutas comidas / 5)`)                                   |
| `BASE_SPEED`                | `8` celdas/s en el nivel 1                                                      |
| `SPEED_STEP`                | `1` celda/s por nivel                                                           |
| `MAX_SPEED`                 | `16` celdas/s (se alcanza en el nivel 9)                                        |
| `FRUIT_POINTS`              | `10` (por fruta, multiplicado por el nivel)                                     |
| `TURN_QUEUE_MAX`            | `2` giros guardados                                                             |
| `RESPAWN_DELAY`             | `1.5` s                                                                         |
| `BLINK_INTERVAL`            | `0.15` s (la serpiente alterna visible e invisible mientras reaparece)          |
| `FRUIT_BOX`                 | `32` px (recuadro de 32×32 centrado en la celda, o sea 4 px de margen por lado) |
| `BODY_INSET` / `HEAD_INSET` | `3` px / `2` px (margen del segmento dentro de su celda)                        |
| `FRUIT_SPRITESHEET_URL`     | `"/arcade/snake/fruits.png"`                                                    |
| `SCORE_MAX`                 | `9_999_999`                                                                     |
| `MAX_DT`                    | `0.05 s`                                                                        |

Derivadas: el intervalo entre pasos es `1 / speed` s, con `speed = min(MAX_SPEED, BASE_SPEED + (level − 1) × SPEED_STEP)`. El intervalo más corto es `1 / 16 = 0.0625 s`, mayor que `MAX_DT`, así que en un frame nunca ocurre más de un paso.

Colores del canvas (espejo de los tokens de `app/globals.css`, porque el canvas no puede leer clases de Tailwind):

```ts
export const COLORS = {
  background: "#05050a", // --deep
  grid: "#1a1a26", // --surface-3
  body: "#ff006e", // --neon-pink
  head: "#ff5c9e", // tono más claro del rosa, derivado de --neon-pink
  eye: "#e6f7ff", // --foreground
  pupil: "#05050a", // --deep
} as const;
```

### Frutas — `lib/arcade/snake/sprites.ts`

Las 22 frutas son las de `sprites.js`, todas en la fila `y = 136` con `h = 160`. Recortes (`sx`, `sw`; `sy = 136` y `sh = 160` en todas), en este orden, que es el del atlas:

| Fruta        | `sx`   | `sw` |     | Fruta       | `sx`   | `sw` |
| ------------ | ------ | ---- | --- | ----------- | ------ | ---- |
| `banana`     | `34`   | 110  |     | `kiwi`      | `2068` | 170  |
| `orange`     | `186`  | 150  |     | `lemon`     | `2250` | 140  |
| `grape`      | `378`  | 110  |     | `peach`     | `2432` | 130  |
| `garlic`     | `540`  | 130  |     | `peanut`    | `2604` | 130  |
| `eggplant`   | `712`  | 130  |     | `apple`     | `2786` | 110  |
| `strawberry` | `894`  | 110  |     | `tomato`    | `2948` | 130  |
| `cherry`     | `1066` | 110  |     | `berries`   | `3110` | 150  |
| `carrot`     | `1228` | 130  |     | `grapes2`   | `3302` | 110  |
| `mushroom`   | `1400` | 130  |     | `pineapple` | `3454` | 150  |
| `broccoli`   | `1582` | 110  |     | `melon`     | `3637` | 130  |
| `watermelon` | `1734` | 150  |     | `pepper`    | `1906` | 150  |

```ts
export const FRUIT_COUNT = 22;

export interface FruitSprites {
  isReady(): boolean; // false hasta que carga la imagen
  drawFruit(
    ctx: CanvasRenderingContext2D,
    fruitIndex: number, // 0 a FRUIT_COUNT − 1
    col: number,
    row: number,
  ): void;
  dispose(): void; // suelta los callbacks de carga
}

export function loadFruitSprites(): FruitSprites; // crea el Image y lo carga desde FRUIT_SPRITESHEET_URL
```

`drawFruit` escala el recorte para que entre en `FRUIT_BOX × FRUIT_BOX` **sin deformarlo**: `scale = min(FRUIT_BOX / sw, FRUIT_BOX / sh)`, y lo centra en la celda `(col, row)`. Como todos los recortes miden 160 px de alto, la escala es `0.2` y el ancho dibujado va de 22 a 34 px (la fruta más ancha, `kiwi`, se limita a 32 px, o sea que mide 32×30). Mientras `isReady()` sea `false`, `drawFruit` no hace nada. El port no toca `imageSmoothingEnabled`.

### Estado interno de la partida — `lib/arcade/snake/game.ts`

```ts
type Phase = "waiting" | "playing" | "respawning" | "gameover" | "win";
type Direction = "up" | "down" | "left" | "right";

interface Cell {
  col: number; // 0 a COLS − 1
  row: number; // 0 a ROWS − 1
}

interface Fruit extends Cell {
  sprite: number; // índice 0 a FRUIT_COUNT − 1
}

// Estado encapsulado en el cierre de createSnakeEngine (no se exporta)
interface SnakeState {
  phase: Phase;
  snake: Cell[]; // snake[0] es la cabeza
  direction: Direction; // dirección del último paso dado
  turnQueue: Direction[]; // hasta TURN_QUEUE_MAX giros pendientes
  fruit: Fruit;
  stepTimer: number; // s acumulados desde el último paso
  respawnTimer: number; // s transcurridos en "respawning"
  fruitsEaten: number; // se conserva al perder una vida
  score: number;
  lives: number;
  level: number;
}
```

### Reglas del juego

**Inicio y reaparición**

- `start()` arma el estado, emite `onScore(0)`, `onLives(3)` y `onLevel(1)`, conecta el teclado y arranca el loop con `lastTime = null`.
- `resetSnake()`: `snake = [(10, 7), (9, 7), (8, 7)]`, `direction = "right"`, `turnQueue = []`, `stepTimer = 0`, y una fruta nueva con `spawnFruit()`.
- La partida empieza en `"waiting"`: la serpiente está quieta. La primera pulsación de `↑`, `↓` o `→` (o `W`, `S`, `D`) la pone en `"playing"` con esa dirección; `←`/`A` se ignora porque sería una reversa. La pulsación cuenta como el primer giro y el primer paso se da al cumplirse el intervalo.
- Tras perder una vida (con vidas restantes) se llama `resetSnake()` y la fase pasa a `"respawning"` con `respawnTimer = 0`. Durante `RESPAWN_DELAY` (1.5 s) la serpiente parpadea (visible cuando `floor(respawnTimer / BLINK_INTERVAL)` es par), no avanza y las teclas se descartan. Al cumplirse pasa a `"playing"` y avanza sola hacia la derecha. No hay invencibilidad: mientras parpadea no se mueve, así que no puede chocar.
- El nivel, la velocidad, la puntuación y `fruitsEaten` **se conservan** al perder una vida.

**Entrada**

- `createKeyboard()` de `lib/arcade/shared/keyboard.ts`, sin cambios. Cada frame, en `update`, se llama `consume` sobre `ArrowUp`/`KeyW`, `ArrowDown`/`KeyS`, `ArrowLeft`/`KeyA` y `ArrowRight`/`KeyD`, y cada pulsación se agrega a `turnQueue` con `pushTurn(direction)`. Si en un mismo frame hay varias, se procesan en el orden fijo arriba, abajo, izquierda, derecha.
- `pushTurn(direction)` compara con la última dirección **prevista** (`turnQueue[turnQueue.length − 1]` o, si la cola está vacía, `state.direction`). Se descarta si es igual a esa (no aporta nada) o es su opuesta (reversa de 180°), o si la cola ya tiene `TURN_QUEUE_MAX` giros.
- En cada paso, si `turnQueue` no está vacía, se saca el primer giro y pasa a ser `state.direction`.
- Las flechas y Espacio ya están bloqueadas por `createKeyboard`, así que no hacen scroll. Espacio no tiene acción en el juego: solo inicia la partida desde `StartScreen`.

**Paso, velocidad y colisiones — `update(dt)`**

`update` no avanza hasta que `sprites.isReady()`. En `"playing"`, cada frame suma `dt` a `stepTimer`. Cuando `stepTimer >= 1 / speed`, resta ese intervalo y da un paso:

1. Aplica el giro pendiente (si hay) y calcula la celda nueva de la cabeza en esa dirección.
2. **Pared:** si `col < 0`, `col >= COLS`, `row < 0` o `row >= ROWS`, es un choque.
3. **Cuerpo:** si la celda nueva coincide con una celda de la serpiente, es un choque. **La cola no cuenta** cuando no se come en este paso, porque se libera en el mismo paso (seguir la cola es válido). Si en este paso se come una fruta, la cola no se libera y sí cuenta.
4. **Fruta:** si la celda nueva es la de la fruta, la serpiente crece una celda (la cola no se quita), `fruitsEaten += 1`, `score = min(SCORE_MAX, score + FRUIT_POINTS × level)` con el `level` **anterior** a esta fruta, se emite `onScore(score)`, se recalcula `level = 1 + floor(fruitsEaten / 5)` y, si cambió, se emite `onLevel(level)`. Después `spawnFruit()`. Si no se comió, se quita la cola.
5. **Choque:** `lives −= 1` y se emite `onLives(lives)`. Con `lives <= 0` se fija `lives = 0`, `phase = "gameover"`, se desconecta el teclado y se llama `onGameOver(score)` una sola vez. Si no, `resetSnake()` y `phase = "respawning"`.

**Frutas**

- `spawnFruit()` elige al azar (con `randInt` de `shared/math.ts`) una celda libre, es decir, una que no ocupe la serpiente, y un sprite de los 22 distinto al de la fruta anterior (en la primera del juego, cualquiera). Todas las frutas dan los mismos puntos; el sprite es solo cosmético.
- **Victoria:** si al comer no queda ninguna celda libre (la serpiente ocupa las 300), `phase = "win"`, se desconecta el teclado y se llama `onGameOver(score)` una sola vez, igual que la derrota. Es prácticamente inalcanzable, pero deja la regla cerrada.

**Puntuación máxima:** en la práctica no se acerca al tope. Una serpiente que llenara las 300 celdas sin morir comería 297 frutas hasta el nivel 60 y sumaría menos de 90.000 puntos. `SCORE_MAX` se conserva igual, por el `CHECK` de `scores`.

### Dibujo — `game.ts`

Orden en cualquier fase: fondo (`COLORS.background`), cuadrícula (líneas de 1 px, `COLORS.grid`, en los bordes de cada celda), fruta, cuerpo y cabeza.

- **Cuerpo:** un cuadrado de `CELL − 2 × BODY_INSET` (34 px) por segmento, en `COLORS.body`, sin glow (hasta 300 segmentos).
- **Cabeza:** `CELL − 2 × HEAD_INSET` (36 px) en `COLORS.head`, con `shadowColor = COLORS.body` y `shadowBlur = 12`, más dos ojos de 6 px (`COLORS.eye`) con una pupila de 3 px (`COLORS.pupil`) orientados según `direction`: los ojos se colocan en el lado delantero de la cabeza, uno a cada costado.
- **Parpadeo:** en `"respawning"`, la serpiente completa (cuerpo y cabeza) solo se dibuja cuando `floor(respawnTimer / BLINK_INTERVAL)` es par. La fruta se dibuja siempre.
- Con `"gameover"` o `"win"` se sigue dibujando el último estado, sin cambios.
- El canvas no dibuja puntuación, nivel, vidas, PAUSA, GAME OVER ni el mensaje de victoria: eso lo muestran `PlayerHud`, `GameOverModal` y el overlay de `CrtScreen`. Antes de que cargue el spritesheet solo se dibuja el fondo.

### Reglas del loop

- El loop corre con `requestAnimationFrame`; `dt` se calcula en segundos con tope `MAX_DT` (`0.05 s`). `resume()` pone `lastTime = null`, así que el primer frame tras la pausa tiene `dt = 0`.
- Sin `setTimeout` ni `setInterval`: `stepTimer` y `respawnTimer` avanzan con `dt`, así que la pausa los congela.
- `pause()` cancela el frame y desconecta el teclado (vacía las teclas sostenidas). `resume()` lo reconecta. `destroy()` cancela el loop, quita todos los listeners, suelta el `Image` con `sprites.dispose()` y es idempotente (React Strict Mode monta y desmonta dos veces en desarrollo).
- Al terminar la partida (`"gameover"` o `"win"`), `onGameOver` se llama una sola vez, se desconecta el teclado y el loop sigue redibujando hasta `destroy()`.
- Si el spritesheet no carga, el motor escribe `console.error` y `update` no avanza nunca, así que el jugador ve el fondo vacío.

## Plan de implementación

1. **Catálogo.** Aplicar `update_snake_description`. Verificación: `select id, title, category, accent, sort_order, short_description, long_description from public.games order by sort_order` muestra el texto nuevo en `snake` y las otras 7 filas sin cambios, y `get_advisors` (security) no reporta alertas nuevas. `/games/snake` muestra la descripción nueva y `/games/snake/play` sigue con SIMULAR PARTIDA.
2. **Assets.** Copiar con `cp` `fruits.png` a `public/arcade/snake/`. Verificación: `cmp` de la copia contra su original no muestra diferencias, `references/` no cambia y `http://localhost:3000/arcade/snake/fruits.png` responde `200`.
3. **Constantes y sprites.** Crear `lib/arcade/snake/constants.ts` y `sprites.ts`. Verificación: `npx tsc --noEmit` y `npm run lint` pasan, y el atlas tiene 22 entradas.
4. **Motor.** Crear `lib/arcade/snake/game.ts` con `createSnakeEngine` (estado, entrada con `pushTurn`, `resetSnake`, `spawnFruit`, pasos y colisiones, `update`, `draw`, loop y `start`/`pause`/`resume`/`destroy`) e `index.ts` con `snakeDefinition`. Todavía no se registra. Verificación: `npx tsc --noEmit` y `npm run lint` pasan.
5. **Registrar y conectar.** Agregar `snake: snakeDefinition` a `DEFINITIONS` en `lib/arcade/registry.ts`. Verificación: en `/games/snake/play` se juega una partida hasta el modal, y GUARDAR PUNTUACIÓN crea una fila en `scores` con `game_id = 'snake'` que aparece en `/games/snake`.
6. **Documentación.** Actualizar `CLAUDE.md`: el párrafo de «Proyecto» (SPEC 09 implementado y SNAKE jugable), «Rutas» → `/games/[id]/play` (ASTEROIDS, TETRIS, ARKANOID y SNAKE con motor real), «Estructura» → `lib/arcade/` (`snake/` con sus cuatro archivos y el registro con los cuatro motores) y `public/arcade/snake/` con el origen de los sprites. Verificación: `npm run format:check` pasa.

## Criterios de aceptación

**Generales**

- [ ] `npm run build`, `npm run lint` y `npx tsc --noEmit` terminan sin errores.
- [ ] Existen los cuatro archivos de `lib/arcade/snake/` (`constants.ts`, `sprites.ts`, `game.ts` e `index.ts`) y `public/arcade/snake/fruits.png`.
- [ ] `public/arcade/snake/fruits.png` es idéntico byte a byte a `references/source-assets/snake-assets/fruits.png`.
- [ ] Ningún archivo de `lib/arcade/` importa `react` ni declara `"use client"`, y ninguno toca `window`, `document` ni `Image` a nivel de módulo.
- [ ] `git status --short references/` muestra lo mismo que antes del spec (solo `references/source-assets/` sin seguimiento) y `git diff main -- references/` no muestra cambios.
- [ ] `lib/arcade/engine.ts`, `lib/arcade/shared/` y `components/game/` no cambian.
- [ ] Al jugar una partida completa en `/games/snake/play`, la consola del navegador no muestra errores ni advertencias de hidratación, ni advertencias de claves duplicadas en `StartScreen`.

**Catálogo**

- [ ] La fila `snake` de `games` tiene la `long_description` nueva, y `title`, `category`, `accent`, `sort_order` y `short_description` no cambiaron. Las otras 7 filas no cambiaron.
- [ ] `/games/snake` muestra la descripción nueva, que habla de frutas y no de píxeles.

**Flujo del Reproductor**

- [ ] `/games/snake/play` muestra el `PixelLoader` y luego `StartScreen` con «SNAKE», las dos filas de controles (`← ↑ ↓ → / W A S D` MOVER y `P` PAUSA), «PRESIONA ESPACIO» e INICIAR.
- [ ] Presionar Espacio en `StartScreen` (o hacer clic en INICIAR) inicia la partida: aparece la serpiente de 3 celdas en `(8..10, 7)` mirando a la derecha, quieta, y una fruta en una celda libre.
- [ ] El HUD muestra PUNTUACIÓN, VIDAS y NIVEL. Con la partida iniciada muestra `PUNTUACIÓN 0`, `VIDAS ■■■` y `NIVEL 01`.
- [ ] Con una ventana más baja que la página, las flechas y Espacio no hacen scroll durante la partida.
- [ ] Emulando un dispositivo táctil (`pointer: coarse`), `StartScreen` muestra «ESTE JUEGO NECESITA TECLADO» y no muestra INICIAR.

**Jugabilidad**

- [ ] La serpiente no se mueve hasta la primera pulsación de `↑`, `↓` o `→` (o `W`, `S`, `D`); `←` o `A` no inicia la partida.
- [ ] En el nivel 1 la serpiente avanza 8 celdas por segundo (una celda cada 0,125 s), una celda por paso, alineada a la grilla de 40 px.
- [ ] Los giros funcionan con las flechas y con WASD. Pulsar la dirección contraria a la actual (por ejemplo `←` yendo a la derecha) no hace nada. Pulsar dos giros seguidos entre dos pasos (por ejemplo `↑` y luego `←` yendo a la derecha) los ejecuta en pasos consecutivos; un tercer giro entre dos pasos se descarta.
- [ ] Comer una fruta suma `10 × nivel` puntos (10 en el nivel 1, 20 en el 2), alarga la serpiente 1 celda y coloca una fruta nueva en una celda libre, con un sprite distinto al de la fruta anterior.
- [ ] Ninguna fruta aparece sobre la serpiente, y las frutas se ven con proporción correcta (sin deformarse) dentro de su celda.
- [ ] Tras comer 5 frutas el HUD pasa a `NIVEL 02` y la serpiente va a 9 celdas/s; en el nivel 9 llega a 16 celdas/s y no pasa de ahí en los niveles siguientes.
- [ ] Chocar con cualquier pared quita una vida, y el HUD muestra `VIDAS ■■□`. Chocar con el propio cuerpo también.
- [ ] Ir hacia la celda que la cola acaba de dejar libre (seguir la cola, sin comer) no es un choque.
- [ ] Tras perder una vida con vidas restantes, la serpiente reaparece con largo 3 en `(8..10, 7)`, mirando a la derecha, parpadea 1,5 s sin moverse y luego avanza sola. La fruta se coloca de nuevo. La puntuación, el nivel y la velocidad se conservan.
- [ ] Las teclas pulsadas durante los 1,5 s de reaparición no giran la serpiente al reanudar.
- [ ] El canvas no dibuja puntuación, nivel, vidas, PAUSA ni GAME OVER.
- [ ] Estilo: fondo `#05050a` con cuadrícula tenue, cuerpo rosa `#ff006e` y cabeza más clara con ojos y glow; el overlay CRT se ve encima.

**Pausa**

- [ ] P y el botón PAUSA congelan el juego y muestran el overlay PAUSA; P y SEGUIR lo reanudan sin saltos (la serpiente no da un paso de más).
- [ ] Mantener una flecha durante la pausa y soltarla no deja un giro «pegado» al reanudar.
- [ ] Cambiar de pestaña o hacer clic fuera de la ventana durante la partida la deja en PAUSA.
- [ ] Los 1,5 s de reaparición no avanzan durante la pausa.

**Fin de partida y ranking**

- [ ] Perder la tercera vida abre `GameOverModal` con la misma puntuación que mostraba el HUD, y el HUD muestra `VIDAS □□□`.
- [ ] La victoria (llenar las 300 celdas) llama a `onGameOver(score)` una sola vez y abre el modal con la puntuación final. Como es casi inalcanzable, se verifica revisando el código de `update` y, si hace falta, con una grilla reducida temporal que no se conserva.
- [ ] GUARDAR PUNTUACIÓN crea exactamente una fila en `scores` con `game_id = 'snake'`, y aparece en `/games/snake` y en la pestaña SNAKE del Salón de la Fama si entra en el top 10.
- [ ] La tarjeta de SNAKE en `/games` muestra esa puntuación como MEJOR PUNTUACIÓN si es la primera.
- [ ] JUGAR DE NUEVO vuelve a `PixelLoader` y `StartScreen`, y la nueva partida arranca desde cero (serpiente quieta, `PUNTUACIÓN 0`, `VIDAS ■■■`, `NIVEL 01`).
- [ ] SALIR durante la partida lleva a `/games/snake`, y volver a jugar no deja dos loops corriendo.

**Sin regresiones**

- [ ] ASTEROIDS, TETRIS y ARKANOID se juegan igual que antes del spec (HUD, pausa, fin de partida y guardado).
- [ ] Los juegos sin motor (PAC-MAN, SPACE INVADERS, FROGGER y GALAGA) siguen mostrando SIMULAR PARTIDA.
- [ ] `/`, `/games`, `/hall-of-fame` y `/about` se ven igual que antes del spec, salvo SNAKE donde corresponda.

## Decisiones

- **Sí:** motor en TypeScript dentro del bundle, con el contrato del SPEC 05. Sin iframe.
- **Sí:** HUD y fin de partida de la plataforma; el canvas solo dibuja el tablero, la serpiente y la fruta.
- **Sí:** juego diseñado desde cero, porque no hay referencia en `references/started-games/`; los sprites de `snake-assets` son el único insumo. Este spec fija todas las constantes.
- **Sí:** grilla de 20×15 celdas de 40 px. **No:** 40×30 de 20 px (las frutas quedarían diminutas) ni una franja superior de indicadores. Lo eligió el usuario.
- **Sí:** velocidad de 8 celdas/s con +1 por nivel y tope de 16. **No:** 6 con tope 14 ni 10 con +1,5 y tope 20. Lo eligió el usuario.
- **Sí:** 3 vidas; al chocar, la serpiente reaparece en el centro con largo 3, conservando puntos, nivel y frutas comidas, con 1,5 s de parpadeo y sin invencibilidad. **No:** conservar el largo (el centro podría quedar ocupado) ni invencibilidad tipo Asteroids. Lo eligió el usuario.
- **Sí:** 10 × nivel puntos por fruta. **No:** puntos fijos ni fruta bonus dorada. Lo eligió el usuario.
- **Sí:** serpiente neón rosa (`--neon-pink`) sobre cuadrícula tenue, con frutas de sprite. **No:** serpiente verde ni cuerpo coloreado por fruta. Lo eligió el usuario.
- **Sí:** las 22 frutas de la fila pixel-art, al azar sin repetir la anterior, solo cosméticas. **No:** un subconjunto fijo ni una fruta por nivel. Lo eligió el usuario.
- **Sí:** flechas y WASD, con cola de 2 giros y sin reversa de 180°. **No:** solo flechas sin cola (se pierden giros a alta velocidad). Lo eligió el usuario.
- **Sí:** la cola se libera en el mismo paso, así que seguirla no es un choque; el cuerpo solo bloquea si se come en ese paso. Es la regla estándar del clásico.
- **Sí:** la partida empieza quieta hasta la primera flecha, y tras perder una vida hay 1,5 s de espera. **No:** avance inmediato a la derecha. Lo eligió el usuario.
- **Sí:** llenar las 300 celdas es victoria y termina con `onGameOver` igual que la derrota. **No:** contarlo como derrota. Lo eligió el usuario.
- **Sí:** corregir `long_description` del catálogo con `update_snake_description`. **No:** dejar «come los píxeles». Lo eligió el usuario.
- **No:** sonido. No hay audio en `snake-assets` y el SPEC 05 lo dejó fuera. Lo eligió el usuario.
- **No:** ampliar el contrato ni tocar `keyboard.ts`. El juego tiene vidas y nivel, el canvas es 4:3 y las teclas de letras no necesitan `preventDefault`.
- **No:** copiar `sprites.js`. Es un atlas para `window`; sus coordenadas se portan a `sprites.ts`.

## Riesgos

| Riesgo                                                                                         | Mitigación                                                                                                                                                                   |
| ---------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| En desarrollo, React Strict Mode monta el efecto dos veces y deja dos loops corriendo.         | `destroy()` cancela el `requestAnimationFrame` y quita todos los listeners. Hay un criterio de «volver a jugar no deja dos loops».                                           |
| Acceder a `window`, `document` o `Image` al importar `lib/arcade/snake/` rompe el prerender.   | La convención obliga a tocar el DOM solo dentro de `create()`. `npm run build` lo detecta.                                                                                   |
| El salto de `dt` al reanudar mueve la serpiente de golpe.                                      | `resume()` pone `lastTime = null` y el tope de `dt` es de 50 ms.                                                                                                             |
| La pulsación de Espacio que inicia la partida también actúa en el juego.                       | Espacio no tiene acción en SNAKE; además `consume()` ignora `event.repeat`.                                                                                                  |
| Una pulsación que llega durante la reaparición gira la serpiente sin que el jugador lo espere. | Las teclas se descartan durante `"respawning"` y la cola se vacía al reaparecer. Hay un criterio de aceptación.                                                              |
| Dos giros rápidos se pierden y el jugador muere «injustamente» a 16 celdas/s.                  | Cola de 2 giros. Los giros de 180° se descartan comparando con la última dirección prevista, no con la actual, para que `↑` y `←` seguidos yendo a la derecha funcionen.     |
| Las frutas se ven deformadas porque los recortes tienen anchos distintos (110 a 170 px).       | `drawFruit` escala con `min(FRUIT_BOX / sw, FRUIT_BOX / sh)` y las centra. Hay un criterio de aceptación.                                                                    |
| `fruits.png` (unos 580 KB) tarda en cargar y el juego arranca con la fruta invisible.          | `update` no avanza hasta que `isReady()`; hasta entonces se ve el fondo. La ruta es absoluta (`/arcade/snake/fruits.png`), verificada con `npm run build` y `npm run start`. |
| Una puntuación mayor que 9.999.999 hace fallar el guardado por el `CHECK` de `scores`.         | `SCORE_MAX` en el motor. En la práctica no se alcanza (menos de 90.000 puntos con el tablero lleno).                                                                         |
| Los sprites de `fruits.png` son de terceros (The Spriters Resource, «Google Snake Game»).      | Se copian sin modificar y `CLAUDE.md` anota el origen que declara `sprites.js`.                                                                                              |

## Lo que **no** entra en este spec

- Sonido.
- Frutas bonus, power-ups, obstáculos, atravesar bordes, modos de juego y niveles con mapas distintos.
- Las otras filas de `fruits.png` y las frutas fuera del atlas de `sprites.js`.
- Controles táctiles o de mouse.
- Cambios de jugabilidad respecto de lo acordado.
- Antitrampas y topes por juego.
- Cambios en la Biblioteca, el Home o el Salón de la Fama más allá de la fila del catálogo.
- Tests automatizados.

Si alguna de estas llega, va en su propio spec.
