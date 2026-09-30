# Sugerencias de juegos — TODO

Memoria del agente `game-planner` (`.claude/agents/game-planner.md`). El agente lo lee antes de proponer y lo actualiza después. Se puede editar a mano (por ejemplo, para descartar una idea).

Última actualización: 2026-09-30

Estados: `[ ]` Sugerido · `[~]` En spec · `[x]` Implementado · `[-]` Descartado

## Resumen

| Estado | ID | Título | Origen | Catálogo | Categoría | Acento | Encaje | Sugerido | Actualizado |
| ------ | -- | ------ | ------ | -------- | --------- | ------ | ------ | -------- | ----------- |
| `[ ]` | `invaders` ★ | SPACE INVADERS | Desde cero | Fila existente (orden 5) | Disparos | `cyan` | 22/25 | 2026-09-30 | 2026-09-30 |
| `[ ]` | `stack` | STACK | Desde cero | Fila nueva (orden 9 provisional) | Habilidad (nueva) | `pink` | 21/25 | 2026-09-30 | 2026-09-30 |
| `[ ]` | `pacman` | PAC-MAN | Desde cero | Fila existente (orden 4) | Laberinto | `yellow` | 21/25 | 2026-09-30 | 2026-09-30 |
| `[ ]` | `tempest` | TEMPEST | Desde cero | Fila nueva (orden 10 provisional) | Disparos | `cyan` | 21/25 | 2026-09-30 | 2026-09-30 |
| `[ ]` | `tron` | TRON | Desde cero | Fila nueva (orden 11 provisional) | Clásicos | `cyan` | 20/25 | 2026-09-30 | 2026-09-30 |
| `[ ]` | `frogger` | FROGGER | Desde cero | Fila existente (orden 7) | Clásicos | `yellow` | 20/25 | 2026-09-30 | 2026-09-30 |
| `[ ]` | `robotron` | ROBOTRON | Desde cero | Fila nueva (orden 12 provisional) | Disparos | `yellow` | 20/25 | 2026-09-30 | 2026-09-30 |
| `[ ]` | `pipes` | PIPELINE | Desde cero | Fila nueva (orden 13 provisional) | Puzles | `cyan` | 20/25 | 2026-09-30 | 2026-09-30 |
| `[ ]` | `orbit` | ORBIT | Desde cero | Fila nueva (orden 14 provisional) | Habilidad (nueva) | `cyan` | 20/25 | 2026-09-30 | 2026-09-30 |
| `[ ]` | `pang` | PANG | Desde cero | Fila nueva (orden 15 provisional) | Disparos | `pink` | 19/25 | 2026-09-30 | 2026-09-30 |
| `[ ]` | `pong` | PONG | Desde cero | Fila nueva (orden 16 provisional) | Clásicos | `yellow` | 19/25 | 2026-09-30 | 2026-09-30 |
| `[ ]` | `missile-command` | MISSILE COMMAND | Desde cero | Fila nueva (orden 17 provisional; antes 9) | Disparos | `pink` | 19/25 | 2026-09-30 | 2026-09-30 |
| `[ ]` | `scramble` | SCRAMBLE | Desde cero | Fila nueva (orden 18 provisional) | Disparos | `yellow` | 19/25 | 2026-09-30 | 2026-09-30 |
| `[ ]` | `gemdrop` | GEM DROP | Desde cero | Fila nueva (orden 19 provisional) | Puzles | `pink` | 19/25 | 2026-09-30 | 2026-09-30 |
| `[ ]` | `gridpaint` | GRID PAINTER | Desde cero | Fila nueva (orden 20 provisional) | Laberinto | `yellow` | 19/25 | 2026-09-30 | 2026-09-30 |
| `[ ]` | `galaga` | GALAGA | Desde cero | Fila existente (orden 8) | Disparos | `cyan` | 19/25 | 2026-09-30 | 2026-09-30 |
| `[ ]` | `bombmaze` | BOMB MAZE | Desde cero | Fila nueva (orden 21 provisional) | Laberinto | `cyan` | 19/25 | 2026-09-30 | 2026-09-30 |
| `[ ]` | `donkey-kong` | DONKEY KONG | Desde cero | Fila nueva (orden 22 provisional) | Clásicos | `yellow` | 19/25 | 2026-09-30 | 2026-09-30 |
| `[ ]` | `enduro` | ENDURO | Desde cero | Fila nueva (orden 23 provisional) | Clásicos | `yellow` | 19/25 | 2026-09-30 | 2026-09-30 |
| `[ ]` | `neon-beat` | NEON BEAT | Desde cero | Fila nueva (orden 24 provisional) | Habilidad (nueva) | `pink` | 19/25 | 2026-09-30 | 2026-09-30 |
| `[ ]` | `slalom` | SLALOM | Desde cero | Fila nueva (orden 25 provisional) | Clásicos | `pink` | 18/25 | 2026-09-30 | 2026-09-30 |
| `[ ]` | `2048` | 2048 | Desde cero | Fila nueva (orden 26 provisional; antes 9) | Puzles | `pink` | 18/25 | 2026-09-30 | 2026-09-30 |
| `[ ]` | `centipede` | CENTIPEDE | Desde cero | Fila nueva (orden 27 provisional) | Disparos | `pink` | 18/25 | 2026-09-30 | 2026-09-30 |
| `[ ]` | `bomb-jack` | BOMB JACK | Desde cero | Fila nueva (orden 28 provisional) | Clásicos | `cyan` | 18/25 | 2026-09-30 | 2026-09-30 |
| `[ ]` | `mini-golf` | MINI GOLF | Desde cero | Fila nueva (orden 29 provisional) | Habilidad (nueva) | `cyan` | 18/25 | 2026-09-30 | 2026-09-30 |
| `[ ]` | `air-hockey` | AIR HOCKEY | Desde cero | Fila nueva (orden 30 provisional) | Habilidad (nueva) | `yellow` | 17/25 | 2026-09-30 | 2026-09-30 |
| `[-]` | `minesweeper` | BUSCAMINAS | — | Sin fila | Puzles | — | Filtro | 2026-09-30 | 2026-09-30 |

## Preferencias y decisiones del usuario

_(Sin registros todavía.)_

## Detalle

### `invaders` — SPACE INVADERS

