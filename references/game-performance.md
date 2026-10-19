# Rendimiento de los juegos

Registro de la revisión de rendimiento de cada juego con motor de Arcade E1230. Lo mantiene el subagente `game-performance-booster` (`.claude/agents/game-performance-booster.md`), que lo lee antes de trabajar y lo actualiza después. Se puede editar a mano.

Última actualización: 2026-10-19

Estados: `[ ]` Sin revisar · `[!]` Con problemas · `[~]` En spec · `[x]` Optimizado · `[=]` Revisado, cumple sin cambios · `[/]` Sin motor

## Presupuesto

Un juego cumple si, en **cada una de sus skins**:

| Métrica                                                                                       | Presupuesto                                                      |
| --------------------------------------------------------------------------------------------- | ---------------------------------------------------------------- |
| Frame p95 (servidor de desarrollo, sin estrangular)                                           | ≤ 20 ms                                                          |
| Frames > 33 ms (sin estrangular)                                                              | < 1 %                                                            |
| Frame p95 con CPU ×4 (gama media de celular)                                                  | ≤ 33 ms                                                          |
| Dibujos con `shadowBlur > 0` por frame                                                        | ≤ 10                                                             |
| Dibujos por frame en pausa                                                                    | 0                                                                |
| Dibujos por frame tras `onGameOver` (debajo del modal)                                        | 0 después del último frame (no hay animación que mostrar)        |
| Mutaciones del DOM por segundo en juego normal                                                | ≤ 10 (solo cambios reales de puntuación, vidas o nivel)          |
| `getImageData`, `createLinearGradient`/`Radial`/`Pattern`, `new Image`, `new Audio` por frame | 0 (se crean una vez en `create` o a nivel de módulo)             |
| Heap tras 60 s de partida                                                                     | Sin crecimiento sostenido (> 5 MB entre 10 s y 60 s es sospecha) |

## Notas de medición

Lo aprendido al medir (2026-10-12, equipo del autor, Chromium con Playwright, `npm run dev`):

