// Motor de SNAKE: juego diseñado desde cero (SPEC 09), sin referencia que portar.
// Todo el estado de la partida vive en el cierre de `createSnakeEngine`.

import type { GameCallbacks, GameEngine } from "@/lib/arcade/engine";
import { createKeyboard } from "@/lib/arcade/shared/keyboard";
import { randInt } from "@/lib/arcade/shared/math";
import {
  BASE_SPEED,
  BLINK_INTERVAL,
  BODY_INSET,
  CELL,
  COLORS,
  COLS,
  FRUIT_POINTS,
  FRUITS_PER_LEVEL,
  HEAD_INSET,
  HEIGHT,
  INITIAL_LENGTH,
  INITIAL_LIVES,
  MAX_DT,
  MAX_SPEED,
  RESPAWN_DELAY,
  ROWS,
  SCORE_MAX,
  SPEED_STEP,
  START_COL,
  START_ROW,
  TURN_QUEUE_MAX,
  WIDTH,
} from "@/lib/arcade/snake/constants";
import { FRUIT_COUNT, loadFruitSprites } from "@/lib/arcade/snake/sprites";

type Phase = "waiting" | "playing" | "respawning" | "gameover" | "win";
type Direction = "up" | "down" | "left" | "right";

interface Cell {
  col: number; // 0 a COLS − 1
  row: number; // 0 a ROWS − 1
}

interface Fruit extends Cell {
  sprite: number; // índice 0 a FRUIT_COUNT − 1; −1 antes de la primera fruta
}

interface SnakeState {
  phase: Phase;
  snake: Cell[]; // snake[0] es la cabeza
  direction: Direction; // dirección del último paso dado
  turnQueue: Direction[]; // hasta TURN_QUEUE_MAX giros pendientes
  fruit: Fruit;
  stepTimer: number; // s acumulados desde el último paso
  respawnTimer: number; // s transcurridos en "respawning"
  fruitsEaten: number; // se conserva al perder una vida
  score: number;
  lives: number;
  level: number;
}

const DELTAS: Record<Direction, Cell> = {
  up: { col: 0, row: -1 },
  down: { col: 0, row: 1 },
  left: { col: -1, row: 0 },
  right: { col: 1, row: 0 },
};

const OPPOSITES: Record<Direction, Direction> = {
  up: "down",
  down: "up",
  left: "right",
  right: "left",
};

// Orden fijo en el que se procesan las pulsaciones de un mismo frame.
const KEY_BINDINGS: { direction: Direction; codes: string[] }[] = [
  { direction: "up", codes: ["ArrowUp", "KeyW"] },
  { direction: "down", codes: ["ArrowDown", "KeyS"] },
  { direction: "left", codes: ["ArrowLeft", "KeyA"] },
  { direction: "right", codes: ["ArrowRight", "KeyD"] },
];

function speedForLevel(level: number): number {
  return Math.min(MAX_SPEED, BASE_SPEED + (level - 1) * SPEED_STEP);
}

function createInitialState(): SnakeState {
  return {
    phase: "waiting",
    snake: [],
    direction: "right",
    turnQueue: [],
    fruit: { col: 0, row: 0, sprite: -1 },
    stepTimer: 0,
    respawnTimer: 0,
    fruitsEaten: 0,
    score: 0,
    lives: INITIAL_LIVES,
    level: 1,
  };
}

