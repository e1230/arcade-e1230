# SPEC 10 — Skins de ASTEROIDS: clásico, neón y retro

> **Estado:** Aprobado
> **Depende de:** SPEC 05, SPEC 07
> **Fecha:** 2026-09-30
> **Objetivo:** Que ASTEROIDS tenga las skins Clásico (por defecto), Neón y Retro, elegibles desde la pantalla de inicio del Reproductor y recordadas por juego, legibles en modo oscuro y responsive.

## Por qué existe este spec

ASTEROIDS (SPEC 05) es un motor vectorial: todo se dibuja con trazos y el color sale de una sola constante, `COLORS` en `lib/arcade/asteroids/constants.ts`, que espeja los tokens neón de `app/globals.css` (nave cian, asteroides rosa, balas amarillas, power-up verde, llama bronce, fondo `--deep`). Hoy no hay sistema de skins: el juego tiene un único look y el Reproductor no ofrece ninguna elección.

Este spec le da tres looks:

- **Clásico** (por defecto): vector blanco sobre negro, como la máquina de Atari de 1979, con el mismo blanco, negro y cian del port de referencia (`references/started-games/02-asteroids/game.js`). Sin glow.
- **Neón**: exactamente el `COLORS` actual, con su glow. Como el motor ya es neón vectorial, Neón no cambia un solo color.
- **Retro**: fósforo verde de monitor CRT con pixel art de verdad: la escena se dibuja en un búfer de 200×150 y se amplía 4× sin suavizado, con las scanlines marcadas en CSS.

**Este spec trae la base común del sistema de skins**, porque es el primero que se escribe (`references/game-skins.md` la marca pendiente): `SkinId`, `GameOptions` y `GameDefinition.skins` en el contrato; `lib/arcade/shared/skins.ts` con las paletas compartidas de Retro; el selector en `StartScreen`; la clave `e1230_skins` en `localStorage`; y `skin` en `GameCanvas` y `CrtScreen`. Los specs de skins de los otros juegos (TETRIS, ARKANOID, SNAKE) dependerán de este y solo agregarán su propio `skins.ts`. Todos los cambios al contrato son opcionales, así que los otros tres motores compilan y se ven igual sin tocarlos.

Un efecto visible que conviene tener presente: el look por defecto de ASTEROIDS deja de ser neón y pasa a ser Clásico (blanco sobre negro). Quien quiera el look de hoy lo elige con NEÓN.

## Alcance

**Incluye:**

- **Base común:** contrato ampliado (`SkinId`, `GameOptions`, `GameDefinition.skins`, `create(…, options?)`), `lib/arcade/shared/skins.ts` (`SKIN_IDS`, `DEFAULT_SKIN`, `SKIN_LABELS`, `isSkinId`, `RETRO_PHOSPHOR`, `RETRO_8BIT`), `STORAGE_KEYS.skins`, selector de skin en `StartScreen`, `skin` en `GameCanvas` y `CrtScreen`, y la utilidad CSS de scanlines de Retro.
- **Skins de ASTEROIDS:** `lib/arcade/asteroids/skins.ts` con `AsteroidsSkin` y `SKINS: Record<SkinId, AsteroidsSkin>`. El `COLORS` de `constants.ts` se elimina y sus valores pasan, idénticos, a `SKINS.neon`.
- **Render de Retro:** `lib/arcade/asteroids/render.ts` con las funciones de dibujo que sirven a las tres skins (trazo vectorial o píxeles) y el búfer de baja resolución de Retro.
- **Responsive de la pantalla de inicio:** `StartScreen` se compacta en anchos pequeños para que el selector quepa sin desbordes ni scroll a 320, 375, 768 y 1280 px (hoy, a 320 px, el contenido de `StartScreen` ya mide 216 px en una pantalla de 195 px).
- **Elección recordada por juego** en `localStorage` (`e1230_skins`), con valor inválido → Clásico.
- **Documentación:** `CLAUDE.md` y `.agents/skills/arcade-game/guides/engine-contract.md`.

**Fuera de alcance (para futuros specs):**

- Las skins de TETRIS, ARKANOID y SNAKE. Cada una va en su propio spec, que depende de este.
- Skins adicionales (más de tres) o skins desbloqueables.
- Cambiar la skin durante la partida. Se elige solo en la pantalla de inicio.
- Skins del sitio (HUD, botones, Biblioteca, Detalle, Hall of Fame): el resto de la plataforma sigue en neón.
- Sonido por skin.
- Usar `RETRO_8BIT` en algún juego: la paleta se define en la base, pero ASTEROIDS usa `RETRO_PHOSPHOR`. La estrena el primer juego que la necesite (por ejemplo ARKANOID).
- Cambios de jugabilidad, puntuación o ranking.

## Rutas y archivos

```
app/
  globals.css                            (cambia) + utilidad bg-scanlines-retro
lib/
  storage.ts                             (cambia) STORAGE_KEYS.skins = "e1230_skins"
  arcade/engine.ts                       (cambia) SkinId, GameOptions, GameDefinition.skins y create(…, options?)
  arcade/shared/skins.ts                 (nuevo) SKIN_IDS, DEFAULT_SKIN, SKIN_LABELS, isSkinId, RETRO_PHOSPHOR, RETRO_8BIT
  arcade/asteroids/skins.ts              (nuevo) AsteroidsSkin y SKINS
  arcade/asteroids/render.ts             (nuevo) glow, trazo de polígonos, píxeles, búfer de Retro, hex a rgba
  arcade/asteroids/constants.ts          (cambia) sin COLORS; + POWERUP_LABEL_FONT y COUNTER_FONT
  arcade/asteroids/entities.ts           (cambia) draw(ctx, skin) en vez de COLORS
  arcade/asteroids/game.ts               (cambia) lee la skin, dibuja al búfer en Retro, etiquetas al final
  arcade/asteroids/index.ts              (cambia) + skins: SKIN_IDS
components/game/
  PlayerView.tsx                         (cambia) lee, valida y guarda la skin; la pasa a StartScreen, GameCanvas y CrtScreen
  StartScreen.tsx                        (cambia) fila SKIN (radiogroup) y compactación en anchos pequeños
  GameCanvas.tsx                         (cambia) prop skin, tercer argumento de create, image-rendering en Retro
  CrtScreen.tsx                          (cambia) prop skin, overlay de scanlines en Retro
CLAUDE.md                                (cambia) contrato, estructura y persistencia
.agents/skills/arcade-game/guides/engine-contract.md   (cambia) campo opcional skins
references/game-skins.md                 (cambia) base y ASTEROIDS pasan a [x]
```

