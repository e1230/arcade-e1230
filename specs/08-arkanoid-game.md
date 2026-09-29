# SPEC 08 — ARKANOID jugable en el Reproductor

> **Estado:** Implementado
> **Depende de:** SPEC 05, SPEC 06, SPEC 07
> **Fecha:** 2026-09-28
> **Objetivo:** Portar a TypeScript el ARKANOID de `references/started-games/04-arkanoid/` y hacerlo jugable en `/games/arkanoid/play`, con su puntuación en el ranking global.

## Por qué existe este spec

ARKANOID ya está en el catálogo (`games`, `sort_order` 1), pero su Reproductor muestra el placeholder IFRAME SANDBOX y SIMULAR PARTIDA. `references/started-games/04-arkanoid/` tiene un Arkanoid completo en canvas 2D de 800×600 (`game.js` de 268 líneas, `levels.js` de 50 y `assets/spritesheet.js`, sin dependencias) con un spritesheet y dos sonidos. Este spec lo porta a TypeScript con el contrato del SPEC 05 y lo monta en el gabinete CRT. La puntuación final entra en el ranking global del SPEC 06 sin tocar su código.

Es el primer juego con imágenes y con audio. El spritesheet y los dos `.mp3` se copian a `public/arcade/arkanoid/` y se cargan dentro de `create()`, como pide la guía de la plataforma. También es el primer juego que se controla con el mouse: la paleta sigue el cursor sobre el canvas, además de las flechas. El overlay de scanlines del CRT ya es `pointer-events-none`, así que los eventos del mouse llegan al canvas sin cambios.

La plataforma ya cubre todo lo demás. El canvas de la referencia es 800×600, o sea 4:3, y el juego tiene vidas y niveles, así que **el contrato no se amplía**: `engine.ts`, `PlayerView`, `PlayerHud`, `StartScreen` y los demás componentes compartidos no cambian. Lo que sí cambia es la descripción del catálogo, que promete cápsulas, láseres y multibola que la referencia no tiene.

## Alcance

**Incluye:**

- **Catálogo:** `long_description` de `arkanoid` corregida con la migración `update_arkanoid_description` (sin cápsulas; con los cinco niveles y la velocidad creciente). `short_description` no cambia.
- **Assets:** copia, sin modificar, de `spritesheet-breakout.png`, `ball-bounce.mp3` y `break-sound.mp3` a `public/arcade/arkanoid/`.
- **Port a TypeScript** en `lib/arcade/arkanoid/`, con la misma jugabilidad que `game.js`: paleta de 81 px a 400 px/s, bola de 16 px que sale sola con velocidad `(200, −300) × multiplicador del nivel`, rebotes en paredes y paleta (sin ángulo), un bloque por frame, 10 puntos por bloque, 3 vidas, 5 niveles con patrones fijos (`levels.js`) y explosión de 4 frames al romper un bloque.
- **Estilo de sprites:** bloques, paleta, bola y explosiones se dibujan con el spritesheet de la referencia.
- **Sonido:** `ball-bounce.mp3` al rebotar en paredes y paleta, y `break-sound.mp3` al romper un bloque. El audio se crea en `create()`, se pausa en `pause()` y se detiene en `destroy()`; si `play()` rechaza la promesa, se ignora.
- **Entrada:** `←`/`→` y mouse sobre el canvas, con escalado por `getBoundingClientRect`.
- **HUD de la plataforma:** PUNTUACIÓN, VIDAS y NIVEL salen de los callbacks. El canvas no dibuja `Score`, `Nivel`, las bolas de vidas, PAUSA, GAME OVER ni el mensaje de victoria.
- **Fin de partida:** al perder la tercera vida, o al limpiar el nivel 5, se llama `onGameOver(score)` una vez y se abre `GameOverModal` con la puntuación. Derrota y victoria terminan igual.
- **Registro:** `arkanoid` se agrega a `DEFINITIONS`, así que `/games/arkanoid/play` deja de mostrar SIMULAR PARTIDA.
- **Ranking:** la puntuación final se guarda en `scores` con el flujo existente de `GameOverModal`, sin cambios en el código del ranking.
- **Documentación:** actualizar `CLAUDE.md`, con el crédito de autoría del spritesheet.

**Fuera de alcance (para futuros specs):**

- El selector de nivel de la pausa de la referencia (botones 1–5 dibujados en el canvas): la pausa es la de la plataforma y saltar de nivel falsearía el ranking.
- Power-ups y cápsulas (ensanchar, láseres, multibola). La referencia no los tiene, y la descripción del catálogo deja de prometerlos.
- Cambios de jugabilidad respecto de la referencia: rebote con ángulo según el punto de impacto de la paleta, saque manual de la bola, colisiones por lado del bloque, bloques resistentes o más de 5 niveles.
- Controles táctiles. En un dispositivo táctil `StartScreen` sigue mostrando «ESTE JUEGO NECESITA TECLADO».
- La tecla Escape como pausa (la pausa es de `PlayerView`, con P) y la persistencia del progreso.
- Música de fondo, control de volumen y mute.
- Validación antitrampas o topes de puntuación por juego.
- Cambios en la Biblioteca, el Home o el Salón de la Fama más allá de lo que da la fila del catálogo.
- Tests automatizados.
- Modificar `references/` o los specs 01 a 07.

## Rutas y archivos

