// Dibujo vectorial de FROGGER (skins Clásico y Neón): tablero, entidades de los carriles, bocas, rana,
// marca de choque y barra de tiempo. Todo son primitivas de canvas, sin imágenes. No guarda estado:
// `game.ts` le pasa una vista de la partida y la skin elegida.

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
} from "@/lib/arcade/frogger/constants";
import type { GlowSpriteCache } from "@/lib/arcade/frogger/glow-sprites";
import {
  turtleState,
  type Entity,
  type Lane,
  type TurtleState,
} from "@/lib/arcade/frogger/lanes";
import type { FroggerSkin } from "@/lib/arcade/frogger/skins";

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

export const SAFE_ROWS = [MEDIAN_ROW, START_ROW] as const; // franjas con borde
const SIGNS = [-1, 1] as const; // patas y ojos de la rana

const FACING_VECTORS: Record<Facing, { x: number; y: number }> = {
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 },
};

// Glow de Neón: no hace nada si la skin no lo usa.
function applyGlow(
  ctx: CanvasRenderingContext2D,
  skin: FroggerSkin,
  color: string,
): void {
  if (skin.glow === 0) return;
  ctx.shadowColor = color;
  ctx.shadowBlur = skin.glow;
}

function clearGlow(ctx: CanvasRenderingContext2D): void {
  ctx.shadowBlur = 0;
}

// Color del cuerpo de un vehículo según el rol de su carril.
function vehicleColor(lane: Lane, skin: FroggerSkin): string {
  return lane.colorRole ? skin[lane.colorRole] : skin.road;
}

function fillRow(
  ctx: CanvasRenderingContext2D,
  color: string,
  firstRow: number,
  lastRow: number,
): void {
  ctx.fillStyle = color;
  ctx.fillRect(0, firstRow * CELL, WIDTH, (lastRow - firstRow + 1) * CELL);
}

function drawBackground(
  ctx: CanvasRenderingContext2D,
  skin: FroggerSkin,
): void {
  fillRow(ctx, skin.road, 0, HEIGHT / CELL - 1);
  fillRow(ctx, skin.hedge, GOAL_ROW, GOAL_ROW);
  fillRow(ctx, skin.river, RIVER_TOP, RIVER_BOTTOM);
  fillRow(ctx, skin.safe, MEDIAN_ROW, MEDIAN_ROW);
  fillRow(ctx, skin.road, ROAD_TOP, ROAD_BOTTOM);
  fillRow(ctx, skin.safe, START_ROW, START_ROW);
  fillRow(ctx, skin.road, TIMER_ROW, TIMER_ROW);

  // Borde de las franjas seguras: una línea arriba y otra abajo de cada una.
  ctx.fillStyle = skin.safeEdge;
  for (const row of SAFE_ROWS) {
    ctx.fillRect(0, row * CELL, WIDTH, skin.lineWidth);
    ctx.fillRect(0, (row + 1) * CELL - skin.lineWidth, WIDTH, skin.lineWidth);
  }

  // Textura del seto: cuadros alternados.
  ctx.fillStyle = skin.hedgeLine;
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
    ctx.fillStyle = skin.river;
    ctx.fillRect(x, y, width, height);
    ctx.strokeStyle = skin.hedgeLine;
    ctx.lineWidth = skin.lineWidth;
    ctx.strokeRect(x, y, width, height);
  }
}

function drawWheel(
  ctx: CanvasRenderingContext2D,
  skin: FroggerSkin,
  x: number,
  y: number,
  width: number,
  height: number,
): void {
  ctx.fillStyle = skin.wheel;
  ctx.fillRect(x, y, width, height);
}

// Dos ruedas en la misma columna: una arriba y otra abajo del cuerpo.
function drawWheelPair(
  ctx: CanvasRenderingContext2D,
  skin: FroggerSkin,
  wheelX: number,
  y: number,
  bodyHeight: number,
): void {
  drawWheel(ctx, skin, wheelX, y - 3, 8, 6);
  drawWheel(ctx, skin, wheelX, y + bodyHeight - 3, 8, 6);
}

