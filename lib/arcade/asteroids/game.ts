// Motor de Asteroids, portado de `references/started-games/02-asteroids/game.js`.
// Todo el estado de la partida vive en el cierre de `createAsteroidsEngine`.

import type { GameCallbacks, GameEngine } from "@/lib/arcade/engine";
import { createKeyboard } from "@/lib/arcade/asteroids/keyboard";
import { dist, rand } from "@/lib/arcade/asteroids/math";
import {
  Asteroid,
  Bullet,
  Particle,
  PowerUp,
  Ship,
} from "@/lib/arcade/asteroids/entities";
import {
  ASTEROIDS_PER_LEVEL_OFFSET,
  COLORS,
  HEIGHT,
  INITIAL_ASTEROIDS,
  MAX_DT,
  POINTS,
  POWERUP_DROP_CHANCE,
  POWERUP_DURATION,
  POWERUP_GUARANTEED_KILLS,
  SAFE_SPAWN_DISTANCE,
  SHIP_ASTEROID_COLLISION_FACTOR,
  SHIP_INITIAL_LIVES,
  SHIP_RESPAWN_DELAY,
  WIDTH,
} from "@/lib/arcade/asteroids/constants";

type Phase = "playing" | "dead" | "gameover";

interface AsteroidsState {
  phase: Phase;
  ship: Ship;
  bullets: Bullet[];
  asteroids: Asteroid[];
  particles: Particle[];
  powerUps: PowerUp[];
  score: number;
  lives: number;
  level: number;
  deadTimer: number;
  powerUpSpawned: boolean;
  killsSinceSpawn: number;
}

