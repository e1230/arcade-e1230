# SPEC 14 — Rendimiento de ARKANOID

> **Estado:** Aprobado
> **Depende de:** SPEC 08 (`specs/08-arkanoid-game.md`)
> **Fecha:** 2026-10-12
> **Objetivo:** Que ARKANOID cumpla el presupuesto de rendimiento (no tiene skins: una sola pasada), sin cambiar su jugabilidad, su sonido ni su look, eliminando el loop que sigue dibujando debajo del modal de fin de partida y limpiando las asignaciones por frame de las explosiones.

## Por qué existe este spec

El motor de ARKANOID es limpio y barato: un solo `requestAnimationFrame` vivo (`start` y `resume` llaman a `stopLoop()` antes de pedir el frame), `dt` acotado con `MAX_DT`, `pause()` que cancela el loop (0 dibujos en pausa), callbacks al Reproductor solo cuando cambia el valor (0,63 mutaciones del DOM por segundo en juego), sin `getImageData`, gradientes ni `new Image`/`new Audio` en el loop, el `Image` y los dos `Audio` base creados una sola vez en `create`, y heap plano durante 60 s de partida. El JS del `loop` cuesta 0,034 ms por frame de media. El audio (`sound.ts`) también está bien: clona el `Audio` base en cada evento, pero el costo medido es de 0,075 ms por clon (0,7 ms el peor) y los clones viven menos de un segundo.

Hay **un solo incumplimiento medido** del presupuesto:

1. **Tras `onGameOver` el loop sigue vivo** (`game.ts:326-332`) y dibuja ~56 veces por frame con el modal «FIN DEL JUEGO» encima del canvas, indefinidamente. El presupuesto exige 0 dibujos por frame cuando no hay animación que mostrar. `resume()` (`game.ts:359-366`) también reiniciaría el loop en ese estado.

Además hay tres asignaciones por frame de severidad baja en el mismo archivo y en `sprites.ts`, baratas de corregir en el mismo paso.

### Medición inicial (2026-10-12, servidor de desarrollo, 1280 × 900, sin estrangular salvo donde se indica)

ARKANOID no declara `skins`, así que hay una sola pasada. La partida se mantuvo viva con un autopiloto de medición (un `mousemove` sintético sobre el canvas que sigue la posición de la bola, tomada del `drawImage` del sprite de la bola, y un Espacio sintético cada 400 ms para el saque tras perder una vida). El `mousemove` y el Espacio son la entrada normal del juego; el autopiloto vive fuera del motor.

| Escenario            | p95 (ms) | Frames > 33 ms | Glow/frame | Dibujos/frame                 | Mutaciones/s |
| -------------------- | -------- | -------------- | ---------- | ----------------------------- | ------------ |
| Normal (8 s)         | 17,4     | 0 %            | 0          | 31,49 (30,49 `drawImage`)     | 0,63         |
| CPU ×4 (8 s)         | 17,5     | 0 %            | 0          | 19,09                         | no medido    |
| Pausa (2 s)          | —        | —              | 0          | **0**                         | —            |
| Fin de partida (2 s) | —        | —              | 0          | **56,47** (55,46 `drawImage`) | —            |

Medición complementaria:

- Con el tablero completo (60 bloques) el motor dibuja 62,13 veces por frame (60 bloques, paleta, bola y el `fillRect` del fondo), con 0 `setLineDash`, gradientes, `getImageData` y `save()` por frame.
- JS de la función `loop` (envolviendo `requestAnimationFrame`, sin los contadores, 368 frames): 0,034 ms de media, p95 0,1 ms, máximo 0,6 ms.
- Audio: 15 clones y 15 `play()` en una ventana de 8 s (≈ 2 por segundo; 89 en ~70 s de partida con el autopiloto), 0 `new Audio` en el loop. Micro-benchmark de `cloneNode()` + `play()` en el hilo principal (20 repeticiones): 0,075 ms de media, 0,7 ms el peor; todos los `play()` se resolvieron.
- Heap cada 5 s durante 60 s de partida (autopiloto, nivel 1 a 2): entre 14,7 y 15,4 MB, sin tendencia; 15,0 MB a los 10 s y 15,4 MB a los 60 s (+0,4 MB). Ventana de 8 s con CPU ×4: +0,16 MB.

Salvedades de la medición:

