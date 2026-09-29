import type { GameDefinition } from "@/lib/arcade/engine";
import { HEIGHT, WIDTH } from "@/lib/arcade/tetris/constants";
import { createTetrisEngine } from "@/lib/arcade/tetris/game";

export const tetrisDefinition: GameDefinition = {
  width: WIDTH,
  height: HEIGHT,
  controls: [
    { keys: "← →", action: "MOVER" },
    { keys: "↑ X", action: "ROTAR" },
    { keys: "↓", action: "BAJAR" },
    { keys: "ESPACIO", action: "CAÍDA" },
    { keys: "P", action: "PAUSA" },
  ],
  hud: { lives: false }, // Tetris no tiene vidas
  create: createTetrisEngine,
};
