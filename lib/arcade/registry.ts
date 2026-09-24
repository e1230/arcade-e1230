import type { GameDefinition } from "@/lib/arcade/engine";
import { asteroidsDefinition } from "@/lib/arcade/asteroids";

const DEFINITIONS: Partial<Record<string, GameDefinition>> = {
  asteroids: asteroidsDefinition,
};

export function getGameDefinition(gameId: string): GameDefinition | undefined {
  return DEFINITIONS[gameId];
}
