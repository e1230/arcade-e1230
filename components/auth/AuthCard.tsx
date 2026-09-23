"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { AuthField } from "@/components/auth/AuthField";
import { Logo } from "@/components/ui/Logo";
import { NeonButton } from "@/components/ui/NeonButton";
import { useSession } from "@/lib/session";

type AuthTab = "login" | "register";

const ACTIVE_TAB_CLASS = "bg-cyan px-1.5 py-3.5 font-pixel text-[9px] leading-relaxed text-background";
const INACTIVE_TAB_CLASS =
  "bg-transparent px-1.5 py-3.5 font-pixel text-[9px] leading-relaxed text-muted";

export function AuthCard() {
  const router = useRouter();
  const { signIn } = useSession();
  const [tab, setTab] = useState<AuthTab>("login");
  const [form, setForm] = useState({ user: "", pass: "", email: "" });
  const [error, setError] = useState("");

  function pickTab(next: AuthTab) {
    setTab(next);
    setError("");
  }

  function goHome() {
    setForm({ user: "", pass: "", email: "" });
    router.push("/");
  }

  function submit() {
    if (!form.user.trim()) {
      setError("Ingresa tu usuario.");
      return;
    }
    if (tab === "register" && !/.+@.+\..+/.test(form.email)) {
      setError("Ingresa un correo electrónico válido.");
      return;
    }
    if (form.pass.length < 4) {
      setError("La contraseña debe tener al menos 4 caracteres.");
      return;
    }
    signIn({ name: form.user.trim().toUpperCase().slice(0, 14), guest: false });
    goHome();
  }

  function google() {
    signIn({ name: "JUGADOR_G", guest: false });
    goHome();
  }

  function github() {
    signIn({ name: "JUGADOR_GH", guest: false });
    goHome();
  }

  function guest() {
    signIn({ name: "INVITADO", guest: true });
    goHome();
  }

  return (
    <div className="flex w-full max-w-[420px] flex-col gap-5.5 border-2 border-cyan/60 bg-surface/95 p-8.5 py-7 shadow-[0_0_30px_rgba(0,245,255,.25)]">
      <div className="flex justify-center">
        <Logo size="card" />
      </div>

      <div className="grid grid-cols-2 border border-border">
        <button
          onClick={() => pickTab("login")}
          className={`cursor-pointer border-0 ${tab === "login" ? ACTIVE_TAB_CLASS : INACTIVE_TAB_CLASS}`}
        >
          INICIAR SESIÓN
        </button>
        <button
          onClick={() => pickTab("register")}
          className={`cursor-pointer border-0 ${tab === "register" ? ACTIVE_TAB_CLASS : INACTIVE_TAB_CLASS}`}
        >
          CREAR CUENTA
        </button>
      </div>

      <div className="flex flex-col gap-4">
        <AuthField
          label="Usuario"
          value={form.user}
          onChange={(user) => setForm((f) => ({ ...f, user }))}
          placeholder="tu_alias"
          accent="cyan"
        />
        {tab === "register" && (
          <AuthField
            label="Correo electrónico"
            type="email"
            value={form.email}
            onChange={(email) => setForm((f) => ({ ...f, email }))}
            placeholder="jugador@correo.com"
            accent="pink"
          />
        )}
        <AuthField
          label="Contraseña"
          type="password"
          value={form.pass}
          onChange={(pass) => setForm((f) => ({ ...f, pass }))}
          placeholder="••••••••"
          accent="cyan"
        />

        {error && <span className="text-sm text-pink">{error}</span>}

        <NeonButton variant="solid" accent="cyan" size="md" onClick={submit}>
          {tab === "register" ? "CREAR CUENTA" : "ENTRAR"}
        </NeonButton>
      </div>

      <div className="flex items-center gap-3 text-[13px] text-placeholder">
        <span className="h-px flex-1 bg-border" />o continúa con
        <span className="h-px flex-1 bg-border" />
      </div>

      <div className="grid grid-cols-2 gap-2.5">
        <NeonButton variant="ghost" size="md" onClick={google}>
          Google
        </NeonButton>
        <NeonButton variant="ghost" size="md" onClick={github}>
          GitHub
        </NeonButton>
      </div>

      <NeonButton variant="dashed" accent="yellow" size="md" onClick={guest}>
        JUGAR COMO INVITADO
      </NeonButton>
      <p className="-mt-2.5 m-0 text-center text-[13px] text-subtle">
        Sin cuenta: tus puntuaciones no se guardan en el ranking global.
      </p>
    </div>
  );
}