Sin cambios: `lib/arcade/arkanoid/`, `lib/arcade/tetris/`, `lib/arcade/snake/`, `lib/arcade/registry.ts`, `lib/arcade/shared/keyboard.ts` y `math.ts`, `components/game/PlayerHud.tsx`, `GameOverModal.tsx`, `PixelLoader.tsx`, `components/ui/NeonButton.tsx`, `app/games/**`, `lib/games.ts`, `lib/leaderboard*.ts`, el catálogo y el ranking de Supabase (no hay migraciones), `public/` (ASTEROIDS no usa assets), el resto de `references/` y los demás specs.

Convenciones:

- Las de `lib/arcade/` del SPEC 05: sin React ni `"use client"`, el DOM (`document.createElement("canvas")`) solo dentro de `create()`, y sin estado mutable de módulo.
- `lib/arcade/asteroids/skins.ts` no importa nada de `components/` ni toca el DOM.
- Código en inglés, comentarios en español latinoamericano, módulos sin JSX en kebab-case.

## Modelo de datos

### Base común — `lib/arcade/engine.ts`

```ts
export type SkinId = "classic" | "neon" | "retro";

export interface GameOptions {
  skin: SkinId;
}

export interface GameDefinition {
  width: number;
  height: number;
  controls: GameControl[];
  hud?: GameHud;
  skins?: readonly SkinId[]; // opcional: sin él, el Reproductor no muestra selector
  create(
    canvas: HTMLCanvasElement,
    callbacks: GameCallbacks,
    options?: GameOptions,
  ): GameEngine;
}
```

Los motores existentes declaran `create(canvas, callbacks)`; una función con menos parámetros es asignable al tipo nuevo, así que no cambian.

### Base común — `lib/arcade/shared/skins.ts`

```ts
import type { SkinId } from "@/lib/arcade/engine";

export const SKIN_IDS = [
  "classic",
  "neon",
  "retro",
] as const satisfies readonly SkinId[];

export const DEFAULT_SKIN: SkinId = "classic";

export const SKIN_LABELS: Record<SkinId, string> = {
  classic: "CLÁSICO",
  neon: "NEÓN",
  retro: "RETRO",
};

export function isSkinId(value: unknown): value is SkinId {
  return (
    typeof value === "string" && (SKIN_IDS as readonly string[]).includes(value)
  );
}

// Fósforo verde de monitor CRT: un fondo casi negro y cuatro tonos de menor a mayor luminancia.
export const RETRO_PHOSPHOR = {
  background: "#010a03",
  dim: "#1a7a35",
  mid: "#2fc458",
  bright: "#4dff7c",
  peak: "#d2ffdc",
} as const;

// Paleta limitada de 8 bits: un fondo oscuro y ocho colores saturados del PICO-8 de Lexaloffle.
export const RETRO_8BIT = {
  background: "#0b0b17",
  white: "#fff1e8",
  red: "#ff004d",
  orange: "#ffa300",
  yellow: "#ffec27",
  green: "#00e436",
  blue: "#29adff",
  pink: "#ff77a8",
  lavender: "#83769c",
} as const;
```

| Paleta           | Fondo     | Luminancia | Origen                                                                                   |
| ---------------- | --------- | ---------- | ---------------------------------------------------------------------------------------- |
| `RETRO_PHOSPHOR` | `#010a03` | 0,0023     | Verde P1 de los monitores CRT monocromos; los cuatro tonos los fija este spec.           |
| `RETRO_8BIT`     | `#0b0b17` | 0,0037     | Los colores son los del PICO-8 (Lexaloffle) sin los oscuros; el fondo lo fija este spec. |

Contraste de los colores de `RETRO_8BIT` contra su fondo (calculado con el comando de contraste): `white` 17,68:1, `red` 4,99:1, `orange` 9,76:1, `yellow` 16,08:1, `green` 11,31:1, `blue` 7,93:1, `pink` 7,87:1, `lavender` 4,69:1. Todos superan 3:1.

### Base común — `lib/storage.ts`

```ts
export const STORAGE_KEYS = {
  user: "e1230_user",
  skins: "e1230_skins", // { [gameId]: SkinId }, la skin elegida por juego
} as const;
```

### Base común — componentes

**`PlayerView`:**

```ts
// Fuera del componente: referencia estable para useSyncExternalStore
const EMPTY_SKINS: Readonly<Record<string, unknown>> = {};

const storedSkins = useStoredValue<Readonly<Record<string, unknown>>>(
  STORAGE_KEYS.skins,
  EMPTY_SKINS,
);
// Respaldo en memoria: si localStorage está bloqueado, la elección igual vale durante la visita
const [skinOverride, setSkinOverride] = useState<SkinId | null>(null);

const candidate =
  skinOverride ??
  (typeof storedSkins === "object" && storedSkins !== null
    ? storedSkins[game.id]
    : undefined);
const skin: SkinId =
  isSkinId(candidate) && definition?.skins?.includes(candidate)
    ? candidate
    : DEFAULT_SKIN;

function handleSkinChange(next: SkinId) {
  setSkinOverride(next);
  writeStoredValue(STORAGE_KEYS.skins, { ...safeSkins, [game.id]: next });
}
```

`safeSkins` es `storedSkins` si es un objeto y `{}` si no (un JSON como `null` o un arreglo no rompe el guardado). La skin vive fuera de `PlayerState`, así que JUGAR DE NUEVO (`startLoading`) no la reinicia. `PlayerView` pasa `skins={definition.skins}`, `skin` y `onSkinChange` a `StartScreen`, `skin` a `GameCanvas` y `skin` a `CrtScreen`. Los juegos sin motor (`definition` indefinido) siempre resuelven a `DEFAULT_SKIN` y no muestran selector.

**`StartScreen`:** recibe `skins?: readonly SkinId[]`, `skin: SkinId` y `onSkinChange(skin: SkinId): void`. Si `skins` tiene elementos, entre la tabla de controles y el aviso o el botón de inicio muestra una fila «SKIN»:

