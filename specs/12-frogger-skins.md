# SPEC 12 — Skins de FROGGER: clásico, neón y retro

> **Estado:** Aprobado
> **Depende de:** SPEC 05, SPEC 07, SPEC 10, SPEC 11
> **Fecha:** 2026-10-12
> **Objetivo:** Que FROGGER tenga las skins Clásico (por defecto), Neón y Retro, elegibles desde la pantalla de inicio del Reproductor y recordadas por juego, legibles en modo oscuro y responsive.

## Por qué existe este spec

FROGGER (SPEC 11) es un motor vectorial: todo se dibuja con primitivas de canvas y el color sale de una sola constante, `COLORS` en `lib/arcade/frogger/constants.ts`. Esa paleta imita el Frogger arcade (carretera negra, río azul oscuro, franjas moradas, seto verde, rana verde, coches de colores) y **no** usa los tokens neón de `app/globals.css`. Hoy el juego tiene un único look y no declara `skins`, así que el Reproductor no muestra el selector.

Este spec le da tres looks:

- **Clásico** (por defecto): la paleta del Frogger arcade que ya usa el motor, sin glow y con las franjas oscurecidas. Es una versión oscura del original: en el arcade las franjas moradas y el seto verde eran superficies brillantes, y el modo oscuro obliga a que ningún relleno del tablero supere la luminancia de `--surface-3`. El morado y el verde originales pasan a bordes y cuadros de textura.
- **Neón**: diseño vectorial nuevo con los tokens de la plataforma (rana `--neon-green`, coches cian, rosa, amarillo y bronce, tortugas moradas, fondo `--deep`) y glow. No es el `COLORS` actual: ese no es un look neón, es el del arcade, y pasa a Clásico.
- **Retro**: pixel art con la paleta `RETRO_8BIT`. El tablero se dibuja en un búfer de 160×120 (cada celda de 40 px son 8×8 píxeles lógicos) y se amplía 5× sin suavizado. Como la paleta solo trae un color oscuro, las zonas del tablero (carretera, río, mediana, seto) se diferencian por patrón y no por relleno, y las scanlines van en CSS.

**Este spec no trae la base común**: el selector, `SkinId`, `GameOptions`, `lib/arcade/shared/skins.ts`, `STORAGE_KEYS.skins`, la prop `skin` de `GameCanvas` y `CrtScreen` y la utilidad `bg-scanlines-retro` ya están implementados por el SPEC 10. Solo se agregan las skins propias de FROGGER. Se implementa sobre el motor del SPEC 11 (rama `spec-11-frogger-game`, spec en estado Aprobado): ese código debe estar en la rama de trabajo antes de empezar.

Un efecto visible que conviene tener presente: el look por defecto de FROGGER cambia respecto de hoy (las franjas moradas y el seto pasan de rellenos claros a oscuros con borde, y las ruedas de los vehículos se aclaran para verse sobre la carretera negra). Quien quiera un look con los tokens de la plataforma lo elige con NEÓN.

## Alcance

**Incluye:**

- **Skins de FROGGER:** `lib/arcade/frogger/skins.ts` con `FroggerSkin` y `SKINS: Record<SkinId, FroggerSkin>`. El `COLORS` de `constants.ts` se elimina; el color de los vehículos pasa de un hex en `LANES` a un rol (`colorRole`) que se resuelve con la skin.
- **Render vectorial** (Clásico y Neón): `render.ts` recibe la skin, agrega el glow de Neón y el borde de las franjas seguras, y sube a 2 px los trazos que estaban en 1 px.
- **Render de Retro:** `sprites.ts` (sprites de 8×8 píxeles lógicos como grillas de caracteres) y `render-pixel.ts` (dibujo del tablero en el búfer de baja resolución).
- **Motor:** `game.ts` lee la skin al crearse, crea el búfer en Retro y lo amplía sin suavizado. `index.ts` declara `skins: SKIN_IDS`.
- **Elección recordada por juego**, con valor inválido → Clásico: ya funciona (SPEC 10); este spec solo declara `skins`.
- **Documentación:** `CLAUDE.md` y `references/game-skins.md`.

**Fuera de alcance (para futuros specs):**

- Controles táctiles de FROGGER (`mobile-porter`). Con puntero táctil `StartScreen` seguirá mostrando «ESTE JUEGO NECESITA TECLADO» junto a la fila SKIN.
- Skins adicionales (más de tres) o desbloqueables.
- Cambiar la skin durante la partida: se elige solo en la pantalla de inicio.
- Skins del sitio (HUD, botones, Biblioteca, Detalle, Hall of Fame): el resto de la plataforma sigue en neón.
- Sonido por skin.
- Sprites o imágenes externas: FROGGER sigue sin assets.
- Cambios de jugabilidad, hitboxes, puntuación o ranking.

## Rutas y archivos

```
lib/arcade/frogger/
  skins.ts                  (nuevo)   FroggerSkin, VehicleColorRole y SKINS
  sprites.ts                (nuevo)   sprites de 8×8 y teselas de Retro, rotación y espejo
  render-pixel.ts           (nuevo)   drawGamePixels: el tablero de Retro en el búfer
  render.ts                 (cambia)  drawGame(ctx, state, skin), glow, borde de franjas seguras, trazos de 2 px
  constants.ts              (cambia)  sin COLORS; LaneConfig.color → colorRole
  lanes.ts                  (cambia)  Lane.color → Lane.colorRole
  game.ts                   (cambia)  lee la skin, crea el búfer en Retro, elige el render
  index.ts                  (cambia)  + skins: SKIN_IDS
CLAUDE.md                   (cambia)  el párrafo de skins: FROGGER ya las tiene
references/game-skins.md    (cambia)  FROGGER pasa a [x]
```

Sin cambios: `lib/arcade/engine.ts`, `lib/arcade/registry.ts`, `lib/arcade/shared/` (incluido `skins.ts`), `lib/arcade/asteroids/`, `lib/arcade/arkanoid/`, `lib/arcade/tetris/`, `lib/arcade/snake/`, `lib/storage.ts`, `components/` (el selector, `GameCanvas` y `CrtScreen` ya existen), `app/` (incluido `globals.css`), `public/` (FROGGER no usa assets), `lib/leaderboard*.ts`, el catálogo y el ranking de Supabase (no hay migraciones), `references/implemented-games.md`, el resto de `references/` y los demás specs.

Convenciones:

- Las de `lib/arcade/` del SPEC 05 y SPEC 11: sin React ni `"use client"`, el DOM (`document.createElement("canvas")`) solo dentro de `create()`, y sin estado mutable de módulo (las constantes de `sprites.ts` son de solo lectura).
- `skins.ts` y `sprites.ts` no importan nada de `components/` ni tocan el DOM.
- Código en inglés, comentarios en español latinoamericano, módulos sin JSX en kebab-case.

## Modelo de datos

La base común (contrato, `shared/skins.ts`, almacenamiento y componentes) ya existe; el código manda sobre este spec si difiere. Lo que usa FROGGER de ella:

- `SkinId`, `GameOptions` y `GameDefinition.skins` de `lib/arcade/engine.ts`.
- `SKIN_IDS`, `DEFAULT_SKIN`, `RETRO_8BIT` de `lib/arcade/shared/skins.ts`.

### Inventario visual de FROGGER

Todo lo que hoy define cómo se ve el juego, y el campo de `FroggerSkin` que lo reemplaza:

