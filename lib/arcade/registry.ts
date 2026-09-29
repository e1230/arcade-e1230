import type { GameDefinition } from "@/lib/arcade/engine";
import { asteroidsDefinition } from "@/lib/arcade/asteroids";
import { tetrisDefinition } from "@/lib/arcade/tetris";

const DEFINITIONS: Partial<Record<string, GameDefinition>> = {
  asteroids: asteroidsDefinition,
  tetris: tetrisDefinition,
};

export function getGameDefinition(gameId: string): GameDefinition | undefined {
  return DEFINITIONS[gameId];
}
