interface SectionHeadingProps {
  kicker: string;
  kickerColor: "cyan" | "pink" | "yellow" | "green";
  title: string;
}

// Encabezado de sección del home: kicker + título + línea degradada (referencia: styles.css líneas 989-995)
const KICKER_CLASS: Record<SectionHeadingProps["kickerColor"], string> = {
  cyan: "text-cyan [text-shadow:var(--text-shadow-glow-cyan)]",
  pink: "text-pink [text-shadow:var(--text-shadow-glow-pink)]",
  yellow: "text-yellow [text-shadow:var(--text-shadow-glow-yellow)]",
  green: "text-green [text-shadow:0_0_8px_var(--neon-green)]",
};

export function SectionHeading({ kicker, kickerColor, title }: SectionHeadingProps) {
  return (
    <div className="mb-9 flex items-center gap-4.5">
      <span className={`font-pixel text-[11px] tracking-[0.22em] ${KICKER_CLASS[kickerColor]}`}>
        {kicker}
      </span>
      <h2 className="m-0 font-pixel text-[clamp(18px,2.8vw,28px)] tracking-[0.06em] text-foreground">
        {title}
      </h2>
      <div className="h-px flex-1 bg-gradient-to-r from-border-neon to-transparent" />
    </div>
  );
}
