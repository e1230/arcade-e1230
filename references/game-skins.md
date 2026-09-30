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

- **Estado:** `[ ]` Pendiente. La trae el spec de skins del primer juego que se pida.
- **Spec:** —
- **Incluye:** `SkinId`, `GameOptions` y `GameDefinition.skins` en `lib/arcade/engine.ts`; `lib/arcade/shared/skins.ts`; selector en `StartScreen`; clave `e1230_skins`; `skin` en `GameCanvas` y `CrtScreen`.

## Resumen

| Estado | ID          | Título         | Clásico | Neón | Retro | Oscuro | Responsive | Spec | Actualizado |
| ------ | ----------- | -------------- | ------- | ---- | ----- | ------ | ---------- | ---- | ----------- |
| `[ ]`  | `arkanoid`  | ARKANOID       | —       | —    | —     | —      | —          | —    | 2026-09-30  |
| `[ ]`  | `tetris`    | TETRIS         | —       | —    | —     | —      | —          | —    | 2026-09-30  |
| `[ ]`  | `snake`     | SNAKE          | —       | —    | —     | —      | —          | —    | 2026-09-30  |
| `[ ]`  | `asteroids` | ASTEROIDS      | —       | —    | —     | —      | —          | —    | 2026-09-30  |
| `[/]`  | `pacman`    | PAC-MAN        | —       | —    | —     | —      | —          | —    | 2026-09-30  |
| `[/]`  | `invaders`  | SPACE INVADERS | —       | —    | —     | —      | —          | —    | 2026-09-30  |
| `[/]`  | `frogger`   | FROGGER        | —       | —    | —     | —      | —          | —    | 2026-09-30  |
| `[/]`  | `galaga`    | GALAGA         | —       | —    | —     | —      | —          | —    | 2026-09-30  |

## Detalle

_(Sin juegos con skins todavía.)_

## Historial de sesiones

_(Sin sesiones todavía.)_
