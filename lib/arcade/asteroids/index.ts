import type { GameDefinition } from "@/lib/arcade/engine";
import { HEIGHT, WIDTH } from "@/lib/arcade/asteroids/constants";
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
  create: createAsteroidsEngine,
};