```
public/arcade/arkanoid/
  spritesheet-breakout.png        (nuevo) copia de references/started-games/04-arkanoid/assets/
  ball-bounce.mp3                 (nuevo) copia de references/started-games/04-arkanoid/assets/sounds/
  break-sound.mp3                 (nuevo) copia de references/started-games/04-arkanoid/assets/sounds/
lib/
  arcade/registry.ts              (cambia) + arkanoid
  arcade/arkanoid/constants.ts    (nuevo) tamaños, velocidades, puntos, tiempos, SCORE_MAX, COLORS y rutas de assets
  arcade/arkanoid/levels.ts       (nuevo) BlockColor, LevelBlock, Level y LEVELS (5 niveles)
  arcade/arkanoid/sprites.ts      (nuevo) tablas de sprites y explosiones, loadSprites y funciones de dibujo
  arcade/arkanoid/sound.ts        (nuevo) createSounds: rebote y rotura de bloque
  arcade/arkanoid/game.ts         (nuevo) createArkanoidEngine: estado, entrada, física, update, draw y loop
  arcade/arkanoid/index.ts        (nuevo) arkanoidDefinition: GameDefinition
CLAUDE.md                         (cambia) proyecto, rutas y estructura
```

Sin cambios: `lib/arcade/engine.ts`, `lib/arcade/shared/`, `components/game/` (`PlayerView`, `PlayerHud`, `GameCanvas`, `StartScreen`, `GameOverModal`, `CrtScreen`, `PixelLoader`), `app/games/[id]/play/page.tsx`, `app/globals.css`, `lib/games.ts`, `lib/catalog.ts`, `lib/leaderboard.ts`, `lib/leaderboard-client.ts`, `DetailLeaderboard`, `HallOfFameTable` y `lib/supabase/database.types.ts`.

Base de datos (proyecto `xanuntuhanyubcqiudlp`, con `apply_migration` del MCP de Supabase): migración `update_arkanoid_description`. No cambia el esquema, así que los tipos no se regeneran.

Convenciones:

- Las de `lib/arcade/` del SPEC 05: sin React ni `"use client"`, DOM (`Image`, `Audio`, `window`) solo dentro de `create()` o de funciones que este llama, estado en el cierre de `createArkanoidEngine` y loop por `dt` sin `setTimeout` ni `setInterval`.
- `levels.ts` es datos puros. `sprites.ts` y `sound.ts` no guardan estado de módulo: cada `loadSprites()` y `createSounds()` devuelve su propio objeto con su propio `Image` y `Audio`.
- `createKeyboard` y `rand` se importan de `lib/arcade/shared/`; no se copian dentro de `lib/arcade/arkanoid/`.
- Los assets se **copian** con `cp` (no se mueven) y la referencia queda intacta.
- Código en inglés, comentarios en español latinoamericano, módulos sin JSX en kebab-case.

## Modelo de datos

### Catálogo — migración `update_arkanoid_description`

```sql
update public.games
set long_description = 'Controla la nave Vaus y devuelve la bola de energía para destruir cada muro de ladrillos. Cada fase tiene un patrón distinto y la bola va más rápido que en la anterior. Tienes tres vidas: si la bola cae, pierdes una. Limpia las cinco fases para completar el juego.'
where id = 'arkanoid';
```

Fila resultante (solo cambia `long_description`):

| Campo               | Valor                                                                                                                                                                                                                                                                    |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `id`                | `arkanoid`                                                                                                                                                                                                                                                               |
| `title`             | `ARKANOID`                                                                                                                                                                                                                                                               |
| `category`          | `Clásicos`                                                                                                                                                                                                                                                               |
| `accent`            | `cyan`                                                                                                                                                                                                                                                                   |
| `sort_order`        | `1`                                                                                                                                                                                                                                                                      |
| `short_description` | Rompe todos los ladrillos con tu nave y la bola.                                                                                                                                                                                                                         |
| `long_description`  | Controla la nave Vaus y devuelve la bola de energía para destruir cada muro de ladrillos. Cada fase tiene un patrón distinto y la bola va más rápido que en la anterior. Tienes tres vidas: si la bola cae, pierdes una. Limpia las cinco fases para completar el juego. |

### Definición de ARKANOID — `lib/arcade/arkanoid/index.ts`

- `width: 800`, `height: 600` (4:3, igual que el CRT y que el canvas de la referencia). No hay que encuadrar nada.
- Sin campo `hud`: el HUD muestra PUNTUACIÓN, VIDAS, NIVEL y JUGADOR.
- `controls`, en dos filas. Cada `action` debe ser única porque `StartScreen` la usa como `key` de React, por eso el mouse comparte fila con las flechas:

| `keys`        | `action` |
| ------------- | -------- |
| `← → / MOUSE` | MOVER    |
| `P`           | PAUSA    |

### Assets — `public/arcade/arkanoid/`

| Destino                                           | Origen                                                                 |
| ------------------------------------------------- | ---------------------------------------------------------------------- |
| `public/arcade/arkanoid/spritesheet-breakout.png` | `references/started-games/04-arkanoid/assets/spritesheet-breakout.png` |
| `public/arcade/arkanoid/ball-bounce.mp3`          | `references/started-games/04-arkanoid/assets/sounds/ball-bounce.mp3`   |
| `public/arcade/arkanoid/break-sound.mp3`          | `references/started-games/04-arkanoid/assets/sounds/break-sound.mp3`   |

La copia es byte a byte (`cmp` sin diferencias). El PNG trae dentro el crédito visible «Made by Petraheim»: no se recorta ni se edita, y `CLAUDE.md` deja anotada la autoría. Rutas de carga con `/` inicial: `/arcade/arkanoid/…`.

### Constantes — `lib/arcade/arkanoid/constants.ts`

Los valores de jugabilidad se copian de `game.js` sin cambios. Los tiempos pasan de milisegundos a segundos.