- El p95 de frame sale pegado a ~17,6 ms (60 fps) en los tres looks de FROGGER: el equipo tiene mucho margen y el p95 no distingue entre skins. Lo que sí discrimina son los contadores del contexto 2D (dibujos y dibujos con glow por frame) y el tiempo de JS del `loop` del motor.
- El estrangulamiento CPU ×4 por CDP (`Emulation.setCPUThrottlingRate`) no cambió el tiempo de JS del loop (0,079 ms → 0,083 ms en Neón). No fiarse del p95 «con CPU ×4» de esta máquina: usar los contadores y el JS del loop.
- Tiempo de JS del loop: envolver `window.requestAnimationFrame` para cronometrar los callbacks cuyo `name` sea `loop` (sin la instrumentación de contadores, que lo infla al doble). No mide el rasterizado, donde se paga el `shadowBlur`.
- Una partida sin entrada dura ~48 s en FROGGER (la rana pierde las 3 vidas por tiempo). Para medir fin de partida basta esperar el modal con `waitFor` de 60 s. Para el heap a 60 s hace falta entrada sintética o un juego que no termine solo.
- «JUGAR DE NUEVO» + Espacio reinicia la partida sin recargar la página y conserva la instrumentación.
- ARKANOID (2026-10-12): `GameCanvas` monta el `<canvas>` solo cuando el estado pasa a «playing», así que el `document.querySelector("canvas")` de la instrumentación debe hacerse **dentro** de cada tick, no al instalar. Autopiloto que mantiene viva una partida sin motor: un `requestAnimationFrame` que despacha `mousemove` sobre el canvas siguiendo la bola (su posición se toma del `drawImage` de 9 argumentos con recorte 32,32,16,16) y un Espacio sintético cada 400 ms para el saque. Con esto se midió el heap 60 s (muestras cada 5 s). Los contadores de `new Audio`/`cloneNode`/`play` se cuentan parcheando `window.Audio` y `HTMLMediaElement.prototype`, pero solo cuentan lo creado después de instalar (el motor se crea al pulsar Espacio, así que instalar antes).
- TETRIS (2026-10-12): el autopiloto con `keydown`/`keyup` sintéticos en `window` (rotar, mover, `Space`) funciona sin tocar el motor; una pieza cada ~1,6 s deja la partida viva ~20 s y cada pieza cae en el centro, así que el tablero se llena rápido y la partida termina sola (sin entrada dura ~200 s). Para el heap a 60 s basta medir en una partida ya empezada y dejar que termine. Para contar el glow por frame y no solo el promedio, detectar el inicio de frame en el `fillRect` del fondo (`0,0,800,600`) y guardar el máximo: el promedio de la pieza activa (8,86) esconde los 16 de la tuerca. Si `engineFrames` (los `fillRect` de fondo) iguala los frames de `requestAnimationFrame` tras pausar y reanudar, no hay un segundo loop vivo.
- SNAKE (2026-10-12): el motor no expone nada, pero la posición de la cabeza (`fillRect` de 36 × 36), el cuerpo (34 × 34) y la fruta (`drawImage` de 9 argumentos) salen de las llamadas al contexto y bastan para un autopiloto con BFS que despacha flechas sintéticas y mantiene viva la partida 60 s o más (a velocidad alta pierde vidas y termina sola). Si no avanza nada, un `ArrowRight` sintético tras 700 ms inicia la partida desde la espera. El cronometraje del `loop` va en una carga aparte, sin los contadores (que lo inflan) y sin autopiloto (que los necesita). Para decidir si agrupar dibujos vale la pena, una microprueba en un canvas aparte (`document.createElement`, 300 repeticiones con `getImageData` para forzar el vaciado) da el costo real: 300 `fillRect` cuestan ~0,1 ms.
- ASTEROIDS (2026-10-12): el motor no expone nada y la partida no termina de forma predecible sin entrada (la nave quieta tardó ~3 min en perder las 3 vidas). Autopiloto sintético que funciona sin tocar el motor: `ArrowRight` sostenido (la nave gira en el centro) y `Space` con `keydown`/`keyup` cada 210 ms; despeja el campo, así que el glow medido es una cota inferior. Para el máximo por frame, detectar el inicio de frame en el `fillRect` del fondo (800 × 600 en Clásico/Neón; 200 × 150, el búfer, en Retro). Para pedir el fin de partida, apagar el autopiloto y sondear «FIN DEL JUEGO» con un bucle dentro de `browser_evaluate` (el `browser_wait_for` corta a 5 s). Costo del glow sin DevTools: microprueba en un canvas aparte con `getImageData` de 1 píxel para forzar el vaciado (20 trazos de 10 vértices con `shadowBlur 8`: 4,2 ms contra 0,83 ms sin él).
- ARKANOID, medición final (2026-10-19): el autopiloto del 2026-10-12 sirve tal cual para TETRIS, SNAKE y ASTEROIDS con su entrada propia. Cuidados: (1) tras un reinicio de Claude Code el servidor de desarrollo ya no está, hay que levantarlo con `npm run dev`; (2) un `playwright-mcp` huérfano (PPID 1) que no muere con `kill` impide reconectar el MCP: `kill -9` y `/mcp`; (3) con el modal de fin de partida abierto el botón PAUSA queda tapado (el clic falla por timeout) y P se ignora, así que el fin de partida se mide con `evaluate` y no con clics; (4) JUGAR DE NUEVO deja la partida en la pantalla de inicio, hace falta Espacio; (5) el JS del `loop` se compara con un A/B contra `main` (`git checkout main -- lib/arcade/<id>/`, medir, `git checkout HEAD -- lib/arcade/<id>/`), porque la media de 0,03 a 0,05 ms depende del tablero y `performance.now()` es grueso; (6) CPU ×4 con `Emulation.setCPUThrottlingRate` en una llamada corta de `browser_run_code_unsafe` y quitarlo después (rate 1) no cuelga el MCP.
- El heap con `performance.memory` oscila ±0,4 MB por el recolector: un delta de ±1 MB en una ventana de 8 s no es fuga.

