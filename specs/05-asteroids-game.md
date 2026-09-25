# SPEC 05 — Asteroids jugable en el Reproductor

> **Estado:** Impelementado
> **Depende de:** SPEC 01
> **Fecha:** 2026-09-24
> **Objetivo:** Portar a TypeScript el Asteroids de `references/started-games/02-asteroids/` y hacerlo jugable en `/games/asteroids/play`, conectado al HUD, la pausa y el modal de fin de juego del Reproductor.

## Por qué existe este spec

El Reproductor (`/games/[id]/play`, SPEC 01) es hoy una maqueta: después de la carga muestra el placeholder «IFRAME SANDBOX» y el botón SIMULAR PARTIDA, que inventa puntos al azar. Ningún juego de la plataforma se puede jugar.

`references/started-games/02-asteroids/` tiene un Asteroids completo en canvas 2D (`game.js`, 510 líneas, sin dependencias). Este spec lo porta a TypeScript y lo monta dentro del gabinete CRT. La partida real alimenta el HUD de la plataforma y termina en el mismo `GameOverModal` que ya guarda puntuaciones en `localStorage`.

Es el primer juego real, así que el spec también fija el contrato que van a seguir los próximos (Tetris y Arkanoid ya tienen referencia en `references/started-games/`). El contrato se limita a lo que Asteroids necesita hoy; no anticipa necesidades de otros juegos.

El SPEC 04 anunciaba la autenticación real como «SPEC 05». Como este spec toma ese número, la autenticación pasa a ser el siguiente spec libre.

## Alcance

**Incluye:**

- **Contrato de motor** en `lib/arcade/engine.ts`: cómo se crea un juego sobre un `<canvas>`, cómo se pausa, reanuda y destruye, y qué eventos emite (puntuación, vidas, nivel, fin).
- **Registro de motores** en `lib/arcade/registry.ts`: indica qué juegos del catálogo tienen motor real. Solo `asteroids` lo tiene.
- **Port a TypeScript** de `game.js` en `lib/arcade/asteroids/`, con la misma jugabilidad: constantes, puntos (20/50/100), 3 vidas con invencibilidad al reaparecer, fragmentación, partículas, niveles (`3 + nivel` asteroides) y el power-up de disparo triple.
- **Estilo neón** en el canvas: nave cian, asteroides rosa, balas amarillas, power-up verde, fondo `--deep` y glow con `shadowBlur`.
- **HUD de la plataforma:** el canvas deja de dibujar SCORE, NIVEL, vidas y el overlay GAME OVER. Esos datos se muestran en `PlayerHud` y el fin, en `GameOverModal`. Solo el indicador del power-up («3x 4.2s») sigue en el canvas.
- **`GameCanvas`**: componente cliente que monta el motor en un `<canvas>` de 800×600 escalado a la pantalla 4:3 del CRT.
- **`StartScreen`**: pantalla de inicio dentro del CRT con el título, la tabla de controles, «PRESIONA ESPACIO» y el botón INICIAR.
- **Aviso sin teclado:** en dispositivos con puntero grueso (`(pointer: coarse)`), `StartScreen` muestra «ESTE JUEGO NECESITA TECLADO» en lugar de INICIAR.
- **Pausa integrada:** la tecla P y el botón PAUSA/SEGUIR detienen el loop del motor, y el overlay PAUSA del CRT se muestra encima del canvas.
- **Pausa automática:** si la pestaña se oculta (`visibilitychange`) o la ventana pierde el foco (`blur`) durante la partida, entra en PAUSA. El jugador la retoma con P o SEGUIR.
- **Fin de partida:** al perder la última vida se abre `GameOverModal` con la puntuación real. GUARDAR PUNTUACIÓN y JUGAR DE NUEVO funcionan como hoy.
- **Documentación:** actualizar `CLAUDE.md` (descripción del proyecto, estructura y la mención de «sin ningún juego real»).

**Fuera de alcance (para futuros specs):**

