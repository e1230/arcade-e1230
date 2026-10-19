# SPEC 15 — Rendimiento de TETRIS

> **Estado:** Implementado
> **Depende de:** SPEC 07 (`specs/07-tetris-game.md`)
> **Fecha:** 2026-10-12
> **Objetivo:** Que TETRIS cumpla el presupuesto de rendimiento (no tiene skins: una sola pasada), sin cambiar su jugabilidad ni su look, eliminando el loop que sigue dibujando (con glow) debajo del modal de fin de partida y los hasta 16 dibujos con `shadowBlur` por frame de la pieza activa, y limpiando las asignaciones por frame del fantasma.

## Por qué existe este spec

El motor de TETRIS es pequeño y barato: un solo `requestAnimationFrame` vivo en la práctica, `dt` acotado con `MAX_DT` y `lastTime = null` en `start`/`resume`, `pause()` que cancela el loop (0 dibujos en pausa), callbacks al Reproductor solo cuando cambia el valor (0,5 mutaciones del DOM por segundo en juego), sin gradientes, `getImageData`, `setLineDash`, `save()` ni `new Image`/`new Audio` en ninguna parte, y heap plano. El JS del `loop` cuesta 0,27 ms por frame de media. En este equipo los frames salen a 60 fps (p95 17,4 ms, 0 % por encima de 33 ms).

Hay **dos incumplimientos medidos** del presupuesto:

1. **Tras `onGameOver` el loop sigue vivo** (`game.ts:269-275`) y dibuja 178,5 veces por frame, **16,1 de ellas con `shadowBlur`**, mientras el modal «FIN DEL JUEGO» tapa el canvas, indefinidamente. El presupuesto exige 0 dibujos por frame cuando no hay animación que mostrar. `resume()` (`game.ts:293-298`) también reiniciaría el loop en ese estado.
2. **La pieza activa dibuja con `shadowBlur > 0` hasta 16 veces por frame** (presupuesto: ≤ 10). Cada celda de la pieza hace un `fillRect` y un `strokeRect` con glow en vivo (`render.ts:105-122` llamando a `drawCell`, `render.ts:33-51`): 8 dibujos con glow para las siete piezas de 4 celdas y **16 para la tuerca** (8 celdas). La tuerca sale una de cada ocho piezas y ocupó 37 de 361 frames de la ventana normal (10 %). Con un promedio de 8,86 por frame la media cumple, pero el máximo por frame no.

Además hay un objeto por frame (`{ ...state.current, y: landing }`) y un `requestAnimationFrame` pedido sin `stopLoop()` previo en `start()`/`resume()`, de severidad baja y en el mismo archivo.

### Medición inicial (2026-10-12, servidor de desarrollo, 1280 × 900, sin estrangular salvo donde se indica)

TETRIS no declara `skins`, así que hay una sola pasada. La partida se mantuvo viva con un autopiloto de medición que vive fuera del motor: un `setInterval` de 100 ms que despacha `keydown`/`keyup` sintéticos en `window` (rotar con `ArrowUp`, mover con `ArrowLeft`/`ArrowRight` y `Space` para la caída), una pieza cada ~1,6 s con desplazamientos aleatorios. Es la misma entrada que despacha `MobileGamepad`.

| Escenario                           | p95 (ms) | Frames > 33 ms | Glow/frame                         | Dibujos/frame   | Mutaciones/s |
| ----------------------------------- | -------- | -------------- | ---------------------------------- | --------------- | ------------ |
| Normal (6 s, autopiloto)            | 17,4     | 0 %            | 8,86 (máx. **16** en 37 de 361)    | 76,75 (máx. 97) | 0,5          |
| CPU ×4 (5 s, autopiloto)            | 17,5     | 0 %            | 8,03                               | 127,98          | no medido    |
| Pausa (2 s)                         | —        | —              | 0                                  | **0**           | —            |
| Fin de partida (2 s, modal visible) | —        | —              | **16,13** (tuerca atascada arriba) | **178,48**      | —            |

Medición complementaria:

