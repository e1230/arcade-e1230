"use client";

import { useRouter } from "next/navigation";
import { type ReactNode, useEffect, useRef } from "react";
import { SessionContext, type SessionUser } from "@/lib/session";
import { createClient } from "@/lib/supabase/client";

interface SessionProviderProps {
  initialUser: SessionUser | null;
  children: ReactNode;
}

export function SessionProvider({
  initialUser,
  children,
}: SessionProviderProps) {
  const router = useRouter();
  // Id del usuario que pintó el servidor, para refrescar solo cuando la sesión cambia de verdad
  const userIdRef = useRef(initialUser?.id ?? null);

  useEffect(() => {
    userIdRef.current = initialUser?.id ?? null;
  }, [initialUser]);

  useEffect(() => {
    let supabase: ReturnType<typeof createClient>;
    try {
      supabase = createClient();
    } catch {
      // Sin variables de Supabase no hay sesión que escuchar
      return;
    }

    // SIGNED_IN y SIGNED_OUT también llegan desde otras pestañas: el layout vuelve a leer la sesión
    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      if (event !== "SIGNED_IN" && event !== "SIGNED_OUT") return;
      if ((session?.user.id ?? null) !== userIdRef.current) router.refresh();
    });

    return () => data.subscription.unsubscribe();
  }, [router]);

  return <SessionContext value={initialUser}>{children}</SessionContext>;
}
