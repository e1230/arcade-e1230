# SPEC 16 — Rendimiento de SNAKE

> **Estado:** Implementado
> **Depende de:** SPEC 09 (`specs/09-snake-game.md`)
> **Fecha:** 2026-10-12
> **Objetivo:** Que SNAKE cumpla el presupuesto de rendimiento (no tiene skins: una sola pasada), sin cambiar su jugabilidad ni su look, eliminando el loop que sigue dibujando (con glow) debajo del modal de fin de partida y limpiando las asignaciones por frame de la lectura de teclas, de la cabeza, de la fruta y de la colisión con el cuerpo.

## Por qué existe este spec

El motor de SNAKE es pequeño y barato: un solo `requestAnimationFrame` vivo (4 s después de pausar y reanudar con P, 241 frames del motor contra 241 del navegador), `dt` acotado con `MAX_DT` y `lastTime = null` en `start`/`resume`, `stopLoop()` antes de cada frame inicial, `pause()` que cancela el loop (0 dibujos en pausa), callbacks al Reproductor solo cuando cambia el valor (1,0 mutaciones del DOM por segundo en juego), una sola imagen creada en `create` (`sprites.ts:66`), sin gradientes, `getImageData`, `setLineDash` ni `save()`, y heap plano. Dibuja 20,67 veces por frame de media y **1 de ellas con `shadowBlur`** (la cabeza), muy por debajo del presupuesto de 10. El JS del `loop` cuesta 0,11 ms por frame. En este equipo los frames salen a 60 fps (p95 17,5 ms, 0 % por encima de 33 ms).

Hay **un incumplimiento medido** del presupuesto:

1. **Tras `onGameOver` el loop sigue vivo** (`game.ts:352-358`) y dibuja 62 veces por frame, **1 de ellas con `shadowBlur`**, mientras el modal «FIN DEL JUEGO» tapa el canvas, indefinidamente (121 de 121 frames del navegador en 2 s). El presupuesto exige 0 dibujos por frame cuando no hay animación que mostrar, y Snake no anima nada después de `finishGame` (`game.ts:153-157`): la serpiente queda quieta. `resume()` (`game.ts:384-393`) también reiniciaría el loop en ese estado. El SPEC 09 fijó que «el loop sigue redibujando hasta `destroy()`»; este spec lo reemplaza por «un último frame y parar», sin cambio visual.

Además hay asignaciones por frame y por paso de severidad baja, todas en `game.ts` y `sprites.ts`: `codes.map(...).some(...)` por tecla y por frame (8 objetos temporales por frame), el arreglo `[-1, 1]` y el objeto `side` en cada `drawHead`, el cálculo de escala y el destructurado de la fruta en cada `drawFruit`, y `slice(0, -1)` más `some` con closure en cada paso.

### Medición inicial (2026-10-12, servidor de desarrollo, 1280 × 900, sin estrangular salvo donde se indica)

SNAKE no declara `skins`, así que hay una sola pasada. La partida se mantuvo viva con un autopiloto de medición que vive fuera del motor: lee la posición de la cabeza (`fillRect` de 36 × 36), el cuerpo (de 34 × 34) y la fruta (`drawImage` de 9 argumentos) de las llamadas al contexto, calcula un camino con BFS y despacha `keydown`/`keyup` sintéticos en `window` con `ArrowUp`/`ArrowDown`/`ArrowLeft`/`ArrowRight`, la misma entrada que despacha `MobileGamepad`. La serpiente llegó a 63 segmentos a los ~45 s de la medición de memoria. El autopiloto vive en la consola de la medición; no se versiona.

| Escenario                           | p95 (ms) | Frames > 33 ms | Glow/frame (máx.) | Dibujos/frame (máx.)        | Mutaciones/s |
| ----------------------------------- | -------- | -------------- | ----------------- | --------------------------- | ------------ |
| Normal (8 s, autopiloto)            | 17,5     | 0 %            | 1 (1)             | 20,67 (24), 1 `drawImage`   | 1,0          |
| CPU ×4 (8 s, autopiloto)            | 17,6     | 0 %            | 1                 | 32,68 (serpiente más larga) | no medido    |
| Pausa (2 s)                         | —        | —              | 0                 | **0** (0 frames del motor)  | —            |
| Fin de partida (2 s, modal visible) | —        | —              | **1**             | **62** (121 de 121 frames)  | —            |

Medición complementaria:

- Tiempo de JS de la función `loop` (envolviendo `requestAnimationFrame` en una carga sin los contadores): 0,08 ms de media en la espera inicial (240 frames, p95 0,2, máx. 0,2) y 0,11 ms jugando (481 frames, p95 0,2, máx. 0,3). La resolución del reloj es de 0,1 ms.
- 0 `setLineDash`, gradientes, `getImageData`, `putImageData` y `save()` por frame; 1 `drawImage` por frame (la fruta, con recorte y escala).
- Heap cada 5 s durante 60 s con el autopiloto: 15,7 MB a los 0 s, 14,7 MB a los 10 s y 14,4 MB a los 60 s, con muestras entre 14,4 y 15,7 MB. Sin crecimiento sostenido (−0,3 MB entre 10 s y 60 s).
- Microprueba (canvas aparte de 800 × 600, 300 repeticiones): 300 `fillRect` de 34 × 34 cuestan 0,098 ms y un solo camino con 300 `rect()` y un `fill()`, 0,103 ms; 50 `fillRect`, 0,017 ms. Dibujar el cuerpo completo (300 segmentos como máximo) no pesa y agruparlo no gana nada.
- Mutaciones del DOM: 1,0/s (cada fruta cambia la puntuación; el nivel y las vidas cambian rara vez).

Salvedades de la medición:

- El p95 de frame sale pegado a ~17,5 ms (60 fps): el equipo tiene mucho margen y no discrimina. Lo que sí discrimina son los contadores del contexto 2D (dibujos y dibujos con glow por frame) y el JS del `loop`.
- El estrangulamiento CPU ×4 por CDP no tuvo efecto medible en este equipo (ya lo registra `references/game-performance.md`): el p95 «con CPU ×4» no es informativo, por eso los criterios usan también los contadores. Los 32,68 dibujos/frame de esa fila corresponden a una serpiente más larga, no al estrangulamiento.
- Las filas de pausa y de fin de partida solo miden dibujos (el p95 no aplica: no hay loop del motor en pausa).
- La partida con autopiloto terminó sola (3 vidas perdidas a velocidad alta con una serpiente larga) pocos segundos después de la medición de memoria de 60 s, lo que permitió medir el fin de partida.
- Captura base: `.playwright-screenshots/performance/snake/base.png` (partida en curso: fondo con cuadrícula tenue, serpiente rosa con la cabeza más clara y ojos, fruta del atlas).

## Alcance

### Incluye

- `lib/arcade/snake/game.ts`
  - El loop termina tras dibujar el último frame de las fases `gameover` y `win`; `resume()` no lo reinicia en ese estado.
  - `readInput` sin `map`/`some` por tecla y por frame (se consumen las dos teclas de cada dirección, como antes).
  - `drawHead` sin el arreglo `[-1, 1]` ni el objeto `side` por frame, y con los tamaños de cabeza y cuerpo como constantes de módulo.
  - `step` sin `slice(0, -1)` ni closure: la colisión con el cuerpo recorre el arreglo con un bucle.
- `lib/arcade/snake/sprites.ts`
  - `drawFruit` con la escala, el tamaño y el desfase de cada fruta calculados una vez a nivel de módulo (mismos valores numéricos que hoy: el look no cambia).
- `references/game-performance.md`: marcar `snake` como `[x]` con la medición final.

### Fuera de alcance

- Los otros motores (tetris, asteroids, arkanoid, frogger) y el catálogo sin motor.
- Cualquier cambio de jugabilidad (velocidad, pasos, cola de giros, colisiones, puntuación, niveles, vidas, parpadeo al reaparecer, aparición de frutas) o de look (colores, cuadrícula, ojos, glow de la cabeza de 12 px, sprites de fruta).
- `PlayerView`, `GameCanvas`, `PlayerHud`, `CrtScreen`, `MobileGamepad`, `lib/arcade/shared/` y `lib/arcade/engine.ts`: la medición no muestra renders ni mutaciones fuera de lo esperado (1,0 mutaciones/s), así que no hay «Cambios compartidos».
- Caché de la cuadrícula, agrupar el cuerpo en un solo camino, sprite del glow de la cabeza, dibujar solo en cada paso, y las asignaciones por evento de `spawnFruit`/`resetSnake`: ver «Decisiones».
- Declarar `touch` (gamepad táctil) o crear skins: son trabajo de `mobile-porter` y `skin-designer`.
- Workers, `OffscreenCanvas`, `devicePixelRatio`, cambiar `width`/`height`, `ctx.filter`, dependencias nuevas y profiling formal con DevTools.