- Tetris, Arkanoid y los demás juegos del catálogo: sus Reproductores siguen con el placeholder y SIMULAR PARTIDA.
- Controles táctiles y cualquier forma de jugar sin teclado.
- Cambios de jugabilidad: nuevos controles (WASD), hiperespacio, platillos enemigos o ajustes de balance.
- Sonido y música.
- Cambios en la página de Detalle: `longDescription` de ASTEROIDS sigue mencionando hiperespacio y platillos, y no se agrega un bloque de controles.
- Cambios en la Biblioteca, el Home o el Salón de la Fama (por ejemplo, una etiqueta «JUGABLE»).
- Puntuaciones en Supabase, ranking global o validación de puntuaciones en el servidor. El guardado sigue en `e1230_scores`.
- Iframe, archivos en `public/juegos/` y protocolo `postMessage`.
- Tests automatizados: el proyecto todavía no tiene framework de tests.
- Modificar `references/started-games/02-asteroids/` o los specs 01 a 04.

## Rutas y archivos

```
lib/
  arcade/engine.ts                (nuevo) contrato GameDefinition, GameEngine y GameCallbacks
  arcade/registry.ts              (nuevo) getGameDefinition(gameId): motor registrado o undefined
  arcade/asteroids/constants.ts   (nuevo) dimensiones, tablas por tamaño, power-up y colores
  arcade/asteroids/math.ts        (nuevo) wrap, dist, rand, randInt
  arcade/asteroids/keyboard.ts    (nuevo) teclas sostenidas y pulsaciones de un frame
  arcade/asteroids/entities.ts    (nuevo) Bullet, Asteroid, PowerUp, Ship, Particle
  arcade/asteroids/game.ts        (nuevo) createAsteroidsEngine: estado, update, draw y loop
  arcade/asteroids/index.ts       (nuevo) asteroidsDefinition: GameDefinition
components/game/
  GameCanvas.tsx                  (nuevo) monta un GameEngine en un <canvas>
  StartScreen.tsx                 (nuevo) pantalla de inicio con controles o aviso sin teclado
  PlayerView.tsx                  (cambia) flujo real para juegos con motor
CLAUDE.md                         (cambia) proyecto, estructura y persistencia
```

Sin cambios: `app/games/[id]/play/page.tsx`, `PlayerHud`, `CrtScreen`, `GameOverModal`, `PixelLoader`, `lib/games.ts`, `lib/scores.ts`, `lib/local-scores.ts` y `lib/storage.ts`.

Convenciones:

- Los motores viven en `lib/arcade/` y no en `lib/games/`, para no crear una carpeta con el mismo nombre que el módulo `lib/games.ts`.
- Los módulos de `lib/arcade/` son TypeScript sin React ni JSX y no declaran `"use client"`. Solo acceden a `window` y `document` dentro de `create()`, nunca a nivel de módulo, para que importarlos desde un Client Component no rompa el prerender.
- Las entidades reciben el `CanvasRenderingContext2D` en `draw(ctx)` y el estado del teclado en `update(dt, keyboard)`. No hay variables globales de módulo con estado mutable: todo el estado de una partida vive dentro de `createAsteroidsEngine`.
- Se mantienen las convenciones del SPEC 01: código en inglés, comentarios en español latinoamericano y módulos sin JSX en kebab-case.

## Modelo de datos

Este spec no crea claves nuevas de `localStorage` ni tablas. Las puntuaciones se guardan con la estructura existente (`ScoreEntry` en `e1230_scores`).

### Contrato de motor — `lib/arcade/engine.ts`

```ts
export interface GameCallbacks {
  onScore(score: number): void;
  onLives(lives: number): void;
  onLevel(level: number): void;
  onGameOver(finalScore: number): void; // se llama una sola vez por partida
}

export interface GameEngine {
  start(): void; // emite los valores iniciales y arranca el loop
  pause(): void; // detiene el loop y suelta el teclado
  resume(): void; // reanuda sin salto de dt
  destroy(): void; // cancela el loop y quita todos los listeners
}

export interface GameControl {
  keys: string; // texto visible, p. ej. "← →"
  action: string; // p. ej. "ROTAR"
}

export interface GameDefinition {
  width: number; // resolución interna del canvas
  height: number;
  controls: GameControl[];
  create(canvas: HTMLCanvasElement, callbacks: GameCallbacks): GameEngine;
}
```

### Registro — `lib/arcade/registry.ts`

```ts
const DEFINITIONS: Partial<Record<string, GameDefinition>> = {
  asteroids: asteroidsDefinition,
};

export function getGameDefinition(gameId: string): GameDefinition | undefined;
```

