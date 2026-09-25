import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PlayerView } from "@/components/game/PlayerView";
import { SignalLost } from "@/components/ui/SignalLost";
import { fetchGame } from "@/lib/catalog";

export async function generateMetadata({
  params,
}: PageProps<"/games/[id]/play">): Promise<Metadata> {
  const { id } = await params;
  const result = await fetchGame(id);
  if (!result.ok || !result.data) return {};
  return { title: `Jugando ${result.data.title}` };
}

export default async function PlayGamePage({
  params,
}: PageProps<"/games/[id]/play">) {
  const { id } = await params;
  const result = await fetchGame(id);

  if (!result.ok) {
    return (
      <div className="mx-auto max-w-[860px] px-4 pt-7 pb-20">
        <SignalLost />
      </div>
    );
  }

  if (!result.data) notFound();

  return <PlayerView game={result.data} />;
}
