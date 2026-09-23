import { Reveal } from "@/components/home/Reveal";

interface Stat {
  n: string;
  u: string;
  s: string;
}

// Franja de estadísticas del home (referencia: home.jsx líneas 168-182, styles.css líneas 1030-1047)
const STATS: Stat[] = [
  { n: "8+", u: "JUEGOS", s: "Y CONTANDO" },
  { n: "MILES", u: "DE PARTIDAS", s: "JUGADAS CADA DÍA" },
  { n: "GLOBAL", u: "RANKING", s: "COMPITE CON EL MUNDO" },
];

export function StatsBand() {
  return (
    <Reveal className="relative overflow-hidden border-y border-border-neon bg-gradient-to-b from-[#06060a] to-[#0c0c14] px-8 py-15">
      <div className="pointer-events-none absolute inset-0 [background:radial-gradient(80%_60%_at_50%_50%,rgba(245,255,0,0.06),transparent_70%)]" />
      <div className="relative mx-auto grid max-w-[1200px] grid-cols-1 gap-8 sm:grid-cols-3">
        {STATS.map((stat, i) => (
          <div
            key={stat.u}
            className={`border-border-neon py-5 text-center ${
              i === 0
                ? "border-t-0 sm:border-l-0"
                : "border-t sm:border-t-0 sm:border-l"
            }`}
          >
            <div className="font-pixel text-[clamp(32px,5vw,56px)] tracking-[0.04em] text-yellow [text-shadow:var(--text-shadow-glow-yellow)]">
              {stat.n}
            </div>
            <div className="mt-2.5 text-[13px] tracking-[0.18em] text-foreground">{stat.u}</div>
            <div className="mt-2 font-mono text-[11px] tracking-[0.16em] text-subtle uppercase">
              {stat.s}
            </div>
          </div>
        ))}
      </div>
    </Reveal>
  );
}