- La fila es un contenedor `flex flex-col items-center gap-1.5 sm:flex-row sm:gap-3`, con el rótulo `SKIN` (`font-pixel text-[10px] text-muted`) y el grupo.
- El grupo es un `div` con `role="radiogroup"` y `aria-label="SKIN"`, `flex flex-nowrap gap-1.5 sm:gap-2`, con un `NeonButton` `size="sm"` por skin: `role="radio"`, `aria-checked={skin === id}`, `accent="cyan"`, `variant="solid"` si es la elegida y `"outline"` si no, `onClick={() => onSkinChange(id)}` y `className="px-2! sm:px-3.5!"` (el modificador `!` de Tailwind v4 evita el conflicto con el `px-3.5` de `size="sm"`).
- El texto de cada botón sale de `SKIN_LABELS`.
- Se muestra también con puntero táctil (`isCoarsePointer`), junto a «ESTE JUEGO NECESITA TECLADO».
- Compactación en anchos pequeños: el contenedor pasa de `gap-4.5 p-6` a `gap-2 p-3 sm:gap-4.5 sm:p-6`, y las celdas de la tabla de controles de `py-1 text-sm` a `py-0 text-xs sm:py-1 sm:text-sm`.

Estimación de la altura a 320 px (pantalla de 260×195): hoy 216 px; la compactación ahorra unos 70 px y la fila SKIN agrega unos 54, para unos 180-200 px. Es ajustada, así que el plan la mide y trae una salida de emergencia (paso 4).

**`GameCanvas`:** recibe `skin: SkinId`, llama `definition.create(canvas, callbacks, { skin })`, agrega `skin` a las dependencias del efecto del motor y, cuando `skin === "retro"`, suma la clase `[image-rendering:pixelated]` al `<canvas>`. El tamaño (`width`, `height`) no cambia.

**`CrtScreen`:** recibe `skin: SkinId`. Cuando es `"retro"`, agrega, justo después del `div` de `bg-crt`, un segundo overlay `bg-scanlines-retro pointer-events-none absolute inset-0 z-[4]`. En Clásico y Neón el JSX resultante es idéntico al actual.

**`app/globals.css`:** utilidad nueva, junto a `bg-crt`:

```css
/* Scanlines marcadas de la skin Retro: 2 px oscuros cada 4 px, en píxeles CSS (no escalan con el canvas) */
@utility bg-scanlines-retro {
  background-image: repeating-linear-gradient(
    0deg,
    rgba(0, 0, 0, 0.35) 0 2px,
    transparent 2px 4px
  );
}
```

### Inventario visual de ASTEROIDS

Todo lo que hoy define cómo se ve el juego, y el campo de `AsteroidsSkin` que lo reemplaza:

| Dónde                                        | Qué                                                             | Campo de la skin                    |
| -------------------------------------------- | --------------------------------------------------------------- | ----------------------------------- |
| `game.ts` · `draw`                           | `fillStyle` del fondo (`COLORS.background`)                     | `background`                        |
| `entities.ts` · `Ship.draw`                  | trazo de la nave (`COLORS.ship`), `lineWidth` 1.5, glow         | `ship`, `lineWidth`, `glow`         |
| `entities.ts` · `Ship.draw`                  | llama del propulsor (`COLORS.flame`)                            | `flame`, `flameAlpha`               |
| `entities.ts` · `Asteroid.draw`              | trazo del asteroide (`COLORS.asteroid`), `lineWidth` 1.5, glow  | `asteroid`, `lineWidth`, `glow`     |
| `entities.ts` · `Bullet.draw`                | relleno de la bala (`COLORS.bullet`), glow                      | `bullet`, `glow`                    |
| `entities.ts` · `PowerUp.draw`               | contorno del rombo (`COLORS.powerUp`), `lineWidth` 2, glow      | `powerUp`, `lineWidth`, `glow`      |
| `entities.ts` · `PowerUp.draw`               | texto «3x» (`COLORS.powerUp`, `bold 12px monospace`)            | `powerUp`; fuente en `constants.ts` |
| `entities.ts` · `Particle.draw`              | `rgba(COLORS.particle, alfa)`, `lineWidth` 1                    | `particle`, `particleWidth`         |
| `game.ts` · `draw`                           | texto «3x 4.2s» (`COLORS.powerUp`, `15px monospace`)            | `powerUp`; fuente en `constants.ts` |
| `entities.ts` · `applyGlow` (`shadowBlur` 8) | intensidad del glow                                             | `glow`                              |
| (nuevo)                                      | escala del píxel lógico (1 = vectorial, 4 = pixel art de Retro) | `pixelScale`                        |

Ningún color queda fuera de `AsteroidsSkin`. Las fuentes (`bold 14px monospace` y `15px monospace`) son iguales en las tres skins, así que van como constantes y no como rol.

### `AsteroidsSkin`

```ts
export interface AsteroidsSkin {
  background: string; // fondo del canvas
  ship: string; // trazo de la nave
  asteroid: string; // trazo de los asteroides
  bullet: string; // relleno de las balas
  powerUp: string; // contorno del power-up y textos «3x»
  flame: string; // llama del propulsor
  flameAlpha: number; // opacidad de la llama (0 a 1)
  particle: string; // partículas de explosión; el alfa se desvanece con su vida
  lineWidth: number; // grosor de nave, asteroides y power-up, en px internos (800×600)
  particleWidth: number; // grosor de las partículas
  glow: number; // shadowBlur en px; 0 = sin glow (solo Neón lo usa)
  pixelScale: number; // 1 = dibujo vectorial; >1 = pixel art en un búfer reducido
}
```

### `SKINS`: rol × skin

