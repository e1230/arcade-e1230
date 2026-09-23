import { MiniGameCard } from "@/components/home/MiniGameCard";
import { NeonButton } from "@/components/ui/NeonButton";
import { Reveal } from "@/components/home/Reveal";
import { SectionHeading } from "@/components/home/SectionHeading";
import { GAMES } from "@/lib/games";

// Vista previa de juegos del home (referencia: home.jsx líneas 151-165)
export function GamesRail() {
  const preview = GAMES.slice(0, 6);

  return (
    <Reveal className="mx-auto max-w-[1320px] px-8 py-20">
      <SectionHeading kicker="// 02" kickerColor="cyan" title="JUEGOS DISPONIBLES AHORA" />
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-6">
        {preview.map((game) => (
          <MiniGameCard key={game.id} game={game} />
        ))}
      </div>
      <div className="mt-6 text-center">
        <NeonButton href="/games" variant="outline" accent="cyan" size="md">
          VER TODOS LOS JUEGOS →
        </NeonButton>
      </div>
    </Reveal>
  );
}
