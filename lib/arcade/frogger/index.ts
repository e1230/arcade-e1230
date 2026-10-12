import type { GameDefinition } from "@/lib/arcade/engine";
import { HEIGHT, WIDTH } from "@/lib/arcade/frogger/constants";
import { createFroggerEngine } from "@/lib/arcade/frogger/game";

export const froggerDefinition: GameDefinition = {
  width: WIDTH,
  height: HEIGHT,
  controls: [
    { keys: "← ↑ ↓ → / W A S D", action: "SALTAR" },
    { keys: "P", action: "PAUSA" },
  ],
  // El motor solo lee saltos en cuatro direcciones: no hay botones A/B.
  touch: {
    up: "ArrowUp",
    down: "ArrowDown",
    left: "ArrowLeft",
    right: "ArrowRight",
  },
  create: createFroggerEngine,
};
