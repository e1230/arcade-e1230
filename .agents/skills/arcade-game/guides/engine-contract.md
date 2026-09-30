# Contrato de motor y reglas de `lib/arcade/`

Esta guía resume lo que el SPEC 05 fijó para cualquier juego con motor real. El código manda: si `lib/arcade/engine.ts` ya cambió en un spec posterior, parte de lo que dice el archivo.

## El contrato (`lib/arcade/engine.ts`)

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

// Apariencia de un juego: Clásico (por defecto), Neón o Retro (SPEC 10).
export type SkinId = "classic" | "neon" | "retro";

export interface GameOptions {
  skin: SkinId;
}

export interface GameDefinition {
  width: number; // resolución interna del canvas
  height: number;
  controls: GameControl[];
  hud?: GameHud; // opcional: { lives?: boolean }; false oculta la celda VIDAS
  skins?: readonly SkinId[]; // opcional: sin él, el Reproductor no muestra selector de skin
  create(
    canvas: HTMLCanvasElement,
    callbacks: GameCallbacks,
    options?: GameOptions,
  ): GameEngine;
}
```

`skins` y `options` son opcionales: un motor que no los usa sigue compilando y se ve igual. Un juego con skins declara `skins: SKIN_IDS` (de `lib/arcade/shared/skins.ts`) y lee `options?.skin ?? DEFAULT_SKIN` al crearse.

Qué exige cada método:

| Método        | Obligaciones                                                                                                                                                                                    |
| ------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `start()`     | Arma el estado inicial, emite `onScore`, `onLives` y `onLevel` con sus valores iniciales, conecta el teclado y pide el primer `requestAnimationFrame` con `lastTime = null`.                   |
| `pause()`     | Cancela el `requestAnimationFrame`, desconecta el teclado (vacía las teclas sostenidas) y pausa el audio si lo hay.                                                                          |
| `resume()`    | Reconecta el teclado, pone `lastTime = null` para que el primer frame tenga `dt = 0` y pide un nuevo frame.                                                                                    |
| `destroy()`   | Cancela el loop, quita **todos** los listeners, detiene el audio. Debe ser idempotente: en desarrollo, React Strict Mode monta y desmonta dos veces, y quedarían dos loops con la misma nave. |
| `onGameOver`  | Se llama **una sola vez** por partida: al perder y también al ganar (fin de todos los niveles). Después se desconecta el teclado; el loop puede seguir animando partículas hasta `destroy()`. |

Quién hace qué:

- `PlayerView` maneja la tecla P, el botón PAUSA/SEGUIR, la pausa automática (`visibilitychange` y `blur`), el inicio con Espacio o INICIAR desde `StartScreen`, y el reinicio con JUGAR DE NUEVO (desmonta `GameCanvas` y el motor se destruye). **El motor no maneja P ni reinicia la partida.**
- `GameCanvas` crea el motor en un `useEffect` que depende de `definition` y `skin`, pasa `{ skin }` a `create`, llama a `start()`, y a `pause()`/`resume()` según `paused`.
- `PlayerHud` muestra PUNTUACIÓN, VIDAS, NIVEL y JUGADOR con lo que emiten los callbacks.
- `GameOverModal` muestra la puntuación final y guarda en `scores` con `insertScore`.

## Estructura de un juego

Con `lib/arcade/asteroids/` como ejemplo:

```
lib/arcade/<id>/
  constants.ts   dimensiones, constantes de jugabilidad y fuentes del texto del canvas
  skins.ts       (si el juego tiene skins) SKINS: Record<SkinId, <Pascal>Skin>, con todos los colores y trazos
  render.ts      (si aplica) funciones de dibujo que sirven a las tres skins
  entities.ts    clases o fábricas de entidades con update(dt, …) y draw(ctx, skin)   (o model.ts si es un tablero)
  game.ts        create<Pascal>Engine(canvas, callbacks, options?): GameEngine
  index.ts       export const <camel>Definition: GameDefinition
  levels.ts      (si aplica) niveles tipados
  sprites.ts     (si aplica) carga y dibujo de imágenes
