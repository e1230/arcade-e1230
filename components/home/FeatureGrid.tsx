import { FeatureIcon } from "@/components/home/FeatureIcon";
import { Reveal } from "@/components/home/Reveal";
import { SectionHeading } from "@/components/home/SectionHeading";

interface Feature {
  icon: "GAMEPAD" | "FREE" | "TROPHY" | "ROCKET";
  title: string;
  description: string;
  colorClass: string;
}

// Características del home (referencia: home.jsx líneas 135-146). Cada color va completo
// como clase literal porque Tailwind no detecta fragmentos interpolados como `text-${color}`.
const FEATURES: Feature[] = [
  {
    icon: "GAMEPAD",
    title: "JUEGOS CLÁSICOS",
    description:
      "Arkanoid, Tetris, Snake y muchos más. Los mejores arcades de todos los tiempos en un solo lugar.",
    colorClass: "text-cyan",
  },
  {
    icon: "FREE",
    title: "100% GRATIS",
    description: "Sin suscripciones, sin pagos ocultos. Todos los juegos disponibles de forma gratuita.",
    colorClass: "text-yellow",
  },
  {
    icon: "TROPHY",
    title: "LADDER BOARDS",
    description:
      "Compite con jugadores de todo el mundo. Escala el ranking y demuestra quién es el mejor.",
    colorClass: "text-pink",
  },
  {
    icon: "ROCKET",
    title: "SIEMPRE CRECIENDO",
    description: "Agregamos nuevos juegos constantemente. Vuelve seguido, siempre habrá algo nuevo que jugar.",
    colorClass: "text-green",
  },
];

export function FeatureGrid() {
  return (
    <Reveal className="mx-auto max-w-[1320px] px-8 py-20">
      <SectionHeading kicker="// 01" kickerColor="pink" title="¿POR QUÉ ARCADE E1230?" />
      <div className="grid grid-cols-1 gap-4.5 sm:grid-cols-2 lg:grid-cols-4">
        {FEATURES.map((feature) => (
          <div
            key={feature.title}
            className={`flex flex-col gap-3.5 border border-border-neon bg-gradient-to-b from-surface-2 to-surface-3 p-6 py-5 transition-all duration-[220ms] ease-out hover:-translate-y-1.5 hover:border-current hover:shadow-[0_18px_40px_-16px_currentColor,0_0_0_1px_currentColor] ${feature.colorClass}`}
          >
            <FeatureIcon kind={feature.icon} />
            <div className="font-pixel text-xs tracking-[0.1em] text-current [text-shadow:0_0_8px_currentColor]">
              {feature.title}
            </div>
            <div className="text-[13px] leading-relaxed text-soft">{feature.description}</div>
          </div>
        ))}
      </div>
    </Reveal>
  );
}