## Hallazgos

| #   | `archivo:línea`                       | Función          | Patrón                                                                                                                                                                                       | Frecuencia                         | Skins | Severidad | Evidencia                                                                                                   |
| --- | ------------------------------------- | ---------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------- | ----- | --------- | ----------------------------------------------------------------------------------------------------------- |
| H1  | `game.ts:352-358` y `game.ts:384-393` | `loop`, `resume` | Tras `finishGame()` (`game.ts:153-157`) el loop sigue llamando `update` y `draw` y pidiendo frames con el modal encima; `resume()` también lo reiniciaría (solo evita reconectar el teclado) | por frame, de forma indefinida     | única | Alta      | 62 dibujos/frame (1 con `shadowBlur`) y 121 de 121 frames en 2 s con «FIN DEL JUEGO» visible; presupuesto 0 |
| H2  | `game.ts:170-173`                     | `readInput`      | `codes.map((code) => keyboard.consume(code)).some(Boolean)` crea un arreglo y un closure por cada una de las 4 direcciones en cada frame                                                     | 4 por frame (8 objetos temporales) | única | Baja      | Costo evidente; corre durante toda la partida y el `map` no cortocircuita, así que consume ambas teclas     |
| H3  | `game.ts:306-317`                     | `drawHead`       | El arreglo literal `[-1, 1]` y el objeto `side` se crean en cada frame; el tamaño de la cabeza y del cuerpo se recalcula (`game.ts:295`, `339`)                                              | por frame                          | única | Baja      | Costo evidente: un arreglo y un objeto por frame                                                            |
| H4  | `sprites.ts:79-89`                    | `drawFruit`      | Destructura el `Rect`, calcula `Math.min`, la escala, el ancho, el alto y el desfase de una fruta que no cambia entre pasos                                                                  | por frame                          | única | Baja      | Costo evidente; el resultado solo depende del índice de fruta (22 valores constantes)                       |
| H5  | `game.ts:224-230`                     | `step`           | `state.snake.slice(0, -1)` copia hasta 299 elementos y `some` crea un closure en cada paso                                                                                                   | por paso (8 a 16 por segundo)      | única | Baja      | Con una serpiente de 63 segmentos son 62 elementos copiados por paso; la copia crece con la serpiente       |

Lo que se revisó y está bien (sin hallazgo):

- **Loop y ciclo de vida:** `dt` acotado con `MAX_DT` (`constants.ts:38`) y `lastTime = null` en `start`/`resume`; `start`, `resume` y `destroy` llaman a `stopLoop()` (`game.ts:360-365`); `pause()` cancela el loop y suelta el teclado; `destroy()` cancela el loop, quita los listeners con `keyboard.detach()` y suelta los callbacks del `Image`; no hay `setTimeout`/`setInterval`.
- **Callbacks:** `onScore` y `onLevel` solo al comer una fruta y solo si el nivel cambia (`game.ts:240`, `243-246`); `onLives` solo al perder una vida (`game.ts:188`); `onGameOver` una sola vez (`finishGame`); los de `start()` emiten los valores iniciales una sola vez. 1,0 mutaciones/s medidas.
- **Asignaciones en caliente:** `draw` no usa `map`/`filter`/`Array.from`; los colores son constantes de módulo (`COLORS`); no hay gradientes, `Path2D`, `document.createElement`, `getImageData` ni `new Audio`; la imagen se crea una sola vez en `create` (`sprites.ts:66`).
- **Costo de dibujo:** 1 dibujo con glow por frame (la cabeza), contra un presupuesto de 10. El cuerpo no usa glow. `drawGrid` hace un solo `stroke()` con ~37 segmentos. Con 300 segmentos el cuerpo cuesta 0,098 ms (microprueba).
- **Lógica:** no hay colecciones que crezcan sin límite (`turnQueue` acotada a `TURN_QUEUE_MAX`, la serpiente a 300 celdas); `stepTimer` se resta del intervalo en cada paso; no hay relojes de animación sin acotar (`respawnTimer` se reinicia al reaparecer).
- **Audio:** el juego no tiene. **Imagen:** una sola, creada en `create`.
- **Por evento, no por frame:** `spawnFruit` crea un `Set`, un arreglo con `map` y otro de hasta 300 celdas libres (`game.ts:118-139`) y `resetSnake` usa `Array.from` (`game.ts:143`). Corren una vez por fruta (~1 por segundo) y una vez por vida perdida.

