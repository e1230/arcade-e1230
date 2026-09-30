# Skins de los juegos

Registro de qué juegos de Arcade E1230 tienen las tres skins obligatorias: **Clásico** (por defecto), **Neón** y **Retro**. Lo mantiene el subagente `skin-designer` (`.claude/agents/skin-designer.md`), que lo lee antes de trabajar y lo actualiza después. Se puede editar a mano.

Última actualización: 2026-09-30

Estados: `[ ]` Sin skins · `[~]` En spec · `[x]` Implementado · `[/]` Sin motor (no aplica todavía)

## Skins obligatorias

| Skin    | `SkinId`  | Qué es                                                                              | Reglas propias                                                                                             |
| ------- | --------- | ----------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| Clásico | `classic` | La estética del arcade original de cada juego. Es la skin por defecto.              | Sin glow. Si el original tenía fondo claro, se invierte a una versión oscura.                              |
| Neón    | `neon`    | El look neón de la plataforma, con los tokens de `app/globals.css` y glow.          | En los motores vectoriales es idéntica al `COLORS` actual. En los de sprites se diseña vectorial.          |
| Retro   | `retro`   | Fósforo de monitor CRT o paleta 8-bit limitada, con pixel art y scanlines marcadas. | Solo colores de `RETRO_PHOSPHOR` o `RETRO_8BIT`. Scanlines en CSS y canvas con `image-rendering: pixelated`. |

Reglas comunes a las tres:

- **Modo oscuro:** fondo del canvas con luminancia ≤ 0,0110 (la de `--surface-3`), entidades ≥ 3:1 contra el fondo, texto del canvas ≥ 4,5:1 y glow solo en Neón.
- **Responsive:** canvas de 800×600 escalado por CSS, trazos ≥ 2 px y texto ≥ 14 px internos, y selector sin desbordes a 320, 375, 768 y 1280 px.

La skin se elige en la pantalla de inicio del Reproductor y se recuerda por juego en `localStorage` (`e1230_skins`).

## Base común

- **Estado:** `[~]` En spec. La trae el spec de skins de `asteroids`, el primer juego pedido.
- **Spec:** `specs/10-asteroids-skins.md` (Borrador)
- **Incluye:** `SkinId`, `GameOptions` y `GameDefinition.skins` en `lib/arcade/engine.ts`; `lib/arcade/shared/skins.ts`; selector en `StartScreen`; clave `e1230_skins`; `skin` en `GameCanvas` y `CrtScreen`.

## Resumen

| Estado | ID          | Título         | Clásico | Neón | Retro | Oscuro | Responsive | Spec | Actualizado |
| ------ | ----------- | -------------- | ------- | ---- | ----- | ------ | ---------- | ---- | ----------- |
| `[ ]`  | `arkanoid`  | ARKANOID       | —       | —    | —     | —      | —          | —    | 2026-09-30  |
| `[ ]`  | `tetris`    | TETRIS         | —       | —    | —     | —      | —          | —    | 2026-09-30  |
| `[ ]`  | `snake`     | SNAKE          | —       | —    | —     | —      | —          | —    | 2026-09-30  |
| `[~]`  | `asteroids` | ASTEROIDS      | Blanco sobre negro | `COLORS` actual | Fósforo verde | Medido en spec (2026-09-30) | Por verificar | `specs/10-asteroids-skins.md` (Borrador) | 2026-09-30  |
| `[/]`  | `pacman`    | PAC-MAN        | —       | —    | —     | —      | —          | —    | 2026-09-30  |
| `[/]`  | `invaders`  | SPACE INVADERS | —       | —    | —     | —      | —          | —    | 2026-09-30  |
| `[/]`  | `frogger`   | FROGGER        | —       | —    | —     | —      | —          | —    | 2026-09-30  |
| `[/]`  | `galaga`    | GALAGA         | —       | —    | —     | —      | —          | —    | 2026-09-30  |

## Detalle

### `asteroids` — ASTEROIDS

- **Estado:** `[~]` En spec · **Spec:** `specs/10-asteroids-skins.md` (Borrador, incluye la base común)
- **Clásico:** vector blanco sobre negro, como la máquina de Atari de 1979 y el port de `references/started-games/02-asteroids/game.js` (`#000`, `#fff`, power-up `#0ff`, llama `rgba(255,130,0,.85)`). Sin glow.
- **Neón:** el `COLORS` actual sin cambiar un color (cian, rosa, amarillo, verde, bronce sobre `--deep`), con glow `shadowBlur` 8.
- **Retro:** fósforo verde `RETRO_PHOSPHOR`, dibujado en un búfer de 200×150 ampliado 4× (pixel art con Bresenham), scanlines en CSS.
- **Contraste mínimo:** Clásico 6,22:1 (llama; texto 16,75:1) · Neón 5,30:1 (asteroides; texto 15,17:1) · Retro 3,71:1 (llama; texto 15,21:1)
- **Historial:**
  - 2026-09-30 — Spec de skins escrito (con la base común).

## Historial de sesiones

- 2026-09-30 — «skins para asteroids» (modo aplicar): escrito `specs/10-asteroids-skins.md` en Borrador, con la base común; el registro pasa la base y `asteroids` a `[~]`.
