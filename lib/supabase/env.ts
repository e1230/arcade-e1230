export interface SupabaseEnv {
  url: string;
  publishableKey: string;
}

// Devuelve null si falta alguna de las dos variables (o está vacía después de trim).
// Se leen con el nombre literal porque Next solo reemplaza en el bundle del cliente
// los accesos literales a process.env.NEXT_PUBLIC_*.
export function readSupabaseEnv(): SupabaseEnv | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const publishableKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim();
  if (!url || !publishableKey) {
    return null;
  }
  return { url, publishableKey };
}
