# Portar un juego de `references/started-games/`

Los juegos de referencia son proyectos independientes en HTML, CSS y JavaScript sin dependencias. El port los convierte en un motor de `lib/arcade/<id>/` que cumple `engine-contract.md`. Es un port, no un rediseño: por defecto la jugabilidad queda idéntica, y cada diferencia se justifica en el spec.

`references/` es de **solo lectura**. El spec siempre incluye el criterio «`git diff main -- references/` no muestra cambios».

## Inventario

Lee todos los archivos de la carpeta: `game.js`, `index.html`, `style.css`, `levels.js`, `assets/`, `README.md` y `CLAUDE.md`, además de los `specs/` propios de la referencia si los hay. Arma este inventario; cada fila termina en una sección del spec.

| Qué buscar                                                                  | Dónde va en el spec                                             |
| --------------------------------------------------------------------------- | --------------------------------------------------------------- |
| Constantes numéricas (velocidades, tamaños, tiempos, puntos, probabilidades) | Tabla de constantes, con los valores copiados literalmente        |
| Colores y estilo                                                            | `COLORS` y decisión de estilo (neón o sprites)                  |
| Controles (`keydown`, `keyup`, `mousemove`, `click`)                        | `controls` de la definición y reglas de entrada                 |
| Estados (`state`, `gameState`, `paused`, `gameOver`, `win`)                  | `Phase` del estado interno                                      |
| Loop y tiempo (`requestAnimationFrame`, acumuladores, timers)                | Reglas del loop                                                 |
| HUD dibujado en el canvas o en el DOM (score, vidas, nivel, líneas)          | Mapeo a callbacks y a `PlayerHud`                               |
| Overlays (pausa, game over, victoria, menús)                                | Qué se quita y qué pasa a `PlayerView` o `GameOverModal`        |
| DOM fuera del canvas (`getElementById`, paneles, canvases extra)             | Qué se dibuja ahora en el canvas principal y qué se quita       |
| Reinicio (tecla, botón)                                                     | Se quita: JUGAR DE NUEVO del modal                              |
| Assets: imágenes, spritesheets, fuentes                                     | Archivos en `public/arcade/<id>/` y módulo de carga             |
| Audio (`new Audio`, Web Audio)                                              | Dentro o fuera del alcance                                       |
| Datos (`levels.js`, tablas de piezas)                                       | Módulos tipados (`levels.ts`, `pieces.ts`…)                     |
| Estado global mutable y acceso a `window`/`document` a nivel de módulo       | Estado en el cierre y acceso solo dentro de `create()`          |
| Resolución del canvas                                                       | `width`/`height` 4:3 y encuadre del tablero                     |
| Extras de la referencia (tema claro/oscuro, selector de nivel, favicon)      | Normalmente fuera de alcance: listarlos en «Fuera de alcance»   |

## Transformaciones habituales

| En la referencia                                    | En el port                                                                                                            |
| --------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| Variables globales (`let score`, `let blocks`)      | Estado en el cierre de `create<Pascal>Engine` (`interface <Pascal>State`)                                            |
| `document.getElementById('score').textContent = …` | `callbacks.onScore(score)`                                                                                           |
| Vidas y nivel dibujados en el canvas o el DOM       | `callbacks.onLives` y `callbacks.onLevel`; el canvas ya no los dibuja                                                |
| Overlay de GAME OVER                                | `callbacks.onGameOver(score)` una vez; el modal lo muestra                                                           |
| Overlay de victoria («¡Completaste el juego!»)      | `callbacks.onGameOver(score)`; el texto de victoria queda fuera o se dibuja en el canvas (decisión del spec)         |
| Overlay de PAUSA y tecla P/Escape                   | Se quitan. La pausa es de `PlayerView`, que llama a `pause()`/`resume()`                                             |
| Tecla o botón de reinicio                           | Se quita. JUGAR DE NUEVO desmonta el motor y crea uno nuevo                                                          |
| `document.addEventListener('keydown', …)` directo   | `createKeyboard` de `lib/arcade/shared/` (ver `engine-contract.md`), conectado en `start`/`resume`                  |
| Acciones instantáneas en el `keydown` (mover, rotar) | `keyboard.consume(code)` dentro de `update`, para que la pausa y el fin de partida las ignoren                       |
| `setTimeout`/`setInterval`                          | Acumuladores que avanzan con `dt` dentro de `update`                                                                 |
| `performance.now()` fuera del loop                  | El `ts` del `requestAnimationFrame` y `lastTime` en el cierre                                                         |
| `new Image()` / `new Audio()` a nivel de módulo     | Se crean dentro de `create()`. Los archivos van en `public/arcade/<id>/` con rutas absolutas (`/arcade/<id>/…`)      |
| `levels.js`, tablas de piezas                       | `levels.ts`/`pieces.ts` con tipos explícitos                                                                         |
| Helpers globales de spritesheet                     | Módulo `sprites.ts` con `loadSprites()` y `drawSprite(ctx, …)`                                                        |
| Canvas no 4:3 o canvases extra (vista previa)       | Un único canvas 4:3; el tablero centrado y los paneles dibujados en el espacio libre                                 |
| Tema claro/oscuro, título, lista de controles en el DOM | Se quitan. Los controles salen de `definition.controls` en `StartScreen`                                          |

