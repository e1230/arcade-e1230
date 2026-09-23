const CELLS = [true, true, true, true, false, true, true, true, true];
const DELAYS = [0, 0.1, 0.2, 0.7, 0, 0.3, 0.6, 0.5, 0.4];

export function PixelLoader() {
  return (
    <div className="absolute inset-0 z-[3] flex flex-col items-center justify-center gap-5.5 bg-deep">
      <div className="grid grid-cols-3 gap-1">
        {CELLS.map((visible, i) =>
          visible ? (
            <span
              key={i}
              style={{ animationDelay: `${DELAYS[i]}s` }}
              className="motion-safe:animate-pix h-3.5 w-3.5"
            />
          ) : (
            <span key={i} className="h-3.5 w-3.5" />
          ),
        )}
      </div>
      <span className="motion-safe:animate-blink font-pixel text-xs text-cyan">CARGANDO…</span>
      <div className="motion-safe:animate-wipe absolute inset-x-0 h-[10%] bg-linear-to-b from-transparent via-cyan/25 to-transparent" />
    </div>
  );
}