- **Estado:** `[ ]` Sugerido · **Encaje:** C5 V4 Co3 E5 Ca5 = 22/25 · ★ Recomendado actual
- **Origen:** desde cero (no hay carpeta en `references/started-games/` ni assets en `references/source-assets/`) · **Catálogo:** fila existente `invaders` (Disparos, `cyan`, orden 5).
- **Por qué encaja:**
  - C5: oleadas de 1 a 2 min y partidas de 3 a 10 min; la puntuación premia puntería y lectura del ritmo (filas de más valor, platillo misterioso), con poco azar.
  - V4: primer «fixed shooter» con formación que avanza y escudos destructibles, distinto del disparo libre con inercia de ASTEROIDS; suma un segundo `cyan` jugable, aunque repite la categoría Disparos.
  - Co3: sin referencia ni assets, pero la lógica es chica (grilla de alienígenas, balas, escudos por celdas) y el contrato no se amplía (3 vidas en VIDAS, oleada en NIVEL).
  - E5: alienígenas pixelados en neón sobre el CRT son la imagen más icónica del arcade y se dibujan con rectángulos y los tokens del tema.
  - Ca5: ya tiene fila y su `long_description` (escudos, llegar al suelo, acelerar cuantos menos quedan) describe exactamente el MVP, sin migración de descripción.
- **MVP:** Mueves el cañón con ← → y disparas con Espacio (una bala a la vez) contra una formación de 5×11 alienígenas que baja un escalón al tocar cada borde y acelera a medida que quedan menos, con cuatro escudos que se desgastan y un platillo misterioso que cruza arriba. Pierdes una vida si te alcanza una bala enemiga (3 vidas), la partida termina sin vidas o si la formación llega a la línea de los escudos, y cada oleada limpia sube el NIVEL y la siguiente empieza más abajo.
- **Riesgos y ampliaciones del contrato:** no amplía el contrato (VIDAS y NIVEL encajan). El original es vertical (224×256): en 800×600 la formación recorre más ancho, así que el spec debe fijar paso horizontal, bajada y fórmula de aceleración para que el ritmo no se vuelva lento. Los escudos se erosionan por celdas (p. ej. de 4 px), lo que suma colisiones finas. Espacio dispara y también inicia desde `StartScreen` (el filtro de `event.repeat` ya lo cubre). Sonido fuera del MVP. Tope de puntaje sin riesgo (unos 1.000 a 1.300 puntos por oleada).
- **Siguiente paso:** `/arcade-game invaders`
- **Historial:**
  - 2026-09-30 — Sugerido (puesto 1 de 6). Recomendado.
  - 2026-09-30 — Reevaluado en la ronda de 20 juegos: puntaje sin cambios; sigue en el puesto 1 de 26 y conserva la ★.

### `pacman` — PAC-MAN

- **Estado:** `[ ]` Sugerido · **Encaje:** C5 V5 Co2 E4 Ca5 = 21/25
- **Origen:** desde cero · **Catálogo:** fila existente `pacman` (Laberinto, `yellow`, orden 4).
- **Por qué encaja:**
  - C5: partidas tensas y cortas; la puntuación premia rutas y cadenas de fantasmas (200/400/800/1.600), con poco azar.
  - V5: primera mecánica de laberinto con enemigos con IA y primer jugable de la categoría Laberinto, que hoy no tiene ninguno.
  - Co2: sin referencia; cuatro IAs de fantasma con modos dispersión/persecución/susto, un laberinto de 28×31 con túnel y giro anticipado hacen del motor el más caro de los pendientes, aunque no amplía el contrato.
  - E4: laberinto neón `cyan`, Pac-Man `yellow` y fantasmas con `--neon-pink`, `--neon-cyan`, `--bronze` y `--neon-purple` lucen bien; el rojo clásico de Blinky no tiene token propio.
  - Ca5: ya tiene fila y la descripción (puntos, píldoras de poder, frutas) coincide con el MVP.
- **MVP:** Recorres con las flechas un laberinto de 28×31 casillas comiendo 240 puntos y 4 píldoras de poder mientras cuatro fantasmas con IA distinta alternan entre dispersión y persecución; la píldora los vuelve vulnerables y comerlos en cadena da 200/400/800/1.600. Tienes 3 vidas, cada laberinto limpio sube el NIVEL con fantasmas más rápidos y menos tiempo de susto, y una fruta aparece dos veces por nivel.
- **Riesgos y ampliaciones del contrato:** no amplía el contrato (3 vidas y nivel por laberinto). El laberinto no es 4:3: se dibuja centrado (p. ej. casillas de 18 px, 504×558) y el espacio lateral puede alojar fruta o indicadores. El spec debe fijar tablas de IA, velocidades y tiempos de cada modo por nivel, más el búfer de giro anticipado, que define la sensación del juego. Sonido fuera del MVP. Tope de puntaje sin riesgo.
- **Siguiente paso:** `/arcade-game pacman`
- **Historial:**
  - 2026-09-30 — Sugerido (puesto 2 de 6).
  - 2026-09-30 — Ronda de 20 juegos: puntaje sin cambios; baja al puesto 3 de 26 (`stack` empata en 21 y gana por costo).

### `frogger` — FROGGER

- **Estado:** `[ ]` Sugerido · **Encaje:** C4 V4 Co3 E4 Ca5 = 20/25
- **Origen:** desde cero · **Catálogo:** fila existente `frogger` (Clásicos, `yellow`, orden 7).
- **Por qué encaja:**
  - C4: partidas cortas de timing puro con bonus por tiempo sobrante, pero el patrón de carriles es repetitivo y el techo de habilidad es menor que en un shooter o un laberinto.
  - V4: cruzar carriles montando plataformas móviles (troncos, tortugas) no existe en la plataforma y suma `yellow`, pero cae en Clásicos, la categoría con más jugables (ARKANOID y SNAKE).
  - Co3: sin referencia; grilla y entidades simples, y el temporizador por rana se dibuja en el canvas sin tocar el contrato.
  - E4: carriles y vehículos en neón con `--neon-green` para la rana se ven bien; el río necesita un fondo propio que no es token del tema.
  - Ca5: ya tiene fila y la descripción promete autopista, río y tiempo, todo dentro del MVP.
- **MVP:** Llevas a la rana con las flechas, una casilla por pulsación, desde la acera inferior hasta cinco refugios, cruzando cinco carriles de autos y cinco de troncos y tortugas que se sumergen, con 30 s por rana. Tienes 3 vidas (atropello, caer al agua, salir de pantalla sobre un tronco o agotar el tiempo), y al llenar los cinco refugios sube el NIVEL con tráfico más rápido.
- **Riesgos y ampliaciones del contrato:** no amplía el contrato; el temporizador va dibujado en el canvas. Las 13 filas del original caben con celdas de unos 46 px y el spec debe fijar el ancho de la grilla. Hay que resolver el transporte de la rana sobre troncos (posición no alineada a la grilla) y el ciclo de inmersión de las tortugas. Moscas, cocodrilos y serpientes fuera del MVP.
- **Siguiente paso:** `/arcade-game frogger`
- **Historial:**
  - 2026-09-30 — Sugerido (puesto 3 de 6).
  - 2026-09-30 — Ronda de 20 juegos: puntaje sin cambios; puesto 6 de 26. Solapa en categoría Clásicos con `tron`, `donkey-kong`, `enduro`, `bomb-jack`, `slalom` y `pong` si todos entran.