| Rol             | Clásico                                                       | Neón                                         | Retro                                                         |
| --------------- | ------------------------------------------------------------- | -------------------------------------------- | ------------------------------------------------------------- |
| `background`    | `#000000` (`#000` de `game.js`)                               | `#05050a` (`--deep`)                         | `#010a03` (`RETRO_PHOSPHOR.background`)                       |
| `ship`          | `#ffffff` (`#fff` de `game.js`; blanco de la máquina de 1979) | `#00f5ff` (`--neon-cyan`)                    | `#d2ffdc` (`RETRO_PHOSPHOR.peak`)                             |
| `asteroid`      | `#ffffff`                                                     | `#ff006e` (`--neon-pink`)                    | `#2fc458` (`RETRO_PHOSPHOR.mid`)                              |
| `bullet`        | `#ffffff`                                                     | `#f5ff00` (`--neon-yellow`)                  | `#d2ffdc` (`RETRO_PHOSPHOR.peak`)                             |
| `powerUp`       | `#00ffff` (`#0ff` de `game.js`)                               | `#00ff88` (`--neon-green`)                   | `#4dff7c` (`RETRO_PHOSPHOR.bright`)                           |
| `flame`         | `#ff8200` (`rgba(255,130,0,.85)` de `game.js`)                | `#ff8c42` (`--bronze`)                       | `#1a7a35` (`RETRO_PHOSPHOR.dim`)                              |
| `flameAlpha`    | `0.85` (de `game.js`)                                         | `1` (el `COLORS.flame` actual es opaco)      | `1`                                                           |
| `particle`      | `#ffffff`                                                     | `#ff006e` (el `"255, 0, 110"` actual en hex) | `#2fc458` (`RETRO_PHOSPHOR.mid`)                              |
| `lineWidth`     | `2`                                                           | `2`                                          | `4` (1 píxel lógico)                                          |
| `particleWidth` | `2`                                                           | `2`                                          | `4` (no se usa: en píxeles, cada partícula es 1 píxel lógico) |
| `glow`          | `0`                                                           | `8` (el `shadowBlur` actual)                 | `0`                                                           |
| `pixelScale`    | `1`                                                           | `1`                                          | `4` (búfer de 200×150)                                        |

```ts
import type { SkinId } from "@/lib/arcade/engine";
import { RETRO_PHOSPHOR } from "@/lib/arcade/shared/skins";

export const SKINS: Record<SkinId, AsteroidsSkin> = {
  classic: {
    background: "#000000", // game.js: `#000`
    ship: "#ffffff", // game.js: `#fff`
    asteroid: "#ffffff",
    bullet: "#ffffff",
    powerUp: "#00ffff", // game.js: `#0ff`
    flame: "#ff8200", // game.js: rgba(255, 130, 0, 0.85)
    flameAlpha: 0.85,
    particle: "#ffffff",
    lineWidth: 2,
    particleWidth: 2,
    glow: 0,
    pixelScale: 1,
  },
  neon: {
    background: "#05050a", // --deep
    ship: "#00f5ff", // --neon-cyan
    asteroid: "#ff006e", // --neon-pink
    bullet: "#f5ff00", // --neon-yellow
    powerUp: "#00ff88", // --neon-green
    flame: "#ff8c42", // --bronze
    flameAlpha: 1,
    particle: "#ff006e", // --neon-pink (antes "255, 0, 110")
    lineWidth: 2,
    particleWidth: 2,
    glow: 8,
    pixelScale: 1,
  },
  retro: {
    background: RETRO_PHOSPHOR.background,
    ship: RETRO_PHOSPHOR.peak,
    asteroid: RETRO_PHOSPHOR.mid,
    bullet: RETRO_PHOSPHOR.peak,
    powerUp: RETRO_PHOSPHOR.bright,
    flame: RETRO_PHOSPHOR.dim,
    flameAlpha: 1,
    particle: RETRO_PHOSPHOR.mid,
    lineWidth: 4, // en píxeles, cada trazo mide 1 píxel lógico (= pixelScale)
    particleWidth: 4,
    glow: 0,
    pixelScale: 4,
  },
};
```

El tipo `Record<SkinId, AsteroidsSkin>` hace que TypeScript exija las tres skins. Los tres colores de Neón que cambian de formato no cambian de valor: `"255, 0, 110"` es `#ff006e`.

### Contraste

Calculado con el comando de contraste del proyecto (luminancia relativa WCAG). Los colores con alfa se comparan con su equivalente opaco sobre el fondo: la llama de Clásico, `rgba(255,130,0,.85)` sobre negro, es `#d96f00`. Las partículas se miden con alfa 1 (es cuando más se ven; se desvanecen a propósito).

**Clásico** (fondo `#000000`, luminancia 0,0000, máximo 0,0110)

| Par                                                   | Ratio   | Mínimo | Cumple |
| ----------------------------------------------------- | ------- | ------ | ------ |
| Nave, asteroides, balas, partículas `#ffffff` / fondo | 21,00:1 | 3:1    | Sí     |
| Power-up `#00ffff` / fondo                            | 16,75:1 | 3:1    | Sí     |
| Llama `#d96f00` (equiv. opaco) / fondo                | 6,22:1  | 3:1    | Sí     |
| Texto «3x» y contador `#00ffff` / fondo               | 16,75:1 | 4,5:1  | Sí     |

**Neón** (fondo `#05050a`, luminancia 0,0016, máximo 0,0110)

| Par                                       | Ratio   | Mínimo | Cumple |
| ----------------------------------------- | ------- | ------ | ------ |
| Nave `#00f5ff` / fondo                    | 15,02:1 | 3:1    | Sí     |
| Asteroides y partículas `#ff006e` / fondo | 5,30:1  | 3:1    | Sí     |
| Balas `#f5ff00` / fondo                   | 18,58:1 | 3:1    | Sí     |
| Power-up `#00ff88` / fondo                | 15,17:1 | 3:1    | Sí     |
| Llama `#ff8c42` / fondo                   | 8,80:1  | 3:1    | Sí     |
| Texto «3x» y contador `#00ff88` / fondo   | 15,17:1 | 4,5:1  | Sí     |

**Retro** (fondo `#010a03`, luminancia 0,0023, máximo 0,0110)

