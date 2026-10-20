import { readSiteUrl } from "@/lib/site-url";

// Opciones que se suman a las de @supabase/ssr en los tres clientes de Supabase.
// Los demás atributos (sameSite, httpOnly, path, maxAge) los sigue poniendo la librería.
// Con la URL del sitio en https la cookie es Secure y con http no (así `next start` sobre
// http://localhost no rompe el login en Safari). Sin URL válida queda Secure en producción:
// un despliegue que olvide la variable falla del lado seguro.
export function sessionCookieOptions(): { secure: boolean } {
  const siteUrl = readSiteUrl();
  if (siteUrl) {
    return { secure: siteUrl.startsWith("https://") };
  }
  return { secure: process.env.NODE_ENV === "production" };
}