### `missile-command` — MISSILE COMMAND

- **Estado:** `[ ]` Sugerido · **Encaje:** C4 V3 Co3 E5 Ca4 = 19/25
- **Origen:** desde cero · **Catálogo:** fila nueva propuesta: `id` `missile-command`, título MISSILE COMMAND, Disparos, `pink`, orden 17 provisional (antes 9; reasignado el 2026-09-30 porque el 9 pasa a `stack` al ordenar las 22 filas nuevas por encaje).
- **Por qué encaja:**
  - C4: oleadas cortas con puntos por misil destruido y bonus por ciudades y misiles sobrantes, que premian priorizar y anticipar; con la mira movida por teclado se pierde algo de precisión frente al trackball original.
  - V3: primera mecánica de defensa de zona apuntando a un punto, pero sería el cuarto juego de Disparos (con ASTEROIDS, INVADERS y GALAGA).
  - Co3: sin referencia; entidades simples (estelas en línea, explosiones circulares) y sin ampliar el contrato (6 ciudades en VIDAS, oleada en NIVEL); el mouse opcional ya tiene precedente en ARKANOID.
  - E5: estelas vectoriales y explosiones que crecen son neón puro.
  - Ca4: entra en una categoría y un acento actuales, pero exige una fila nueva; `pink` equilibra el catálogo (hoy 2 de 8 filas).
- **MVP:** Mueves una mira con las flechas y disparas con Z, X o C desde tres bases con munición limitada; cada disparo estalla donde está la mira y destruye los misiles enemigos que caen sobre seis ciudades. Cada oleada superada sube el NIVEL con misiles más rápidos y numerosos, y la partida termina cuando no queda ninguna ciudad.
- **Riesgos y ampliaciones del contrato:** necesita una migración `insert` en `games` (la aplica `/spec-impl`). VIDAS con 6 ciudades muestra 6 ■ (el HUD ya lo soporta). Z/X/C no hacen scroll, así que `createKeyboard` no cambia. El mouse como extra obliga a convertir coordenadas con `getBoundingClientRect`. Sin sonido en el MVP.
- **Siguiente paso:** `/arcade-game defensa antimisil: mira con flechas, tres bases, seis ciudades`
- **Historial:**
  - 2026-09-30 — Sugerido (puesto 4 de 6; empata con `galaga` y gana por costo).
  - 2026-09-30 — Ronda de 20 juegos: puntaje sin cambios; puesto 12 de 26. `sort_order` reasignado de 9 a 17 (conflicto con `stack`). Con `tempest`, `robotron`, `pang`, `scramble` y `centipede` propuestos, Disparos tendría 9 juegos y bajaría su V.

### `galaga` — GALAGA

- **Estado:** `[ ]` Sugerido · **Encaje:** C5 V3 Co2 E4 Ca5 = 19/25
- **Origen:** desde cero · **Catálogo:** fila existente `galaga` (Disparos, `cyan`, orden 8).
- **Por qué encaja:**
  - C5: picados y fases de desafío premian precisión y reflejos; muy rejugable.
  - V3: comparte base con INVADERS (disparo fijo contra formación) y suma los picados; si INVADERS va primero, la mecánica queda en parte repetida.
  - Co2: sin referencia; entradas y picados por curvas, rayo tractor, nave doble y fases de desafío lo hacen caro, y un MVP sin captura contradice la `long_description`.
  - E4: insectos vectoriales en neón con campo de estrellas lucen bien, pero dibujarlos legibles sin sprites cuesta más que los alienígenas de INVADERS.
  - Ca5: ya tiene fila.
- **MVP:** Mueves el caza con ← → y disparas con Espacio (hasta dos balas) contra una formación de 40 insectos que entra en oleadas por trayectorias curvas y luego se lanza en picado de a uno o en grupos. Tienes 3 vidas, cada formación destruida sube el NIVEL, y la captura con rayo tractor y las fases de desafío quedan para un spec posterior.
- **Riesgos y ampliaciones del contrato:** no amplía el contrato. Si el MVP deja fuera la captura y las fases de desafío, el spec debe incluir la migración `update_galaga_description` o aceptar la descripción como está. Conviene hacerlo después de INVADERS para reutilizar la experiencia de formación y balas (no el código, que vive en cada carpeta).
- **Siguiente paso:** `/arcade-game galaga`
- **Historial:**
  - 2026-09-30 — Sugerido (puesto 5 de 6; empata con `missile-command` y pierde por costo).
  - 2026-09-30 — Ronda de 20 juegos: puntaje sin cambios; puesto 16 de 26 (entre los de 19 puntos con Co2 gana por ser fila existente y estar ya sugerido).

### `2048` — 2048

- **Estado:** `[ ]` Sugerido · **Encaje:** C3 V4 Co3 E4 Ca4 = 18/25
- **Origen:** desde cero · **Catálogo:** fila nueva propuesta: `id` `2048`, título 2048, Puzles, `pink`, orden 26 provisional (antes «9 o el siguiente libre»; reasignado el 2026-09-30 al ordenar las 22 filas nuevas por encaje).
- **Por qué encaja:**
  - C3: la puntuación premia la estrategia, pero las partidas buenas duran 15 a 40 min, la puntuación crece con la cantidad de movimientos y la ficha nueva (2 o 4) es azar.
  - V4: primer puzle de deslizar y combinar, sin tiempo real; equilibra Puzles (solo TETRIS), aunque no es un clásico arcade.
  - Co3: es el motor más chico de la lista (grilla 4×4), pero no tiene vidas ni nivel y obliga a ampliar el contrato con `hud.level?: boolean`.
  - E4: fichas neón con los ocho tokens de color (`--neon-*`, `--gold`, `--silver`, `--bronze`) distinguen los valores; se ve más casual que arcade.
  - Ca4: entra en una categoría y un acento actuales, pero exige una fila nueva.