- Primera ventana de 8 s (autopiloto más rápido, la partida terminó dentro de la ventana): p95 17,5 ms, 0 % > 33 ms, 146,79 dibujos/frame, glow 9,53 (8 en 390 frames, 16 en 90), 0,38 mutaciones/s.
- Tiempo de JS de la función `loop` (envolviendo `requestAnimationFrame`, sin los contadores, 785 frames con autopiloto rápido, parte de ellos con el tablero casi lleno): 0,27 ms de media, p95 0,4 ms, máximo 1,1 ms.
- 0 `setLineDash`, gradientes, `getImageData`, `putImageData` y `save()` por frame; 3,01 `fillText` por frame (SIGUIENTE, LÍNEAS y el contador).
- Tras pausar y reanudar con P, los frames del motor son iguales a los del navegador (3661 de 3661 en 61 s): no queda un segundo loop vivo.
- Heap cada 5 s durante 61 s (el juego terminó dentro de la ventana y el loop siguió dibujando debajo del modal): 15,8 MB a los 5 s, 15,3 MB a los 10 s y 15,3 MB a los 60 s. Sin crecimiento sostenido (0,0 MB entre 10 s y 60 s).
- Escenario con el tablero lleno (cálculo leyendo `drawBoard`): 2 dibujos por celda ocupada, hasta 400 para 200 celdas; no se midió porque el autopiloto no limpia líneas y la partida termina antes. Máximo observado: 177 dibujos por frame.

Salvedades de la medición:

- El p95 de frame sale pegado a ~17,4 ms (60 fps): el equipo tiene mucho margen y no discrimina. Lo que sí discrimina son los contadores del contexto 2D (dibujos y dibujos con glow por frame) y el JS del `loop`.
- El estrangulamiento CPU ×4 por CDP no tuvo efecto medible en este equipo (ya lo registra `references/game-performance.md`): el p95 «con CPU ×4» no es informativo, por eso los criterios usan también los contadores.
- Los dibujos por frame crecen a medida que el tablero se llena (76,75 → 127,98 → 178,48 en ventanas sucesivas de la misma partida): no es ruido, son las celdas fijadas.
- Las filas de pausa y de fin de partida solo miden dibujos (el p95 no aplica: no hay loop del motor en pausa).
- Captura base: `.playwright-screenshots/performance/tetris/base.png` (partida en curso: pieza activa con glow, fantasma tenue, tablero parcialmente lleno y panel SIGUIENTE/LÍNEAS).

## Alcance

### Incluye

- `lib/arcade/tetris/game.ts`
  - Nueva función `stopLoop()`; `start()` y `resume()` la llaman antes de pedir un frame, y `pause()` y `destroy()` la usan en vez de repetir el bloque de cancelación.
  - El loop termina tras dibujar el último frame de la fase `gameover`; `resume()` no lo reinicia en ese estado.
  - `draw()` deja de crear `{ ...state.current, y: landing }` en cada frame y construye los sprites del glow una vez en `create`.
- `lib/arcade/tetris/render.ts`
  - `createPieceSprites()`: una celda con glow horneado por tipo de pieza (8 canvases auxiliares), construida una vez en `create`.
  - `drawPiece` (pieza activa) dibuja con `drawImage` desde los sprites en vez de `fillRect`/`strokeRect` con `shadowBlur` en vivo.
  - `drawGhost(ctx, piece, y)` nuevo, sin objeto intermedio; `PieceStyle` desaparece (solo lo usaba este archivo).
- `references/game-performance.md`: marcar `tetris` como `[x]` con la medición final.

### Fuera de alcance

- Los otros motores (snake, asteroids, arkanoid, frogger) y el catálogo sin motor.
- Cualquier cambio de jugabilidad (rotación y wall kicks, autorrepetición, gravedad, puntuación, niveles, fantasma, tuerca) o de look (colores, relleno translúcido, borde de 2 px, radio del glow, panel).
- `PlayerView`, `GameCanvas`, `PlayerHud`, `CrtScreen`, `MobileGamepad`, `lib/arcade/shared/` y `lib/arcade/engine.ts`: la medición no muestra renders ni mutaciones fuera de lo esperado (0,5 mutaciones/s), así que no hay «Cambios compartidos».
- Caché de la capa estática del tablero (grilla, celdas fijadas y marco), agrupar cambios de estado por celda en `drawCell`, caché del fantasma, y las asignaciones por evento de `board.ts`/`pieces.ts`: ver «Decisiones».
- Workers, `OffscreenCanvas`, `devicePixelRatio`, cambiar `width`/`height`, `ctx.filter`, dependencias nuevas y profiling formal con DevTools.

## Hallazgos