- El p95 de frame sale pegado a ~17,4 ms (60 fps): el equipo tiene mucho margen y no discrimina. Lo que sí discrimina son los contadores del contexto 2D y el JS del `loop`.
- El estrangulamiento CPU ×4 por CDP no tuvo efecto medible en este equipo (ya lo registra `references/game-performance.md`); el p95 «con CPU ×4» no es informativo, por eso los criterios usan los contadores y el JS del `loop` además del p95.
- Los dibujos por frame del escenario normal bajan de 31 a 19 entre ventanas porque el autopiloto va rompiendo bloques: no es ruido, es el tablero vaciándose.
- Las filas de pausa y de fin de partida solo miden dibujos (el p95 no aplica: no hay loop del motor).
- Captura base: `.playwright-screenshots/performance/arkanoid/base.png` (tablero del nivel 1; el nivel 1 conserva su aspecto: sprites escalados desde `spritesheet-breakout.png`).

## Alcance

### Incluye

- `lib/arcade/arkanoid/game.ts`
  - El loop termina tras dibujar el último frame de `gameover` o `win`, cuando ya no quedan explosiones animándose; `resume()` no lo reinicia en ese estado.
  - `updateExplosions` compacta el arreglo en el sitio en vez de crear uno nuevo con `filter` cada frame; `breakBlocks` busca el bloque golpeado con un bucle `for` en vez de `find` con un closure por frame.
- `lib/arcade/arkanoid/sprites.ts`
  - Los recortes de las explosiones (7 colores × 4 cuadros) se calculan una sola vez a nivel de módulo en vez de crear un objeto con spread por explosión por frame.
- `references/game-performance.md`: marcar `arkanoid` como `[x]` con la medición final.

### Fuera de alcance

- Los otros motores (tetris, snake, asteroids, frogger) y el catálogo sin motor.
- Cualquier cambio de jugabilidad (física, velocidades, rebotes, puntuación, vidas, niveles, saque con Espacio) o de look (los sprites, el escalado 32×16 a 64×24, las coordenadas fraccionarias de paleta y bola).
- Cambios en `sound.ts`: ver «Decisiones».
- `PlayerView`, `GameCanvas`, `PlayerHud`, `CrtScreen`, `MobileGamepad`, `lib/arcade/shared/` y `lib/arcade/engine.ts`: la medición no muestra renders ni mutaciones fuera de lo esperado (0,63 mutaciones/s), así que no hay «Cambios compartidos».
- Caché de la capa de bloques, workers, `OffscreenCanvas`, `devicePixelRatio`, cambiar `width`/`height`, `ctx.filter`, dependencias nuevas y profiling formal con DevTools.

## Hallazgos

| #   | `archivo:línea`                       | Función            | Patrón                                                                                                                                                                                                       | Frecuencia                                              | Skins | Severidad | Evidencia                                                                          |
| --- | ------------------------------------- | ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------- | ----- | --------- | ---------------------------------------------------------------------------------- |
| H1  | `game.ts:326-332` y `game.ts:359-366` | `loop`, `resume`   | Tras `finishGame()` (`game.ts:146-150`) el loop sigue llamando `update` y `draw` y pidiendo frames con el modal encima, y `resume()` también lo reiniciaría. Solo quedan por animar las explosiones (0,15 s) | por frame, de forma indefinida                          | única | Alta      | 56,47 dibujos/frame (55,46 `drawImage`) con «FIN DEL JUEGO» visible; presupuesto 0 |
| H2  | `game.ts:234-239`                     | `updateExplosions` | `state.explosions.filter(...)` crea un arreglo nuevo (y un closure) en cada frame, aunque esté vacío                                                                                                         | por frame (también en pausa de saque)                   | única | Baja      | Costo evidente; un arreglo y un closure por frame durante toda la partida          |
| H3  | `game.ts:207-209`                     | `breakBlocks`      | `state.blocks.find((block) => ...)` crea un closure por frame                                                                                                                                                | por frame                                               | única | Baja      | Costo evidente; un closure por frame                                               |
| H4  | `sprites.ts:109-123`                  | `drawExplosion`    | Crea un objeto `{ sx, sy, ...EXPLOSION_SIZE }` por explosión por frame (spread incluido)                                                                                                                     | por explosión por frame (≤ 9 frames de 0,15 s cada una) | única | Baja      | Costo evidente; las 28 combinaciones (7 colores × 4 cuadros) son constantes        |

Lo que se revisó y está bien (sin hallazgo):