| Dónde                                                 | Qué                                                                      | Campo de la skin                                    |
| ----------------------------------------------------- | ------------------------------------------------------------------------ | --------------------------------------------------- |
| `render.ts` · `drawBackground`                        | relleno general y carretera (`COLORS.road`)                              | `road`                                              |
| `render.ts` · `drawBackground`                        | río y interior de las bocas (`COLORS.river`)                             | `river`                                             |
| `render.ts` · `drawBackground`                        | mediana y fila de inicio (`COLORS.safe`)                                 | `safe`                                              |
| (nuevo)                                               | línea de 2 px en el borde de las franjas seguras                         | `safeEdge`                                          |
| `render.ts` · `drawBackground`                        | relleno del seto (`COLORS.hedge`)                                        | `hedge`                                             |
| `render.ts` · `drawBackground`                        | cuadros del seto y borde de las bocas (`COLORS.hedgeDark`), 2 px         | `hedgeLine`, `lineWidth`                            |
| (nuevo, solo Retro)                                   | ondas del río y rayas entre carriles                                     | `riverMark`, `roadMark`                             |
| `render.ts` · `drawTimerBar`                          | barra de tiempo (`timerBar`, `timerWarn`, `timerDanger`)                 | `timerBar`, `timerWarn`, `timerDanger`              |
| `render.ts` · `drawFrog`                              | cuerpo, borde y patas (`frog`, `frogDark`), 2 px                         | `frog`, `frogDark`, `lineWidth`                     |
| `render.ts` · `drawFrog`                              | ojos y pupilas (`eye`, `pupil`)                                          | `eye`, `pupil`                                      |
| `render.ts` · `drawCar` / `drawTractor` / `drawTruck` | cuerpo del vehículo (`lane.color`, de `COLORS` en `LANES`)               | `carYellow`, `carPink`, `racer`, `tractor`, `truck` |
| `render.ts` · `drawTruck`                             | cabina (`COLORS.truckCab`)                                               | `truckCab`                                          |
| `render.ts` · `drawWheel`                             | ruedas (`COLORS.wheel`)                                                  | `wheel`                                             |
| `render.ts` · `drawCar` (bólido)                      | raya central del bólido (`COLORS.road`)                                  | `road`                                              |
| `render.ts` · `drawLog`                               | tronco y sus dos líneas (`log`, `logLine`), 2 px                         | `log`, `logLine`, `lineWidth`                       |
| `render.ts` · `drawTurtles`                           | caparazón y cabeza (`turtle`, `turtleHead`)                              | `turtle`, `turtleHead`                              |
| `render.ts` · `drawTurtles`                           | grupo hundiéndose y contorno del sumergido (`turtleSinking`), antes 1 px | `turtleSinking`, `lineWidth`                        |
| `render.ts` · `drawSplat`                             | marca de choque (`COLORS.splat`), 4 px                                   | `splat`                                             |
| (nuevo)                                               | intensidad del glow (`shadowBlur`)                                       | `glow`                                              |
| (nuevo)                                               | escala del píxel lógico (1 = vectorial, 5 = pixel art de Retro)          | `pixelScale`                                        |

Ningún color queda fuera de `FroggerSkin`. FROGGER no dibuja texto en el canvas (puntos, vidas y nivel los muestra el HUD), así que no hay fuentes que subir.

### `FroggerSkin`

```ts
// Rol de color de cada carril de vehículos: LANES lo guarda y el render lo resuelve con la skin.
export type VehicleColorRole =
  "carYellow" | "carPink" | "racer" | "tractor" | "truck";

export interface FroggerSkin {
  // Terreno
  road: string; // carretera, barra de tiempo y fondo general del canvas
  river: string; // río e interior de las bocas
  safe: string; // mediana y fila de inicio
  safeEdge: string; // línea de 2 px (1 píxel lógico en Retro) arriba y abajo de cada franja segura
  hedge: string; // relleno del seto de la fila de metas
  hedgeLine: string; // cuadros del seto y borde de las bocas
  riverMark: string | null; // ondas del río; null = no se dibujan (solo Retro)
  roadMark: string | null; // rayas entre carriles; null = no se dibujan (solo Retro)
  // Barra de tiempo
  timerBar: string; // más del 50 %
  timerWarn: string; // entre 25 % y 50 %
  timerDanger: string; // menos del 25 %
  // Rana
  frog: string;
  frogDark: string; // borde y patas
  eye: string;
  pupil: string;
  // Vehículos
  carYellow: string; // fila 12
  carPink: string; // fila 10
  racer: string; // fila 9
  tractor: string; // fila 11
  truck: string; // fila 8, caja
  truckCab: string; // fila 8, cabina
  wheel: string;
  // Río
  log: string;
  logLine: string; // vetas del tronco
  turtle: string; // caparazón
  turtleHead: string;
  turtleSinking: string; // grupo hundiéndose (todavía sostiene) y contorno del sumergido
  // Marca de choque
  splat: string;
  // Estilo
  lineWidth: number; // grosor de trazos (rana, bocas, vetas, tortuga sumergida), en px internos (800×600)
  glow: number; // shadowBlur en px; 0 = sin glow (solo Neón lo usa)
  pixelScale: number; // 1 = dibujo vectorial; >1 = pixel art en un búfer reducido
}
```

### `SKINS`: rol × skin

| Rol             | Clásico                                                                       | Neón                                               | Retro                               |
| --------------- | ----------------------------------------------------------------------------- | -------------------------------------------------- | ----------------------------------- |
| `road`          | `#000000` (carretera negra del arcade; `COLORS.road` del SPEC 11)             | `#05050a` (`--deep`)                               | `#0b0b17` (`RETRO_8BIT.background`) |
| `river`         | `#000047` (azul oscuro del arcade; `COLORS.river`)                            | `#05181e` (`--neon-cyan` al 8 % sobre `--deep`)    | `#0b0b17` (`RETRO_8BIT.background`) |
| `safe`          | `#1f0f36` (violeta del arcade oscurecido para el modo oscuro)                 | `#190927` (`--neon-purple` al 12 % sobre `--deep`) | `#0b0b17` (`RETRO_8BIT.background`) |
| `safeEdge`      | `#8548c0` (el `#5b2a86` del arcade aclarado hasta 3:1 contra río y carretera) | `#b026ff` (`--neon-purple`)                        | `#83769c` (`RETRO_8BIT.lavender`)   |
| `hedge`         | `#071c07` (verde del arcade oscurecido para el modo oscuro)                   | `#051e17` (`--neon-green` al 10 % sobre `--deep`)  | `#0b0b17` (`RETRO_8BIT.background`) |
| `hedgeLine`     | `#1f8f1f` (el verde del seto del arcade; `COLORS.hedge` del SPEC 11)          | `#037643` (`--neon-green` al 45 % sobre `--deep`)  | `#00e436` (`RETRO_8BIT.green`)      |
| `riverMark`     | `null`                                                                        | `null`                                             | `#29adff` (`RETRO_8BIT.blue`)       |
| `roadMark`      | `null`                                                                        | `null`                                             | `#83769c` (`RETRO_8BIT.lavender`)   |
| `timerBar`      | `#00e000` (`COLORS.timerBar`)                                                 | `#00ff88` (`--neon-green`)                         | `#00e436` (`RETRO_8BIT.green`)      |
| `timerWarn`     | `#ffd800` (`COLORS.timerWarn`)                                                | `#f5ff00` (`--neon-yellow`)                        | `#ffec27` (`RETRO_8BIT.yellow`)     |
| `timerDanger`   | `#ff2020` (`COLORS.timerDanger`)                                              | `#ff006e` (`--neon-pink`)                          | `#ff004d` (`RETRO_8BIT.red`)        |
| `frog`          | `#3ee03e` (`COLORS.frog`)                                                     | `#00ff88` (`--neon-green`)                         | `#00e436` (`RETRO_8BIT.green`)      |
| `frogDark`      | `#1a7a1a` (`COLORS.frogDark`)                                                 | `#02a75c` (`--neon-green` al 65 % sobre `--deep`)  | `#83769c` (`RETRO_8BIT.lavender`)   |
| `eye`           | `#ffffff` (`COLORS.eye`)                                                      | `#e6f7ff` (`--foreground`)                         | `#fff1e8` (`RETRO_8BIT.white`)      |
| `pupil`         | `#000000` (`COLORS.pupil`)                                                    | `#05050a` (`--deep`)                               | `#0b0b17` (`RETRO_8BIT.background`) |
| `carYellow`     | `#ffd800` (`COLORS.carYellow`)                                                | `#f5ff00` (`--neon-yellow`)                        | `#ffec27` (`RETRO_8BIT.yellow`)     |
| `carPink`       | `#ff4fd8` (`COLORS.carPink`)                                                  | `#ff006e` (`--neon-pink`)                          | `#ff77a8` (`RETRO_8BIT.pink`)       |
| `racer`         | `#ffffff` (`COLORS.racer`)                                                    | `#00f5ff` (`--neon-cyan`)                          | `#fff1e8` (`RETRO_8BIT.white`)      |
| `tractor`       | `#30c0ff` (`COLORS.tractor`)                                                  | `#ff8c42` (`--bronze`)                             | `#29adff` (`RETRO_8BIT.blue`)       |
| `truck`         | `#e0e0e0` (`COLORS.truck`)                                                    | `#b9c6d4` (`--text-soft`)                          | `#fff1e8` (`RETRO_8BIT.white`)      |
| `truckCab`      | `#ff3030` (`COLORS.truckCab`)                                                 | `#ff006e` (`--neon-pink`)                          | `#ff004d` (`RETRO_8BIT.red`)        |
| `wheel`         | `#808080` (antes `#202020`, invisible sobre la carretera negra)               | `#6d7d90` (`--subtle`)                             | `#83769c` (`RETRO_8BIT.lavender`)   |
| `log`           | `#96511f` (el `#8b4a1c` de `COLORS.log` aclarado hasta 3:1 contra el río)     | `#995428` (`--bronze` al 60 % de intensidad)       | `#83769c` (`RETRO_8BIT.lavender`)   |
| `logLine`       | `#2e1405` (el `#5a2e0e` de `COLORS.logLine` oscurecido)                       | `#ff8c42` (`--bronze`)                             | `#0b0b17` (`RETRO_8BIT.background`) |
| `turtle`        | `#c0392b` (`COLORS.turtle`)                                                   | `#b026ff` (`--neon-purple`)                        | `#ff004d` (`RETRO_8BIT.red`)        |
| `turtleHead`    | `#2ecc40` (`COLORS.turtleHead`)                                               | `#00f5ff` (`--neon-cyan`)                          | `#ffa300` (`RETRO_8BIT.orange`)     |
| `turtleSinking` | `#8c5a4a` (antes `#5a1a1a`, que no se veía sobre el río)                      | `#6d7d90` (`--subtle`)                             | `#83769c` (`RETRO_8BIT.lavender`)   |
| `splat`         | `#ff2020` (`COLORS.splat`)                                                    | `#ff006e` (`--neon-pink`)                          | `#ff004d` (`RETRO_8BIT.red`)        |
| `lineWidth`     | `2`                                                                           | `2`                                                | `5` (1 píxel lógico)                |
| `glow`          | `0`                                                                           | `8`                                                | `0`                                 |
| `pixelScale`    | `1`                                                                           | `1`                                                | `5` (búfer de 160×120)              |