Un juego del catálogo es «jugable» si y solo si `getGameDefinition(game.id)` devuelve una definición.

### Definición de Asteroids — `lib/arcade/asteroids/index.ts`

- `width: 800`, `height: 600`. Coincide con la proporción 4:3 de la pantalla del CRT.
- `controls`:

| `keys`    | `action`  |
| --------- | --------- |
| `← →`     | ROTAR     |
| `↑`       | PROPULSAR |
| `ESPACIO` | DISPARAR  |
| `P`       | PAUSA     |

### Constantes — `lib/arcade/asteroids/constants.ts`

Los valores de jugabilidad se copian de `game.js` sin cambios:

| Constante                                          | Valor                                          |
| -------------------------------------------------- | ---------------------------------------------- |
| `RADII` / `SPEEDS` / `POINTS` (tamaños 1, 2, 3)    | `16/30/50` · `85/55/32` · `100/50/20`          |
| Nave: rotación, empuje, arrastre, radio            | `3.5 rad/s`, `260 px/s²`, `0.987`, `12`        |
| Invencibilidad al reaparecer / espera tras morir   | `3 s` / `2 s`                                  |
| Bala: velocidad, vida, cadencia                    | `520 px/s`, `1.1 s`, `0.2 s`                   |
| Power-up: probabilidad, garantía, duración, vida   | `0.15`, a las `5` destrucciones, `5 s`, `12 s` |
| Apertura del disparo triple                        | `0.18 rad`                                     |
| Vidas iniciales / asteroides iniciales / por nivel | `3` / `4` / `3 + nivel`                        |
| Distancia segura al aparecer                       | `130 px`                                       |
| Tope de `dt`                                       | `0.05 s`                                       |
| Factor de colisión nave-asteroide                  | `0.82`                                         |

Colores del canvas (espejo de los tokens de `app/globals.css`, porque el canvas no puede leer clases de Tailwind):

```ts
export const COLORS = {
  background: "#05050a", // --deep
  ship: "#00f5ff", // --neon-cyan
  asteroid: "#ff006e", // --neon-pink
  bullet: "#f5ff00", // --neon-yellow
  powerUp: "#00ff88", // --neon-green
  flame: "#ff8c42", // --bronze
  particle: "255, 0, 110", // rosa en RGB para el alfa que se desvanece
} as const;
```

La nave, los asteroides, las balas y el power-up se dibujan con `shadowBlur = 8` y `shadowColor` igual a su color. Las partículas se dibujan sin glow.

### Estado interno de la partida — `lib/arcade/asteroids/game.ts`

```ts
type Phase = "playing" | "dead" | "gameover"; // igual que `state` en game.js

// Estado encapsulado en el cierre de createAsteroidsEngine (no se exporta)
interface AsteroidsState {
  phase: Phase;
  ship: Ship;
  bullets: Bullet[];
  asteroids: Asteroid[];
  particles: Particle[];
  powerUps: PowerUp[];
  score: number;
  lives: number;
  level: number;
  deadTimer: number;
  powerUpSpawned: boolean;
  killsSinceSpawn: number;
}
```

Reglas del port que difieren de `game.js`:

- `onScore` se emite cada vez que cambia `score`, `onLives` en cada `killShip` y `onLevel` en cada `nextLevel`. `start()` emite los tres con sus valores iniciales (`0`, `3`, `1`).
- Al perder la última vida, `phase` pasa a `"gameover"`, se llama `onGameOver(score)` una vez y el teclado se suelta. El loop sigue animando solo las partículas, igual que la referencia, hasta que se llame a `destroy()`.
- En `"gameover"` Espacio ya no reinicia la partida: el reinicio es JUGAR DE NUEVO del modal.
- `draw()` no dibuja SCORE, NIVEL, vidas ni el overlay GAME OVER. Sí dibuja el indicador `3x  {s}s` en verde, arriba a la izquierda, mientras el disparo triple está activo.
- `pause()` cancela el `requestAnimationFrame`. `resume()` pone `lastTime = null` para que el primer frame tenga `dt = 0`.

### Teclado — `lib/arcade/asteroids/keyboard.ts`

