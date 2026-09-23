import { formatScore, pad2 } from "@/lib/format";

interface PlayerHudProps {
  score: number;
  lives: number;
  level: number;
  playerName: string;
}

export function PlayerHud({ score, lives, level, playerName }: PlayerHudProps) {
  const livesStr = "■".repeat(Math.max(0, lives)) + "□".repeat(Math.max(0, 3 - lives));

  return (
    <div className="grid grid-cols-[repeat(auto-fit,minmax(150px,1fr))] gap-px border border-cyan/30 bg-cyan/30">
      <div className="flex flex-col gap-1.5 bg-surface px-3.5 py-2.5">
        <span className="text-xs font-bold text-muted">PUNTUACIÓN</span>
        <span className="font-pixel text-base text-yellow [text-shadow:var(--text-shadow-glow-yellow)]">
          {formatScore(score)}
        </span>
      </div>
      <div className="flex flex-col gap-1.5 bg-surface px-3.5 py-2.5">
        <span className="text-xs font-bold text-muted">VIDAS</span>
        <span className="font-pixel text-base tracking-[4px] text-pink [text-shadow:var(--text-shadow-glow-pink)]">
          {livesStr}
        </span>
      </div>
      <div className="flex flex-col gap-1.5 bg-surface px-3.5 py-2.5">
        <span className="text-xs font-bold text-muted">NIVEL</span>
        <span className="font-pixel text-base text-cyan [text-shadow:var(--text-shadow-glow-cyan)]">
          {pad2(level)}
        </span>
      </div>
      <div className="flex flex-col gap-1.5 bg-surface px-3.5 py-2.5">
        <span className="text-xs font-bold text-muted">JUGADOR</span>
        <span className="overflow-hidden text-ellipsis text-base font-bold text-foreground">
          {playerName}
        </span>
      </div>
    </div>
  );
}