```ts
import type { SkinId } from "@/lib/arcade/engine";
import { RETRO_8BIT } from "@/lib/arcade/shared/skins";

export const SKINS: Record<SkinId, FroggerSkin> = {
  classic: {
    road: "#000000", // arcade: carretera negra
    river: "#000047", // arcade: agua azul oscuro
    safe: "#1f0f36", // arcade: violeta, oscurecido
    safeEdge: "#8548c0", // arcade: #5b2a86 aclarado
    hedge: "#071c07", // arcade: verde, oscurecido
    hedgeLine: "#1f8f1f", // arcade: verde del seto
    riverMark: null,
    roadMark: null,
    timerBar: "#00e000",
    timerWarn: "#ffd800",
    timerDanger: "#ff2020",
    frog: "#3ee03e",
    frogDark: "#1a7a1a",
    eye: "#ffffff",
    pupil: "#000000",
    carYellow: "#ffd800",
    carPink: "#ff4fd8",
    racer: "#ffffff",
    tractor: "#30c0ff",
    truck: "#e0e0e0",
    truckCab: "#ff3030",
    wheel: "#808080",
    log: "#96511f",
    logLine: "#2e1405",
    turtle: "#c0392b",
    turtleHead: "#2ecc40",
    turtleSinking: "#8c5a4a",
    splat: "#ff2020",
    lineWidth: 2,
    glow: 0,
    pixelScale: 1,
  },
  neon: {
    road: "#05050a", // --deep
    river: "#05181e", // --neon-cyan al 8 % sobre --deep
    safe: "#190927", // --neon-purple al 12 % sobre --deep
    safeEdge: "#b026ff", // --neon-purple
    hedge: "#051e17", // --neon-green al 10 % sobre --deep
    hedgeLine: "#037643", // --neon-green al 45 % sobre --deep
    riverMark: null,
    roadMark: null,
    timerBar: "#00ff88", // --neon-green
    timerWarn: "#f5ff00", // --neon-yellow
    timerDanger: "#ff006e", // --neon-pink
    frog: "#00ff88", // --neon-green
    frogDark: "#02a75c", // --neon-green al 65 % sobre --deep
    eye: "#e6f7ff", // --foreground
    pupil: "#05050a", // --deep
    carYellow: "#f5ff00", // --neon-yellow
    carPink: "#ff006e", // --neon-pink
    racer: "#00f5ff", // --neon-cyan
    tractor: "#ff8c42", // --bronze
    truck: "#b9c6d4", // --text-soft
    truckCab: "#ff006e", // --neon-pink
    wheel: "#6d7d90", // --subtle
    log: "#995428", // --bronze al 60 % de intensidad
    logLine: "#ff8c42", // --bronze
    turtle: "#b026ff", // --neon-purple
    turtleHead: "#00f5ff", // --neon-cyan
    turtleSinking: "#6d7d90", // --subtle
    splat: "#ff006e", // --neon-pink
    lineWidth: 2,
    glow: 8,
    pixelScale: 1,
  },
  retro: {
    road: RETRO_8BIT.background,
    river: RETRO_8BIT.background,
    safe: RETRO_8BIT.background,
    safeEdge: RETRO_8BIT.lavender,
    hedge: RETRO_8BIT.background,
    hedgeLine: RETRO_8BIT.green,
    riverMark: RETRO_8BIT.blue,
    roadMark: RETRO_8BIT.lavender,
    timerBar: RETRO_8BIT.green,
    timerWarn: RETRO_8BIT.yellow,
    timerDanger: RETRO_8BIT.red,
    frog: RETRO_8BIT.green,
    frogDark: RETRO_8BIT.lavender,
    eye: RETRO_8BIT.white,
    pupil: RETRO_8BIT.background,
    carYellow: RETRO_8BIT.yellow,
    carPink: RETRO_8BIT.pink,
    racer: RETRO_8BIT.white,
    tractor: RETRO_8BIT.blue,
    truck: RETRO_8BIT.white,
    truckCab: RETRO_8BIT.red,
    wheel: RETRO_8BIT.lavender,
    log: RETRO_8BIT.lavender,
    logLine: RETRO_8BIT.background,
    turtle: RETRO_8BIT.red,
    turtleHead: RETRO_8BIT.orange,
    turtleSinking: RETRO_8BIT.lavender,
    splat: RETRO_8BIT.red,
    lineWidth: 5, // en píxeles, cada trazo mide 1 píxel lógico (= pixelScale)
    glow: 0,
    pixelScale: 5,
  },
};
```

El tipo `Record<SkinId, FroggerSkin>` hace que TypeScript exija las tres skins. Los colores de `SKINS.classic` que no cambian respecto de `COLORS` son idénticos al valor del SPEC 11. Los que cambian (`safe`, `hedge`, `wheel`, `log`, `logLine`, `turtleSinking`) y el campo nuevo `safeEdge` responden al modo oscuro y al contraste medido; `hedgeDark` pasa a llamarse `hedgeLine` porque en Clásico ya no es más oscuro que el seto.

### Contraste

Calculado con el comando de contraste del proyecto (luminancia relativa WCAG). Los rellenos del tablero de las tres skins cumplen la luminancia máxima de 0,0110. FROGGER no dibuja texto en el canvas, así que el mínimo de 4,5:1 no aplica. Las entidades se miden contra el relleno sobre el que se dibujan: los vehículos y la barra de tiempo, contra la carretera; los troncos y las tortugas, contra el río; la rana, contra cada relleno y contra su soporte (criterio propio de este spec, 3:1 también entre la rana y el tronco o la tortuga que la lleva).

**Clásico**

