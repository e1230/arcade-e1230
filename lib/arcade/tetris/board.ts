// Modelo del tablero, portado de `references/started-games/03-tetris/game.js`.
// Son funciones puras sobre el tablero y las piezas que reciben: no guardan estado de módulo.

import { COLS, ROWS } from "@/lib/arcade/tetris/constants";
import type { ActivePiece, Cell, Shape } from "@/lib/arcade/tetris/pieces";

export type Board = Cell[][]; // ROWS × COLS

function createRow(): Cell[] {
  return new Array<Cell>(COLS).fill(0);
}

export function createBoard(): Board {
  return Array.from({ length: ROWS }, createRow);
}

// true si alguna celda sale por los lados o el fondo, o cae sobre una celda ocupada;
// las celdas con fila < 0 no se comparan con el tablero (igual que collide de game.js)
export function collide(
  board: Board,
  shape: Shape,
  x: number,
  y: number,
): boolean {
  for (let r = 0; r < shape.length; r++) {
    for (let c = 0; c < shape[r].length; c++) {
      if (!shape[r][c]) continue;
      const nx = x + c;
      const ny = y + r;
      if (nx < 0 || nx >= COLS || ny >= ROWS) return true;
      if (ny >= 0 && board[ny][nx]) return true;
    }
  }
  return false;
}

// Rotación horaria: transpuesta + filas invertidas
export function rotateCW(shape: Shape): Shape {
  const rows = shape.length;
  const cols = shape[0].length;
  const result: Shape = Array.from({ length: cols }, () =>
    new Array<Cell>(rows).fill(0),
  );
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      result[c][rows - 1 - r] = shape[r][c];
    }
  }
  return result;
}

// Fija la pieza en el tablero
export function merge(board: Board, piece: ActivePiece): void {
  for (let r = 0; r < piece.shape.length; r++) {
    for (let c = 0; c < piece.shape[r].length; c++) {
      const cell = piece.shape[r][c];
      if (cell) board[piece.y + r][piece.x + c] = cell;
    }
  }
}

// Recorre de abajo hacia arriba, quita cada fila llena e inserta una vacía arriba; devuelve cuántas quitó
export function clearFullRows(board: Board): number {
  let cleared = 0;
  for (let r = ROWS - 1; r >= 0; r--) {
    if (board[r].every((cell) => cell !== 0)) {
      board.splice(r, 1);
      board.unshift(createRow());
      cleared++;
      r++; // vuelve a revisar la misma fila, que ahora tiene la de arriba
    }
  }
  return cleared;
}

// Fila donde aterrizaría la pieza si cayera en línea recta
export function ghostY(board: Board, piece: ActivePiece): number {
  let y = piece.y;
  while (!collide(board, piece.shape, piece.x, y + 1)) y++;
  return y;
}
