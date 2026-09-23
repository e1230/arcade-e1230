import { NeonButton } from "@/components/ui/NeonButton";

export default function NotFound() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 px-5 py-24 text-center">
      <h1 className="m-0 font-pixel text-[clamp(28px,7vw,56px)] text-pink [text-shadow:var(--text-shadow-neon-pink)]">
        GAME OVER
      </h1>
      <p className="m-0 font-pixel text-xs text-muted">PÁGINA NO ENCONTRADA</p>
      <NeonButton href="/" accent="cyan" size="md">
        VOLVER AL INICIO
      </NeonButton>
    </div>
  );
}