## Resumen

| Estado | ID          | Título         | p95 Clásico | p95 Neón | p95 Retro | Glow/frame máx. | Spec                                | Revisado   |
| ------ | ----------- | -------------- | ----------- | -------- | --------- | --------------- | ----------------------------------- | ---------- |
| `[x]`  | `arkanoid`  | ARKANOID       | 17,4 ms     | —        | —         | 0 (sin skins)   | `specs/14-arkanoid-performance.md` (Implementado) | 2026-10-19 |
| `[~]`  | `tetris`    | TETRIS         | 17,4 ms     | —        | —         | 16 (sin skins; 8,86 de media) | `specs/15-tetris-performance.md` (Borrador) | 2026-10-12 |
| `[~]`  | `snake`     | SNAKE          | 17,5 ms     | —        | —         | 1 (sin skins)   | `specs/16-snake-performance.md` (Borrador) | 2026-10-12 |
| `[/]`  | `pacman`    | PAC-MAN        | —           | —        | —         | —               | —                                   | —          |
| `[/]`  | `invaders`  | SPACE INVADERS | —           | —        | —         | —               | —                                   | —          |
| `[~]`  | `asteroids` | ASTEROIDS      | 17,4 ms     | 17,5 ms  | 17,6 ms   | 19 (Neón; 11,46 de media) | `specs/17-asteroids-performance.md` (Borrador) | 2026-10-12 |
| `[~]`  | `frogger`   | FROGGER        | 17,6 ms     | 17,4 ms  | 17,6 ms   | 6,32 (Neón; antes 94,4) | `specs/13-frogger-performance.md` (Aprobado; implementado, falta medir Clásico y Retro) | 2026-10-19 |
| `[/]`  | `galaga`    | GALAGA         | —           | —        | —         | —               | —                                   | —          |

## Detalle

### `frogger` — FROGGER

- **Estado:** `[~]` Implementado, medición final incompleta (pasa a `[x]` al medir Clásico y Retro) · **Spec:** `specs/13-frogger-performance.md` (Aprobado)
- **Medición final (2026-10-19, dev, 1280 × 900):** solo **Neón** medido tras los pasos 1 a 3 · Normal (8 s): p95 17,4 ms, 0 % > 33 ms, glow 6,32/frame (antes 94,4), 103,66 dibujos/frame (antes 204,9), 0,13 mutaciones/s, setLineDash, gradientes e `imageData` en 0, heap +0,92 MB · CPU ×4 (8 s): p95 17,6 ms, 0 % > 33 ms, glow 6,32, 103,69 dibujos/frame · Pausa (2 s): 0 dibujos/frame · Fin de partida (2 s, modal abierto): 0 dibujos/frame (antes Clásico 194,6 y Retro 1469,9; Neón no medido) · P pulsada con el modal abierto: 0 dibujos y el modal sigue · JUGAR DE NUEVO: partida limpia (0 puntos, 3 vidas, nivel 1) con un solo loop (104,15 dibujos/frame con la rana viva, no ≈ 208; glow 7,04) · Teclado: ArrowLeft + KeyA dan un solo salto, y el salto guardado durante el vuelo se ejecuta · Captura `.playwright-screenshots/performance/frogger/neon-after.png` sin recortes del blur y con las tortugas hundiéndose bien. **Pendiente de medir:** Clásico y Retro (el paso 4, capa de terreno, está implementado pero sin medición: esperado ≤ 720 dibujos/frame y JS del loop < 0,415 ms en Retro), cambio de ronda, anchos 320/375/768/1280 px y heap a 60 s. El MCP de Playwright se colgó al medir Retro (script largo con CPU ×4 y espera del fin de partida); medir en llamadas cortas.
- **Medición inicial (2026-10-12, dev):** Clásico p95 17,6 ms, 206,5 dibujos/frame · Neón p95 17,6 ms, glow 94,4/frame, 204,9 dibujos/frame · Retro p95 17,6 ms, 1444,7 dibujos/frame · CPU ×4 p95 máx. 17,6 ms (el throttle no tuvo efecto medible) · Pausa: 0 dibujos/frame en las tres skins · Fin de partida: Clásico 194,6 y Retro 1469,9 dibujos/frame (Neón no medido) · Mutaciones del DOM 0/s · Heap sin crecimiento en ventanas de 8 s · JS del loop: Clásico 0,053 ms, Neón 0,079 ms, Retro 0,415 ms
- **Hallazgos:** (Alta) el loop sigue dibujando tras `onGameOver` (`game.ts:394-400`, `427-434`); (Alta) Neón dibuja 94,4 veces por frame con glow (`render.ts:143-385`, entidades con `applyGlow` por entidad) -> caché de sprites; (Media) Retro redibuja el terreno estático cada frame, ≈ 751 de 1444,7 `fillRect` (`render-pixel.ts:202-258`, `335`) -> capa de terreno
- **Pendientes bajos:** entran en el mismo spec (arreglos y closures por frame en `render.ts`/`render-pixel.ts`, `readInput` con `map/some`, `buildView` por frame, `imageSmoothingEnabled` por frame, `state.clock` sin acotar). Descartados: caché del fondo de Clásico/Neón, caché de entidades de Retro, índices por fila en `lanes.ts`
- **Historial:**
  - 2026-10-12 — Revisión de rendimiento: medidas las tres skins con `npm run dev`; escrito `specs/13-frogger-performance.md` en Borrador.
  - 2026-10-19 — Implementado el SPEC 13 (pasos 1 a 4): el loop termina en `gameover`, higiene de asignaciones, caché de sprites con glow en Neón y capa de terreno en Retro. Medido solo Neón (glow 94,4 → 6,32, dibujos 204,9 → 103,7, fin de partida en 0); Clásico y Retro pendientes de medir.

