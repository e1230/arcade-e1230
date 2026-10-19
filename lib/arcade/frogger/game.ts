// Motor de FROGGER: juego diseñado desde cero (SPEC 11), sin referencia que portar.
// Todo el estado de la partida vive en el cierre de `createFroggerEngine`.

import type {
  GameCallbacks,
  GameEngine,
  GameOptions,
} from "@/lib/arcade/engine";
import {
  CELL,
  DEATH_DELAY,
  FROG_INSET,
  GOAL_COLS,
  GOAL_ROW,
  GOAL_SPAN,
  HEIGHT,
  HOP_TIME,
  INITIAL_LIVES,
  MAX_DT,
  MEDIAN_ROW,
  POINTS_GOAL,
  POINTS_ROUND,
  POINTS_STEP,
  POINTS_TIME,
  RIVER_BOTTOM,
  RIVER_TOP,
  SCORE_MAX,
  START_COL,
  START_ROW,
  TURTLE_CYCLE,
  WIDTH,
  tripTime,
} from "@/lib/arcade/frogger/constants";
import {
  buildLanes,
  findSupport,
  hitsVehicle,
  moveLanes,
  type Lane,
} from "@/lib/arcade/frogger/lanes";
import { createGlowSpriteCache } from "@/lib/arcade/frogger/glow-sprites";
import {
  drawGame,
  type Facing as Direction,
  type RenderState,
} from "@/lib/arcade/frogger/render";
import {
  createTerrainLayer,
  drawGamePixels,
} from "@/lib/arcade/frogger/render-pixel";
import { SKINS } from "@/lib/arcade/frogger/skins";
import { createKeyboard } from "@/lib/arcade/shared/keyboard";
import { DEFAULT_SKIN } from "@/lib/arcade/shared/skins";

type Phase = "playing" | "dying" | "gameover";

interface Hop {
  fromX: number;
  fromRow: number;
  toX: number;
  toRow: number;
  t: number; // s transcurridos del salto
}

interface Frog {
  x: number; // px del borde izquierdo (continuo: el río la arrastra)
  row: number; // fila lógica, 0 a 13
  facing: Direction; // para orientar el dibujo
  hop: Hop | null;
}

interface FroggerState {
  phase: Phase;
  frog: Frog;
  pendingHop: Direction | null; // un salto guardado mientras otro está en el aire
  lanes: Lane[];
  goals: boolean[]; // 5 bocas, true si está ocupada
  clock: number; // s de partida, para las tortugas
  tripLeft: number; // s restantes del viaje
  bestRow: number; // fila más alta alcanzada en el viaje (empieza en START_ROW)
  deathTimer: number; // s transcurridos en "dying"
  deathX: number; // dónde se dibuja la marca de choque
  deathRow: number;
  score: number;
  lives: number;
  level: number;
}

const DELTAS: Record<Direction, { col: number; row: number }> = {
  up: { col: 0, row: -1 },
  down: { col: 0, row: 1 },
  left: { col: -1, row: 0 },
  right: { col: 1, row: 0 },
};

// Orden fijo en el que se procesan las pulsaciones de un mismo frame.
const KEY_BINDINGS: { direction: Direction; codes: string[] }[] = [
  { direction: "up", codes: ["ArrowUp", "KeyW"] },
  { direction: "down", codes: ["ArrowDown", "KeyS"] },
  { direction: "left", codes: ["ArrowLeft", "KeyA"] },
  { direction: "right", codes: ["ArrowRight", "KeyD"] },
];

function isRiverRow(row: number): boolean {
  return row >= RIVER_TOP && row <= RIVER_BOTTOM;
}

function createInitialFrog(): Frog {
  return { x: START_COL * CELL, row: START_ROW, facing: "up", hop: null };
}

function createInitialState(): FroggerState {
  return {
    phase: "playing",
    frog: createInitialFrog(),
    pendingHop: null,
    lanes: [],
    goals: GOAL_COLS.map(() => false),
    clock: 0,
    tripLeft: tripTime(1),
    bestRow: START_ROW,
    deathTimer: 0,
    deathX: 0,
    deathRow: START_ROW,
    score: 0,
    lives: INITIAL_LIVES,
    level: 1,
  };
}

