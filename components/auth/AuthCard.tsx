"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { type FormEvent, useState, useTransition } from "react";
import { signInWithPassword, signUp } from "@/app/auth/actions";
import { AuthField } from "@/components/auth/AuthField";
import { AuthPanel } from "@/components/auth/AuthPanel";
import { NeonButton } from "@/components/ui/NeonButton";
import { createClient } from "@/lib/supabase/client";
import {
  ALIAS_MAX_LENGTH,
  AUTH_ERROR_MESSAGES,
  type AuthResult,
  EMAIL_MAX_LENGTH,
  FIELD_MESSAGES,
  isValidAlias,
  isValidEmail,
  isPasswordTooLong,
  isValidPassword,
  normalizeAlias,
  OAUTH_ERROR_MESSAGE,
} from "@/lib/auth";

export type AuthTab = "login" | "register";

interface AuthCardProps {
  initialTab?: AuthTab;
  // Ruta interna ya validada con safeNextPath; null si /login llegó sin ?next=
  next?: string | null;
  // Mensaje de ?error= (OAuth fallido o enlace de recuperación inválido)
  initialError?: string;
}

const ACTIVE_TAB_CLASS =
  "bg-cyan px-1.5 py-3.5 font-pixel text-[9px] leading-relaxed text-background";
const INACTIVE_TAB_CLASS =
  "bg-transparent px-1.5 py-3.5 font-pixel text-[9px] leading-relaxed text-muted";

const EMPTY_FORM = { alias: "", email: "", pass: "" };

// Mientras se escribe el alias: sin espacios y en mayúsculas, como se guarda en profiles
function toAliasInput(value: string): string {
  return value.replace(/\s/g, "").toUpperCase();
}

