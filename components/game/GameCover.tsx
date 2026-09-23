import type { CSSProperties } from "react";

interface GameCoverProps {
  variant: "card" | "screenshot" | "mini";
  gameId: string;
  initial: string;
  color: string;
  tint: string;
}

export function GameCover({ variant, gameId, initial, color, tint }: GameCoverProps) {
  const style = {
    "--cover-color": color,
    "--cover-tint": tint,
  } as CSSProperties;

  if (variant === "mini") {
    return (
      <div
        style={style}
        className="relative aspect-square overflow-hidden bg-surface-2 [background-image:repeating-linear-gradient(135deg,var(--cover-tint)_0_10px,transparent_10px_20px)]"
      >
        <div className="absolute inset-0 flex items-center justify-center font-pixel text-3xl text-(--cover-color) [text-shadow:0_0_16px_var(--cover-color)]">
          {initial}
        </div>
        <span className="sr-only">portada: {gameId}</span>
      </div>
    );
  }

  if (variant === "screenshot") {
    return (
      <div
        style={style}
        className="relative aspect-video border-2 border-(--cover-color) bg-surface-2 shadow-[0_0_24px_var(--cover-tint)] [background-image:repeating-linear-gradient(135deg,var(--cover-tint)_0_12px,transparent_12px_24px)]"
      >
        <span className="absolute bottom-2.5 left-3 text-[13px] text-muted">
          captura del juego: {gameId}
        </span>
      </div>
    );
  }

  return (
    <div
      style={style}
      className="relative aspect-4/3 overflow-hidden border-b-2 border-(--cover-color) bg-surface-2 [background-image:repeating-linear-gradient(135deg,var(--cover-tint)_0_10px,transparent_10px_20px)]"
    >
      <div className="absolute inset-0 flex items-center justify-center font-pixel text-[54px] text-(--cover-color) [text-shadow:0_0_16px_var(--cover-color)]">
        {initial}
      </div>
      <span className="absolute bottom-2 left-2.5 text-xs text-muted">portada: {gameId}</span>
    </div>
  );
}
