import { NeonButton } from "@/components/ui/NeonButton";
import { Reveal } from "@/components/home/Reveal";
import { SectionHeading } from "@/components/home/SectionHeading";

interface Faq {
  q: string;
  a: string;
  borderClass: string;
}

// Beneficios del plan único (referencia: home.jsx líneas 257-264)
const BENEFITS = [
  "Acceso a todos los juegos",
  "Ranking global y salón de la fama",
  "Sin anuncios entre partidas",
  "Guarda tus puntuaciones",
  "Nuevos juegos cada mes",
  "Funciona en cualquier navegador",
];

// Preguntas frecuentes (referencia: home.jsx líneas 271-283), adaptadas a Arcade E1230
const FAQS: Faq[] = [
  {
    q: "¿REALMENTE ES GRATIS?",
    a: 'Sí. Arcade E1230 es un proyecto sin fines de lucro hecho por amor a los clásicos. No hay versión "premium" escondida.',
    borderClass: "border-l-cyan",
  },
  {
    q: "¿NECESITO CREAR CUENTA?",
    a: "No. Puedes jugar como invitado. Si quieres guardar tu puntuación y aparecer en el ranking, regístrate en 10 segundos.",
    borderClass: "border-l-pink",
  },
  {
    q: "¿CÓMO SOBREVIVEN SIN COBRAR?",
    a: "Es un proyecto comunitario. Si te gusta, compártelo. Esa es toda la moneda que aceptamos.",
    borderClass: "border-l-yellow",
  },
];

export function PricingSection() {
  return (
    <Reveal className="mx-auto max-w-[1320px] px-8 py-20">
      <SectionHeading kicker="// 04" kickerColor="green" title="PRECIOS" />
      <div className="grid grid-cols-1 items-stretch gap-6 min-[900px]:grid-cols-2">
        <div className="relative flex flex-col gap-3.5 border border-green bg-gradient-to-b from-surface-2 to-[#0a0e16] p-8 py-7 shadow-[0_0_28px_rgba(0,255,136,0.18),inset_0_0_14px_rgba(0,255,136,0.08)]">
          <div className="pointer-events-none absolute inset-1 border border-dashed border-green/30" />

          <div className="absolute top-2 right-2 rotate-[14deg] border-2 border-pink bg-deep/85 px-3 py-2 text-center font-pixel text-[11px] leading-tight text-pink shadow-[0_0_14px_rgba(255,0,110,0.35),inset_0_0_8px_rgba(255,0,110,0.2)] [text-shadow:0_0_8px_rgba(255,0,110,0.6)] sm:-top-4.5 sm:-right-4.5">
            FREE
            <br />
            PLAY
          </div>

          <div className="font-pixel text-[9px] tracking-[0.22em] text-muted">PLAN ÚNICO</div>
          <div className="font-pixel text-base tracking-[0.08em] text-green [text-shadow:0_0_10px_rgba(0,255,136,0.5)]">
            JUGADOR E1230
          </div>
          <div className="mt-1.5 flex items-baseline gap-2.5">
            <span className="bg-gradient-to-b from-white to-green bg-clip-text font-pixel text-[64px] tracking-[0.02em] text-transparent [filter:drop-shadow(0_0_12px_rgba(0,255,136,0.5))]">
              $0
            </span>
            <span className="font-pixel text-[11px] tracking-[0.16em] text-muted">/ SIEMPRE</span>
          </div>
          <div className="font-pixel text-[9px] tracking-[0.18em] text-yellow [text-shadow:0_0_6px_rgba(245,255,0,0.45)]">
            SIN TRUCOS · SIN LETRA PEQUEÑA
          </div>

          <ul className="m-0 mt-2.5 mb-1 flex list-none flex-col gap-2 p-0">
            {BENEFITS.map((benefit) => (
              <li key={benefit} className="text-[13px] tracking-[0.02em] text-foreground">
                <span className="text-green">✔</span> {benefit}
              </li>
            ))}
          </ul>

          <NeonButton
            href="/login?mode=register"
            variant="outline"
            accent="cyan"
            size="lg"
            className="w-full motion-safe:animate-pulse-cyan"
          >
            EMPEZAR GRATIS →
          </NeonButton>
          <div className="text-center font-mono text-[11px] tracking-[0.1em] text-subtle">
            No pedimos tarjeta. Nunca lo haremos.
          </div>
        </div>

        <div className="flex flex-col justify-center gap-3.5">
          {FAQS.map((faq) => (
            <div
              key={faq.q}
              className={`border border-border-neon border-l-[3px] bg-surface px-5 py-4.5 ${faq.borderClass}`}
            >
              <div className="mb-2 text-[10px] tracking-[0.12em] text-foreground">{faq.q}</div>
              <div className="text-[13px] leading-relaxed text-soft">{faq.a}</div>
            </div>
          ))}
        </div>
      </div>
    </Reveal>
  );
}
