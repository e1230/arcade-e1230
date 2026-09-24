import { HighlightIcon } from "@/components/about/HighlightIcon";

interface Highlight {
  icon: "HEART" | "BROWSER" | "PLANT";
  text: string;
  colorClass: string;
}

// Tarjetas destacadas del hero (referencia: about.jsx líneas 39-49). Cada color va completo
// como clase literal porque Tailwind no detecta fragmentos interpolados como `text-${color}`.
const HIGHLIGHTS: Highlight[] = [
  { icon: "HEART", text: "HECHO CON ❤️ PARA JUGADORES", colorClass: "text-pink" },
  { icon: "BROWSER", text: "JUEGOS EN HTML — CORREN EN CUALQUIER NAVEGADOR", colorClass: "text-cyan" },
  { icon: "PLANT", text: "PROYECTO EN CONSTANTE CRECIMIENTO", colorClass: "text-green" },
];

export function AboutHero() {
  return (
    <section className="mx-auto max-w-[1100px] px-8 pb-10 pt-20 text-center">
      <div className="mb-4.5 font-pixel text-[11px] tracking-[0.24em] text-yellow [text-shadow:var(--text-shadow-glow-yellow)]">
        ▸ ACERCA DE
      </div>
      <h1 className="m-0 bg-gradient-to-b from-white to-cyan bg-clip-text font-pixel text-[clamp(26px,5vw,52px)] tracking-[0.06em] text-transparent [filter:drop-shadow(0_0_14px_rgba(0,245,255,0.4))]">
        ACERCA DE ARCADE E1230
      </h1>
      <p className="mx-auto mt-7 max-w-[720px] text-[15px] leading-[1.8] tracking-[0.03em] text-muted">
        ARCADE E1230 nació del amor por los videojuegos clásicos. Nuestra misión es preservar y celebrar
        los arcades que definieron una generación, haciéndolos accesibles para todos, en cualquier lugar
        y sin costo.
      </p>
      <div className="mt-13 grid grid-cols-1 gap-4.5 sm:grid-cols-3">
        {HIGHLIGHTS.map((highlight) => (
          <div
            key={highlight.text}
            className={`flex items-center gap-4 border border-border-neon bg-surface-2 p-5 text-left transition-all duration-[220ms] ease-out hover:-translate-y-[3px] hover:border-current hover:shadow-[0_12px_28px_-14px_currentColor] ${highlight.colorClass}`}
          >
            <HighlightIcon kind={highlight.icon} />
            <div className="font-pixel text-[10px] leading-relaxed tracking-[0.1em] text-foreground">
              {highlight.text}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
