// Constantes de jugabilidad de FROGGER. No hay referencia que portar: son los valores acordados en el SPEC 11.
// Los tiempos van en segundos y las velocidades en px/s.

import type { VehicleColorRole } from "@/lib/arcade/frogger/skins";

export const WIDTH = 800;
export const HEIGHT = 600;

export const CELL = 40; // px por celda
export const COLS = 20;
export const ROWS = 15;

// Filas del tablero, de arriba (0) hacia abajo (14).
export const GOAL_ROW = 0; // seto con las 5 bocas
export const RIVER_TOP = 1;
export const RIVER_BOTTOM = 6;
export const MEDIAN_ROW = 7; // franja segura
export const ROAD_TOP = 8;
export const ROAD_BOTTOM = 12;
export const START_ROW = 13; // franja segura donde aparece la rana
export const TIMER_ROW = 14; // barra de tiempo, no se puede pisar
export const START_COL = 9; // x = 360

export const GOAL_COLS = [1, 5, 9, 13, 17] as const; // columna izquierda de cada boca
export const GOAL_SPAN = 2; // columnas que ocupa cada boca

export const INITIAL_LIVES = 3;

export const HOP_TIME = 0.12; // s que dura un salto
export const DEATH_DELAY = 1; // s de marca de choque antes de reaparecer

// Tiempo del viaje: max(TRIP_TIME_MIN, TRIP_TIME_BASE − TRIP_TIME_STEP × (nivel − 1)).
export const TRIP_TIME_BASE = 15;
export const TRIP_TIME_STEP = 0.5;
export const TRIP_TIME_MIN = 10; // se alcanza en el nivel 11

// Velocidad de los carriles: min(SPEED_MAX_FACTOR, 1 + SPEED_STEP × (nivel − 1)).
export const SPEED_STEP = 0.15;
export const SPEED_MAX_FACTOR = 2.5; // se alcanza en el nivel 11

export const LANE_EXTRA = 160; // px fuera de pantalla a cada lado (4 celdas)
export const LANE_LOOP = WIDTH + 2 * LANE_EXTRA; // 1120 px

export const FROG_INSET = 8; // px de margen lateral del hitbox de la rana
export const VEHICLE_INSET = 4; // px de margen lateral del hitbox de cada vehículo

// Ciclo de inmersión de las tortugas: visible de 0 a 3 s, hundiéndose de 3 a 3,5 s y bajo el agua de 3,5 a 5 s.
export const TURTLE_CYCLE = 5;
export const TURTLE_VISIBLE_TIME = 3;
export const TURTLE_SINKING_TIME = 3.5;

export const POINTS_STEP = 10; // por fila nueva alcanzada en el viaje
export const POINTS_GOAL = 50; // por boca ocupada
export const POINTS_TIME = 10; // por segundo entero restante al ocupar una boca
export const POINTS_ROUND = 200; // al llenar las 5 bocas

export const SCORE_MAX = 9_999_999; // tope del CHECK de `scores`

export const MAX_DT = 0.05; // s, tope del salto de tiempo por frame

export function speedFactor(level: number): number {
  return Math.min(SPEED_MAX_FACTOR, 1 + SPEED_STEP * (level - 1));
}

export function tripTime(level: number): number {
  return Math.max(TRIP_TIME_MIN, TRIP_TIME_BASE - TRIP_TIME_STEP * (level - 1));
}

export type LaneKind =
  "car" | "racer" | "tractor" | "truck" | "log" | "turtles";

export interface LaneConfig {
  row: number;
  kind: LaneKind;
  length: number; // celdas de cada entidad
  count: number; // entidades repartidas a intervalos iguales en LANE_LOOP
  speed: number; // px/s en el nivel 1
  dir: 1 | -1; // 1 derecha, -1 izquierda
  offset: number; // px de desfase de la primera entidad
  colorRole?: VehicleColorRole; // solo vehículos: el color lo resuelve la skin
  turtlePhase?: number; // solo tortugas: s de desfase del ciclo de inmersión (el grupo 0 se sumerge)
}

export const LANES: readonly LaneConfig[] = [
  // Río
  { row: 1, kind: "log", length: 3, count: 4, speed: 40, dir: -1, offset: 20 },
  { row: 2, kind: "log", length: 2, count: 5, speed: 55, dir: 1, offset: 100 },
  {
    row: 3,
    kind: "turtles",
    length: 2,
    count: 5,
    speed: 60,
    dir: -1,
    offset: 40,
    turtlePhase: 2.5,
  },
  { row: 4, kind: "log", length: 4, count: 3, speed: 70, dir: 1, offset: 160 },
  { row: 5, kind: "log", length: 3, count: 4, speed: 45, dir: 1, offset: 80 },
  {
    row: 6,
    kind: "turtles",
    length: 3,
    count: 4,
    speed: 55,
    dir: -1,
    offset: 0,
    turtlePhase: 0,
  },
  // Carretera
  {
    row: 8,
    kind: "truck",
    length: 2,
    count: 3,
    speed: 70,
    dir: -1,
    offset: 40,
    colorRole: "truck",
  },
  {
    row: 9,
    kind: "racer",
    length: 1,
    count: 2,
    speed: 150,
    dir: 1,
    offset: 200,
    colorRole: "racer",
  },
  {
    row: 10,
    kind: "car",
    length: 1,
    count: 4,
    speed: 80,
    dir: -1,
    offset: 60,
    colorRole: "carPink",
  },
  {
    row: 11,
    kind: "tractor",
    length: 1,
    count: 3,
    speed: 50,
    dir: 1,
    offset: 120,
    colorRole: "tractor",
  },
  {
    row: 12,
    kind: "car",
    length: 1,
    count: 4,
    speed: 60,
    dir: -1,
    offset: 0,
    colorRole: "carYellow",
  },
];
