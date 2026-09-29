import type { GameDefinition } from "@/lib/arcade/engine";
import { arkanoidDefinition } from "@/lib/arcade/arkanoid";
import { asteroidsDefinition } from "@/lib/arcade/asteroids";
import { snakeDefinition } from "@/lib/arcade/snake";
import { tetrisDefinition } from "@/lib/arcade/tetris";

const DEFINITIONS: Partial<Record<string, GameDefinition>> = {
  arkanoid: arkanoidDefinition,
  asteroids: asteroidsDefinition,
  snake: snakeDefinition,
  tetris: tetrisDefinition,
};

export function getGameDefinition(gameId: string): GameDefinition | undefined {
  return DEFINITIONS[gameId];
}