| Constante                             | Valor                                                                   |
| ------------------------------------- | ----------------------------------------------------------------------- |
| `WIDTH` / `HEIGHT`                    | `800` / `600`                                                           |
| `PADDLE_SPEED`                        | `400` px/s                                                              |
| `PADDLE_W` / `PADDLE_H` / `PADDLE_Y`  | `81` / `14` / `560` (el sprite de 162×14 se dibuja a la mitad de ancho) |
| `BALL_SIZE`                           | `16`                                                                    |
| `PADDLE_BOUNCE_TOLERANCE`             | `8` px (margen bajo la cara superior de la paleta para rebotar)         |
| `BLOCK_W` / `BLOCK_H`                 | `64` / `24`                                                             |
| `BLOCK_COLS`                          | `10`                                                                    |
| `BLOCKS_ORIGIN_X` / `BLOCKS_ORIGIN_Y` | `(WIDTH − BLOCK_COLS × BLOCK_W) / 2 = 80` / `80`                        |
| `BASE_BALL_VX` / `BASE_BALL_VY`       | `200` / `−300` px/s, multiplicados por `speed` del nivel                |
| `BLOCK_POINTS`                        | `10`                                                                    |
| `INITIAL_LIVES`                       | `3`                                                                     |
| `EXPLOSION_DURATION`                  | `0.15 s` (`150 ms` en la referencia)                                    |
| `EXPLOSION_FRAME_COUNT`               | `4`                                                                     |
| `SCORE_MAX`                           | `9_999_999`                                                             |
| `MAX_DT`                              | `0.05 s`                                                                |

Constantes nuevas, que no están en la referencia:

| Constante                              | Valor                                                                       |
| -------------------------------------- | --------------------------------------------------------------------------- |
| `SPRITESHEET_URL`                      | `"/arcade/arkanoid/spritesheet-breakout.png"`                               |
| `BOUNCE_SOUND_URL` / `BREAK_SOUND_URL` | `"/arcade/arkanoid/ball-bounce.mp3"` / `"/arcade/arkanoid/break-sound.mp3"` |

Color del canvas (espejo de un token de `app/globals.css`, porque el canvas no puede leer clases de Tailwind):

```ts
export const COLORS = {
  background: "#05050a", // --deep
} as const;
```

La referencia rellena el fondo con `#000`. El port usa `--deep` para que el canvas se funda con el gabinete, como Asteroids y Tetris. Todo lo demás se dibuja con sprites, así que no hay más colores.

### Niveles — `lib/arcade/arkanoid/levels.ts`

```ts
export type BlockColor =
  "gray" | "red" | "yellow" | "cyan" | "magenta" | "hotpink" | "green";

export interface LevelBlock {
  col: number; // 0 a 9
  row: number; // 0 a 5
  color: BlockColor;
}

export interface Level {
  speed: number; // multiplicador de BASE_BALL_VX y BASE_BALL_VY
  blocks: LevelBlock[];
}

export const LEVELS: Level[]; // 5 niveles, copiados de levels.js
```

Los cinco patrones se generan con la misma lógica de `levels.js`. Las filas van de arriba (`row 0`) hacia abajo, y las columnas de izquierda a derecha, en ese orden de recorrido (fila por fila), porque el orden del arreglo decide qué bloque se golpea primero cuando la bola toca dos a la vez.

| Nivel | `speed` | Patrón                                                                                                                       | Colores                                                           | Bloques |
| ----- | ------- | ---------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------- | ------- |
| 1     | `1.00`  | Parrilla completa de 10×6                                                                                                    | Por fila: `red`, `yellow`, `cyan`, `magenta`, `hotpink`, `green`  | 60      |
| 2     | `1.10`  | Pirámide: por fila, columnas `pyStart[row]` a `pyEnd[row]` con `pyStart = [4, 3, 2, 1, 0, 0]` y `pyEnd = [5, 6, 7, 8, 9, 9]` | Por fila: `gray`, `cyan`, `hotpink`, `yellow`, `magenta`, `green` | 40      |
| 3     | `1.21`  | Tablero de ajedrez: solo donde `(col + row)` es par                                                                          | `yellow` en las filas 0 a 2 y `magenta` en las filas 3 a 5        | 30      |
| 4     | `1.33`  | Parrilla sin las columnas de `gaps4[row]`, con huecos fijos por fila (ver abajo)                                             | Por fila: `cyan`, `magenta`, `green`, `yellow`, `hotpink`, `red`  | 39      |
| 5     | `1.46`  | Marco (`col` 0 o 9, `row` 0 o 5) más cruz (`col` 4 o `row` 2)                                                                | `cyan` en el marco y `hotpink` en la cruz que no toca el marco    | 39      |

Huecos del nivel 4, por fila: `[2, 5, 8]`, `[0, 4, 7, 9]`, `[1, 3, 6]`, `[2, 5, 8, 9]`, `[0, 4, 7]` y `[1, 3, 6, 9]`. Son fijos, no al azar: el spec 03 de la referencia habla de huecos al azar, pero `levels.js` los tiene escritos. Total: 60 + 40 + 30 + 39 + 39 = **208 bloques**, o sea **2.080 puntos** como máximo en una partida completa.

### Sprites — `lib/arcade/arkanoid/sprites.ts`

```ts
export interface Sprites {
  isReady(): boolean; // false hasta que carga la imagen
  drawBlock(
    ctx: CanvasRenderingContext2D,
    color: BlockColor,
    x: number,
    y: number,
    w: number,
    h: number,
  ): void;
  drawExplosion(
    ctx: CanvasRenderingContext2D,
    color: BlockColor,
    frame: number,
    x: number,
    y: number,
    w: number,
    h: number,
  ): void;
  drawPaddle(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    w: number,
    h: number,
  ): void;
  drawBall(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    w: number,
    h: number,
  ): void;
  dispose(): void; // suelta los callbacks de carga
}

export function loadSprites(): Sprites; // crea el Image y lo carga desde SPRITESHEET_URL
```

Recortes del spritesheet (`sx`, `sy`, `sw`, `sh`), copiados de `assets/spritesheet.js`:

