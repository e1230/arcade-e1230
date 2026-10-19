const DEFAULT_NEXT = "/";

// Devuelve value si es una ruta interna ("/games/tetris"); si no, "/".
// Rechaza null, rutas sin "/" inicial, "//…" y "/\…" (redirecciones abiertas a otro dominio).
export function safeNextPath(
  value: string | string[] | null | undefined,
): string {
  const path = Array.isArray(value) ? value[0] : value;
  if (!path || !path.startsWith("/")) return DEFAULT_NEXT;
  if (path.startsWith("//") || path.startsWith("/\\")) return DEFAULT_NEXT;
  // Caracteres de control (tabs, saltos de línea) que el navegador descarta al resolver la URL
  if (/[\u0000-\u001f\u007f]/.test(path)) return DEFAULT_NEXT;
  return path;
}
