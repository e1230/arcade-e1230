"use client";

import { useRouter } from "next/navigation";
import { createContext, useContext } from "react";
import { signOut as signOutAction } from "@/app/auth/actions";
import { createClient } from "./supabase/client";

export interface SessionUser {
  id: string;
  email: string | null;
  alias: string | null; // null = la cuenta todavía no eligió alias
}

// El valor inicial lo pone SessionProvider con el usuario leído en el servidor
export const SessionContext = createContext<SessionUser | null>(null);

export function useSession(): {
  user: SessionUser | null;
  signOut(): Promise<void>;
} {
  const user = useContext(SessionContext);
  const router = useRouter();

  return {
    user,
    async signOut() {
      await signOutAction();
      try {
        // Las cookies ya se borraron en el servidor; esto solo avisa a las otras
        // pestañas (SIGNED_OUT por BroadcastChannel) para que refresquen su sesión
        await createClient().auth.signOut({ scope: "local" });
      } catch {
        // Sin variables de Supabase no hay otras pestañas que avisar
      }
      router.refresh();
    },
  };
}

export function getPlayerName(user: SessionUser | null): string {
  return user?.alias ?? "INVITADO";
}