### `arkanoid` — ARKANOID

- **Estado:** `[x]` Optimizado · **Spec:** `specs/14-arkanoid-performance.md` (Implementado)
- **Medición final (2026-10-19, dev, 1280 × 900, sin skins: una sola pasada, autopiloto con `mousemove` sintético):** Normal (8 s): p95 17,4 ms, 0 % > 33 ms, glow 0, 39,03 dibujos/frame (38,03 `drawImage`; el tablero se va vaciando, con el tablero completo salen 62 como antes), 0,88 mutaciones/s · CPU ×4 (8 s): p95 17,7 ms, 0 % > 33 ms, glow 0, 59 dibujos/frame · Pausa (2 s): **0** dibujos y 0 frames · SEGUIR: un solo loop (60 frames en 1 s, 33 dibujos/frame) · Fin de partida (2 s, modal «FIN DEL JUEGO» visible, 1,5 s después del último frame): **0** dibujos y 0 frames (antes 56,47); tampoco hay `requestAnimationFrame` · `blur` y P con el modal abierto: 0 dibujos, el loop sigue parado · JUGAR DE NUEVO + Espacio: partida limpia (0 puntos, 3 vidas, nivel 1), 120 frames en 2 s (un solo loop) y 62 dibujos/frame con el tablero completo · Heap cada 5 s durante 60 s: entre 14,05 y 15,42 MB, sin tendencia (14,60 a los 10 s y 14,05 a los 60 s; la partida llegó al nivel 2) · JS del `loop` (sin contadores, A/B en las mismas condiciones): 0,047 a 0,051 ms de media contra 0,041 ms con el código de `main` (+0,006 a +0,010 ms; p95 0,2 ms, máx. 0,8 ms) · Audio: 112 `play()` y 112 clones en 60 s (≈ 1,9 por segundo, uno por evento), 0 `new Audio` · Explosiones: los 4 cuadros (sx 256 a 352) en cada fila de color (sy 192 a 256), recortes 32 × 16 · Captura `.playwright-screenshots/performance/arkanoid/after.png`: el tablero del nivel 1 coincide con `base.png`. **Sin verificar en vivo:** la explosión gris/roja (fila 176; no cayó ningún bloque gris ni rojo en la ventana de 10 s), el fin de partida con una explosión pendiente y la victoria del nivel 5 (el autopiloto no llega).
- **Medición inicial (2026-10-12, dev, sin skins: una sola pasada):** p95 17,4 ms, 0 % > 33 ms, 31,49 dibujos/frame (62,13 con el tablero completo), glow 0 · CPU ×4 p95 17,5 ms (el throttle no tuvo efecto medible) · Pausa: 0 dibujos/frame · Fin de partida: 56,47 dibujos/frame · Mutaciones del DOM 0,63/s · Heap 14,7 a 15,4 MB en 60 s (+0,4 MB entre 10 s y 60 s, sin fuga) · JS del loop 0,034 ms (p95 0,1) · Audio: 15 clones/`play()` en 8 s, `cloneNode()` + `play()` 0,075 ms de media
- **Hallazgos:** (Alta) el loop sigue dibujando tras `onGameOver` (`game.ts:326-332`, `359-366`) -> parar tras el último frame cuando no quedan explosiones
- **Audio (`sound.ts`):** revisado y sin hallazgo: base creado una vez, clones acotados por duración (≤ 3 simultáneos), `pause`/`destroy` los detienen; costo despreciable. Pool descartado (cambiaría el solape audible)
- **Pendientes bajos:** entran en el mismo spec (`filter` por frame en `updateExplosions` `game.ts:234-239`, `find` con closure en `breakBlocks` `game.ts:207-209`, objeto con spread por explosión en `sprites.ts:109-123`). Descartados: `getBoundingClientRect` por `mousemove`, caché de la capa de bloques, coordenadas enteras
- **Historial:**
  - 2026-10-12 — Revisión de rendimiento: medida la única pasada con `npm run dev` (autopiloto con `mousemove` sintético); escrito `specs/14-arkanoid-performance.md` en Borrador.
  - 2026-10-19 — Implementado el SPEC 14 (pasos 1 a 3): el loop termina en `gameover`/`win` cuando no quedan explosiones, `updateExplosions` en el sitio, `breakBlocks` sin closure y recortes de explosión precalculados. Medido con `npm run dev`: dibujos tras el fin de partida 56,47 → 0, el resto del presupuesto se mantiene. `arkanoid` pasa a `[x]`.

