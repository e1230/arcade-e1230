"use client";

import { type FormEvent, useState, useTransition } from "react";
import { requestPasswordReset } from "@/app/auth/actions";
import { AuthField } from "@/components/auth/AuthField";
import { AuthPanel } from "@/components/auth/AuthPanel";
import { NeonButton } from "@/components/ui/NeonButton";
import {
  AUTH_ERROR_MESSAGES,
  EMAIL_MAX_LENGTH,
  FIELD_MESSAGES,
  isValidEmail,
} from "@/lib/auth";

// Mismo texto exista o no la cuenta: no revela qué correos están registrados
const SENT_MESSAGE =
  "Si existe una cuenta con ese correo, te enviamos un enlace para elegir una contraseña nueva.";

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);
  const [pending, startTransition] = useTransition();

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!isValidEmail(email.trim())) {
      setError(FIELD_MESSAGES.email);
      return;
    }
    setError("");

    startTransition(async () => {
      const result = await requestPasswordReset({ email });
      if (result.status === "error") {
        setError(AUTH_ERROR_MESSAGES[result.code]);
        return;
      }
      setSent(true);
    });
  }

  return (
    <AuthPanel>
      <div className="flex flex-col gap-3 text-center">
        <h1 className="m-0 font-pixel text-sm leading-relaxed text-cyan [text-shadow:var(--text-shadow-glow-cyan)]">
          RECUPERAR CONTRASEÑA
        </h1>
        {!sent && (
          <p className="m-0 text-sm text-muted">
            Escribe el correo de tu cuenta y te mandamos un enlace.
          </p>
        )}
      </div>

      {sent ? (
        <p className="m-0 text-center text-[15px] text-foreground">
          {SENT_MESSAGE}
        </p>
      ) : (
        <form onSubmit={submit} noValidate className="flex flex-col gap-4">
          <AuthField
            label="Correo electrónico"
            type="email"
            name="email"
            autoComplete="email"
            value={email}
            onChange={setEmail}
            placeholder="jugador@correo.com"
            accent="pink"
            maxLength={EMAIL_MAX_LENGTH}
            disabled={pending}
          />

          {error && <span className="text-sm text-pink">{error}</span>}

          <NeonButton
            type="submit"
            variant="solid"
            accent="cyan"
            size="md"
            disabled={pending}
          >
            {pending ? "ENVIANDO…" : "ENVIAR ENLACE"}
          </NeonButton>
        </form>
      )}

      <NeonButton href="/login" variant="ghost" size="md">
        VOLVER
      </NeonButton>
    </AuthPanel>
  );
}