| Sprite           | Recorte            |
| ---------------- | ------------------ |
| paleta           | `32, 112, 162, 14` |
| bola             | `32, 32, 16, 16`   |
| bloque `gray`    | `32, 288, 32, 16`  |
| bloque `red`     | `32, 176, 32, 16`  |
| bloque `yellow`  | `32, 240, 32, 16`  |
| bloque `cyan`    | `32, 192, 32, 16`  |
| bloque `magenta` | `32, 224, 32, 16`  |
| bloque `hotpink` | `32, 256, 32, 16`  |
| bloque `green`   | `32, 208, 32, 16`  |

Explosiones: 4 frames por color, todos de `32×16`, con `sx` = `256`, `288`, `320` y `352` y `sy` según el color: `red` 176, `cyan` 192, `green` 208, `magenta` 224, `yellow` 240 y `hotpink` 256. **`gray` usa las mismas coordenadas que `red` (`sy` 176)**, igual que la referencia: es un descuido suyo que el port conserva para no cambiar el aspecto.

Bloques y explosiones se dibujan escalados a `BLOCK_W × BLOCK_H` (64×24); la paleta a `PADDLE_W × PADDLE_H` (81×14) y la bola a `BALL_SIZE × BALL_SIZE`. El port no toca `imageSmoothingEnabled`, igual que la referencia. Mientras `isReady()` sea `false`, las funciones de dibujo no hacen nada.

### Sonido — `lib/arcade/arkanoid/sound.ts`

```ts
export type SoundName = "bounce" | "break";

export interface Sounds {
  play(name: SoundName): void;
  pause(): void;
  dispose(): void;
}

export function createSounds(): Sounds; // crea los dos Audio con BOUNCE_SOUND_URL y BREAK_SOUND_URL
```

- `play` clona el `Audio` base con `cloneNode()` para poder solapar varios rebotes, como la referencia, y lo guarda en un conjunto de sonidos activos hasta que termina (`ended`). El `play()` del clon captura el rechazo de la promesa y lo ignora (el navegador puede bloquear la reproducción).
- `pause()` pausa y descarta los sonidos activos. Duran menos de un segundo, así que no se reanudan.
- `dispose()` hace lo mismo que `pause()` y suelta los `Audio` base. Debe ser idempotente y `play` no hace nada después de él.

### Estado interno de la partida — `lib/arcade/arkanoid/game.ts`

```ts
type Phase = "playing" | "gameover" | "win"; // game.js usa gameState y el flag isPaused; la pausa ahora es de la plataforma

interface Paddle {
  x: number; // el resto (y, w, h) sale de constants.ts
}

interface Ball {
  x: number;
  y: number;
  vx: number;
  vy: number;
}

interface Block {
  x: number;
  y: number;
  color: BlockColor;
  alive: boolean;
}

interface Explosion {
  x: number;
  y: number;
  color: BlockColor;
  elapsed: number; // s desde que se rompió el bloque
}

// Estado encapsulado en el cierre de createArkanoidEngine (no se exporta)
interface ArkanoidState {
  phase: Phase;
  paddle: Paddle;
  ball: Ball;
  blocks: Block[];
  explosions: Explosion[];
  score: number;
  lives: number;
  level: number; // 1 a 5
}
```

### Entrada

- **Teclado:** `createKeyboard()` de `lib/arcade/shared/keyboard.ts`, sin cambios. Su conjunto de teclas bloqueadas ya incluye las flechas y Espacio. Se usa solo `isDown("ArrowLeft")` e `isDown("ArrowRight")`; el juego no tiene acciones de un solo frame.
- **Mouse:** un listener `mousemove` en el `canvas`. Convierte la posición con `rect = canvas.getBoundingClientRect()` y `mouseX = (event.clientX − rect.left) × (canvas.width / rect.width)`, y pone `paddle.x = clamp(mouseX − PADDLE_W / 2, 0, WIDTH − PADDLE_W)`.
- El listener del mouse se conecta en `start()` y `resume()`, y se quita en `pause()`, `destroy()` y al terminar la partida, igual que el teclado. Mientras la partida está en pausa, el overlay PAUSA cubre el canvas y el mouse no mueve la paleta.
- Escape no hace nada: la pausa es de `PlayerView`, con P.

### Orden de `update`

`update(dt)` no avanza hasta que `sprites.isReady()`; hasta entonces no se llama a ningún callback extra y el canvas muestra solo el fondo. En `"playing"`, cada frame procesa en este orden, igual que `update` de `game.js`. Si una acción termina la partida, `update` sale sin procesar lo que sigue:

1. **Paleta:** `←` resta `PADDLE_SPEED × dt` a `paddle.x` con piso en `0`, y `→` suma con techo en `WIDTH − PADDLE_W`. Si ambas están sostenidas se aplican las dos y se anulan.
2. **Bola:** `ball.x += vx × dt` y `ball.y += vy × dt`.
3. **Paredes:** a la izquierda (`x <= 0`) se fija `x = 0` y `vx = |vx|`; a la derecha (`x + BALL_SIZE >= WIDTH`) se fija `x = WIDTH − BALL_SIZE` y `vx = −|vx|`; arriba (`y <= 0`) se fija `y = 0` y `vy = |vy|`. Cada rebote reproduce `"bounce"`. No hay rebote abajo.
4. **Paleta (rebote):** si `vy > 0`, la bola se solapa en horizontal con la paleta (`x + BALL_SIZE > paddle.x` y `x < paddle.x + PADDLE_W`) y `y + BALL_SIZE >= PADDLE_Y` y `y + BALL_SIZE <= PADDLE_Y + PADDLE_H + PADDLE_BOUNCE_TOLERANCE`, entonces `y = PADDLE_Y − BALL_SIZE`, `vy = −|vy|` y suena `"bounce"`. El rebote no depende del punto de impacto y `vx` no cambia.
5. **Bloques:** se recorre `blocks` en orden; el primero vivo que se solapa con la bola (AABB) se rompe y **se sale del recorrido**, así que se rompe un bloque por frame como máximo. Al romperlo: `alive = false`, se agrega una explosión en su posición con `elapsed = 0`, `score = min(SCORE_MAX, score + BLOCK_POINTS)`, se emite `onScore(score)`, `vy = −vy` (aunque el golpe sea de costado) y suena `"break"`. Si ya no quedan bloques vivos:
   - Si `level < 5`, se carga el nivel siguiente (ver `loadLevel`).
   - Si `level == 5`, `phase = "win"`, se desconecta la entrada y se llama `onGameOver(score)` una sola vez.