### `tetris` — TETRIS

- **Estado:** `[~]` En spec · **Spec:** `specs/15-tetris-performance.md` (Borrador)
- **Medición inicial (2026-10-12, dev, sin skins: una sola pasada, autopiloto sintético):** p95 17,4 ms, 0 % > 33 ms, glow 8,86/frame (máx. 16 con la tuerca), 76,75 dibujos/frame (máx. 97 en esa ventana, 177 en la partida), 0,5 mutaciones/s · CPU ×4 p95 17,5 ms (el throttle no tuvo efecto medible) · Pausa: 0 dibujos/frame · Fin de partida: 178,48 dibujos/frame con 16,13 de glow · Heap 15,3 MB a los 10 s y a los 60 s (sin fuga) · JS del loop 0,27 ms de media (p95 0,4, máx. 1,1) · un solo loop vivo tras pausar y reanudar
- **Hallazgos:** (Alta) el loop sigue dibujando tras `onGameOver` (`game.ts:269-275`, `293-298`); (Media) la pieza activa dibuja con `shadowBlur` en vivo, 8 dibujos con glow por frame y 16 con la tuerca (`render.ts:105-122`, `33-51`) -> sprite de una celda por tipo de pieza
- **Pendientes bajos:** entran en el mismo spec (objeto con spread por frame para el fantasma `game.ts:263`, `stopLoop()` en `start`/`resume`). Descartados: caché de la capa estática del tablero, agrupar estados en `drawCell`, caché del fantasma, asignaciones por evento de `board.ts`/`pieces.ts`
- **Historial:**
  - 2026-10-12 — Revisión de rendimiento: medida la única pasada con `npm run dev` (autopiloto con teclado sintético); escrito `specs/15-tetris-performance.md` en Borrador.

