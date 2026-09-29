// Spritesheet de la referencia: recortes de `assets/spritesheet.js` y funciones de dibujo.
// No guarda estado de módulo: cada `loadSprites()` crea su propio `Image`.

import {
  EXPLOSION_FRAME_COUNT,
  SPRITESHEET_URL,
} from "@/lib/arcade/arkanoid/constants";
import type { BlockColor } from "@/lib/arcade/arkanoid/levels";

interface Rect {
  sx: number;
  sy: number;
  sw: number;
  sh: number;
}

const PADDLE: Rect = { sx: 32, sy: 112, sw: 162, sh: 14 };
const BALL: Rect = { sx: 32, sy: 32, sw: 16, sh: 16 };

const BLOCKS: Record<BlockColor, Rect> = {
  gray: { sx: 32, sy: 288, sw: 32, sh: 16 },
  red: { sx: 32, sy: 176, sw: 32, sh: 16 },
  yellow: { sx: 32, sy: 240, sw: 32, sh: 16 },
  cyan: { sx: 32, sy: 192, sw: 32, sh: 16 },
  magenta: { sx: 32, sy: 224, sw: 32, sh: 16 },
  hotpink: { sx: 32, sy: 256, sw: 32, sh: 16 },
  green: { sx: 32, sy: 208, sw: 32, sh: 16 },
};

const EXPLOSION_SX = [256, 288, 320, 352] as const;
const EXPLOSION_SIZE = { sw: 32, sh: 16 } as const;

// `gray` usa las mismas coordenadas que `red`, igual que la referencia: es un
// descuido suyo que el port conserva para no cambiar el aspecto.
const EXPLOSION_SY: Record<BlockColor, number> = {
  gray: 176,
  red: 176,
  cyan: 192,
  green: 208,
  magenta: 224,
  yellow: 240,
  hotpink: 256,
};

export interface Sprites {
  isReady(): boolean; // false hasta que carga la imagen
  drawBlock(
    ctx: CanvasRenderingContext2D,
    color: BlockColor,
    x: number,
    y: number,
    w: number,
    h: number,
  ): void;
  drawExplosion(
    ctx: CanvasRenderingContext2D,
    color: BlockColor,
    frame: number,
    x: number,
    y: number,
    w: number,
    h: number,
  ): void;
  drawPaddle(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    w: number,
    h: number,
  ): void;
  drawBall(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    w: number,
    h: number,
  ): void;
  dispose(): void; // suelta los callbacks de carga
}

// Crea el `Image` y lo carga desde SPRITESHEET_URL. Solo se llama desde `create()`.
export function loadSprites(): Sprites {
  const image = new Image();
  let ready = false;

  image.onload = () => {
    ready = true;
  };
  image.onerror = () => {
    console.error(`No se pudo cargar el spritesheet: ${SPRITESHEET_URL}`);
  };
  image.src = SPRITESHEET_URL;

  function draw(
    ctx: CanvasRenderingContext2D,
    { sx, sy, sw, sh }: Rect,
    x: number,
    y: number,
    w: number,
    h: number,
  ): void {
    if (!ready) return;
    ctx.drawImage(image, sx, sy, sw, sh, x, y, w, h);
  }

  return {
    isReady: () => ready,
    drawBlock: (ctx, color, x, y, w, h) => draw(ctx, BLOCKS[color], x, y, w, h),
    drawExplosion: (ctx, color, frame, x, y, w, h) => {
      const index = Math.max(0, Math.min(EXPLOSION_FRAME_COUNT - 1, frame));
      draw(
        ctx,
        {
          sx: EXPLOSION_SX[index],
          sy: EXPLOSION_SY[color],
          ...EXPLOSION_SIZE,
        },
        x,
        y,
        w,
        h,
      );
    },
    drawPaddle: (ctx, x, y, w, h) => draw(ctx, PADDLE, x, y, w, h),
    drawBall: (ctx, x, y, w, h) => draw(ctx, BALL, x, y, w, h),
    dispose: () => {
      image.onload = null;
      image.onerror = null;
    },
  };
}