- **MVP:** Deslizas con las flechas todas las fichas de una grilla de 4×4 y las fichas iguales que chocan se combinan en una del doble de valor, que suma ese valor a la puntuación; después de cada movimiento aparece un 2 (90 %) o un 4 (10 %). La partida termina cuando la grilla está llena y no queda ninguna combinación posible.
- **Riesgos y ampliaciones del contrato:** amplía el contrato con `hud.level?: boolean` (toca `engine.ts`, `PlayerView` y `PlayerHud`, con criterio de «Sin regresiones»), o emite un nivel fijo si el usuario lo prefiere. `hud.lives: false` ya existe. El `id` empieza con un dígito: el export sería `game2048Definition`. Hay que decidir si llegar a 2048 es victoria o se sigue jugando. Tope de puntaje sin riesgo (el máximo teórico ronda los 3,9 millones).
- **Siguiente paso:** `/arcade-game 2048: deslizar y combinar fichas en una grilla de 4×4`
- **Historial:**
  - 2026-09-30 — Sugerido (puesto 6 de 6).
  - 2026-09-30 — Ronda de 20 juegos: puntaje sin cambios; puesto 22 de 26. `sort_order` reasignado a 26. Comparte el hueco de «puzle sin vidas» con `pipes` y `gemdrop`; los tres usarían `hud: { lives: false }` (2048 además necesita `hud.level?`).

### `stack` — STACK

- **Estado:** `[ ]` Sugerido · **Encaje:** C5 V4 Co4 E5 Ca3 = 21/25
- **Origen:** desde cero · **Catálogo:** fila nueva propuesta: `id` `stack`, título STACK, Habilidad (categoría nueva), `pink`, orden 9 provisional.
- **Por qué encaja:**
  - C5: un solo botón, partidas de 1 a 4 min y la puntuación premia el timing exacto (bonus por bloque perfecto), sin azar.
  - V4: primer juego de «un botón» con torre que crece y scroll vertical de cámara; abre la categoría Habilidad.
  - Co4: motor de los más chicos de la lista (un bloque que se desliza, un recorte y un contador); no amplía el contrato.
  - E5: losas neón apiladas con glow lucen muy bien sobre el CRT.
  - Ca3: exige la categoría nueva `Habilidad`; el acento `pink` equilibra el catálogo.
- **MVP:** Un bloque se desliza de lado a lado y con Espacio lo sueltas sobre la torre; lo que sobresale se corta y el bloque siguiente es más angosto, con bonus por soltarlo perfecto. Terminas al fallar del todo (sin vidas) o al llegar al piso 99 (victoria); NIVEL sube por tramos de altura.
- **Riesgos y ampliaciones del contrato:** usa `hud: { lives: false }` y NIVEL por altura. Cámara con scroll vertical dentro del canvas. Requiere migración que amplíe `games_category_check` (hoy Clásicos, Disparos, Puzles, Laberinto), tipo `GameCategory` y `CATEGORY_FILTERS` en `lib/games.ts`. Si el usuario no quiere la categoría, cabría en Clásicos.
- **Siguiente paso:** `/arcade-game stack: apilar bloques que se deslizan con un solo botón`
- **Historial:**
  - 2026-09-30 — Sugerido (puesto 2 de 26; empata en 21 con `pacman` y `tempest` y gana por costo).

### `tempest` — TEMPEST

- **Estado:** `[ ]` Sugerido · **Encaje:** C5 V5 Co2 E5 Ca4 = 21/25
- **Origen:** desde cero · **Catálogo:** fila nueva propuesta: `id` `tempest`, título TEMPEST, Disparos, `cyan`, orden 10 provisional.
- **Por qué encaja:**
  - C5: oleadas cortas y rejugables; la puntuación premia puntería y priorizar segmentos.
  - V5: shooter de tubo con la nave sobre el borde de una red circular, mecánica que ningún juego del catálogo tiene.
  - Co2: sin referencia y es el más caro del grupo por la perspectiva de la red (proyección de 16 segmentos y enemigos que suben).
  - E5: red vectorial neón en perspectiva es la imagen ideal del tema.
  - Ca4: categoría y acento actuales, pero fila nueva.
- **MVP:** Mueves la nave por el borde de una red circular de 16 segmentos con ← → y disparas con Espacio a los enemigos que suben por el tubo. Tienes 3 vidas, cada oleada limpia sube el NIVEL con enemigos más rápidos y numerosos.
- **Riesgos y ampliaciones del contrato:** no amplía el contrato (VIDAS y NIVEL = oleada). Riesgo principal: la proyección en perspectiva de la red y la colisión por segmento; el Superzapper queda fuera del MVP. Con `tempest`, `robotron`, `pang`, `scramble`, `centipede` y `missile-command`, Disparos llegaría a 9 juegos.
- **Siguiente paso:** `/arcade-game tempest: shooter de tubo en red circular de 16 segmentos`
- **Historial:**
  - 2026-09-30 — Sugerido (puesto 4 de 26).

### `tron` — TRON

- **Estado:** `[ ]` Sugerido · **Encaje:** C4 V3 Co4 E5 Ca4 = 20/25
- **Origen:** desde cero · **Catálogo:** fila nueva propuesta: `id` `tron`, título TRON, Clásicos, `cyan` (la propuesta duplicada `lightcycles` decía `pink`; se elige `cyan` por equilibrio), orden 11 provisional.
- **Por qué encaja:**
  - C4: rondas de 30 s a 2 min contra una IA; premia el trazado y el encierro del rival, aunque la IA fija limita el techo.
  - V3: motos con estela en arena; se parece en «crecer sin chocar» a SNAKE, pero es un duelo contra un rival.
  - Co4: arena de 40×30 celdas, una IA de tres reglas y estelas como listas de celdas; no amplía el contrato.
  - E5: estelas neón `cyan` y `pink` sobre grilla oscura, el tema por excelencia.
  - Ca4: categoría y acento actuales, fila nueva. Solapa con SNAKE (Clásicos, mismo motor de grilla).
- **MVP:** Guías una moto con las flechas por una arena de 40×30 dejando una estela sólida; gana la ronda quien deje al rival chocar contra una pared o una estela. Tienes 3 vidas (una por ronda perdida), y NIVEL = ronda con una IA más agresiva.
- **Riesgos y ampliaciones del contrato:** no amplía el contrato. Prohibir la reversa de 180° y fijar las tres reglas de la IA (evitar choque, acercarse, cortar el paso). **Fusionado** con la propuesta `lightcycles` (Laberinto, `pink`, 19/25: C4 V4 Co3 E5 Ca3, arena 40×30 contra 2 IA): eran el mismo juego; se conserva `tron` con 1 IA, y la segunda IA queda como ampliación.
- **Siguiente paso:** `/arcade-game tron: motos con estela en una arena 40x30 contra una IA`
- **Historial:**
  - 2026-09-30 — Sugerido (puesto 5 de 26).
  - 2026-09-30 — Fusionado con `lightcycles` (duplicado); se conserva el id `tron`, categoría Clásicos y acento `cyan`.

### `robotron` — ROBOTRON

