import { MiniGameCard } from "@/components/home/MiniGameCard";
import { NeonButton } from "@/components/ui/NeonButton";
import { Reveal } from "@/components/home/Reveal";
import { SectionHeading } from "@/components/home/SectionHeading";
import { SignalLost } from "@/components/ui/SignalLost";
import { fetchGames } from "@/lib/catalog";

// Vista previa de juegos del home (referencia: home.jsx líneas 151-165)
export async function GamesRail() {
  const result = await fetchGames();

  return (
    <Reveal className="mx-auto max-w-[1320px] px-8 py-20">
      <SectionHeading
        kicker="// 02"
        kickerColor="cyan"
        title="JUEGOS DISPONIBLES AHORA"
      />
      {result.ok ? (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-6">
          {result.data.slice(0, 6).map((game) => (
            <MiniGameCard key={game.id} game={game} />
          ))}
        </div>
      ) : (
        <SignalLost />
      )}
      <div className="mt-6 text-center">
        <NeonButton href="/games" variant="outline" accent="cyan" size="md">
          VER TODOS LOS JUEGOS →
        </NeonButton>
      </div>
    </Reveal>
  );
}