| Fondo (luminancia)                                 | Par                                                    | Ratio   | Mínimo | Cumple |
| -------------------------------------------------- | ------------------------------------------------------ | ------- | ------ | ------ |
| Carretera `#000000` (0,0000, máximo 0,0110)        | Coche amarillo `#ffd800`                               | 15,07:1 | 3:1    | Sí     |
|                                                    | Coche rosa `#ff4fd8`                                   | 7,36:1  | 3:1    | Sí     |
|                                                    | Bólido `#ffffff`                                       | 21,00:1 | 3:1    | Sí     |
|                                                    | Tractor `#30c0ff`                                      | 10,11:1 | 3:1    | Sí     |
|                                                    | Caja del camión `#e0e0e0`                              | 15,91:1 | 3:1    | Sí     |
|                                                    | Cabina `#ff3030`                                       | 5,72:1  | 3:1    | Sí     |
|                                                    | Ruedas `#808080`                                       | 5,32:1  | 3:1    | Sí     |
|                                                    | Rana `#3ee03e`                                         | 11,94:1 | 3:1    | Sí     |
|                                                    | Barra de tiempo `#00e000`                              | 11,66:1 | 3:1    | Sí     |
|                                                    | Barra en peligro y marca de choque `#ff2020`           | 5,48:1  | 3:1    | Sí     |
|                                                    | Borde de franjas seguras `#8548c0`                     | 3,69:1  | 3:1    | Sí     |
| Río `#000047` (0,0045, máximo 0,0110)              | Tronco `#96511f`                                       | 3,20:1  | 3:1    | Sí     |
|                                                    | Caparazón `#c0392b`                                    | 3,54:1  | 3:1    | Sí     |
|                                                    | Cabeza de tortuga `#2ecc40`                            | 9,01:1  | 3:1    | Sí     |
|                                                    | Tortuga hundiéndose y contorno del sumergido `#8c5a4a` | 3,37:1  | 3:1    | Sí     |
|                                                    | Rana `#3ee03e`                                         | 10,94:1 | 3:1    | Sí     |
|                                                    | Marca de choque `#ff2020`                              | 5,02:1  | 3:1    | Sí     |
|                                                    | Borde de franjas seguras `#8548c0`                     | 3,38:1  | 3:1    | Sí     |
|                                                    | Borde de las bocas `#1f8f1f`                           | 4,59:1  | 3:1    | Sí     |
| Mediana e inicio `#1f0f36` (0,0090, máximo 0,0110) | Rana `#3ee03e`                                         | 10,12:1 | 3:1    | Sí     |
|                                                    | Marca de choque `#ff2020`                              | 4,64:1  | 3:1    | Sí     |
| Seto `#071c07` (0,0089, máximo 0,0110)             | Cuadros y borde de bocas `#1f8f1f`                     | 4,25:1  | 3:1    | Sí     |
|                                                    | Rana ocupando una boca `#3ee03e`                       | 10,13:1 | 3:1    | Sí     |
|                                                    | Marca de choque `#ff2020`                              | 4,65:1  | 3:1    | Sí     |
| Soporte de la rana                                 | Rana `#3ee03e` sobre tronco `#96511f`                  | 3,42:1  | 3:1    | Sí     |
|                                                    | Rana `#3ee03e` sobre caparazón `#c0392b`               | 3,09:1  | 3:1    | Sí     |
|                                                    | Rana `#3ee03e` sobre tortuga hundiéndose `#8c5a4a`     | 3,25:1  | 3:1    | Sí     |

**Neón**

| Fondo (luminancia)                                 | Par                                                    | Ratio   | Mínimo | Cumple |
| -------------------------------------------------- | ------------------------------------------------------ | ------- | ------ | ------ |
| Carretera `#05050a` (0,0016, máximo 0,0110)        | Coche amarillo `#f5ff00`                               | 18,58:1 | 3:1    | Sí     |
|                                                    | Coche rosa y cabina `#ff006e`                          | 5,30:1  | 3:1    | Sí     |
|                                                    | Bólido `#00f5ff`                                       | 15,02:1 | 3:1    | Sí     |
|                                                    | Tractor `#ff8c42`                                      | 8,80:1  | 3:1    | Sí     |
|                                                    | Caja del camión `#b9c6d4`                              | 11,71:1 | 3:1    | Sí     |
|                                                    | Ruedas `#6d7d90`                                       | 4,83:1  | 3:1    | Sí     |
|                                                    | Rana y barra de tiempo `#00ff88`                       | 15,17:1 | 3:1    | Sí     |
|                                                    | Barra en advertencia `#f5ff00`                         | 18,58:1 | 3:1    | Sí     |
|                                                    | Barra en peligro y marca de choque `#ff006e`           | 5,30:1  | 3:1    | Sí     |
|                                                    | Borde de franjas seguras `#b026ff`                     | 4,42:1  | 3:1    | Sí     |
| Río `#05181e` (0,0078, máximo 0,0110)              | Tronco `#995428`                                       | 3,16:1  | 3:1    | Sí     |
|                                                    | Caparazón `#b026ff`                                    | 3,95:1  | 3:1    | Sí     |
|                                                    | Cabeza de tortuga `#00f5ff`                            | 13,41:1 | 3:1    | Sí     |
|                                                    | Tortuga hundiéndose y contorno del sumergido `#6d7d90` | 4,31:1  | 3:1    | Sí     |
|                                                    | Rana `#00ff88`                                         | 13,55:1 | 3:1    | Sí     |
|                                                    | Marca de choque `#ff006e`                              | 4,74:1  | 3:1    | Sí     |
|                                                    | Borde de las bocas `#037643`                           | 3,18:1  | 3:1    | Sí     |
| Mediana e inicio `#190927` (0,0055, máximo 0,0110) | Rana `#00ff88`                                         | 14,11:1 | 3:1    | Sí     |
|                                                    | Marca de choque `#ff006e`                              | 4,94:1  | 3:1    | Sí     |
|                                                    | Borde de franjas seguras `#b026ff`                     | 4,12:1  | 3:1    | Sí     |
| Seto `#051e17` (0,0102, máximo 0,0110)             | Cuadros y borde de bocas `#037643`                     | 3,05:1  | 3:1    | Sí     |
|                                                    | Rana ocupando una boca `#00ff88`                       | 13,00:1 | 3:1    | Sí     |
|                                                    | Marca de choque `#ff006e`                              | 4,55:1  | 3:1    | Sí     |
| Soporte de la rana                                 | Rana `#00ff88` sobre tronco `#995428`                  | 4,29:1  | 3:1    | Sí     |
|                                                    | Rana `#00ff88` sobre caparazón `#b026ff`               | 3,43:1  | 3:1    | Sí     |
|                                                    | Rana `#00ff88` sobre tortuga hundiéndose `#6d7d90`     | 3,14:1  | 3:1    | Sí     |

**Retro** (todos los rellenos del tablero son `#0b0b17`, luminancia 0,0037, máximo 0,0110)

| Par                                                                       | Ratio   | Mínimo         | Cumple                                                                                                          |
| ------------------------------------------------------------------------- | ------- | -------------- | --------------------------------------------------------------------------------------------------------------- |
| Rana, barra de tiempo y bordes del seto `#00e436` / fondo                 | 11,31:1 | 3:1            | Sí                                                                                                              |
| Caparazón, cabina, barra en peligro y marca de choque `#ff004d` / fondo   | 4,99:1  | 3:1            | Sí                                                                                                              |
| Cabeza de tortuga `#ffa300` / fondo                                       | 9,76:1  | 3:1            | Sí                                                                                                              |
| Tronco, tortuga hundiéndose, ruedas y bordes de franjas `#83769c` / fondo | 4,69:1  | 3:1            | Sí                                                                                                              |
| Coche amarillo y barra en advertencia `#ffec27` / fondo                   | 16,08:1 | 3:1            | Sí                                                                                                              |
| Coche rosa `#ff77a8` / fondo                                              | 7,87:1  | 3:1            | Sí                                                                                                              |
| Bólido y caja del camión `#fff1e8` / fondo                                | 17,68:1 | 3:1            | Sí                                                                                                              |
| Tractor y ondas del río `#29adff` / fondo                                 | 7,93:1  | 3:1            | Sí                                                                                                              |
| Distinción: rana `#00e436` / tronco `#83769c`                             | 2,41:1  | 1,5:1          | Sí                                                                                                              |
| Distinción: rana `#00e436` / caparazón `#ff004d`                          | 2,27:1  | 1,5:1          | Sí                                                                                                              |
| Distinción: rana `#00e436` / tortuga hundiéndose `#83769c`                | 2,41:1  | 1,5:1          | Sí                                                                                                              |
| Distinción: rana `#00e436` / patas `#83769c`                              | 2,41:1  | 1,5:1          | Sí                                                                                                              |
| Distinción: rana `#00e436` / ojos `#fff1e8`                               | 1,56:1  | 1,5:1          | Sí                                                                                                              |
| Distinción: caparazón `#ff004d` / cabeza `#ffa300`                        | 1,96:1  | 1,5:1          | Sí                                                                                                              |
| Distinción: caja del camión `#fff1e8` / cabina `#ff004d`                  | 3,55:1  | 1,5:1          | Sí                                                                                                              |
| Distinción: tronco `#83769c` / tortuga hundiéndose `#83769c`              | 1,00:1  | 1,5:1 o patrón | Sí, por patrón: el tronco es un rectángulo con vetas y la tortuga hundiéndose es un caparazón tramado en damero |

