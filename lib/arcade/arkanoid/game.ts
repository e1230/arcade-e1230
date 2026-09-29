// Motor de Arkanoid, portado de `references/started-games/04-arkanoid/game.js`.
// Todo el estado de la partida vive en el cierre de `createArkanoidEngine`.

import {
  BALL_SIZE,
  BASE_BALL_VX,
  BASE_BALL_VY,
  BLOCK_H,
  BLOCK_POINTS,
  BLOCK_W,
  BLOCKS_ORIGIN_X,
  BLOCKS_ORIGIN_Y,
  COLORS,
  EXPLOSION_DURATION,
  EXPLOSION_FRAME_COUNT,
  HEIGHT,
  INITIAL_LIVES,
  MAX_DT,
  PADDLE_BOUNCE_TOLERANCE,
  PADDLE_H,
  PADDLE_SPEED,
  PADDLE_W,
  PADDLE_Y,
  SCORE_MAX,
  WIDTH,
} from "@/lib/arcade/arkanoid/constants";
import { LEVELS, type BlockColor } from "@/lib/arcade/arkanoid/levels";
import { createSounds } from "@/lib/arcade/arkanoid/sound";
import { loadSprites } from "@/lib/arcade/arkanoid/sprites";
import type { GameCallbacks, GameEngine } from "@/lib/arcade/engine";
import { createKeyboard } from "@/lib/arcade/shared/keyboard";

type Phase = "playing" | "gameover" | "win"; // game.js usa gameState y el flag isPaused; la pausa ahora es de la plataforma

interface Paddle {
  x: number; // el resto (y, w, h) sale de constants.ts
}

interface Ball {
  x: number;
  y: number;
  vx: number;
  vy: number;
}

interface Block {
  x: number;
  y: number;
  color: BlockColor;
  alive: boolean;
}

interface Explosion {
  x: number;
  y: number;
  color: BlockColor;
  elapsed: number; // s desde que se rompió el bloque
}

