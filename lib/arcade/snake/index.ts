import type { GameDefinition } from "@/lib/arcade/engine";
import { HEIGHT, WIDTH } from "@/lib/arcade/snake/constants";
import { createSnakeEngine } from "@/lib/arcade/snake/game";

export const snakeDefinition: GameDefinition = {
  width: WIDTH,
  height: HEIGHT,
  controls: [
    { keys: "← ↑ ↓ → / W A S D", action: "MOVER" },
    { keys: "P", action: "PAUSA" },
  ],
  create: createSnakeEngine,
};
