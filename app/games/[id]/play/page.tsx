import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PlayerView } from "@/components/game/PlayerView";
import { GAMES, getGame } from "@/lib/games";

export function generateStaticParams() {
  return GAMES.map((game) => ({ id: game.id }));
}

export const dynamicParams = false;

export async function generateMetadata({
  params,
}: PageProps<"/games/[id]/play">): Promise<Metadata> {
  const { id } = await params;
  const game = getGame(id);
  if (!game) return {};
  return { title: `Jugando ${game.title}` };
}

export default async function PlayGamePage({ params }: PageProps<"/games/[id]/play">) {
  const { id } = await params;
  const game = getGame(id);
  if (!game) notFound();

  return <PlayerView game={game} />;
}