Las zonas del tablero de Retro se distinguen por patrón, no por relleno: la paleta solo trae un color oscuro. La carretera lleva rayas de `lavender` entre carriles, el río ondas de `blue`, el seto cuadros de `green` y las franjas seguras un borde de `lavender` arriba y abajo. Cada patrón se mide contra el fondo en las filas anteriores.

### Retro: sprites y teselas

`lib/arcade/frogger/sprites.ts` define cada sprite como un arreglo de cadenas de 8 caracteres de ancho por 8 filas (el camión, de 16). Un `.` es transparente y cada letra elige un rol de la skin:

| Letra | Rol                            | Letra | Rol             |
| ----- | ------------------------------ | ----- | --------------- |
| `f`   | `frog`                         | `l`   | `log`           |
| `d`   | `frogDark`                     | `g`   | `logLine`       |
| `e`   | `eye`                          | `r`   | `turtle`        |
| `c`   | color del carril (`colorRole`) | `h`   | `turtleHead`    |
| `a`   | `truckCab`                     | `s`   | `turtleSinking` |
| `w`   | `wheel`                        | `n`   | `hedgeLine`     |
| `k`   | `road` (parabrisas y huecos)   | `b`   | `riverMark`     |
| `x`   | `splat`                        | `m`   | `roadMark`      |

```ts
// Rana mirando hacia arriba; las otras direcciones se obtienen rotando.
export const FROG_IDLE = [
  ".e....e.",
  ".ffffff.",
  "dffffffd",
  ".ffffff.",
  ".ffffff.",
  "dffffffd",
  ".ff..ff.",
  "........",
] as const;
export const FROG_HOP = [
  ".e....e.",
  ".ffffff.",
  ".ffffff.",
  ".ffffff.",
  ".ffffff.",
  ".ffffff.",
  "dff..ffd",
  "d......d",
] as const;

// Vehículos mirando a la derecha; a la izquierda se espejan.
export const CAR = [
  "........",
  ".ww..ww.",
  "cccccccc",
  "cccckkcc",
  "cccckkcc",
  "cccccccc",
  ".ww..ww.",
  "........",
] as const;
export const RACER = [
  "........",
  "........",
  ".ww..ww.",
  "cccckkcc",
  "cccckkcc",
  ".ww..ww.",
  "........",
  "........",
] as const;
export const TRACTOR = [
  "........",
  "www.....",
  "wwwcccc.",
  ".ccccccc",
  ".ccccccc",
  "wwwcccc.",
  "www.....",
  "........",
] as const;
export const TRUCK = [
  "................",
  ".ww....ww....ww.",
  "ccccccccccc.aaaa",
  "ccccccccccc.aakk",
  "ccccccccccc.aakk",
  "ccccccccccc.aaaa",
  ".ww....ww....ww.",
  "................",
] as const;

// Tortuga mirando a la derecha; una celda por tortuga.
export const TURTLE = [
  "........",
  "..rrrr..",
  ".rrrrrr.",
  "rrkrrkrh",
  "rrkrrkrh",
  ".rrrrrr.",
  "..rrrr..",
  "........",
] as const;

// Marca de choque de 5×5, centrada en la celda con un desplazamiento de 1.
export const SPLAT = ["x...x", ".x.x.", "..x..", ".x.x.", "x...x"] as const;

// Teselas de 8×8 que se repiten por fila.
export const RIVER_TILE = [
  "........",
  ".bb.....",
  "...bb...",
  "........",
  "........",
  ".....bb.",
  "..bb....",
  "........",
] as const;
export const HEDGE_TILE = [
  "........",
  ".nn.....",
  ".nn.....",
  "........",
  "........",
  ".....nn.",
  ".....nn.",
  "........",
] as const;
```

Reglas de dibujo de Retro (todas en coordenadas lógicas enteras; una coordenada del mundo `v` en px pasa a lógica con `Math.floor(v / 5)`):

- **Rotación de la rana:** mirando a la derecha, abajo o izquierda, se rota el sprite 1, 2 o 3 cuartos de vuelta en sentido horario con `rotated[x][7 - y] = sprite[y][x]`. Con `hopping` se usa `FROG_HOP`.
- **Espejo:** un vehículo o una tortuga con `lane.velocity < 0` se dibuja con cada fila invertida.
- **Tronco:** de `length × 8` píxeles de ancho. Ocupa las filas 1 a 6 de la celda, sin los cuatro píxeles de las esquinas. Las vetas (`g`) van en la fila 3 donde `x % 7` vale 2, 3 o 4 y en la fila 5 donde vale 5, 6 o 0, sin tocar los dos primeros ni los dos últimos píxeles.
- **Tortuga hundiéndose** (`turtleState === "sinking"`): el sprite se dibuja solo en los píxeles donde `(x + y)` es par, todo en `turtleSinking`. **Sumergida:** solo los píxeles del caparazón que tienen un vecino transparente (o el borde del sprite), en `turtleSinking`.
- **Terreno:** la carretera, el río, la mediana y el seto se rellenan con `skin.road`, `skin.river`, `skin.safe` y `skin.hedge` (los cuatro iguales en Retro). Las ondas (`RIVER_TILE`) cubren las filas del río, el seto lleva `HEDGE_TILE`, las franjas seguras llevan una línea de `safeEdge` en la primera y la última fila lógica de la celda, y la carretera lleva rayas de `roadMark` de 2 píxeles encendidas y 2 apagadas en la última fila lógica de las filas 8 a 11 (la fila 7 de los sprites está siempre vacía, así que no se pisa con ruedas).
- **Bocas:** rectángulo de 14×6 píxeles lógicos con 1 píxel de borde en `hedgeLine`, relleno `skin.river` y dos píxeles `riverMark` dentro. La rana de una boca ocupada es `FROG_IDLE` centrada.
- **Barra de tiempo:** 2 píxeles lógicos de alto en la fila 14, con ancho `floor(fraction × 160)` y el color de `timerBar`, `timerWarn` o `timerDanger` según el mismo umbral.
- **Marca de choque:** `SPLAT` en `splat`, con el mismo parpadeo del vectorial.

### Cambios del motor

**`constants.ts`:** se elimina `COLORS`. `LaneConfig.color?: string` pasa a `colorRole?: VehicleColorRole` (import de tipo desde `skins.ts`, que no importa nada de `constants.ts`): `truck` en la fila 8, `racer` en la 9, `carPink` en la 10, `tractor` en la 11 y `carYellow` en la 12. Todo lo demás (grilla, velocidades, tiempos, puntos) no cambia.

**`lanes.ts`:** `Lane.color: string` pasa a `Lane.colorRole: VehicleColorRole | null` (`null` en troncos y tortugas), asignado en `buildLanes` desde `config.colorRole ?? null`.

**`render.ts`:** `drawGame(ctx, state, skin)` y todas las funciones auxiliares reciben `skin: FroggerSkin` y cambian `COLORS.x` por `skin.x`; el color de un vehículo es `skin[lane.colorRole]`.

- Se agregan `applyGlow(ctx, skin, color)` (no hace nada si `skin.glow === 0`; si no, `shadowColor = color` y `shadowBlur = skin.glow`) y `clearGlow(ctx)` (`shadowBlur = 0`). El glow se aplica a la rana, los vehículos, los troncos, las tortugas, la barra de tiempo y la marca de choque; el terreno y las ruedas no lo llevan. Cada función dibuja primero lo que no brilla (ruedas), luego aplica el glow y dibuja el cuerpo, y limpia el glow al terminar. El glow del tronco usa `skin.logLine`.
- `drawBackground` dibuja las franjas seguras con `skin.safe` y, encima, dos `fillRect` de 2 px (`skin.lineWidth`) en el borde superior e inferior de las filas `MEDIAN_ROW` y `START_ROW` con `skin.safeEdge`. Los cuadros del seto y el borde de las bocas usan `skin.hedgeLine`, y el borde de las bocas usa `skin.lineWidth`.
- `drawTurtles` traza el contorno del grupo sumergido con `skin.lineWidth` (antes 1 px). El resto de los trazos ya eran de 2 px o más (marca de choque de 4 px).
- `drawGame` sigue dibujando solo para `pixelScale === 1`. El dibujo de Retro es otra función, `drawGamePixels`.

