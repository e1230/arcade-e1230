import { ContactForm } from "@/components/about/ContactForm";

interface Tip {
  text: string;
  ledClass: string;
}

// Indicadores de confianza (referencia: about.jsx líneas 72-76). Cada color va completo
// como clase literal porque Tailwind no detecta fragmentos interpolados como `bg-${color}`.
const TIPS: Tip[] = [
  { text: "RESPUESTA EN 24-48H", ledClass: "bg-green shadow-[0_0_6px_var(--neon-green)]" },
  { text: "SUGERENCIAS BIENVENIDAS", ledClass: "bg-yellow shadow-[0_0_6px_var(--neon-yellow)]" },
  { text: "SIN SPAM, JAMÁS", ledClass: "bg-pink shadow-[0_0_6px_var(--neon-pink)]" },
];

export function ContactSection() {
  return (
    <section className="mx-auto mb-20 max-w-[1200px] px-8">
      <div className="grid grid-cols-1 items-start gap-6 min-[900px]:grid-cols-[1fr_1.2fr] min-[900px]:gap-10">
        <div>
          <div className="mb-3.5 font-pixel text-[11px] tracking-[0.24em] text-cyan [text-shadow:var(--text-shadow-glow-cyan)]">
            ▸ CONTACTO
          </div>
          <h2 className="m-0 font-pixel text-[clamp(22px,3.5vw,36px)] tracking-[0.06em] text-cyan [text-shadow:0_0_12px_rgba(0,245,255,0.4)]">
            CONTÁCTANOS
          </h2>
          <p className="my-4.5 text-sm leading-[1.7] text-muted">
            ¿Tienes alguna sugerencia, quieres proponer un juego, o simplemente quieres saludar?
            Escríbenos.
          </p>
          <div className="flex flex-col gap-2.5">
            {TIPS.map((tip) => (
              <div
                key={tip.text}
                className="flex items-center gap-2.5 font-pixel text-[9px] tracking-[0.14em] text-muted"
              >
                <span className={`h-2 w-2 rounded-full ${tip.ledClass}`} />
                {tip.text}
              </div>
            ))}
          </div>
        </div>

        <ContactForm />
      </div>
    </section>
  );
}
