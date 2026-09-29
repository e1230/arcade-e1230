// Constantes de jugabilidad, copiadas sin cambios de `references/started-games/03-tetris/game.js`.
// Los tiempos pasan de milisegundos a segundos.

import type { PieceType } from "@/lib/arcade/tetris/pieces";

export const WIDTH = 800;
export const HEIGHT = 600;

export const COLS = 10;
export const ROWS = 20;

// Puntos por líneas quitadas a la vez (0 a 4), multiplicados por el nivel.
export const LINE_SCORES = [0, 100, 300, 500, 800] as const;
export const SOFT_DROP_POINTS = 1; // por fila bajada
export const HARD_DROP_POINTS = 2; // por fila recorrida

export const LINES_PER_LEVEL = 10; // nivel = floor(líneas / 10) + 1

// Caída automática: max(0.1, 1 − (nivel − 1) × 0.09) s
export const DROP_INTERVAL_START = 1; // s
export const DROP_INTERVAL_STEP = 0.09; // s por nivel
export const DROP_INTERVAL_MIN = 0.1; // s

export const ROTATION_KICKS = [0, -1, 1, -2, 2] as const; // columnas

export const SCORE_MAX = 9_999_999; // tope del CHECK de `scores`

export const MAX_DT = 0.05; // s, tope del salto de tiempo por frame

// Autorrepetición propia (no está en la referencia, que usa la del sistema operativo).
export const DAS_DELAY = 0.17; // s de espera antes de repetir ← →
export const DAS_REPEAT = 0.05; // s entre repeticiones de ← →
export const SOFT_DROP_REPEAT = 0.05; // s entre soft drops con ↓ sostenida

// Encuadre en la resolución interna de 800×600 (la referencia usa celdas de 30 px).
export const BLOCK = 28; // px por celda
export const BOARD_X = 260; // tablero de 280×560 centrado
export const BOARD_Y = 20;
export const PANEL_X = 580;
export const NEXT_LABEL_Y = 34; // línea base
export const NEXT_BOX_Y = 48;
export const NEXT_BOX_CELLS = 4; // caja de 112×112
export const LINES_LABEL_Y = 200; // línea base
export const LINES_VALUE_Y = 236; // línea base

export const BLOCK_FILL_ALPHA = 0.35;
export const GHOST_ALPHA = 0.35;
export const GLOW_BLUR = 8;

// Colores del canvas, espejo de los tokens de `app/globals.css`.
export const COLORS = {
  background: "#05050a", // --deep
  board: "#0d0d15", // --surface
  grid: "#2a2a38", // --border
  frame: "rgba(0, 245, 255, 0.25)", // --border-neon
  label: "#8a9bb0", // --muted
  value: "#e6f7ff", // --foreground
} as const;

// Un color por tipo de pieza, como el arreglo COLORS de game.js
export const PIECE_COLORS: Record<PieceType, string> = {
  1: "#00f5ff", // I — --neon-cyan
  2: "#f5ff00", // O — --neon-yellow
  3: "#b026ff", // T — --neon-purple
  4: "#00ff88", // S — --neon-green
  5: "#ff006e", // Z — --neon-pink
  6: "#d6e2ee", // J — --silver
  7: "#ff8c42", // L — --bronze
  8: "#6d7d90", // tuerca — --subtle
};