## Assets

- Los archivos se **copian** (no se mueven) de la referencia a `public/arcade/<id>/`. Nunca a `public/juegos/`, que el SPEC 05 descartó.
- Las imágenes se cargan dentro de `create()`. El spec fija qué pasa mientras cargan. La opción recomendada es que `update` no avance hasta que estén listas, sin llamar a callbacks extra. Así, si carga lento, el jugador ve el fondo unos milisegundos.
- El sonido quedó fuera del SPEC 05. Si entra en este spec, el audio se crea en `create()`, se pausa en `pause()` y se detiene en `destroy()`, y el spec dice qué pasa si el navegador bloquea la reproducción (`play()` rechaza la promesa: se ignora).

## «Reglas del port que difieren»

Toda diferencia con la referencia va en una lista con ese título dentro del «Modelo de datos» del spec, como en el SPEC 05. Como mínimo:

- Qué callbacks se emiten y cuándo (y los valores iniciales en `start()`).
- Qué deja de dibujarse en el canvas.
- Qué teclas o controles se quitan o cambian.
- Cómo termina la partida (derrota y victoria).
- Qué timers pasaron a acumuladores de `dt`.

## Casos conocidos

Datos observados al diseñar el skill. **Verifícalos al analizar**: la referencia puede haber cambiado.

### `02-asteroids`

Ya portado en el SPEC 05 (`lib/arcade/asteroids/`). Es el ejemplo que hay que imitar en estructura, estilo y nivel de detalle del spec.

### `03-tetris`

- Canvas `board` de 300×600 (10×20 celdas de 30 px) más un segundo canvas `next-canvas` de 120×120 para la siguiente pieza. El panel del DOM muestra SCORE, LINES, LEVEL, NEXT y los controles.
- No tiene vidas: el HUD necesita una de las opciones de `engine-contract.md`.
- Puntos: `[0, 100, 300, 500, 800] × nivel` por líneas; soft drop 1 punto por fila y hard drop 2 por celda. El nivel sube cada 10 líneas y la caída tarda `max(100, 1000 − (nivel − 1) × 90)` ms.
- Controles: `←`/`→` mover, `↓` soft drop, `↑` o `X` rotar, Espacio hard drop, P pausa. Las acciones se ejecutan dentro del `keydown` del documento; en el port pasan a `consume()` en `update`, y `KeyX` necesita entrar en las teclas bloqueadas o no, según se decida.
- Overlay del DOM con botón de reinicio, y un botón de tema claro/oscuro que queda fuera.
- Encuadre: el tablero 1:2 va centrado en 800×600 (por ejemplo, celdas de 28 px → 280×560) y el panel lateral se dibuja en el canvas.

### `04-arkanoid`

- Canvas de 800×600, que ya es 4:3.
- Spritesheet `assets/spritesheet-breakout.png` con los helpers de `assets/spritesheet.js` (`loadSpritesheet`, `drawSprite`, `drawFrame`, `EXPLOSION_FRAMES`) y dos sonidos: `ball-bounce.mp3` y `break-sound.mp3`.
- 5 niveles en `levels.js`, con la velocidad de la pelota ×1,1 por nivel. Estados `playing`, `gameover` y `win` («¡Completaste el juego!»).
- 3 vidas dibujadas en el canvas. 10 puntos por bloque.
- Controles: `←`/`→` y **mouse** (`mousemove` sobre el canvas, con escalado por `getBoundingClientRect`). P o Escape pausan.
- La pausa tiene un **selector de nivel** con botones dibujados en el canvas y clic: choca con la pausa de la plataforma (el overlay PAUSA de `CrtScreen` queda encima del canvas). Hay que decidir si se quita o va en otro spec.
- Con mouse, el aviso «ESTE JUEGO NECESITA TECLADO» de `StartScreen` puede no aplicar: es una pregunta del spec.
