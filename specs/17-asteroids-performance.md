# SPEC 17 — Rendimiento de ASTEROIDS

> **Estado:** Aprobado
> **Depende de:** SPEC 05 (`specs/05-asteroids-game.md`), SPEC 10 (`specs/10-asteroids-skins.md`)
> **Fecha:** 2026-10-12
> **Objetivo:** Que ASTEROIDS cumpla el presupuesto de rendimiento en todas sus skins (Clásico, Neón y Retro), sin cambiar su jugabilidad ni su look, eliminando el loop que sigue dibujando debajo del modal de fin de partida, los 11 a 19 dibujos con `shadowBlur` por frame de Neón (asteroides y balas) y las asignaciones por frame de las partículas, del trazo en Retro y del bucle de actualización.

## Por qué existe este spec

El motor de ASTEROIDS es pequeño y, en este equipo, corre a 60 fps en las tres skins: el JS del `loop` cuesta 0,07 a 0,10 ms por frame, el heap no crece, el Reproductor solo muta el DOM cuando cambia la puntuación, las vidas o el nivel (0,5 a 2,3 mutaciones por segundo) y hay un solo `requestAnimationFrame` vivo (241 frames del motor contra 240 del navegador en 4 s tras pausar y reanudar, en las tres skins). La pausa cumple: 0 dibujos por frame. No hay gradientes, `getImageData`, `new Image`, `new Audio` ni `setLineDash` por frame.

Hay **dos incumplimientos medidos**:

1. **Tras `onGameOver` el loop sigue vivo** (`game.ts:281-287`) y dibuja sin parar con el modal «FIN DEL JUEGO» encima: 13 dibujos por frame en Neón, **12 de ellos con `shadowBlur`** (121 de 121 frames del navegador en 2 s), y 27 en Retro. El presupuesto exige 0 después del último frame. La única animación posterior a `killShip` son las partículas de la explosión final (≤ 1,1 s); después el estado queda inmóvil. `resume()` (`game.ts:303-307`) tampoco distingue ese estado.
2. **Neón dibuja entre 11 y 19 veces por frame con `shadowBlur`** (presupuesto ≤ 10): cada asteroide (`entities.ts:123-134`) y cada bala (`entities.ts:55-73`) activa el glow en vivo. Con el autopiloto de medición, el promedio fue 11,46 (máx. 18) en juego normal y 13,33 (máx. 19) con CPU ×4; en otra ventana, 14,56 (máx. 17). El autopiloto gira en el centro disparando y limpia el campo, así que es una cota inferior: con asteroides y balas de nivel alto cada uno suma un dibujo con glow. En una microprueba aparte (canvas de 800 × 600, 20 contornos de 10 vértices, lectura de un píxel para forzar el vaciado), 20 trazos con `shadowBlur 8` cuestan 4,2 ms por frame contra 0,83 ms sin glow (7,8 ms con 40), unos 0,17 ms por dibujo con glow que en un celular de gama media (CPU ×4) pasan de 15 ms. En este equipo no se nota porque el p95 sale pegado a 60 fps.

Además hay asignaciones por frame de severidad baja o media que escalan con las entidades: `hexToRgba` por partícula y por frame en Clásico y Neón (`entities.ts:251`), `points.map` con dos arreglos por vértice y por asteroide en Retro (`render.ts:97-100`), cinco `forEach` y cuatro `filter` por frame más un `filter().concat()` en `update` (`game.ts:163-249`), y literales de puntos de la nave y del power-up por frame (`entities.ts:327-357`, `173-182`).

### Medición inicial (2026-10-12, servidor de desarrollo, 1280 × 900, sin estrangular salvo donde se indica)

El juego no termina solo sin entrada de forma predecible, así que la partida se midió con un autopiloto que vive fuera del motor: gira la nave con `ArrowRight` sostenido y despacha un `keydown`/`keyup` sintético de `Space` cada 210 ms en `window`, la misma entrada que despacha `MobileGamepad`. El autopiloto no se versiona. El inicio de cada frame del motor se detectó en el `fillRect` del fondo (800 × 600 en Clásico y Neón; 200 × 150, el búfer, en Retro) para sacar el máximo por frame además del promedio.

| Skin    | Escenario                           | p95 (ms) | Frames > 33 ms | Glow/frame (máx.) | Dibujos/frame (máx.)       | Mutaciones/s |
| ------- | ----------------------------------- | -------- | -------------- | ----------------- | -------------------------- | ------------ |
| Clásico | Normal (8 s)                        | 17,4     | 0 %            | 0 (0)             | 24,56 (48)                 | 1,38         |
| Clásico | CPU ×4 (8 s)                        | 17,6     | 0 %            | 0 (0)             | 17,32 (33)                 | 0,75         |
| Clásico | Pausa (2 s)                         | —        | —              | 0                 | **0** (0 frames)           | —            |
| Clásico | Fin de partida                      | —        | —              | no medido         | no medido                  | —            |
| Neón    | Normal (8 s)                        | 17,5     | 0 %            | **11,46 (18)**    | 20,96 (37)                 | 0,88         |
| Neón    | CPU ×4 (8 s)                        | 17,5     | 0 %            | **13,33 (19)**    | 22,89 (46)                 | 1,38         |
| Neón    | Normal (8 s, ventana posterior)     | 17,3     | 0 %            | 7,76 (15)         | 12,79 (53)                 | 0,88         |
| Neón    | Normal (4 s, tras pausa)            | 17,0     | 0 %            | **14,56 (17)**    | 27,78 (46)                 | 2,25         |
| Neón    | Pausa (2 s)                         | —        | —              | 0                 | **0** (0 frames)           | —            |
| Neón    | Fin de partida (2 s, modal visible) | —        | —              | **12 (12)**       | **13** (121 de 121 frames) | 0            |
| Retro   | Normal (8 s)                        | 17,6     | 0 %            | 0 (0)             | 420,28 (509)               | 1,38         |
| Retro   | CPU ×4 (8 s)                        | 17,5     | 0 %            | 0 (0)             | 111,06 (213)               | 0,75         |
| Retro   | Pausa (2 s)                         | —        | —              | 0                 | **0** (0 frames)           | —            |
| Retro   | Fin de partida (2 s, modal visible) | —        | —              | 0                 | **27** (121 de 121 frames) | 0            |

Medición complementaria:

