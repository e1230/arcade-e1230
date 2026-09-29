import { HEIGHT, WIDTH } from "@/lib/arcade/arkanoid/constants";
import { createArkanoidEngine } from "@/lib/arcade/arkanoid/game";
import type { GameDefinition } from "@/lib/arcade/engine";

export const arkanoidDefinition: GameDefinition = {
  width: WIDTH,
  height: HEIGHT,
  controls: [
    // El mouse comparte fila con las flechas: `StartScreen` usa `action` como `key` de React
    { keys: "← → / MOUSE", action: "MOVER" },
    { keys: "P", action: "PAUSA" },
  ],
  create: createArkanoidEngine,
};
