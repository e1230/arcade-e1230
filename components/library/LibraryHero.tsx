export function LibraryHero() {
  return (
    <header className="mb-12 flex flex-col items-center gap-5 text-center">
      <h1
        className="m-0 bg-neon-gradient bg-clip-text font-pixel text-[clamp(28px,7vw,72px)] leading-[1.15] tracking-[2px] text-transparent [filter:drop-shadow(0_0_10px_rgba(0,245,255,.55))_drop-shadow(0_0_24px_rgba(255,0,110,.35))] motion-safe:[animation:e-grad_6s_linear_infinite,e-flicker_5s_infinite]"
      >
        ARCADE E1230
      </h1>
      <p className="m-0 font-pixel text-[clamp(10px,1.6vw,14px)] text-yellow [text-shadow:var(--text-shadow-glow-yellow)] motion-safe:animate-blink">
        INSERTA UNA MONEDA PARA JUGAR
      </p>
    </header>
  );
}
