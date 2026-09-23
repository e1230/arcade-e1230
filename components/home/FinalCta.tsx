import { NeonButton } from "@/components/ui/NeonButton";
import { Reveal } from "@/components/home/Reveal";

// Cierre del home (referencia: home.jsx líneas 288-292, styles.css líneas 1049-1066)
export function FinalCta() {
  return (
    <Reveal className="relative mx-auto max-w-[900px] px-8 py-25 pb-30 text-center">
      <div className="absolute top-7.5 left-1/2 h-px w-3/5 -translate-x-1/2 bg-gradient-to-r from-transparent via-cyan to-transparent opacity-50" />
      <h2 className="m-0 mb-9 bg-gradient-to-b from-white to-yellow bg-clip-text font-pixel text-[clamp(22px,4vw,40px)] tracking-[0.08em] text-transparent [filter:drop-shadow(0_0_12px_rgba(245,255,0,0.4))]">
        ¿LISTO PARA JUGAR?
      </h2>
      <NeonButton
        href="/games"
        variant="outline"
        accent="cyan"
        size="lg"
        className="motion-safe:animate-pulse-cyan"
      >
        INSERTAR MONEDA →
      </NeonButton>
      <div className="mt-7 text-[13px] tracking-[0.06em] text-soft">
        Gratis. Sin registro obligatorio. Empieza en segundos.
      </div>
      <div className="absolute bottom-7.5 left-1/2 h-px w-3/5 -translate-x-1/2 bg-gradient-to-r from-transparent via-cyan to-transparent opacity-50" />
    </Reveal>
  );
}