- **Loop y ciclo de vida:** un solo `requestAnimationFrame` vivo (`start` y `resume` llaman a `stopLoop()` antes), `dt` acotado con `MAX_DT` y `lastTime = null` en `start`/`resume`, `pause()` cancela el loop, suelta el teclado y el `mousemove` y detiene los sonidos, `destroy()` cancela el loop, quita los listeners (`keyboard.detach()` y el `mousemove` del canvas), libera los callbacks del `Image` y detiene los sonidos, y no hay `setTimeout`/`setInterval`.
- **Callbacks:** `onScore` (`game.ts:220`), `onLevel` (`game.ts:227`) y `onLives` (`game.ts:245`) solo al cambiar el valor; los de `start()` emiten los valores iniciales una sola vez. 0,63 mutaciones/s medidas.
- **Audio** (`sound.ts`): los dos `Audio` base se crean una vez en `create`; cada evento clona el base (≤ 3 simultáneos: rebote de pared o paleta más rotura), los clones salen de `active` al terminar o ser rechazados, `pause()` y `destroy()` los detienen y el motor no guarda estado de módulo. Costo medido de clonar y reproducir: 0,075 ms de media. No hay fuga (heap plano 60 s).
- **Dibujo:** 0 `shadowBlur`, 0 `setLineDash`, 0 gradientes/patrones, 0 `getImageData`, 0 `save()`; el spritesheet es un solo `Image` cargado una vez en `loadSprites()`; ≈ 62 `drawImage` por frame como máximo.
- **Lógica:** la colisión bola-bloques es O(60) por frame y rompe como máximo un bloque; las explosiones están acotadas por `EXPLOSION_DURATION` (0,15 s); `loadLevel` usa `map` solo al cargar un nivel (por evento).
- **Pendiente bajo descartado:** `handleMouseMove` llama `getBoundingClientRect()` por evento de mouse. No hay mutaciones de DOM en juego (la lectura de layout no fuerza recálculo), así que su costo es despreciable y arreglarlo exigiría invalidar la caché al redimensionar.

## Rutas y archivos

```
lib/arcade/arkanoid/
  game.ts            (cambia)  loop que termina en gameover/win sin explosiones, resume, updateExplosions en el sitio, breakBlocks sin closure
  sprites.ts         (cambia)  recortes de explosión precalculados a nivel de módulo
references/
  game-performance.md (cambia) arkanoid pasa a [x] con la medición final
```

**Sin cambios:** `lib/arcade/arkanoid/constants.ts`, `levels.ts`, `sound.ts`, `index.ts`; los otros motores (`asteroids`, `frogger`, `snake`, `tetris`); `lib/arcade/engine.ts`, `registry.ts` y `shared/`; `components/` (Reproductor, `GameCanvas`, `CrtScreen`, `MobileGamepad`); `public/` (spritesheet y sonidos sin tocar); el ranking y las páginas; el resto de `references/`.

## Modelo de datos

No hay cachés nuevas ni cambios de interfaz. Solo una constante de módulo en `sprites.ts`:

```ts
// Recortes de explosión por color y cuadro, calculados una vez al cargar el módulo
function buildExplosionRects(): Record<BlockColor, Rect[]> {
  const result = {} as Record<BlockColor, Rect[]>;
  for (const color of Object.keys(EXPLOSION_SY) as BlockColor[]) {
    result[color] = EXPLOSION_SX.map((sx) => ({
      sx,
      sy: EXPLOSION_SY[color],
      ...EXPLOSION_SIZE,
    }));
  }
  return result;
}

const EXPLOSION_RECTS = buildExplosionRects();
```

Los valores salen de las mismas constantes (`EXPLOSION_SX`, `EXPLOSION_SY`, `EXPLOSION_SIZE`), incluido el descuido de la referencia que hace que `gray` use las coordenadas de `red`: el aspecto no cambia. La construcción es a nivel de módulo y es pura (sin `window` ni `Image`), así que es segura en el servidor.

No hay sección «Cambios compartidos».

## Plan de implementación

### Paso 1 — Detener el loop al terminar la partida (H1)

En `game.ts`, agregar el predicado `isIdle` y usarlo en `loop` y en `resume`.

Antes (`game.ts:326-332`):

```ts
function loop(ts: number): void {
  const dt = lastTime === null ? 0 : Math.min((ts - lastTime) / 1000, MAX_DT);
  lastTime = ts;
  update(dt);
  draw();
  rafId = requestAnimationFrame(loop);
}
```

Después:

