// Constantes de jugabilidad, copiadas sin cambios de `references/started-games/04-arkanoid/game.js`.
// Los tiempos pasan de milisegundos a segundos.

export const WIDTH = 800;
export const HEIGHT = 600;

export const PADDLE_SPEED = 400; // px/s
export const PADDLE_W = 81; // el sprite de 162×14 se dibuja a la mitad de ancho
export const PADDLE_H = 14;
export const PADDLE_Y = 560;

export const BALL_SIZE = 16;
export const PADDLE_BOUNCE_TOLERANCE = 8; // px bajo la cara superior de la paleta para rebotar

export const BLOCK_W = 64;
export const BLOCK_H = 24;
export const BLOCK_COLS = 10;
export const BLOCKS_ORIGIN_X = (WIDTH - BLOCK_COLS * BLOCK_W) / 2; // 80
export const BLOCKS_ORIGIN_Y = 80;

// Velocidad inicial de la bola, multiplicada por `speed` del nivel.
export const BASE_BALL_VX = 200; // px/s
export const BASE_BALL_VY = -300; // px/s

export const BLOCK_POINTS = 10;
export const INITIAL_LIVES = 3;

export const EXPLOSION_DURATION = 0.15; // s (150 ms en la referencia)
export const EXPLOSION_FRAME_COUNT = 4;

export const SCORE_MAX = 9_999_999; // tope del CHECK de `scores`

export const MAX_DT = 0.05; // s, tope del salto de tiempo por frame

// Nuevas, no están en la referencia: los assets viven en `public/arcade/arkanoid/`.
export const SPRITESHEET_URL = "/arcade/arkanoid/spritesheet-breakout.png";
export const BOUNCE_SOUND_URL = "/arcade/arkanoid/ball-bounce.mp3";
export const BREAK_SOUND_URL = "/arcade/arkanoid/break-sound.mp3";

// Espejo de un token de `app/globals.css`: el canvas no puede leer clases de Tailwind.
export const COLORS = {
  background: "#05050a", // --deep
} as const;