6. **Explosiones:** cada una suma `dt` a `elapsed`, y se descartan las que llegan a `EXPLOSION_DURATION`.
7. **Bola perdida:** si `ball.y > HEIGHT`, `lives −= 1` y se emite `onLives(lives)`. Con `lives <= 0` se fija `lives = 0`, `phase = "gameover"`, se desconecta la entrada y se llama `onGameOver(score)` una sola vez. Si no, `resetBall()`.

`loadLevel(n)`: `level = n`, se arma `blocks` desde `LEVELS[n − 1]` (`x = BLOCKS_ORIGIN_X + col × BLOCK_W`, `y = BLOCKS_ORIGIN_Y + row × BLOCK_H`, `alive = true`), se vacía `explosions`, se llama `resetBall()` y se emite `onLevel(n)`. La paleta no se recoloca.

`resetBall()`: `ball.x = paddle.x + (PADDLE_W − BALL_SIZE) / 2`, `ball.y = PADDLE_Y − BALL_SIZE`, `vx = BASE_BALL_VX × speed` y `vy = BASE_BALL_VY × speed`, con el `speed` del nivel actual. La bola sale sola y siempre hacia la derecha, como en la referencia, tanto al empezar un nivel como tras perder una vida.

### Dibujo — `game.ts`

Orden en cualquier fase: fondo (`COLORS.background`), bloques vivos, explosiones, paleta y bola. El fotograma de una explosión es `min(floor(elapsed / EXPLOSION_DURATION × EXPLOSION_FRAME_COUNT), EXPLOSION_FRAME_COUNT − 1)`. El canvas no dibuja `Score`, `Nivel`, las bolas de vidas, PAUSA, GAME OVER ni el mensaje de victoria: eso lo muestran `PlayerHud`, `GameOverModal` y el overlay de `CrtScreen`. Antes de que cargue el spritesheet solo se dibuja el fondo.

### Reglas del port que difieren de `game.js`

- `start()` arma el estado, emite `onScore(0)`, `onLives(3)` y `onLevel(1)`, conecta el teclado y el mouse, y arranca el loop con `lastTime = null`. `loadLevel(1)` del arranque no emite `onLevel` por su cuenta: lo hace `start()`.
- `onScore` se emite cada vez que cambia `score`, `onLives` solo al perder una vida y `onLevel` solo al pasar de nivel.
- El canvas ya no dibuja el HUD (`Score`, `Nivel` y las bolas de vidas) ni los overlays de GAME OVER, victoria y pausa.
- Se quitan la pausa con P o Escape (la pausa es de `PlayerView`, que llama a `pause()`/`resume()`), el selector de nivel con sus botones y el `click` sobre el canvas, y `index.html` con su estilo.
- Los controles salen de `definition.controls` en `StartScreen`.
- El rebote y la rotura de bloques suenan igual que en la referencia. Se agrega la pausa y la limpieza del audio en `pause()` y `destroy()`.
- `dt` tiene tope `MAX_DT` (la referencia no lo tiene). `resume()` pone `lastTime = null`, así que el primer frame tras la pausa tiene `dt = 0`. La velocidad de la bola llega a 438 px/s de vertical en el nivel 5, así que con `MAX_DT = 0.05` recorre como máximo 22 px por frame y no atraviesa ni un bloque (24 px) ni la paleta.
- Los 150 ms de la explosión pasan a `EXPLOSION_DURATION = 0.15` s, que avanza con `dt` en lugar de `dt × 1000`.
- El teclado del motor sustituye a los `keydown`/`keyup` directos del documento. Las flechas se leen con `isDown`, así que la pausa y el fin de partida las ignoran.
- Fin de partida: al perder la tercera vida o limpiar el nivel 5, `phase` pasa a `"gameover"` o `"win"`, se desconectan el teclado y el mouse y se llama `onGameOver(score)` una sola vez. El loop sigue corriendo hasta `destroy()`, y a diferencia de la referencia (que congela todo) las explosiones en curso terminan de animarse, para que la última rotura no quede a medias detrás del modal. Con `"gameover"` o `"win"`, `update` solo avanza las explosiones.
- La puntuación se suma con `Math.min(SCORE_MAX, score + BLOCK_POINTS)`. En la práctica el tope no se alcanza: una partida completa suma 2.080.
- Estilo: el fondo pasa de `#000` a `--deep` (`#05050a`).
- Si el spritesheet no carga, el port escribe `console.error` (como la referencia) y `update` no avanza nunca, así que el jugador ve el fondo vacío.

## Plan de implementación

