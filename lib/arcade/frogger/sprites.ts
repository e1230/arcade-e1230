// Sprites de la skin Retro de FROGGER: grillas de caracteres de 8×8 píxeles lógicos (el camión, de 16×8).
// Un `.` es transparente y cada letra elige un rol de la skin (ver `render-pixel.ts`). No toca el DOM.

export type Sprite = readonly string[];

// Rana mirando hacia arriba; las otras direcciones se obtienen rotando.
export const FROG_IDLE: Sprite = [
  ".e....e.",
  ".ffffff.",
  "dffffffd",
  ".ffffff.",
  ".ffffff.",
  "dffffffd",
  ".ff..ff.",
  "........",
];
export const FROG_HOP: Sprite = [
  ".e....e.",
  ".ffffff.",
  ".ffffff.",
  ".ffffff.",
  ".ffffff.",
  ".ffffff.",
  "dff..ffd",
  "d......d",
];

// Vehículos mirando a la derecha; a la izquierda se espejan.
export const CAR: Sprite = [
  "........",
  ".ww..ww.",
  "cccccccc",
  "cccckkcc",
  "cccckkcc",
  "cccccccc",
  ".ww..ww.",
  "........",
];
export const RACER: Sprite = [
  "........",
  "........",
  ".ww..ww.",
  "cccckkcc",
  "cccckkcc",
  ".ww..ww.",
  "........",
  "........",
];
export const TRACTOR: Sprite = [
  "........",
  "www.....",
  "wwwcccc.",
  ".ccccccc",
  ".ccccccc",
  "wwwcccc.",
  "www.....",
  "........",
];
export const TRUCK: Sprite = [
  "................",
  ".ww....ww....ww.",
  "ccccccccccc.aaaa",
  "ccccccccccc.aakk",
  "ccccccccccc.aakk",
  "ccccccccccc.aaaa",
  ".ww....ww....ww.",
  "................",
];

// Tortuga mirando a la derecha; una celda por tortuga.
export const TURTLE: Sprite = [
  "........",
  "..rrrr..",
  ".rrrrrr.",
  "rrkrrkrh",
  "rrkrrkrh",
  ".rrrrrr.",
  "..rrrr..",
  "........",
];

// Marca de choque de 5×5, centrada en la celda con un desplazamiento de 1.
export const SPLAT: Sprite = ["x...x", ".x.x.", "..x..", ".x.x.", "x...x"];

// Teselas de 8×8 que se repiten por fila.
export const RIVER_TILE: Sprite = [
  "........",
  ".bb.....",
  "...bb...",
  "........",
  "........",
  ".....bb.",
  "..bb....",
  "........",
];
export const HEDGE_TILE: Sprite = [
  "........",
  ".nn.....",
  ".nn.....",
  "........",
  "........",
  ".....nn.",
  ".....nn.",
  "........",
];

// Un cuarto de vuelta en sentido horario: rotated[x][size − 1 − y] = sprite[y][x]. Solo sprites cuadrados.
export function rotateClockwise(sprite: Sprite): Sprite {
  const size = sprite.length;
  const rows: string[] = [];
  for (let row = 0; row < size; row++) {
    let line = "";
    for (let col = 0; col < size; col++) line += sprite[size - 1 - col][row];
    rows.push(line);
  }
  return rows;
}

// Espejo horizontal: cada fila invertida.
export function mirror(sprite: Sprite): Sprite {
  return sprite.map((line) => [...line].reverse().join(""));
}
