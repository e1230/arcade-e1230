// Carriles de FROGGER: entidades que se mueven en loop, soporte del río y choques con vehículos.
// Lógica pura, sin DOM: la usan `game.ts` y `render.ts`.

import { wrap } from "@/lib/arcade/shared/math";
import {
  CELL,
  LANE_EXTRA,
  LANE_LOOP,
  LANES,
  TURTLE_CYCLE,
  TURTLE_SINKING_TIME,
  TURTLE_VISIBLE_TIME,
  VEHICLE_INSET,
  speedFactor,
  type LaneKind,
} from "@/lib/arcade/frogger/constants";
import type { VehicleColorRole } from "@/lib/arcade/frogger/skins";

export interface Entity {
  x: number; // px del borde izquierdo, entre −LANE_EXTRA y WIDTH + LANE_EXTRA
  dives: boolean; // solo tortugas: este grupo se sumerge
}

export interface Lane {
  row: number;
  kind: LaneKind;
  length: number; // celdas de cada entidad
  velocity: number; // px/s con signo, ya multiplicada por speedFactor(level)
  colorRole: VehicleColorRole | null; // solo vehículos; null en troncos y tortugas
  turtlePhase: number; // s de desfase del ciclo de inmersión
  entities: Entity[];
}

export type TurtleState = "visible" | "sinking" | "submerged";

function isVehicle(kind: LaneKind): boolean {
  return kind !== "log" && kind !== "turtles";
}

export function buildLanes(level: number): Lane[] {
  const factor = speedFactor(level);
  return LANES.map((config) => {
    const spacing = LANE_LOOP / config.count;
    const entities: Entity[] = [];
    for (let i = 0; i < config.count; i++) {
      entities.push({
        x: wrap(config.offset + i * spacing, LANE_LOOP) - LANE_EXTRA,
        dives: config.kind === "turtles" && i === 0,
      });
    }
    return {
      row: config.row,
      kind: config.kind,
      length: config.length,
      velocity: config.dir * config.speed * factor,
      colorRole: config.colorRole ?? null,
      turtlePhase: config.turtlePhase ?? 0,
      entities,
    };
  });
}

// Como ninguna entidad mide más de 4 celdas (LANE_EXTRA), desaparece del todo antes de reaparecer.
export function moveLanes(lanes: Lane[], dt: number): void {
  for (const lane of lanes) {
    for (const entity of lane.entities) {
      entity.x =
        wrap(entity.x + lane.velocity * dt + LANE_EXTRA, LANE_LOOP) -
        LANE_EXTRA;
    }
  }
}

export function turtleState(
  lane: Lane,
  entity: Entity,
  clock: number,
): TurtleState {
  if (lane.kind !== "turtles" || !entity.dives) return "visible";
  const t = wrap(clock + lane.turtlePhase, TURTLE_CYCLE);
  if (t < TURTLE_VISIBLE_TIME) return "visible";
  if (t < TURTLE_SINKING_TIME) return "sinking";
  return "submerged";
}

// Carril del río que sostiene el centro de la rana, o null. Un grupo hundiéndose todavía sostiene.
export function findSupport(
  lanes: Lane[],
  row: number,
  centerX: number,
  clock: number,
): Lane | null {
  for (const lane of lanes) {
    if (lane.row !== row || isVehicle(lane.kind)) continue;
    for (const entity of lane.entities) {
      if (centerX < entity.x || centerX >= entity.x + lane.length * CELL) {
        continue;
      }
      if (turtleState(lane, entity, clock) !== "submerged") return lane;
    }
  }
  return null;
}

export function hitsVehicle(
  lanes: Lane[],
  row: number,
  left: number,
  right: number,
): boolean {
  for (const lane of lanes) {
    if (lane.row !== row || !isVehicle(lane.kind)) continue;
    for (const entity of lane.entities) {
      const vehicleLeft = entity.x + VEHICLE_INSET;
      const vehicleRight = entity.x + lane.length * CELL - VEHICLE_INSET;
      if (left < vehicleRight && right > vehicleLeft) return true;
    }
  }
  return false;
}
