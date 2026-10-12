// Skins de FROGGER: cada una define todos los colores y trazos que usa el motor al dibujar.

import type { SkinId } from "@/lib/arcade/engine";
import { RETRO_8BIT } from "@/lib/arcade/shared/skins";

// Rol de color de cada carril de vehículos: LANES lo guarda y el render lo resuelve con la skin.
export type VehicleColorRole =
  "carYellow" | "carPink" | "racer" | "tractor" | "truck";

export interface FroggerSkin {
  // Terreno
  road: string; // carretera, barra de tiempo y fondo general del canvas
  river: string; // río e interior de las bocas
  safe: string; // mediana y fila de inicio
  safeEdge: string; // línea de 2 px (1 píxel lógico en Retro) arriba y abajo de cada franja segura
  hedge: string; // relleno del seto de la fila de metas
  hedgeLine: string; // cuadros del seto y borde de las bocas
  riverMark: string | null; // ondas del río; null = no se dibujan (solo Retro)
  roadMark: string | null; // rayas entre carriles; null = no se dibujan (solo Retro)
  // Barra de tiempo
  timerBar: string; // más del 50 %
  timerWarn: string; // entre 25 % y 50 %
  timerDanger: string; // menos del 25 %
  // Rana
  frog: string;
  frogDark: string; // borde y patas
  eye: string;
  pupil: string;
  // Vehículos
  carYellow: string; // fila 12
  carPink: string; // fila 10
  racer: string; // fila 9
  tractor: string; // fila 11
  truck: string; // fila 8, caja
  truckCab: string; // fila 8, cabina
  wheel: string;
  // Río
  log: string;
  logLine: string; // vetas del tronco
  turtle: string; // caparazón
  turtleHead: string;
  turtleSinking: string; // grupo hundiéndose (todavía sostiene) y contorno del sumergido
  // Marca de choque
  splat: string;
  // Estilo
  lineWidth: number; // grosor de trazos (rana, bocas, vetas, tortuga sumergida), en px internos (800×600)
  glow: number; // shadowBlur en px; 0 = sin glow (solo Neón lo usa)
  pixelScale: number; // 1 = dibujo vectorial; >1 = pixel art en un búfer reducido
}

export const SKINS: Record<SkinId, FroggerSkin> = {
  classic: {
    road: "#000000", // arcade: carretera negra
    river: "#000047", // arcade: agua azul oscuro
    safe: "#1f0f36", // arcade: violeta, oscurecido
    safeEdge: "#8548c0", // arcade: #5b2a86 aclarado
    hedge: "#071c07", // arcade: verde, oscurecido
    hedgeLine: "#1f8f1f", // arcade: verde del seto
    riverMark: null,
    roadMark: null,
    timerBar: "#00e000",
    timerWarn: "#ffd800",
    timerDanger: "#ff2020",
    frog: "#3ee03e",
    frogDark: "#1a7a1a",
    eye: "#ffffff",
    pupil: "#000000",
    carYellow: "#ffd800",
    carPink: "#ff4fd8",
    racer: "#ffffff",
    tractor: "#30c0ff",
    truck: "#e0e0e0",
    truckCab: "#ff3030",
    wheel: "#808080",
    log: "#96511f",
    logLine: "#2e1405",
    turtle: "#c0392b",
    turtleHead: "#2ecc40",
    turtleSinking: "#8c5a4a",
    splat: "#ff2020",
    lineWidth: 2,
    glow: 0,
    pixelScale: 1,
  },
  neon: {
    road: "#05050a", // --deep
    river: "#05181e", // --neon-cyan al 8 % sobre --deep
    safe: "#190927", // --neon-purple al 12 % sobre --deep
    safeEdge: "#b026ff", // --neon-purple
    hedge: "#051e17", // --neon-green al 10 % sobre --deep
    hedgeLine: "#037643", // --neon-green al 45 % sobre --deep
    riverMark: null,
    roadMark: null,
    timerBar: "#00ff88", // --neon-green
    timerWarn: "#f5ff00", // --neon-yellow
    timerDanger: "#ff006e", // --neon-pink
    frog: "#00ff88", // --neon-green
    frogDark: "#02a75c", // --neon-green al 65 % sobre --deep
    eye: "#e6f7ff", // --foreground
    pupil: "#05050a", // --deep
    carYellow: "#f5ff00", // --neon-yellow
    carPink: "#ff006e", // --neon-pink
    racer: "#00f5ff", // --neon-cyan
    tractor: "#ff8c42", // --bronze
    truck: "#b9c6d4", // --text-soft
    truckCab: "#ff006e", // --neon-pink
    wheel: "#6d7d90", // --subtle
    log: "#995428", // --bronze al 60 % de intensidad
    logLine: "#ff8c42", // --bronze
    turtle: "#b026ff", // --neon-purple
    turtleHead: "#00f5ff", // --neon-cyan
    turtleSinking: "#6d7d90", // --subtle
    splat: "#ff006e", // --neon-pink
    lineWidth: 2,
    glow: 8,
    pixelScale: 1,
  },
  retro: {
    road: RETRO_8BIT.background,
    river: RETRO_8BIT.background,
    safe: RETRO_8BIT.background,
    safeEdge: RETRO_8BIT.lavender,
    hedge: RETRO_8BIT.background,
    hedgeLine: RETRO_8BIT.green,
    riverMark: RETRO_8BIT.blue,
    roadMark: RETRO_8BIT.lavender,
    timerBar: RETRO_8BIT.green,
    timerWarn: RETRO_8BIT.yellow,
    timerDanger: RETRO_8BIT.red,
    frog: RETRO_8BIT.green,
    frogDark: RETRO_8BIT.lavender,
    eye: RETRO_8BIT.white,
    pupil: RETRO_8BIT.background,
    carYellow: RETRO_8BIT.yellow,
    carPink: RETRO_8BIT.pink,
    racer: RETRO_8BIT.white,
    tractor: RETRO_8BIT.blue,
    truck: RETRO_8BIT.white,
    truckCab: RETRO_8BIT.red,
    wheel: RETRO_8BIT.lavender,
    log: RETRO_8BIT.lavender,
    logLine: RETRO_8BIT.background,
    turtle: RETRO_8BIT.red,
    turtleHead: RETRO_8BIT.orange,
    turtleSinking: RETRO_8BIT.lavender,
    splat: RETRO_8BIT.red,
    lineWidth: 5, // en píxeles, cada trazo mide 1 píxel lógico (= pixelScale)
    glow: 0,
    pixelScale: 5,
  },
};
