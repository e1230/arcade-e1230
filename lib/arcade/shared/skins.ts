// Utilidades y paletas comunes del sistema de skins de los motores.

import type { SkinId } from "@/lib/arcade/engine";

export const SKIN_IDS = [
  "classic",
  "neon",
  "retro",
] as const satisfies readonly SkinId[];

export const DEFAULT_SKIN: SkinId = "classic";

export const SKIN_LABELS: Record<SkinId, string> = {
  classic: "CLÁSICO",
  neon: "NEÓN",
  retro: "RETRO",
};

export function isSkinId(value: unknown): value is SkinId {
  return (
    typeof value === "string" && (SKIN_IDS as readonly string[]).includes(value)
  );
}

// Fósforo verde de monitor CRT: un fondo casi negro y cuatro tonos de menor a mayor luminancia.
export const RETRO_PHOSPHOR = {
  background: "#010a03",
  dim: "#1a7a35",
  mid: "#2fc458",
  bright: "#4dff7c",
  peak: "#d2ffdc",
} as const;

// Paleta limitada de 8 bits: un fondo oscuro y ocho colores saturados del PICO-8 de Lexaloffle.
export const RETRO_8BIT = {
  background: "#0b0b17",
  white: "#fff1e8",
  red: "#ff004d",
  orange: "#ffa300",
  yellow: "#ffec27",
  green: "#00e436",
  blue: "#29adff",
  pink: "#ff77a8",
  lavender: "#83769c",
} as const;
