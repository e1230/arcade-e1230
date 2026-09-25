import type { Metadata } from "next";
import { HallOfFameView } from "@/components/hall-of-fame/HallOfFameView";
import { SignalLost } from "@/components/ui/SignalLost";
import { fetchGames } from "@/lib/catalog";
import { fetchAllLeaderboards } from "@/lib/leaderboard";

export const metadata: Metadata = {
  title: "Salón de la Fama",
};

export default async function HallOfFamePage() {
  const [gamesResult, leaderboardsResult] = await Promise.all([
    fetchGames(),
    fetchAllLeaderboards(),
  ]);

  return (
    <div className="mx-auto max-w-[960px] px-5 pt-13 pb-30">
      <h1 className="m-0 mb-8.5 text-center font-pixel text-[clamp(22px,5vw,44px)] leading-snug text-yellow [text-shadow:var(--text-shadow-neon-yellow)]">
        SALÓN DE LA FAMA
      </h1>
      {gamesResult.ok && leaderboardsResult.ok ? (
        <HallOfFameView
          games={gamesResult.data}
          leaderboards={leaderboardsResult.data}
        />
      ) : (
        <SignalLost />
      )}
    </div>
  );
}