- **Estado:** `[ ]` Sugerido · **Encaje:** C4 V5 Co3 E4 Ca4 = 20/25
- **Origen:** desde cero · **Catálogo:** fila nueva propuesta: `id` `robotron`, título ROBOTRON, Disparos, `yellow`, orden 12 provisional.
- **Por qué encaja:**
  - C4: partidas cortas y frenéticas; rescatar humanos da bonus y premia el riesgo, con algo de azar en la aparición de enemigos.
  - V5: primer twin-stick: se mueve con una mano y se dispara en 8 direcciones con la otra.
  - Co3: Grunts que persiguen y humanos son entidades simples; sin ampliar el contrato.
  - E4: arena neón con muchos enemigos pequeños; el rendimiento del glow con muchas entidades es el riesgo visual.
  - Ca4: categoría y acento actuales, fila nueva.
- **MVP:** Mueves con WASD y disparas con las flechas en 8 direcciones a los Grunts que te persiguen en una arena cerrada; rescatar humanos da bonus creciente. Tienes 3 vidas y cada oleada limpia sube el NIVEL.
- **Riesgos y ampliaciones del contrato:** 8 teclas simultáneas (comprobar ghosting y que las flechas no hagan scroll, ya cubierto por `createKeyboard`) y rendimiento del glow con muchas entidades. Sin ampliar el contrato.
- **Siguiente paso:** `/arcade-game robotron: arena twin-stick con WASD y flechas`
- **Historial:**
  - 2026-09-30 — Sugerido (puesto 7 de 26).

### `pipes` — PIPELINE

- **Estado:** `[ ]` Sugerido · **Encaje:** C4 V5 Co3 E4 Ca4 = 20/25
- **Origen:** desde cero · **Catálogo:** fila nueva propuesta: `id` `pipes`, título PIPELINE, Puzles, `cyan`, orden 13 provisional.
- **Por qué encaja:**
  - C4: partidas de 3 a 8 min; premia planear el trazado, con la cola de piezas como único azar.
  - V5: puzle de conectar tuberías con un fluido que avanza solo, sin equivalente en la plataforma.
  - Co3: cursor sobre grilla de 10×7 y una cola de 5 piezas; usa `hud: { lives: false }`.
  - E4: tuberías neón con el fluido brillando; se ve más de puzle que de arcade.
  - Ca4: categoría Puzles y acento `cyan`, pero fila nueva.
- **MVP:** Mueves un cursor por una grilla de 10×7 con las flechas y colocas con Espacio la siguiente pieza de una cola de 5 mientras el fluido avanza solo. Sumas por cada tramo recorrido y la partida termina cuando el fluido se derrama; NIVEL aumenta la velocidad.
- **Riesgos y ampliaciones del contrato:** sin vidas (`hud: { lives: false }`); NIVEL = velocidad. Solapa en «puzle sin vidas» con `gemdrop` y `2048`.
- **Siguiente paso:** `/arcade-game pipes: conectar tuberías en una grilla 10x7 antes de que el fluido llegue`
- **Historial:**
  - 2026-09-30 — Sugerido (puesto 8 de 26).

### `orbit` — ORBIT

- **Estado:** `[ ]` Sugerido · **Encaje:** C4 V5 Co3 E5 Ca3 = 20/25
- **Origen:** desde cero · **Catálogo:** fila nueva propuesta: `id` `orbit`, título ORBIT, Habilidad (categoría nueva), `cyan`, orden 14 provisional.
- **Por qué encaja:**
  - C4: partidas de 2 a 5 min, premia el timing del salto entre anillos.
  - V5: nave que orbita una estrella y salta entre 2 anillos con un botón; mecánica original.
  - Co3: física orbital simple (ángulo y radio), orbes y escombros; sin ampliar el contrato.
  - E5: anillos, estrella y estelas son vectoriales neón puros.
  - Ca3: exige la categoría nueva `Habilidad`.
- **MVP:** Tu nave orbita una estrella y con Espacio salta entre dos anillos para recoger orbes y esquivar escombros. Tienes 3 vidas y NIVEL sube con más escombros y más velocidad.
- **Riesgos y ampliaciones del contrato:** no amplía el contrato. Requiere migración de `games_category_check`, tipo `GameCategory` y `CATEGORY_FILTERS` (categoría `Habilidad`).
- **Siguiente paso:** `/arcade-game orbit: nave que salta entre dos anillos orbitales`
- **Historial:**
  - 2026-09-30 — Sugerido (puesto 9 de 26).

### `pang` — PANG

- **Estado:** `[ ]` Sugerido · **Encaje:** C4 V4 Co4 E4 Ca3 = 19/25
- **Origen:** desde cero · **Catálogo:** fila nueva propuesta: `id` `pang`, título PANG, Disparos (discutible: podría ir en Clásicos), `pink`, orden 15 provisional.
- **Por qué encaja:**
  - C4: bonus de tiempo y cadenas de bolas premian precisión; rejugable.
  - V4: arpón vertical y bolas que rebotan y se dividen, sin equivalente.
  - Co4: el más barato del grupo de acción; física de rebote parabólico y un arpón a la vez.
  - E4: bolas neón que se dividen se leen bien.
  - Ca3: la categoría es discutible (Disparos frente a Clásicos), lo que baja el encaje.
- **MVP:** Mueves al jugador con ← → y lanzas con Espacio un arpón vertical (uno a la vez) que divide las bolas que rebotan hasta eliminarlas. Tienes 3 vidas, hay bonus de tiempo y cada nivel limpio sube el NIVEL.
- **Riesgos y ampliaciones del contrato:** no amplía el contrato. Definir la categoría en el spec; añade otro Disparos si se queda ahí.
- **Siguiente paso:** `/arcade-game pang: arpón vertical contra bolas que rebotan y se dividen`
- **Historial:**
  - 2026-09-30 — Sugerido (puesto 10 de 26).

### `pong` — PONG

- **Estado:** `[ ]` Sugerido · **Encaje:** C4 V2 Co4 E5 Ca4 = 19/25
- **Origen:** desde cero · **Catálogo:** fila nueva propuesta: `id` `pong`, título PONG, Clásicos, `yellow`, orden 16 provisional.
- **Por qué encaja:**
  - C4: partidas cortas y rejugables contra una CPU cada vez más rápida.
  - V2: el más parecido a ARKANOID en mecánica (paleta y pelota), por eso baja en variedad.
  - Co4: motor muy simple: dos paletas, una pelota y una IA de seguimiento.
  - E5: líneas y pelota neón puras.
  - Ca4: categoría y acento actuales, fila nueva.