```ts
// Sin animaciones pendientes tras el fin de partida: el canvas queda con su último frame
function isIdle(): boolean {
  return state.phase !== "playing" && state.explosions.length === 0;
}

function loop(ts: number): void {
  const dt = lastTime === null ? 0 : Math.min((ts - lastTime) / 1000, MAX_DT);
  lastTime = ts;
  update(dt);
  draw();
  // Tras el último frame no se vuelve a pedir otro: el modal tapa el canvas
  if (isIdle()) {
    rafId = null;
    return;
  }
  rafId = requestAnimationFrame(loop);
}
```

Antes (`game.ts:359-366`):

```ts
resume() {
  if (destroyed) return;
  if (state.phase === "playing") attachInput();
  lastTime = null;
  stopLoop();
  rafId = requestAnimationFrame(loop);
},
```

Después:

```ts
resume() {
  if (destroyed) return;
  if (state.phase === "playing") attachInput();
  lastTime = null;
  stopLoop();
  // Si la partida ya terminó y no queda nada animándose, no hay nada que redibujar
  if (!isIdle()) rafId = requestAnimationFrame(loop);
},
```

`start()` no cambia: crea un estado en fase `playing`, así que `isIdle()` es falso y el loop arranca. Las explosiones de los últimos bloques siguen animándose hasta terminar (0,15 s) antes de detener el loop, igual que hoy.

**Verificación:** `npx tsc --noEmit` y `npm run lint` sin errores; una partida completa hasta «FIN DEL JUEGO» y otra hasta ganar los 5 niveles (o forzar el fin); script **Medir** de 2000 ms con el modal visible: 0 dibujos por frame (antes 56,47). JUGAR DE NUEVO arranca una partida limpia.

### Paso 2 — Asignaciones por frame (H2, H3, H4)

`game.ts`, `updateExplosions` (`game.ts:234-239`).

Antes:

```ts
function updateExplosions(dt: number): void {
  for (const explosion of state.explosions) explosion.elapsed += dt;
  state.explosions = state.explosions.filter(
    (explosion) => explosion.elapsed < EXPLOSION_DURATION,
  );
}
```

Después (mismo orden y mismo criterio de permanencia):

```ts
function updateExplosions(dt: number): void {
  const list = state.explosions;
  let kept = 0;
  for (let i = 0; i < list.length; i++) {
    const explosion = list[i];
    explosion.elapsed += dt;
    if (explosion.elapsed < EXPLOSION_DURATION) list[kept++] = explosion;
  }
  list.length = kept;
}
```

`game.ts`, `breakBlocks` (`game.ts:207-209`).

Antes:

```ts
const hit = state.blocks.find((block) => block.alive && overlapsBall(block));
if (!hit) return false;
```

Después (el primer bloque vivo en orden de `LEVELS`, igual que `find`):

```ts
let hit: Block | null = null;
for (const block of state.blocks) {
  if (block.alive && overlapsBall(block)) {
    hit = block;
    break;
  }
}
if (!hit) return false;
```

`sprites.ts`, `drawExplosion` (`sprites.ts:109-123`): agregar `EXPLOSION_RECTS` (ver «Modelo de datos») después de `EXPLOSION_SY`.

Antes:

```ts
drawExplosion: (ctx, color, frame, x, y, w, h) => {
  const index = Math.max(0, Math.min(EXPLOSION_FRAME_COUNT - 1, frame));
  draw(
    ctx,
    { sx: EXPLOSION_SX[index], sy: EXPLOSION_SY[color], ...EXPLOSION_SIZE },
    x, y, w, h,
  );
},
```

Después:

```ts
drawExplosion: (ctx, color, frame, x, y, w, h) => {
  const index = Math.max(0, Math.min(EXPLOSION_FRAME_COUNT - 1, frame));
  draw(ctx, EXPLOSION_RECTS[color][index], x, y, w, h);
},
```

**Verificación:** `npx tsc --noEmit` y `npm run lint`; una partida rompiendo bloques en el nivel 1: las explosiones se ven igual que en el original (4 cuadros, 0,15 s, mismo color por bloque, incluido el gris del nivel 2 que usa el cuadro rojo); script **Medir** (8 s): dibujos por frame y p95 sin cambio; puntuación, vidas y nivel iguales para la misma secuencia.

### Paso 3 — Documentación

En `references/game-performance.md`: `arkanoid` pasa a `[x]` con la medición final (la misma tabla de este spec, medida de nuevo con `npm run dev`), la fila del Resumen actualizada y una línea en el historial. Agregar a «Notas de medición» el autopiloto de este spec si se reutiliza para tetris, snake y asteroids.

