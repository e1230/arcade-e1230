// Piezas del juego, portadas de `references/started-games/03-tetris/game.js`.
// Son datos y funciones puras: no guardan estado de módulo.

import { COLS } from "@/lib/arcade/tetris/constants";

export type PieceType = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8; // I, O, T, S, Z, J, L, tuerca
export type Cell = 0 | PieceType; // 0 = celda vacía
export type Shape = Cell[][];

export interface ActivePiece {
  type: PieceType;
  shape: Shape;
  x: number; // columna de la esquina superior izquierda de la matriz
  y: number; // fila de la esquina superior izquierda de la matriz
}

export const PIECE_COUNT = 8;

// Matrices copiadas de PIECES en game.js
export const PIECES: Record<PieceType, Shape> = {
  1: [
    [0, 0, 0, 0],
    [1, 1, 1, 1],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
  ], // I
  2: [
    [2, 2],
    [2, 2],
  ], // O
  3: [
    [0, 3, 0],
    [3, 3, 3],
    [0, 0, 0],
  ], // T
  4: [
    [0, 4, 4],
    [4, 4, 0],
    [0, 0, 0],
  ], // S
  5: [
    [5, 5, 0],
    [0, 5, 5],
    [0, 0, 0],
  ], // Z
  6: [
    [6, 0, 0],
    [6, 6, 6],
    [0, 0, 0],
  ], // J
  7: [
    [0, 0, 7],
    [7, 7, 7],
    [0, 0, 0],
  ], // L
  8: [
    [8, 8, 8],
    [8, 0, 8],
    [8, 8, 8],
  ], // tuerca
};

// Copia la matriz y centra la pieza arriba del tablero (igual que randomPiece de game.js)
export function createPiece(type: PieceType): ActivePiece {
  const shape = PIECES[type].map((row) => [...row]);
  return {
    type,
    shape,
    x: Math.floor(COLS / 2) - Math.floor(shape[0].length / 2),
    y: 0,
  };
}
