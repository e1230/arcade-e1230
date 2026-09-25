import type { Database } from "./supabase/database.types";

export type Accent = "cyan" | "pink" | "yellow";

// Hex y tinte translúcido de cada acento (valores de la función tint() de la referencia)
export const ACCENTS: Record<Accent, { hex: string; tint: string }> = {
  cyan: { hex: "#00f5ff", tint: "rgba(0,245,255,.14)" },
  pink: { hex: "#ff006e", tint: "rgba(255,0,110,.16)" },
  yellow: { hex: "#f5ff00", tint: "rgba(245,255,0,.12)" },
};

export type GameCategory = "Clásicos" | "Disparos" | "Puzles" | "Laberinto";

export interface Game {
  id: string;
  title: string;
  category: GameCategory;
  accent: Accent;
  shortDescription: string;
  longDescription: string;
}

export const CATEGORY_FILTERS = [
  "Todos",
  "Clásicos",
  "Disparos",
  "Puzles",
  "Laberinto",
] as const;
export type CategoryFilter = (typeof CATEGORY_FILTERS)[number];

// Mapea snake_case → camelCase. category y accent se convierten a sus uniones:
// los CHECK de la tabla garantizan que el valor es válido.
export function toGame(
  row: Database["public"]["Tables"]["games"]["Row"],
): Game {
  return {
    id: row.id,
    title: row.title,
    category: row.category as GameCategory,
    accent: row.accent as Accent,
    shortDescription: row.short_description,
    longDescription: row.long_description,
  };
}
