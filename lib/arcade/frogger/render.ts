// Dibujo de FROGGER: tablero, entidades de los carriles, bocas, rana, marca de choque y barra de tiempo.
// Todo son primitivas de canvas, sin imágenes. No guarda estado: `game.ts` le pasa una vista de la partida.

import {
  CELL,
  COLORS,
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
} from "@/lib/arcade/frogger/constants";
import {
  turtleState,
  type Entity,
  type Lane,
} from "@/lib/arcade/frogger/lanes";

export type Facing = "up" | "down" | "left" | "right";

export interface FrogView {
  x: number; // px del borde izquierdo, ya interpolada si está saltando
  y: number; // px del borde superior, ya interpolada si está saltando
  facing: Facing;
  hopping: boolean; // las patas se separan durante el salto
}

export interface RenderState {
  phase: "playing" | "dying" | "gameover";
  lanes: Lane[];
  goals: boolean[]; // true si la boca está ocupada
  clock: number; // s de partida, para el ciclo de las tortugas
  frog: FrogView;
  tripFraction: number; // tiempo restante del viaje, de 0 a 1
  deathTimer: number; // s transcurridos en "dying"
  deathX: number; // px del borde izquierdo donde murió la rana
  deathRow: number;
}

const SPLAT_SIZE = 28; // px de lado de la «X»
const SPLAT_WIDTH = 4;
const SPLAT_BLINK = 0.15; // s entre parpadeos de la marca
const TIMER_BAR_HEIGHT = 12;

const FACING_VECTORS: Record<Facing, { x: number; y: number }> = {
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 },
};

function fillRow(
  ctx: CanvasRenderingContext2D,
  color: string,
  firstRow: number,
  lastRow: number,
): void {
  ctx.fillStyle = color;
  ctx.fillRect(0, firstRow * CELL, WIDTH, (lastRow - firstRow + 1) * CELL);
}

function drawBackground(ctx: CanvasRenderingContext2D): void {
  fillRow(ctx, COLORS.road, 0, HEIGHT / CELL - 1);
  fillRow(ctx, COLORS.hedge, GOAL_ROW, GOAL_ROW);
  fillRow(ctx, COLORS.river, RIVER_TOP, RIVER_BOTTOM);
  fillRow(ctx, COLORS.safe, MEDIAN_ROW, MEDIAN_ROW);
  fillRow(ctx, COLORS.road, ROAD_TOP, ROAD_BOTTOM);
  fillRow(ctx, COLORS.safe, START_ROW, START_ROW);
  fillRow(ctx, COLORS.road, TIMER_ROW, TIMER_ROW);

  // Textura del seto: cuadros oscuros alternados.
  ctx.fillStyle = COLORS.hedgeDark;
  for (let x = 0; x < WIDTH; x += CELL / 2) {
    const offset = (x / (CELL / 2)) % 2 === 0 ? 0 : CELL / 2;
    ctx.fillRect(x, GOAL_ROW * CELL + offset, CELL / 4, CELL / 4);
  }

  // Bocas: rectángulos de 2 × 1 celdas con 4 px de margen y borde del seto.
  for (const col of GOAL_COLS) {
    const x = col * CELL + 4;
    const y = GOAL_ROW * CELL + 4;
    const width = GOAL_SPAN * CELL - 8;
    const height = CELL - 8;
    ctx.fillStyle = COLORS.river;
    ctx.fillRect(x, y, width, height);
    ctx.strokeStyle = COLORS.hedgeDark;
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, width, height);
  }
}

function drawWheel(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
): void {
  ctx.fillStyle = COLORS.wheel;
  ctx.fillRect(x, y, width, height);
}

// Coche y bólido: cuerpo centrado en la celda con cuatro ruedas que sobresalen arriba y abajo.
function drawCar(
  ctx: CanvasRenderingContext2D,
  entity: Entity,
  lane: Lane,
  bodyHeight: number,
): void {
  const width = 32;
  const x = entity.x + (CELL - width) / 2;
  const centerY = lane.row * CELL + CELL / 2;
  const y = centerY - bodyHeight / 2;

  ctx.fillStyle = lane.color;
  ctx.fillRect(x, y, width, bodyHeight);
  if (lane.kind === "racer") {
    ctx.fillStyle = COLORS.road;
    ctx.fillRect(x, centerY - 2, width, 4);
  }
  for (const wheelX of [x + 4, x + width - 12]) {
    drawWheel(ctx, wheelX, y - 3, 8, 6);
    drawWheel(ctx, wheelX, y + bodyHeight - 3, 8, 6);
  }
}

