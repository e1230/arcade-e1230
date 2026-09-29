// Constantes de jugabilidad de SNAKE. No hay referencia que portar: son los valores acordados en el SPEC 09.
// Los tiempos van en segundos.

export const WIDTH = 800;
export const HEIGHT = 600;

export const CELL = 40; // px por celda
export const COLS = 20;
export const ROWS = 15; // 300 celdas en total

export const INITIAL_LENGTH = 3; // celdas
export const START_COL = 10; // celda de la cabeza; el cuerpo ocupa (9, 7) y (8, 7)
export const START_ROW = 7;
export const INITIAL_LIVES = 3;

export const FRUITS_PER_LEVEL = 5; // nivel = 1 + floor(frutas comidas / 5)

// Velocidad: min(MAX_SPEED, BASE_SPEED + (nivel − 1) × SPEED_STEP) celdas/s.
export const BASE_SPEED = 8;
export const SPEED_STEP = 1;
export const MAX_SPEED = 16; // se alcanza en el nivel 9

export const FRUIT_POINTS = 10; // por fruta, multiplicado por el nivel

export const TURN_QUEUE_MAX = 2; // giros guardados entre dos pasos

export const RESPAWN_DELAY = 1.5; // s de espera tras perder una vida
export const BLINK_INTERVAL = 0.15; // s entre parpadeos al reaparecer

export const FRUIT_BOX = 32; // px, recuadro de la fruta centrado en la celda
export const BODY_INSET = 3; // px de margen del cuerpo dentro de su celda
export const HEAD_INSET = 2; // px de margen de la cabeza dentro de su celda

export const FRUIT_SPRITESHEET_URL = "/arcade/snake/fruits.png";

export const SCORE_MAX = 9_999_999; // tope del CHECK de `scores`

export const MAX_DT = 0.05; // s, tope del salto de tiempo por frame

// Espejo de los tokens de `app/globals.css`: el canvas no puede leer clases de Tailwind.
export const COLORS = {
  background: "#05050a", // --deep
  grid: "#1a1a26", // --surface-3
  body: "#ff006e", // --neon-pink
  head: "#ff5c9e", // tono más claro del rosa, derivado de --neon-pink
  eye: "#e6f7ff", // --foreground
  pupil: "#05050a", // --deep
} as const;