- **MVP:** Mueves tu paleta con ↑ ↓ contra una CPU y anotas cuando la pelota supera su lado. Tienes 3 vidas (un punto en contra cuesta una) y NIVEL sube la velocidad y la puntería de la CPU.
- **Riesgos y ampliaciones del contrato:** no amplía el contrato. Riesgo de percibirse como repetido frente a ARKANOID; solapa además con `air-hockey`.
- **Siguiente paso:** `/arcade-game pong: paleta contra CPU con velocidad creciente`
- **Historial:**
  - 2026-09-30 — Sugerido (puesto 11 de 26).

### `scramble` — SCRAMBLE

- **Estado:** `[ ]` Sugerido · **Encaje:** C4 V4 Co3 E4 Ca4 = 19/25
- **Origen:** desde cero · **Catálogo:** fila nueva propuesta: `id` `scramble`, título SCRAMBLE, Disparos, `yellow`, orden 18 provisional.
- **Por qué encaja:**
  - C4: recorrido completo de 3 a 6 min; combustible y bombas piden gestión, sin azar (terreno con seed).
  - V4: primer shooter de scroll horizontal con láser y bombas.
  - Co3: terreno determinista generado por seed, láser y bombas; el combustible se dibuja en el canvas y no amplía el contrato.
  - E4: terreno de líneas neón con scroll fluido.
  - Ca4: categoría y acento actuales, fila nueva.
- **MVP:** Pilotas una nave por un terreno con scroll horizontal, disparas el láser con Espacio y sueltas bombas con Z sobre bases y depósitos de combustible. Tienes 3 vidas y el combustible, dibujado en el canvas, baja con el tiempo.
- **Riesgos y ampliaciones del contrato:** no amplía el contrato. El terreno debe ser determinista (seed) para que el ranking sea justo. Z y Espacio no hacen scroll de página.
- **Siguiente paso:** `/arcade-game scramble: shooter de scroll horizontal con láser y bombas`
- **Historial:**
  - 2026-09-30 — Sugerido (puesto 13 de 26).

### `gemdrop` — GEM DROP

- **Estado:** `[ ]` Sugerido · **Encaje:** C4 V3 Co3 E5 Ca4 = 19/25
- **Origen:** desde cero · **Catálogo:** fila nueva propuesta: `id` `gemdrop`, título GEM DROP, Puzles, `pink`, orden 19 provisional.
- **Por qué encaja:**
  - C4: partidas de 3 a 8 min; las cascadas premian la planificación.
  - V3: puzle de caída con columnas de gemas tipo Columns; solapa con TETRIS.
  - Co3: grilla, detección de líneas de 3 y cascadas; usa `hud: { lives: false }`.
  - E5: gemas neón de colores brillan muy bien.
  - Ca4: categoría y acento actuales, fila nueva.
- **MVP:** Caen columnas de tres gemas que giras y mueves con las flechas; alinear tres o más del mismo color las elimina y provoca cascadas con multiplicador. La partida termina al llenarse el pozo; NIVEL aumenta la velocidad.
- **Riesgos y ampliaciones del contrato:** sin vidas (`hud: { lives: false }`). Solapa con TETRIS (ya implementado): confirmar con el usuario si acepta otro puzle de caída.
- **Siguiente paso:** `/arcade-game gemdrop: columnas de tres gemas con cascadas`
- **Historial:**
  - 2026-09-30 — Sugerido (puesto 14 de 26).

### `gridpaint` — GRID PAINTER

- **Estado:** `[ ]` Sugerido · **Encaje:** C4 V4 Co3 E4 Ca4 = 19/25
- **Origen:** desde cero · **Catálogo:** fila nueva propuesta: `id` `gridpaint`, título GRID PAINTER, Laberinto, `yellow` (propuesto `pink`; cambiado para equilibrar acentos), orden 20 provisional.
- **Por qué encaja:**
  - C4: partidas cortas por nivel; el trazado óptimo premia la planificación.
  - V4: tipo Amidar: pintar los cuadros de una grilla mientras cuatro enemigos siguen patrones; segundo jugable de Laberinto.
  - Co3: grilla de 6×5 y patrones fijos de enemigos, sin ampliar el contrato.
  - E4: cuadros que se iluminan al pintarse se ven bien en neón.
  - Ca4: categoría y acento actuales, fila nueva.
- **MVP:** Recorres con las flechas las líneas de una grilla de 6×5 pintando los cuadros que cierras mientras 4 enemigos con patrones fijos te persiguen. Tienes 3 vidas y pintar todo sube el NIVEL.
- **Riesgos y ampliaciones del contrato:** no amplía el contrato. Definir patrones deterministas de enemigos por nivel.
- **Siguiente paso:** `/arcade-game gridpaint: pintar cuadros de una grilla 6x5 esquivando 4 enemigos`
- **Historial:**
  - 2026-09-30 — Sugerido (puesto 15 de 26). Acento cambiado de `pink` a `yellow` para equilibrar.

### `bombmaze` — BOMB MAZE

- **Estado:** `[ ]` Sugerido · **Encaje:** C4 V5 Co2 E4 Ca4 = 19/25
- **Origen:** desde cero · **Catálogo:** fila nueva propuesta: `id` `bombmaze`, título BOMB MAZE, Laberinto, `cyan`, orden 21 provisional.
- **Por qué encaja:**
  - C4: partidas de 3 a 8 min; la puntuación premia encadenar explosiones.
  - V5: tipo Bomberman en solitario, con bombas y bloques destructibles; nada similar en el catálogo.
  - Co2: costo alto: grilla de 15×11 celdas de 48 px, IA de enemigos, bombas, cadenas y bloques.
  - E4: muros y explosiones neón se leen bien.
  - Ca4: categoría y acento actuales, fila nueva.
- **MVP:** Mueves con las flechas por una grilla de 15×11 celdas y colocas bombas con Espacio para abrirte paso y eliminar enemigos. Tienes 3 vidas y cada nivel limpio sube el NIVEL.
- **Riesgos y ampliaciones del contrato:** no amplía el contrato. Es el más caro de los laberintos; definir alcance de explosión y IA en el spec.
- **Siguiente paso:** `/arcade-game bombmaze: Bomberman en solitario en una grilla de 15x11`
- **Historial:**
  - 2026-09-30 — Sugerido (puesto 17 de 26).

### `donkey-kong` — DONKEY KONG

- **Estado:** `[ ]` Sugerido · **Encaje:** C5 V5 Co2 E4 Ca3 = 19/25
- **Origen:** desde cero · **Catálogo:** fila nueva propuesta: `id` `donkey-kong`, título DONKEY KONG, Clásicos (o Plataformas), `yellow`, orden 22 provisional. Nombre alternativo por marca de Nintendo: `barrel-climb`.
- **Por qué encaja:**
  - C5: partidas cortas por pantalla con bonus de tiempo; premia el timing de los saltos.
  - V5: primer plataformas con escaleras y saltos.
  - Co2: colisión con vigas inclinadas, barriles y escaleras es lo más difícil de acertar sin referencia.
  - E4: vigas y barriles neón; el personaje necesita silueta clara.
  - Ca3: es una marca registrada de Nintendo (renombrar) y tal vez requiera categoría nueva (Plataformas).
