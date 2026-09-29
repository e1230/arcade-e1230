// Datos puros de los cinco niveles, con la misma lógica de
// `references/started-games/04-arkanoid/levels.js`. El orden de los bloques
// (fila por fila, de izquierda a derecha) decide cuál se golpea primero.

export type BlockColor =
  "gray" | "red" | "yellow" | "cyan" | "magenta" | "hotpink" | "green";

export interface LevelBlock {
  col: number; // 0 a 9
  row: number; // 0 a 5
  color: BlockColor;
}

export interface Level {
  speed: number; // multiplicador de BASE_BALL_VX y BASE_BALL_VY
  blocks: LevelBlock[];
}

const COLS = 10;
const ROWS = 6;

const ROW_COLORS_1: BlockColor[] = [
  "red",
  "yellow",
  "cyan",
  "magenta",
  "hotpink",
  "green",
];
const ROW_COLORS_2: BlockColor[] = [
  "gray",
  "cyan",
  "hotpink",
  "yellow",
  "magenta",
  "green",
];
const ROW_COLORS_4: BlockColor[] = [
  "cyan",
  "magenta",
  "green",
  "yellow",
  "hotpink",
  "red",
];

// Nivel 1: parrilla completa de 10×6.
function buildLevel1(): LevelBlock[] {
  const blocks: LevelBlock[] = [];
  for (let row = 0; row < ROWS; row++)
    for (let col = 0; col < COLS; col++)
      blocks.push({ col, row, color: ROW_COLORS_1[row] });
  return blocks;
}

// Nivel 2: pirámide.
function buildLevel2(): LevelBlock[] {
  const pyStart = [4, 3, 2, 1, 0, 0];
  const pyEnd = [5, 6, 7, 8, 9, 9];
  const blocks: LevelBlock[] = [];
  for (let row = 0; row < ROWS; row++)
    for (let col = pyStart[row]; col <= pyEnd[row]; col++)
      blocks.push({ col, row, color: ROW_COLORS_2[row] });
  return blocks;
}

// Nivel 3: tablero de ajedrez.
function buildLevel3(): LevelBlock[] {
  const blocks: LevelBlock[] = [];
  for (let row = 0; row < ROWS; row++)
    for (let col = 0; col < COLS; col++)
      if ((col + row) % 2 === 0)
        blocks.push({ col, row, color: row < 3 ? "yellow" : "magenta" });
  return blocks;
}

// Nivel 4: parrilla con huecos fijos por fila.
function buildLevel4(): LevelBlock[] {
  const gaps = [
    [2, 5, 8],
    [0, 4, 7, 9],
    [1, 3, 6],
    [2, 5, 8, 9],
    [0, 4, 7],
    [1, 3, 6, 9],
  ];
  const blocks: LevelBlock[] = [];
  for (let row = 0; row < ROWS; row++)
    for (let col = 0; col < COLS; col++)
      if (!gaps[row].includes(col))
        blocks.push({ col, row, color: ROW_COLORS_4[row] });
  return blocks;
}

// Nivel 5: marco más cruz.
function buildLevel5(): LevelBlock[] {
  const blocks: LevelBlock[] = [];
  for (let row = 0; row < ROWS; row++)
    for (let col = 0; col < COLS; col++) {
      const isFrame = col === 0 || col === 9 || row === 0 || row === 5;
      const isCross = col === 4 || row === 2;
      if (isFrame || isCross)
        blocks.push({
          col,
          row,
          color: isCross && !isFrame ? "hotpink" : "cyan",
        });
    }
  return blocks;
}

export const LEVELS: Level[] = [
  { speed: 1.0, blocks: buildLevel1() },
  { speed: 1.1, blocks: buildLevel2() },
  { speed: 1.21, blocks: buildLevel3() },
  { speed: 1.33, blocks: buildLevel4() },
  { speed: 1.46, blocks: buildLevel5() },
];
