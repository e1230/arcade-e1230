const PIXEL_COUNT = 24;

// Color de cada píxel según su índice 1-based, misma prioridad que los nth-child de la referencia
// (styles.css líneas 1096-1102): amarillo cada 5, si no rosa cada 3, si no cian.
function pixelColorClass(n: number): string {
  if (n % 5 === 0) return "bg-yellow shadow-[0_0_6px_var(--neon-yellow)]";
  if (n % 3 === 0) return "bg-pink shadow-[0_0_6px_var(--neon-pink)]";
  return "bg-cyan shadow-[0_0_6px_var(--neon-cyan)]";
}

export function PixelDivider() {
  return (
    <div className="mx-auto flex max-w-[1200px] items-center gap-4 px-8 py-15" aria-hidden="true">
      <div className="h-px flex-1 bg-gradient-to-r from-transparent via-pink to-transparent" />
      <div className="flex gap-1">
        {Array.from({ length: PIXEL_COUNT }, (_, i) => (
          <span
            key={i}
            className={`h-1.5 w-1.5 motion-safe:animate-pxblink ${pixelColorClass(i + 1)}`}
            style={{ animationDelay: `${i * 80}ms` }}
          />
        ))}
      </div>
      <div className="h-px flex-1 bg-gradient-to-r from-transparent via-pink to-transparent" />
    </div>
  );
}