## Rutas y archivos

```
lib/arcade/snake/
  game.ts            (cambia)  loop que termina en gameover/win, resume sin reinicio tras el fin, readInput sin map/some, drawHead sin asignaciones, step con bucle
  sprites.ts         (cambia)  rectángulo de destino de cada fruta calculado una vez a nivel de módulo
references/
  game-performance.md (cambia) snake pasa a [x] con la medición final
```

**Sin cambios:** `lib/arcade/snake/constants.ts` e `index.ts`; los otros motores (`arkanoid`, `tetris`, `asteroids`, `frogger`); `lib/arcade/engine.ts`, `registry.ts` y `shared/`; `components/` (Reproductor, `GameCanvas`, `CrtScreen`, `MobileGamepad`); `public/` (incluido `public/arcade/snake/fruits.png`); el ranking y las páginas; el resto de `references/`.

## Modelo de datos

No hay cambios de interfaz del contrato ni cachés de canvas. Solo constantes de módulo nuevas y una tabla precalculada.

En `game.ts`:

```ts
// Tamaños de las celdas de la serpiente (constantes: no dependen del frame)
const HEAD_SIZE = CELL - 2 * HEAD_INSET; // 36 px
const BODY_SIZE = CELL - 2 * BODY_INSET; // 34 px

// Lados de los ojos respecto de la dirección: uno a cada costado
const EYE_SIGNS = [-1, 1] as const;
```

En `sprites.ts`, una tabla con el rectángulo de origen y el de destino (relativo a la celda) de cada fruta, calculada con la misma fórmula que hoy:

```ts
interface FruitDraw extends Rect {
  dx: number; // desfase horizontal dentro de la celda: (CELL − w) / 2
  dy: number; // desfase vertical dentro de la celda: (CELL − h) / 2
  w: number; // ancho escalado
  h: number; // alto escalado
}

// Una entrada por fruta, en el mismo orden que FRUITS; se calcula una vez al cargar el módulo
const FRUIT_DRAWS: readonly FruitDraw[] = FRUITS.map(({ sx, sy, sw, sh }) => {
  const scale = Math.min(FRUIT_BOX / sw, FRUIT_BOX / sh);
  const w = sw * scale;
  const h = sh * scale;
  return { sx, sy, sw, sh, dx: (CELL - w) / 2, dy: (CELL - h) / 2, w, h };
});
```

- **Valores:** idénticos a los que hoy se calculan en cada frame (`w = sw * scale`, `h = sh * scale`, `x = col * CELL + (CELL − w) / 2`), así que cada fruta cae en las mismas coordenadas, incluidas las no enteras de la fruta más ancha (kiwi: `h ≈ 30,12`, `dy ≈ 4,94`). Es una decisión: no se redondea para no cambiar el dibujo.
- **Sin estado:** la tabla es de solo lectura y no depende de la imagen ni de skin alguna; `loadFruitSprites()` sigue creando su propio `Image`, como pide el SPEC 09.

No hay sección «Cambios compartidos».

## Plan de implementación

### Paso 1 — Detener el loop al terminar la partida (H1)

En `game.ts`, agregar `isFinished()` y parar el loop tras el último frame de `gameover` y `win`. `stopLoop()` ya existe (`game.ts:360-365`) y `start()` y `resume()` ya lo llaman.

Antes (`game.ts:352-358` y `384-393`):

```ts
function loop(ts: number): void {
  const dt = lastTime === null ? 0 : Math.min((ts - lastTime) / 1000, MAX_DT);
  lastTime = ts;
  update(dt);
  draw();
  rafId = requestAnimationFrame(loop);
}
...
resume() {
  if (destroyed) return;
  // Tras el fin de partida el teclado queda suelto, para que Espacio active los botones del modal
  if (state.phase !== "gameover" && state.phase !== "win") {
    keyboard.attach();
  }
  lastTime = null;
  stopLoop();
  rafId = requestAnimationFrame(loop);
},
```

Después:

```ts
// La partida terminó: el motor ya no cambia nada que mostrar
function isFinished(): boolean {
  return state.phase === "gameover" || state.phase === "win";
}

function loop(ts: number): void {
  const dt = lastTime === null ? 0 : Math.min((ts - lastTime) / 1000, MAX_DT);
  lastTime = ts;
  update(dt);
  draw();
  // Tras el último frame de la partida no se pide otro: el modal tapa el canvas
  if (isFinished()) {
    rafId = null;
    return;
  }
  rafId = requestAnimationFrame(loop);
}
...
resume() {
  if (destroyed) return;
  // Tras el fin de partida no hay nada que redibujar y el teclado queda suelto
  // para que Espacio active los botones del modal
  if (isFinished()) return;
  keyboard.attach();
  lastTime = null;
  stopLoop();
  rafId = requestAnimationFrame(loop);
},
```

El último frame se dibuja **antes** de parar: `finishGame()` corre dentro de `update` (desde `step` → `loseLife` o `spawnFruit`), `draw()` pinta la serpiente y la fruta tal como quedaron y recién entonces el loop se detiene. En `gameover` la serpiente queda donde estaba al chocar (`loseLife` no llama a `resetSnake` con 0 vidas, `game.ts:189-193`); en `win` el tablero queda lleno. El fondo del modal no cambia. `start()` sigue poniendo `state = createInitialState()` y arrancando el loop, así que reiniciar un motor ya terminado (no ocurre hoy: JUGAR DE NUEVO desmonta `GameCanvas`) también funciona.

**Verificación:** `npx tsc --noEmit` y `npm run lint` sin errores; una partida completa hasta «FIN DEL JUEGO» (basta dejar que la serpiente choque contra las paredes tres veces) y script **Medir** de 2000 ms con el modal visible: 0 dibujos por frame (antes 62). P y SEGUIR siguen pausando y reanudando; JUGAR DE NUEVO arranca una partida limpia (puntuación 0, vidas 3, nivel 1, loop vivo).

### Paso 2 — Asignaciones por frame y por paso (H2, H3, H5)

`readInput` (`game.ts:170-184`). Se consumen **las dos** teclas de cada dirección, igual que hoy: `map` no cortocircuita y `consume` limpia la pulsación de cada una.

Antes:

```ts
const pressed = codes.map((code) => keyboard.consume(code)).some(Boolean);
if (!pressed) continue;
```

Después:

```ts
// Se consumen ambas teclas (flecha y letra) aunque la primera ya esté pulsada
let pressed = false;
for (let i = 0; i < codes.length; i++) {
  if (keyboard.consume(codes[i])) pressed = true;
}
if (!pressed) continue;
```

`drawHead` (`game.ts:294-318`). Las constantes `HEAD_SIZE`, `BODY_SIZE` y `EYE_SIGNS` van a nivel de módulo (ver «Modelo de datos»); `side` pasa a dos números.

Antes:

```ts
const size = CELL - 2 * HEAD_INSET;
...
const forward = DELTAS[state.direction];
const side = { col: -forward.row, row: forward.col };
...
for (const sign of [-1, 1]) {
  const ex = cx + forward.col * 8 + side.col * sign * 8;
  const ey = cy + forward.row * 8 + side.row * sign * 8;
```

Después:

```ts
const forward = DELTAS[state.direction];
const sideCol = -forward.row;
const sideRow = forward.col;
...
for (const sign of EYE_SIGNS) {
  const ex = cx + forward.col * 8 + sideCol * sign * 8;
  const ey = cy + forward.row * 8 + sideRow * sign * 8;
```

y `draw()` usa `BODY_SIZE` en vez de `const bodySize = CELL - 2 * BODY_INSET` (`game.ts:339`). El orden de dibujo y los colores no cambian: cabeza con glow, ojo y pupila por lado.

`step` (`game.ts:223-230`). La colisión con el cuerpo recorre el arreglo sin copiarlo; la cola sigue liberándose en el mismo paso salvo que se coma una fruta.

Antes:

```ts
const solid = eating ? state.snake : state.snake.slice(0, -1);
if (solid.some(({ col, row }) => col === newHead.col && row === newHead.row)) {
  loseLife();
  return;
}
```

Después:

```ts
// La cola se libera en este mismo paso, salvo que se coma una fruta.
const solidLength = eating ? state.snake.length : state.snake.length - 1;
for (let i = 0; i < solidLength; i++) {
  const segment = state.snake[i];
  if (segment.col === newHead.col && segment.row === newHead.row) {
    loseLife();
    return;
  }
}
```

