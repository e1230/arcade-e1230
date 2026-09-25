interface SignalLostProps {
  title?: string;
  message?: string;
}

export function SignalLost({
  title = "SEÑAL PERDIDA",
  message = "No pudimos conectar con el servidor. Intenta de nuevo en unos segundos.",
}: SignalLostProps) {
  return (
    <div className="flex flex-col items-center gap-4 border-2 border-pink/60 bg-surface px-6 py-12 text-center shadow-[0_0_20px_rgba(255,0,110,.25),inset_0_0_30px_rgba(255,0,110,.06)]">
      <h2 className="m-0 font-pixel text-sm text-pink [text-shadow:var(--text-shadow-neon-pink)]">
        {title}
      </h2>
      <p className="m-0 max-w-md text-sm text-muted">{message}</p>
    </div>
  );
}