// Coche y bólido: cuerpo centrado en la celda con cuatro ruedas que sobresalen arriba y abajo.
function drawCar(
  ctx: CanvasRenderingContext2D,
  skin: FroggerSkin,
  entity: Entity,
  lane: Lane,
  bodyHeight: number,
): void {
  const width = 32;
  const x = entity.x + (CELL - width) / 2;
  const centerY = lane.row * CELL + CELL / 2;
  const y = centerY - bodyHeight / 2;
  const color = vehicleColor(lane, skin);

  drawWheelPair(ctx, skin, x + 4, y, bodyHeight);
  drawWheelPair(ctx, skin, x + width - 12, y, bodyHeight);

  applyGlow(ctx, skin, color);
  ctx.fillStyle = color;
  ctx.fillRect(x, y, width, bodyHeight);
  clearGlow(ctx);

  if (lane.kind === "racer") {
    ctx.fillStyle = skin.road;
    ctx.fillRect(x, centerY - 2, width, 4);
  }
}

// Tractor: cuerpo de 28×24 y dos ruedas traseras más grandes, del lado contrario a su avance.
function drawTractor(
  ctx: CanvasRenderingContext2D,
  skin: FroggerSkin,
  entity: Entity,
  lane: Lane,
): void {
  const width = 28;
  const height = 24;
  const x = entity.x + (CELL - width) / 2;
  const y = lane.row * CELL + CELL / 2 - height / 2;
  const rearX = lane.velocity > 0 ? x : x + width - 12;
  const color = vehicleColor(lane, skin);

  drawWheel(ctx, skin, rearX, y - 5, 12, 10);
  drawWheel(ctx, skin, rearX, y + height - 5, 12, 10);

  applyGlow(ctx, skin, color);
  ctx.fillStyle = color;
  ctx.fillRect(x, y, width, height);
  clearGlow(ctx);
}

// Camión: caja de 56×26 y cabina de 20×26 del lado hacia donde avanza.
function drawTruck(
  ctx: CanvasRenderingContext2D,
  skin: FroggerSkin,
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
  const color = vehicleColor(lane, skin);

  drawWheelPair(ctx, skin, boxX + 6, y, height);
  drawWheelPair(ctx, skin, boxX + boxWidth - 14, y, height);

  applyGlow(ctx, skin, color);
  ctx.fillStyle = color;
  ctx.fillRect(boxX, y, boxWidth, height);
  applyGlow(ctx, skin, skin.truckCab);
  ctx.fillStyle = skin.truckCab;
  ctx.fillRect(cabX, y, cabWidth, height);
  clearGlow(ctx);
}

// Tronco: rectángulo redondeado con dos líneas horizontales de textura.
function drawLog(
  ctx: CanvasRenderingContext2D,
  skin: FroggerSkin,
  entity: Entity,
  lane: Lane,
): void {
  const width = lane.length * CELL - 4;
  const height = 30;
  const x = entity.x + 2;
  const y = lane.row * CELL + CELL / 2 - height / 2;

  applyGlow(ctx, skin, skin.logLine);
  ctx.fillStyle = skin.log;
  ctx.beginPath();
  ctx.roundRect(x, y, width, height, 8);
  ctx.fill();
  ctx.strokeStyle = skin.logLine;
  ctx.lineWidth = skin.lineWidth;
  for (let vein = 1; vein <= 2; vein++) {
    const lineY = y + vein * 10;
    ctx.beginPath();
    ctx.moveTo(x + 6, lineY);
    ctx.lineTo(x + width - 6, lineY);
    ctx.stroke();
  }
  clearGlow(ctx);
}