### `snake` — SNAKE

- **Estado:** `[~]` En spec · **Spec:** `specs/16-snake-performance.md` (Borrador)
- **Medición inicial (2026-10-12, dev, sin skins: una sola pasada, autopiloto sintético con BFS):** p95 17,5 ms, 0 % > 33 ms, glow 1/frame (máx. 1), 20,67 dibujos/frame (máx. 24; 7 + longitud de la serpiente), 1,0 mutaciones/s · CPU ×4 p95 17,6 ms (el throttle no tuvo efecto medible) · Pausa: 0 dibujos/frame · Fin de partida: 62 dibujos/frame con 1 de glow (121 de 121 frames en 2 s) · Heap 14,7 MB a los 10 s y 14,4 MB a los 60 s (sin fuga) · JS del loop 0,11 ms de media (p95 0,2, máx. 0,3) · un solo loop vivo tras pausar y reanudar (241 de 241 frames)
- **Hallazgos:** (Alta) el loop sigue dibujando tras `onGameOver` (`game.ts:352-358`, `384-393`); el SPEC 09 fijó «redibuja hasta `destroy()`» y el spec de rendimiento lo reemplaza sin cambio visual
- **Pendientes bajos:** entran en el mismo spec (`map`/`some` por tecla y por frame en `readInput` `game.ts:170-173`, arreglo y objeto por frame en `drawHead` `game.ts:306-317`, cálculo de la fruta por frame en `sprites.ts:79-89`, `slice` + `some` por paso en `step` `game.ts:224-230`). Descartados: agrupar el cuerpo en un camino (microprueba: 300 `fillRect` 0,098 ms contra 0,103 ms), caché de la cuadrícula, sprite del glow de la cabeza, dibujar solo al cambiar el estado, `spawnFruit`/`resetSnake` por evento
- **Historial:**
  - 2026-10-12 — Revisión de rendimiento: medida la única pasada con `npm run dev` (autopiloto con teclado sintético); escrito `specs/16-snake-performance.md` en Borrador.

### `asteroids` — ASTEROIDS

- **Estado:** `[~]` En spec · **Spec:** `specs/17-asteroids-performance.md` (Borrador)
- **Medición inicial (2026-10-12, dev, tres skins, autopiloto sintético con `ArrowRight` sostenido y `Space` cada 210 ms):** Clásico p95 17,4 ms, 24,56 dibujos/frame (máx. 48), glow 0 · Neón p95 17,5 ms, glow 11,46/frame (máx. 18; 13,33 con máx. 19 en la ventana CPU ×4; 14,56 con máx. 17 en otra), 20,96 dibujos/frame · Retro p95 17,6 ms, 420,28 dibujos/frame (máx. 509; `fillRect` de 1 × 1) · CPU ×4 p95 máx. 17,6 ms (el throttle no tuvo efecto medible) · Pausa: 0 dibujos/frame en las tres skins · Fin de partida: Neón 13 dibujos/frame con 12 de glow y Retro 27 (121 de 121 frames en 2 s; Clásico no medido) · Mutaciones del DOM 0,5 a 2,25/s · Heap Neón 15,47 MB a los 5 s y 15,49 MB a los 60 s (sin fuga) · JS del loop 0,07 a 0,10 ms (Neón y Retro) · un solo loop vivo tras pausar y reanudar en las tres skins (241 de 240 frames)
- **Hallazgos:** (Alta) el loop sigue dibujando tras `onGameOver` (`game.ts:281-287`, `303-307`); (Alta) Neón dibuja 11 a 19 veces por frame con `shadowBlur` por asteroide y por bala (`entities.ts:123-134`, `55-73`; microprueba: 20 trazos con glow 4,2 ms contra 0,83 ms sin él) -> halo horneado por asteroide y sprite de la bala; (Media) `hexToRgba` por partícula y por frame (`entities.ts:251`) -> tabla de 101 colores; (Media) `points.map` con dos arreglos por vértice en Retro (`render.ts:97-100`)
- **Pendientes bajos:** entran en el mismo spec (`forEach`/`filter`/`concat` por frame en `game.ts:163-279`, puntos literales de nave y power-up y objeto `origin` por frame, `imageSmoothingEnabled` por frame en Retro `game.ts:266`, `start`/`resume` sin `stopLoop()`). Descartados: sprites de la nave y del power-up, pool de canvas de los halos, agrupar los 420 a 509 `fillRect` de Retro (microprueba: +500 `fillRect` suman ~0,2 ms), caché del fondo, optimizar las colisiones, acotar `Asteroid.rot`
- **Historial:**
  - 2026-10-12 — Revisión de rendimiento: medidas las tres skins con `npm run dev`; escrito `specs/17-asteroids-performance.md` en Borrador.

