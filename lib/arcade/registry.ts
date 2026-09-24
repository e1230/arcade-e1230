import type { GameDefinition } from "@/lib/arcade/engine";

// Todavía sin motores registrados; el paso 6 agrega `asteroids`.
const DEFINITIONS: Partial<Record<string, GameDefinition>> = {};

export function getGameDefinition(gameId: string): GameDefinition | undefined {
  return DEFINITIONS[gameId];
}