- **JS de la función `loop`** (envolviendo `requestAnimationFrame` en una carga sin los contadores, con el mismo autopiloto): Retro 0,097 ms de media en dos ventanas de 8 s (p95 0,3 y 0,4, máx. 1,1); Neón 0,093 ms y 0,067 ms (p95 0,4 y 0,2, máx. 1,9). Clásico no se cronometró por separado. La resolución del reloj es de 0,1 ms; no incluye el rasterizado, donde se paga el `shadowBlur`.
- **Un solo loop vivo:** tras pausar con P y reanudar, 241 frames del motor contra 240 del navegador en 4 s, en Clásico, Neón y Retro.
- **Heap en Neón, cada 5 s durante 60 s** (el autopiloto perdió la partida dentro de la ventana, así que incluye el tramo de fin de partida): 15,64 / 15,47 / 15,43 / 15,58 / 15,28 / 15,52 / 15,75 / 15,15 / 15,38 / 15,61 / 15,83 / 15,26 / 15,49 MB. Sin crecimiento sostenido (15,47 a los 5 s, 15,49 a los 60 s). En ventanas de 8 s: Clásico −2,72 y +0,63 MB, Neón −3,82, 0 y +0,21 MB, Retro −0,44 y −0,10 MB (el recolector oscila; no es fuga).
- **0** `setLineDash`, gradientes y `getImageData` por frame en las tres skins. `save()` por frame: de 4 a 11,29 en Neón y de 3,71 a 9,01 en Clásico según los asteroides en pantalla (uno por contorno vectorial y uno por power-up; Retro 0).
- **Microprueba de Retro** (búfer de 200 × 150 más ampliación a 800 × 600, lectura de un píxel): pasar de 500 a 1000 `fillRect` de 1 × 1 suma unos 0,2 ms por frame. Los 420 a 509 `fillRect` por frame de Retro (`plotLine`) no son un costo que justifique cambiar el dibujo.
- **Mutaciones del DOM:** 0,5 a 2,25 por segundo, todas por puntuación, vidas o nivel.

Salvedades de la medición:

- El p95 de frame sale pegado a 17,3 a 17,6 ms (60 fps) en las tres skins: el equipo tiene mucho margen y no discrimina. Lo que discrimina son los contadores del contexto 2D (dibujos y dibujos con glow por frame) y el JS del `loop`, como ya registra `references/game-performance.md`.
- El estrangulamiento CPU ×4 por CDP no tuvo efecto medible en este equipo: el p95 «con CPU ×4» no es informativo, por eso los criterios usan también los contadores. Las diferencias de dibujos/frame entre ventanas se deben a cuántos asteroides y balas había en pantalla, no al estrangulamiento.
- El autopiloto despeja el campo (gira en el centro y dispara), por lo que los máximos de glow (18 y 19) son una cota inferior de lo que ve un jugador en niveles altos.
- Clásico no se midió en fin de partida: usa el mismo `loop` y `draw` que las otras dos, y el cambio es de ciclo de vida (independiente de la skin).
- Capturas base: `.playwright-screenshots/performance/asteroids/classic-base.png`, `neon-base.png`, `retro-base.png` (inicio de partida con los cuatro asteroides) y `neon-over.png` (modal de fin de partida sobre el último frame).

## Alcance

### Incluye

- `lib/arcade/asteroids/game.ts`
  - `stopLoop()` y `isFinished()`; el loop termina tras dibujar el último frame de `gameover` cuando ya no quedan partículas; `start()` y `resume()` llaman a `stopLoop()` antes de pedir el frame; `resume()` no reinicia el loop terminado ni reconecta el teclado en `gameover`.
  - `update` y `draw` sin `forEach`/`filter`/`concat` por frame: bucles `for` y una función `compact` que quita las entidades muertas en el mismo arreglo.
  - `RenderCache` construida una vez en `create` y pasada a cada `draw`.
  - `imageSmoothingEnabled = false` fijado una vez en `create` (Retro), no en cada frame.
- `lib/arcade/asteroids/render.ts`
  - `RenderCache` (tabla de 101 colores de partícula y sprite de la bala), `createRenderCache(skin)`, `createHaloSprite` y `drawHalo` para el glow de Neón.
  - `strokeShape` con `x, y, rotation` en lugar de un objeto y, en Retro, con dos arreglos de trabajo reutilizados en vez de `points.map`.
- `lib/arcade/asteroids/entities.ts`
  - `Asteroid`: halo con glow pre-renderizado (una vez por asteroide, en el primer `draw` de Neón) y contorno sin glow en vivo.
  - `Bullet`: sprite con glow desde la caché, a coordenadas enteras.
  - `Particle`: color por tabla en vez de `hexToRgba` por frame.
  - `Ship` y `PowerUp`: puntos del casco, de la llama y del rombo como constantes de módulo o arreglos de trabajo, sin objetos por frame.
- `references/game-performance.md`: marcar `asteroids` como `[x]` con la medición final.

### Fuera de alcance

- Los otros motores (arkanoid, tetris, snake, frogger) y el catálogo sin motor.
- Cualquier cambio de jugabilidad (física, tiempos, puntuación, vidas, niveles, power-up, colisiones, aparición de asteroides) o de look (colores, grosores, glow de 8 px, partículas, llama, textos «3x»).
- `PlayerView`, `GameCanvas`, `PlayerHud`, `CrtScreen`, `MobileGamepad`, `lib/arcade/shared/` y `lib/arcade/engine.ts`: la medición no muestra renders ni mutaciones fuera de lo esperado (≤ 2,25 por segundo), así que no hay «Cambios compartidos».
- Sprites de la nave y del power-up, agrupar los `fillRect` de Retro, caché del fondo, índices o cuadrícula espacial para las colisiones y `Asteroid.rot` acotado: ver «Decisiones».
- Declarar `touch` o crear skins nuevas: son trabajo de `mobile-porter` y `skin-designer`.
- Workers, `OffscreenCanvas`, `devicePixelRatio`, cambiar `width`/`height`, `ctx.filter`, dependencias nuevas y profiling formal con DevTools.

## Hallazgos

