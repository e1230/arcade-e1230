// Contrato que sigue cualquier juego con motor real dentro del Reproductor.

export interface GameCallbacks {
  onScore(score: number): void;
  onLives(lives: number): void;
  onLevel(level: number): void;
  onGameOver(finalScore: number): void; // se llama una sola vez por partida
}

export interface GameEngine {
  start(): void; // emite los valores iniciales y arranca el loop
  pause(): void; // detiene el loop y suelta el teclado
  resume(): void; // reanuda sin salto de dt
  destroy(): void; // cancela el loop y quita todos los listeners
}

export interface GameControl {
  keys: string; // texto visible, p. ej. "← →"
  action: string; // p. ej. "ROTAR"
}

export interface GameDefinition {
  width: number; // resolución interna del canvas
  height: number;
  controls: GameControl[];
  create(canvas: HTMLCanvasElement, callbacks: GameCallbacks): GameEngine;
}
