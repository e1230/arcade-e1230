"use client";

import Link from "next/link";
import { useState } from "react";
import { GameTabs } from "@/components/hall-of-fame/GameTabs";
import { HallOfFameTable } from "@/components/hall-of-fame/HallOfFameTable";
import type { Game } from "@/lib/games";
import type { RankedScore } from "@/lib/scores";
import { useSession } from "@/lib/session";

interface HallOfFameViewProps {
  games: Game[];
  leaderboards: Record<string, RankedScore[]>;
}

export function HallOfFameView({ games, leaderboards }: HallOfFameViewProps) {
  const [gameId, setGameId] = useState(games[0]?.id ?? "");
  const { user } = useSession();

  return (
    <>
      <GameTabs games={games} value={gameId} onChange={setGameId} />
      <HallOfFameTable gameId={gameId} rows={leaderboards[gameId] ?? []} />

      {!user && (
        <p className="m-0 mt-4.5 text-center text-[15px] text-muted">
          <Link href="/login">Inicia sesión</Link> para ver tu mejor marca
          destacada.
        </p>
      )}
    </>
  );
}