- **MVP:** Subes por 4 vigas con escaleras (← → ↑ ↓) y saltas con Espacio los barriles que rueda el mono hasta llegar arriba. Tienes 3 vidas, hay bonus de tiempo y cada pantalla completada sube el NIVEL.
- **Riesgos y ampliaciones del contrato:** no amplía el contrato. Riesgo de marca: usar `barrel-climb` u otro nombre. Solapa con `bomb-jack` (plataformas).
- **Siguiente paso:** `/arcade-game donkey-kong: plataformas con 4 vigas, escaleras y barriles`
- **Historial:**
  - 2026-09-30 — Sugerido (puesto 18 de 26).

### `enduro` — ENDURO

- **Estado:** `[ ]` Sugerido · **Encaje:** C4 V5 Co2 E4 Ca4 = 19/25
- **Origen:** desde cero · **Catálogo:** fila nueva propuesta: `id` `enduro`, título ENDURO, Clásicos, `yellow` (propuesto `pink`; cambiado para equilibrar acentos), orden 23 provisional.
- **Por qué encaja:**
  - C4: cuota de autos por «día» premia adelantar sin chocar.
  - V5: primera carrera pseudo-3D.
  - Co2: la proyección pseudo-3D de la carretera es lo más difícil; conviene un prototipo del render.
  - E4: horizonte y carretera de líneas neón; los autos se leen bien.
  - Ca4: categoría y acento actuales, fila nueva (con opción de categoría nueva «Carreras»).
- **MVP:** Manejas con ← → por una carretera pseudo-3D adelantando autos para cumplir la cuota del día antes de que acabe el tiempo. No hay vidas (`hud: { lives: false }`) y NIVEL = día, con más tráfico.
- **Riesgos y ampliaciones del contrato:** sin vidas. Prototipar primero el render. Solapa con `slalom` (carrera con scroll vertical).
- **Siguiente paso:** `/arcade-game enduro: carrera pseudo-3D con cuota de autos por día`
- **Historial:**
  - 2026-09-30 — Sugerido (puesto 19 de 26). Acento cambiado de `pink` a `yellow` para equilibrar.

### `neon-beat` — NEON BEAT

- **Estado:** `[ ]` Sugerido · **Encaje:** C4 V5 Co2 E5 Ca3 = 19/25
- **Origen:** desde cero · **Catálogo:** fila nueva propuesta: `id` `neon-beat`, título NEON BEAT, Habilidad (categoría nueva), `pink`, orden 24 provisional.
- **Por qué encaja:**
  - C4: canciones de 1 a 2 min con puntuación por precisión y combo.
  - V5: primer juego de ritmo.
  - Co2: sin audio en el MVP el reloj se rige solo por dt, pero temporizar patrones exige cuidado.
  - E5: carriles y notas neón son ideales.
  - Ca3: exige la categoría nueva `Habilidad`.
- **MVP:** Caen notas por 4 carriles y las golpeas con las flechas en el momento justo; hay 3 canciones de patrón fijo y una barra de energía dibujada en el canvas. La partida termina si la barra se vacía o al acabar la canción.
- **Riesgos y ampliaciones del contrato:** sin audio en el MVP, reloj solo con dt. Requiere la categoría `Habilidad` (migración de `games_category_check`, `GameCategory` y `CATEGORY_FILTERS`). El HUD usa la barra de energía en el canvas y `hud: { lives: false }`.
- **Siguiente paso:** `/arcade-game neon-beat: ritmo de 4 carriles con flechas`
- **Historial:**
  - 2026-09-30 — Sugerido (puesto 20 de 26).

### `slalom` — SLALOM

- **Estado:** `[ ]` Sugerido · **Encaje:** C4 V3 Co4 E3 Ca4 = 18/25
- **Origen:** desde cero · **Catálogo:** fila nueva propuesta: `id` `slalom`, título SLALOM, Clásicos, `pink`, orden 25 provisional.
- **Por qué encaja:**
  - C4: cada descenso es corto y premia trazar las puertas.
  - V3: esquí cenital con scroll vertical; parecido en carrera con `enduro`.
  - Co4: scroll vertical, puertas y obstáculos; sin ampliar el contrato.
  - E3: la nieve no es neón; usar «pista sintética» con líneas de color.
  - Ca4: categoría y acento actuales, fila nueva.
- **MVP:** Esquías con ← → por una pista con scroll vertical pasando por las puertas para sumar puntos y extender el tiempo. No hay vidas (`hud: { lives: false }`) y termina al agotarse el tiempo.
- **Riesgos y ampliaciones del contrato:** sin vidas. Estética a resolver como pista sintética.
- **Siguiente paso:** `/arcade-game slalom: esquí cenital con puertas y tiempo que se extiende`
- **Historial:**
  - 2026-09-30 — Sugerido (puesto 21 de 26).

### `centipede` — CENTIPEDE

- **Estado:** `[ ]` Sugerido · **Encaje:** C4 V3 Co3 E4 Ca4 = 18/25
- **Origen:** desde cero · **Catálogo:** fila nueva propuesta: `id` `centipede`, título CENTIPEDE, Disparos, `pink`, orden 27 provisional.
- **Por qué encaja:**
  - C4: rondas cortas; premia priorizar segmentos y hongos.
  - V3: fixed shooter con hongos; solapa con `invaders` y `galaga`.
  - Co3: ciempiés en segmentos y campo de hongos; sin ampliar el contrato.
  - E4: segmentos neón y hongos se leen bien.
  - Ca4: categoría y acento actuales, fila nueva.
- **MVP:** Mueves una nave en la zona inferior y disparas con Espacio a un ciempiés que serpentea entre hongos y baja al chocar. Tienes 3 vidas y cada ciempiés destruido sube el NIVEL.
- **Riesgos y ampliaciones del contrato:** no amplía el contrato. Solapa con `invaders` y `galaga`; conviene hacerlo solo si los shooters fijos se quedan cortos.
- **Siguiente paso:** `/arcade-game centipede: fixed shooter con ciempiés y hongos`
- **Historial:**
  - 2026-09-30 — Sugerido (puesto 23 de 26).

### `bomb-jack` — BOMB JACK

