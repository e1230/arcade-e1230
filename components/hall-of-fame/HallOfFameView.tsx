"use client";

import Link from "next/link";
import { useState } from "react";
import { GameTabs } from "@/components/hall-of-fame/GameTabs";
import { HallOfFameTable } from "@/components/hall-of-fame/HallOfFameTable";
import { useSession } from "@/lib/session";

export function HallOfFameView() {
  const [gameId, setGameId] = useState("arkanoid");
  const { user } = useSession();

  return (
    <div className="mx-auto max-w-[960px] px-5 pb-30 pt-13">
      <h1 className="m-0 mb-8.5 text-center font-pixel text-[clamp(22px,5vw,44px)] leading-snug text-yellow [text-shadow:var(--text-shadow-neon-yellow)]">
        SALÓN DE LA FAMA
      </h1>

      <GameTabs value={gameId} onChange={setGameId} />
      <HallOfFameTable gameId={gameId} />

      {!user && (
        <p className="m-0 mt-4.5 text-center text-[15px] text-muted">
          <Link href="/login">Inicia sesión</Link> para ver tu mejor marca destacada.
        </p>
      )}
    </div>
  );
}
