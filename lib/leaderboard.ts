import { type RankedScore, toRankedScore } from "./scores";
import { createClient } from "./supabase/server";
import type { QueryResult } from "./supabase/result";

// Solo Server Components: createClient usa next/headers y rompe el build si un
// componente cliente lo importa.
export async function fetchLeaderboard(
  gameId: string,
): Promise<QueryResult<RankedScore[]>> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("leaderboard")
      .select("*")
      .eq("game_id", gameId)
      .order("rank");
    if (error) return { ok: false };
    return { ok: true, data: data.map(toRankedScore) };
  } catch {
    return { ok: false };
  }
}

export async function fetchAllLeaderboards(): Promise<
  QueryResult<Record<string, RankedScore[]>>
> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("leaderboard")
      .select("*")
      .order("rank");
    if (error) return { ok: false };
    const byGame: Record<string, RankedScore[]> = {};
    for (const row of data) {
      const gameId = row.game_id;
      if (!gameId) continue;
      (byGame[gameId] ??= []).push(toRankedScore(row));
    }
    return { ok: true, data: byGame };
  } catch {
    return { ok: false };
  }
}

// El primer lugar (rank = 1) de cada juego
export async function fetchBestScores(): Promise<
  QueryResult<Record<string, number>>
> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("leaderboard")
      .select("*")
      .eq("rank", 1);
    if (error) return { ok: false };
    const byGame: Record<string, number> = {};
    for (const row of data) {
      if (!row.game_id || row.score === null) continue;
      byGame[row.game_id] = row.score;
    }
    return { ok: true, data: byGame };
  } catch {
    return { ok: false };
  }
}
