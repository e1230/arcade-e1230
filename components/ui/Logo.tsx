interface LogoProps {
  size?: "nav" | "card";
}

const SIZE_CLASS: Record<NonNullable<LogoProps["size"]>, string> = {
  nav: "text-sm",
  card: "text-xl",
};

export function Logo({ size = "nav" }: LogoProps) {
  return (
    <span
      className={`font-pixel tracking-[1px] text-cyan [text-shadow:var(--text-shadow-neon-cyan)] ${SIZE_CLASS[size]}`}
    >
      ARCADE <span className="text-pink [text-shadow:var(--text-shadow-glow-pink)]">E1230</span>
    </span>
  );
}