**`render-pixel.ts`:** `drawGamePixels(ctx, state, skin)` dibuja sobre el contexto del búfer de 160×120 con las reglas de «Retro: sprites y teselas». Cada píxel lógico es un `fillRect(x, y, 1, 1)` o una fila de ellos, sin antialiasing, así que solo aparecen colores de `RETRO_8BIT`. Recibe el mismo `RenderState` que `drawGame` y no guarda estado.

**`game.ts`:**

- `createFroggerEngine(canvas, callbacks, options?: GameOptions)` lee `const skin = SKINS[options?.skin ?? DEFAULT_SKIN]` al crearse y quita el `void options`.
- Si `skin.pixelScale > 1`, crea (dentro de `create`) un canvas auxiliar de `WIDTH / pixelScale × HEIGHT / pixelScale` (160×120) y su contexto, `bufferCtx`. El `canvas` visible conserva 800×600.
- `draw()`: en Retro llama `drawGamePixels(bufferCtx, view, skin)`, hace `ctx.imageSmoothingEnabled = false` y `ctx.drawImage(buffer, 0, 0, WIDTH, HEIGHT)`. En Clásico y Neón llama `drawGame(ctx, view, skin)`.
- La jugabilidad (`update`, hitboxes, saltos, muertes, bocas, niveles, puntos) no cambia en nada.

**`index.ts`:** `skins: SKIN_IDS,` en `froggerDefinition` (import de `@/lib/arcade/shared/skins`). `create: createFroggerEngine` no cambia.

**Sprites:** FROGGER no usa imágenes ni `drawImage` de assets (el `drawImage` del búfer copia un canvas propio). No se toca ningún archivo de `public/` ni `references/`. No se usa `ctx.filter`.

## Plan de implementación

1. **Skins de FROGGER.** Crear `lib/arcade/frogger/skins.ts` con `VehicleColorRole`, `FroggerSkin` y `SKINS`. Verificación: `npx tsc --noEmit` pasa y TypeScript rechaza una skin faltante (probar quitando `retro` un momento y restaurándola).
2. **Carriles por rol.** En `constants.ts`, cambiar `LaneConfig.color` por `colorRole` y los cinco `color: COLORS.x` de `LANES` por su rol; en `lanes.ts`, `Lane.colorRole`. `COLORS` sigue exportado en este paso. Verificación: `npx tsc --noEmit` falla solo en `render.ts` (`lane.color` ya no existe); se corrige en el paso siguiente.
3. **Render vectorial, motor y registro de skins.** Pasar `render.ts` a `skin` (glow, borde de franjas seguras, contorno de 2 px), borrar `COLORS` de `constants.ts`, leer la skin en `game.ts` y pasársela a `drawGame`, y agregar `skins: SKIN_IDS` en `index.ts`. Verificación: `npx tsc --noEmit` y `npm run lint` pasan, `grep -rn "COLORS" lib/arcade/frogger/` no devuelve nada, y en `/games/frogger/play` aparece la fila SKIN con CLÁSICO elegido; Clásico y Neón se ven como describe el spec. (Retro todavía dibuja en vectorial y no se revisa.)
4. **Sprites y render de Retro.** Crear `sprites.ts` y `render-pixel.ts`. Verificación: `npx tsc --noEmit` y `npm run lint` pasan, y `grep -n "#" lib/arcade/frogger/render-pixel.ts lib/arcade/frogger/sprites.ts` no muestra ningún color suelto (solo los de la skin).
5. **Búfer de Retro.** En `game.ts`, crear el búfer cuando `pixelScale > 1` y ampliarlo sin suavizado. Verificación: `npx tsc --noEmit` y `npm run lint` pasan; en RETRO el canvas visible sigue en 800×600, el `<canvas>` lleva `image-rendering: pixelated` y el CRT las scanlines.
6. **Verificación visual de las tres skins.** Con `npm run dev`, en modo oscuro (`browser_emulate_media` con `colorScheme: "dark"`), para cada skin: guardar `e1230_skins` y jugar a 768 y 1280 px. Se tienen que ver, en cada skin: el tablero entero al iniciar, un salto (rana con patas abiertas), la rana sobre un tronco, un grupo de tortugas hundiéndose y sumergido (esperar el ciclo de 3 s), una boca ocupada, la barra de tiempo en verde y en rojo y la marca de choque. Capturas en `.playwright-screenshots/skins/frogger/<skin>-<ancho>.png`. Verificación: se distinguen carretera, río, mediana, seto, bocas, vehículos, troncos y tortugas; Retro se ve en píxeles gruesos, sin colores fuera de la paleta; Clásico y Neón no tienen bordes pixelados. Medir la pantalla de inicio a 320, 375, 768 y 1280 px con `browser_evaluate` (`scrollHeight <= clientHeight`, `scrollWidth <= clientWidth` del primer hijo de la pantalla CRT y `document.documentElement.scrollWidth <= innerWidth`).
7. **Documentación.** Marcar FROGGER como `[x]` en `references/game-skins.md`; en `CLAUDE.md`, ajustar el párrafo de skins («Asteroids y Frogger ya las tienen, y Tetris, Arkanoid y Snake siguen sin skins»). Verificación: `git diff main -- references/` solo muestra `references/game-skins.md` y `git diff main -- public/` está vacío.

## Criterios de aceptación

**Generales**

- [ ] `npx tsc --noEmit` y `npm run lint` terminan sin errores (y `npm run build` compila).
- [ ] Existen `lib/arcade/frogger/skins.ts`, `sprites.ts` y `render-pixel.ts`, y `lib/arcade/frogger/constants.ts` ya no exporta `COLORS` (`grep -rn "COLORS" lib/arcade/frogger/` no devuelve nada).
- [ ] `git diff main -- references/` solo muestra cambios en `references/game-skins.md`, y `git diff main -- public/` está vacío.
- [ ] Ningún archivo de `lib/arcade/` importa `react` ni declara `"use client"`, y `skins.ts`, `sprites.ts`, `render.ts` y `render-pixel.ts` no tocan el DOM a nivel de módulo.
- [ ] `grep -rn "ctx.filter" lib/ components/` no devuelve nada.
- [ ] Al jugar una partida por skin, la consola del navegador no muestra errores ni advertencias de hidratación.
- [ ] `Lane.colorRole` (`lanes.ts`) y `LaneConfig.colorRole` (`constants.ts`) reemplazan a `color`, y cada carril de vehículos se dibuja con el color de su rol en las tres skins.
- [ ] `CLAUDE.md` dice que FROGGER ya tiene skins (junto a ASTEROIDS) y que TETRIS, ARKANOID y SNAKE siguen sin ellas.
- [ ] `git diff main -- lib/arcade/engine.ts lib/arcade/shared lib/arcade/asteroids lib/arcade/tetris lib/arcade/arkanoid lib/arcade/snake lib/arcade/registry.ts components app lib/storage.ts` está vacío.

**Selector y recuerdo (base común del SPEC 10, ahora también para FROGGER)**

- [ ] `/games/frogger/play` muestra en `StartScreen` la fila «SKIN» con tres botones, CLÁSICO, NEÓN y RETRO, dentro de un `role="radiogroup"`, cada uno con `role="radio"` y `aria-checked`. Solo la skin elegida es `variant="solid"` y tiene `aria-checked="true"`.
- [ ] Sin nada guardado, CLÁSICO aparece elegido y la partida usa Clásico.
- [ ] Elegir NEÓN guarda `"frogger":"neon"` en `localStorage["e1230_skins"]` sin borrar las claves de otros juegos (por ejemplo, `"asteroids"`). Recargar y entrar de nuevo muestra NEÓN elegido y la partida usa Neón.
- [ ] Con `localStorage["e1230_skins"]` en `{"frogger":"sepia"}`, o en `null`, `[]` o un JSON roto, la pantalla de inicio muestra CLÁSICO elegido y no hay errores.
- [ ] Con `localStorage` bloqueado (el `getItem` o el `setItem` lanzan), elegir una skin la aplica igual durante la visita y no rompe nada.
- [ ] La skin no cambia durante la partida, y JUGAR DE NUEVO vuelve a `StartScreen` con la skin guardada elegida.
- [ ] ASTEROIDS conserva sus tres skins, y TETRIS, ARKANOID, SNAKE y los juegos sin motor siguen sin mostrar la fila SKIN.
- [ ] Con puntero táctil (`pointer: coarse`), `StartScreen` de FROGGER muestra la fila SKIN junto a «ESTE JUEGO NECESITA TECLADO».

**Clásico**