**Verificación:** `git diff main -- public/ references/` solo muestra `references/game-performance.md`.

## Criterios de aceptación

### Generales

- [ ] `npx tsc --noEmit` sin errores.
- [ ] `npm run lint` sin errores.
- [ ] `git diff main -- public/ references/` solo muestra `references/game-performance.md`.
- [ ] Ningún otro motor cambia (`git diff main --stat` solo muestra `lib/arcade/arkanoid/game.ts`, `lib/arcade/arkanoid/sprites.ts`, este spec y `references/game-performance.md`).
- [ ] `sound.ts`, `constants.ts` y `levels.ts` sin cambios.

### Rendimiento (única pasada; medido con los scripts de `game-performance-booster`, `npm run dev`)

- [ ] Frame p95 sin estrangular: 17,4 ms → ≤ 20 ms.
- [ ] Frames > 33 ms: 0 % → < 1 %.
- [ ] Frame p95 con CPU ×4: 17,5 ms → ≤ 33 ms.
- [ ] Glow/frame: 0 → ≤ 10 (sin `shadowBlur`).
- [ ] Dibujos por frame tras `onGameOver` (modal visible, ≥ 1 s después del último frame): 56,47 → **0**.
- [ ] Dibujos por frame en pausa: 0 → 0.
- [ ] Mutaciones del DOM: 0,63/s → ≤ 10/s.
- [ ] `getImageData`, `createLinearGradient`/`Radial`/`Pattern`, `new Image`, `new Audio` por frame: 0 → 0.
- [ ] Dibujos por frame en juego normal con el mismo tablero: sin cambio (62,13 con el tablero completo del nivel 1).
- [ ] Heap tras 60 s de partida: sin crecimiento sostenido (+0,4 MB entre 10 s y 60 s → ≤ 5 MB).
- [ ] JS del `loop` de 0,034 ms de media: no sube más de 0,02 ms.
- [ ] Sonidos: la misma cantidad de `play()` por evento (un clon por rebote y uno por bloque roto) en una ventana comparable.

### Pausa y fin

- [ ] P y SEGUIR pausan y reanudan sin salto de la bola ni de la paleta; en pausa 0 dibujos por frame.
- [ ] Tras perder la última vida: la explosión pendiente (si la hay) termina de animarse, el modal «FIN DEL JUEGO» aparece y 0 dibujos por frame después.
- [ ] Tras romper el último bloque del nivel 5 («win»): la última explosión se anima, el modal aparece y 0 dibujos por frame después.
- [ ] Ganar o perder con el Reproductor pausado por pérdida de foco no deja el loop vivo ni dibuja al volver.
- [ ] JUGAR DE NUEVO arranca una partida limpia (puntuación 0, 3 vidas, nivel 1, loop de nuevo vivo, canvas dibujándose).

### Sin regresiones visuales

- [ ] El tablero del nivel 1 se ve igual que `.playwright-screenshots/performance/arkanoid/base.png` (bloques, paleta, bola y fondo).
- [ ] Las explosiones de cada color (incluido gris, que usa los cuadros del rojo) se ven iguales que antes.

### Sin regresiones de juego

- [ ] Misma puntuación por bloque (10), mismas vidas (3), mismo avance de nivel (5 niveles, velocidad ×1,0 a ×1,46).
- [ ] La bola rebota igual en paredes, techo, paleta y bloques; un solo bloque por frame.
- [ ] Mismo comportamiento del teclado (← →, Espacio para sacar tras perder una vida, P) y del mouse (la paleta sigue al cursor).
- [ ] Los sonidos de rebote y rotura suenan igual; pausa, fin de partida y salida los detienen.

## Decisiones