interface ArkanoidState {
  phase: Phase;
  paddle: Paddle;
  ball: Ball;
  blocks: Block[];
  explosions: Explosion[];
  score: number;
  lives: number;
  level: number; // 1 a 5
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function createInitialState(): ArkanoidState {
  return {
    phase: "playing",
    paddle: { x: (WIDTH - PADDLE_W) / 2 },
    ball: { x: 0, y: 0, vx: 0, vy: 0 },
    blocks: [],
    explosions: [],
    score: 0,
    lives: INITIAL_LIVES,
    level: 1,
  };
}

export function createArkanoidEngine(
  canvas: HTMLCanvasElement,
  callbacks: GameCallbacks,
): GameEngine {
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("No se pudo obtener el contexto 2D del canvas");

  const keyboard = createKeyboard();
  const sprites = loadSprites();
  const sounds = createSounds();

  let state = createInitialState();
  let rafId: number | null = null;
  let lastTime: number | null = null;
  let destroyed = false;

  function handleMouseMove(event: MouseEvent): void {
    const rect = canvas.getBoundingClientRect();
    const mouseX = (event.clientX - rect.left) * (canvas.width / rect.width);
    state.paddle.x = clamp(mouseX - PADDLE_W / 2, 0, WIDTH - PADDLE_W);
  }

  function attachInput(): void {
    keyboard.attach();
    canvas.addEventListener("mousemove", handleMouseMove);
  }

  function detachInput(): void {
    keyboard.detach();
    canvas.removeEventListener("mousemove", handleMouseMove);
  }

  // La bola sale sola y siempre hacia la derecha, como en la referencia.
  function resetBall(): void {
    const { speed } = LEVELS[state.level - 1];
    state.ball = {
      x: state.paddle.x + (PADDLE_W - BALL_SIZE) / 2,
      y: PADDLE_Y - BALL_SIZE,
      vx: BASE_BALL_VX * speed,
      vy: BASE_BALL_VY * speed,
    };
  }

  // No emite `onLevel`: lo hace quien la llama (start() o el paso de nivel).
  function loadLevel(n: number): void {
    state.level = n;
    state.blocks = LEVELS[n - 1].blocks.map(({ col, row, color }) => ({
      x: BLOCKS_ORIGIN_X + col * BLOCK_W,
      y: BLOCKS_ORIGIN_Y + row * BLOCK_H,
      color,
      alive: true,
    }));
    state.explosions = [];
    resetBall();
  }

  function finishGame(phase: "gameover" | "win"): void {
    state.phase = phase;
    detachInput();
    callbacks.onGameOver(state.score);
  }

  function overlapsBall(block: Block): boolean {
    const { ball } = state;
    return (
      ball.x < block.x + BLOCK_W &&
      ball.x + BALL_SIZE > block.x &&
      ball.y < block.y + BLOCK_H &&
      ball.y + BALL_SIZE > block.y
    );
  }

  function updatePaddle(dt: number): void {
    const { paddle } = state;
    if (keyboard.isDown("ArrowLeft"))
      paddle.x = Math.max(0, paddle.x - PADDLE_SPEED * dt);
    if (keyboard.isDown("ArrowRight"))
      paddle.x = Math.min(WIDTH - PADDLE_W, paddle.x + PADDLE_SPEED * dt);
  }

  function bounceOffWalls(): void {
    const { ball } = state;
    if (ball.x <= 0) {
      ball.x = 0;
      ball.vx = Math.abs(ball.vx);
      sounds.play("bounce");
    } else if (ball.x + BALL_SIZE >= WIDTH) {
      ball.x = WIDTH - BALL_SIZE;
      ball.vx = -Math.abs(ball.vx);
      sounds.play("bounce");
    }
    if (ball.y <= 0) {
      ball.y = 0;
      ball.vy = Math.abs(ball.vy);
      sounds.play("bounce");
    }
  }

  // El rebote no depende del punto de impacto y `vx` no cambia.
  function bounceOffPaddle(): void {
    const { ball, paddle } = state;
    const bottom = ball.y + BALL_SIZE;
    if (
      ball.vy > 0 &&
      ball.x + BALL_SIZE > paddle.x &&
      ball.x < paddle.x + PADDLE_W &&
      bottom >= PADDLE_Y &&
      bottom <= PADDLE_Y + PADDLE_H + PADDLE_BOUNCE_TOLERANCE
    ) {
      ball.y = PADDLE_Y - BALL_SIZE;
      ball.vy = -Math.abs(ball.vy);
      sounds.play("bounce");
    }
  }

  // Rompe como máximo un bloque por frame. Devuelve true si terminó la partida.
  function breakBlocks(): boolean {
    const hit = state.blocks.find(
      (block) => block.alive && overlapsBall(block),
    );
    if (!hit) return false;

    hit.alive = false;
    state.explosions.push({
      x: hit.x,
      y: hit.y,
      color: hit.color,
      elapsed: 0,
    });
    state.score = Math.min(SCORE_MAX, state.score + BLOCK_POINTS);
    callbacks.onScore(state.score);
    state.ball.vy = -state.ball.vy; // aunque el golpe sea de costado
    sounds.play("break");

    if (state.blocks.some((block) => block.alive)) return false;
    if (state.level < LEVELS.length) {
      loadLevel(state.level + 1);
      callbacks.onLevel(state.level);
      return false;
    }
    finishGame("win");
    return true;
  }

  function updateExplosions(dt: number): void {
    for (const explosion of state.explosions) explosion.elapsed += dt;
    state.explosions = state.explosions.filter(
      (explosion) => explosion.elapsed < EXPLOSION_DURATION,
    );
  }

  // Devuelve true si terminó la partida.
  function checkBallLost(): boolean {
    if (state.ball.y <= HEIGHT) return false;
    state.lives -= 1;
    callbacks.onLives(Math.max(0, state.lives));
    if (state.lives <= 0) {
      state.lives = 0;
      finishGame("gameover");
      return true;
    }
    resetBall();
    return false;
  }

  function update(dt: number): void {
    if (!sprites.isReady()) return;

    // Tras el fin de partida solo terminan de animarse las explosiones
    if (state.phase !== "playing") {
      updateExplosions(dt);
      return;
    }

    updatePaddle(dt);

    state.ball.x += state.ball.vx * dt;
    state.ball.y += state.ball.vy * dt;

    bounceOffWalls();
    bounceOffPaddle();
    if (breakBlocks()) return;
    updateExplosions(dt);
    checkBallLost();
  }

  function draw(): void {
    ctx!.fillStyle = COLORS.background;
    ctx!.fillRect(0, 0, WIDTH, HEIGHT);
    if (!sprites.isReady()) return;

    for (const block of state.blocks) {
      if (block.alive)
        sprites.drawBlock(
          ctx!,
          block.color,
          block.x,
          block.y,
          BLOCK_W,
          BLOCK_H,
        );
    }
    for (const explosion of state.explosions) {
      const frame = Math.min(
        Math.floor(
          (explosion.elapsed / EXPLOSION_DURATION) * EXPLOSION_FRAME_COUNT,
        ),
        EXPLOSION_FRAME_COUNT - 1,
      );
      sprites.drawExplosion(
        ctx!,
        explosion.color,
        frame,
        explosion.x,
        explosion.y,
        BLOCK_W,
        BLOCK_H,
      );
    }
    sprites.drawPaddle(ctx!, state.paddle.x, PADDLE_Y, PADDLE_W, PADDLE_H);
    sprites.drawBall(ctx!, state.ball.x, state.ball.y, BALL_SIZE, BALL_SIZE);
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
      loadLevel(1);
      callbacks.onScore(state.score);
      callbacks.onLives(state.lives);
      callbacks.onLevel(state.level);
      attachInput();
      lastTime = null;
      stopLoop();
      rafId = requestAnimationFrame(loop);
    },
    pause() {
      stopLoop();
      detachInput();
      sounds.pause();
    },
    resume() {
      if (destroyed) return;
      // Tras el fin de partida la entrada queda suelta, para que Espacio active los botones del modal
      if (state.phase === "playing") attachInput();
      lastTime = null;
      stopLoop();
      rafId = requestAnimationFrame(loop);
    },
    destroy() {
      destroyed = true;
      stopLoop();
      detachInput();
      sprites.dispose();
      sounds.dispose();
    },
  };
}