| #   | `archivo:línea`                         | Función                 | Patrón                                                                                                                                                                                            | Frecuencia                             | Skins | Severidad | Evidencia                                                                                            |
| --- | --------------------------------------- | ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------- | ----- | --------- | ---------------------------------------------------------------------------------------------------- |
| H1  | `game.ts:269-275` y `game.ts:293-298`   | `loop`, `resume`        | Tras `endGame()` (`game.ts:117-122`) el loop sigue llamando `update` y `draw` y pidiendo frames con el modal encima, con la pieza activa aún dibujada con glow; `resume()` también lo reiniciaría | por frame, de forma indefinida         | única | Alta      | 178,48 dibujos/frame y 16,13 con `shadowBlur` con «FIN DEL JUEGO» visible; presupuesto 0             |
| H2  | `render.ts:105-122` y `render.ts:33-51` | `drawPiece`, `drawCell` | La pieza activa se dibuja con `shadowBlur = 8` en vivo: `fillRect` + `strokeRect` con glow por celda                                                                                              | por celda de la pieza por frame (8/16) | única | Media     | Máx. 16 dibujos con glow por frame con la tuerca (37 de 361 frames); presupuesto ≤ 10                |
| H3  | `game.ts:263`                           | `draw`                  | `{ ...state.current, y: landing }` crea un objeto por frame solo para dibujar el fantasma                                                                                                         | por frame                              | única | Baja      | Costo evidente; un objeto por frame durante toda la partida                                          |
| H4  | `game.ts:278-285` y `game.ts:293-298`   | `start`, `resume`       | Piden `requestAnimationFrame` sin `stopLoop()` previo: si algo llamara `resume()` con el loop vivo quedarían dos loops                                                                            | por evento                             | única | Baja      | Hoy `GameCanvas` no lo provoca (3661 de 3661 frames tras pausar y reanudar); es higiene del contrato |

Lo que se revisó y está bien (sin hallazgo):

- **Loop y ciclo de vida:** `dt` acotado con `MAX_DT` (`constants.ts:28`) y `lastTime = null` en `start`/`resume`; `pause()` cancela el loop y suelta el teclado; `destroy()` cancela el loop y quita los listeners (`keyboard.detach()`); no hay `setTimeout`/`setInterval`.
- **Callbacks:** `onScore` (`game.ts:109`, tras la comparación de `game.ts:107`) y `onLevel` (`game.ts:140`, solo si el nivel cambia) solo al cambiar el valor; `onGameOver` se emite una vez (`game.ts:121`, protegido por `game.ts:118`); los de `start()` emiten los valores iniciales una sola vez. 0,5 mutaciones/s medidas.
- **Asignaciones en caliente:** `draw` y `drawBoard`/`drawPanel` no usan `map`/`filter`/`Array.from`; los strings de `font` y los colores son literales o constantes de módulo (`COLORS`, `PIECE_COLORS`); no hay gradientes, `Path2D`, imágenes ni `document.createElement` en el loop.
- **Lógica:** `collide` es O(celdas de la pieza); `ghostY` recorre como máximo 20 filas por frame; no hay colecciones que crezcan; `dropTimer`, `shiftTimer` y `softDropTimer` están acotados por sus propios umbrales.
- **Audio e imágenes:** el juego no tiene.
- **Por evento, no por frame:** `rotateCW` crea una matriz por rotación (`board.ts:38-50`), `clearFullRows` usa `every` con un closure por fila al fijar una pieza (`board.ts:63-74`) y `createPiece` copia la matriz con `map` (`pieces.ts:64-72`). Son decenas de llamadas por minuto, no por frame.

## Rutas y archivos

```
lib/arcade/tetris/
  game.ts            (cambia)  stopLoop(), loop que termina en gameover, resume sin reinicio tras el fin, sprites creados en create, fantasma sin objeto
  render.ts          (cambia)  createPieceSprites(), drawPiece con drawImage, drawGhost(ctx, piece, y)
references/
  game-performance.md (cambia) tetris pasa a [x] con la medición final
```

**Sin cambios:** `lib/arcade/tetris/constants.ts`, `board.ts`, `pieces.ts`, `index.ts`; los otros motores (`arkanoid`, `snake`, `asteroids`, `frogger`); `lib/arcade/engine.ts`, `registry.ts` y `shared/`; `components/` (Reproductor, `GameCanvas`, `CrtScreen`, `MobileGamepad`); `public/`; el ranking y las páginas; el resto de `references/`.

## Modelo de datos

