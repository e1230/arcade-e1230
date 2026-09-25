"use client";

import { useEffect, useState } from "react";
import { getRankStyle } from "@/components/ui/rank-styles";
import { formatScore, pad2 } from "@/lib/format";
import { fetchPersonalBest } from "@/lib/leaderboard-client";
import type { RankedScore } from "@/lib/scores";
import { useSession } from "@/lib/session";

interface HallOfFameTableProps {
  gameId: string;
  rows: RankedScore[];
}

const GRID_COLS = "grid-cols-[70px_minmax(0,1fr)_minmax(90px,auto)_110px]";

export function HallOfFameTable({ gameId, rows }: HallOfFameTableProps) {
  const { user } = useSession();
  const userName = user && !user.guest ? user.name : null;
  // gameId viaja junto al resultado: al cambiar de pestaña, la marca de la
  // pestaña anterior deja de coincidir y desaparece sin necesidad de resetear
  // el estado de forma síncrona dentro del efecto.
  const [personalBest, setPersonalBest] = useState<{
    gameId: string;
    score: number;
    date: string;
  } | null>(null);

  useEffect(() => {
    if (!userName) return;
    let cancelled = false;
    fetchPersonalBest(gameId, userName).then((result) => {
      if (!cancelled && result.ok && result.data) {
        setPersonalBest({ gameId, ...result.data });
      }
    });
    return () => {
      cancelled = true;
    };
  }, [gameId, userName]);

  const currentBest =
    userName && personalBest && personalBest.gameId === gameId
      ? personalBest
      : null;

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

      {rows.length === 0 ? (
        <p className="m-0 px-5 py-10 text-center font-pixel text-xs leading-loose text-muted">
          SÉ EL PRIMERO EN ENTRAR AL RANKING
        </p>
      ) : (
        rows.map((row) => {
          const isMine = userName !== null && row.name === userName;
          const style = getRankStyle(row.rank, isMine);
          return (
            <div
              key={row.rank}
              style={{
                backgroundColor: style.bg,
                borderLeftColor: style.edge,
                animationDelay: `${(row.rank - 1) * 0.06}s`,
              }}
              className={`grid motion-safe:animate-row ${GRID_COLS} items-center gap-3 border-b border-l-[3px] border-surface-3 px-5 py-3.5`}
            >
              <span
                style={{ color: style.color, textShadow: style.glow }}
                className="font-pixel text-[13px]"
              >
                {pad2(row.rank)}
              </span>
              <span className="overflow-hidden text-base font-bold text-ellipsis whitespace-nowrap text-foreground">
                {row.name}{" "}
                {isMine && <span className="text-xs text-pink">· TÚ</span>}
              </span>
              <span
                style={{ color: style.color }}
                className="text-right font-pixel text-xs"
              >
                {formatScore(row.score)}
              </span>
              <span className="text-right text-sm text-subtle">{row.date}</span>
            </div>
          );
        })
      )}

      {currentBest && (
        <div
          className={`grid motion-safe:animate-row ${GRID_COLS} items-center gap-3 border-t-2 border-pink bg-pink/10 px-5 py-4`}
        >
          <span className="font-pixel text-[9px] leading-relaxed text-pink">
            TU MEJOR MARCA
          </span>
          <span className="text-base font-bold text-foreground">
            {userName}
          </span>
          <span className="text-right font-pixel text-xs text-pink [text-shadow:var(--text-shadow-glow-pink)]">
            {formatScore(currentBest.score)}
          </span>
          <span className="text-right text-sm text-subtle">
            {currentBest.date}
          </span>
        </div>
      )}
    </div>
  );
}