- [ ] La carretera y el fondo general son `#000000`, el río `#000047`, la mediana y el inicio `#1f0f36` y el seto `#071c07`.
- [ ] Las franjas seguras llevan una línea de 2 px `#8548c0` arriba y abajo; los cuadros del seto y el borde de las bocas son `#1f8f1f`.
- [ ] La rana es `#3ee03e` con borde `#1a7a1a`, ojos `#ffffff` y pupilas `#000000`.
- [ ] Los vehículos son `#ffd800` (fila 12), `#ff4fd8` (10), `#ffffff` (9), `#30c0ff` (11) y `#e0e0e0` con cabina `#ff3030` (8), con ruedas `#808080`.
- [ ] Los troncos son `#96511f` con vetas `#2e1405`; las tortugas `#c0392b` con cabeza `#2ecc40`, y hundiéndose pasan a `#8c5a4a`.
- [ ] La barra de tiempo es `#00e000`, `#ffd800` y `#ff2020` según el umbral, y la marca de choque `#ff2020`.
- [ ] No hay glow: `shadowBlur` es 0 en todo el dibujo de la skin.
- [ ] Es la skin de una partida nueva sin nada guardado.

**Neón**

- [ ] El fondo es `#05050a`, el río `#05181e`, la mediana y el inicio `#190927` y el seto `#051e17`; las franjas seguras llevan un borde `#b026ff` de 2 px.
- [ ] La rana es `#00ff88`; los vehículos `#f5ff00`, `#ff006e`, `#00f5ff`, `#ff8c42` y `#b9c6d4` con cabina `#ff006e`; los troncos `#995428` con vetas `#ff8c42`; las tortugas `#b026ff` con cabeza `#00f5ff`.
- [ ] La rana, los vehículos, los troncos, las tortugas, la barra de tiempo y la marca de choque tienen glow con `shadowBlur` 8; el terreno y las ruedas no.
- [ ] Todos los valores salen de los tokens de `app/globals.css` (o de su mezcla sobre `--deep`, según la tabla `SKINS`).

**Retro**

- [ ] Todos los colores de `SKINS.retro` salen de `RETRO_8BIT`: no hay ningún hex suelto en esa entrada.
- [ ] La escena se dibuja en un búfer de 160×120 y se amplía al canvas de 800×600 con `imageSmoothingEnabled = false`. El canvas visible sigue en `width="800"` y `height="600"`.
- [ ] Rana, vehículos, tortugas, troncos, bocas y marca de choque se ven como píxeles cuadrados de 5 px internos, sin bordes suavizados y solo con colores de `RETRO_8BIT`.
- [ ] Carretera, río, mediana y seto tienen el mismo relleno `#0b0b17` y se distinguen por sus patrones: rayas lavanda entre carriles, ondas azules, borde lavanda arriba y abajo y cuadros verdes.
- [ ] La rana se orienta en las cuatro direcciones, abre las patas al saltar y se ve distinta sobre un tronco (lavanda) y sobre una tortuga (roja).
- [ ] Las tortugas hundiéndose se ven con trama de damero y las sumergidas, solo con el contorno, en lavanda.
- [ ] Los vehículos con `velocity < 0` están espejados respecto de los de `velocity > 0`.
- [ ] No hay glow.
- [ ] El `<canvas>` lleva `image-rendering: pixelated` solo en Retro, y `CrtScreen` agrega el overlay `bg-scanlines-retro` solo en Retro. En el canvas no se dibuja ninguna scanline.

**Modo oscuro**

- [ ] Los rellenos del tablero cumplen la luminancia máxima de 0,0110: Clásico 0,0000, 0,0045, 0,0090 y 0,0089 (carretera, río, mediana, seto); Neón 0,0016, 0,0078, 0,0055 y 0,0102; Retro 0,0037 en los cuatro.
- [ ] Cada ratio de las tablas de contraste cumple su mínimo (3:1 las entidades y la rana contra su soporte; en Retro, 1,5:1 entre las entidades que se deben distinguir, salvo tronco / tortuga hundiéndose, que se distinguen por patrón).
- [ ] Ninguna skin agrega superficies claras grandes: el fondo de `StartScreen` y del CRT sigue oscuro.

**Responsive**

- [ ] La pantalla de inicio de FROGGER no desborda ni hace scroll a 320, 375, 768 y 1280 px, con la fila SKIN completa y los tres botones visibles, y sin scroll horizontal del documento.
- [ ] La skin guardada aparece elegida en la pantalla de inicio a los cuatro anchos.
- [ ] Con puntero táctil, la pantalla de inicio (fila SKIN y «ESTE JUEGO NECESITA TECLADO») tampoco desborda a 320 y 375 px.
- [ ] La partida se lee a 768 y 1280 px en las tres skins: se distinguen la rana, los vehículos, los troncos, las tortugas, las bocas y la barra de tiempo.
- [ ] Los trazos internos miden al menos 2 px en las tres skins (borde de la rana, bocas, vetas, tortuga sumergida y borde de franjas seguras; la marca de choque, 4 px; en Retro, 1 píxel lógico = 5 px).
- [ ] Ninguna skin cambia `width` ni `height` del canvas.

**Sin regresiones**

- [ ] La jugabilidad de FROGGER no cambia: saltos de una celda en 120 ms, un salto pendiente, hitboxes, arrastre del río, ciclo de las tortugas, puntos (10, 50 + 10 por segundo y 200), vidas, niveles y temporizador.
- [ ] El HUD, el guardado de puntuación y el ranking funcionan igual, y la puntuación guardada entra en el mismo ranking global.
- [ ] P pausa, Espacio inicia la partida y JUGAR DE NUEVO reinicia, como antes, en las tres skins.
- [ ] ASTEROIDS, TETRIS, ARKANOID y SNAKE se juegan y se ven igual que antes del spec.

## Decisiones

