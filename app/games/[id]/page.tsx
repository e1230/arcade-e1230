import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { DetailLeaderboard } from "@/components/game/DetailLeaderboard";
import { GameCover } from "@/components/game/GameCover";
import { PlayingAs } from "@/components/game/PlayingAs";
import { NeonButton } from "@/components/ui/NeonButton";
import { ACCENTS, GAMES, getGame } from "@/lib/games";

export function generateStaticParams() {
  return GAMES.map((game) => ({ id: game.id }));
}

export const dynamicParams = false;

export async function generateMetadata({
  params,
}: PageProps<"/games/[id]">): Promise<Metadata> {
  const { id } = await params;
  const game = getGame(id);
  if (!game) return {};
  return { title: game.title };
}

export default async function GameDetailPage({ params }: PageProps<"/games/[id]">) {
  const { id } = await params;
  const game = getGame(id);
  if (!game) notFound();

  const { hex, tint } = ACCENTS[game.accent];

  return (
    <div className="mx-auto max-w-[1200px] px-5 pb-30 pt-10">
      <NeonButton href="/" variant="ghost" size="sm" className="mb-7">
        &lt; VOLVER AL INICIO
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
          <p className="m-0 max-w-[60ch] text-lg leading-relaxed text-soft text-pretty">
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
            <NeonButton href="/" variant="outline" accent="cyan" size="md">
              VOLVER AL INICIO
            </NeonButton>
          </div>
          <PlayingAs />
        </section>
        <DetailLeaderboard gameId={game.id} />
      </div>
    </div>
  );
}