**Verificación:** `npx tsc --noEmit` y `npm run lint`; una partida en la que la serpiente: gira con flechas y con WASD, se muerde la cola (pierde una vida), toca la cola que se libera en el mismo paso (no pierde la vida) y come frutas; mismos resultados que antes. Script **Medir** (8 s, autopiloto): dibujos por frame sin cambio (misma lista de dibujos).

### Paso 3 — Rectángulo de destino de la fruta precalculado (H4)

`sprites.ts`: agregar `FRUIT_DRAWS` (ver «Modelo de datos») y reemplazar el cuerpo de `drawFruit`.

Antes (`sprites.ts:79-89`):

```ts
drawFruit(ctx, fruitIndex, col, row) {
  if (!ready) return;
  const { sx, sy, sw, sh } = FRUITS[fruitIndex];
  const scale = Math.min(FRUIT_BOX / sw, FRUIT_BOX / sh);
  const w = sw * scale;
  const h = sh * scale;
  const x = col * CELL + (CELL - w) / 2;
  const y = row * CELL + (CELL - h) / 2;
  ctx.drawImage(image, sx, sy, sw, sh, x, y, w, h);
},
```

Después:

```ts
drawFruit(ctx, fruitIndex, col, row) {
  if (!ready) return;
  const f = FRUIT_DRAWS[fruitIndex];
  ctx.drawImage(
    image,
    f.sx,
    f.sy,
    f.sw,
    f.sh,
    col * CELL + f.dx,
    row * CELL + f.dy,
    f.w,
    f.h,
  );
},
```

`FRUITS` y `FRUIT_COUNT` no cambian; `FRUIT_DRAWS` se construye a partir de `FRUITS` en el módulo.

**Verificación:** `npx tsc --noEmit` y `npm run lint`; script **Medir**: 1 `drawImage` por frame, igual que antes; comparación visual de la fruta contra `.playwright-screenshots/performance/snake/base.png` y de al menos tres frutas de distinto ancho (el kiwi es la de ancho 170, el caso de coordenada no entera).

### Paso 4 — Documentación

En `references/game-performance.md`: `snake` pasa a `[x]` con la medición final (la misma tabla de este spec, medida de nuevo con `npm run dev`), la fila del Resumen actualizada y una línea en el historial.

**Verificación:** `git diff main -- public/ references/` solo muestra `references/game-performance.md`.

## Criterios de aceptación

### Generales

- [ ] `npx tsc --noEmit` sin errores.
- [ ] `npm run lint` sin errores.
- [ ] `git diff main -- public/ references/` solo muestra `references/game-performance.md`.
- [ ] Ningún otro motor cambia (`git diff main --stat` solo muestra `lib/arcade/snake/game.ts`, `lib/arcade/snake/sprites.ts`, este spec y `references/game-performance.md`).
- [ ] `constants.ts` e `index.ts` de Snake sin cambios.

### Rendimiento (única pasada; medido con los scripts de `game-performance-booster`, `npm run dev`, autopiloto sintético)

- [ ] Frame p95 sin estrangular: 17,5 ms → ≤ 20 ms.
- [ ] Frames > 33 ms: 0 % → < 1 %.
- [ ] Frame p95 con CPU ×4: 17,6 ms → ≤ 33 ms.
- [ ] Glow/frame: 1 (máx. 1) → 1 (≤ 10 en todo frame); no se agrega ningún `shadowBlur`.
- [ ] Dibujos por frame en juego: lista de dibujos sin cambio (misma cantidad para la misma longitud de serpiente: 7 + longitud, con 1 `drawImage`).
- [ ] Dibujos por frame tras `onGameOver` (modal visible, ≥ 1 s después del último frame): 62 → **0**; glow 1 → 0; frames del motor en 2 s: 121 → 0.
- [ ] Dibujos por frame en pausa: 0 → 0.
- [ ] Mutaciones del DOM: 1,0/s → ≤ 10/s.
- [ ] `getImageData`, `createLinearGradient`/`Radial`/`Pattern`, `new Image`, `new Audio` por frame: 0 → 0.
- [ ] Heap tras 60 s de partida: sin crecimiento sostenido (−0,3 MB entre 10 s y 60 s → ≤ 5 MB).
- [ ] JS del `loop` jugando (0,11 ms de media, sin los contadores): no sube más de 0,05 ms.
- [ ] Un solo loop vivo: tras pausar y reanudar, los frames del motor igualan a los del navegador (241 de 241 en 4 s).

