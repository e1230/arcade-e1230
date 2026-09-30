import type { GameDefinition } from "@/lib/arcade/engine";
import { HEIGHT, WIDTH } from "@/lib/arcade/asteroids/constants";
import { SKIN_IDS } from "@/lib/arcade/shared/skins";
import { createAsteroidsEngine } from "@/lib/arcade/asteroids/game";

export const asteroidsDefinition: GameDefinition = {
  width: WIDTH,
  height: HEIGHT,
  controls: [
    { keys: "← →", action: "ROTAR" },
    { keys: "↑", action: "PROPULSAR" },
    { keys: "ESPACIO", action: "DISPARAR" },
    { keys: "P", action: "PAUSA" },
  ],
  skins: SKIN_IDS,
  create: createAsteroidsEngine,
};
