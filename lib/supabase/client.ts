import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";
import { readSupabaseEnv } from "./env";

// Cliente de Supabase para Client Components. La sesión vive en cookies,
// así el servidor y el proxy pueden leerla.
export function createClient(): SupabaseClient<Database> {
  const env = readSupabaseEnv();
  if (!env) {
    throw new Error(
      "Faltan variables de entorno de Supabase: define NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY en .env",
    );
  }
  return createBrowserClient(env.url, env.publishableKey);
}
