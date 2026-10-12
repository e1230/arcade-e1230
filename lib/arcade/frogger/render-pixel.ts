// Dibujo de la skin Retro de FROGGER: pixel art sobre un búfer reducido (160×120 con `pixelScale` 5),
// donde cada celda de 40 px son 8×8 píxeles lógicos. Cada píxel es un `fillRect` entero, sin antialiasing,
// así que solo aparecen colores de la skin. No guarda estado: recibe la misma vista que `drawGame`.

import {
  CELL,
  GOAL_COLS,
  GOAL_ROW,
  GOAL_SPAN,
  HEIGHT,
  MEDIAN_ROW,
  RIVER_BOTTOM,
  RIVER_TOP,
  ROAD_BOTTOM,
  ROAD_TOP,
  START_ROW,
  TIMER_ROW,
  WIDTH,
  type LaneKind,
} from "@/lib/arcade/frogger/constants";
import {
  turtleState,
  type Entity,
  type Lane,
} from "@/lib/arcade/frogger/lanes";
import {
  splatVisible,
  timerColor,
  type Facing,
  type RenderState,
} from "@/lib/arcade/frogger/render";
import type { FroggerSkin } from "@/lib/arcade/frogger/skins";
import {
  CAR,
  FROG_HOP,
  FROG_IDLE,
  HEDGE_TILE,
  RACER,
  RIVER_TILE,
  SPLAT,
  TRACTOR,
  TRUCK,
  TURTLE,
  mirror,
  rotateClockwise,
  type Sprite,
} from "@/lib/arcade/frogger/sprites";

const TILE = 8; // píxeles lógicos por celda
const TIMER_BAR_HEIGHT = 2;
const SPLAT_OFFSET = 1;

// Rana rotada para cada dirección: derecha, abajo e izquierda son 1, 2 y 3 cuartos de vuelta.
function frogFrames(turns: number): { idle: Sprite; hop: Sprite } {
  let idle = FROG_IDLE;
  let hop = FROG_HOP;
  for (let i = 0; i < turns; i++) {
    idle = rotateClockwise(idle);
    hop = rotateClockwise(hop);
  }
  return { idle, hop };
}

const FROG_FRAMES: Record<Facing, { idle: Sprite; hop: Sprite }> = {
  up: frogFrames(0),
  right: frogFrames(1),
  down: frogFrames(2),
  left: frogFrames(3),
};

type VehicleKind = Exclude<LaneKind, "log" | "turtles">;

// Vehículos hacia la derecha y espejados hacia la izquierda.
const VEHICLE_SPRITES: Record<VehicleKind, { right: Sprite; left: Sprite }> = {
  car: { right: CAR, left: mirror(CAR) },
  racer: { right: RACER, left: mirror(RACER) },
  tractor: { right: TRACTOR, left: mirror(TRACTOR) },
  truck: { right: TRUCK, left: mirror(TRUCK) },
};

// Tortuga hundiéndose: el sprite tramado en damero, todo en `turtleSinking` (letra `s`).
function sinkingSprite(sprite: Sprite): Sprite {
  return sprite.map((line, y) =>
    [...line]
      .map((ch, x) => (ch !== "." && (x + y) % 2 === 0 ? "s" : "."))
      .join(""),
  );
}

// Tortuga sumergida: solo el contorno del caparazón (sin la cabeza), en `turtleSinking`.
function outlineSprite(sprite: Sprite): Sprite {
  const isShell = (x: number, y: number) =>
    sprite[y]?.[x] === "r" || sprite[y]?.[x] === "k";
  return sprite.map((line, y) =>
    [...line]
      .map((_, x) => {
        if (!isShell(x, y)) return ".";
        const edge =
          !isShell(x - 1, y) ||
          !isShell(x + 1, y) ||
          !isShell(x, y - 1) ||
          !isShell(x, y + 1);
        return edge ? "s" : ".";
      })
      .join(""),
  );
}

const TURTLE_SPRITES = {
  right: {
    visible: TURTLE,
    sinking: sinkingSprite(TURTLE),
    submerged: outlineSprite(TURTLE),
  },
  left: {
    visible: mirror(TURTLE),
    sinking: sinkingSprite(mirror(TURTLE)),
    submerged: outlineSprite(mirror(TURTLE)),
  },
} as const;

