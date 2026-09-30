# Juegos implementados

Lista de los juegos de Arcade E1230 que ya tienen un motor real y se pueden jugar. Los datos del catálogo salen de la tabla `games` de Supabase (consultada el 2026-09-30) y el estado de implementación, del registro `lib/arcade/registry.ts`.

Resumen: **4 juegos jugables** de los 8 que hay en el catálogo.

| #   | ID          | Título    | Categoría | Acento   | Ruta                     | Motor                | Spec                        |
| --- | ----------- | --------- | --------- | -------- | ------------------------ | -------------------- | --------------------------- |
| 1   | `arkanoid`  | ARKANOID  | Clásicos  | `cyan`   | `/games/arkanoid/play`   | `lib/arcade/arkanoid/`  | `specs/08-arkanoid-game.md` |
| 2   | `tetris`    | TETRIS    | Puzles    | `yellow` | `/games/tetris/play`     | `lib/arcade/tetris/`    | `specs/07-tetris-game.md`   |
| 3   | `snake`     | SNAKE     | Clásicos  | `pink`   | `/games/snake/play`      | `lib/arcade/snake/`     | `specs/09-snake-game.md`    |
| 4   | `asteroids` | ASTEROIDS | Disparos  | `pink`   | `/games/asteroids/play`  | `lib/arcade/asteroids/` | `specs/05-asteroids-game.md` |

Los cuatro guardan su puntuación en el ranking global (tabla `scores` de Supabase).

## ARKANOID

- **ID:** `arkanoid` · **Categoría:** Clásicos · **Acento:** `cyan` · **Orden en el catálogo:** 1
- **Descripción corta:** Rompe todos los ladrillos con tu nave y la bola.
- **Descripción larga:** Controla la nave Vaus y devuelve la bola de energía para destruir cada muro de ladrillos. Cada fase tiene un patrón distinto y la bola va más rápido que en la anterior. Tienes tres vidas: si la bola cae, pierdes una. Limpia las cinco fases para completar el juego.
- **Implementación:** port de `references/started-games/04-arkanoid/`, con sprites, sonido y control con flechas o mouse. Assets en `public/arcade/arkanoid/`, copiados sin modificar de `references/started-games/04-arkanoid/assets/`: `spritesheet-breakout.png`, `ball-bounce.mp3` y `break-sound.mp3`. Crédito: el spritesheet es obra de Petraheim ("Made by Petraheim", visible en el propio PNG); no se recorta ni se edita.

## TETRIS

- **ID:** `tetris` · **Categoría:** Puzles · **Acento:** `yellow` · **Orden en el catálogo:** 2
- **Descripción corta:** Encaja las piezas y limpia líneas sin parar.
- **Descripción larga:** Gira y coloca las piezas que caen para completar líneas horizontales. Cuidado con la tuerca: una pieza hueca que deja un agujero difícil de limpiar. Cada diez líneas subes de nivel y la caída se acelera. La partida termina cuando las piezas alcanzan el techo.
- **Implementación:** port de `references/started-games/03-tetris/`, con 8 piezas (las 7 estándar y una «tuerca» hueca) y autorrepetición propia de las flechas. No tiene vidas, así que el HUD oculta la celda VIDAS (`hud: { lives: false }`), y LÍNEAS y SIGUIENTE se dibujan en un panel dentro del canvas.

## SNAKE

- **ID:** `snake` · **Categoría:** Clásicos · **Acento:** `pink` · **Orden en el catálogo:** 3
- **Descripción corta:** Come, crece y no te muerdas la cola.
- **Descripción larga:** Guía a la serpiente por la pantalla y come las frutas para crecer. Cada cinco frutas subes de nivel y la serpiente va más rápido. Tienes tres vidas: chocar con las paredes o contigo mismo te cuesta una y la serpiente vuelve a empezar desde el centro.
- **Implementación:** diseñado desde cero (sin referencia en `references/started-games/`), con grilla de 20×15 celdas, 3 vidas y nivel cada 5 frutas. Las frutas usan `public/arcade/snake/fruits.png`, copiada sin modificar de `references/source-assets/snake-assets/`. Origen: según el comentario de `sprites.js`, The Spriters Resource («Google Snake Game»); las coordenadas de los 22 recortes de la fila del medio pasaron a `lib/arcade/snake/sprites.ts`.

## ASTEROIDS

- **ID:** `asteroids` · **Categoría:** Disparos · **Acento:** `pink` · **Orden en el catálogo:** 6
- **Descripción corta:** Pulveriza rocas espaciales en gravedad cero.
- **Descripción larga:** Pilota una nave en un campo de asteroides y dispárales para partirlos en fragmentos cada vez más pequeños. Usa el hiperespacio para escapar en el último segundo y vigila los platillos enemigos.
- **Implementación:** port a TypeScript de `references/started-games/02-asteroids/game.js`. Fue el primer juego real de la plataforma.

## Pendientes: en el catálogo pero sin motor

Estos juegos existen en la tabla `games` y aparecen en la Biblioteca, pero su Reproductor sigue con la partida simulada.

| ID        | Título         | Categoría | Acento   | Orden |
| --------- | -------------- | --------- | -------- | ----- |
| `pacman`  | PAC-MAN        | Laberinto | `yellow` | 4     |
| `invaders`| SPACE INVADERS | Disparos  | `cyan`   | 5     |
| `frogger` | FROGGER        | Clásicos  | `yellow` | 7     |
| `galaga`  | GALAGA         | Disparos  | `cyan`   | 8     |
