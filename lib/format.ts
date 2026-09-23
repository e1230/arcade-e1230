// Formato de puntuaciones con separador de miles en español mexicano
const scoreFormatter = new Intl.NumberFormat("es-MX");

export function formatScore(n: number): string {
  return scoreFormatter.format(n);
}

export function pad2(n: number): string {
  return n.toString().padStart(2, "0");
}

export function formatToday(): string {
  const now = new Date();
  const day = pad2(now.getDate());
  const month = pad2(now.getMonth() + 1);
  const year = now.getFullYear();
  return `${day}/${month}/${year}`;
}

// Normaliza para búsquedas: minúsculas y sin acentos (descompone con NFD y quita los diacríticos)
export function normalizeText(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");
}
