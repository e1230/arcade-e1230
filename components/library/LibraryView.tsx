"use client";

import { useMemo, useState } from "react";
import { GameCard } from "@/components/library/GameCard";
import { SearchBar } from "@/components/library/SearchBar";
import { CategoryFilter } from "@/components/library/CategoryFilter";
import { normalizeText } from "@/lib/format";
import type { CategoryFilter as CategoryFilterValue, Game } from "@/lib/games";

interface LibraryViewProps {
  games: Game[];
  bestScores: Record<string, number>;
}

export function LibraryView({ games, bestScores }: LibraryViewProps) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<CategoryFilterValue>("Todos");

  const filtered = useMemo(() => {
    const normalizedQuery = normalizeText(query.trim());
    return games.filter((game) => {
      const matchesCategory =
        category === "Todos" || game.category === category;
      const haystack = normalizeText(
        `${game.title} ${game.category} ${game.shortDescription}`,
      );
      const matchesQuery =
        !normalizedQuery || haystack.includes(normalizedQuery);
      return matchesCategory && matchesQuery;
    });
  }, [games, query, category]);

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-wrap items-center gap-3.5">
        <SearchBar value={query} onChange={setQuery} />
        <CategoryFilter value={category} onChange={setCategory} />
      </div>

      {filtered.length === 0 ? (
        <p className="py-15 text-center font-pixel text-xs leading-loose text-muted">
          NINGÚN JUEGO COINCIDE CON TU BÚSQUEDA
        </p>
      ) : (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(260px,1fr))] gap-7 [perspective:1000px]">
          {filtered.map((game) => (
            <GameCard
              key={game.id}
              game={game}
              bestScore={bestScores[game.id]}
            />
          ))}
        </div>
      )}
    </div>
  );
}