```

Y en `lib/arcade/registry.ts`, una entrada nueva en `DEFINITIONS`:

```ts
const DEFINITIONS: Partial<Record<string, GameDefinition>> = {
  asteroids: asteroidsDefinition,
  <id>: <camel>Definition,
};
```

Import estático, como decidió el SPEC 05. Si el bundle del Reproductor crece mucho con varios motores, pasar a `import()` dinámico va en su propio spec.

## Utilidades compartidas

Hoy `createKeyboard` (`keyboard.ts`) y `wrap`/`dist`/`rand`/`randInt` (`math.ts`) viven dentro de `lib/arcade/asteroids/`. Regla:

- El **primer** spec de juego que las necesite las mueve a `lib/arcade/shared/keyboard.ts` y `lib/arcade/shared/math.ts` en un paso propio y previo al motor, **sin cambiar su comportamiento**, y actualiza los imports de Asteroids. Verificación del paso: `npx tsc --noEmit`, `npm run lint` y una partida de ASTEROIDS igual que antes.
- Si el juego necesita que el teclado bloquee otras teclas (por ejemplo `KeyX` o `Enter`), el mismo paso cambia la firma a `createKeyboard(preventedCodes = DEFAULT_PREVENTED_CODES)`, con el conjunto actual (`ArrowLeft`, `ArrowRight`, `ArrowUp`, `ArrowDown`, `Space`) como valor por defecto.
- Los specs siguientes importan de `lib/arcade/shared/`.
- No copies `keyboard.ts` dentro de la carpeta del juego nuevo.

`keyboard.ts` ya filtra `event.repeat` en las pulsaciones de un frame (`consume`), así que mantener Espacio al salir de `StartScreen` no dispara ni hace hard drop. Mantén esa garantía en cualquier cambio.

## Reglas de los módulos de `lib/arcade/`

- TypeScript sin React ni JSX, y sin `"use client"`.
- `window`, `document`, `Image` y `Audio` solo se tocan dentro de `create()` (o de funciones que llama), nunca a nivel de módulo: importarlos desde un Client Component no puede romper el prerender.
- Sin variables de módulo con estado mutable: todo el estado de la partida vive en el cierre de `create<Pascal>Engine`.
- Las entidades reciben el `CanvasRenderingContext2D` y la skin en `draw(ctx, skin)` (sin skins, solo `draw(ctx)`), y el teclado en `update(dt, keyboard)`.
- El loop se mueve por `dt` en segundos con tope `MAX_DT = 0.05`. **Sin `setTimeout` ni `setInterval`**: los tiempos (caída de piezas, respawn, animaciones) son acumuladores que avanzan con `dt`, para que la pausa congele todo.
- Código en inglés, comentarios en español latinoamericano, archivos en kebab-case.

## Lo que dibuja el canvas

- **No dibuja** PUNTUACIÓN, VIDAS, NIVEL, GAME OVER ni PAUSA: eso lo muestran `PlayerHud`, `GameOverModal` y el overlay de `CrtScreen`.
- **Sí dibuja** los indicadores propios del juego que no tienen lugar en el HUD (en Asteroids, «3x 4.2s» del power-up). Con fuente `monospace`, porque las fuentes de `next/font` tienen nombres de familia generados.
- Colores en `SKINS` de `skins.ts` (una entrada por `SkinId`), nunca sueltos en las entidades. La skin Neón espeja los tokens de `app/globals.css`, con el token de origen comentado (`// --neon-cyan`); Retro sale de `RETRO_PHOSPHOR` o `RETRO_8BIT`. Un juego sin skins todavía usa una constante `COLORS` en `constants.ts`, que se reemplaza por `SKINS` cuando se le agregan. El canvas no puede usar clases de Tailwind.
- El glow se hace con `shadowBlur` y `shadowColor`. Evítalo en objetos muy numerosos (partículas) por rendimiento.

