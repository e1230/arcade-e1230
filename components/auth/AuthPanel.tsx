import type { ReactNode } from "react";
import { Logo } from "@/components/ui/Logo";

interface AuthPanelProps {
  children: ReactNode;
}

// Marco de tarjeta neón compartido por login, onboarding y recuperación de contraseña
export function AuthPanel({ children }: AuthPanelProps) {
  return (
    <div className="flex w-full max-w-[420px] flex-col gap-5.5 border-2 border-cyan/60 bg-surface/95 p-8.5 py-7 shadow-[0_0_30px_rgba(0,245,255,.25)]">
      <div className="flex justify-center">
        <Logo size="card" />
      </div>
      {children}
    </div>
  );
}
