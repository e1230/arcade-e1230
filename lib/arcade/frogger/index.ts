import type { GameDefinition } from "@/lib/arcade/engine";
import { HEIGHT, WIDTH } from "@/lib/arcade/frogger/constants";
import { createFroggerEngine } from "@/lib/arcade/frogger/game";
import { SKIN_IDS } from "@/lib/arcade/shared/skins";

export const froggerDefinition: GameDefinition = {
  width: WIDTH,
  height: HEIGHT,
  controls: [
    { keys: "← ↑ ↓ → / W A S D", action: "SALTAR" },
    { keys: "P", action: "PAUSA" },
  ],
  skins: SKIN_IDS,
  // El motor solo lee saltos en cuatro direcciones: no hay botones A/B.
  touch: {
    up: "ArrowUp",
    down: "ArrowDown",
    left: "ArrowLeft",
    right: "ArrowRight",
  },
  create: createFroggerEngine,
};