- **Estado:** `[ ]` Sugerido · **Encaje:** C4 V4 Co3 E4 Ca3 = 18/25
- **Origen:** desde cero · **Catálogo:** fila nueva propuesta: `id` `bomb-jack`, título BOMB JACK, Clásicos (o Plataformas), `cyan`, orden 28 provisional.
- **Por qué encaja:**
  - C4: rondas cortas; premia el orden de recolección.
  - V4: plataformas flotantes con salto y planeo, aunque solapa con `donkey-kong`.
  - Co3: 24 bombas, plataformas y enemigos con patrón; sin ampliar el contrato.
  - E4: bombas neón sobre plataformas flotantes se ven bien.
  - Ca3: puede requerir una categoría nueva (Plataformas) si se juntan varios.
- **MVP:** Saltas con Espacio entre plataformas flotantes para recoger 24 bombas antes de que te alcancen los enemigos. Tienes 3 vidas y cada pantalla completa sube el NIVEL.
- **Riesgos y ampliaciones del contrato:** no amplía el contrato. Solapa con `donkey-kong`: elegir uno de los dos primero.
- **Siguiente paso:** `/arcade-game bomb-jack: recoger 24 bombas en plataformas flotantes`
- **Historial:**
  - 2026-09-30 — Sugerido (puesto 24 de 26).

### `mini-golf` — MINI GOLF

- **Estado:** `[ ]` Sugerido · **Encaje:** C4 V5 Co2 E4 Ca3 = 18/25
- **Origen:** desde cero · **Catálogo:** fila nueva propuesta: `id` `mini-golf`, título MINI GOLF, Habilidad (categoría nueva), `cyan`, orden 29 provisional.
- **Por qué encaja:**
  - C4: 9 hoyos por partida y la puntuación premia pocos golpes.
  - V5: primer juego de precisión con potencia y ángulo.
  - Co2: 9 hoyos con obstáculos y física de rebote y fricción; mucho diseño de niveles.
  - E4: campos neón vectoriales.
  - Ca3: exige la categoría nueva `Habilidad`.
- **MVP:** Con ← → apuntas y con Espacio sostenido cargas la potencia del golpe para meter la bola en cada uno de los 9 hoyos. La puntuación premia menos golpes y la partida termina tras el hoyo 9.
- **Riesgos y ampliaciones del contrato:** Espacio sostenido genera `repeat` en `keyboard.ts`: exigir soltar Espacio antes de la primera carga. Requiere la categoría `Habilidad`. Sin vidas: `hud: { lives: false }`.
- **Siguiente paso:** `/arcade-game mini-golf: 9 hoyos con apuntado y potencia`
- **Historial:**
  - 2026-09-30 — Sugerido (puesto 25 de 26).

### `air-hockey` — AIR HOCKEY

- **Estado:** `[ ]` Sugerido · **Encaje:** C4 V3 Co2 E5 Ca3 = 17/25
- **Origen:** desde cero · **Catálogo:** fila nueva propuesta: `id` `air-hockey`, título AIR HOCKEY, Habilidad (categoría nueva), `yellow`, orden 30 provisional.
- **Por qué encaja:**
  - C4: partidas de 2 a 4 min contra una CPU con dificultad creciente; premia el control de la maleta.
  - V3: a diferencia de PONG el control es en dos ejes con inercia, pero sigue siendo un duelo paleta contra CPU y solapa con `pong`.
  - Co2: física de maleta y mazo con colisión circular (sub-pasos para evitar el efecto túnel), inercia en dos ejes e IA; cuesta más que `pong`.
  - E5: mesa neón con la maleta brillante y la línea central son ideales.
  - Ca3: exige la categoría nueva `Habilidad`.
- **MVP:** Mueves tu mazo con las flechas en dos ejes con algo de inercia sobre tu mitad de la mesa y anotas metiendo la maleta en el arco de la CPU. Cada gol en contra cuesta una de tus 3 vidas y NIVEL sube la velocidad y la puntería de la CPU.
- **Riesgos y ampliaciones del contrato:** no amplía el contrato. Física con sub-pasos para el efecto túnel. Requiere la categoría `Habilidad`. Elegido como el vigésimo juego en lugar de `hoops` (tiro libre con medidor, evaluado en 16/25: C4 V3 Co3 E3 Ca3, solapa con `mini-golf` y `stack`), sin registrar en el Resumen.
- **Siguiente paso:** `/arcade-game air-hockey: mesa de hockey de aire contra CPU`
- **Historial:**
  - 2026-09-30 — Sugerido (puesto 26 de 26; evaluado por el consolidador contra `hoops`).

### `minesweeper` — BUSCAMINAS

- **Estado:** `[-]` Descartado por el filtro duro.
- **Razón:** la medida natural de habilidad es el tiempo (menos es mejor) y el ranking ordena por mayor puntuación; además las jugadas forzadas a ciegas (50/50) meten azar en el resultado y el juego está pensado para mouse. Convertir el tiempo en puntos sería artificial.
- **Historial:**
  - 2026-09-30 — Descartado por el filtro al evaluarlo como candidato nuevo.

## Historial de sesiones

- 2026-09-30 — «Dame una recomendación de un juego»: recomendado `invaders`; top 3 `invaders`, `pacman`, `frogger`; cambios: primera sesión (memoria vacía, nada que reconciliar), 6 entradas nuevas `[ ]` (`invaders`, `pacman`, `frogger`, `missile-command`, `galaga`, `2048`) y 1 `[-]` por filtro (`minesweeper`). Supabase respondió al segundo intento; catálogo y registro coinciden con `references/implemented-games.md`.
- 2026-09-30 — 20 juegos en paralelo (4 áreas): recomendado `invaders` (sin cambios); top 3 `invaders`, `stack`, `pacman`; cambios: 20 entradas nuevas `[ ]` (`stack`, `tempest`, `tron`, `robotron`, `pipes`, `orbit`, `pang`, `pong`, `scramble`, `gemdrop`, `gridpaint`, `bombmaze`, `donkey-kong`, `enduro`, `neon-beat`, `slalom`, `centipede`, `bomb-jack`, `mini-golf`, `air-hockey`) tras fusionar `lightcycles` con `tron` (mismo juego; 19 únicos de los agentes más `air-hockey`, evaluado por el consolidador en 17/25 frente a `hoops` 16). `sort_order` provisionales 9 a 30 únicos, por encaje descendente (empate: menor costo); `missile-command` pasó de 9 a 17 y `2048` de 9 a 26. Acentos reequilibrados a 10 cyan / 10 pink / 10 yellow con las 30 filas: `enduro` y `gridpaint` de `pink` a `yellow`, y `tron` en `cyan` (la propuesta `lightcycles` decía `pink`). Habilidad (nueva) tendría 5 juegos: `stack`, `orbit`, `neon-beat`, `mini-golf`, `air-hockey`. Resumen: 27 filas (26 `[ ]` y 1 `[-]`). Sin cambios en «Preferencias y decisiones del usuario».