- Registra `keydown` y `keyup` en `window` al hacer `attach()` y los quita en `detach()`. `detach()` también vacía las teclas sostenidas y las pulsaciones pendientes.
- Una pulsación de un frame (`consume("Space")`) solo se registra si `event.repeat` es `false`. Así, mantener Espacio al iniciar la partida no dispara.
- Mientras está conectado, llama a `preventDefault()` en `ArrowLeft`, `ArrowRight`, `ArrowUp`, `ArrowDown` y `Space`, para que la página no haga scroll. No intercepta ninguna otra tecla (P la maneja `PlayerView`).
- El motor hace `attach()` en `start()` y `resume()`, y `detach()` en `pause()`, al pasar a `"gameover"` y en `destroy()`. Con el modal abierto, Espacio vuelve a activar el botón que tenga el foco.

### Estado del Reproductor — `components/game/PlayerView.tsx`

```ts
type PlayerStatus = "loading" | "ready" | "simulating" | "playing" | "over"; // + "playing"
```

Con motor (`getGameDefinition(game.id)` definido):

```
loading ──1.1 s──▶ ready (StartScreen) ──Espacio o INICIAR──▶ playing (GameCanvas)
                                                                  │ onGameOver
JUGAR DE NUEVO ◀── over (GameCanvas congelado + GameOverModal) ◀──┘
   └──▶ loading
```

- `ready` muestra `StartScreen`. Espacio (con `preventDefault`) o el botón INICIAR pasan a `playing`. La transición solo ocurre desde `ready`, así que un Espacio sobre el botón con foco no inicia dos veces.
- En `playing` y `over` se monta `GameCanvas`. Los callbacks actualizan `score`, `lives` y `level` del estado, que ya alimentan `PlayerHud`. `onGameOver` pasa a `over` y guarda la puntuación final en `score`.
- La pausa (P o PAUSA/SEGUIR) solo tiene efecto en `playing`. `GameCanvas` recibe `paused` y llama a `engine.pause()` o `engine.resume()`.
- Pausa automática: en `playing` y sin pausa, `document.visibilityState === "hidden"` o `window` `blur` ponen `paused: true`. Nunca se reanuda sola.
- JUGAR DE NUEVO llama a `startLoading()`, como hoy: `GameCanvas` se desmonta (el motor se destruye) y el flujo vuelve a `loading`.
- SALIR navega a `/games/asteroids` y el desmontaje destruye el motor.

Sin motor, el flujo `loading → ready (placeholder) → simulating → over` no cambia en nada.

### `GameCanvas` — `components/game/GameCanvas.tsx`

```ts
interface GameCanvasProps {
  definition: GameDefinition;
  paused: boolean;
  callbacks: GameCallbacks;
}
```

- Renderiza `<canvas width={definition.width} height={definition.height}>` con `absolute inset-0 h-full w-full`, debajo del overlay de pausa (`z-[3]`) y del overlay CRT (`z-[4]`).
- Crea el motor en un `useEffect` que depende solo de `definition`, llama a `start()` y devuelve `destroy()` como limpieza. Guarda `callbacks` en una ref para no recrear el motor cuando cambian.

### `StartScreen` — `components/game/StartScreen.tsx`

```ts
interface StartScreenProps {
  title: string;
  controls: GameControl[];
  onStart: () => void;
}
```

- Muestra el título en `font-pixel`, la tabla de controles y «PRESIONA ESPACIO» con `animate-blink`, más un `NeonButton` INICIAR.
- Si `matchMedia("(pointer: coarse)")` coincide, reemplaza «PRESIONA ESPACIO» y el botón por «ESTE JUEGO NECESITA TECLADO». La consulta se hace con `useSyncExternalStore`, con `false` como valor del servidor. `StartScreen` solo aparece después del loader, así que no hay diferencia de hidratación.

## Plan de implementación

