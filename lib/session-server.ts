import { cache } from "react";
import type { SessionUser } from "./session";
import { createClient } from "./supabase/server";

// Solo servidor: lee la sesión de las cookies y el alias de profiles.
// cache() hace que el layout y las páginas que lo llamen compartan una sola lectura por petición.
export const fetchSessionUser = cache(async (): Promise<SessionUser | null> => {
  try {
    const supabase = await createClient();
    // Sin cookie de sesión, getClaims no hace ninguna petición de red
    const { data, error } = await supabase.auth.getClaims();
    if (error || !data) return null;

    const { sub, email } = data.claims;
    const { data: profile } = await supabase
      .from("profiles")
      .select("alias")
      .eq("id", sub)
      .maybeSingle();

    return {
      id: sub,
      email: typeof email === "string" ? email : null,
      alias: profile?.alias ?? null,
    };
  } catch {
    // Faltan las variables de Supabase o no responde: la app se ve como sin sesión
    return null;
  }
});