- **Sí:** tres skins, Clásico (por defecto), Neón y Retro, para cada juego con motor. Lo decidió el usuario (2026-09-30).
- **Sí:** Clásico es la estética del arcade original, sin glow, y si el original era claro se invierte a una versión oscura. Lo decidió el usuario (2026-09-30).
- **Sí:** Retro usa solo colores de las paletas compartidas `RETRO_PHOSPHOR` o `RETRO_8BIT`, con scanlines en CSS (`CrtScreen`) y nunca dibujadas en el canvas. Lo decidió el usuario (2026-09-30).
- **Sí:** la skin se elige solo en `StartScreen`, se recuerda por juego en `localStorage` (`e1230_skins`) y no cambia durante la partida. HUD, botones y el resto del sitio siguen en neón. Lo decidió el usuario (2026-09-30).
- **Sí:** el contrato y el selector son los de la base común del SPEC 10; este spec solo agrega las skins de FROGGER. Lo decidió el usuario (2026-09-30).
- **Sí:** Clásico es el `COLORS` del SPEC 11, que imita el Frogger arcade de Konami (1981, distribuido por Sega/Gremlin): carretera negra, río azul oscuro, franjas moradas, seto verde, rana verde y coches de colores. No hay referencia local en `references/`, así que los hex son los que fijó el SPEC 11, no medidos de la máquina. **No:** inventar un look propio. Lo decidió el agente (skin-designer).
- **Sí:** Neón se diseña vectorial con los tokens de la plataforma y el `COLORS` actual pasa a Clásico. **No:** copiar el `COLORS` actual a Neón, porque no es un look neón (la regla de «copiar el `COLORS`» vale para motores que ya son neón, como ASTEROIDS). Lo decidió el agente (skin-designer).
- **Sí:** Retro usa `RETRO_8BIT` y no `RETRO_PHOSPHOR`: el juego necesita distinguir seis tipos de vehículo, la rana y los soportes, y un solo tono verde no alcanza. Es la primera skin que estrena esa paleta. Lo decidió el agente (skin-designer).
- **Sí:** ningún relleno del tablero supera la luminancia de `--surface-3` (0,0110) en ninguna skin, no solo el fondo general. Por eso en Clásico el morado de las franjas y el verde del seto se oscurecen y sus colores originales pasan a un borde de 2 px (`safeEdge`) y a los cuadros y bocas (`hedgeLine`). **No:** dejar rellenos brillantes del 7 % y 13 % del canvas. Lo decidió el agente (skin-designer).
- **Sí:** el borde `safeEdge` es un elemento nuevo en las tres skins: sobre rellenos tan oscuros, la mediana y el inicio casi no se distinguirían de la carretera (1,18:1 en Clásico y 1,07:1 en Neón). Lo decidió el agente (skin-designer).
- **Sí:** en Retro las zonas se distinguen por patrón (rayas, ondas, cuadros, bordes), porque `RETRO_8BIT` solo tiene un color oscuro y los demás son brillantes. **No:** rellenar el río con `blue`, que sería una superficie clara grande. Lo decidió el agente (skin-designer).
- **Sí:** Retro dibuja en un búfer de 160×120 ampliado 5×, para que una celda de 40 px sean exactamente 8×8 píxeles lógicos, con sprites en grillas de caracteres. **No:** primitivas vectoriales con `image-rendering: pixelated` (el antialiasing mezclaría colores fuera de la paleta) ni escala 4 (la celda quedaría de 10×10 y los sprites no encajan en una grilla corta). Lo decidió el agente (skin-designer).
- **Sí:** en Retro el tronco es `lavender` y la tortuga hundiéndose también, con la tortuga tramada en damero. **No:** un tronco `orange`, que daría 1,16:1 contra la rana (bajo el mínimo de 1,5:1); `lavender` da 2,41:1. Lo decidió el agente (skin-designer).
- **Sí:** en Neón la tortuga es morada, el tronco `--bronze` al 60 % y la tortuga hundiéndose `--subtle`, para que la rana (`--neon-green`) se vea a 3:1 o más sobre cada soporte. **No:** tortuga rosa, que da 2,86:1 contra la rana. Lo decidió el agente (skin-designer).
- **Sí:** subir a 2 px el contorno de la tortuga sumergida (antes 1 px) y aclarar el color de la tortuga hundiéndose en Clásico (antes `#5a1a1a`, 1,46:1 contra el río), para cumplir el responsive y el contraste. Lo decidió el agente (skin-designer).
- **Sí:** aclarar las ruedas a `#808080` en Clásico (antes `#202020`, casi invisible sobre la carretera negra). Lo decidió el agente (skin-designer).
- **Sí:** el color de cada vehículo pasa de un hex en `LANES` a un rol (`colorRole`) que resuelve la skin. **No:** mantener `color: string` en `LANES`, que obligaría a una tabla de colores fuera de `FroggerSkin`. Lo decidió el agente (skin-designer).
- **Sí:** `riverMark` y `roadMark` valen `null` en las skins vectoriales: el render vectorial no dibuja marcas y el tablero de Clásico y Neón queda como el del SPEC 11. Lo decidió el agente (skin-designer).
- **Sí:** el glow de Neón usa `shadowBlur` 8 (el mismo de ASTEROIDS) y no se aplica al terreno ni a las ruedas. Lo decidió el agente (skin-designer).
- **No:** tocar `references/implemented-games.md`, aunque su sección de FROGGER diga «Todavía no tiene skins»: el criterio de este spec es que `references/` solo cambie en `game-skins.md`. Esa línea la actualizan el siguiente cambio a esa sección (por ejemplo, el de `mobile-porter`) o una edición manual. Lo decidió el agente (skin-designer).
- **No:** `ctx.filter` ni editar o teñir assets. FROGGER no tiene assets. Lo decidió el agente (skin-designer).

## Riesgos

| Riesgo                                                                                                                         | Mitigación                                                                                                                                                                                                               |
| ------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Con un botón del selector enfocado, Espacio lo toma `PlayerView` (escucha en `window`) e inicia la partida sin marcar la skin. | Es el comportamiento esperado de INICIAR con Espacio. `StartScreen` se desmonta al iniciar, así que el `click` del botón no llega a ejecutarse con efectos. La skin marcada es la que ya estaba elegida.                 |
| `localStorage` bloqueado (modo privado): la elección no se guarda.                                                             | `writeStoredValue` ya ignora el error y `PlayerView` conserva la elección en memoria. La skin se recuerda durante la visita y vuelve a Clásico al recargar. Hay un criterio de aceptación.                               |
| Una skin guardada que ya no existe (o un valor manipulado) rompe el motor.                                                     | Se valida con `isSkinId` y contra `definition.skins`; si no es válida, `DEFAULT_SKIN`. `SKINS[...]` nunca se indexa con un valor sin validar.                                                                            |
| Moiré o desenfoque al escalar el canvas reducido en pantallas pequeñas.                                                        | Retro usa escala 5 (celda de 8×8 píxeles) y `image-rendering: pixelated`; las scanlines van en CSS, no en el canvas. Clásico y Neón se escalan con suavizado normal. Se revisa a 320, 768 y 1280 px.                     |
| El look por defecto de FROGGER cambia respecto de hoy (franjas y seto oscuros con borde, ruedas más claras).                   | Está en «Por qué existe este spec» y en «Decisiones». Los colores del arcade se conservan en bordes y cuadros, y el look con tokens de la plataforma sigue disponible en NEÓN.                                           |
| A 320 px el canvas mide unos 260 px y el sprite de 8×8 de Retro queda en unos 13 px: la rana puede verse pequeña.              | Es un tamaño parecido al de la rana vectorial (28 px internos, unos 9 px a 320 px). Se revisa en el paso 6; si no se lee, se agranda el sprite de la rana a 8×8 sin el margen inferior (cambio local de `FROG_IDLE`).    |
| Los sprites de Retro (vehículos de 6 filas, tractor, camión) se ven toscos o desalineados respecto de las hitboxes.            | Las hitboxes no cambian (`FROG_INSET`, `VEHICLE_INSET`). Se revisa en el paso 6 con una partida por carril; los sprites son grillas de caracteres, así que ajustarlos es editar `sprites.ts` sin tocar el motor.         |
| Las entidades de Retro «saltan» de a 5 px al moverse (el desplazamiento se redondea a la grilla lógica).                       | Es propio del estilo 8-bit. La velocidad más baja (40 px/s) mueve la entidad 1 píxel lógico cada 125 ms y la más alta (150 px/s × 2,5 en el nivel 11) cada 13 ms. Se revisa a nivel 1 y con velocidad alta en el paso 6. |
| El glow de Neón (`shadowBlur`) cuesta rendimiento con unas 40 entidades por frame.                                             | Se aplica solo a entidades visibles (el culling de `drawLanes` ya existe) y se limpia al terminar cada una. Se revisa que la partida corra fluida en el paso 6; si no, se baja `SKINS.neon.glow` (un solo valor).        |
| Tronco y tortuga hundiéndose comparten color en Retro (`lavender`).                                                            | Se distinguen por forma (rectángulo con vetas frente a un caparazón circular) y por la trama de damero de la tortuga hundiéndose. Hay un criterio de aceptación y se revisa en el paso 6.                                |
| En Retro, las patas (`lavender`) se pierden sobre un tronco `lavender`.                                                        | Solo las patas; el cuerpo verde se distingue a 2,41:1 y los ojos blancos marcan la dirección. Si molesta en las capturas, las patas pasan a `green`.                                                                     |
| Las scanlines de Retro (0,35 de alfa cada 4 px) bajan el contraste percibido respecto del medido.                              | Los ratios se miden sobre los colores del canvas, sin overlay. El más bajo de entidades (caparazón y marca de choque, 4,99:1) tiene margen sobre 3:1. Se revisa en las capturas.                                         |
| El borde de las bocas en Neón (`#037643` sobre `#051e17`) queda justo en 3,05:1.                                               | Cumple el mínimo. Si en las capturas no se lee, sube `hedgeLine` en `SKINS.neon` (un solo valor) y se vuelve a medir.                                                                                                    |
| Cambiar `COLORS` por `SKINS` altera por accidente un color de Clásico.                                                         | Hay un criterio de aceptación color por color, y `grep -rn "COLORS" lib/arcade/frogger/` debe quedar vacío.                                                                                                              |
| Quitar `Lane.color` rompe algún uso que no se vio.                                                                             | `npx tsc --noEmit` lo detecta en el paso 2: `render.ts` es el único consumidor.                                                                                                                                          |
| El contrato o los otros motores se rompen.                                                                                     | Este spec no toca `engine.ts`, `shared/`, `components/` ni los otros motores, y hay un criterio de que su diff esté vacío.                                                                                               |

## Lo que **no** entra en este spec

- Controles táctiles de FROGGER.
- Skins adicionales o desbloqueables.
- Cambiar la skin durante la partida.
- Skins del sitio (HUD, botones, Biblioteca, Detalle, Hall of Fame).
- Sonido por skin.
- Sprites o imágenes externas.
- Cambios de jugabilidad, hitboxes, puntuación o ranking.

Si alguna de estas llega, va en su propio spec.
