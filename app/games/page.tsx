import type { Metadata } from "next";
import { LibraryHero } from "@/components/library/LibraryHero";
import { LibraryView } from "@/components/library/LibraryView";
import { SignalLost } from "@/components/ui/SignalLost";
import { fetchGames } from "@/lib/catalog";
import { fetchBestScores } from "@/lib/leaderboard";

export const metadata: Metadata = {
  title: "Biblioteca",
};

export default async function LibraryPage() {
  const [gamesResult, bestScoresResult] = await Promise.all([
    fetchGames(),
    fetchBestScores(),
  ]);

  return (
    <div className="mx-auto max-w-[1280px] px-5 pt-14 pb-30">
      <LibraryHero />
      {gamesResult.ok && bestScoresResult.ok ? (
        <LibraryView
          games={gamesResult.data}
          bestScores={bestScoresResult.data}
        />
      ) : (
        <SignalLost />
      )}
    </div>
  );
}