No hay cambios de interfaz del contrato. Una sola caché nueva, en `render.ts`, construida una vez en `create`:

```ts
// Margen alrededor de la celda para que el blur no se recorte (el glow de 8 px llega a ~12 px)
const GLOW_PAD = 16;
const SPRITE_SIZE = BLOCK + GLOW_PAD * 2; // 60 px

// Una celda con relleno, borde y glow horneados por tipo de pieza (1 a 8)
export type PieceSprites = Record<PieceType, HTMLCanvasElement>;
```

- **Variantes:** 8, una por `PieceType` (siete piezas y la tuerca). El glow solo existe en la pieza activa (el fantasma, las celdas fijadas y el panel SIGUIENTE no llevan glow), así que no hay variantes de fantasma ni de celda fija.
- **Construcción:** en `createTetrisEngine`, junto a `createKeyboard()`, antes de `start()`. Nunca en el loop. Cada sprite se dibuja con el mismo `drawCell` del juego y el mismo `shadowBlur = GLOW_BLUR` / `shadowColor = PIECE_COLORS[type]`, así el resultado es el mismo que el del dibujo en vivo.
- **Uso:** `ctx.drawImage(sprites[cell], x - GLOW_PAD, y - GLOW_PAD)` con `x`, `y` enteros (`BOARD_X`, `BOARD_Y`, `BLOCK` y las posiciones de la pieza son enteros).
- **Memoria:** 8 canvases de 60 × 60 px, unos 115 KB en total.
- **Skins:** TETRIS no tiene skins, así que la caché no depende de ninguna.

No hay sección «Cambios compartidos».

## Plan de implementación

### Paso 1 — Detener el loop al terminar la partida y un solo loop vivo (H1, H4)

En `game.ts`, agregar `stopLoop()`, usarlo en `start`, `pause`, `resume` y `destroy`, y parar el loop tras el último frame de `gameover`.

Antes (`game.ts:269-306`):

```ts
function loop(ts: number): void {
  const dt = lastTime === null ? 0 : Math.min((ts - lastTime) / 1000, MAX_DT);
  lastTime = ts;
  update(dt);
  draw();
  rafId = requestAnimationFrame(loop);
}

return {
  start() {
    state = createInitialState();
    callbacks.onScore(state.score);
    callbacks.onLevel(state.level);
    keyboard.attach();
    lastTime = null;
    rafId = requestAnimationFrame(loop);
  },
  pause() {
    if (rafId !== null) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }
    keyboard.detach();
  },
  resume() {
    // Tras el fin de partida el teclado queda suelto, para que Espacio active los botones del modal
    if (state.phase === "playing") keyboard.attach();
    lastTime = null;
    rafId = requestAnimationFrame(loop);
  },
  destroy() {
    if (rafId !== null) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }
    keyboard.detach();
  },
};
```

Después:

```ts
function stopLoop(): void {
  if (rafId !== null) {
    cancelAnimationFrame(rafId);
    rafId = null;
  }
}

function loop(ts: number): void {
  const dt = lastTime === null ? 0 : Math.min((ts - lastTime) / 1000, MAX_DT);
  lastTime = ts;
  update(dt);
  draw();
  // Tras el último frame de la partida no se pide otro: el modal tapa el canvas
  if (isGameOver()) {
    rafId = null;
    return;
  }
  rafId = requestAnimationFrame(loop);
}

return {
  start() {
    state = createInitialState();
    callbacks.onScore(state.score);
    callbacks.onLevel(state.level);
    keyboard.attach();
    lastTime = null;
    stopLoop();
    rafId = requestAnimationFrame(loop);
  },
  pause() {
    stopLoop();
    keyboard.detach();
  },
  resume() {
    // Tras el fin de partida no hay nada que redibujar y el teclado queda suelto
    // para que Espacio active los botones del modal
    if (isGameOver()) return;
    keyboard.attach();
    lastTime = null;
    stopLoop();
    rafId = requestAnimationFrame(loop);
  },
  destroy() {
    stopLoop();
    keyboard.detach();
  },
};
```

`isGameOver()` ya existe (`game.ts:113-115`) precisamente para que TypeScript no estreche la fase. El último frame se dibuja **antes** de parar: `endGame()` corre dentro de `update`, `draw()` pinta el tablero congelado con la pieza que no cupo encima y sin fantasma (`game.ts:261`), y recién entonces el loop se detiene. El aspecto del fondo del modal no cambia.