1. **Contrato y registro vacío.** Crear `lib/arcade/engine.ts` con los tipos del modelo de datos y `lib/arcade/registry.ts` con `DEFINITIONS` vacío y `getGameDefinition`. Verificación: `npx tsc --noEmit` pasa y la app no cambia.
2. **Utilidades de Asteroids.** Crear `lib/arcade/asteroids/constants.ts` (todas las constantes y `COLORS`), `math.ts` y `keyboard.ts` (`attach`, `detach`, `isDown`, `consume`, `preventDefault` y el filtro de `event.repeat`). Verificación: `npx tsc --noEmit` y `npm run lint` pasan.
3. **Entidades.** Crear `lib/arcade/asteroids/entities.ts` con `Bullet`, `Asteroid`, `PowerUp`, `Particle` y `Ship`, portados de `game.js` con `update(dt, …)` y `draw(ctx)`, los colores de `COLORS` y el glow. Verificación: `npx tsc --noEmit` pasa.
4. **Motor.** Crear `lib/arcade/asteroids/game.ts` con `createAsteroidsEngine`: estado, `spawnAsteroids`, `nextLevel`, `explode`, `killShip`, `update`, `draw` (sin HUD, con el indicador del power-up), el loop y `start`/`pause`/`resume`/`destroy` con sus callbacks. Crear `index.ts` con `asteroidsDefinition`. El registro todavía no la incluye. Verificación: `npx tsc --noEmit` y `npm run lint` pasan.
5. **`GameCanvas` y `StartScreen`.** Crear los dos componentes según el modelo de datos. Todavía no se usan. Verificación: `npx tsc --noEmit` pasa.
6. **Conectar el Reproductor.** Registrar `asteroids` en `DEFINITIONS`. En `PlayerView`, agregar el estado `playing`, mostrar `StartScreen` en `ready` para juegos con motor, iniciar con Espacio o INICIAR, montar `GameCanvas` en `playing`/`over`, conectar los callbacks al HUD, pasar `onGameOver` a `over` y limitar la pausa a `playing`. Verificación: en `/games/asteroids/play` se juega una partida completa hasta el modal. `/games/tetris/play` sigue mostrando SIMULAR PARTIDA.
7. **Pausa automática.** Agregar en `PlayerView` los listeners de `visibilitychange` y `blur`, activos solo en `playing`. Verificación: cambiar de pestaña a mitad de partida deja el juego en PAUSA al volver.
8. **Documentación.** Actualizar `CLAUDE.md`: el párrafo de «Proyecto» (SPEC 05 implementado y ASTEROIDS jugable), la estructura (`lib/arcade/`, `GameCanvas`, `StartScreen`) y la frase de persistencia simulada. Verificación: `npm run format:check` pasa.

## Criterios de aceptación

**Generales**

- [ ] `npm run build` termina sin errores.
- [ ] `npm run lint` termina sin errores.
- [ ] Existen `lib/arcade/engine.ts`, `lib/arcade/registry.ts` y los seis archivos de `lib/arcade/asteroids/`, más `components/game/GameCanvas.tsx` y `components/game/StartScreen.tsx`.
- [ ] No existe la carpeta `lib/games/` ni la carpeta `public/juegos/`.
- [ ] Ningún archivo de `lib/arcade/` importa `react` ni declara `"use client"`.
- [ ] `git diff main -- references/` no muestra cambios.
- [ ] Al recorrer `/games/asteroids/play` y jugar una partida completa, la consola del navegador no muestra errores ni advertencias de hidratación.

**Flujo del Reproductor de ASTEROIDS**

- [ ] `/games/asteroids/play` muestra el `PixelLoader` y luego `StartScreen` con «ASTEROIDS», las cuatro filas de controles, «PRESIONA ESPACIO» e INICIAR.
- [ ] Presionar Espacio en `StartScreen` inicia la partida sin disparar una bala.
- [ ] Hacer clic en INICIAR inicia la partida.
- [ ] Con la partida iniciada, el HUD muestra `PUNTUACIÓN 0`, `VIDAS ■■■` y `NIVEL 01`.
- [ ] Con una ventana de navegador más baja que la página, las flechas y Espacio no hacen scroll durante la partida.
- [ ] Emulando un dispositivo táctil (`pointer: coarse`), `StartScreen` muestra «ESTE JUEGO NECESITA TECLADO» y no muestra INICIAR.

**Jugabilidad (idéntica a la referencia)**

