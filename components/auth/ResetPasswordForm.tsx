"use client";

import { type FormEvent, useState, useTransition } from "react";
import { updatePassword } from "@/app/auth/actions";
import { AuthField } from "@/components/auth/AuthField";
import { AuthPanel } from "@/components/auth/AuthPanel";
import { NeonButton } from "@/components/ui/NeonButton";
import {
  AUTH_ERROR_MESSAGES,
  FIELD_MESSAGES,
  isValidPassword,
} from "@/lib/auth";

export function ResetPasswordForm() {
  const [form, setForm] = useState({ password: "", repeat: "" });
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!isValidPassword(form.password)) {
      setError(FIELD_MESSAGES.password);
      return;
    }
    if (form.password !== form.repeat) {
      setError(FIELD_MESSAGES.passwordMismatch);
      return;
    }
    setError("");

    startTransition(async () => {
      // Si sale bien, la acción redirige al Home y no vuelve con un resultado
      const result = await updatePassword({ password: form.password });
      if (result?.status === "error")
        setError(AUTH_ERROR_MESSAGES[result.code]);
    });
  }

  return (
    <AuthPanel>
      <h1 className="m-0 text-center font-pixel text-sm leading-relaxed text-cyan [text-shadow:var(--text-shadow-glow-cyan)]">
        NUEVA CONTRASEÑA
      </h1>

      <form onSubmit={submit} noValidate className="flex flex-col gap-4">
        <AuthField
          label="Nueva contraseña"
          type="password"
          name="new-password"
          autoComplete="new-password"
          value={form.password}
          onChange={(password) => setForm((f) => ({ ...f, password }))}
          placeholder="••••••••"
          accent="cyan"
          disabled={pending}
        />
        <AuthField
          label="Repite la contraseña"
          type="password"
          name="repeat-password"
          autoComplete="new-password"
          value={form.repeat}
          onChange={(repeat) => setForm((f) => ({ ...f, repeat }))}
          placeholder="••••••••"
          accent="pink"
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
          {pending ? "GUARDANDO…" : "GUARDAR CONTRASEÑA"}
        </NeonButton>
      </form>
    </AuthPanel>
  );
}
