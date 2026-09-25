import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { DetailLeaderboard } from "@/components/game/DetailLeaderboard";
import { GameCover } from "@/components/game/GameCover";
import { PlayingAs } from "@/components/game/PlayingAs";
import { NeonButton } from "@/components/ui/NeonButton";
import { SignalLost } from "@/components/ui/SignalLost";
import { ACCENTS } from "@/lib/games";
import { fetchGame } from "@/lib/catalog";
import { fetchLeaderboard } from "@/lib/leaderboard";

export async function generateMetadata({
  params,
}: PageProps<"/games/[id]">): Promise<Metadata> {
  const { id } = await params;
  const result = await fetchGame(id);
  if (!result.ok || !result.data) return {};
  return { title: result.data.title };
}

export default async function GameDetailPage({
  params,
}: PageProps<"/games/[id]">) {
  const { id } = await params;
  const gameResult = await fetchGame(id);

  if (!gameResult.ok) {
    return (
      <div className="mx-auto max-w-[1200px] px-5 pt-10 pb-30">
        <SignalLost />
      </div>
    );
  }

  const game = gameResult.data;
  if (!game) notFound();

  const leaderboardResult = await fetchLeaderboard(id);

  const { hex, tint } = ACCENTS[game.accent];

  return (
    <div className="mx-auto max-w-[1200px] px-5 pt-10 pb-30">
      <NeonButton href="/games" variant="ghost" size="sm" className="mb-7">
        &lt; VOLVER A LA BIBLIOTECA
      </NeonButton>

      <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,340px),1fr))] items-start gap-9">
        <section className="flex flex-col gap-6">
          <span
            style={{ borderColor: hex, color: hex }}
            className="self-start border px-2.5 py-1 text-[13px] font-bold"
          >
            {game.category}
          </span>
          <h1
            style={{ textShadow: `0 0 10px ${hex}, 0 0 30px ${hex}` }}
            className="m-0 font-pixel text-[clamp(26px,5vw,52px)] leading-tight text-white"
          >
            {game.title}
          </h1>
          <GameCover
            variant="screenshot"
            gameId={game.id}
            initial={game.title[0]}
            color={hex}
            tint={tint}
          />
          <p className="m-0 max-w-[60ch] text-lg leading-relaxed text-pretty text-soft">
            {game.longDescription}
          </p>
          <div className="flex flex-wrap items-center gap-4">
            <NeonButton
              href={`/games/${game.id}/play`}
              variant="solid"
              accent="pink"
              size="lg"
              className="motion-safe:animate-pulse-neon"
            >
              JUGAR AHORA
            </NeonButton>
            <NeonButton href="/games" variant="outline" accent="cyan" size="md">
              VOLVER A LA BIBLIOTECA
            </NeonButton>
          </div>
          <PlayingAs />
        </section>
        <DetailLeaderboard
          rows={leaderboardResult.ok ? leaderboardResult.data : null}
        />
      </div>
    </div>
  );
}
