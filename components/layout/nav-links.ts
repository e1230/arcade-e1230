export interface NavLink {
  href: string;
  label: string;
}

// Links compartidos por el navbar de escritorio y el menú móvil
export const NAV_LINKS: NavLink[] = [
  { href: "/", label: "Inicio" },
  { href: "/games", label: "Biblioteca" },
  { href: "/hall-of-fame", label: "Salón de la Fama" },
];

// Devuelve el href del link activo, o null si la ruta no corresponde a ninguno (login, 404)
export function getActiveHref(pathname: string): string | null {
  if (pathname === "/") return "/";
  if (pathname === "/games" || pathname.startsWith("/games/")) return "/games";
  if (pathname === "/hall-of-fame") return "/hall-of-fame";
  return null;
}