- **Sí:** terminar el loop tras el último frame de `gameover`/`win`, una vez que no quedan explosiones. Es el único incumplimiento medido del presupuesto (56,47 dibujos/frame contra 0) y el modal tapa el canvas.
- **Sí:** esperar a que terminen las explosiones antes de detener el loop (en vez de parar en seco al emitir `onGameOver`). Así el último bloque (o la bola perdida con una explosión pendiente) se anima completa como hoy y el look no cambia.
- **Sí:** corregir en el mismo spec las asignaciones por frame de `updateExplosions`, `breakBlocks` y `drawExplosion`: son del mismo archivo o de su vecino, de bajo riesgo y de un costo evidente aunque pequeño.
- **No:** pool de audio con elementos reutilizados en `sound.ts`. El costo medido de `cloneNode()` + `play()` es 0,075 ms de media (0,7 ms el peor), hay ≈ 1 a 2 sonidos por segundo, ≤ 3 simultáneos, los clones se liberan al terminar y el heap es plano 60 s. Un pool que reinicia `currentTime` cambiaría cómo se solapan los rebotes seguidos (el sonido se cortaría), es decir, el comportamiento audible.
- **No:** caché de la capa de bloques en un canvas auxiliar. Son ≤ 62 `drawImage` por frame y el JS del `loop` cuesta 0,034 ms: la medición no lo justifica y, al romperse bloques, habría que invalidarla.
- **No:** cachear `getBoundingClientRect()` en `handleMouseMove`: sin mutaciones del DOM en juego la lectura es barata, e invalidar la caché al redimensionar añade riesgo sin ganancia medible.
- **No:** coordenadas enteras para la paleta y la bola, ni `imageSmoothingEnabled = false`: cambiarían el look (el sprite de 32×16 se escala a 64×24 suavizado) y la posición dibujada.
- **No:** cambios compartidos (`PlayerView`, `GameCanvas`, `MobileGamepad`): 0,63 mutaciones/s, sin renders continuos.
- **No:** `devicePixelRatio` ni cambiar `width`/`height` del canvas, workers ni `OffscreenCanvas`.

Lo decidió el agente (game-performance-booster).

## Riesgos

| Riesgo                                                                                                          | Mitigación                                                                                                                                                                                   |
| --------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| El loop se detiene con una explosión aún en pantalla o antes de dibujar el último frame                         | `isIdle()` exige `phase !== "playing"` y `explosions.length === 0`, y se evalúa **después** de `draw()`: el último frame (sin explosiones) siempre se dibuja antes de parar.                 |
| El canvas queda con un frame desactualizado tras el fin (p. ej. se redimensiona la ventana)                     | Redimensionar la ventana no borra el canvas (sus `width`/`height` internos no cambian) y `CrtScreen` lo escala por CSS; el modal tapa el canvas de todos modos.                              |
| `resume()` llamado con la partida terminada deja `rafId = null` y alguien espera un loop vivo                   | `stopLoop()` y `destroy()` ya toleran `rafId === null`; `start()` siempre reinicia el loop. JUGAR DE NUEVO desmonta `GameCanvas` y crea un motor nuevo.                                      |
| Un `splice`/compactación en el sitio de `explosions` altera el orden de las explosiones o deja elementos viejos | La compactación conserva el orden y fija `list.length = kept`; el criterio de permanencia es el mismo (`elapsed < EXPLOSION_DURATION`). Se verifica visualmente con varias roturas seguidas. |
| Un objeto reutilizado se filtra entre frames                                                                    | `EXPLOSION_RECTS` es de solo lectura (nadie lo muta; `draw` solo desestructura). El arreglo `state.explosions` se recrea en `loadLevel` y en `start()` (`createInitialState`).               |
| Una caché construida antes de que carguen las imágenes                                                          | No se crea ninguna caché de imágenes: `EXPLOSION_RECTS` solo guarda coordenadas, sin tocar el `Image`; `draw` sigue protegido por `ready`.                                                   |
| La medición en desarrollo no coincide con producción                                                            | Los números de `npm run dev` sirven para comparar antes y después; el criterio principal (0 dibujos tras el fin) es un conteo de llamadas y no depende del servidor.                         |
| El `gray` de la explosión usa los cuadros del rojo (descuido de la referencia)                                  | `EXPLOSION_RECTS` se construye desde `EXPLOSION_SY`, que conserva ese valor; se verifica con el nivel 2, que usa `gray` en la fila superior de la pirámide.                                  |

## Lo que no entra en este spec

- Los otros motores y el catálogo sin motor.
- Cambios de jugabilidad, de sonido o de look.
- Cambios compartidos (`PlayerView`, `GameCanvas`, `MobileGamepad`, `shared/`, `engine.ts`): no hay medición que los justifique.
- Un pool de audio, la caché de la capa de bloques y la caché del rectángulo del canvas en el `mousemove`.
- Workers, `OffscreenCanvas`, `devicePixelRatio`, cambiar `width`/`height`, `ctx.filter`, dependencias nuevas y profiling formal con DevTools.

Si alguna de estas llega, va en su propio spec.
