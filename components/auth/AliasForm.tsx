"use client";

import Link from "next/link";
import { type FormEvent, useState, useTransition } from "react";
import { chooseAlias } from "@/app/auth/actions";
import { AuthField } from "@/components/auth/AuthField";
import { AuthPanel } from "@/components/auth/AuthPanel";
import { NeonButton } from "@/components/ui/NeonButton";
import {
  ALIAS_MAX_LENGTH,
  AUTH_ERROR_MESSAGES,
  FIELD_MESSAGES,
  isValidAlias,
  normalizeAlias,
} from "@/lib/auth";

interface AliasFormProps {
  // Ruta interna ya validada con safeNextPath
  next: string;
}

export function AliasForm({ next }: AliasFormProps) {
  const [alias, setAlias] = useState("");
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!isValidAlias(normalizeAlias(alias))) {
      setError(FIELD_MESSAGES.alias);
      return;
    }
    setError("");

    startTransition(async () => {
      // Si sale bien, la acción redirige a next y no vuelve con un resultado
      const result = await chooseAlias({ alias, next });
      if (result?.status === "error")
        setError(AUTH_ERROR_MESSAGES[result.code]);
    });
  }

  return (
    <AuthPanel>
      <div className="flex flex-col gap-3 text-center">
        <h1 className="m-0 font-pixel text-sm leading-relaxed text-pink [text-shadow:var(--text-shadow-glow-pink)]">
          ELIGE TU ALIAS
        </h1>
        <p className="m-0 text-sm text-muted">
          Así aparecerás en el ranking. No se puede cambiar.
        </p>
      </div>

      <form onSubmit={submit} noValidate className="flex flex-col gap-4">
        <AuthField
          label="Alias"
          name="alias"
          autoComplete="username"
          value={alias}
          // Sin espacios y en mayúsculas, como se guarda en profiles
          onChange={(value) => setAlias(value.replace(/\s/g, "").toUpperCase())}
          placeholder="TU_ALIAS"
          accent="cyan"
          maxLength={ALIAS_MAX_LENGTH}
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
          {pending ? "GUARDANDO…" : "LISTO"}
        </NeonButton>
      </form>

      <Link
        href={next}
        className="text-center text-[13px] text-subtle hover:text-cyan"
      >
        Ahora no
      </Link>
    </AuthPanel>
  );
}