export function createSnakeEngine(
  canvas: HTMLCanvasElement,
  callbacks: GameCallbacks,
): GameEngine {
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("No se pudo obtener el contexto 2D del canvas");

  const keyboard = createKeyboard();
  const sprites = loadFruitSprites();

  let state = createInitialState();
  let rafId: number | null = null;
  let lastTime: number | null = null;
  let destroyed = false;

  // Elige una celda libre y un sprite distinto al de la fruta anterior.
  // Devuelve false si la serpiente ocupa todo el tablero.
  function spawnFruit(): boolean {
    const occupied = new Set(
      state.snake.map(({ col, row }) => row * COLS + col),
    );
    const free: number[] = [];
    for (let index = 0; index < COLS * ROWS; index++) {
      if (!occupied.has(index)) free.push(index);
    }
    if (free.length === 0) return false;

    const cellIndex = free[randInt(0, free.length - 1)];
    const previous = state.fruit.sprite;
    let sprite = randInt(0, previous < 0 ? FRUIT_COUNT - 1 : FRUIT_COUNT - 2);
    if (previous >= 0 && sprite >= previous) sprite += 1;

    state.fruit = {
      col: cellIndex % COLS,
      row: Math.floor(cellIndex / COLS),
      sprite,
    };
    return true;
  }

  // No cambia la fase: la decide quien la llama.
  function resetSnake(): void {
    state.snake = Array.from({ length: INITIAL_LENGTH }, (_, index) => ({
      col: START_COL - index,
      row: START_ROW,
    }));
    state.direction = "right";
    state.turnQueue = [];
    state.stepTimer = 0;
    spawnFruit();
  }

  function finishGame(phase: "gameover" | "win"): void {
    state.phase = phase;
    keyboard.detach();
    callbacks.onGameOver(state.score);
  }

  // Compara con la última dirección prevista, no con la actual, para que dos giros
  // seguidos entre dos pasos (p. ej. ↑ y luego ←) funcionen.
  function pushTurn(direction: Direction): void {
    const { turnQueue } = state;
    if (turnQueue.length >= TURN_QUEUE_MAX) return;
    const last = turnQueue[turnQueue.length - 1] ?? state.direction;
    if (direction === last || direction === OPPOSITES[last]) return;
    turnQueue.push(direction);
  }

  // Lee las pulsaciones del frame. Fuera de "waiting" y "playing" se descartan.
  function readInput(): void {
    for (const { direction, codes } of KEY_BINDINGS) {
      const pressed = codes.map((code) => keyboard.consume(code)).some(Boolean);
      if (!pressed) continue;

      if (state.phase === "waiting") {
        // La reversa (←) no inicia la partida; cualquier otra dirección sí.
        if (direction === OPPOSITES[state.direction]) continue;
        state.phase = "playing";
      } else if (state.phase !== "playing") {
        continue;
      }
      pushTurn(direction);
    }
  }

  function loseLife(): void {
    state.lives -= 1;
    callbacks.onLives(Math.max(0, state.lives));
    if (state.lives <= 0) {
      state.lives = 0;
      finishGame("gameover");
      return;
    }
    resetSnake();
    state.phase = "respawning";
    state.respawnTimer = 0;
  }

  function step(): void {
    const next = state.turnQueue.shift();
    if (next) state.direction = next;

    const delta = DELTAS[state.direction];
    const head = state.snake[0];
    const newHead: Cell = {
      col: head.col + delta.col,
      row: head.row + delta.row,
    };

    if (
      newHead.col < 0 ||
      newHead.col >= COLS ||
      newHead.row < 0 ||
      newHead.row >= ROWS
    ) {
      loseLife();
      return;
    }

    const eating =
      newHead.col === state.fruit.col && newHead.row === state.fruit.row;

    // La cola se libera en este mismo paso, salvo que se coma una fruta.
    const solid = eating ? state.snake : state.snake.slice(0, -1);
    if (
      solid.some(({ col, row }) => col === newHead.col && row === newHead.row)
    ) {
      loseLife();
      return;
    }

    state.snake.unshift(newHead);
    if (!eating) {
      state.snake.pop();
      return;
    }

    state.fruitsEaten += 1;
    state.score = Math.min(SCORE_MAX, state.score + FRUIT_POINTS * state.level);
    callbacks.onScore(state.score);

    const level = 1 + Math.floor(state.fruitsEaten / FRUITS_PER_LEVEL);
    if (level !== state.level) {
      state.level = level;
      callbacks.onLevel(level);
    }

    if (!spawnFruit()) finishGame("win");
  }

  function update(dt: number): void {
    if (!sprites.isReady()) return;

    readInput();

    if (state.phase === "respawning") {
      state.respawnTimer += dt;
      if (state.respawnTimer >= RESPAWN_DELAY) {
        state.phase = "playing";
        state.turnQueue = [];
        state.stepTimer = 0;
      }
      return;
    }

    if (state.phase !== "playing") return;

    // A 16 celdas/s el intervalo (0.0625 s) supera MAX_DT: nunca hay más de un paso por frame.
    state.stepTimer += dt;
    const interval = 1 / speedForLevel(state.level);
    if (state.stepTimer >= interval) {
      state.stepTimer -= interval;
      step();
    }
  }

  function drawGrid(): void {
    ctx!.strokeStyle = COLORS.grid;
    ctx!.lineWidth = 1;
    ctx!.beginPath();
    for (let col = 0; col <= COLS; col++) {
      const x = Math.min(col * CELL, WIDTH - 1) + 0.5;
      ctx!.moveTo(x, 0);
      ctx!.lineTo(x, HEIGHT);
    }
    for (let row = 0; row <= ROWS; row++) {
      const y = Math.min(row * CELL, HEIGHT - 1) + 0.5;
      ctx!.moveTo(0, y);
      ctx!.lineTo(WIDTH, y);
    }
    ctx!.stroke();
  }

  function drawHead(head: Cell): void {
    const size = CELL - 2 * HEAD_INSET;
    const x = head.col * CELL + HEAD_INSET;
    const y = head.row * CELL + HEAD_INSET;

    ctx!.shadowColor = COLORS.body;
    ctx!.shadowBlur = 12;
    ctx!.fillStyle = COLORS.head;
    ctx!.fillRect(x, y, size, size);
    ctx!.shadowBlur = 0;

    // Los ojos van en el lado delantero, uno a cada costado.
    const forward = DELTAS[state.direction];
    const side = { col: -forward.row, row: forward.col };
    const cx = head.col * CELL + CELL / 2;
    const cy = head.row * CELL + CELL / 2;
    for (const sign of [-1, 1]) {
      const ex = cx + forward.col * 8 + side.col * sign * 8;
      const ey = cy + forward.row * 8 + side.row * sign * 8;
      ctx!.fillStyle = COLORS.eye;
      ctx!.fillRect(ex - 3, ey - 3, 6, 6);
      ctx!.fillStyle = COLORS.pupil;
      ctx!.fillRect(ex - 1.5 + forward.col, ey - 1.5 + forward.row, 3, 3);
    }
  }

  function draw(): void {
    ctx!.fillStyle = COLORS.background;
    ctx!.fillRect(0, 0, WIDTH, HEIGHT);
    if (!sprites.isReady()) return;

    drawGrid();
    sprites.drawFruit(
      ctx!,
      state.fruit.sprite,
      state.fruit.col,
      state.fruit.row,
    );

    const blinkHidden =
      state.phase === "respawning" &&
      Math.floor(state.respawnTimer / BLINK_INTERVAL) % 2 !== 0;
    if (blinkHidden || state.snake.length === 0) return;

    ctx!.fillStyle = COLORS.body;
    const bodySize = CELL - 2 * BODY_INSET;
    for (let index = 1; index < state.snake.length; index++) {
      const { col, row } = state.snake[index];
      ctx!.fillRect(
        col * CELL + BODY_INSET,
        row * CELL + BODY_INSET,
        bodySize,
        bodySize,
      );
    }
    drawHead(state.snake[0]);
  }

  function loop(ts: number): void {
    const dt = lastTime === null ? 0 : Math.min((ts - lastTime) / 1000, MAX_DT);
    lastTime = ts;
    update(dt);
    draw();
    rafId = requestAnimationFrame(loop);
  }

  function stopLoop(): void {
    if (rafId !== null) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }
  }

  return {
    start() {
      if (destroyed) return;
      state = createInitialState();
      resetSnake();
      callbacks.onScore(state.score);
      callbacks.onLives(state.lives);
      callbacks.onLevel(state.level);
      keyboard.attach();
      lastTime = null;
      stopLoop();
      rafId = requestAnimationFrame(loop);
    },
    pause() {
      stopLoop();
      keyboard.detach();
    },
    resume() {
      if (destroyed) return;
      // Tras el fin de partida el teclado queda suelto, para que Espacio active los botones del modal
      if (state.phase !== "gameover" && state.phase !== "win") {
        keyboard.attach();
      }
      lastTime = null;
      stopLoop();
      rafId = requestAnimationFrame(loop);
    },
    destroy() {
      destroyed = true;
      stopLoop();
      keyboard.detach();
      sprites.dispose();
    },
  };
}