### `pacman`, `invaders`, `galaga`

En el catálogo pero sin motor (`lib/arcade/registry.ts` no los registra). Cuando tengan motor, `/arcade-game <id>` y después este agente.

## Historial de sesiones

- 2026-10-12 — Primera corrida, `frogger`: creado el registro (filas `[ ]` para los 4 motores restantes y `[/]` para pacman, invaders y galaga); medidas las tres skins; escrito `specs/13-frogger-performance.md` en Borrador; `frogger` pasa a `[~]`.
- 2026-10-12 — Revisión de `arkanoid`: medida su única pasada (sin skins) con `npm run dev`; el loop dibuja 56,47 veces por frame tras el fin de partida (presupuesto 0), el resto cumple; escrito `specs/14-arkanoid-performance.md` en Borrador; `arkanoid` pasa a `[~]`.
- 2026-10-12 — Revisión de `tetris`: medida su única pasada (sin skins) con `npm run dev`; el loop dibuja 178,48 veces por frame (16,13 con glow) tras el fin de partida y la pieza activa llega a 16 dibujos con `shadowBlur` con la tuerca (presupuesto ≤ 10); escrito `specs/15-tetris-performance.md` en Borrador; `tetris` pasa a `[~]`.
- 2026-10-12 — Revisión de `snake`: medida su única pasada (sin skins) con `npm run dev`; el loop dibuja 62 veces por frame (1 con glow) tras el fin de partida (presupuesto 0), el resto cumple (glow 1/frame, p95 17,5 ms, heap plano); escrito `specs/16-snake-performance.md` en Borrador; `snake` pasa a `[~]`.
- 2026-10-12 — Revisión de `asteroids`: medidas las tres skins (Clásico, Neón y Retro) con `npm run dev`; el loop dibuja 13 veces por frame (12 con glow) en Neón y 27 en Retro tras el fin de partida (presupuesto 0) y Neón llega a 19 dibujos con `shadowBlur` por frame (presupuesto ≤ 10), el resto cumple (p95 17,4 a 17,6 ms, heap plano, pausa en 0); escrito `specs/17-asteroids-performance.md` en Borrador; `asteroids` pasa a `[~]`. Los cinco juegos con motor quedan revisados y en `[~]`.
- 2026-10-19 — `arkanoid`: implementado el SPEC 14 y medida su única pasada: dibujos por frame tras el fin de partida 56,47 → 0 (también 0 frames), pausa en 0, p95 17,4 ms (17,7 con CPU ×4), heap plano 60 s, JS del loop +0,006 a +0,010 ms contra `main`. `arkanoid` pasa a `[x]`.
- 2026-10-19 — `frogger`: implementado el SPEC 13 y medido Neón (glow 94,4 → 6,32 por frame, dibujos 204,9 → 103,7, 0 dibujos en pausa y en fin de partida, un solo loop tras JUGAR DE NUEVO). Clásico y Retro sin medir (el MCP de Playwright se colgó), así que `frogger` sigue en `[~]` hasta completar la medición.
