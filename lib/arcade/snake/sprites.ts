// Atlas de frutas de `references/source-assets/snake-assets/sprites.js` y función de dibujo.
// No guarda estado de módulo: cada `loadFruitSprites()` crea su propio `Image`.

import {
  CELL,
  FRUIT_BOX,
  FRUIT_SPRITESHEET_URL,
} from "@/lib/arcade/snake/constants";

interface Rect {
  sx: number;
  sy: number;
  sw: number;
  sh: number;
}

// Todas las frutas están en la fila del medio de la hoja (y = 136, alto 160).
const ROW_Y = 136;
const ROW_H = 160;

function fruit(sx: number, sw: number): Rect {
  return { sx, sy: ROW_Y, sw, sh: ROW_H };
}

// En el orden del atlas de `sprites.js`.
const FRUITS: readonly Rect[] = [
  fruit(34, 110), // banana
  fruit(186, 150), // orange
  fruit(378, 110), // grape
  fruit(540, 130), // garlic
  fruit(712, 130), // eggplant
  fruit(894, 110), // strawberry
  fruit(1066, 110), // cherry
  fruit(1228, 130), // carrot
  fruit(1400, 130), // mushroom
  fruit(1582, 110), // broccoli
  fruit(1734, 150), // watermelon
  fruit(1906, 150), // pepper
  fruit(2068, 170), // kiwi
  fruit(2250, 140), // lemon
  fruit(2432, 130), // peach
  fruit(2604, 130), // peanut
  fruit(2786, 110), // apple
  fruit(2948, 130), // tomato
  fruit(3110, 150), // berries
  fruit(3302, 110), // grapes2
  fruit(3454, 150), // pineapple
  fruit(3637, 130), // melon
];

export const FRUIT_COUNT = FRUITS.length; // 22

export interface FruitSprites {
  isReady(): boolean; // false hasta que carga la imagen
  drawFruit(
    ctx: CanvasRenderingContext2D,
    fruitIndex: number, // 0 a FRUIT_COUNT − 1
    col: number,
    row: number,
  ): void;
  dispose(): void; // suelta los callbacks de carga
}

// Crea el `Image` y lo carga desde FRUIT_SPRITESHEET_URL. Solo se llama desde `create()`.
export function loadFruitSprites(): FruitSprites {
  const image = new Image();
  let ready = false;

  image.onload = () => {
    ready = true;
  };
  image.onerror = () => {
    console.error(`No se pudo cargar el spritesheet: ${FRUIT_SPRITESHEET_URL}`);
  };
  image.src = FRUIT_SPRITESHEET_URL;

  return {
    isReady: () => ready,
    drawFruit(ctx, fruitIndex, col, row) {
      if (!ready) return;
      const { sx, sy, sw, sh } = FRUITS[fruitIndex];
      // Escala sin deformar: el recorte entra en FRUIT_BOX × FRUIT_BOX y se centra en la celda.
      const scale = Math.min(FRUIT_BOX / sw, FRUIT_BOX / sh);
      const w = sw * scale;
      const h = sh * scale;
      const x = col * CELL + (CELL - w) / 2;
      const y = row * CELL + (CELL - h) / 2;
      ctx.drawImage(image, sx, sy, sw, sh, x, y, w, h);
    },
    dispose() {
      image.onload = null;
      image.onerror = null;
    },
  };
}
