import { createServerClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { readSupabaseEnv } from "./env";

// Cliente de Supabase para Server Components, Server Actions y Route Handlers.
// Se crea uno nuevo por petición: nunca se comparte entre peticiones.
export async function createClient(): Promise<SupabaseClient> {
  const env = readSupabaseEnv();
  if (!env) {
    throw new Error(
      "Faltan variables de entorno de Supabase: define NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY en .env",
    );
  }

  const cookieStore = await cookies();

  return createServerClient(env.url, env.publishableKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options),
          );
        } catch {
          // Desde un Server Component no se pueden escribir cookies:
          // el refresco real de la sesión lo hace el proxy (proxy.ts).
        }
      },
    },
  });
}
