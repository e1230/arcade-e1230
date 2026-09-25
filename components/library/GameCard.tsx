"use client";

import { useState, type CSSProperties, type MouseEvent } from "react";
import { GameCover } from "@/components/game/GameCover";
import { NeonButton } from "@/components/ui/NeonButton";
import { formatScore } from "@/lib/format";
import { ACCENTS, type Game } from "@/lib/games";

interface GameCardProps {
  game: Game;
  bestScore: number | undefined;
}

const TRANSFORM_HOVER =
  "motion-safe:hover:[transform:translateY(-8px)_scale(1.03)_rotateX(var(--tilt-rx))_rotateY(var(--tilt-ry))]";

export function GameCard({ game, bestScore }: GameCardProps) {
  const { hex, tint } = ACCENTS[game.accent];
  const [tilt, setTilt] = useState({ rx: 0, ry: 0 });

  const style = {
    "--accent": hex,
    "--accent-tint": tint,
    "--tilt-rx": `${tilt.rx}deg`,
    "--tilt-ry": `${tilt.ry}deg`,
  } as CSSProperties;

  function onMouseMove(e: MouseEvent<HTMLElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    setTilt({
      rx: Number((-py * 10).toFixed(2)),
      ry: Number((px * 12).toFixed(2)),
    });
  }

  function onMouseLeave() {
    setTilt({ rx: 0, ry: 0 });
  }

  return (
    <article
      style={style}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      className={`flex flex-col border-2 border-border-neon bg-surface transition-[border-color,box-shadow,transform] duration-150 [transform-style:preserve-3d] hover:border-(--accent) hover:shadow-[0_0_18px_var(--accent),0_0_48px_var(--accent-tint),0_18px_40px_rgba(0,0,0,.6)] ${TRANSFORM_HOVER}`}
    >
      <div className="relative">
        <GameCover
          variant="card"
          gameId={game.id}
          initial={game.title[0]}
          color="var(--accent)"
          tint="var(--accent-tint)"
        />
        <span className="absolute top-2.5 right-2.5 border border-(--accent) bg-background px-2 py-1 text-xs font-bold text-(--accent)">
          {game.category}
        </span>
      </div>
      <div className="flex flex-1 flex-col gap-3 p-4.5">
        <h3 className="m-0 font-pixel text-sm leading-snug text-white [text-shadow:0_0_8px_var(--accent)]">
          {game.title}
        </h3>
        <p className="m-0 text-[15px] leading-snug text-pretty text-soft">
          {game.shortDescription}
        </p>
        <div className="flex items-center justify-between gap-2 border border-dashed border-yellow/45 bg-yellow/6 px-2.5 py-2">
          <span className="text-xs font-bold text-yellow">
            MEJOR PUNTUACIÓN
          </span>
          <span className="font-pixel text-[11px] text-yellow [text-shadow:var(--text-shadow-glow-yellow)]">
            {bestScore === undefined ? "—" : formatScore(bestScore)}
          </span>
        </div>
        <div className="flex-1" />
        <NeonButton
          href={`/games/${game.id}`}
          accent={game.accent}
          size="md"
          className="w-full"
        >
          JUGAR
        </NeonButton>
      </div>
    </article>
  );
}