export function createFroggerEngine(
  canvas: HTMLCanvasElement,
  callbacks: GameCallbacks,
  options?: GameOptions,
): GameEngine {
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("No se pudo obtener el contexto 2D del canvas");
  // La skin se fija al crear el motor y no cambia durante la partida.
  const skin = SKINS[options?.skin ?? DEFAULT_SKIN];

  // Retro dibuja la escena en un búfer reducido y la amplía sin suavizado; el canvas visible conserva su tamaño.
  let buffer: HTMLCanvasElement | null = null;
  let bufferCtx: CanvasRenderingContext2D | null = null;
  let terrain: HTMLCanvasElement | null = null;
  if (skin.pixelScale > 1) {
    buffer = document.createElement("canvas");
    buffer.width = WIDTH / skin.pixelScale;
    buffer.height = HEIGHT / skin.pixelScale;
    bufferCtx = buffer.getContext("2d");
    if (!bufferCtx) {
      throw new Error("No se pudo obtener el contexto 2D del búfer");
    }
    // El canvas visible no cambia de tamaño después de `create`, así que basta fijarlo una vez
    ctx.imageSmoothingEnabled = false;
    terrain = createTerrainLayer(skin);
  }

  // Neón (con glow) dibuja vehículos, troncos, tortugas y ranas de las bocas desde una caché de sprites.
  const sprites = skin.glow > 0 ? createGlowSpriteCache(skin) : null;

  const keyboard = createKeyboard();

  let state = createInitialState();
  let rafId: number | null = null;
  let lastTime: number | null = null;
  let destroyed = false;

  function addScore(points: number): void {
    state.score = Math.min(SCORE_MAX, state.score + points);
    callbacks.onScore(state.score);
  }

  // Empieza un viaje: rana en el inicio, tiempo lleno y sin saltos guardados.
  function resetFrog(): void {
    state.frog = createInitialFrog();
    state.pendingHop = null;
    state.bestRow = START_ROW;
    state.tripLeft = tripTime(state.level);
  }

  // Posición dibujada de la rana: interpolada si está saltando.
  function frogDrawX(): number {
    const { hop, x } = state.frog;
    if (!hop) return x;
    const progress = Math.min(1, hop.t / HOP_TIME);
    return hop.fromX + (hop.toX - hop.fromX) * progress;
  }

  function frogDrawRow(): number {
    const { hop, row } = state.frog;
    if (!hop) return row;
    const progress = Math.min(1, hop.t / HOP_TIME);
    return hop.fromRow + (hop.toRow - hop.fromRow) * progress;
  }

  function finishGame(): void {
    state.phase = "gameover";
    keyboard.detach();
    callbacks.onGameOver(state.score);
  }

  function killFrog(): void {
    state.deathX = frogDrawX();
    // En un salto, la marca va en la fila de origen en la primera mitad y en la de destino en la segunda.
    const { hop } = state.frog;
    state.deathRow = hop
      ? hop.t < HOP_TIME / 2
        ? hop.fromRow
        : hop.toRow
      : state.frog.row;
    state.frog.hop = null;
    state.pendingHop = null;

    state.lives = Math.max(0, state.lives - 1);
    callbacks.onLives(state.lives);
    if (state.lives <= 0) {
      finishGame();
      return;
    }
    state.phase = "dying";
    state.deathTimer = 0;
  }

  function handleGoal(): void {
    const centerX = state.frog.x + CELL / 2;
    const index = GOAL_COLS.findIndex(
      (col) => centerX >= col * CELL && centerX < (col + GOAL_SPAN) * CELL,
    );
    // Seto o boca ya ocupada: muerte.
    if (index < 0 || state.goals[index]) {
      killFrog();
      return;
    }

    state.goals[index] = true;
    let points = POINTS_GOAL + Math.floor(state.tripLeft) * POINTS_TIME;
    const roundComplete = state.goals.every(Boolean);
    if (roundComplete) points += POINTS_ROUND;
    addScore(points);

    if (roundComplete) {
      state.level += 1;
      callbacks.onLevel(state.level);
      state.goals = GOAL_COLS.map(() => false);
      state.lanes = buildLanes(state.level);
    }
    resetFrog();
  }

  function land(): void {
    const { frog } = state;
    const hop = frog.hop;
    if (!hop) return;
    frog.x = hop.toX;
    frog.row = hop.toRow;
    frog.hop = null;

    // En tierra la rana queda alineada a la grilla; en el río y en las bocas conserva su x.
    if (frog.row >= MEDIAN_ROW) {
      frog.x = Math.min(
        WIDTH - CELL,
        Math.max(0, Math.round(frog.x / CELL) * CELL),
      );
    }

    if (frog.row < state.bestRow && frog.row > GOAL_ROW) {
      state.bestRow = frog.row;
      addScore(POINTS_STEP);
    }
    if (frog.row === GOAL_ROW) handleGoal();
  }

  // Un salto fuera del tablero se ignora y no gasta la pulsación.
  function startHop(direction: Direction): boolean {
    const { frog } = state;
    const delta = DELTAS[direction];
    const toRow = frog.row + delta.row;
    const toX = frog.x + delta.col * CELL;
    if (toRow < GOAL_ROW || toRow > START_ROW) return false;
    if (toX < 0 || toX > WIDTH - CELL) return false;

    frog.facing = direction;
    frog.hop = { fromX: frog.x, fromRow: frog.row, toX, toRow, t: 0 };
    return true;
  }

  function readInput(): void {
    for (const { direction, codes } of KEY_BINDINGS) {
      // Se consumen todas las teclas del grupo en el mismo frame, sin cortocircuitar.
      let pressed = false;
      for (const code of codes) {
        if (keyboard.consume(code)) pressed = true;
      }
      if (!pressed || state.phase !== "playing") continue;
      if (state.frog.hop) state.pendingHop = direction;
      else startHop(direction);
    }
  }

  // Devuelve true si la rana murió en este frame.
  function checkDeath(dt: number): boolean {
    const { frog } = state;

    // Tráfico: durante el salto cuenta la fila de origen en la primera mitad y la de destino en la segunda.
    const x = frogDrawX();
    const hopRow = frog.hop
      ? frog.hop.t < HOP_TIME / 2
        ? frog.hop.fromRow
        : frog.hop.toRow
      : frog.row;
    if (
      hitsVehicle(state.lanes, hopRow, x + FROG_INSET, x + CELL - FROG_INSET)
    ) {
      return true;
    }

    // Río: solo con la rana en el suelo. El soporte la arrastra y el agua o el borde la matan.
    if (!frog.hop && isRiverRow(frog.row)) {
      const support = findSupport(
        state.lanes,
        frog.row,
        frog.x + CELL / 2,
        state.clock,
      );
      if (!support) return true;
      frog.x += support.velocity * dt;
      const centerX = frog.x + CELL / 2;
      if (centerX < 0 || centerX > WIDTH) return true;
    }

    return state.tripLeft <= 0;
  }

  function updatePlaying(dt: number): void {
    const { frog } = state;
    state.tripLeft = Math.max(0, state.tripLeft - dt);

    if (frog.hop) {
      frog.hop.t += dt;
      if (frog.hop.t >= HOP_TIME) {
        land();
        if (state.phase !== "playing") return;
      }
    }

    if (checkDeath(dt)) {
      killFrog();
      return;
    }

    // Las muertes tienen prioridad sobre la entrada, para que un salto no esquive la caída al agua.
    const pending = state.pendingHop;
    if (!state.frog.hop && pending) {
      state.pendingHop = null;
      startHop(pending);
    }
    readInput();
  }

  function update(dt: number): void {
    // El reloj solo alimenta el ciclo de las tortugas (`turtleState` en lanes.ts)
    state.clock = (state.clock + dt) % TURTLE_CYCLE;
    moveLanes(state.lanes, dt);

    if (state.phase === "playing") {
      updatePlaying(dt);
      return;
    }

    if (state.phase === "dying") {
      readInput(); // descarta las pulsaciones durante la marca de choque
      state.deathTimer += dt;
      if (state.deathTimer >= DEATH_DELAY) {
        resetFrog();
        state.phase = "playing";
      }
    }
  }

  // Vista de dibujo reutilizada: se rellena en cada frame y los renderers no la retienen.
  const view: RenderState = {
    phase: "playing",
    lanes: [],
    goals: [],
    clock: 0,
    frog: { x: 0, y: 0, facing: "up", hopping: false },
    tripFraction: 1,
    deathTimer: 0,
    deathX: 0,
    deathRow: START_ROW,
  };

  function updateView(): RenderState {
    const { frog } = state;
    view.phase = state.phase;
    view.lanes = state.lanes;
    view.goals = state.goals;
    view.clock = state.clock;
    view.frog.x = frogDrawX();
    view.frog.y = frogDrawRow() * CELL;
    view.frog.facing = frog.facing;
    view.frog.hopping = frog.hop !== null;
    view.tripFraction = state.tripLeft / tripTime(state.level);
    view.deathTimer = state.deathTimer;
    view.deathX = state.deathX;
    view.deathRow = state.deathRow;
    return view;
  }

  function draw(): void {
    if (buffer && bufferCtx && terrain) {
      drawGamePixels(bufferCtx, updateView(), skin, terrain);
      ctx!.drawImage(buffer, 0, 0, WIDTH, HEIGHT);
      return;
    }
    drawGame(ctx!, updateView(), skin, sprites);
  }

  function loop(ts: number): void {
    const dt = lastTime === null ? 0 : Math.min((ts - lastTime) / 1000, MAX_DT);
    lastTime = ts;
    update(dt);
    draw();
    // Tras el fin de partida no hay nada que animar: el último frame queda bajo el modal
    if (state.phase === "gameover") {
      rafId = null;
      return;
    }
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
      state.lanes = buildLanes(state.level);
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
      state.pendingHop = null;
    },
    resume() {
      if (destroyed) return;
      // Tras el fin de partida el loop ya terminó, el teclado queda suelto (para que Espacio active los botones del modal) y el canvas conserva el último frame
      if (state.phase === "gameover") return;
      keyboard.attach();
      lastTime = null;
      stopLoop();
      rafId = requestAnimationFrame(loop);
    },
    destroy() {
      destroyed = true;
      stopLoop();
      keyboard.detach();
    },
  };
}
