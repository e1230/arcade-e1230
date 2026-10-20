// Devuelve el origen fijo del sitio (sin ruta ni barra final), o null si falta o no es una URL http(s).
// Se lee con el nombre literal porque Next solo reemplaza en el bundle del cliente
// los accesos literales a process.env.NEXT_PUBLIC_*.
export function readSiteUrl(): string | null {
  const value = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (!value) {
    return null;
  }
  try {
    const url = new URL(value);
    if (url.protocol !== "http:" && url.protocol !== "https:") {
      return null;
    }
    return url.origin;
  } catch {
    return null;
  }
}