| Par                                                   | Ratio   | Mínimo         | Cumple                                                                              |
| ----------------------------------------------------- | ------- | -------------- | ----------------------------------------------------------------------------------- |
| Nave y balas `#d2ffdc` / fondo                        | 18,24:1 | 3:1            | Sí                                                                                  |
| Asteroides y partículas `#2fc458` / fondo             | 8,75:1  | 3:1            | Sí                                                                                  |
| Power-up `#4dff7c` / fondo                            | 15,21:1 | 3:1            | Sí                                                                                  |
| Llama `#1a7a35` / fondo                               | 3,71:1  | 3:1            | Sí                                                                                  |
| Texto «3x» y contador `#4dff7c` / fondo               | 15,21:1 | 4,5:1          | Sí                                                                                  |
| Distinción: nave `#d2ffdc` / asteroides `#2fc458`     | 2,08:1  | 1,5:1          | Sí                                                                                  |
| Distinción: power-up `#4dff7c` / asteroides `#2fc458` | 1,74:1  | 1,5:1          | Sí                                                                                  |
| Distinción: balas `#d2ffdc` / asteroides `#2fc458`    | 2,08:1  | 1,5:1          | Sí                                                                                  |
| Distinción: llama `#1a7a35` / asteroides `#2fc458`    | 2,36:1  | 1,5:1          | Sí                                                                                  |
| Distinción: nave `#d2ffdc` / power-up `#4dff7c`       | 1,20:1  | 1,5:1 o patrón | Sí, por patrón: el power-up es un rombo pulsante con «3x» y la nave es un triángulo |

Todas las skins cumplen la luminancia máxima del fondo, y ningún texto ni entidad baja de su mínimo.

### Cambios del motor

**`constants.ts`:** se elimina `COLORS` (sus valores pasan idénticos a `SKINS.neon`) y se agregan `POWERUP_LABEL_FONT = "bold 14px monospace"` (antes 12 px; el mínimo de texto es 14) y `COUNTER_FONT = "15px monospace"` (sin cambios). El resto (radios, velocidades, puntos, tiempos) no cambia.

**`render.ts`:** funciones puras que reciben el contexto y la skin:

```ts
export function applyGlow(
  ctx: CanvasRenderingContext2D,
  skin: AsteroidsSkin,
  color: string,
): void;
export function clearGlow(ctx: CanvasRenderingContext2D): void;
// Dibuja un contorno en coordenadas locales (origen + rotación). Vectorial (pixelScale 1): translate, rotate, stroke,
// exactamente como hoy. Pixel art (pixelScale > 1): rota los puntos a mano y los traza con plotLine.
export function strokeShape(
  ctx: CanvasRenderingContext2D,
  skin: AsteroidsSkin,
  origin: { x: number; y: number; rotation: number },
  points: readonly (readonly [number, number])[],
  color: string,
  closed: boolean,
): void;
// Bresenham sobre la grilla lógica: un fillRect de 1×1 por píxel, sin antialiasing, así que solo aparecen colores de la paleta.
export function plotLine(
  ctx: CanvasRenderingContext2D,
  x0: number,
  y0: number,
  x1: number,
  y1: number,
  color: string,
): void;
export function fillPixels(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  color: string,
): void;
export function hexToRgba(hex: string, alpha: number): string; // "#ff006e", 0.5 → "rgba(255, 0, 110, 0.50)"
```

En pixel art, toda coordenada del mundo (800×600) se convierte a la grilla lógica con `Math.floor(valor / skin.pixelScale)`: así el dibujo queda alineado a enteros.

**`entities.ts`:** cada `draw(ctx)` pasa a `draw(ctx, skin)`, y `COLORS.x` pasa a `skin.x`:

- `Ship.draw`: el casco es el polígono `(20,0) (-12,-9) (-7,0) (-12,9)` cerrado, con `strokeShape` y `skin.ship`. La llama (`(-8,-4) (-8 - rand(6,14), 0) (-8,4)`, abierta) usa `skin.flame` con `skin.flameAlpha`. El parpadeo de invencibilidad y `Math.random() > 0.35` no cambian. En vectorial, `applyGlow` con `skin.ship` envuelve a ambos, como hoy.
- `Asteroid.draw`: `strokeShape` con sus `verts` cerrados y `skin.asteroid`.
- `Bullet.draw`: en vectorial, el `arc` de radio `this.radius` con `skin.bullet` y glow, como hoy. En pixel art, un cuadrado de 2×2 píxeles lógicos (8 px internos) con `fillPixels`. El radio de colisión (2) no cambia.
- `PowerUp.draw`: dibuja solo el rombo (`strokeRect` rotado 45° en vectorial; los cuatro vértices con `strokeShape` en pixel art), con el mismo pulso, parpadeo final (`ttl < 2`) y radio 12. El texto pasa a un método nuevo `PowerUp.drawLabel(ctx, skin)`, que se llama sobre el canvas principal (ver `game.ts`) y respeta el mismo parpadeo.
- `Particle.draw`: en vectorial, línea con `hexToRgba(skin.particle, alpha)` y `skin.particleWidth`. En pixel art, un píxel lógico con `skin.particle`, sin alfa, visible mientras `ttl / life > 0.25` (se apaga por pasos).
- Las funciones locales `applyGlow` y `clearGlow` de `entities.ts` se mudan a `render.ts`, donde `applyGlow` es un no-op si `skin.glow === 0`.

**`game.ts`:**

- `createAsteroidsEngine(canvas, callbacks, options?: GameOptions)` lee `const skin = SKINS[options?.skin ?? DEFAULT_SKIN]` al crearse.
- Si `skin.pixelScale > 1`, crea (dentro de `create`) un canvas auxiliar de `WIDTH / pixelScale × HEIGHT / pixelScale` (200×150) y su contexto, `bufferCtx`. El `canvas` visible conserva 800×600.
- `draw()`: el destino es `bufferCtx` en pixel art o `ctx` en vectorial. Se rellena el fondo con `skin.background`, se dibujan partículas, asteroides, power-ups, balas y nave con `draw(target, skin)`. Si hay búfer, se hace `ctx.imageSmoothingEnabled = false` y `ctx.drawImage(buffer, 0, 0, WIDTH, HEIGHT)`. Después, sobre `ctx`, se dibujan las etiquetas «3x» de los power-ups (`POWERUP_LABEL_FONT`, `skin.powerUp`, centradas) y el contador «3x 4.2s» (`COUNTER_FONT`, `skin.powerUp`, en `(14, 26)`). El texto nunca pasa por el búfer, así que se lee a tamaño completo en las tres skins.
- La jugabilidad (`update`, colisiones, puntos, vidas, niveles) no cambia en nada.

**`index.ts`:** `skins: SKIN_IDS,` en `asteroidsDefinition` (import de `@/lib/arcade/shared/skins`). `create: createAsteroidsEngine` no cambia.

**Sprites:** ASTEROIDS no usa sprites ni `drawImage` de assets. No se toca ningún archivo de `public/` ni `references/`. No se usa `ctx.filter`.