- [ ] `←` y `→` rotan la nave, `↑` la propulsa con la llama visible y Espacio dispara.
- [ ] La partida empieza con 4 asteroides grandes, ninguno a menos de 130 px del centro.
- [ ] Destruir un asteroide grande suma 20 puntos en el HUD y lo parte en 2 medianos. Un mediano suma 50 y se parte en 2 pequeños. Un pequeño suma 100 y no se parte.
- [ ] Los objetos que salen por un borde aparecen por el opuesto.
- [ ] Chocar con un asteroide quita un cuadro de VIDAS en el HUD. La nave reaparece en el centro a los 2 s y parpadea mientras es invencible.
- [ ] Destruir todos los asteroides sube el HUD a `NIVEL 02` y aparecen 5 asteroides grandes.
- [ ] A más tardar en la quinta destrucción aparece un power-up verde «3x». Al recogerlo, la nave dispara 3 balas y el canvas muestra `3x` con la cuenta regresiva durante 5 s.
- [ ] El canvas no dibuja SCORE, NIVEL, iconos de vidas ni el texto GAME OVER.
- [ ] La nave es cian, los asteroides rosa, las balas amarillas y el fondo `#05050a`. Las líneas tienen glow y el overlay de scanlines del CRT se ve encima del juego.

**Pausa**

- [ ] P y el botón PAUSA congelan el juego y muestran el overlay PAUSA. P y SEGUIR lo reanudan sin que los objetos salten de posición.
- [ ] Mantener `↑` mientras se pausa y soltarlo durante la pausa no deja la nave propulsando al reanudar.
- [ ] Cambiar de pestaña durante la partida la deja en PAUSA al volver.
- [ ] Hacer clic fuera de la ventana del navegador durante la partida la deja en PAUSA.
- [ ] En `StartScreen`, P no muestra el overlay PAUSA.

**Fin de partida**

- [ ] Al perder la tercera vida se abre `GameOverModal` con la misma puntuación que mostraba el HUD.
- [ ] Con el modal abierto, Espacio sobre JUGAR DE NUEVO con foco activa el botón.
- [ ] GUARDAR PUNTUACIÓN guarda la entrada en `e1230_scores` bajo `asteroids`, y aparece en el ranking de `/games/asteroids` y del Salón de la Fama si entra en el top 10.
- [ ] JUGAR DE NUEVO vuelve a mostrar el `PixelLoader` y luego `StartScreen`, y la nueva partida empieza con el HUD en `0`, `■■■` y `01`.
- [ ] SALIR durante la partida lleva a `/games/asteroids`. Volver a JUGAR AHORA inicia una partida nueva sin que la anterior siga corriendo (una sola nave, sin doble velocidad).

**Sin regresiones**

- [ ] `/games/tetris/play` (y cualquier otro juego distinto de `asteroids`) muestra el placeholder IFRAME SANDBOX y SIMULAR PARTIDA, y la simulación termina en el modal como antes del spec.
- [ ] En un juego simulado, P sigue pausando la simulación.
- [ ] `/`, `/games`, `/games/asteroids`, `/login`, `/hall-of-fame` y `/about` se ven igual que antes del spec.

## Decisiones

