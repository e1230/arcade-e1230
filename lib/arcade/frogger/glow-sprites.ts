// Caché de sprites con glow de FROGGER (solo Neón). `shadowBlur` es caro de rasterizar en cada frame, así
// que cada vehículo, tronco y tortuga se dibuja una vez, con el glow ya horneado, en un canvas pequeño
// que `render.ts` copia con `drawImage`. Los sprites reutilizan las mismas funciones de dibujo del modo
// en vivo, así que el resultado es el mismo dibujo.

import { CELL, LANES } from "@/lib/arcade/frogger/constants";
import type { Entity, Lane, TurtleState } from "@/lib/arcade/frogger/lanes";
import { drawFrog, drawLaneEntity } from "@/lib/arcade/frogger/render";
import type { FroggerSkin } from "@/lib/arcade/frogger/skins";

export interface GlowSprite {
  canvas: HTMLCanvasElement;
  pad: number; // px de margen para que el blur no se recorte
}

export interface LaneSprites {
  body: GlowSprite; // vehículo, tronco o tortuga visible
  sinking: GlowSprite | null; // solo tortugas: grupo hundiéndose
  submerged: GlowSprite | null; // solo tortugas: solo el contorno
}

export interface GlowSpriteCache {
  lanes: (LaneSprites | undefined)[]; // índice = fila del tablero; las filas de LANES son únicas
  frogIdle: GlowSprite; // rana mirando arriba, para las bocas ocupadas
}

const ENTITY: Entity = { x: 0, dives: false };

function createSprite(
  skin: FroggerSkin,
  cells: number,
  paint: (ctx: CanvasRenderingContext2D) => void,
): GlowSprite {
  const pad = skin.glow * 2; // sigma del blur = glow / 2; 4 sigmas no se recortan
  const canvas = document.createElement("canvas");
  canvas.width = cells * CELL + 2 * pad;
  canvas.height = CELL + 2 * pad;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("No se pudo obtener el contexto 2D del sprite");
  ctx.translate(pad, pad);
  paint(ctx);
  return { canvas, pad };
}

export function createGlowSpriteCache(skin: FroggerSkin): GlowSpriteCache {
  const lanes: (LaneSprites | undefined)[] = [];
  for (const config of LANES) {
    if (lanes[config.row]) {
      throw new Error(`Fila duplicada en LANES: ${config.row}`);
    }
    // Carril sintético en la fila 0: la entidad queda en (0, 0). Solo importan el tipo, el largo, el signo y el color.
    const lane: Lane = {
      row: 0,
      kind: config.kind,
      length: config.length,
      velocity: config.dir,
      colorRole: config.colorRole ?? null,
      turtlePhase: 0,
      entities: [],
    };
    const make = (turtle: TurtleState): GlowSprite =>
      createSprite(skin, config.length, (ctx) =>
        drawLaneEntity(ctx, skin, ENTITY, lane, turtle),
      );
    const isTurtles = config.kind === "turtles";
    lanes[config.row] = {
      body: make("visible"),
      sinking: isTurtles ? make("sinking") : null,
      submerged: isTurtles ? make("submerged") : null,
    };
  }
  const frogIdle = createSprite(skin, 1, (ctx) =>
    drawFrog(ctx, skin, 0, 0, "up", false),
  );
  return { lanes, frogIdle };
}
