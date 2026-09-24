import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";
import { readSupabaseEnv } from "./env";

// Refresca la sesión de Supabase en cada petición y reescribe sus cookies.
// Nunca redirige: las guardas de rutas llegan con el spec de autenticación.
export async function updateSession(
  request: NextRequest,
): Promise<NextResponse> {
  const env = readSupabaseEnv();
  if (!env) {
    // Modo degradado: sin variables de Supabase la app funciona igual que antes
    return NextResponse.next({ request });
  }

  let response = NextResponse.next({ request });

  const supabase = createServerClient(env.url, env.publishableKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet, headers) {
        // Las cookies nuevas van a la petición (para lo que se renderice después)
        // y a la respuesta (para el navegador)
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value),
        );
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options),
        );
        // Cabeceras anti-caché que manda la librería cuando escribe cookies de sesión
        Object.entries(headers).forEach(([key, value]) =>
          response.headers.set(key, value),
        );
      },
    },
  });

  // No meter código entre createServerClient y getClaims: getClaims valida el JWT
  // y refresca la sesión si expiró. Sin cookie de sesión no hace ninguna petición de red.
  await supabase.auth.getClaims();

  return response;
}
