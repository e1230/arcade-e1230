// Motor de Tetris, portado de `references/started-games/03-tetris/game.js`.
// Todo el estado de la partida vive en el cierre de `createTetrisEngine`.

import type { GameCallbacks, GameEngine } from "@/lib/arcade/engine";
import { createKeyboard } from "@/lib/arcade/shared/keyboard";
import { randInt } from "@/lib/arcade/shared/math";
import {
  clearFullRows,
  collide,
  createBoard,
  ghostY,
  merge,
  rotateCW,
  type Board,
} from "@/lib/arcade/tetris/board";
import {
  COLORS,
  DAS_DELAY,
  DAS_REPEAT,
  DROP_INTERVAL_MIN,
  DROP_INTERVAL_START,
  DROP_INTERVAL_STEP,
  HARD_DROP_POINTS,
  HEIGHT,
  LINE_SCORES,
  LINES_PER_LEVEL,
  MAX_DT,
  ROTATION_KICKS,
  SCORE_MAX,
  SOFT_DROP_POINTS,
  SOFT_DROP_REPEAT,
  WIDTH,
} from "@/lib/arcade/tetris/constants";
import {
  createPiece,
  PIECE_COUNT,
  type ActivePiece,
  type PieceType,
} from "@/lib/arcade/tetris/pieces";
import { drawBoard, drawPanel, drawPiece } from "@/lib/arcade/tetris/render";

type Phase = "playing" | "gameover"; // game.js usa los flags paused y gameOver; la pausa ahora es de la plataforma

interface TetrisState {
  phase: Phase;
  board: Board;
  current: ActivePiece;
  next: ActivePiece;
  score: number;
  lines: number;
  level: number;
  dropInterval: number; // s entre caídas automáticas
  dropTimer: number; // s acumulados desde la última caída (dropAccum de game.js)
  shiftDirection: -1 | 0 | 1; // dirección que repite la autorrepetición; 0 = ninguna
  shiftTimer: number; // s sostenidos en esa dirección
  softDropTimer: number; // s sostenidos con ↓
}

// Azar uniforme entre las 8 piezas, como Math.floor(Math.random() * 8) + 1 de game.js
function randomPiece(): ActivePiece {
  return createPiece(randInt(1, PIECE_COUNT) as PieceType);
}

// max(0.1, 1 − (nivel − 1) × 0.09) s
function dropIntervalFor(level: number): number {
  return Math.max(
    DROP_INTERVAL_MIN,
    DROP_INTERVAL_START - (level - 1) * DROP_INTERVAL_STEP,
  );
}