## Plan de implementación

1. **Contrato, paletas y almacenamiento.** Ampliar `lib/arcade/engine.ts` (`SkinId`, `GameOptions`, `skins?`, `create(…, options?)`), crear `lib/arcade/shared/skins.ts` y agregar `STORAGE_KEYS.skins` en `lib/storage.ts`. Verificación: `npx tsc --noEmit` y `npm run lint` pasan sin tocar `arkanoid/`, `tetris/` ni `snake/`.
2. **Scanlines de Retro.** Agregar `bg-scanlines-retro` a `app/globals.css`. Verificación: `npm run lint` pasa (se ve en el paso 4).
3. **Skins de ASTEROIDS.** Crear `lib/arcade/asteroids/skins.ts` con `AsteroidsSkin` y `SKINS`. Verificación: `npx tsc --noEmit` pasa y TypeScript rechaza una skin faltante (probar quitando `retro` un momento y restaurándolo).
4. **Motor.** Crear `render.ts`; quitar `COLORS` de `constants.ts` y agregar las dos fuentes; pasar `entities.ts` y `game.ts` a la skin (búfer, etiquetas al final); agregar `skins: SKIN_IDS` en `index.ts`. Verificación: `npx tsc --noEmit` y `npm run lint` pasan, y `grep -rn "COLORS" lib/arcade/asteroids/` no devuelve nada.
5. **Componentes del Reproductor.** Cambiar `GameCanvas`, `CrtScreen`, `StartScreen` y `PlayerView` como describe «Base común — componentes». Verificación: `npx tsc --noEmit` y `npm run lint` pasan; en `/games/asteroids/play` aparece la fila SKIN con CLÁSICO elegido, y en `/games/snake/play` no aparece. Medir la pantalla de inicio a 320, 375, 768 y 1280 px con `browser_evaluate`: para el primer hijo de la pantalla CRT, `scrollHeight <= clientHeight` y `scrollWidth <= clientWidth`, y `document.documentElement.scrollWidth <= innerWidth`. Si a 320 px no cabe, salida de emergencia: ocultar la línea «PRESIONA ESPACIO» en anchos pequeños (`hidden sm:block`), porque el botón INICIAR sigue visible.
6. **Verificación visual de las tres skins.** Con `npm run dev`, en modo oscuro, para cada skin: guardar `e1230_skins` y jugar una partida a 768 y 1280 px (Espacio, disparar, propulsar, romper un asteroide). Capturas en `.playwright-screenshots/skins/asteroids/<skin>-<ancho>.png`. Verificación: se leen nave, asteroides, balas, llama, partículas y el «3x» del power-up; Retro se ve en píxeles gruesos y con scanlines; Clásico y Neón no tienen bordes pixelados.
7. **Documentación.** Marcar la base y ASTEROIDS como `[x]` en `references/game-skins.md`; actualizar `CLAUDE.md` (contrato con `skins` y `options`, estructura con `shared/skins.ts` y `skins.ts` por juego, persistencia con `e1230_skins`, y el párrafo de skins) y `.agents/skills/arcade-game/guides/engine-contract.md` (el campo opcional `skins` y la regla de `COLORS` → `SKINS`). Verificación: `git diff main -- references/` solo muestra `references/game-skins.md` y `git diff main -- public/` está vacío.

## Criterios de aceptación

**Generales**

- [ ] `npx tsc --noEmit` y `npm run lint` terminan sin errores (y `npm run build` compila).
- [ ] Existen `lib/arcade/shared/skins.ts`, `lib/arcade/asteroids/skins.ts` y `lib/arcade/asteroids/render.ts`, y `lib/arcade/asteroids/constants.ts` ya no exporta `COLORS`.
- [ ] `git diff main -- references/` solo muestra cambios en `references/game-skins.md`, y `git diff main -- public/` está vacío.
- [ ] Ningún archivo de `lib/arcade/` importa `react` ni declara `"use client"`, y `skins.ts`, `render.ts` y `constants.ts` no tocan el DOM a nivel de módulo.
- [ ] `grep -rn "ctx.filter" lib/ components/` no devuelve nada.
- [ ] Al jugar una partida por skin, la consola del navegador no muestra errores ni advertencias de hidratación.

**Base común**

- [ ] `/games/asteroids/play` muestra en `StartScreen` la fila «SKIN» con tres botones, CLÁSICO, NEÓN y RETRO, dentro de un `role="radiogroup"`, cada uno con `role="radio"` y `aria-checked`. Solo la skin elegida es `variant="solid"` y tiene `aria-checked="true"`.
- [ ] Sin nada guardado, CLÁSICO aparece elegido.
- [ ] Elegir NEÓN guarda `{"asteroids":"neon"}` en `localStorage["e1230_skins"]`. Recargar la página y entrar de nuevo muestra NEÓN elegido y la partida usa Neón.
- [ ] La elección se guarda por juego: elegir una skin en ASTEROIDS no modifica la clave de otros juegos (al guardar, se conservan las demás claves del objeto).
- [ ] Con `localStorage["e1230_skins"]` en `{"asteroids":"sepia"}`, o en `null`, `[]` o un JSON roto, la pantalla de inicio muestra CLÁSICO elegido y no hay errores.
- [ ] Con `localStorage` bloqueado (el `getItem` o el `setItem` lanzan), elegir una skin la aplica igual durante la visita y no rompe nada.
- [ ] La skin no se puede cambiar durante la partida (no hay selector fuera de `StartScreen`), y JUGAR DE NUEVO vuelve a `StartScreen` con la skin guardada elegida.
- [ ] Los juegos sin `skins` (TETRIS, ARKANOID, SNAKE) y los sin motor no muestran la fila SKIN, y se ven y juegan igual que antes.
- [ ] Con puntero táctil (`pointer: coarse`), `StartScreen` muestra la fila SKIN junto a «ESTE JUEGO NECESITA TECLADO».
- [ ] `git diff main -- lib/arcade/tetris lib/arcade/arkanoid lib/arcade/snake lib/arcade/registry.ts` está vacío.

**Clásico**