## Resolución: siempre 4:3

`GameCanvas` renderiza `<canvas width={width} height={height} className="absolute inset-0 h-full w-full">` dentro de la pantalla del CRT, que es `aspect-4/3`. **Una resolución que no sea 4:3 se ve deformada.**

- Usa 800×600 salvo que haya una razón para otra resolución 4:3.
- Si el tablero de la referencia tiene otra proporción (Tetris: 300×600, 1:2), se dibuja centrado dentro del canvas de 800×600, y el espacio que sobra puede alojar paneles propios del juego (siguiente pieza, líneas).
- La física y las constantes se expresan en píxeles de la resolución interna. El escalado es solo CSS.
- Si el juego usa el mouse, convierte las coordenadas con `canvas.getBoundingClientRect()` y el factor `canvas.width / rect.width`, porque el canvas está escalado.

## Puntuación

- Entera en todo momento: usa `Math.floor` si hay multiplicadores.
- Con tope `SCORE_MAX = 9_999_999` en `constants.ts`: la tabla `scores` tiene `check (score between 0 and 9999999)`, y un valor mayor hace fallar el guardado con «NO SE PUDO GUARDAR». Si el juego puede superarlo en la práctica, el motor deja de sumar al llegar al tope.
- `onScore` se emite cada vez que cambia la puntuación. `onGameOver(score)` recibe la misma puntuación que muestra el HUD.

## HUD: vidas y nivel

`PlayerHud` siempre muestra VIDAS y NIVEL:

- VIDAS dibuja `■` por cada vida y `□` hasta completar 3 (`"□".repeat(max(0, 3 - lives))`). Con más de 3 vidas muestra solo `■`.
- NIVEL muestra `pad2(level)`: `01`, `02`…

Cuando el juego no encaja, el spec decide entre estas opciones. Ofrécelas en ese orden:

1. **Ampliar el contrato con un campo opcional** (recomendado cuando el dato no existe en el juego), por ejemplo:

   ```ts
   export interface GameDefinition {
     // …
     hud?: { lives?: boolean; level?: boolean }; // por defecto true; false oculta la celda
   }
   ```

   `PlayerView` pasa esos valores a `PlayerHud`, que oculta la celda. Asteroids no cambia porque el campo es opcional.

2. **Reusar el dato con otro significado** (por ejemplo, NIVEL de Tetris es el nivel que sube cada 10 líneas). Es válido si el significado es el mismo que en el juego original.
3. **Emitir un valor fijo** (por ejemplo, `onLives(1)` siempre). Es lo más barato, pero muestra un dato falso. Solo si el usuario lo prefiere.

Para datos extra (líneas, siguiente pieza, temporizador) las opciones son: dibujarlos en el canvas (recomendado, sin tocar el contrato) o ampliar el contrato con un callback opcional como `onStats?(stats: Record<string, number>)` y una celda extra en `PlayerHud`. La segunda toca componentes compartidos: pregúntalo.

## Política para ampliar el contrato

- Solo se agregan campos o callbacks **opcionales**. Los motores existentes deben compilar y comportarse igual sin tocarlos.
- Cada ampliación va en «Decisiones» del spec, con la alternativa descartada.
- El spec lista cada archivo compartido que cambia (`engine.ts`, `GameCanvas.tsx`, `PlayerView.tsx`, `PlayerHud.tsx`, `StartScreen.tsx`) y agrega un criterio de «Sin regresiones» sobre ASTEROIDS.
- Si `StartScreen` debe cambiar (por ejemplo, un juego que se juega con mouse no debería mostrar «ESTE JUEGO NECESITA TECLADO» por la misma razón), también es una ampliación opcional de `GameDefinition`.