| #   | `archivo:línea`                                                   | Función                                    | Patrón                                                                                                                                                                                                     | Frecuencia                                               | Skins         | Severidad | Evidencia                                                                                                                                             |
| --- | ----------------------------------------------------------------- | ------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------- | ------------- | --------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| H1  | `game.ts:281-287` y `game.ts:303-307`                             | `loop`, `resume`                           | Tras `killShip()` con la última vida (`game.ts:149-161`) el loop sigue llamando `update` y `draw` y pidiendo frames con el modal encima; `resume()` pide un frame y reconecta el teclado sin mirar la fase | por frame, de forma indefinida                           | las tres      | Alta      | Neón: 13 dibujos/frame (12 con `shadowBlur`), 121 de 121 frames en 2 s; Retro: 27; presupuesto 0                                                      |
| H2  | `entities.ts:123-134` (asteroides) y `entities.ts:55-73` (balas)  | `Asteroid.draw`, `Bullet.draw`             | `applyGlow` + trazo/relleno + `clearGlow` por entidad en cada frame: un dibujo con `shadowBlur 8` por asteroide y por bala                                                                                 | por entidad por frame                                    | Neón          | Alta      | 11,46 de media (máx. 18), 13,33 (máx. 19) con CPU ×4, 14,56 (máx. 17); presupuesto ≤ 10. Microprueba: 20 trazos con glow 4,2 ms contra 0,83 ms sin él |
| H3  | `entities.ts:251`                                                 | `Particle.draw`                            | `hexToRgba(skin.particle, alpha)` por partícula y por frame: `parseInt`, `slice`, `toFixed` y una plantilla de texto nueva (solo hay 101 valores posibles porque el alfa sale con `toFixed(2)`)            | por partícula por frame (hasta decenas)                  | Clásico, Neón | Media     | Costo evidente: un string y un número intermedio por partícula; una explosión grande suma 15 partículas, la nave 14, y conviven varias                |
| H4  | `render.ts:97-100`                                                | `strokeShape` (rama pixel art)             | `points.map(([px, py]) => [...])` crea un arreglo externo y un arreglo por vértice en cada trazo                                                                                                           | por entidad por frame (hasta ~13 arreglos por asteroide) | Retro         | Media     | 420 a 509 `fillRect`/frame suben en proporción a los asteroides; cada asteroide de 8 a 13 vértices suma 9 a 14 arreglos por frame                     |
| H5  | `game.ts:163-249` y `game.ts:251-279`                             | `update`, `draw`                           | Cinco `forEach` con closure, cuatro `filter` y un `filter().concat()` por frame en `update`; cinco `forEach` en `draw`; `newAsteroids` nuevo en cada frame                                                 | por frame                                                | las tres      | Baja      | Costo evidente (~15 arreglos y closures por frame); el JS del `loop` completo es de 0,07 a 0,10 ms, así que es higiene, no un cuello                  |
| H6  | `entities.ts:327-357`, `entities.ts:173-182` y `render.ts:67-114` | `Ship.draw`, `PowerUp.draw`, `strokeShape` | Objeto `origin` por entidad y por frame; arreglos literales del casco (4 puntos), de la llama y del rombo del power-up por frame                                                                           | por entidad por frame                                    | las tres      | Baja      | Costo evidente: el casco `[[20, 0], [-12, -9], [-7, 0], [-12, 9]]` es constante y se recrea cada frame                                                |
| H7  | `game.ts:266`                                                     | `draw`                                     | `ctx.imageSmoothingEnabled = false` asignado en cada frame                                                                                                                                                 | por frame                                                | Retro         | Baja      | Costo evidente: el valor no cambia durante la partida                                                                                                 |
| H8  | `game.ts:290-295` y `game.ts:303-307`                             | `start`, `resume`                          | Piden `requestAnimationFrame` sin cancelar el anterior; el contrato exige un solo loop vivo (`stopLoop()` antes de cada `requestAnimationFrame` inicial)                                                   | por evento                                               | las tres      | Baja      | Hoy no hay doble loop (241 de 240 frames tras pausar y reanudar), pero un `resume()` sin `pause()` previo lo crearía                                  |

Lo que se revisó y está bien (sin hallazgo):

- **Loop y ciclo de vida:** `dt` acotado con `MAX_DT` (`constants.ts:36`) y `lastTime = null` en `start()`/`resume()`; `pause()` cancela el `requestAnimationFrame` y suelta el teclado (0 dibujos en pausa en las tres skins); `destroy()` cancela el loop y hace `keyboard.detach()`; no hay `setTimeout`/`setInterval`.
- **Callbacks:** `setScore`, `setLives` y `setLevel` solo se llaman al cambiar el valor (por asteroide destruido, por nave perdida y por nivel superado), nunca desde el loop sin condición; los de `initGame()` emiten los valores iniciales una vez. Medido: 0,5 a 2,25 mutaciones del DOM por segundo.
- **Asignaciones por evento (no por frame):** `new Asteroid`, `new Particle`, `new Bullet`, `asteroid.split()` y el `push(...tryShoot())` corren por disparo, por destrucción o por explosión. Una fábrica de objetos por evento es normal.
- **Lógica:** las colecciones están acotadas (balas con `BULLET_TTL`, partículas con `ttl`, power-ups con `POWERUP_TTL`, asteroides por `3 + nivel`); `dead` se filtra en cada frame; la colisión balas × asteroides es O(B × A) con B ≤ unas 18 y A ≲ 50 (≈ 900 `Math.hypot` en el peor caso), dentro de los 0,1 ms del `loop`. `Asteroid.rot` crece sin acotar, pero a ≤ 1,2 rad/s no llega a valores que afecten a `Math.sin`/`cos` en una partida.
- **Audio e imágenes:** el juego no tiene.
- **Búfer de Retro:** se crea una vez en `create` (`game.ts:68-75`); `drawImage` del búfer es 1 por frame.
- **Integración:** el Reproductor solo re-renderiza por cambios reales de puntuación, vidas o nivel.

## Rutas y archivos

```
lib/arcade/asteroids/
  game.ts      (cambia)  stopLoop/isFinished, loop que termina en gameover sin partículas, start/resume con stopLoop,
                         update y draw con bucles for y compact, RenderCache creada en create, smoothing de Retro una vez
  render.ts    (cambia)  RenderCache + createRenderCache, createHaloSprite, drawHalo; strokeShape con (x, y, rotation)
                         y arreglos de trabajo en Retro
  entities.ts  (cambia)  Asteroid con halo, Bullet con sprite, Particle con tabla de colores, constantes de puntos de
                         Ship y PowerUp, firmas de draw con la caché
references/
  game-performance.md (cambia) asteroids pasa a [x] con la medición final
```

**Sin cambios:** `lib/arcade/asteroids/constants.ts`, `skins.ts` e `index.ts`; los otros motores (`arkanoid`, `tetris`, `snake`, `frogger`); `lib/arcade/engine.ts`, `registry.ts` y `shared/`; `components/` (Reproductor, `GameCanvas`, `CrtScreen`, `MobileGamepad`); `public/` (el juego no tiene assets); el ranking y las páginas; el resto de `references/`.

## Modelo de datos

No cambia el contrato (`GameEngine`, `GameCallbacks`, `GameDefinition`). Todo lo nuevo es interno del motor y se construye **una vez en `create`** (la skin se fija al crear el motor; no hay «reconstruir al cambiar de skin»), salvo el halo de cada asteroide, que depende de su forma aleatoria y se construye en su primer `draw`.

En `render.ts`:

```ts
// Pasos de alfa de las partículas: `hexToRgba` redondea el alfa a dos decimales, así que solo hay 101 colores posibles
const ALPHA_STEPS = 100;

export interface RenderCache {
  // "rgba(r, g, b, a)" para a = 0, 0.01 … 1, con el color de partícula de la skin
  particleStyles: readonly string[];
  // Bala con glow ya horneado (solo Neón); null en Clásico y Retro
  bulletSprite: HTMLCanvasElement | null;
  // Mitad del lado del sprite de la bala, en px: el centro del círculo cae en (bulletHalf, bulletHalf)
  bulletHalf: number;
}

// Margen de los sprites con glow: 3 σ del desenfoque (σ = shadowBlur / 2) más el trazo.
// Con glow 8 y lineWidth 2 son 18 px, para que el blur no se recorte.
export function glowPad(skin: AsteroidsSkin): number {
  return Math.ceil(skin.glow * 2) + skin.lineWidth;
}

export function createRenderCache(skin: AsteroidsSkin): RenderCache {
  /* ver Plan, paso 4 y 5 */
}

// Solo el halo del glow de un contorno cerrado, sin el trazo, para dibujar el trazo nítido en vivo encima
export function createHaloSprite(
  skin: AsteroidsSkin,
  points: readonly (readonly [number, number])[],
  radius: number,
  color: string,
): HTMLCanvasElement {
  /* ver Plan, paso 5 */
}

export function drawHalo(
  ctx: CanvasRenderingContext2D,
  sprite: HTMLCanvasElement,
  x: number,
  y: number,
  rotation: number,
): void {
  /* ver Plan, paso 5 */
}
```