// Color de cada letra de los sprites; null = no se dibuja.
function colorOf(
  ch: string,
  skin: FroggerSkin,
  vehicle: string | null,
): string | null {
  switch (ch) {
    case "f":
      return skin.frog;
    case "d":
      return skin.frogDark;
    case "e":
      return skin.eye;
    case "c":
      return vehicle;
    case "a":
      return skin.truckCab;
    case "w":
      return skin.wheel;
    case "k":
      return skin.road;
    case "x":
      return skin.splat;
    case "l":
      return skin.log;
    case "g":
      return skin.logLine;
    case "r":
      return skin.turtle;
    case "h":
      return skin.turtleHead;
    case "s":
      return skin.turtleSinking;
    case "n":
      return skin.hedgeLine;
    case "b":
      return skin.riverMark;
    case "m":
      return skin.roadMark;
    default:
      return null;
  }
}

// Dibuja un sprite agrupando los píxeles seguidos del mismo color de cada fila en un solo `fillRect`.
function drawSprite(
  ctx: CanvasRenderingContext2D,
  skin: FroggerSkin,
  sprite: Sprite,
  left: number,
  top: number,
  vehicle: string | null = null,
): void {
  for (let y = 0; y < sprite.length; y++) {
    const line = sprite[y];
    let x = 0;
    while (x < line.length) {
      let end = x + 1;
      while (end < line.length && line[end] === line[x]) end++;
      const color = colorOf(line[x], skin, vehicle);
      if (color) {
        ctx.fillStyle = color;
        ctx.fillRect(left + x, top + y, end - x, 1);
      }
      x = end;
    }
  }
}

function fillRows(
  ctx: CanvasRenderingContext2D,
  color: string,
  firstRow: number,
  lastRow: number,
  width: number,
): void {
  ctx.fillStyle = color;
  ctx.fillRect(0, firstRow * TILE, width, (lastRow - firstRow + 1) * TILE);
}

function drawTerrain(
  ctx: CanvasRenderingContext2D,
  skin: FroggerSkin,
  width: number,
  height: number,
): void {
  ctx.fillStyle = skin.road;
  ctx.fillRect(0, 0, width, height);
  fillRows(ctx, skin.hedge, GOAL_ROW, GOAL_ROW, width);
  fillRows(ctx, skin.river, RIVER_TOP, RIVER_BOTTOM, width);
  fillRows(ctx, skin.safe, MEDIAN_ROW, MEDIAN_ROW, width);
  fillRows(ctx, skin.road, ROAD_TOP, ROAD_BOTTOM, width);
  fillRows(ctx, skin.safe, START_ROW, START_ROW, width);
  fillRows(ctx, skin.road, TIMER_ROW, TIMER_ROW, width);

  // Ondas del río y cuadros del seto, teselados por fila.
  for (let x = 0; x < width; x += TILE) {
    for (let row = RIVER_TOP; row <= RIVER_BOTTOM; row++) {
      drawSprite(ctx, skin, RIVER_TILE, x, row * TILE);
    }
    drawSprite(ctx, skin, HEDGE_TILE, x, GOAL_ROW * TILE);
  }

  // Franjas seguras: una línea en la primera y la última fila lógica de la celda.
  ctx.fillStyle = skin.safeEdge;
  for (const row of [MEDIAN_ROW, START_ROW]) {
    ctx.fillRect(0, row * TILE, width, 1);
    ctx.fillRect(0, row * TILE + TILE - 1, width, 1);
  }

  // Rayas entre carriles: 2 píxeles encendidos y 2 apagados en la última fila lógica de las filas 8 a 11.
  if (skin.roadMark) {
    ctx.fillStyle = skin.roadMark;
    for (let row = ROAD_TOP; row < ROAD_BOTTOM; row++) {
      for (let x = 0; x < width; x += 4) {
        ctx.fillRect(x, row * TILE + TILE - 1, 2, 1);
      }
    }
  }

  // Bocas: 14×6 píxeles con borde del seto, agua y dos ondas.
  for (const col of GOAL_COLS) {
    const left = col * TILE + 1;
    const top = GOAL_ROW * TILE + 1;
    const goalWidth = GOAL_SPAN * TILE - 2;
    const goalHeight = TILE - 2;
    ctx.fillStyle = skin.hedgeLine;
    ctx.fillRect(left, top, goalWidth, goalHeight);
    ctx.fillStyle = skin.river;
    ctx.fillRect(left + 1, top + 1, goalWidth - 2, goalHeight - 2);
    if (skin.riverMark) {
      ctx.fillStyle = skin.riverMark;
      ctx.fillRect(left + 4, top + 2, 1, 1);
      ctx.fillRect(left + 9, top + 3, 1, 1);
    }
  }
}

