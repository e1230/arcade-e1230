import { formatScoreDate } from "./format";
import { createClient } from "./supabase/client";
import type { QueryResult } from "./supabase/result";

// Solo componentes cliente: usa lib/supabase/client.ts
export async function insertScore(entry: {
  gameId: string;
  name: string;
  score: number;
}): Promise<{ ok: boolean }> {
  try {
    const supabase = createClient();
    // Sin .select(): el rol anon no tiene permiso de lectura sobre la columna id
    const { error } = await supabase.from("scores").insert({
      game_id: entry.gameId,
      name: entry.name.trim().slice(0, 20),
      score: Math.floor(entry.score),
    });
    return { ok: !error };
  } catch {
    return { ok: false };
  }
}

export async function fetchPersonalBest(
  gameId: string,
  name: string,
): Promise<QueryResult<{ score: number; date: string } | null>> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("scores")
      .select("score, created_at")
      .eq("game_id", gameId)
      .eq("name", name)
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
