import { connection } from "next/server";
import { readSupabaseEnv } from "@/lib/supabase/env";

type HealthResponse =
  | { status: "ok"; supabase: "ok" }
  | { status: "error"; supabase: "config" | "unreachable" };

const TIMEOUT_MS = 5000;

function respond(body: HealthResponse): Response {
  return Response.json(body, {
    status: body.status === "ok" ? 200 : 503,
    headers: { "Cache-Control": "no-store" },
  });
}

// Sonda de salud: comprueba desde el servidor que la URL alcanza el proyecto de Supabase
// y que la clave publicable es aceptada. No expone la URL, la clave ni detalles del error.
export async function GET(): Promise<Response> {
  // Obliga a calcular la respuesta en cada petición (nunca se prerenderiza en el build)
  await connection();

  const env = readSupabaseEnv();
  if (!env) {
    console.error(
      "Sonda de Supabase: config (faltan variables de entorno de Supabase)",
    );
    return respond({ status: "error", supabase: "config" });
  }

  try {
    const res = await fetch(`${env.url}/auth/v1/health`, {
      headers: { apikey: env.publishableKey },
      cache: "no-store",
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    if (!res.ok) {
      console.error(`Sonda de Supabase: unreachable (HTTP ${res.status})`);
      return respond({ status: "error", supabase: "unreachable" });
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`Sonda de Supabase: unreachable (${message})`);
    return respond({ status: "error", supabase: "unreachable" });
  }

  return respond({ status: "ok", supabase: "ok" });
}
