"use client";

import { STORAGE_KEYS, useStoredValue, writeStoredValue } from "./storage";
import type { LocalScores, ScoreEntry } from "./scores";

const NO_SCORES: LocalScores = {};

export function useLocalScores(): {
  scores: LocalScores;
  saveScore(gameId: string, entry: ScoreEntry): void;
} {
  const scores = useStoredValue<LocalScores>(STORAGE_KEYS.scores, NO_SCORES);

  return {
    scores,
    saveScore(gameId: string, entry: ScoreEntry) {
      const next: LocalScores = {
        ...scores,
        [gameId]: [...(scores[gameId] ?? []), entry],
      };
      writeStoredValue(STORAGE_KEYS.scores, next);
    },
  };
}
