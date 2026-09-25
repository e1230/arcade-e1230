import { formatScoreDate, pad2 } from "./format";
import { GAMES } from "./games";
import type { Database } from "./supabase/database.types";

export interface ScoreEntry {
  name: string;
  score: number;
  date: string; // "dd/mm/aaaa"
}

export type LocalScores = Record<string, ScoreEntry[]>;

export interface RankedScore {
  rank: number; // 1..10
  name: string;
  score: number;
  date: string; // "dd/mm/aaaa", ya formateada con formatScoreDate
}

export interface LeaderboardRow extends RankedScore {
  isMine: boolean; // se calcula en el cliente con el nombre de la sesión
}

export function toRankedScore(
  row: Database["public"]["Views"]["leaderboard"]["Row"],
): RankedScore {
  return {
    rank: row.rank ?? 0,
    name: row.name ?? "",
    score: row.score ?? 0,
    date: formatScoreDate(row.created_at ?? new Date().toISOString()),
  };
}

export const MOCK_PLAYER_NAMES: string[] = [
  "NEÓN_77",
  "PIXELKID",
  "LUNA.EXE",
  "ROMBO",
  "GLITCH",
  "CHIPTUNE",
  "VOXEL",
  "ZETA-9",
  "KAIROS",
  "BYTEMAR",
  "ATARIANA",
  "OCHOBITS",
];

export function getMockScores(gameIndex: number): ScoreEntry[] {
  const base = 42000 + gameIndex * 7300;
  return Array.from({ length: 10 }, (_, i) => ({
    name: MOCK_PLAYER_NAMES[(i * 5 + gameIndex * 3) % MOCK_PLAYER_NAMES.length],
    score: Math.round((base * (1 - i * 0.085)) / 10) * 10,
    date: `${pad2(((i * 7 + gameIndex * 3) % 28) + 1)}/${pad2(9 - (i % 4))}/2026`,
  }));
}

function getGameIndex(gameId: string): number {
  return GAMES.findIndex((game) => game.id === gameId);
}

export function buildLeaderboard(
  gameId: string,
  local: LocalScores,
  userName: string | null,
): LeaderboardRow[] {
  const gameIndex = getGameIndex(gameId);
  const all = [...getMockScores(gameIndex), ...(local[gameId] ?? [])]
    .sort((a, b) => b.score - a.score)
    .slice(0, 10);
  return all.map((entry, i) => ({
    ...entry,
    rank: i + 1,
    isMine: userName !== null && entry.name === userName,
  }));
}

export function getBestScore(gameId: string, local: LocalScores): number {
  const gameIndex = getGameIndex(gameId);
  const scores = [
    getMockScores(gameIndex)[0].score,
    ...(local[gameId] ?? []).map((e) => e.score),
  ];
  return Math.max(...scores);
}