1. **Catálogo.** Aplicar `update_arkanoid_description`. Verificación: `select id, title, category, accent, sort_order, short_description, long_description from public.games order by sort_order` muestra el texto nuevo en `arkanoid` y las otras 7 filas sin cambios, y `get_advisors` (security) no reporta alertas nuevas. `/games/arkanoid` muestra la descripción nueva y `/games/arkanoid/play` sigue con SIMULAR PARTIDA.
2. **Assets.** Copiar con `cp` los tres archivos a `public/arcade/arkanoid/`. Verificación: `cmp` de cada copia contra su original no muestra diferencias, `git diff main -- references/` no muestra cambios, y `http://localhost:3000/arcade/arkanoid/spritesheet-breakout.png` responde `200`.
3. **Constantes y niveles.** Crear `lib/arcade/arkanoid/constants.ts` y `levels.ts`. Verificación: `npx tsc --noEmit` pasa y `LEVELS` tiene 5 niveles con 60, 40, 30, 39 y 39 bloques.
4. **Sprites y sonido.** Crear `lib/arcade/arkanoid/sprites.ts` y `sound.ts`. Verificación: `npx tsc --noEmit` y `npm run lint` pasan.
5. **Motor.** Crear `lib/arcade/arkanoid/game.ts` con `createArkanoidEngine` (estado, teclado y mouse, física, `loadLevel`, `resetBall`, `update`, `draw`, loop y `start`/`pause`/`resume`/`destroy`) e `index.ts` con `arkanoidDefinition`. Todavía no se registra. Verificación: `npx tsc --noEmit` y `npm run lint` pasan.
6. **Registrar y conectar.** Agregar `arkanoid: arkanoidDefinition` a `DEFINITIONS` en `lib/arcade/registry.ts`. Verificación: en `/games/arkanoid/play` se juega una partida hasta el modal, y GUARDAR PUNTUACIÓN crea una fila en `scores` con `game_id = 'arkanoid'` que aparece en `/games/arkanoid`.
7. **Documentación.** Actualizar `CLAUDE.md`: el párrafo de «Proyecto» (SPEC 08 implementado y ARKANOID jugable), «Rutas» → `/games/[id]/play` (ASTEROIDS, TETRIS y ARKANOID con motor real) y «Estructura» → `lib/arcade/` (`arkanoid/` con sus seis archivos y el registro con `asteroids`, `tetris` y `arkanoid`), más los assets de `public/arcade/arkanoid/` con el crédito de autoría del spritesheet («Made by Petraheim», visible en el propio PNG). Verificación: `npm run format:check` pasa.

## Criterios de aceptación

**Generales**

- [ ] `npm run build`, `npm run lint` y `npx tsc --noEmit` terminan sin errores.
- [ ] Existen los seis archivos de `lib/arcade/arkanoid/` (`constants.ts`, `levels.ts`, `sprites.ts`, `sound.ts`, `game.ts` e `index.ts`) y los tres de `public/arcade/arkanoid/`.
- [ ] Cada archivo de `public/arcade/arkanoid/` es idéntico byte a byte a su original en `references/started-games/04-arkanoid/assets/`.
- [ ] Ningún archivo de `lib/arcade/` importa `react` ni declara `"use client"`, y ninguno toca `window`, `document`, `Image` ni `Audio` a nivel de módulo.
- [ ] `git diff main -- references/` no muestra cambios.
- [ ] `lib/arcade/engine.ts`, `lib/arcade/shared/` y `components/game/` no cambian.
- [ ] Al jugar una partida completa en `/games/arkanoid/play`, la consola del navegador no muestra errores ni advertencias de hidratación, ni advertencias de claves duplicadas en `StartScreen`.

**Catálogo**

- [ ] La fila `arkanoid` de `games` tiene la `long_description` nueva, y `title`, `category`, `accent`, `sort_order` y `short_description` no cambiaron. Las otras 7 filas no cambiaron.
- [ ] `/games/arkanoid` muestra la descripción nueva, que no menciona cápsulas, láseres ni multibola.

**Flujo del Reproductor**

- [ ] `/games/arkanoid/play` muestra el `PixelLoader` y luego `StartScreen` con «ARKANOID», las dos filas de controles (`← → / MOUSE` MOVER y `P` PAUSA), «PRESIONA ESPACIO» e INICIAR.
- [ ] Presionar Espacio en `StartScreen` inicia la partida: aparecen los bloques, la paleta centrada abajo y la bola sale sola hacia arriba y a la derecha.
- [ ] Hacer clic en INICIAR inicia la partida.
- [ ] El HUD muestra PUNTUACIÓN, VIDAS y NIVEL. Con la partida iniciada muestra `PUNTUACIÓN 0`, `VIDAS ■■■` y `NIVEL 01`.
- [ ] Con una ventana más baja que la página, las flechas no hacen scroll durante la partida.
- [ ] Emulando un dispositivo táctil (`pointer: coarse`), `StartScreen` muestra «ESTE JUEGO NECESITA TECLADO» y no muestra INICIAR.

**Jugabilidad (idéntica a la referencia)**

- [ ] El nivel 1 muestra una parrilla de 10×6 bloques de 64×24 px, centrada en horizontal, con las filas en el orden rojo, amarillo, cian, magenta, rosa y verde. Los sprites son los del spritesheet y el fondo es `#05050a`.
- [ ] `←` y `→` mueven la paleta a unos 400 px/s hasta los bordes del canvas, sin salirse. Sostener ambas la deja quieta.
- [ ] Mover el mouse sobre el canvas centra la paleta bajo el cursor sin salirse, también con el canvas escalado a otro tamaño.
- [ ] La bola rebota en las paredes izquierda, derecha y superior, y en la paleta sin cambiar `vx`, sin importar dónde pega. Si cae por debajo de la paleta, no rebota.
- [ ] Cada bloque roto suma 10 puntos, desaparece con una animación de 4 frames de unos 0,15 s y suena la rotura. Nunca se rompe más de un bloque por frame.
- [ ] Los rebotes en paredes y paleta suenan (`ball-bounce.mp3`) y varios rebotes seguidos se solapan sin cortarse.
- [ ] Al perder la bola con vidas restantes, el HUD baja una vida, la bola vuelve a salir de la paleta con la velocidad del nivel actual y los bloques rotos siguen rotos.
- [ ] Al romper el último bloque del nivel 1, el HUD pasa a `NIVEL 02`, aparece la pirámide de 40 bloques, la bola reaparece sobre la paleta y va un 10 % más rápido. La puntuación se conserva.
- [ ] Los niveles 3, 4 y 5 muestran el ajedrez de 30 bloques, la parrilla con huecos de 39 y el marco con cruz de 39, con `NIVEL 03`, `04` y `05`.
- [ ] El canvas no dibuja Score, Nivel, vidas, PAUSA, GAME OVER ni «¡Completaste el juego!». Escape no pausa ni hace nada.
- [ ] El overlay de scanlines del CRT se ve encima del juego.

