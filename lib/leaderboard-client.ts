import { formatScoreDate } from "./format";
import { createClient } from "./supabase/client";
import type { Database } from "./supabase/database.types";
import type { QueryResult } from "./supabase/result";

type ScoreInsert = Database["public"]["Tables"]["scores"]["Insert"];

// Solo componentes cliente: usa lib/supabase/client.ts
export async function insertScore(entry: {
  gameId: string;
  score: number;
}): Promise<{ ok: boolean }> {
  try {
    const supabase = createClient();
    // Solo se mandan game_id y score: el trigger set_score_owner pone user_id y name (el alias)
    // de la sesión, y el GRANT de columnas rechaza cualquier otro campo. Los tipos generados
    // no conocen el trigger y piden name y user_id, de ahí la aserción.
    // Sin .select(): el rol anon no tiene permiso de lectura sobre la columna id
    const { error } = await supabase.from("scores").insert({
      game_id: entry.gameId,
      score: Math.floor(entry.score),
    } as ScoreInsert);
    return { ok: !error };
  } catch {
    return { ok: false };
  }
}

export async function fetchPersonalBest(
  gameId: string,
  userId: string,
): Promise<QueryResult<{ score: number; date: string } | null>> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("scores")
      .select("score, created_at")
      .eq("game_id", gameId)
      .eq("user_id", userId)
      .order("score", { ascending: false })
      .order("created_at", { ascending: true })
      .limit(1)
      .maybeSingle();
    if (error) return { ok: false };
    return {
      ok: true,
      data: data
        ? { score: data.score, date: formatScoreDate(data.created_at) }
        : null,
    };
  } catch {
    return { ok: false };
  }
}
