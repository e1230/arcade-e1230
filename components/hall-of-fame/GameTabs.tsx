import type { Game } from "@/lib/games";

interface GameTabsProps {
  games: Game[];
  value: string;
  onChange: (gameId: string) => void;
}

const ACTIVE_CLASS =
  "flex-none border border-yellow bg-yellow/12 px-3.5 py-3 font-pixel text-[9px] text-yellow shadow-[0_0_12px_rgba(245,255,0,.45)]";
const INACTIVE_CLASS =
  "flex-none border border-border bg-transparent px-3.5 py-3 font-pixel text-[9px] text-muted";

export function GameTabs({ games, value, onChange }: GameTabsProps) {
  return (
    <div className="mb-6 flex gap-2 overflow-x-auto pb-1.5">
      {games.map((game) => (
        <button
          key={game.id}
          onClick={() => onChange(game.id)}
          className={`cursor-pointer active:scale-95 ${value === game.id ? ACTIVE_CLASS : INACTIVE_CLASS}`}
        >
          {game.title}
        </button>
      ))}
    </div>
  );
}