export function createAsteroidsEngine(
  canvas: HTMLCanvasElement,
  callbacks: GameCallbacks,
): GameEngine {
  const context2d = canvas.getContext("2d");
  if (!context2d)
    throw new Error("No se pudo obtener el contexto 2d del canvas");
  const ctx: CanvasRenderingContext2D = context2d;

  const keyboard = createKeyboard();

  let state: AsteroidsState = createInitialState();
  let rafId: number | null = null;
  let lastTime: number | null = null;

  function createInitialState(): AsteroidsState {
    return {
      phase: "playing",
      ship: new Ship(),
      bullets: [],
      asteroids: [],
      particles: [],
      powerUps: [],
      score: 0,
      lives: SHIP_INITIAL_LIVES,
      level: 1,
      deadTimer: 0,
      powerUpSpawned: false,
      killsSinceSpawn: 0,
    };
  }

  function spawnAsteroids(count: number): void {
    for (let i = 0; i < count; i++) {
      let x: number, y: number;
      do {
        x = rand(0, WIDTH);
        y = rand(0, HEIGHT);
      } while (Math.hypot(x - WIDTH / 2, y - HEIGHT / 2) < SAFE_SPAWN_DISTANCE);
      state.asteroids.push(new Asteroid(x, y, 3));
    }
  }

  function setScore(score: number): void {
    state.score = score;
    callbacks.onScore(score);
  }

  function setLives(lives: number): void {
    state.lives = lives;
    callbacks.onLives(lives);
  }

  function setLevel(level: number): void {
    state.level = level;
    callbacks.onLevel(level);
  }

  function initGame(): void {
    state = createInitialState();
    setScore(state.score);
    setLives(state.lives);
    setLevel(state.level);
    spawnAsteroids(INITIAL_ASTEROIDS);
  }

  function nextLevel(): void {
    setLevel(state.level + 1);
    state.bullets = [];
    state.particles = [];
    state.powerUps = [];
    state.powerUpSpawned = false;
    state.killsSinceSpawn = 0;
    state.ship.reset();
    spawnAsteroids(ASTEROIDS_PER_LEVEL_OFFSET + state.level);
  }

  function explode(x: number, y: number, count = 8): void {
    for (let i = 0; i < count; i++) state.particles.push(new Particle(x, y));
  }

  function killShip(): void {
    explode(state.ship.x, state.ship.y, 14);
    state.ship.dead = true;
    setLives(state.lives - 1);
    if (state.lives <= 0) {
      state.phase = "gameover";
      keyboard.detach();
      callbacks.onGameOver(state.score);
    } else {
      state.phase = "dead";
      state.deadTimer = SHIP_RESPAWN_DELAY;
    }
  }

  function update(dt: number): void {
    if (state.phase === "gameover") {
      state.particles.forEach((p) => p.update(dt));
      state.particles = state.particles.filter((p) => !p.dead);
      return;
    }

    if (state.phase === "dead") {
      state.deadTimer -= dt;
      state.particles.forEach((p) => p.update(dt));
      state.particles = state.particles.filter((p) => !p.dead);
      state.asteroids.forEach((a) => a.update(dt));
      if (state.deadTimer <= 0) {
        state.phase = "playing";
        state.ship.reset();
      }
      return;
    }

    if (keyboard.consume("Space")) {
      state.bullets.push(...state.ship.tryShoot());
    }

    state.ship.update(dt, keyboard);
    state.bullets.forEach((b) => b.update(dt));
    state.asteroids.forEach((a) => a.update(dt));
    state.particles.forEach((p) => p.update(dt));
    state.powerUps.forEach((p) => p.update(dt));

    state.bullets = state.bullets.filter((b) => !b.dead);
    state.particles = state.particles.filter((p) => !p.dead);
    state.powerUps = state.powerUps.filter((p) => !p.dead);

    for (const powerUp of state.powerUps) {
      if (
        !powerUp.dead &&
        dist(state.ship, powerUp) < state.ship.radius + powerUp.radius
      ) {
        powerUp.dead = true;
        state.ship.tripleShot = POWERUP_DURATION;
      }
    }

    const newAsteroids: Asteroid[] = [];
    for (const bullet of state.bullets) {
      for (const asteroid of state.asteroids) {
        if (
          !asteroid.dead &&
          !bullet.dead &&
          dist(bullet, asteroid) < asteroid.radius
        ) {
          bullet.dead = true;
          asteroid.dead = true;
          setScore(state.score + POINTS[asteroid.size]);
          explode(asteroid.x, asteroid.y, asteroid.size * 5);
          newAsteroids.push(...asteroid.split());
          if (!state.powerUpSpawned) {
            state.killsSinceSpawn++;
            const guaranteed =
              state.killsSinceSpawn >= POWERUP_GUARANTEED_KILLS;
            if (guaranteed || Math.random() < POWERUP_DROP_CHANCE) {
              state.powerUps.push(new PowerUp(asteroid.x, asteroid.y));
              state.powerUpSpawned = true;
            }
          }
        }
      }
    }
    state.asteroids = state.asteroids
      .filter((a) => !a.dead)
      .concat(newAsteroids);
    state.bullets = state.bullets.filter((b) => !b.dead);

    if (state.ship.invincible <= 0) {
      for (const asteroid of state.asteroids) {
        if (
          dist(state.ship, asteroid) <
          state.ship.radius + asteroid.radius * SHIP_ASTEROID_COLLISION_FACTOR
        ) {
          killShip();
          break;
        }
      }
    }

    if (state.phase === "playing" && state.asteroids.length === 0) nextLevel();
  }

  function draw(): void {
    ctx.fillStyle = COLORS.background;
    ctx.fillRect(0, 0, WIDTH, HEIGHT);

    state.particles.forEach((p) => p.draw(ctx));
    state.asteroids.forEach((a) => a.draw(ctx));
    state.powerUps.forEach((p) => p.draw(ctx));
    state.bullets.forEach((b) => b.draw(ctx));
    state.ship.draw(ctx);

    if (state.ship.tripleShot > 0) {
      ctx.textAlign = "left";
      ctx.textBaseline = "alphabetic";
      ctx.fillStyle = COLORS.powerUp;
      ctx.font = "15px monospace";
      ctx.fillText(`3x  ${state.ship.tripleShot.toFixed(1)}s`, 14, 26);
    }
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
      initGame();
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
      keyboard.attach();
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