**Verificación:** `npx tsc --noEmit` y `npm run lint` sin errores; una partida completa hasta «FIN DEL JUEGO» (basta dejar caer piezas con `Space`) y script **Medir** de 2000 ms con el modal visible: 0 dibujos por frame (antes 178,48). P y SEGUIR siguen pausando y reanudando; JUGAR DE NUEVO arranca una partida limpia (puntuación 0, nivel 1, loop vivo).

### Paso 2 — Fantasma sin objeto por frame (H3)

`render.ts`: reemplazar el estilo `"ghost"` de `drawPiece` por una función propia que recibe la fila de aterrizaje. `PieceStyle` se elimina (solo lo usa este archivo).

Antes (`render.ts:29-30` y `105-122`):

```ts
export type PieceStyle = "active" | "ghost";

export function drawPiece(
  ctx: CanvasRenderingContext2D,
  piece: ActivePiece,
  style: PieceStyle,
): void {
  if (style === "active") {
    ctx.shadowBlur = GLOW_BLUR;
    ctx.shadowColor = PIECE_COLORS[piece.type];
  }
  drawShape(
    ctx,
    piece.shape,
    BOARD_X + piece.x * BLOCK,
    BOARD_Y + piece.y * BLOCK,
    style === "ghost",
  );
  ctx.shadowBlur = 0;
}
```

Después (en este paso la pieza activa sigue con glow en vivo; el paso 3 lo reemplaza):

```ts
// Fantasma: solo el contorno de la pieza en la fila donde aterrizaría
export function drawGhost(
  ctx: CanvasRenderingContext2D,
  piece: ActivePiece,
  y: number,
): void {
  drawShape(
    ctx,
    piece.shape,
    BOARD_X + piece.x * BLOCK,
    BOARD_Y + y * BLOCK,
    true,
  );
}

// Pieza que cae, con glow
export function drawPiece(
  ctx: CanvasRenderingContext2D,
  piece: ActivePiece,
): void {
  ctx.shadowBlur = GLOW_BLUR;
  ctx.shadowColor = PIECE_COLORS[piece.type];
  drawShape(
    ctx,
    piece.shape,
    BOARD_X + piece.x * BLOCK,
    BOARD_Y + piece.y * BLOCK,
    false,
  );
  ctx.shadowBlur = 0;
}
```

`game.ts`, `draw()` (`game.ts:255-267`).

Antes:

```ts
if (state.phase === "playing") {
  const landing = ghostY(state.board, state.current);
  drawPiece(ctx, { ...state.current, y: landing }, "ghost");
}
drawPiece(ctx, state.current, "active");
```

Después (mismo orden de dibujo: fantasma, luego pieza activa):

```ts
if (state.phase === "playing") {
  drawGhost(ctx, state.current, ghostY(state.board, state.current));
}
drawPiece(ctx, state.current);
```

Actualizar el `import` de `render` en `game.ts` (`drawGhost` además de `drawBoard`, `drawPanel` y `drawPiece`).

**Verificación:** `npx tsc --noEmit` y `npm run lint`; una partida: el fantasma aparece en la misma fila de aterrizaje y con el mismo contorno tenue, y desaparece al terminar la partida; script **Medir**: dibujos por frame sin cambio (el fantasma sigue haciendo 4 `strokeRect` por pieza de 4 celdas).

### Paso 3 — Caché de sprites para el glow de la pieza activa (H2)

`render.ts`: agregar las constantes y `createPieceSprites()`, y reemplazar el cuerpo de `drawPiece`.