export function AuthCard({
  initialTab = "login",
  next = null,
  initialError = "",
}: AuthCardProps) {
  const router = useRouter();
  const [tab, setTab] = useState<AuthTab>(initialTab);
  const [form, setForm] = useState(EMPTY_FORM);
  const [error, setError] = useState(initialError);
  const [pending, startTransition] = useTransition();
  // true mientras el navegador sale hacia Google o GitHub
  const [redirecting, setRedirecting] = useState(false);

  function pickTab(nextTab: AuthTab) {
    setTab(nextTab);
    setError("");
  }

  // Devuelve el primer aviso de validación, o "" si el formulario se puede enviar
  function validate(): string {
    if (tab === "register" && !isValidAlias(normalizeAlias(form.alias))) {
      return FIELD_MESSAGES.alias;
    }
    if (!isValidEmail(form.email.trim())) return FIELD_MESSAGES.email;
    if (tab === "register" && !isValidPassword(form.pass)) {
      return FIELD_MESSAGES.password;
    }
    if (tab === "register" && isPasswordTooLong(form.pass)) {
      return FIELD_MESSAGES.passwordMax;
    }
    if (tab === "login" && !form.pass) return "Ingresa tu contraseña.";
    return "";
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const message = validate();
    if (message) {
      setError(message);
      return;
    }
    setError("");

    startTransition(async () => {
      const destination = next ?? "/";
      // Si sale bien, la acción redirige y no vuelve con un resultado
      const result: AuthResult | undefined =
        tab === "register"
          ? await signUp({
              alias: form.alias,
              email: form.email,
              password: form.pass,
              next: destination,
            })
          : await signInWithPassword({
              email: form.email,
              password: form.pass,
              next: destination,
            });
      if (result?.status === "error")
        setError(AUTH_ERROR_MESSAGES[result.code]);
    });
  }

  // OAuth con PKCE desde el navegador: el verificador queda en una cookie y
  // /auth/callback lo canjea por la sesión al volver del proveedor
  async function oauth(provider: "google" | "github") {
    setError("");
    setRedirecting(true);
    try {
      const callback = new URL("/auth/callback", window.location.origin);
      callback.searchParams.set("next", next ?? "/");
      const { error: oauthError } = await createClient().auth.signInWithOAuth({
        provider,
        options: { redirectTo: callback.toString() },
      });
      // Si sale bien, el navegador ya está saliendo hacia el proveedor
      if (!oauthError) return;
    } catch {
      // Faltan las variables de Supabase
    }
    setRedirecting(false);
    setError(OAUTH_ERROR_MESSAGE);
  }

  function guest() {
    router.push(next ?? "/games");
  }

  const isRegister = tab === "register";
  const submitLabel = isRegister
    ? pending
      ? "CREANDO…"
      : "CREAR CUENTA"
    : pending
      ? "ENTRANDO…"
      : "ENTRAR";

  return (
    <AuthPanel>
      <div className="grid grid-cols-2 border border-border">
        <button
          type="button"
          onClick={() => pickTab("login")}
          className={`cursor-pointer border-0 ${tab === "login" ? ACTIVE_TAB_CLASS : INACTIVE_TAB_CLASS}`}
        >
          INICIAR SESIÓN
        </button>
        <button
          type="button"
          onClick={() => pickTab("register")}
          className={`cursor-pointer border-0 ${isRegister ? ACTIVE_TAB_CLASS : INACTIVE_TAB_CLASS}`}
        >
          CREAR CUENTA
        </button>
      </div>

      <form onSubmit={submit} noValidate className="flex flex-col gap-4">
        {isRegister && (
          <AuthField
            label="Alias"
            name="alias"
            autoComplete="username"
            value={form.alias}
            onChange={(alias) =>
              setForm((f) => ({ ...f, alias: toAliasInput(alias) }))
            }
            placeholder="TU_ALIAS"
            accent="cyan"
            maxLength={ALIAS_MAX_LENGTH}
            disabled={pending}
          />
        )}
        <AuthField
          label="Correo electrónico"
          type="email"
          name="email"
          autoComplete="email"
          value={form.email}
          onChange={(email) => setForm((f) => ({ ...f, email }))}
          placeholder="jugador@correo.com"
          accent="pink"
          maxLength={EMAIL_MAX_LENGTH}
          disabled={pending}
        />
        <AuthField
          label="Contraseña"
          type="password"
          name="password"
          autoComplete={isRegister ? "new-password" : "current-password"}
          value={form.pass}
          onChange={(pass) => setForm((f) => ({ ...f, pass }))}
          placeholder="••••••••"
          accent="cyan"
          disabled={pending}
        />

        {!isRegister && (
          <Link
            href="/auth/forgot"
            className="-mt-1.5 self-end text-[13px] text-subtle hover:text-cyan"
          >
            ¿Olvidaste tu contraseña?
          </Link>
        )}

        {error && <span className="text-sm text-pink">{error}</span>}

        <NeonButton
          type="submit"
          variant="solid"
          accent="cyan"
          size="md"
          disabled={pending}
        >
          {submitLabel}
        </NeonButton>
      </form>

      <div className="flex items-center gap-3 text-[13px] text-placeholder">
        <span className="h-px flex-1 bg-border" />o continúa con
        <span className="h-px flex-1 bg-border" />
      </div>

      <div className="grid grid-cols-2 gap-2.5">
        <NeonButton
          type="button"
          variant="ghost"
          size="md"
          onClick={() => oauth("google")}
          disabled={pending || redirecting}
        >
          Google
        </NeonButton>
        <NeonButton
          type="button"
          variant="ghost"
          size="md"
          onClick={() => oauth("github")}
          disabled={pending || redirecting}
        >
          GitHub
        </NeonButton>
      </div>

      <NeonButton
        type="button"
        variant="dashed"
        accent="yellow"
        size="md"
        onClick={guest}
      >
        JUGAR COMO INVITADO
      </NeonButton>
      <p className="m-0 -mt-2.5 text-center text-[13px] text-subtle">
        Sin cuenta puedes jugar, pero tus puntuaciones no entran al ranking.
      </p>
    </AuthPanel>
  );
}