### Pausa y fin

- [ ] P y SEGUIR pausan y reanudan sin salto de la serpiente ni del temporizador del paso; en pausa 0 dibujos por frame.
- [ ] Al terminar la partida (`gameover` o `win`) el último frame (serpiente y fruta donde quedaron) queda dibujado debajo del modal y 0 dibujos por frame después.
- [ ] Reanudar con la partida terminada (por ejemplo, pausar justo antes del fin) no deja el loop vivo ni dibuja al volver.
- [ ] JUGAR DE NUEVO arranca una partida limpia (puntuación 0, vidas 3, nivel 1, serpiente de 3 celdas, loop de nuevo vivo, canvas dibujándose).

### Sin regresiones visuales

- [ ] La serpiente, la cuadrícula y el fondo se ven igual que en `.playwright-screenshots/performance/snake/base.png`: cuerpo rosa de 34 px, cabeza más clara de 36 px con glow de 12 px y ojos con pupila orientados según la dirección, en las cuatro direcciones.
- [ ] Las 22 frutas se dibujan en las mismas coordenadas y con el mismo tamaño (incluido el kiwi, de coordenada no entera).
- [ ] El parpadeo de 1,5 s al reaparecer se ve igual (intervalo de 0,15 s).

### Sin regresiones de juego

- [ ] Misma puntuación por acción (`10 × nivel` por fruta), mismas vidas (3), mismo avance de nivel (cada 5 frutas) y misma velocidad (`min(16, 8 + nivel − 1)` celdas/s).
- [ ] Mismo comportamiento del teclado: flechas y WASD, cola de hasta 2 giros entre pasos, la reversa no cuenta, y ← no inicia la partida desde la espera; mismo comportamiento del gamepad táctil si más adelante se declara `touch` (el motor sigue leyendo `KeyboardEvent.code`).
- [ ] Mismas colisiones: pared y cuerpo cuestan una vida; la cola que se libera en el mismo paso no cuenta como choque, salvo que se coma una fruta.
- [ ] Mismo comportamiento del teclado y de Espacio sobre los botones del modal tras el fin de partida (el teclado queda suelto).

## Decisiones

- **Sí:** terminar el loop tras el último frame de `gameover` y `win`. Es el incumplimiento más claro del presupuesto (62 dibujos/frame, 1 con glow, contra 0) y el modal tapa el canvas. No hay animación posterior que mostrar: tras `finishGame` la serpiente queda quieta. Esto reemplaza la frase del SPEC 09 «el loop sigue redibujando hasta `destroy()`»; el aspecto debajo del modal no cambia.
- **Sí:** `resume()` no reinicia el loop con la partida terminada. Antes solo evitaba reconectar el teclado; ahora tampoco pide frames.
- **Sí:** quitar `map`/`some` de `readInput`, el arreglo y el objeto de `drawHead`, y el cálculo por frame de `drawFruit`. Son del mismo archivo, de bajo riesgo y su costo es evidente aunque pequeño; es la higiene que pide el presupuesto.
- **Sí:** `slice(0, -1)` + `some` pasa a un bucle en `step`. Corre 8 a 16 veces por segundo y la copia crece con la serpiente; el resultado es el mismo.
- **Sí:** precalcular el destino de la fruta **sin redondear**. Redondear la coordenada del kiwi (`dy ≈ 4,94`) cambiaría el dibujo por una fracción de píxel; el spec exige el mismo look.
- **No:** agrupar el cuerpo en un solo camino (`rect()` + un `fill()`). La microprueba da 0,098 ms para 300 `fillRect` y 0,103 ms para un camino con 300 `rect()`: no gana nada, y con 50 segmentos son 0,017 ms.
- **No:** caché de la cuadrícula en un canvas auxiliar. Es un solo `stroke()` con ~37 segmentos y el JS del `loop` completo cuesta 0,11 ms; la medición no lo justifica.
- **No:** sprite pre-renderizado del glow de la cabeza. Es 1 dibujo con `shadowBlur` por frame (presupuesto ≤ 10) y la cabeza cambia de posición y de ojos en cada paso; el glow en vivo se queda.
- **No:** dibujar solo cuando cambia el estado (en cada paso, 8 a 16 por segundo, y durante el parpadeo). Bajaría los dibujos pero es un cambio de estructura del loop (el parpadeo, la carga del spritesheet y el redibujado tras redimensionar dependerían de una bandera de «sucio»), con riesgo de congelar un frame y sin una medición que lo pida: el p95 está pegado a 60 fps y el JS del `loop` es de 0,11 ms.
- **No:** reutilizar estructuras en `spawnFruit` (`Set`, `map`, arreglo de celdas libres) ni en `resetSnake` (`Array.from`). Corren por evento (una vez por fruta y una por vida perdida), no por frame.
- **No:** reducir el recorte del spritesheet (3790 × 442) ni cambiar la imagen: los assets no se editan ni se recortan, y el `drawImage` con escala de 1 fruta por frame no pesa en la medición.
- **No:** cambios compartidos (`PlayerView`, `GameCanvas`, `MobileGamepad`): 1,0 mutaciones/s, sin renders continuos.
- **No:** `devicePixelRatio` ni cambiar `width`/`height` del canvas, workers ni `OffscreenCanvas`.