- **Qué guarda la caché:** la tabla de colores de las partículas (101 strings, para las tres skins; Retro no la usa pero es barata) y, solo si `skin.glow > 0`, el sprite de la bala. Con `skin.glow === 0` (Clásico, Retro) no se crea ningún canvas auxiliar.
- **Sprite de la bala:** un círculo de radio 2 con `fill` y `shadowBlur 8` horneados, en un canvas de `2 × (2 + glowPad)` = 40 px por lado, con el centro en `(20, 20)`. Se dibuja con `drawImage(sprite, Math.round(x) - 20, Math.round(y) - 20)`.
- **Halo del asteroide:** un canvas de `2 × (ceil(radius) + glowPad)` px por lado (de 68 a 136), uno por asteroide, guardado en el propio `Asteroid` (`halo: HTMLCanvasElement | null`). Contiene únicamente el resplandor del contorno rotado a 0, dibujado con el truco de la sombra desplazada (el contorno se traza fuera del lienzo y solo entra su sombra). En vivo se dibuja rotado con `drawHalo` y encima el contorno con `strokeShape` y **sin** glow, así que la línea sigue siendo nítida y vectorial, igual que hoy.
- **Ship y PowerUp:** siguen con glow en vivo (2 y 1 dibujos con `shadowBlur` por frame, ≤ 3 en total).
- **Constantes de módulo nuevas en `entities.ts`:**

```ts
// Casco de la nave: no cambia entre frames
const SHIP_HULL: readonly (readonly [number, number])[] = [
  [20, 0],
  [-12, -9],
  [-7, 0],
  [-12, 9],
];

// Llama del propulsor: solo el largo (índice 1) cambia en cada frame, y se consume en el mismo draw
const FLAME_POINTS: [number, number][] = [
  [-8, -4],
  [-8, 0],
  [-8, 4],
];

// Rombo del power-up: su lado cambia con el pulso, así que son cuatro vértices de trabajo que se reescriben en cada draw
const DIAMOND_POINTS: [number, number][] = [
  [0, 0],
  [0, 0],
  [0, 0],
  [0, 0],
];
```

- **Arreglos de trabajo de `strokeShape` en Retro** (a nivel de módulo en `render.ts`): `const gridX: number[] = []` y `const gridY: number[] = []`, reescritos en cada llamada y leídos en el mismo trazo.
- **Estado del motor:** `const fragments: Asteroid[] = []` dentro del cierre de `createAsteroidsEngine`, vaciado con `fragments.length = 0` al inicio de cada colisión, para los fragmentos que nacen en el frame (reemplaza a `newAsteroids`).

No hay sección «Cambios compartidos».

## Plan de implementación

### Paso 1 — Ciclo de vida del loop (H1, H8)

En `game.ts`: agregar `stopLoop()` e `isFinished()`, y hacer que el loop pare tras el último frame. Las partículas de la explosión final se siguen animando hasta que mueren (comportamiento del SPEC 05: «el loop sigue animando solo las partículas»); lo que cambia es que al morir la última el loop se detiene en vez de seguir hasta `destroy()`.

Antes (`game.ts:281-314`):

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
    initGame();
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
    keyboard.attach();
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

// La partida terminó y ya no queda ninguna partícula que animar: el estado no vuelve a cambiar
function isFinished(): boolean {
  return state.phase === "gameover" && state.particles.length === 0;
}

function loop(ts: number): void {
  const dt = lastTime === null ? 0 : Math.min((ts - lastTime) / 1000, MAX_DT);
  lastTime = ts;
  update(dt);
  draw();
  // Tras el último frame no se pide otro: el modal tapa el canvas y nada más se mueve
  if (isFinished()) {
    rafId = null;
    return;
  }
  rafId = requestAnimationFrame(loop);
}