// Tractor: cuerpo de 28×24 y dos ruedas traseras más grandes, del lado contrario a su avance.
function drawTractor(
  ctx: CanvasRenderingContext2D,
  entity: Entity,
  lane: Lane,
): void {
  const width = 28;
  const height = 24;
  const x = entity.x + (CELL - width) / 2;
  const y = lane.row * CELL + CELL / 2 - height / 2;
  const rearX = lane.velocity > 0 ? x : x + width - 12;

  ctx.fillStyle = lane.color;
  ctx.fillRect(x, y, width, height);
  drawWheel(ctx, rearX, y - 5, 12, 10);
  drawWheel(ctx, rearX, y + height - 5, 12, 10);
}

// Camión: caja de 56×26 y cabina de 20×26 del lado hacia donde avanza.
function drawTruck(
  ctx: CanvasRenderingContext2D,
  entity: Entity,
  lane: Lane,
): void {
  const boxWidth = 56;
  const cabWidth = 20;
  const height = 26;
  const x = entity.x + (lane.length * CELL - boxWidth - cabWidth) / 2;
  const y = lane.row * CELL + CELL / 2 - height / 2;
  const forward = lane.velocity > 0;
  const boxX = forward ? x : x + cabWidth;
  const cabX = forward ? x + boxWidth : x;

  ctx.fillStyle = lane.color;
  ctx.fillRect(boxX, y, boxWidth, height);
  ctx.fillStyle = COLORS.truckCab;
  ctx.fillRect(cabX, y, cabWidth, height);
  for (const wheelX of [boxX + 6, boxX + boxWidth - 14]) {
    drawWheel(ctx, wheelX, y - 3, 8, 6);
    drawWheel(ctx, wheelX, y + height - 3, 8, 6);
  }
}

// Tronco: rectángulo redondeado con dos líneas horizontales de textura.
function drawLog(
  ctx: CanvasRenderingContext2D,
  entity: Entity,
  lane: Lane,
): void {
  const width = lane.length * CELL - 4;
  const height = 30;
  const x = entity.x + 2;
  const y = lane.row * CELL + CELL / 2 - height / 2;

  ctx.fillStyle = COLORS.log;
  ctx.beginPath();
  ctx.roundRect(x, y, width, height, 8);
  ctx.fill();
  ctx.strokeStyle = COLORS.logLine;
  ctx.lineWidth = 2;
  for (const lineY of [y + 10, y + 20]) {
    ctx.beginPath();
    ctx.moveTo(x + 6, lineY);
    ctx.lineTo(x + width - 6, lineY);
    ctx.stroke();
  }
}