```ts
// Margen alrededor de la celda para que el blur no se recorte (el glow de 8 px llega a ~12 px)
const GLOW_PAD = 16;
const SPRITE_SIZE = BLOCK + GLOW_PAD * 2;

export type PieceSprites = Record<PieceType, HTMLCanvasElement>;

// Una celda con glow horneado por tipo de pieza; se llama una sola vez en `create`
export function createPieceSprites(): PieceSprites {
  const sprites = {} as PieceSprites;
  for (const key of Object.keys(PIECE_COLORS)) {
    const type = Number(key) as PieceType;
    const sprite = document.createElement("canvas");
    sprite.width = SPRITE_SIZE;
    sprite.height = SPRITE_SIZE;
    const spriteCtx = sprite.getContext("2d");
    if (!spriteCtx)
      throw new Error("No se pudo obtener el contexto 2d del sprite");
    spriteCtx.shadowBlur = GLOW_BLUR;
    spriteCtx.shadowColor = PIECE_COLORS[type];
    drawCell(spriteCtx, GLOW_PAD, GLOW_PAD, type, false); // mismo dibujo que en vivo
    sprites[type] = sprite;
  }
  return sprites;
}

// Pieza que cae: una celda precalculada con glow por celda ocupada, sin shadowBlur en el loop
export function drawPiece(
  ctx: CanvasRenderingContext2D,
  piece: ActivePiece,
  sprites: PieceSprites,
): void {
  const left = BOARD_X + piece.x * BLOCK - GLOW_PAD;
  const top = BOARD_Y + piece.y * BLOCK - GLOW_PAD;
  for (let r = 0; r < piece.shape.length; r++) {
    for (let c = 0; c < piece.shape[r].length; c++) {
      const cell = piece.shape[r][c];
      if (cell) ctx.drawImage(sprites[cell], left + c * BLOCK, top + r * BLOCK);
    }
  }
}
```

Actualizar el comentario de cabecera de `render.ts` («Cada función deja `globalAlpha = 1` y `shadowBlur = 0`»): ahora el contexto principal nunca recibe `shadowBlur`.

`game.ts`: crear los sprites una vez y pasarlos.

```ts
const keyboard = createKeyboard();
const sprites = createPieceSprites(); // una vez: el glow de la pieza activa va horneado
...
drawPiece(ctx, state.current, sprites);
```

`createTetrisEngine` solo corre en el navegador (dentro del efecto de `GameCanvas`), así que `document.createElement` es seguro; es el mismo caso que `canvas.getContext("2d")`.

**Verificación:** `npx tsc --noEmit` y `npm run lint`; script **Medir** (6 s, autopiloto): `glowDraws` por frame de 8,86 (máx. 16) a **0**, y los dibujos de la pieza activa de 8 (16 con la tuerca) a 4 (8) por frame. Comparación visual contra `.playwright-screenshots/performance/tetris/base.png` con una pieza activa de cada color, incluida la tuerca. Comparación numérica de una sola vez (script temporal en la consola o en un archivo de prueba que no se commitea): dibujar una celda de cada tipo con el camino en vivo (el código anterior) y con el sprite sobre canvases iguales y verificar que la diferencia máxima por canal de `getImageData` sea ≤ 12 (el glow de alfa muy bajo se cuantiza en 8 bits en el sprite transparente; medido: 5 con una celda y hasta 11 con cuatro celdas vecinas, sin recorte del blur); `getImageData` solo se usa en esa verificación, nunca en el motor.

### Paso 4 — Documentación

En `references/game-performance.md`: `tetris` pasa a `[x]` con la medición final (la misma tabla de este spec, medida de nuevo con `npm run dev`), la fila del Resumen actualizada y una línea en el historial.

**Verificación:** `git diff main -- public/ references/` solo muestra `references/game-performance.md`.

## Criterios de aceptación

### Generales

- [ ] `npx tsc --noEmit` sin errores.
- [ ] `npm run lint` sin errores.
- [ ] `git diff main -- public/ references/` solo muestra `references/game-performance.md`.
- [ ] Ningún otro motor cambia (`git diff main --stat` solo muestra `lib/arcade/tetris/game.ts`, `lib/arcade/tetris/render.ts`, este spec y `references/game-performance.md`).
- [ ] `constants.ts`, `board.ts`, `pieces.ts` e `index.ts` de Tetris sin cambios.

### Rendimiento (única pasada; medido con los scripts de `game-performance-booster`, `npm run dev`, autopiloto sintético)

- [ ] Frame p95 sin estrangular: 17,4 ms → ≤ 20 ms.
- [ ] Frames > 33 ms: 0 % → < 1 %.
- [ ] Frame p95 con CPU ×4: 17,5 ms → ≤ 33 ms.
- [ ] Glow/frame: 8,86 de media y **16 de máximo** (tuerca) → **0** (≤ 10 en todo frame).
- [ ] Dibujos de la pieza activa: 8 (16 con la tuerca) → 4 (8) `drawImage` por frame; el resto de los dibujos de un frame sin cambio.
- [ ] Dibujos por frame tras `onGameOver` (modal visible, ≥ 1 s después del último frame): 178,48 → **0**; glow 16,13 → 0.
- [ ] Dibujos por frame en pausa: 0 → 0.
- [ ] Mutaciones del DOM: 0,5/s → ≤ 10/s.
- [ ] `getImageData`, `createLinearGradient`/`Radial`/`Pattern`, `new Image`, `new Audio` por frame: 0 → 0 (y ningún `document.createElement` en el loop: los 8 sprites se crean en `create`).
- [ ] Heap tras 60 s de partida: sin crecimiento sostenido (0,0 MB entre 10 s y 60 s → ≤ 5 MB).
- [ ] JS del `loop` de 0,27 ms de media: no sube más de 0,05 ms.
- [ ] Un solo loop vivo: tras pausar y reanudar, los frames del motor igualan a los del navegador.

