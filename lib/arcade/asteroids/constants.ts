// Constantes de jugabilidad, copiadas sin cambios de `references/started-games/02-asteroids/game.js`.

export const WIDTH = 800;
export const HEIGHT = 600;

// Por tamaño de asteroide: 1 (pequeño), 2 (mediano), 3 (grande).
export const RADII = [0, 16, 30, 50] as const;
export const SPEEDS = [0, 85, 55, 32] as const;
export const POINTS = [0, 100, 50, 20] as const;

export const SHIP_ROTATION_SPEED = 3.5; // rad/s
export const SHIP_THRUST = 260; // px/s²
export const SHIP_DRAG = 0.987;
export const SHIP_RADIUS = 12;

export const SHIP_INVINCIBILITY_DURATION = 3; // s al reaparecer
export const SHIP_RESPAWN_DELAY = 2; // s de espera tras morir

export const BULLET_SPEED = 520; // px/s
export const BULLET_TTL = 1.1; // s
export const BULLET_COOLDOWN = 0.2; // s

export const POWERUP_DROP_CHANCE = 0.15;
export const POWERUP_GUARANTEED_KILLS = 5;
export const POWERUP_DURATION = 5; // s de disparo triple
export const POWERUP_TTL = 12; // s antes de desaparecer

export const TRIPLE_SPREAD = 0.18; // rad

export const SHIP_INITIAL_LIVES = 3;
export const INITIAL_ASTEROIDS = 4;
export const ASTEROIDS_PER_LEVEL_OFFSET = 3; // asteroides por nivel = 3 + nivel

export const SAFE_SPAWN_DISTANCE = 130; // px al centro del canvas

export const MAX_DT = 0.05; // s, tope del salto de tiempo por frame

export const SHIP_ASTEROID_COLLISION_FACTOR = 0.82;

// Colores del canvas, espejo de los tokens de `app/globals.css`.
export const COLORS = {
  background: "#05050a", // --deep
  ship: "#00f5ff", // --neon-cyan
  asteroid: "#ff006e", // --neon-pink
  bullet: "#f5ff00", // --neon-yellow
  powerUp: "#00ff88", // --neon-green
  flame: "#ff8c42", // --bronze
  particle: "255, 0, 110", // rosa en RGB para el alfa que se desvanece
} as const;
