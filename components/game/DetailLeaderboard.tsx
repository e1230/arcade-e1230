"use client";

import { pad2, formatScore } from "@/lib/format";
import { useLocalScores } from "@/lib/local-scores";
import { buildLeaderboard } from "@/lib/scores";
import { useSession } from "@/lib/session";
import { getRankStyle } from "@/components/ui/rank-styles";

interface DetailLeaderboardProps {
  gameId: string;
}

export function DetailLeaderboard({ gameId }: DetailLeaderboardProps) {
  const { user } = useSession();
  const { scores } = useLocalScores();
  const userName = user && !user.guest ? user.name : null;
  const rows = buildLeaderboard(gameId, scores, userName);

  return (
    <aside className="border-2 border-cyan/60 bg-surface shadow-[0_0_20px_rgba(0,245,255,.25),inset_0_0_30px_rgba(0,245,255,.06)]">
      <h2 className="m-0 border-b border-cyan/30 px-5 py-4.5 font-pixel text-xs text-cyan [text-shadow:var(--text-shadow-glow-cyan)]">
        MEJORES PUNTUACIONES
      </h2>
      <div className="flex flex-col">
        {rows.map((row) => {
          const style = getRankStyle(row.rank, row.isMine);
          return (
            <div
              key={row.rank}
              style={{
                backgroundColor: style.bg,
                animationDelay: `${(row.rank - 1) * 0.06}s`,
              }}
              className="motion-safe:animate-row grid grid-cols-[36px_minmax(0,1fr)_auto] items-center gap-2.5 border-b border-surface-3 px-5 py-2.5"
            >
              <span
                style={{ color: style.color, textShadow: style.glow }}
                className="font-pixel text-[11px]"
              >
                {pad2(row.rank)}
              </span>
              <div className="flex min-w-0 flex-col">
                <span className="overflow-hidden text-ellipsis text-[15px] font-bold text-foreground">
                  {row.name}
                </span>
                <span className="text-xs text-subtle">{row.date}</span>
              </div>
              <span style={{ color: style.color }} className="font-pixel text-[11px]">
                {formatScore(row.score)}
              </span>
            </div>
          );
        })}
      </div>
    </aside>
  );
}
