"use client";

import { getRankStyle } from "@/components/ui/rank-styles";
import { pad2, formatScore } from "@/lib/format";
import { useLocalScores } from "@/lib/local-scores";
import { buildLeaderboard } from "@/lib/scores";
import { useSession } from "@/lib/session";

interface HallOfFameTableProps {
  gameId: string;
}

const GRID_COLS = "grid-cols-[70px_minmax(0,1fr)_minmax(90px,auto)_110px]";

export function HallOfFameTable({ gameId }: HallOfFameTableProps) {
  const { user } = useSession();
  const { scores } = useLocalScores();
  const userName = user && !user.guest ? user.name : null;
  const rows = buildLeaderboard(gameId, scores, userName);

  const personalBest = userName
    ? [...(scores[gameId] ?? [])].sort((a, b) => b.score - a.score)[0]
    : undefined;

  return (
    <div className="border-2 border-cyan/50 bg-surface shadow-[0_0_24px_rgba(0,245,255,.2)]">
      <div
        className={`grid ${GRID_COLS} gap-3 border-b border-cyan/35 px-5 py-3.5 font-pixel text-[9px] text-cyan`}
      >
        <span>RANGO</span>
        <span>JUGADOR</span>
        <span className="text-right">PUNTUACIÓN</span>
        <span className="text-right">FECHA</span>
      </div>

      {rows.map((row) => {
        const style = getRankStyle(row.rank, row.isMine);
        return (
          <div
            key={row.rank}
            style={{
              backgroundColor: style.bg,
              borderLeftColor: style.edge,
              animationDelay: `${(row.rank - 1) * 0.06}s`,
            }}
            className={`motion-safe:animate-row grid ${GRID_COLS} items-center gap-3 border-b border-surface-3 border-l-[3px] px-5 py-3.5`}
          >
            <span style={{ color: style.color, textShadow: style.glow }} className="font-pixel text-[13px]">
              {pad2(row.rank)}
            </span>
            <span className="overflow-hidden text-ellipsis whitespace-nowrap text-base font-bold text-foreground">
              {row.name} {row.isMine && <span className="text-xs text-pink">· TÚ</span>}
            </span>
            <span style={{ color: style.color }} className="text-right font-pixel text-xs">
              {formatScore(row.score)}
            </span>
            <span className="text-right text-sm text-subtle">{row.date}</span>
          </div>
        );
      })}

      {personalBest && (
        <div
          className={`motion-safe:animate-row grid ${GRID_COLS} items-center gap-3 border-t-2 border-pink bg-pink/10 px-5 py-4`}
        >
          <span className="font-pixel text-[9px] leading-relaxed text-pink">TU MEJOR MARCA</span>
          <span className="text-base font-bold text-foreground">{userName}</span>
          <span className="text-right font-pixel text-xs text-pink [text-shadow:var(--text-shadow-glow-pink)]">
            {formatScore(personalBest.score)}
          </span>
          <span className="text-right text-sm text-subtle">{personalBest.date}</span>
        </div>
      )}
    </div>
  );
}