return {
  start() {
    initGame();
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
    // Tras el fin de partida el teclado queda suelto para que Espacio active los botones del modal
    if (state.phase !== "gameover") keyboard.attach();
    if (isFinished()) return;
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

El último frame se dibuja **antes** de parar: la comprobación de `isFinished()` va después de `draw()`. En el tick en que muere la última partícula, `update` la quita del arreglo, `draw()` pinta el estado final (asteroides, power-ups y nave como quedaron, sin partículas) y recién entonces el loop se detiene. El pulso del rombo del power-up (usa `performance.now()` en `PowerUp.draw`) queda congelado en ese último frame; solo se vería a través del fondo difuminado del modal.

**Verificación:** `npx tsc --noEmit` y `npm run lint`; una partida en cada skin hasta «FIN DEL JUEGO» y script **Medir** de 2000 ms con el modal visible (esperar a que pasen ~1,5 s para que mueran las partículas): 0 dibujos por frame y 0 frames del motor; antes 13 en Neón (12 con glow) y 27 en Retro. P y SEGUIR siguen pausando y reanudando; con la nave destruida y las partículas animándose, el último frame sigue viéndose igual.

### Paso 2 — Bucles de `update` y `draw` sin asignaciones por frame (H5, H7)

En `game.ts`: una función `compact` que quita las entidades muertas **en el mismo arreglo**, conservando el orden, y bucles `for` en lugar de `forEach`. `fragments` reemplaza a `newAsteroids`.

Antes (`game.ts:186-194`, `206-234`):

```ts
state.ship.update(dt, keyboard);
state.bullets.forEach((b) => b.update(dt));
state.asteroids.forEach((a) => a.update(dt));
state.particles.forEach((p) => p.update(dt));
state.powerUps.forEach((p) => p.update(dt));

state.bullets = state.bullets.filter((b) => !b.dead);
state.particles = state.particles.filter((p) => !p.dead);
state.powerUps = state.powerUps.filter((p) => !p.dead);
...
const newAsteroids: Asteroid[] = [];
...
          newAsteroids.push(...asteroid.split());
...
state.asteroids = state.asteroids
  .filter((a) => !a.dead)
  .concat(newAsteroids);
state.bullets = state.bullets.filter((b) => !b.dead);
```

Después:

```ts
// Quita en el mismo arreglo las entidades muertas, sin crear arreglos ni closures por frame
function compact<T extends { dead: boolean }>(list: T[]): void {
  let write = 0;
  for (let read = 0; read < list.length; read++) {
    const item = list[read];
    if (!item.dead) list[write++] = item;
  }
  list.length = write;
}

function updateAll(list: { update(dt: number): void }[], dt: number): void {
  for (let i = 0; i < list.length; i++) list[i].update(dt);
}
...
state.ship.update(dt, keyboard);
updateAll(state.bullets, dt);
updateAll(state.asteroids, dt);
updateAll(state.particles, dt);
updateAll(state.powerUps, dt);

compact(state.bullets);
compact(state.particles);
compact(state.powerUps);
...
fragments.length = 0;
...
          const pieces = asteroid.split();
          for (let i = 0; i < pieces.length; i++) fragments.push(pieces[i]);
...
compact(state.asteroids);
for (let i = 0; i < fragments.length; i++) state.asteroids.push(fragments[i]);
compact(state.bullets);
```

Mismo orden y mismos resultados que antes: los fragmentos entran **después** de recorrer todas las colisiones del frame (igual que el `concat`), así que una bala no los toca en el mismo frame. Las ramas `gameover` y `dead` de `update` (`game.ts:164-179`) usan `updateAll` y `compact` igual. En `draw()`, los cinco `forEach` pasan a bucles `for` en el mismo orden (partículas, asteroides, power-ups, balas, nave; luego las etiquetas «3x» sobre el canvas principal). `ctx.imageSmoothingEnabled = false` sale de `draw()` (`game.ts:266`) y se fija una vez en `create`, junto al búfer, solo si `skin.pixelScale > 1`:

```ts
if (skin.pixelScale > 1) {
  buffer = document.createElement("canvas");
  // ...igual que hoy...
  // Retro amplía el búfer sin suavizado: se fija una vez, no en cada frame
  ctx.imageSmoothingEnabled = false;
}
```

**Verificación:** `npx tsc --noEmit` y `npm run lint`; una partida en cada skin: disparar, romper un asteroide grande (se parte en dos medianos que no reciben la misma bala), perder una vida, reaparecer, pasar de nivel (los arreglos se reinician con `[]` en `nextLevel`, sin cambio) y recoger un power-up (disparo triple). Misma puntuación por asteroide (100/50/20), mismas vidas y mismo avance de nivel. Script **Medir** (8 s): la misma lista de dibujos por frame que antes.

### Paso 3 — Puntos constantes y trazo de Retro sin arreglos temporales (H4, H6)

`render.ts`: `strokeShape` recibe `x`, `y` y `rotation` sueltos (único llamador: `entities.ts`) y, en Retro, escribe la grilla en `gridX`/`gridY` en vez de `points.map`.

Antes (`render.ts:67-114`):

```ts
export function strokeShape(
  ctx: CanvasRenderingContext2D,
  skin: AsteroidsSkin,
  origin: { x: number; y: number; rotation: number },
  points: readonly (readonly [number, number])[],
  color: string,
  closed: boolean,
): void {
  ...
  const grid = points.map(([px, py]) => [
    Math.floor((origin.x + px * cos - py * sin) / skin.pixelScale),
    Math.floor((origin.y + px * sin + py * cos) / skin.pixelScale),
  ]);
  for (let i = 1; i < grid.length; i++)
    plotLine(ctx, grid[i - 1][0], grid[i - 1][1], grid[i][0], grid[i][1], color);
  if (closed && grid.length > 2) {
    const last = grid[grid.length - 1];
    plotLine(ctx, last[0], last[1], grid[0][0], grid[0][1], color);
  }
}
```

Después:

```ts
// Arreglos de trabajo de la grilla lógica de Retro: se reescriben en cada trazo y se leen en el mismo
const gridX: number[] = [];
const gridY: number[] = [];

export function strokeShape(
  ctx: CanvasRenderingContext2D,
  skin: AsteroidsSkin,
  x: number,
  y: number,
  rotation: number,
  points: readonly (readonly [number, number])[],
  color: string,
  closed: boolean,
): void {
  ...
  const cos = Math.cos(rotation);
  const sin = Math.sin(rotation);
  const n = points.length;
  for (let i = 0; i < n; i++) {
    const p = points[i];
    gridX[i] = Math.floor((x + p[0] * cos - p[1] * sin) / skin.pixelScale);
    gridY[i] = Math.floor((y + p[0] * sin + p[1] * cos) / skin.pixelScale);
  }
  for (let i = 1; i < n; i++)
    plotLine(ctx, gridX[i - 1], gridY[i - 1], gridX[i], gridY[i], color);
  if (closed && n > 2) plotLine(ctx, gridX[n - 1], gridY[n - 1], gridX[0], gridY[0], color);
}
```

La rama vectorial (`translate`, `rotate`, `stroke`) solo cambia `origin.x`/`origin.y`/`origin.rotation` por los parámetros. En `entities.ts`:

- `Asteroid.draw`: `strokeShape(ctx, skin, this.x, this.y, this.rot, this.verts, skin.asteroid, true)` (sin objeto).
- `Ship.draw`: el casco pasa a `SHIP_HULL` y la llama a `FLAME_POINTS`. El orden de las llamadas aleatorias se conserva: primero `Math.random() > 0.35` y después, antes de trazar, `FLAME_POINTS[1][0] = -8 - rand(6, 14)`.
- `PowerUp.draw`: el rombo (Retro, `entities.ts:171-187`) escribe sus cuatro vértices en `DIAMOND_POINTS` (`[-r, -r]`, `[r, -r]`, `[r, r]`, `[-r, r]`) y llama a `strokeShape(ctx, skin, this.x, this.y, Math.PI / 4, DIAMOND_POINTS, skin.powerUp, true)`.

**Verificación:** `npx tsc --noEmit` y `npm run lint`; Retro: mismos píxeles de nave, asteroides, llama y rombo que `.playwright-screenshots/performance/asteroids/retro-base.png` (el cálculo de la grilla es el mismo: `Math.floor` de las mismas expresiones). Script **Medir** (8 s) en Retro: la misma lista de `fillRect` por frame.

### Paso 4 — Color de las partículas por tabla (H3)

`render.ts`: agregar `RenderCache` y `createRenderCache(skin)` (por ahora solo con `particleStyles`).

```ts
export function createRenderCache(skin: AsteroidsSkin): RenderCache {
  const particleStyles: string[] = [];
  for (let i = 0; i <= ALPHA_STEPS; i++)
    particleStyles.push(hexToRgba(skin.particle, i / ALPHA_STEPS));
  return { particleStyles, bulletSprite: null, bulletHalf: 0 };
}
```

`game.ts`: `const cache = createRenderCache(skin);` en `create`, junto a `const skin`, y `draw` la pasa a `p.draw(target, skin, cache)`. Las firmas de `draw` de `Particle`, `Asteroid`, `PowerUp`, `Bullet` y `Ship` reciben `cache: RenderCache` como tercer parámetro (las que no la usan la ignoran).

Antes (`entities.ts:251`):

```ts
ctx.strokeStyle = hexToRgba(skin.particle, alpha);
```

Después:

```ts
// Misma cadena que antes: el alfa se redondeaba a dos decimales; ahora se elige de la tabla
ctx.strokeStyle = cache.particleStyles[Math.round(alpha * ALPHA_STEPS)];
```

`alpha = ttl / life` está en `(0, 1]` en cualquier `draw` (las muertas se quitan antes), así que el índice cae en `[0, 100]`. `ALPHA_STEPS` se exporta desde `render.ts`.

**Verificación:** `npx tsc --noEmit` y `npm run lint`; una explosión en Clásico y en Neón se ve igual (partículas que se desvanecen, color `#ffffff` y `#ff006e`); el script **Medir** muestra la misma cantidad de `stroke` por frame.

### Paso 5 — Sprites con el glow horneado de Neón (H2)

Solo se activa cuando `skin.glow > 0` (Neón). Clásico y Retro no crean ningún canvas auxiliar y siguen por la misma ruta.

`render.ts`:

```ts
function createCanvas(
  size: number,
): [HTMLCanvasElement, CanvasRenderingContext2D] {
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const g = canvas.getContext("2d");
  if (!g) throw new Error("No se pudo obtener el contexto 2d del sprite");
  return [canvas, g];
}

// Bala: círculo de radio 2 con glow horneado, con el centro en (half, half)
function createBulletSprite(
  skin: AsteroidsSkin,
  radius: number,
): [HTMLCanvasElement, number] {
  const half = radius + glowPad(skin);
  const [sprite, g] = createCanvas(half * 2);
  applyGlow(g, skin, skin.bullet);
  g.fillStyle = skin.bullet;
  g.beginPath();
  g.arc(half, half, radius, 0, Math.PI * 2);
  g.fill();
  return [sprite, half];
}

// Halo del glow de un contorno cerrado, sin el trazo: el contorno se dibuja `away` px a la izquierda,
// fuera del sprite, y su sombra se desplaza de vuelta con shadowOffsetX
export function createHaloSprite(
  skin,
  points,
  radius,
  color,
): HTMLCanvasElement {
  const half = Math.ceil(radius) + glowPad(skin);
  const [sprite, g] = createCanvas(half * 2);
  const away = sprite.width;
  g.shadowColor = color;
  g.shadowBlur = skin.glow;
  g.shadowOffsetX = away;
  g.strokeStyle = color;
  g.lineWidth = skin.lineWidth;
  g.lineJoin = "round";
  g.beginPath();
  g.moveTo(half - away + points[0][0], half + points[0][1]);
  for (let i = 1; i < points.length; i++)
    g.lineTo(half - away + points[i][0], half + points[i][1]);
  g.closePath();
  g.stroke();
  return sprite;
}

// El halo gira con el asteroide: el desenfoque es isótropo, así que rotarlo equivale a desenfocar la forma rotada
export function drawHalo(ctx, sprite, x, y, rotation): void {
  const half = sprite.width / 2;
  const cos = Math.cos(rotation);
  const sin = Math.sin(rotation);
  ctx.setTransform(cos, sin, -sin, cos, x, y);
  ctx.drawImage(sprite, -half, -half);
  ctx.setTransform(1, 0, 0, 1, 0, 0);
}
```

`createRenderCache` agrega el sprite de la bala cuando `skin.glow > 0`: `[bulletSprite, bulletHalf] = createBulletSprite(skin, 2)`.

`entities.ts`, antes (`entities.ts:55-73` y `123-134`):

```ts
// Bullet.draw (vectorial)
applyGlow(ctx, skin, skin.bullet);
ctx.fillStyle = skin.bullet;
ctx.beginPath();
ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
ctx.fill();
clearGlow(ctx);

// Asteroid.draw
applyGlow(ctx, skin, skin.asteroid);
strokeShape(
  ctx,
  skin,
  this.x,
  this.y,
  this.rot,
  this.verts,
  skin.asteroid,
  true,
);
clearGlow(ctx);
```

Después:

```ts
// Bullet.draw (vectorial)
if (cache.bulletSprite) {
  // Neón: sprite con el glow horneado, a coordenadas enteras
  const half = cache.bulletHalf;
  ctx.drawImage(
    cache.bulletSprite,
    Math.round(this.x) - half,
    Math.round(this.y) - half,
  );
  return;
}
ctx.fillStyle = skin.bullet;
ctx.beginPath();
ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
ctx.fill();

// Asteroid.draw
if (skin.glow > 0) {
  // El halo depende de la forma aleatoria del asteroide: se hornea en su primer draw y se reutiliza
  this.halo ??= createHaloSprite(skin, this.verts, this.radius, skin.asteroid);
  drawHalo(ctx, this.halo, this.x, this.y, this.rot);
}
strokeShape(
  ctx,
  skin,
  this.x,
  this.y,
  this.rot,
  this.verts,
  skin.asteroid,
  true,
);
```

`Asteroid` suma el campo `halo: HTMLCanvasElement | null = null`. El contorno sin `shadowBlur` se dibuja justo después del halo, en el mismo orden que antes (la sombra va debajo del trazo). Los fragmentos nuevos construyen su halo en su primer `draw`, una vez por asteroide, no por frame. Ship y PowerUp **conservan** `applyGlow`/`clearGlow` en vivo (2 y 1 dibujos con glow por frame). `clearGlow` ya no se usa en `Bullet` ni `Asteroid`; `applyGlow` sigue usándose desde `createBulletSprite`.

Resultado esperado en Neón: glow por frame de 11 a 19 a **≤ 3** (hull + llama + rombo), con un `drawImage` más por asteroide y uno por bala (con `shadowBlur 0`).

**Verificación:** `npx tsc --noEmit` y `npm run lint`; script **Medir** (8 s) en Neón con el autopiloto: glow/frame ≤ 3 en todo frame (máximo, no solo el promedio). Comparación visual contra `.playwright-screenshots/performance/asteroids/neon-base.png`: halo rosa de unos 8 px alrededor de cada asteroide, sin recorte en los bordes del sprite, balas amarillas con su halo, y el contorno de los asteroides igual de nítido que antes. Partida con 30 o más asteroides (nivel 3 o superior): sin tirones al partirse un asteroide (el halo de cada fragmento se hornea en ese frame: JS del `loop` ≤ 2,5 ms de máximo).

### Paso 6 — Documentación

En `references/game-performance.md`: `asteroids` pasa a `[x]` con la medición final (la misma tabla de este spec, medida de nuevo con `npm run dev`), la fila del Resumen actualizada y una línea en el historial.

**Verificación:** `git diff main -- public/ references/` solo muestra `references/game-performance.md`.

## Criterios de aceptación

### Generales

- [ ] `npx tsc --noEmit` sin errores.
- [ ] `npm run lint` sin errores.
- [ ] `git diff main -- public/ references/` solo muestra `references/game-performance.md`.
- [ ] Ningún otro motor cambia (`git diff main --stat` solo muestra `lib/arcade/asteroids/game.ts`, `render.ts`, `entities.ts`, este spec y `references/game-performance.md`).
- [ ] `constants.ts`, `skins.ts` e `index.ts` de Asteroids sin cambios.

### Rendimiento (medido con los scripts de `game-performance-booster`, `npm run dev`, autopiloto sintético)

- [ ] Clásico: frame p95 17,4 ms → ≤ 20 ms; frames > 33 ms 0 % → < 1 %; CPU ×4 p95 17,6 ms → ≤ 33 ms.
- [ ] Neón: frame p95 17,5 ms → ≤ 20 ms; frames > 33 ms 0 % → < 1 %; CPU ×4 p95 17,5 ms → ≤ 33 ms.
- [ ] Retro: frame p95 17,6 ms → ≤ 20 ms; frames > 33 ms 0 % → < 1 %; CPU ×4 p95 17,5 ms → ≤ 33 ms.
- [ ] Neón: glow/frame de 11,46 (máx. 18) a ≤ 3 (máx. ≤ 10 en todo frame, también con CPU ×4: antes 13,33, máx. 19).
- [ ] Clásico y Retro: glow/frame 0 → 0; no se agrega ningún `shadowBlur`.
- [ ] Retro: dibujos por frame sin cambio (misma lista de `fillRect` para la misma escena; antes 420,28 de media con máx. 509 en esa ventana).
- [ ] Clásico: dibujos por frame sin cambio (24,56, máx. 48 en esa ventana). Neón: sube en uno por asteroide y por bala (el halo y la bala pasan a `drawImage`) y no es un objetivo.
- [ ] Dibujos por frame en pausa: 0 → 0 en las tres skins.
- [ ] Dibujos por frame tras `onGameOver` (modal visible, ≥ 1,5 s después del último frame): Neón 13 (12 con glow) → **0**; Retro 27 → **0**; Clásico (no medido antes) → 0; frames del motor en 2 s: 121 → 0.
- [ ] Mutaciones del DOM: 0,5 a 2,25/s → ≤ 10/s en las tres skins.
- [ ] `getImageData`, `createLinearGradient`/`Radial`/`Pattern`, `new Image`, `new Audio` por frame: 0 → 0 (los canvas auxiliares solo se crean en `create` y en el primer `draw` de cada asteroide en Neón, nunca por frame).
- [ ] Heap tras 60 s de partida en Neón: sin crecimiento sostenido (15,47 MB a los 5 s y 15,49 MB a los 60 s antes → ≤ 5 MB entre 10 s y 60 s), con una partida viva con el autopiloto.
- [ ] JS del `loop` jugando en Neón (0,07 a 0,09 ms de media, sin los contadores): no sube más de 0,05 ms de media y el máximo no supera 2,5 ms (1,9 ms antes).
- [ ] Un solo loop vivo: tras pausar y reanudar, los frames del motor igualan a los del navegador en las tres skins (241 de 240 en 4 s antes).

### Pausa y fin

- [ ] P y SEGUIR pausan y reanudan sin salto de la nave ni de los asteroides (`dt` acotado y `lastTime = null` sin cambios), y en pausa hay 0 dibujos por frame.
- [ ] Al terminar la partida el último frame (asteroides y power-ups donde quedaron, la explosión de la nave animándose hasta que mueran sus partículas) queda dibujado debajo del modal y 0 dibujos por frame después.
- [ ] Con el modal abierto, Espacio sigue activando el botón que tiene el foco (el teclado queda suelto en `gameover`, también si algo llama a `resume()`).
- [ ] JUGAR DE NUEVO arranca una partida limpia: puntuación 0, vidas 3, nivel 1, 4 asteroides, nave con la invencibilidad inicial, loop vivo y canvas dibujándose.

### Sin regresiones visuales

- [ ] Clásico, Neón y Retro se ven igual que `.playwright-screenshots/performance/asteroids/classic-base.png`, `neon-base.png` y `retro-base.png`: colores, grosor de 2 px, glow de 8 px en Neón, píxeles de 4 × 4 y scanlines en Retro.
- [ ] Neón: el halo de cada asteroide y de cada bala no se recorta en el borde del sprite (padding de 18 px) y el contorno de los asteroides sigue nítido al girar (comparación a simple vista de un asteroide grande a varios ángulos).
- [ ] Neón: las balas con halo se ven igual que antes aun con las coordenadas redondeadas (comparación en disparo triple).
- [ ] Partículas: se desvanecen igual en Clásico y Neón (alfa de 1 a 0 en pasos de 0,01); en Retro se apagan por pasos como antes.
- [ ] Llama, rombo del power-up y texto «3x» (en el canvas principal, nunca en el búfer) se ven iguales en las tres skins.

### Sin regresiones de juego

- [ ] Misma puntuación por asteroide (100/50/20), mismas vidas (3), mismo avance de nivel (`3 + nivel` asteroides) y mismo power-up de disparo triple (5 s, caída con 15 % o garantizada a las 5 destrucciones).
- [ ] Mismos fragmentos: un asteroide grande da dos medianos, uno mediano dos pequeños, y los fragmentos no reciben la bala que los generó en el mismo frame.
- [ ] Mismo comportamiento del teclado (← → rotar, ↑ propulsar, Espacio disparar, P pausar) y del gamepad táctil si más adelante se declara `touch` (el motor sigue leyendo `KeyboardEvent.code`).
- [ ] Misma invencibilidad al reaparecer (3 s con parpadeo) y misma espera de 2 s entre vidas.

## Decisiones

- **Sí:** parar el loop tras el último frame de `gameover` cuando ya no quedan partículas. Es un incumplimiento claro del presupuesto (13 dibujos por frame con 12 de glow en Neón contra 0) y no hay animación posterior que mostrar. Esto reemplaza la frase del SPEC 05 «el loop sigue animando solo las partículas, hasta que se llame a `destroy()`»: las partículas se siguen animando hasta que mueren, y después ya no hay nada que animar. El pulso del rombo de un power-up que haya quedado en pantalla se congela en el último frame, solo visible a través del modal.
- **Sí:** `resume()` no reinicia el loop terminado y no reconecta el teclado en `gameover`. Antes pedía un frame y hacía `attach()` sin mirar la fase; ahora respeta el «teclado suelto» del SPEC 05.
- **Sí:** `start()` y `resume()` llaman a `stopLoop()` antes de pedir el frame, como pide el contrato. Hoy no hay doble loop; es seguridad barata.
- **Sí:** halo horneado por asteroide en Neón, creado de forma perezosa en su primer `draw`, con el contorno nítido en vivo encima. Es la corrección de la mayor parte del glow medido (11 a 19 dibujos por frame contra ≤ 10) y conserva el look: el contorno sigue siendo un trazo vectorial. Cada asteroide tiene una forma aleatoria (8 a 13 vértices con radios entre 0,6 y 1,0 del radio) que no se puede compartir entre instancias.
- **Sí:** sprite único para las balas, construido en `create`, con glow horneado y dibujado a coordenadas enteras. Todas las balas son idénticas (círculo de radio 2); una bala avanza ≈ 8,7 px por frame, así que redondear a 0,5 px no se aprecia.
- **Sí:** tabla de 101 colores para las partículas en lugar de `hexToRgba` por frame. La función ya redondeaba el alfa a dos decimales, así que la tabla da los mismos valores; la diferencia posible es de ±0,01 de alfa en empates de redondeo de `toFixed` frente a `Math.round`, invisible.
- **Sí:** bucles `for`, `compact` y arreglos de trabajo (`fragments`, `gridX`/`gridY`, `FLAME_POINTS`, `DIAMOND_POINTS`) en lugar de `forEach`/`filter`/`concat`/`map` y literales por frame. Mismo orden y mismos resultados; son del mismo archivo y de bajo riesgo.
- **Sí:** `imageSmoothingEnabled = false` una vez en `create` para Retro. `GameCanvas` fija `width`/`height` solo en el montaje (antes de `create`) y el contexto conserva el valor mientras viva el motor.
- **No:** sprite pre-renderizado de la nave. Se redibuja una sola vez por frame (2 dibujos con glow con la llama) y gira de forma continua; entra en el presupuesto (≤ 3 en total con el rombo).
- **No:** sprite del rombo del power-up. Es un solo dibujo con glow, hay un power-up a la vez (`powerUpSpawned`) y su lado pulsa con `performance.now()`.
- **No:** sprite completo (glow + contorno) rotado para los asteroides. El remuestreo de una línea de 2 px a ángulos arbitrarios la suaviza; con el halo aparte el trazo sigue siendo vectorial y el resultado se parece más al original.
- **No:** compartir un solo halo por tamaño de asteroide. Las formas aleatorias de cada instancia cambiarían el look.
- **No:** un pool de canvas para reutilizar los halos de los asteroides destruidos. Cada kill construye como mucho dos (los fragmentos), un costo parecido al de un frame con glow en vivo; si la verificación del paso 5 muestra tirones al partir asteroides, se evalúa en otro spec.
- **No:** agrupar o reducir los `fillRect` de 1 × 1 de Retro (`plotLine`). La microprueba da ~0,2 ms por cada 500 `fillRect` extra y el resultado debe ser idéntico píxel a píxel (sin antialiasing).
- **No:** caché del fondo: es un solo `fillRect`.
- **No:** colisiones con distancia al cuadrado, `Math.hypot` por producto escalar ni cuadrícula espacial. Son unas 900 comparaciones como máximo dentro de un `loop` de 0,1 ms, y cambiar la fórmula arriesga un empate en el borde del radio.
- **No:** acotar `Asteroid.rot` con `%`: a ≤ 1,2 rad/s no llega a un valor que afecte a `sin`/`cos`.
- **No:** evitar el `toFixed(1)` del contador «3x» ni la plantilla de texto: corre un frame por cada uno de los 5 s de un power-up y el texto cambia en cada frame.
- **No:** cambios compartidos (`PlayerView`, `GameCanvas`, `MobileGamepad`): 0,5 a 2,25 mutaciones por segundo, sin renders continuos.
- **No:** `devicePixelRatio` ni cambiar `width`/`height` del canvas, workers ni `OffscreenCanvas`.

Lo decidió el agente (game-performance-booster).

## Riesgos

| Riesgo                                                                                                         | Mitigación                                                                                                                                                                                                                                                            |
| -------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| El sprite del halo o de la bala se ve distinto al dibujo en vivo (blur recortado, coordenadas no enteras)      | Padding de `ceil(glow × 2) + lineWidth` = 18 px (3 σ del blur de 8 px); se compara a simple vista con `neon-base.png`. Las balas se dibujan en coordenadas enteras (≤ 0,5 px de error sobre un círculo de 4 px que avanza 8,7 px por frame).                          |
| El truco de la sombra desplazada (contorno fuera del sprite) no se dibuja igual en algún navegador             | La sombra de una forma fuera del lienzo es parte de la especificación de canvas 2D y se usa mucho; la verificación visual del paso 5 en Chromium lo comprueba. Si algún navegador no la pinta, el halo queda vacío y se cambia a un sprite que trae también el trazo. |
| El halo rotado queda ligeramente más suave que el glow en vivo                                                 | El desenfoque es isótropo: rotar la imagen desenfocada equivale a desenfocar la forma rotada, salvo por el remuestreo de un resplandor ya difuso; el trazo nítido va aparte, en vivo.                                                                                 |
| Un canvas por asteroide aumenta la memoria o el trabajo al partir asteroides                                   | Hasta ~56 asteroides de 68 a 136 px de lado (≲ 1 MB en total) y se liberan con el asteroide. Cada kill hornea dos halos (≈ el costo de un frame con glow en vivo); el criterio del paso 5 exige JS del `loop` ≤ 2,5 ms de máximo. Pool descartado por ahora.          |
| Una caché construida antes de tiempo: la tabla de partículas y el sprite de la bala dependen de la skin        | Se construyen una sola vez en `create` con la skin del motor, que no cambia durante la partida; si el jugador cambia de skin, `GameCanvas` destruye el motor y crea otro con su propia caché. No dependen de imágenes que carguen después (el juego no usa assets).   |
| Un arreglo reutilizado se filtra entre frames (`fragments`, `gridX`/`gridY`, `FLAME_POINTS`, `DIAMOND_POINTS`) | Todos se escriben y se consumen dentro de la misma llamada (`fragments` se vacía al empezar la colisión y se vuelca al final de `update`; los demás los lee `strokeShape` al instante). No se guardan referencias fuera.                                              |
| Un bug de orden al mover los fragmentos fuera del `concat`                                                     | Los fragmentos se agregan **después** de `compact(state.asteroids)` y de todas las colisiones del frame, igual que antes; el criterio «los fragmentos no reciben la bala que los generó» lo comprueba.                                                                |
| `resume()` o el último `draw()` dejan el estado final incompleto                                               | `isFinished()` se evalúa después de `draw()` en el mismo tick; mientras haya partículas, el loop sigue. `resume()` en `gameover` no reconecta el teclado.                                                                                                             |
| La medición en desarrollo no coincide con producción                                                           | Los números de `npm run dev` sirven para comparar antes y después; los criterios principales (0 dibujos tras el fin, glow ≤ 10) son conteos de llamadas y no dependen del servidor.                                                                                   |
| El autopiloto de medición subestima la densidad de un jugador real                                             | Los criterios de glow miden el máximo por frame y, tras el cambio, no escalan con asteroides ni balas (solo nave y rombo, ≤ 3); la verificación incluye una partida con 30 o más asteroides.                                                                          |

## Lo que no entra en este spec

- Los otros motores y el catálogo sin motor.
- Cambios de jugabilidad o de look.
- Cambios compartidos (`PlayerView`, `GameCanvas`, `MobileGamepad`, `shared/`, `engine.ts`): no hay medición que los justifique.
- Sprites de la nave y del power-up, pool de canvas para los halos, agrupar los `fillRect` de Retro, caché del fondo, optimizar las colisiones y acotar `Asteroid.rot`.
- Skins nuevas y gamepad táctil de Asteroids.
- Workers, `OffscreenCanvas`, `devicePixelRatio`, cambiar `width`/`height`, `ctx.filter`, dependencias nuevas y profiling formal con DevTools.

Si alguna de estas llega, va en su propio spec.