### Pausa y fin

- [ ] P y SEGUIR pausan y reanudan sin salto de la pieza ni de la gravedad; en pausa 0 dibujos por frame.
- [ ] Al terminar la partida el último frame (pieza que no cupo superpuesta, sin fantasma) queda dibujado debajo del modal y 0 dibujos por frame después.
- [ ] Pausar por pérdida de foco justo antes del fin, o reanudar con la partida terminada, no deja el loop vivo ni dibuja al volver.
- [ ] JUGAR DE NUEVO arranca una partida limpia (puntuación 0, nivel 1, tablero vacío, loop de nuevo vivo, canvas dibujándose).

### Sin regresiones visuales

- [ ] La pieza activa se ve igual que en `.playwright-screenshots/performance/tetris/base.png`: relleno translúcido, borde de 2 px y glow del mismo radio y color, sin recortes en los bordes del sprite, en las ocho piezas incluida la tuerca.
- [ ] El fantasma (solo contorno tenue), el tablero, la grilla, el marco, el panel SIGUIENTE y LÍNEAS se ven iguales.
- [ ] La diferencia numérica máxima por canal entre el glow en vivo y el sprite es ≤ 12 (decidido el 2026-10-19 tras medir hasta 11; imperceptible a simple vista).

### Sin regresiones de juego

- [ ] Misma puntuación por acción (soft drop +1 por fila, hard drop +2 por fila, líneas `[100, 300, 500, 800] × nivel`), mismo avance de nivel (cada 10 líneas) y misma velocidad de caída.
- [ ] Mismas rotaciones con wall kicks, misma autorrepetición de ← → y ↓, y el fantasma aterriza en la misma fila.
- [ ] Mismo comportamiento del teclado y de Espacio sobre los botones del modal tras el fin de partida (el teclado queda suelto).

## Decisiones

- **Sí:** terminar el loop tras el último frame de `gameover`. Es el incumplimiento más claro del presupuesto (178,48 dibujos/frame, 16,13 con glow, contra 0) y el modal tapa el canvas. No hay animación posterior que mostrar (Tetris no anima la limpieza de líneas ni el fin).
- **Sí:** caché de sprites para el glow de la pieza activa. Es la única forma de bajar de 16 a 0 dibujos con `shadowBlur` sin cambiar el look: relleno translúcido, borde y glow por celda son el diseño del SPEC 07, y quitar el glow de las celdas internas o dibujar el contorno de la pieza como una sola figura cambiaría cómo se ve. Los sprites reutilizan `drawCell`, así que el dibujo es el mismo.
- **Sí:** un sprite de una celda (60 × 60) y no de la pieza completa. Hay 8 tipos pero 4 rotaciones por tipo y la rotación cambia la forma; el sprite por celda sirve para todas las rotaciones sin una variante por orientación.
- **Sí:** `stopLoop()` antes de cada `requestAnimationFrame` inicial y `resume()` sin reinicio tras el fin. Es la regla del contrato de este agente; hoy no hay un doble loop (3661 de 3661 frames tras pausar y reanudar), pero es barato.
- **Sí:** reemplazar el objeto con spread del fantasma por una función con el parámetro `y`: es del mismo archivo, de bajo riesgo y su costo es evidente aunque pequeño.
- **No:** caché de la capa estática del tablero (grilla, celdas fijadas y marco). El tablero lleno llegaría a ~400 dibujos por frame, pero el JS del `loop` cuesta 0,27 ms de media (1,1 ms de máximo) y el p95 está pegado a 60 fps; la medición no lo justifica y habría que invalidarla en cada fijación de pieza y limpieza de líneas. Si en un celular real el tablero lleno pesa, va en su propio spec.
- **No:** agrupar `globalAlpha`, `lineWidth`, `fillStyle` y `strokeStyle` por color o por tipo de celda en `drawCell`. Son 6 asignaciones triviales por celda y el reordenamiento del dibujo no tiene ganancia medible.
- **No:** caché del fantasma ni de `ghostY`. Son como máximo 20 llamadas a `collide` de ≤ 9 celdas por frame, dentro de los 0,27 ms medidos.
- **No:** reutilizar matrices en `rotateCW`, `clearFullRows` o `createPiece`. Corren por evento (decenas por minuto), no por frame.
- **No:** cambios compartidos (`PlayerView`, `GameCanvas`, `MobileGamepad`): 0,5 mutaciones/s, sin renders continuos.
- **No:** `devicePixelRatio` ni cambiar `width`/`height` del canvas, workers ni `OffscreenCanvas`.

