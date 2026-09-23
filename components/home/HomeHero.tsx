import { NeonButton } from "@/components/ui/NeonButton";
import { FloatingSilhouettes } from "@/components/home/FloatingSilhouettes";

// Portada del home (referencia: home.jsx líneas 103-125, styles.css líneas 933-974)
export function HomeHero() {
  return (
    <section className="relative flex min-h-[calc(100svh-64px)] items-center justify-center overflow-hidden px-5 pt-20 pb-15">
      <FloatingSilhouettes />
      <div className="relative z-3 mx-auto flex max-w-[1100px] flex-col items-center text-center">
        <p className="font-pixel text-[11px] tracking-[0.24em] text-yellow [text-shadow:var(--text-shadow-glow-yellow)]">
          ▸ INSERTA UNA MONEDA<span className="motion-safe:animate-blink">_</span>
        </p>
        <h1 className="mt-6 flex flex-col gap-2 font-pixel text-[clamp(32px,7vw,88px)] leading-[1.05] tracking-[0.04em]">
          <span className="text-white [text-shadow:0_0_14px_rgba(255,255,255,0.4)]">
            EL ARCADE
          </span>
          <span className="bg-gradient-to-b from-cyan to-[#4dd0e1] bg-clip-text text-transparent [filter:drop-shadow(0_0_14px_rgba(0,245,255,0.45))]">
            CLÁSICO ESTÁ
          </span>
          <span className="bg-gradient-to-b from-pink to-[#ff6b9e] bg-clip-text text-transparent [filter:drop-shadow(0_0_14px_rgba(255,0,110,0.45))]">
            DE VUELTA
          </span>
        </h1>
        <p className="mx-auto mt-7 max-w-[640px] text-[15px] leading-relaxed tracking-[0.04em] text-soft">
          Juega los mejores clásicos directamente en tu navegador.
          <br />
          Sin descargas. Sin costo. Solo diversión.
        </p>
        <div className="mt-9 flex flex-wrap justify-center gap-4">
          <NeonButton
            href="/games"
            variant="outline"
            accent="cyan"
            size="lg"
            className="motion-safe:animate-pulse-cyan"
          >
            ▶ EXPLORAR JUEGOS
          </NeonButton>
          <NeonButton href="/login?mode=register" variant="outline" accent="pink" size="lg">
            ✦ CREAR CUENTA
          </NeonButton>
        </div>
      </div>
      <div
        aria-hidden="true"
        className="absolute bottom-4 left-1/2 z-3 flex -translate-x-1/2 flex-col items-center gap-2 font-pixel text-[9px] tracking-[0.2em] text-subtle"
      >
        <span>DESLIZA</span>
        <span className="motion-safe:animate-bounce-arrow text-cyan">▼</span>
      </div>
    </section>
  );
}