Lo decidió el agente (game-performance-booster).

## Riesgos

| Riesgo                                                                                                     | Mitigación                                                                                                                                                                                                                     |
| ---------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Parar el loop en `gameover`/`win` deja el último frame incompleto                                          | `draw()` corre **antes** de la comprobación de `isFinished()` en el mismo tick que `finishGame()`: la serpiente y la fruta tal como quedaron siempre se dibujan antes de parar.                                                |
| `resume()` con la partida terminada deja `rafId = null` y algo espera un loop vivo                         | `stopLoop()` y `destroy()` toleran `rafId === null`; `start()` siempre reinicia el loop; JUGAR DE NUEVO desmonta `GameCanvas` y crea un motor nuevo.                                                                           |
| `readInput` deja de consumir una de las dos teclas y una pulsación queda pendiente para el frame siguiente | El bucle consume **todas** las teclas de la dirección sin cortocircuito, igual que el `map` anterior. Criterio: pulsar flecha y letra a la vez da un solo giro y no deja una pulsación pendiente.                              |
| Un bucle de colisión que cambia el límite (`solidLength`) deja de liberar la cola o la libera de más       | `solidLength` es `length` al comer y `length − 1` si no, igual que `slice(0, -1)`; con una serpiente de 1 segmento el bucle no corre, igual que con un arreglo vacío. Se verifica con los casos de cola y de mordida del plan. |
| La tabla `FRUIT_DRAWS` da otras coordenadas que el cálculo por frame                                       | Usa las mismas expresiones (`scale`, `w`, `h`, `(CELL − w) / 2`), solo movidas a nivel de módulo; se compara a simple vista con la captura base y con tres frutas de distinto ancho.                                           |
| Un objeto reutilizado se filtra entre frames                                                               | No se reutiliza ningún objeto mutable: las constantes nuevas (`EYE_SIGNS`, `FRUIT_DRAWS`, `HEAD_SIZE`, `BODY_SIZE`) son de solo lectura.                                                                                       |
| Una caché construida antes de que cargue la imagen                                                         | `FRUIT_DRAWS` guarda solo números (no depende de la imagen); `loadFruitSprites()` sigue creando el `Image` por motor y `drawFruit` sigue saliendo si `ready` es `false`.                                                       |
| Un canvas redimensionado por la ventana deja el último frame desactualizado tras el fin                    | El `width`/`height` interno no cambia y `CrtScreen` escala el canvas por CSS; además el modal lo tapa.                                                                                                                         |
| La medición en desarrollo no coincide con producción                                                       | Los números de `npm run dev` sirven para comparar antes y después; los criterios principales (0 dibujos tras el fin, glow ≤ 10) son conteos de llamadas y no dependen del servidor.                                            |

## Lo que no entra en este spec

- Los otros motores y el catálogo sin motor.
- Cambios de jugabilidad o de look.
- Cambios compartidos (`PlayerView`, `GameCanvas`, `MobileGamepad`, `shared/`, `engine.ts`): no hay medición que los justifique.
- Caché de la cuadrícula, agrupar el cuerpo en un solo camino, sprite del glow de la cabeza, dibujar solo al cambiar el estado y las asignaciones por evento de `spawnFruit`/`resetSnake`.
- Skins y gamepad táctil de Snake.
- Workers, `OffscreenCanvas`, `devicePixelRatio`, cambiar `width`/`height`, `ctx.filter`, dependencias nuevas y profiling formal con DevTools.

Si alguna de estas llega, va en su propio spec.