- [ ] El fondo del canvas es `#000000`, la nave, los asteroides y las balas son `#ffffff`, y el power-up y su texto son `#00ffff`.
- [ ] La llama es `#ff8200` con opacidad 0,85.
- [ ] No hay glow: `shadowBlur` es 0 en todo el dibujo de la skin.
- [ ] Nave, asteroides y rombo del power-up se trazan con `lineWidth` 2, y las partículas también.
- [ ] Es la skin de una partida nueva sin nada guardado.

**Neón**

- [ ] Los colores coinciden uno a uno con el `COLORS` anterior: fondo `#05050a`, nave `#00f5ff`, asteroides `#ff006e`, balas `#f5ff00`, power-up `#00ff88`, llama `#ff8c42` y partículas `rgba(255, 0, 110, alfa)`.
- [ ] Nave, asteroides, balas y power-up tienen glow con `shadowBlur` 8; las partículas, las etiquetas de texto y el contador no.
- [ ] El trazo es de 2 px (antes 1,5 px) y el texto «3x» de 14 px (antes 12 px); ninguna otra cosa cambia.

**Retro**

- [ ] El fondo es `#010a03`, la nave y las balas `#d2ffdc`, los asteroides y partículas `#2fc458`, el power-up y su texto `#4dff7c` y la llama `#1a7a35`. Todos vienen de `RETRO_PHOSPHOR`; no hay ningún hex suelto en `SKINS.retro`.
- [ ] La escena se dibuja en un búfer de 200×150 y se amplía al canvas de 800×600 con `imageSmoothingEnabled = false`. El canvas visible sigue en `width="800"` y `height="600"`.
- [ ] Nave, asteroides, llama y rombo se ven como píxeles cuadrados de 4 px internos, sin bordes suavizados y solo con colores de `RETRO_PHOSPHOR`.
- [ ] Las balas miden 2×2 píxeles lógicos y las partículas 1×1, y se apagan por pasos, sin transparencia.
- [ ] El texto «3x» y el contador se dibujan sobre el canvas principal, a 14 y 15 px, nítidos.
- [ ] No hay glow.
- [ ] El `<canvas>` lleva `image-rendering: pixelated` solo en Retro, y `CrtScreen` agrega el overlay `bg-scanlines-retro` solo en Retro. En el canvas no se dibuja ninguna scanline.

**Modo oscuro**

- [ ] Los fondos cumplen la luminancia máxima de 0,0110: Clásico 0,0000, Neón 0,0016 y Retro 0,0023.
- [ ] Cada ratio de las tablas de contraste cumple su mínimo (3:1 en entidades, 4,5:1 en texto) y, en Retro, los pares de distinción superan 1,5:1 salvo nave / power-up, que se distinguen por patrón.
- [ ] Ninguna skin agrega superficies claras grandes: el fondo de `StartScreen` y del CRT sigue oscuro.

**Responsive**

- [ ] La pantalla de inicio de ASTEROIDS no desborda ni hace scroll a 320, 375, 768 y 1280 px, con la fila SKIN completa y los tres botones visibles, y sin scroll horizontal del documento.
- [ ] La skin guardada aparece elegida en la pantalla de inicio a los cuatro anchos.
- [ ] Con puntero táctil, la pantalla de inicio (fila SKIN y «ESTE JUEGO NECESITA TECLADO») tampoco desborda a 320 y 375 px.
- [ ] La partida se lee a 768 y 1280 px en las tres skins: se distinguen nave, asteroides, balas y power-up.
- [ ] Los trazos internos miden al menos 2 px y el texto del canvas al menos 14 px en las tres skins.
- [ ] Ninguna skin cambia `width` ni `height` del canvas.

**Sin regresiones**

- [ ] La jugabilidad de ASTEROIDS no cambia: rotación, empuje, disparo, división de asteroides, puntos (100, 50 y 20), vidas, niveles y power-up de triple disparo.
- [ ] El HUD, el guardado de puntuación y el ranking funcionan igual, y la puntuación guardada entra en el mismo ranking global.
- [ ] P pausa, Espacio inicia la partida y JUGAR DE NUEVO reinicia, como antes, en las tres skins.
- [ ] TETRIS, ARKANOID y SNAKE se juegan y se ven igual que antes del spec.

## Decisiones

- **Sí:** tres skins, Clásico (por defecto), Neón y Retro, para cada juego con motor. Lo decidió el usuario (2026-09-30).
- **Sí:** Neón reproduce exactamente el `COLORS` actual porque el motor ya es neón vectorial. Lo decidió el usuario (2026-09-30).
- **Sí:** Retro usa solo colores de las paletas compartidas `RETRO_PHOSPHOR` o `RETRO_8BIT`, con scanlines en CSS (`CrtScreen`) y nunca dibujadas en el canvas. Lo decidió el usuario (2026-09-30).
- **Sí:** la skin se elige solo en `StartScreen`, se recuerda por juego en `localStorage` (`e1230_skins`) y no cambia durante la partida. HUD, botones y el resto del sitio siguen en neón. Lo decidió el usuario (2026-09-30).
- **Sí:** la base común viaja en el primer spec de skins (este), con el contrato ampliado solo con partes opcionales (`skins?`, `options?`). **No:** un spec aparte para la base. Lo decidió el usuario (2026-09-30).
- **Sí:** Clásico toma de `game.js` el negro, el blanco y el cian del power-up, y es el look de la máquina de Atari de 1979 (vector monocromo blanco). **No:** inventar un look propio. Lo decidió el agente (skin-designer).
- **Sí:** Clásico conserva la llama naranja del port (`rgba(255,130,0,.85)`), aunque la máquina original no la tenía: la llama hace legible el empuje. **No:** quitarla. Lo decidió el agente (skin-designer).
- **Sí:** subir el grosor de los trazos de 1,5 px y 1 px a 2 px en Clásico y Neón, y el texto «3x» de 12 px a 14 px, para cumplir el responsive obligatorio. Es el único cambio de Neón más allá de los colores. **No:** dejar los valores de la referencia. Lo decidió el agente (skin-designer).
- **Sí:** Retro dibuja en un búfer de 200×150 ampliado 4× con Bresenham por píxeles, así que solo aparecen colores de la paleta y todo queda en coordenadas enteras. **No:** trazos vectoriales con `image-rendering: pixelated` (el antialiasing mezclaría colores fuera de la paleta) ni escala 2 (con `pixelated` y el canvas reducido a 260 px, las líneas de 2 px se perderían al escalar). Lo decidió el agente (skin-designer).
- **Sí:** el texto («3x» y el contador) se dibuja sobre el canvas principal y no en el búfer, para que siga en 14-15 px y legible. **No:** fuente bitmap propia. Lo decidió el agente (skin-designer).
- **Sí:** en Retro las balas son cuadrados de 2×2 píxeles lógicos y las partículas se apagan por pasos, sin alfa. El radio de colisión no cambia. Lo decidió el agente (skin-designer).
- **Sí:** Retro usa `RETRO_PHOSPHOR` (fósforo verde), como en el punto de partida de la tabla de skins. Nave y balas en `peak`, asteroides en `mid`, power-up en `bright` y llama en `dim`, para que se distingan por luminancia. Lo decidió el agente (skin-designer).
- **Sí:** `RETRO_8BIT` se define en la base con los colores del PICO-8, aunque ASTEROIDS no la usa, porque la base debe traer las dos paletas compartidas. Lo decidió el agente (skin-designer).
- **Sí:** el color de las partículas se guarda en hex y se convierte a `rgba` al dibujar. **No:** mantener el string `"255, 0, 110"`. El valor es el mismo. Lo decidió el agente (skin-designer).
- **Sí:** el texto del power-up pasa a `PowerUp.drawLabel`, que se dibuja al final sobre el canvas principal en las tres skins. Lo decidió el agente (skin-designer).
- **Sí:** `PlayerView` guarda la elección también en un estado en memoria, para que el selector funcione aunque `localStorage` esté bloqueado. **No:** depender solo de `localStorage`. Lo decidió el agente (skin-designer).
- **Sí:** `StartScreen` se compacta en anchos pequeños (`p-3`, `gap-2`, filas de la tabla sin `py`). La pantalla de inicio de hoy ya desborda 21 px a 320 px, así que el selector no cabría sin este ajuste. Lo decidió el agente (skin-designer).
- **No:** navegación con flechas dentro del `radiogroup`. Cada botón se alcanza con Tab y se activa con clic, Enter o Espacio del botón; las flechas se dejan para el juego. Lo decidió el agente (skin-designer).
- **No:** `ctx.filter` ni editar o teñir assets. ASTEROIDS no tiene assets. Lo decidió el agente (skin-designer).

