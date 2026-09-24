import { NeonButton } from "@/components/ui/NeonButton";
import type { ContactErrorCode, ContactResult } from "@/lib/contact";

interface ContactTerminalProps {
  result: ContactResult;
  playerName: string;
  onReset: () => void;
}

// Mensaje visible por cada código de error (lib/contact.ts)
const ERROR_MESSAGES: Record<ContactErrorCode, string> = {
  invalid: "Datos inválidos. Revisa los campos.",
  config: "Servidor de correo no configurado.",
  send: "Transmisión fallida. Intenta de nuevo.",
};

// Terminal de éxito/error que reemplaza al formulario (referencia: about.jsx líneas 97-112 y styles.css 1134-1146)
export function ContactTerminal({ result, playerName, onReset }: ContactTerminalProps) {
  const isSuccess = result.status === "success";

  const lines = isSuccess
    ? [
        { text: "./send_message --to=team", prompt: true, tone: "prompt" as const },
        { text: "[OK] Conectando con servidor…", tone: "dim" as const },
        { text: "[OK] Validando contenido…", tone: "dim" as const },
        { text: "[OK] Transmitiendo paquete…", tone: "dim" as const },
        {
          text: `> MENSAJE RECIBIDO. TE RESPONDEREMOS PRONTO. GRACIAS, ${playerName}.`,
          tone: "result" as const,
        },
      ]
    : [
        { text: "./send_message --to=team", prompt: true, tone: "prompt" as const },
        { text: "[OK] Conectando con servidor…", tone: "dim" as const },
        { text: `[ERROR] ${ERROR_MESSAGES[result.code]}`, tone: "dim" as const },
        { text: "> NO SE PUDO ENVIAR EL MENSAJE.", tone: "result" as const },
      ];

  return (
    <div
      role="status"
      aria-live="polite"
      className={`overflow-hidden bg-[#000] font-mono ${
        isSuccess
          ? "border border-green shadow-[0_0_22px_rgba(0,255,136,0.25)]"
          : "border border-pink shadow-[0_0_22px_rgba(255,0,110,0.25)]"
      }`}
    >
      <div className="flex items-center gap-2 border-b border-border-neon bg-background px-3 py-2">
        <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f56]" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#ffbd2e]" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#27c93f]" />
        <span className="ml-2 font-pixel text-[9px] tracking-[0.14em] text-subtle">
          E1230-OS // TERMINAL
        </span>
      </div>
      <div className="px-4.5 pb-5.5 pt-4.5 text-[13px] leading-[1.8]">
        {lines.map((line, index) => (
          <div
            key={index}
            className={`motion-safe:animate-tick ${
              line.tone === "result"
                ? `mt-3 font-bold ${
                    isSuccess
                      ? "text-green [text-shadow:0_0_6px_rgba(0,255,136,0.45)]"
                      : "text-pink [text-shadow:0_0_6px_rgba(255,0,110,0.45)]"
                  } whitespace-pre-wrap`
                : line.tone === "dim"
                  ? "text-muted"
                  : isSuccess
                    ? "text-green"
                    : "text-pink"
            }`}
            style={{ animationDelay: `${index * 150}ms` }}
          >
            {line.prompt && <span className="mr-2 text-cyan">e1230@arcade:~$</span>}
            {line.text}
            {line.tone === "result" && <span className="motion-safe:animate-blink">_</span>}
          </div>
        ))}
        <div className="mt-4.5">
          <NeonButton variant="ghost" size="sm" type="button" onClick={onReset}>
            {isSuccess ? "ENVIAR OTRO MENSAJE" : "REINTENTAR"}
          </NeonButton>
        </div>
      </div>
    </div>
  );
}