// Tronco: rectángulo en las filas 1 a 6 de la celda sin las cuatro esquinas, con dos hileras de vetas.
function drawLog(
  ctx: CanvasRenderingContext2D,
  skin: FroggerSkin,
  left: number,
  top: number,
  length: number,
): void {
  const width = length * TILE;
  ctx.fillStyle = skin.log;
  ctx.fillRect(left + 1, top + 1, width - 2, 1);
  ctx.fillRect(left, top + 2, width, 4);
  ctx.fillRect(left + 1, top + 6, width - 2, 1);

  ctx.fillStyle = skin.logLine;
  for (let x = 2; x < width - 2; x++) {
    const step = x % 7;
    if (step >= 2 && step <= 4) ctx.fillRect(left + x, top + 3, 1, 1);
    if (step === 5 || step === 6 || step === 0) {
      ctx.fillRect(left + x, top + 5, 1, 1);
    }
  }
}

function drawEntity(
  ctx: CanvasRenderingContext2D,
  skin: FroggerSkin,
  entity: Entity,
  lane: Lane,
  clock: number,
): void {
  const left = Math.floor(entity.x / skin.pixelScale);
  const top = lane.row * TILE;
  const side = lane.velocity < 0 ? "left" : "right";

  if (lane.kind === "log") {
    drawLog(ctx, skin, left, top, lane.length);
    return;
  }

  if (lane.kind === "turtles") {
    const sprite = TURTLE_SPRITES[side][turtleState(lane, entity, clock)];
    for (let i = 0; i < lane.length; i++) {
      drawSprite(ctx, skin, sprite, left + i * TILE, top);
    }
    return;
  }

  const vehicle = lane.colorRole ? skin[lane.colorRole] : null;
  drawSprite(ctx, skin, VEHICLE_SPRITES[lane.kind][side], left, top, vehicle);
}

function drawLanes(
  ctx: CanvasRenderingContext2D,
  skin: FroggerSkin,
  lanes: Lane[],
  clock: number,
): void {
  for (const lane of lanes) {
    for (const entity of lane.entities) {
      // Solo las entidades que se ven en pantalla.
      if (entity.x + lane.length * CELL <= 0 || entity.x >= WIDTH) continue;
      drawEntity(ctx, skin, entity, lane, clock);
    }
  }
}

export function drawGamePixels(
  ctx: CanvasRenderingContext2D,
  state: RenderState,
  skin: FroggerSkin,
): void {
  const width = WIDTH / skin.pixelScale;
  const height = HEIGHT / skin.pixelScale;

  drawTerrain(ctx, skin, width, height);
  drawLanes(ctx, skin, state.lanes, state.clock);

  state.goals.forEach((occupied, index) => {
    if (!occupied) return;
    const centerX = (GOAL_COLS[index] + GOAL_SPAN / 2) * TILE;
    drawSprite(ctx, skin, FROG_IDLE, centerX - TILE / 2, GOAL_ROW * TILE);
  });

  if (state.phase === "playing") {
    const { frog } = state;
    const frames = FROG_FRAMES[frog.facing];
    drawSprite(
      ctx,
      skin,
      frog.hopping ? frames.hop : frames.idle,
      Math.floor(frog.x / skin.pixelScale),
      Math.floor(frog.y / skin.pixelScale),
    );
  } else if (splatVisible(state)) {
    drawSprite(
      ctx,
      skin,
      SPLAT,
      Math.floor(state.deathX / skin.pixelScale) + SPLAT_OFFSET,
      state.deathRow * TILE + SPLAT_OFFSET,
    );
  }

  // Barra de tiempo: 2 píxeles de alto centrados en la fila 14.
  const fraction = Math.max(0, Math.min(1, state.tripFraction));
  ctx.fillStyle = timerColor(skin, fraction);
  ctx.fillRect(
    0,
    TIMER_ROW * TILE + (TILE - TIMER_BAR_HEIGHT) / 2,
    Math.floor(fraction * width),
    TIMER_BAR_HEIGHT,
  );
}