## Riesgos

| Riesgo                                                                                                                         | Mitigación                                                                                                                                                                                                    |
| ------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Con un botón del selector enfocado, Espacio lo toma `PlayerView` (escucha en `window`) e inicia la partida sin marcar la skin. | Es el comportamiento esperado de INICIAR con Espacio. `StartScreen` se desmonta al iniciar, así que el `click` del botón no llega a ejecutarse con efectos. La skin marcada es la que ya estaba elegida.      |
| `localStorage` bloqueado (modo privado): la elección no se guarda.                                                             | `writeStoredValue` ya ignora el error y `PlayerView` conserva la elección en memoria. La skin se recuerda durante la visita y vuelve a Clásico al recargar. Hay un criterio de aceptación.                    |
| Una skin guardada que ya no existe (o un valor manipulado) rompe el motor.                                                     | Se valida con `isSkinId` y contra `definition.skins`; si no es válida, `DEFAULT_SKIN`. `SKINS[...]` nunca se indexa con un valor sin validar.                                                                 |
| Moiré o desenfoque al escalar el canvas reducido en pantallas pequeñas.                                                        | Retro usa escala 4 (líneas de 4 px) y `image-rendering: pixelated`; las scanlines van en CSS, no en el canvas. Clásico y Neón se escalan con suavizado normal. Se revisa a 320, 768 y 1280 px.                |
| El look por defecto de ASTEROIDS cambia de neón a Clásico (blanco sobre negro).                                                | Está en «Por qué existe este spec» y en «Decisiones». El look de hoy sigue disponible en NEÓN, con los mismos colores.                                                                                        |
| En Retro, la nave de 8×5 píxeles lógicos puede verse pequeña y tosca.                                                          | Se revisa en el paso 6. Si no se lee, `SKINS.retro.pixelScale` baja a 2 (un solo valor; el búfer se adapta) y se vuelve a verificar el escalado a 320 px.                                                     |
| Las scanlines de Retro (0,35 de alfa cada 4 px) bajan el contraste percibido respecto del medido.                              | Los ratios se miden sobre los colores del canvas, sin overlay. Los mínimos tienen margen (el más bajo de entidades, la llama, da 3,71:1, y las entidades principales superan 8:1). Se revisa en las capturas. |
| El texto «3x» de 14 px no cabe dentro del rombo del power-up (radio 12, con pulso de 0,85 a 1).                                | Cálculo de ancho: con pulso mínimo el rombo deja unos 19 px de ancho a la altura del texto, y «3x» mide unos 17 px. Si se sale, se dibuja sin el pulso o con `13px` solo en ese texto, y se anota.            |
| Asteroides pixelados con rotación parpadean (los vértices redondeados saltan de un píxel al otro).                             | Es propio del estilo (la mayoría de los juegos de 8 bits lo tienen). La rotación del asteroide es lenta (máx. 1,2 rad/s). Se revisa en la partida del paso 6.                                                 |
| La pantalla de inicio no cabe a 320 px aun compactada.                                                                         | El paso 5 la mide y trae una salida: ocultar «PRESIONA ESPACIO» en anchos pequeños.                                                                                                                           |
| Cambiar `COLORS` por `SKINS.neon` altera por accidente un color de Neón.                                                       | Hay un criterio de aceptación de uno a uno, y `grep -rn "COLORS" lib/arcade/asteroids/` debe quedar vacío.                                                                                                    |
| Los otros motores se rompen al ampliar el contrato.                                                                            | Todo es opcional (`skins?`, `options?`), y hay un criterio de que `tetris/`, `arkanoid/`, `snake/` y `registry.ts` no cambian.                                                                                |

## Lo que **no** entra en este spec

- Las skins de TETRIS, ARKANOID y SNAKE.
- Skins adicionales o desbloqueables.
- Cambiar la skin durante la partida.
- Skins del sitio (HUD, botones, Biblioteca, Detalle, Hall of Fame).
- Sonido por skin.
- Usar `RETRO_8BIT` en algún juego.
- Cambios de jugabilidad, puntuación o ranking.

Si alguna de estas llega, va en su propio spec.