**Pausa**

- [ ] P y el botón PAUSA congelan el juego y muestran el overlay PAUSA. P y SEGUIR lo reanudan sin que la bola salte de posición.
- [ ] Mantener `←` mientras se pausa y soltarla durante la pausa no deja la paleta moviéndose al reanudar.
- [ ] Mover el mouse durante la pausa no mueve la paleta.
- [ ] Pausar mientras suena un efecto lo corta, y no suena nada durante la pausa.
- [ ] Cambiar de pestaña o hacer clic fuera de la ventana durante la partida la deja en PAUSA.
- [ ] En `StartScreen`, P no muestra el overlay PAUSA.

**Fin de partida y ranking**

- [ ] Al perder la tercera vida, el HUD muestra `VIDAS □□□` y se abre `GameOverModal` con la misma puntuación que mostraba el HUD. Detrás queda el tablero congelado.
- [ ] Al romper el último bloque del nivel 5, se abre `GameOverModal` con `2080` puntos (208 bloques × 10, sin importar cuántas vidas se perdieron).
- [ ] Con el modal abierto, las flechas y el mouse no mueven la paleta, y Espacio sobre JUGAR DE NUEVO con foco activa el botón.
- [ ] GUARDAR PUNTUACIÓN crea exactamente una fila en `scores` con `game_id = 'arkanoid'` y la puntuación del HUD. Esa fila aparece en `/games/arkanoid` y en la pestaña ARKANOID del Salón de la Fama si entra en el top 10.
- [ ] La tarjeta de ARKANOID en `/games` muestra esa puntuación como MEJOR PUNTUACIÓN si es la primera.
- [ ] JUGAR DE NUEVO vuelve al `PixelLoader` y a `StartScreen`, y la nueva partida arranca en el nivel 1 con la parrilla completa, `PUNTUACIÓN 0`, `VIDAS ■■■` y `NIVEL 01`.
- [ ] SALIR durante la partida lleva a `/games/arkanoid`. Volver a JUGAR AHORA inicia una partida nueva con una sola bola a velocidad normal (sin dos loops corriendo).

**Sin regresiones**

- [ ] ASTEROIDS y TETRIS se juegan igual que antes del spec: HUD, pausa, fin de partida y guardado.
- [ ] Los juegos sin motor (por ejemplo `/games/snake/play`) siguen mostrando SIMULAR PARTIDA, y su HUD muestra VIDAS.
- [ ] `/`, `/games`, `/hall-of-fame` y `/about` se ven igual que antes del spec. Solo cambia la descripción de ARKANOID en su Detalle.

## Decisiones

- **Sí:** port a TypeScript dentro del bundle, con el contrato del SPEC 05. Es el camino que ya siguen ASTEROIDS y TETRIS.
- **Sí:** jugabilidad idéntica a la referencia: paleta de 81 px, bola que sale sola, rebote en la paleta sin ángulo, un bloque por frame y 10 puntos por bloque. Lo eligió el usuario.
- **No:** rebote con ángulo según el punto de impacto. Mejora el control, pero es un cambio de jugabilidad y queda para otro spec.
- **No:** saque manual de la bola con Espacio. También es un cambio de jugabilidad.
- **Sí:** sprites del spritesheet de la referencia. Lo eligió el usuario. Es lo más fiel y no hace falta rediseñar nada.
- **No:** estilo neón con rectángulos, como Asteroids y Tetris. Cambia el aspecto original del juego.
- **No:** recortar el crédito «Made by Petraheim» del PNG. Quitar la atribución no corresponde: el archivo se copia sin editar y la autoría queda anotada en `CLAUDE.md`.
- **Sí:** sonido incluido (rebote y rotura), con `cloneNode()` para solapar efectos, pausa en `pause()` y limpieza en `destroy()`. Lo eligió el usuario. El SPEC 05 lo había dejado fuera solo porque Asteroids no tiene audio.
- **Sí:** un `pause()` de `Sounds` que descarta los efectos activos en lugar de reanudarlos. Duran menos de un segundo y no vale la pena la complejidad.
- **Sí:** entrada con flechas y mouse. Lo eligió el usuario. Conserva los dos controles de la referencia y el mouse se convierte con `getBoundingClientRect`, porque el canvas está escalado por CSS.
- **Sí:** `StartScreen` no cambia y en táctil sigue el aviso «ESTE JUEGO NECESITA TECLADO». Lo eligió el usuario. Un dispositivo táctil no emite `mousemove` (solo un clic al tocar) y no hay control táctil, así que el juego tampoco se puede jugar ahí.
- **No:** un campo opcional en `GameDefinition` para que `StartScreen` diga «TECLADO O MOUSE». Toca `engine.ts` y `StartScreen` por un texto que no arregla el caso táctil.
- **Sí:** el mouse comparte la fila `← → / MOUSE` de `controls`. `StartScreen` usa `action` como `key` de React, así que dos filas MOVER dispararían una advertencia de claves duplicadas.
- **Sí:** se quita el selector de nivel de la pausa. Lo eligió el usuario. La pausa es la de la plataforma, cuyo overlay cubre el canvas, y saltar de nivel permitiría sumar puntos sin jugar los anteriores.
- **No:** reemplazarlo por teclas 1 a 5 durante la partida. Falsea el ranking.
- **Sí:** derrota y victoria terminan con `onGameOver(score)` y el modal genérico. Lo eligió el usuario. Una partida completa suma siempre 2.080 puntos, así que el ranking tiene un techo natural.
- **No:** dibujar «¡COMPLETASTE EL JUEGO!» en el canvas. Quedaría detrás del modal y casi no se vería.
- **Sí:** corregir `long_description` con `update_arkanoid_description`. Lo eligió el usuario. Quita las cápsulas, los láseres y la multibola, que la referencia no tiene, y describe los cinco niveles y la velocidad creciente. `short_description` sigue siendo correcta y no cambia.
- **Sí:** el contrato no se amplía. ARKANOID tiene 3 vidas y niveles, así que el HUD por defecto le sirve. `engine.ts` y los componentes compartidos no cambian.
- **Sí:** fondo `--deep` (`#05050a`) en lugar del `#000` de la referencia, para que el canvas se funda con el gabinete.
- **Sí:** `gray` conserva las coordenadas de explosión de `red`, igual que `spritesheet.js`. Es un descuido de la referencia, pero corregirlo cambiaría su aspecto y no hay sprites propios para `gray`.
- **Sí:** los niveles se copian de `levels.js`, con el nivel 4 de huecos fijos, aunque el spec 03 de la referencia diga «al azar».
- **Sí:** tras terminar la partida, las explosiones en curso terminan de animarse. Es la única diferencia de comportamiento que se agrega a propósito, y evita que la última rotura quede congelada a medias detrás del modal.
- **Sí:** los assets van en `public/arcade/arkanoid/`, no en `public/juegos/` (descartado en el SPEC 05), y se cargan dentro de `create()`.
- **Sí:** `update` no avanza hasta que el spritesheet carga, sin emitir callbacks extra. Si tarda, el jugador ve el fondo unos milisegundos.
- **No:** mostrar un rectángulo de respaldo si el spritesheet falla. Es un archivo local, la referencia solo registra el error y el fallo se ve enseguida.
- **Sí:** `SCORE_MAX` como tope de seguridad. En la práctica no se alcanza: el máximo es 2.080.
- **Sí:** el loop sigue corriendo tras el fin de partida hasta `destroy()`, como en ASTEROIDS y TETRIS, y `update` solo avanza las explosiones.

