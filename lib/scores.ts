import { formatScoreDate } from "./format";
import type { Database } from "./supabase/database.types";

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