// Grupo de tortugas: un círculo de 15 px de radio por celda, con la cabeza hacia donde avanzan.
function drawTurtles(
  ctx: CanvasRenderingContext2D,
  skin: FroggerSkin,
  entity: Entity,
  lane: Lane,
  state: TurtleState,
): void {
  const direction = lane.velocity > 0 ? 1 : -1;
  const centerY = lane.row * CELL + CELL / 2;
  const shell = state === "visible" ? skin.turtle : skin.turtleSinking;

  applyGlow(ctx, skin, shell);
  for (let i = 0; i < lane.length; i++) {
    const centerX = entity.x + i * CELL + CELL / 2;
    if (state === "submerged") {
      ctx.strokeStyle = skin.turtleSinking;
      ctx.lineWidth = skin.lineWidth;
      ctx.beginPath();
      ctx.arc(centerX, centerY, 15, 0, Math.PI * 2);
      ctx.stroke();
      continue;
    }
    ctx.fillStyle = skin.turtleHead;
    ctx.beginPath();
    ctx.arc(centerX + direction * 15, centerY, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = shell;
    ctx.beginPath();
    ctx.arc(centerX, centerY, 15, 0, Math.PI * 2);
    ctx.fill();
  }
  clearGlow(ctx);
}

// Dibuja una entidad de carril según su tipo. La usan el dibujo en vivo y el constructor de sprites con glow.
export function drawLaneEntity(
  ctx: CanvasRenderingContext2D,
  skin: FroggerSkin,
  entity: Entity,
  lane: Lane,
  turtle: TurtleState,
): void {
  switch (lane.kind) {
    case "car":
      drawCar(ctx, skin, entity, lane, 24);
      break;
    case "racer":
      drawCar(ctx, skin, entity, lane, 18);
      break;
    case "tractor":
      drawTractor(ctx, skin, entity, lane);
      break;
    case "truck":
      drawTruck(ctx, skin, entity, lane);
      break;
    case "log":
      drawLog(ctx, skin, entity, lane);
      break;
    case "turtles":
      drawTurtles(ctx, skin, entity, lane, turtle);
      break;
  }
}

function drawLanes(
  ctx: CanvasRenderingContext2D,
  skin: FroggerSkin,
  lanes: Lane[],
  clock: number,
  sprites: GlowSpriteCache | null,
): void {
  for (const lane of lanes) {
    const laneSprites = sprites?.lanes[lane.row];
    for (const entity of lane.entities) {
      // Solo las entidades que se ven en pantalla.
      if (entity.x + lane.length * CELL <= 0 || entity.x >= WIDTH) continue;
      const turtle = turtleState(lane, entity, clock);
      if (laneSprites) {
        const sprite =
          turtle === "sinking" && laneSprites.sinking
            ? laneSprites.sinking
            : turtle === "submerged" && laneSprites.submerged
              ? laneSprites.submerged
              : laneSprites.body;
        ctx.drawImage(
          sprite.canvas,
          Math.round(entity.x) - sprite.pad,
          lane.row * CELL - sprite.pad,
        );
      } else {
        drawLaneEntity(ctx, skin, entity, lane, turtle);
      }
    }
  }
}

// Rana: elipse de 28×24 con borde, ojos hacia `facing` y cuatro patas que se separan al saltar.
export function drawFrog(
  ctx: CanvasRenderingContext2D,
  skin: FroggerSkin,
  x: number,
  y: number,
  facing: Facing,
  hopping: boolean,
): void {
  const centerX = x + CELL / 2;
  const centerY = y + CELL / 2;
  const spread = hopping ? 4 : 0;
  const forward = FACING_VECTORS[facing];
  const sideX = -forward.y;
  const sideY = forward.x;

  applyGlow(ctx, skin, skin.frog);
  ctx.fillStyle = skin.frogDark;
  for (const legX of SIGNS) {
    for (const legY of SIGNS) {
      ctx.fillRect(
        centerX + legX * (11 + spread) - 3,
        centerY + legY * (10 + spread) - 2,
        6,
        4,
      );
    }
  }

  ctx.fillStyle = skin.frog;
  ctx.strokeStyle = skin.frogDark;
  ctx.lineWidth = skin.lineWidth;
  ctx.beginPath();
  ctx.ellipse(centerX, centerY, 14, 12, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  clearGlow(ctx);

  for (const sign of SIGNS) {
    const eyeX = centerX + forward.x * 8 + sideX * sign * 6;
    const eyeY = centerY + forward.y * 8 + sideY * sign * 6;
    ctx.fillStyle = skin.eye;
    ctx.beginPath();
    ctx.arc(eyeX, eyeY, 2.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = skin.pupil;
    ctx.beginPath();
    ctx.arc(eyeX + forward.x, eyeY + forward.y, 1, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawOccupiedGoals(
  ctx: CanvasRenderingContext2D,
  skin: FroggerSkin,
  goals: boolean[],
  sprites: GlowSpriteCache | null,
): void {
  for (let index = 0; index < goals.length; index++) {
    if (!goals[index]) continue;
    const centerX = (GOAL_COLS[index] + GOAL_SPAN / 2) * CELL;
    if (sprites) {
      const { canvas, pad } = sprites.frogIdle;
      ctx.drawImage(canvas, centerX - CELL / 2 - pad, GOAL_ROW * CELL - pad);
    } else {
      drawFrog(ctx, skin, centerX - CELL / 2, GOAL_ROW * CELL, "up", false);
    }
  }
}

// Marca de choque: una «X» en la celda donde murió la rana.
function drawSplat(
  ctx: CanvasRenderingContext2D,
  skin: FroggerSkin,
  x: number,
  row: number,
): void {
  const centerX = x + CELL / 2;
  const centerY = row * CELL + CELL / 2;
  const half = SPLAT_SIZE / 2;

  applyGlow(ctx, skin, skin.splat);
  ctx.strokeStyle = skin.splat;
  ctx.lineWidth = SPLAT_WIDTH;
  ctx.beginPath();
  ctx.moveTo(centerX - half, centerY - half);
  ctx.lineTo(centerX + half, centerY + half);
  ctx.moveTo(centerX + half, centerY - half);
  ctx.lineTo(centerX - half, centerY + half);
  ctx.stroke();
  clearGlow(ctx);
}

// Color de la barra de tiempo según lo que queda del viaje.
export function timerColor(skin: FroggerSkin, fraction: number): string {
  return fraction > 0.5
    ? skin.timerBar
    : fraction > 0.25
      ? skin.timerWarn
      : skin.timerDanger;
}

function drawTimerBar(
  ctx: CanvasRenderingContext2D,
  skin: FroggerSkin,
  fraction: number,
): void {
  const clamped = Math.max(0, Math.min(1, fraction));
  const color = timerColor(skin, clamped);
  applyGlow(ctx, skin, color);
  ctx.fillStyle = color;
  ctx.fillRect(
    0,
    TIMER_ROW * CELL + (CELL - TIMER_BAR_HEIGHT) / 2,
    WIDTH * clamped,
    TIMER_BAR_HEIGHT,
  );
  clearGlow(ctx);
}

// La marca de choque se ve fija al terminar la partida y parpadea mientras la rana muere.
export function splatVisible(state: RenderState): boolean {
  return (
    state.phase === "gameover" ||
    Math.floor(state.deathTimer / SPLAT_BLINK) % 2 === 0
  );
}

export function drawGame(
  ctx: CanvasRenderingContext2D,
  state: RenderState,
  skin: FroggerSkin,
  sprites: GlowSpriteCache | null,
): void {
  clearGlow(ctx);
  drawBackground(ctx, skin);
  drawLanes(ctx, skin, state.lanes, state.clock, sprites);
  drawOccupiedGoals(ctx, skin, state.goals, sprites);

  if (state.phase === "playing") {
    const { frog } = state;
    drawFrog(ctx, skin, frog.x, frog.y, frog.facing, frog.hopping);
  } else if (splatVisible(state)) {
    drawSplat(ctx, skin, state.deathX, state.deathRow);
  }

  drawTimerBar(ctx, skin, state.tripFraction);
}