- **Sí:** port a TypeScript dentro del bundle de Next. Queda tipado y pasa el lint, y la pausa y los eventos se conectan con llamadas directas. Lo eligió el usuario.
- **No:** iframe con `public/juegos/asteroids.html` y `postMessage`, como anunciaba el placeholder del SPEC 01. Deja JS sin tipos fuera del lint, el foco del teclado queda atrapado en el iframe y la pausa se vuelve asíncrona.
- **No:** estado del juego en React re-renderizando cada frame. A 60 fps es lento y mezcla la lógica del juego con la UI.
- **Sí:** contrato `GameDefinition`/`GameEngine` mínimo, con solo lo que Asteroids necesita. Tetris y Arkanoid lo ampliarán en sus specs si hace falta.
- **Sí:** `lib/arcade/` como carpeta de motores. Lo eligió el usuario para no convivir con `lib/games.ts`.
- **No:** mover `lib/games.ts` a `lib/games/catalog.ts`. Obliga a cambiar imports existentes sin ganancia.
- **Sí:** el registro importa `asteroidsDefinition` de forma estática. El código de Asteroids pesa poco y evita un estado de carga extra. Con varios juegos se puede pasar a `import()` dinámico.
- **Sí:** jugabilidad idéntica a la referencia (constantes, controles y power-up). Es un port, no un rediseño. Lo eligió el usuario.
- **Sí:** estilo neón con los colores del tema y glow. Encaja con el gabinete CRT. Lo eligió el usuario.
- **Sí:** power-up en verde (`--neon-green`) y no en cian como en la referencia. La nave ya es cian, y el power-up debe distinguirse.
- **Sí:** colores copiados como constantes en `constants.ts`, con el token de origen comentado. El canvas no puede usar clases de Tailwind, y leer variables CSS con `getComputedStyle` en cada frame es innecesario.
- **Sí:** el indicador «3x» usa `monospace` en el canvas. Las fuentes de `next/font` tienen nombres de familia generados, y usarlas en el canvas exige esperar a que carguen.
- **Sí:** HUD y fin de partida de la plataforma (`PlayerHud`, `GameOverModal`), sin duplicarlos en el canvas. Lo eligió el usuario. El indicador del power-up queda en el canvas porque `PlayerHud` no tiene un lugar para él.
- **Sí:** resolución interna fija de 800×600, escalada por CSS. Coincide con el 4:3 del CRT y no cambia la física.
- **Sí:** pantalla de inicio con controles antes de jugar. Da tiempo a leerlos y asegura que la ventana tenga el foco. Lo eligió el usuario.
- **Sí:** pausa automática al ocultar la pestaña o perder el foco, sin reanudación automática. Lo eligió el usuario.
- **Sí:** el teclado del motor se desconecta en pausa y en fin de partida. Evita teclas «pegadas» al reanudar y libera Espacio para los botones del modal.
- **Sí:** JUGAR DE NUEVO recorre loader y pantalla de inicio, igual que los juegos simulados. Lo eligió el usuario.
- **Sí:** los demás juegos siguen simulados. Lo eligió el usuario. Cada juego real llega con su propio spec.
- **Sí:** aviso «ESTE JUEGO NECESITA TECLADO» con `(pointer: coarse)`, sin controles táctiles. Lo eligió el usuario; los controles táctiles van en otro spec.
- **No:** corregir la descripción de ASTEROIDS en el Detalle (hiperespacio y platillos) ni agregar un bloque de controles. Lo decidió el usuario. La descripción queda desalineada con el juego real.
- **Sí:** las puntuaciones siguen en `localStorage` con el flujo actual. Llevarlas a Supabase va con la autenticación real.
- **Sí:** este spec toma el número 05 aunque el SPEC 04 anunciaba ese número para la autenticación. No se edita el SPEC 04, que es el registro de lo implementado.

## Riesgos

| Riesgo                                                                                              | Mitigación                                                                                                                           |
| --------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| En desarrollo, React Strict Mode monta el efecto dos veces y deja dos loops corriendo.              | `destroy()` cancela el `requestAnimationFrame` y quita todos los listeners. Hay un criterio de «una sola nave, sin doble velocidad». |
| `shadowBlur` con muchos objetos baja los fps.                                                       | Las partículas se dibujan sin glow. Si aun así baja, se reduce `shadowBlur` sin cambiar el contrato.                                 |
| El salto de `dt` al reanudar mueve los objetos de golpe.                                            | `resume()` pone `lastTime = null` y el tope de `dt` sigue en 50 ms.                                                                  |
| Espacio activa a la vez el keydown de `StartScreen` y el clic del botón INICIAR con foco.           | La transición a `playing` solo ocurre desde `ready` y el keydown llama a `preventDefault()`.                                         |
| Acceder a `window` o `document` al importar `lib/arcade/` rompe el prerender de `/games/[id]/play`. | La convención obliga a tocar el DOM solo dentro de `create()`. `npm run build` lo detecta.                                           |
| Un navegador de escritorio con pantalla táctil reporta `pointer: coarse` y bloquea el juego.        | `(pointer: coarse)` evalúa el puntero principal. En un portátil con mouse o touchpad el principal es `fine`.                         |
| Un portátil sin foco en la página no recibe las teclas al entrar al Reproductor.                    | `StartScreen` ofrece el botón INICIAR, y el clic le da foco a la página.                                                             |

## Lo que **no** entra en este spec

- Tetris, Arkanoid y cualquier otro juego real.
- Controles táctiles.
- Cambios de jugabilidad, nuevos controles, hiperespacio o platillos.
- Sonido.
- Cambios en el Detalle, la Biblioteca, el Home o el Salón de la Fama.
- Puntuaciones en Supabase, ranking global o validación en el servidor.
- Iframe y `postMessage`.
- Tests automatizados.
- Cambios en `references/` o en los specs 01 a 04.

Si alguna de estas llega, va en su propio spec.
