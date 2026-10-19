// Dibujo del tablero, las piezas y el panel en la resolución interna de 800×600.
// Cada función deja `globalAlpha = 1` al terminar. El glow de la pieza activa va horneado
// en sprites (`createPieceSprites`), así que el contexto principal nunca recibe `shadowBlur`.

import {
  BLOCK,
  BLOCK_FILL_ALPHA,
  BOARD_X,
  BOARD_Y,
  COLORS,
  COLS,
  GHOST_ALPHA,
  GLOW_BLUR,
  LINES_LABEL_Y,
  LINES_VALUE_Y,
  NEXT_BOX_CELLS,
  NEXT_BOX_Y,
  NEXT_LABEL_Y,
  PANEL_X,
  PIECE_COLORS,
  ROWS,
} from "@/lib/arcade/tetris/constants";
import type { Board } from "@/lib/arcade/tetris/board";
import type { ActivePiece, PieceType, Shape } from "@/lib/arcade/tetris/pieces";

const BOARD_WIDTH = COLS * BLOCK; // 280 px
const BOARD_HEIGHT = ROWS * BLOCK; // 560 px
const NEXT_BOX_SIZE = NEXT_BOX_CELLS * BLOCK; // 112 px

// Margen alrededor de la celda para que el blur no se recorte (el glow de 8 px llega a ~12 px)
const GLOW_PAD = 16;
const SPRITE_SIZE = BLOCK + GLOW_PAD * 2; // 60 px

// Una celda con relleno, borde y glow horneados por tipo de pieza (1 a 8)
export type PieceSprites = Record<PieceType, HTMLCanvasElement>;

// Celda en (x, y) px: relleno translúcido y borde de 2 px, o solo el borde tenue si es fantasma
function drawCell(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  type: PieceType,
  ghost: boolean,
): void {
  const color = PIECE_COLORS[type];
  if (!ghost) {
    ctx.globalAlpha = BLOCK_FILL_ALPHA;
    ctx.fillStyle = color;
    ctx.fillRect(x + 1, y + 1, BLOCK - 2, BLOCK - 2);
  }
  ctx.globalAlpha = ghost ? GHOST_ALPHA : 1;
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.strokeRect(x + 2, y + 2, BLOCK - 4, BLOCK - 4);
  ctx.globalAlpha = 1;
}

// Dibuja las celdas ocupadas de una matriz con su esquina superior izquierda en (left, top) px
function drawShape(
  ctx: CanvasRenderingContext2D,
  shape: Shape,
  left: number,
  top: number,
  ghost: boolean,
): void {
  for (let r = 0; r < shape.length; r++) {
    for (let c = 0; c < shape[r].length; c++) {
      const cell = shape[r][c];
      if (cell) drawCell(ctx, left + c * BLOCK, top + r * BLOCK, cell, ghost);
    }
  }
}

// Marco de 1 px por fuera del rectángulo
function drawFrame(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
): void {
  ctx.strokeStyle = COLORS.frame;
  ctx.lineWidth = 1;
  ctx.strokeRect(x - 0.5, y - 0.5, width + 1, height + 1);
}

// Fondo del tablero, grilla, celdas fijadas (sin glow) y marco
export function drawBoard(ctx: CanvasRenderingContext2D, board: Board): void {
  ctx.fillStyle = COLORS.board;
  ctx.fillRect(BOARD_X, BOARD_Y, BOARD_WIDTH, BOARD_HEIGHT);

  ctx.strokeStyle = COLORS.grid;
  ctx.lineWidth = 0.5;
  ctx.beginPath();
  for (let c = 1; c < COLS; c++) {
    ctx.moveTo(BOARD_X + c * BLOCK, BOARD_Y);
    ctx.lineTo(BOARD_X + c * BLOCK, BOARD_Y + BOARD_HEIGHT);
  }
  for (let r = 1; r < ROWS; r++) {
    ctx.moveTo(BOARD_X, BOARD_Y + r * BLOCK);
    ctx.lineTo(BOARD_X + BOARD_WIDTH, BOARD_Y + r * BLOCK);
  }
  ctx.stroke();

  drawShape(ctx, board, BOARD_X, BOARD_Y, false);
  drawFrame(ctx, BOARD_X, BOARD_Y, BOARD_WIDTH, BOARD_HEIGHT);
}

// Fantasma: solo el contorno de la pieza en la fila donde aterrizaría
export function drawGhost(
  ctx: CanvasRenderingContext2D,
  piece: ActivePiece,
  y: number,
): void {
  drawShape(
    ctx,
    piece.shape,
    BOARD_X + piece.x * BLOCK,
    BOARD_Y + y * BLOCK,
    true,
  );
}

// Una celda con glow horneado por tipo de pieza; se llama una sola vez en `create`
export function createPieceSprites(): PieceSprites {
  const sprites = {} as PieceSprites;
  for (const key of Object.keys(PIECE_COLORS)) {
    const type = Number(key) as PieceType;
    const sprite = document.createElement("canvas");
    sprite.width = SPRITE_SIZE;
    sprite.height = SPRITE_SIZE;
    const spriteCtx = sprite.getContext("2d");
    if (!spriteCtx)
      throw new Error("No se pudo obtener el contexto 2d del sprite");
    spriteCtx.shadowBlur = GLOW_BLUR;
    spriteCtx.shadowColor = PIECE_COLORS[type];
    drawCell(spriteCtx, GLOW_PAD, GLOW_PAD, type, false); // mismo dibujo que en vivo
    sprites[type] = sprite;
  }
  return sprites;
}

// Pieza que cae: una celda precalculada con glow por celda ocupada, sin shadowBlur en el loop
export function drawPiece(
  ctx: CanvasRenderingContext2D,
  piece: ActivePiece,
  sprites: PieceSprites,
): void {
  const left = BOARD_X + piece.x * BLOCK - GLOW_PAD;
  const top = BOARD_Y + piece.y * BLOCK - GLOW_PAD;
  for (let r = 0; r < piece.shape.length; r++) {
    for (let c = 0; c < piece.shape[r].length; c++) {
      const cell = piece.shape[r][c];
      if (cell) ctx.drawImage(sprites[cell], left + c * BLOCK, top + r * BLOCK);
    }
  }
}

// Panel derecho: SIGUIENTE con la próxima pieza centrada en su caja y LÍNEAS
export function drawPanel(
  ctx: CanvasRenderingContext2D,
  next: ActivePiece,
  lines: number,
): void {
  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";
  ctx.font = "14px monospace";
  ctx.fillStyle = COLORS.label;
  ctx.fillText("SIGUIENTE", PANEL_X, NEXT_LABEL_Y);
  ctx.fillText("LÍNEAS", PANEL_X, LINES_LABEL_Y);

  ctx.fillStyle = COLORS.board;
  ctx.fillRect(PANEL_X, NEXT_BOX_Y, NEXT_BOX_SIZE, NEXT_BOX_SIZE);
  drawFrame(ctx, PANEL_X, NEXT_BOX_Y, NEXT_BOX_SIZE, NEXT_BOX_SIZE);

  // Centrada como drawNext de game.js
  const offX = Math.floor((NEXT_BOX_CELLS - next.shape[0].length) / 2);
  const offY = Math.floor((NEXT_BOX_CELLS - next.shape.length) / 2);
  drawShape(
    ctx,
    next.shape,
    PANEL_X + offX * BLOCK,
    NEXT_BOX_Y + offY * BLOCK,
    false,
  );

  ctx.font = "bold 28px monospace";
  ctx.fillStyle = COLORS.value;
  ctx.fillText(String(lines), PANEL_X, LINES_VALUE_Y);
}