export function createTetrisEngine(
  canvas: HTMLCanvasElement,
  callbacks: GameCallbacks,
): GameEngine {
  const context2d = canvas.getContext("2d");
  if (!context2d)
    throw new Error("No se pudo obtener el contexto 2d del canvas");
  const ctx: CanvasRenderingContext2D = context2d;

  const keyboard = createKeyboard();

  let state: TetrisState = createInitialState();
  let rafId: number | null = null;
  let lastTime: number | null = null;

  function createInitialState(): TetrisState {
    return {
      phase: "playing",
      board: createBoard(),
      current: randomPiece(),
      next: randomPiece(),
      score: 0,
      lines: 0,
      level: 1,
      dropInterval: dropIntervalFor(1),
      dropTimer: 0,
      shiftDirection: 0,
      shiftTimer: 0,
      softDropTimer: 0,
    };
  }

  // Suma con tope SCORE_MAX y avisa al HUD solo si la puntuación cambió
  function addScore(points: number): void {
    const score = Math.min(SCORE_MAX, state.score + points);
    if (score === state.score) return;
    state.score = score;
    callbacks.onScore(score);
  }

  // Función y no comparación directa: TypeScript no sabe que lockPiece() puede cambiar la fase
  function isGameOver(): boolean {
    return state.phase === "gameover";
  }

  function endGame(): void {
    if (isGameOver()) return;
    state.phase = "gameover";
    keyboard.detach();
    callbacks.onGameOver(state.score);
  }

  function spawn(): void {
    state.current = state.next;
    state.next = randomPiece();
    const { shape, x, y } = state.current;
    if (collide(state.board, shape, x, y)) endGame();
  }

  function lockPiece(): void {
    merge(state.board, state.current);
    const cleared = clearFullRows(state.board);
    if (cleared > 0) {
      state.lines += cleared;
      addScore(LINE_SCORES[cleared] * state.level); // con el nivel de antes de subir
      const level = Math.floor(state.lines / LINES_PER_LEVEL) + 1;
      if (level !== state.level) {
        state.level = level;
        callbacks.onLevel(level);
      }
      state.dropInterval = dropIntervalFor(state.level);
    }
    spawn();
  }

  // Prueba la rotación con cada desplazamiento de ROTATION_KICKS y se queda con el primero que no choca
  function tryRotate(): void {
    const rotated = rotateCW(state.current.shape);
    for (const kick of ROTATION_KICKS) {
      if (
        !collide(state.board, rotated, state.current.x + kick, state.current.y)
      ) {
        state.current.shape = rotated;
        state.current.x += kick;
        return;
      }
    }
  }

  function tryShift(direction: -1 | 1): void {
    const { shape, x, y } = state.current;
    if (!collide(state.board, shape, x + direction, y)) {
      state.current.x += direction;
    }
  }

  // Baja una fila o fija la pieza si ya no puede bajar (softDrop de game.js)
  function softDrop(): void {
    const { shape, x, y } = state.current;
    if (!collide(state.board, shape, x, y + 1)) {
      state.current.y++;
      addScore(SOFT_DROP_POINTS);
    } else {
      lockPiece();
    }
  }

  function hardDrop(): void {
    const landing = ghostY(state.board, state.current);
    addScore((landing - state.current.y) * HARD_DROP_POINTS);
    state.current.y = landing;
    lockPiece();
  }

  function updateShift(dt: number): void {
    if (keyboard.consume("ArrowLeft")) {
      tryShift(-1);
      state.shiftDirection = -1;
      state.shiftTimer = 0;
    }
    if (keyboard.consume("ArrowRight")) {
      tryShift(1);
      state.shiftDirection = 1;
      state.shiftTimer = 0;
    }
    if (state.shiftDirection === 0) return;

    const heldCode = state.shiftDirection < 0 ? "ArrowLeft" : "ArrowRight";
    if (!keyboard.isDown(heldCode)) {
      state.shiftDirection = 0;
      return;
    }
    state.shiftTimer += dt;
    while (state.shiftTimer >= DAS_DELAY) {
      tryShift(state.shiftDirection);
      state.shiftTimer -= DAS_REPEAT;
    }
  }

  function updateSoftDrop(dt: number): void {
    if (keyboard.consume("ArrowDown")) {
      softDrop();
      state.softDropTimer = 0;
      return;
    }
    if (!keyboard.isDown("ArrowDown")) return;
    state.softDropTimer += dt;
    while (state.softDropTimer >= SOFT_DROP_REPEAT && !isGameOver()) {
      softDrop();
      state.softDropTimer -= SOFT_DROP_REPEAT;
    }
  }

  function update(dt: number): void {
    if (isGameOver()) return;

    // 1. Rotar: cada pulsación de ↑ o X rota una vez
    if (keyboard.consume("ArrowUp")) tryRotate();
    if (keyboard.consume("KeyX")) tryRotate();

    // 2. Mover, con autorrepetición mientras se sostiene la tecla
    updateShift(dt);

    // 3. Bajar (soft drop), con autorrepetición mientras se sostiene ↓
    updateSoftDrop(dt);
    if (isGameOver()) return;

    // 4. Caída (hard drop)
    if (keyboard.consume("Space")) {
      hardDrop();
      if (isGameOver()) return;
    }

    // 5. Gravedad
    state.dropTimer += dt;
    if (state.dropTimer >= state.dropInterval) {
      state.dropTimer = 0;
      const { shape, x, y } = state.current;
      if (!collide(state.board, shape, x, y + 1)) state.current.y++;
      else lockPiece();
    }
  }

  function draw(): void {
    ctx.fillStyle = COLORS.background;
    ctx.fillRect(0, 0, WIDTH, HEIGHT);

    drawBoard(ctx, state.board);
    // En "gameover" no hay fantasma: la pieza que no cupo queda superpuesta
    if (state.phase === "playing") {
      const landing = ghostY(state.board, state.current);
      drawPiece(ctx, { ...state.current, y: landing }, "ghost");
    }
    drawPiece(ctx, state.current, "active");
    drawPanel(ctx, state.next, state.lines);
  }

  function loop(ts: number): void {
    const dt = lastTime === null ? 0 : Math.min((ts - lastTime) / 1000, MAX_DT);
    lastTime = ts;
    update(dt);
    draw();
    rafId = requestAnimationFrame(loop);
  }

  return {
    start() {
      state = createInitialState();
      callbacks.onScore(state.score);
      callbacks.onLevel(state.level);
      keyboard.attach();
      lastTime = null;
      rafId = requestAnimationFrame(loop);
    },
    pause() {
      if (rafId !== null) {
        cancelAnimationFrame(rafId);
        rafId = null;
      }
      keyboard.detach();
    },
    resume() {
      // Tras el fin de partida el teclado queda suelto, para que Espacio active los botones del modal
      if (state.phase === "playing") keyboard.attach();
      lastTime = null;
      rafId = requestAnimationFrame(loop);
    },
    destroy() {
      if (rafId !== null) {
        cancelAnimationFrame(rafId);
        rafId = null;
      }
      keyboard.detach();
    },
  };
}