## Riesgos

| Riesgo                                                                                         | Mitigación                                                                                                                                                                                     |
| ---------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| En desarrollo, React Strict Mode monta el efecto dos veces y deja dos loops o dos audios.      | `destroy()` cancela el `requestAnimationFrame`, quita los listeners (teclado y mouse), llama a `sprites.dispose()` y `sounds.dispose()`, y es idempotente. Hay un criterio de «una sola bola». |
| Acceder a `window`, `Image` o `Audio` al importar `lib/arcade/arkanoid/` rompe el prerender.   | La convención obliga a crearlos solo dentro de `create()`, `loadSprites()` y `createSounds()`. `npm run build` lo detecta.                                                                     |
| El salto de `dt` al reanudar hace saltar la bola.                                              | `resume()` pone `lastTime = null` y el tope de `dt` es de 50 ms.                                                                                                                               |
| La bola atraviesa un bloque o la paleta a alta velocidad.                                      | Con `MAX_DT = 0.05` la bola recorre como máximo 22 px por frame en el nivel 5, menos que el alto de un bloque (24 px) y que la tolerancia de la paleta.                                        |
| El navegador bloquea la reproducción de audio.                                                 | El primer sonido llega después de un gesto (Espacio o INICIAR). Si aun así `play()` rechaza la promesa, el rechazo se captura y se ignora.                                                     |
| Los sonidos siguen sonando tras pausar o salir.                                                | `pause()` y `dispose()` pausan y descartan todos los clones activos. Hay un criterio de pausa.                                                                                                 |
| La bola sale sola y siempre hacia la derecha, y pierde una vida sin que el jugador esté listo. | Es el comportamiento de la referencia. Se conserva para no cambiar la jugabilidad; el saque manual queda en un spec propio.                                                                    |
| Un golpe de costado invierte `vy` y la bola se comporta raro.                                  | Es el comportamiento de la referencia y se conserva. Corregir las colisiones por lado va en otro spec.                                                                                         |
| El spritesheet tarda en cargar o falla.                                                        | `update` no avanza hasta que carga y `console.error` avisa si falla. El archivo es local y pesa menos de 100 KB.                                                                               |
| El spritesheet trae el crédito de su autor y podría perderse al procesarlo.                    | Se copia con `cp` y se verifica con `cmp`. `CLAUDE.md` anota la autoría.                                                                                                                       |
| Dos filas de `controls` con la misma `action` generan una advertencia de claves duplicadas.    | El mouse comparte fila con las flechas. Hay un criterio de consola limpia.                                                                                                                     |
| El mouse no llega al canvas por algún overlay.                                                 | El overlay de scanlines es `pointer-events-none` y el de PAUSA solo aparece en pausa, cuando el listener ya está desconectado. Hay un criterio de mouse.                                       |

## Lo que **no** entra en este spec

- Selector de nivel en la pausa, con botones o con teclas.
- Power-ups y cápsulas.
- Rebote con ángulo, saque manual, colisiones por lado, bloques resistentes o más de 5 niveles.
- Controles táctiles.
- Escape como tecla de pausa.
- Música de fondo, control de volumen y mute.
- Persistencia del progreso entre sesiones.
- Antitrampas o topes de puntuación por juego.
- Cambios en la Biblioteca, el Home o el Salón de la Fama más allá de la descripción del catálogo.
- Tests automatizados.
- Cambios en `references/` o en los specs 01 a 07.

Si alguna de estas llega, va en su propio spec.
