import type { CSSProperties } from "react";
import Link from "next/link";
import { Reveal } from "@/components/home/Reveal";
import { SectionHeading } from "@/components/home/SectionHeading";
import { RECENT_SCORES, TOP_PLAYERS_TODAY } from "@/lib/activity";
import { formatScore, pad2 } from "@/lib/format";
import { getGame } from "@/lib/games";

// Color del nombre de jugador en el ticker (referencia: home.jsx líneas 198-209)
const PLAYER_COLOR_CLASS: Record<string, string> = {
  cyan: "text-cyan [text-shadow:var(--text-shadow-glow-cyan)]",
  pink: "text-pink [text-shadow:var(--text-shadow-glow-pink)]",
  yellow: "text-yellow [text-shadow:var(--text-shadow-glow-yellow)]",
  green: "text-green [text-shadow:0_0_8px_var(--neon-green)]",
};

// Color de podio de las 3 primeras filas del top; del 4 en adelante, rango en subtle y puntuación en cyan
const PODIUM_RANK_CLASS = [
  "text-gold [text-shadow:var(--text-shadow-glow-gold)]",
  "text-silver [text-shadow:var(--text-shadow-glow-silver)]",
  "text-bronze [text-shadow:var(--text-shadow-glow-bronze)]",
];
const PODIUM_SCORE_CLASS = [
  "text-gold [text-shadow:var(--text-shadow-glow-gold)]",
  "text-silver [text-shadow:var(--text-shadow-glow-silver)]",
  "text-bronze [text-shadow:var(--text-shadow-glow-bronze)]",
];
const PODIUM_BG_CLASS = [
  "bg-gradient-to-r from-gold/14 to-transparent",
  "bg-gradient-to-r from-silver/10 to-transparent",
  "bg-gradient-to-r from-bronze/10 to-transparent",
];

// Actividad en vivo del home: últimas puntuaciones y top jugadores de hoy
// (referencia: home.jsx líneas 185-239, styles.css líneas 1621-1670)
export function LiveActivity() {
  return (
    <Reveal className="mx-auto max-w-[1320px] px-8 py-20">
      <SectionHeading kicker="// 03" kickerColor="yellow" title="ACTIVIDAD EN VIVO" />
      <div className="grid grid-cols-1 gap-4.5 min-[900px]:grid-cols-[1.2fr_1fr]">
        <div className="border border-border-neon bg-surface">
          <div className="border-b border-border-neon px-3.5 py-3">
            <span className="font-pixel text-[10px] tracking-[0.1em] text-cyan [text-shadow:var(--text-shadow-glow-cyan)]">
              ▸ ÚLTIMAS PUNTUACIONES
            </span>
          </div>
          <div className="max-h-[360px] overflow-hidden py-1.5">
            {RECENT_SCORES.map((entry, i) => {
              const game = getGame(entry.gameId);
              const style = { animationDelay: `${i * 60}ms` } as CSSProperties;
              return (
                <div
                  key={entry.player}
                  style={style}
                  className="motion-safe:animate-tick grid grid-cols-[1fr_auto_auto_auto] items-center gap-3 border-b border-border-neon px-4.5 py-2.75 font-mono text-[13px]"
                >
                  <span
                    className={`font-pixel text-[10px] tracking-[0.06em] ${PLAYER_COLOR_CLASS[entry.color]}`}
                  >
                    {entry.player}
                  </span>
                  <span className="text-[12px] text-soft">▸ {game?.title}</span>
                  <span className="font-pixel text-[11px] text-yellow [text-shadow:var(--text-shadow-glow-yellow)]">
                    +{formatScore(entry.score)}
                  </span>
                  <span className="text-[11px] tracking-[0.08em] text-subtle">{entry.timeAgo}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="border border-border-neon bg-surface">
          <div className="flex items-center justify-between gap-2.5 border-b border-border-neon px-3.5 py-3">
            <span className="font-pixel text-[10px] tracking-[0.1em] text-pink [text-shadow:var(--text-shadow-glow-pink)]">
              ▸ TOP JUGADORES · HOY
            </span>
            <Link
              href="/hall-of-fame"
              className="border border-border-neon px-2.5 py-1.5 font-pixel text-[9px] tracking-[0.14em] text-muted hover:border-pink hover:text-pink"
            >
              VER SALÓN →
            </Link>
          </div>
          <div className="flex flex-col gap-2.5 px-4.5 py-4.5">
            {TOP_PLAYERS_TODAY.map((row, i) => {
              const podiumIndex = row.rank - 1;
              const rankClass = PODIUM_RANK_CLASS[podiumIndex] ?? "text-subtle";
              const scoreClass = PODIUM_SCORE_CLASS[podiumIndex] ?? "text-cyan";
              const bgClass = PODIUM_BG_CLASS[podiumIndex] ?? "bg-gradient-to-r from-cyan/6 to-transparent";
              const style = { width: `${100 - i * 16}%` } as CSSProperties;
              return (
                <div key={row.player} className="relative grid grid-cols-[36px_1fr_auto] items-center gap-2.5 py-2 font-mono">
                  <div style={style} className={`pointer-events-none absolute inset-y-0 left-9 ${bgClass}`} />
                  <span className={`relative font-pixel text-[10px] ${rankClass}`}>#{pad2(row.rank)}</span>
                  <span className="relative font-pixel text-[11px] tracking-[0.06em] text-foreground">
                    {row.player}
                  </span>
                  <span className={`relative font-pixel text-[11px] ${scoreClass}`}>
                    {formatScore(row.score)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </Reveal>
  );
}
