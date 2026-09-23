import { NeonButton } from "@/components/ui/NeonButton";
import { formatScore } from "@/lib/format";

interface GameOverModalProps {
  score: number;
  saved: boolean;
  typedMessage: string;
  isGuest: boolean;
  onSave: () => void;
  onPlayAgain: () => void;
}

export function GameOverModal({
  score,
  saved,
  typedMessage,
  isGuest,
  onSave,
  onPlayAgain,
}: GameOverModalProps) {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-deep/86 p-5 backdrop-blur-[3px]">
      <div className="motion-safe:animate-pop flex w-full max-w-[460px] flex-col items-center gap-5.5 border-2 border-pink bg-surface p-9 py-7 text-center shadow-[0_0_40px_rgba(255,0,110,.5)]">
        <h2 className="m-0 font-pixel text-[clamp(20px,5vw,28px)] leading-snug text-pink [text-shadow:var(--text-shadow-neon-pink)]">
          FIN DEL JUEGO
        </h2>
        <div className="flex flex-col gap-2.5">
          <span className="text-[13px] font-bold text-muted">PUNTUACIÓN FINAL</span>
          <span className="font-pixel text-3xl text-yellow [text-shadow:var(--text-shadow-glow-yellow)]">
            {formatScore(score)}
          </span>
        </div>

        {!saved && (
          <>
            <NeonButton variant="solid" accent="yellow" size="md" className="w-full" onClick={onSave}>
              GUARDAR PUNTUACIÓN
            </NeonButton>
            {isGuest && (
              <span className="-mt-2.5 text-[13px] text-muted">
                Como invitado, se guarda solo en este dispositivo.
              </span>
            )}
          </>
        )}

        {saved && (
          <div className="min-h-6 font-pixel text-[13px] text-cyan [text-shadow:var(--text-shadow-glow-cyan)]">
            {typedMessage}
            <span className="motion-safe:animate-blink">_</span>
          </div>
        )}

        <div className="flex w-full flex-wrap gap-3">
          <NeonButton
            variant="outline"
            accent="cyan"
            size="sm"
            className="flex-1 basis-40"
            onClick={onPlayAgain}
          >
            JUGAR DE NUEVO
          </NeonButton>
          <NeonButton href="/games" variant="ghost" size="sm" className="flex-1 basis-40">
            VOLVER A LA BIBLIOTECA
          </NeonButton>
        </div>
      </div>
    </div>
  );
}