// Grupo de tortugas: un círculo de 15 px de radio por celda, con la cabeza hacia donde avanzan.
function drawTurtles(
  ctx: CanvasRenderingContext2D,
  entity: Entity,
  lane: Lane,
  clock: number,
): void {
  const state = turtleState(lane, entity, clock);
  const direction = lane.velocity > 0 ? 1 : -1;
  const centerY = lane.row * CELL + CELL / 2;

  for (let i = 0; i < lane.length; i++) {
    const centerX = entity.x + i * CELL + CELL / 2;
    if (state === "submerged") {
      ctx.strokeStyle = COLORS.turtleSinking;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(centerX, centerY, 15, 0, Math.PI * 2);
      ctx.stroke();
      continue;
    }
    ctx.fillStyle = COLORS.turtleHead;
    ctx.beginPath();
    ctx.arc(centerX + direction * 15, centerY, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = state === "sinking" ? COLORS.turtleSinking : COLORS.turtle;
    ctx.beginPath();
    ctx.arc(centerX, centerY, 15, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawLanes(
  ctx: CanvasRenderingContext2D,
  lanes: Lane[],
  clock: number,
): void {
  for (const lane of lanes) {
    for (const entity of lane.entities) {
      // Solo las entidades que se ven en pantalla.
      if (entity.x + lane.length * CELL <= 0 || entity.x >= WIDTH) continue;
      switch (lane.kind) {
        case "car":
          drawCar(ctx, entity, lane, 24);
          break;
        case "racer":
          drawCar(ctx, entity, lane, 18);
          break;
        case "tractor":
          drawTractor(ctx, entity, lane);
          break;
        case "truck":
          drawTruck(ctx, entity, lane);
          break;
        case "log":
          drawLog(ctx, entity, lane);
          break;
        case "turtles":
          drawTurtles(ctx, entity, lane, clock);
          break;
      }
    }
  }
}

// Rana: elipse de 28×24 con borde, ojos hacia `facing` y cuatro patas que se separan al saltar.
function drawFrog(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  facing: Facing,
  hopping: boolean,
): void {
  const centerX = x + CELL / 2;
  const centerY = y + CELL / 2;
  const spread = hopping ? 4 : 0;
  const forward = FACING_VECTORS[facing];
  const side = { x: -forward.y, y: forward.x };

  ctx.fillStyle = COLORS.frogDark;
  for (const legX of [-1, 1]) {
    for (const legY of [-1, 1]) {
      ctx.fillRect(
        centerX + legX * (11 + spread) - 3,
        centerY + legY * (10 + spread) - 2,
        6,
        4,
      );
    }
  }

  ctx.fillStyle = COLORS.frog;
  ctx.strokeStyle = COLORS.frogDark;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.ellipse(centerX, centerY, 14, 12, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  for (const sign of [-1, 1]) {
    const eyeX = centerX + forward.x * 8 + side.x * sign * 6;
    const eyeY = centerY + forward.y * 8 + side.y * sign * 6;
    ctx.fillStyle = COLORS.eye;
    ctx.beginPath();
    ctx.arc(eyeX, eyeY, 2.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = COLORS.pupil;
    ctx.beginPath();
    ctx.arc(eyeX + forward.x, eyeY + forward.y, 1, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawOccupiedGoals(
  ctx: CanvasRenderingContext2D,
  goals: boolean[],
): void {
  goals.forEach((occupied, index) => {
    if (!occupied) return;
    const centerX = (GOAL_COLS[index] + GOAL_SPAN / 2) * CELL;
    drawFrog(ctx, centerX - CELL / 2, GOAL_ROW * CELL, "up", false);
  });
}

// Marca de choque: una «X» roja en la celda donde murió la rana.
function drawSplat(
  ctx: CanvasRenderingContext2D,
  x: number,
  row: number,
): void {
  const centerX = x + CELL / 2;
  const centerY = row * CELL + CELL / 2;
  const half = SPLAT_SIZE / 2;

  ctx.strokeStyle = COLORS.splat;
  ctx.lineWidth = SPLAT_WIDTH;
  ctx.beginPath();
  ctx.moveTo(centerX - half, centerY - half);
  ctx.lineTo(centerX + half, centerY + half);
  ctx.moveTo(centerX + half, centerY - half);
  ctx.lineTo(centerX - half, centerY + half);
  ctx.stroke();
}

function drawTimerBar(ctx: CanvasRenderingContext2D, fraction: number): void {
  const clamped = Math.max(0, Math.min(1, fraction));
  ctx.fillStyle =
    clamped > 0.5
      ? COLORS.timerBar
      : clamped > 0.25
        ? COLORS.timerWarn
        : COLORS.timerDanger;
  ctx.fillRect(
    0,
    TIMER_ROW * CELL + (CELL - TIMER_BAR_HEIGHT) / 2,
    WIDTH * clamped,
    TIMER_BAR_HEIGHT,
  );
}

export function drawGame(
  ctx: CanvasRenderingContext2D,
  state: RenderState,
): void {
  drawBackground(ctx);
  drawLanes(ctx, state.lanes, state.clock);
  drawOccupiedGoals(ctx, state.goals);

  if (state.phase === "playing") {
    const { frog } = state;
    drawFrog(ctx, frog.x, frog.y, frog.facing, frog.hopping);
  } else if (
    state.phase === "gameover" ||
    Math.floor(state.deathTimer / SPLAT_BLINK) % 2 === 0
  ) {
    drawSplat(ctx, state.deathX, state.deathRow);
  }

  drawTimerBar(ctx, state.tripFraction);
}
