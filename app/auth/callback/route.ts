import { type NextRequest, NextResponse } from "next/server";
import { safeNextPath } from "@/lib/safe-next";
import { createClient } from "@/lib/supabase/server";

// Vuelta del OAuth de Google y GitHub, y del enlace del correo de recuperación:
// canjea el código PKCE por la sesión. El verificador lo dejó en una cookie
// signInWithOAuth (navegador) o requestPasswordReset (Server Action).
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const code = searchParams.get("code");
  const next = safeNextPath(searchParams.get("next"));
  const isRecovery = searchParams.get("type") === "recovery";

  let destination = isRecovery ? "/login?error=link" : "/login?error=oauth";
  if (code) {
    try {
      const supabase = await createClient();
      const { data, error } = await supabase.auth.exchangeCodeForSession(code);
      if (!error) {
        if (isRecovery) {
          // Recuperación: directo a elegir la contraseña nueva, sin revisar el perfil
          destination = next;
        } else {
          const { data: profile } = await supabase
            .from("profiles")
            .select("id")
            .eq("id", data.user.id)
            .maybeSingle();
          // Primer login OAuth: todavía no hay alias, se pide en /onboarding
          destination = profile
            ? next
            : `/onboarding?next=${encodeURIComponent(next)}`;
        }
      }
    } catch {
      // Faltan las variables de Supabase: se queda en el /login?error=… inicial
    }
  }

  // Las cookies de sesión escritas con cookies() viajan en esta respuesta
  return NextResponse.redirect(new URL(destination, request.url));
}
