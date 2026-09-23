import Link from "next/link";
import { GameCover } from "@/components/game/GameCover";
import { ACCENTS, type Game } from "@/lib/games";

interface MiniGameCardProps {
  game: Game;
}

// Mini tarjeta del riel «JUEGOS DISPONIBLES AHORA» (referencia: home.jsx líneas 86-96, styles.css líneas 1020-1028)
export function MiniGameCard({ game }: MiniGameCardProps) {
  const { hex, tint } = ACCENTS[game.accent];

  return (
    <Link
      href={`/games/${game.id}`}
      className="block border border-border-neon bg-surface transition-[transform,border-color] duration-[180ms] ease-out hover:-translate-y-1 hover:border-cyan"
    >
      <GameCover variant="mini" gameId={game.id} initial={game.title[0]} color={hex} tint={tint} />
      <div className="p-3 py-2.5">
        <div className="font-pixel text-[10px] tracking-[0.06em] text-foreground">{game.title}</div>
        <div className="mt-1 text-[10px] tracking-[0.14em] text-subtle">{game.category}</div>
      </div>
    </Link>
  );
}