Lo decidió el agente (game-performance-booster).

## Riesgos

| Riesgo                                                                                                 | Mitigación                                                                                                                                                                                                                             |
| ------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| El sprite se ve distinto al dibujo en vivo (blur recortado, borde o glow más claro u oscuro)           | `GLOW_PAD = 16` cubre el blur de 8 px (extensión visible ~12 px); el sprite usa `drawCell` con el mismo `shadowBlur`/`shadowColor`. Se verifica con las ocho piezas a simple vista y con la diferencia numérica máxima por canal ≤ 12. |
| Las celdas adyacentes de una pieza se componen distinto (el glow de una celda se solapa con la vecina) | Cada celda ya se dibujaba por separado y en el mismo orden (relleno y borde de una celda, luego la siguiente); componer sprites de capas transparentes en el mismo orden con `source-over` da el mismo resultado salvo redondeo.       |
| Coordenadas no enteras en `drawImage` que fuerzan interpolación                                        | `BOARD_X`, `BOARD_Y`, `BLOCK`, `GLOW_PAD` y las posiciones de la pieza son enteros; no se introduce ninguna fracción.                                                                                                                  |
| Una caché construida antes de que carguen las imágenes                                                 | Los sprites se dibujan con primitivas del canvas, sin imágenes ni sonido; no hay nada que cargar.                                                                                                                                      |
| Un objeto reutilizado se filtra entre frames                                                           | `PieceSprites` es de solo lectura (nadie dibuja sobre los sprites después de `createPieceSprites`); `drawGhost` no crea ni muta objetos, recibe `y` por parámetro.                                                                     |
| Parar el loop en `gameover` deja el último frame incompleto                                            | `draw()` corre **antes** de la comprobación de `isGameOver()` en el mismo tick que `endGame()`: el tablero congelado con la pieza superpuesta (y sin fantasma) siempre se dibuja antes de parar.                                       |
| `resume()` con la partida terminada deja `rafId = null` y algo espera un loop vivo                     | `stopLoop()` y `destroy()` toleran `rafId === null`; `start()` siempre reinicia el loop; JUGAR DE NUEVO desmonta `GameCanvas` y crea un motor nuevo.                                                                                   |
| Un canvas redimensionado por la ventana deja el último frame desactualizado tras el fin                | El `width`/`height` interno no cambia y `CrtScreen` escala el canvas por CSS; además el modal lo tapa.                                                                                                                                 |
| `document.createElement` en `create` rompe un render en el servidor                                    | `createTetrisEngine` solo se llama desde el efecto de `GameCanvas`; ya usa `canvas.getContext("2d")` en el mismo punto.                                                                                                                |
| La medición en desarrollo no coincide con producción                                                   | Los números de `npm run dev` sirven para comparar antes y después; los criterios principales (0 dibujos tras el fin, 0 dibujos con glow) son conteos de llamadas y no dependen del servidor.                                           |

## Lo que no entra en este spec

- Los otros motores y el catálogo sin motor.
- Cambios de jugabilidad o de look.
- Cambios compartidos (`PlayerView`, `GameCanvas`, `MobileGamepad`, `shared/`, `engine.ts`): no hay medición que los justifique.
- La caché de la capa estática del tablero, agrupar estados en `drawCell` y las asignaciones por evento de `board.ts`/`pieces.ts`.
- Workers, `OffscreenCanvas`, `devicePixelRatio`, cambiar `width`/`height`, `ctx.filter`, dependencias nuevas y profiling formal con DevTools.

Si alguna de estas llega, va en su propio spec.
