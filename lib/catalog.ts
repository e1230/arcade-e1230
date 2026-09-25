import { cache } from "react";
import { type Game, toGame } from "./games";
import { createClient } from "./supabase/server";
import type { QueryResult } from "./supabase/result";

// Solo Server Components: createClient usa next/headers y rompe el build si un
// componente cliente lo importa.
export async function fetchGames(): Promise<QueryResult<Game[]>> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("games")
      .select("*")
      .order("sort_order");
    if (error) return { ok: false };
    return { ok: true, data: data.map(toGame) };
  } catch {
    return { ok: false };
  }
}

// cache() evita que generateMetadata y la página hagan dos consultas por petición
export const fetchGame = cache(
  async (id: string): Promise<QueryResult<Game | null>> => {
    try {
      const supabase = await createClient();
      const { data, error } = await supabase
        .from("games")
        .select("*")
        .eq("id", id)
        .maybeSingle();
      if (error) return { ok: false };
      return { ok: true, data: data ? toGame(data) : null };
    } catch {
      return { ok: false };
    }
  },
);
