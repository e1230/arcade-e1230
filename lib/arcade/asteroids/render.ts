// Funciones de dibujo que sirven a las tres skins de ASTEROIDS: trazo vectorial (Clásico y Neón)
// o píxeles sobre un búfer reducido (Retro). Son puras: reciben el contexto y la skin.

import type { AsteroidsSkin } from "@/lib/arcade/asteroids/skins";

// Pasos de alfa de las partículas: `hexToRgba` redondea el alfa a dos decimales, así que solo hay 101 colores posibles
export const ALPHA_STEPS = 100;

export interface RenderCache {
  // "rgba(r, g, b, a)" para a = 0, 0.01 … 1, con el color de partícula de la skin
  particleStyles: readonly string[];
  // Bala con glow ya horneado (solo Neón); null en Clásico y Retro
  bulletSprite: HTMLCanvasElement | null;
  // Mitad del lado del sprite de la bala, en px: el centro del círculo cae en (bulletHalf, bulletHalf)
  bulletHalf: number;
}

// Se construye una vez en `create`: la skin no cambia durante la partida
export function createRenderCache(skin: AsteroidsSkin): RenderCache {
  const particleStyles: string[] = [];
  for (let i = 0; i <= ALPHA_STEPS; i++)
    particleStyles.push(hexToRgba(skin.particle, i / ALPHA_STEPS));
  return { particleStyles, bulletSprite: null, bulletHalf: 0 };
}

export function applyGlow(
  ctx: CanvasRenderingContext2D,
  skin: AsteroidsSkin,
  color: string,
): void {
  if (skin.glow === 0) return;
  ctx.shadowBlur = skin.glow;
  ctx.shadowColor = color;
}

export function clearGlow(ctx: CanvasRenderingContext2D): void {
  ctx.shadowBlur = 0;
}

// Bresenham sobre la grilla lógica: un fillRect de 1×1 por píxel, sin antialiasing,
// así que solo aparecen colores de la paleta.
export function plotLine(
  ctx: CanvasRenderingContext2D,
  x0: number,
  y0: number,
  x1: number,
  y1: number,
  color: string,
): void {
  ctx.fillStyle = color;
  const dx = Math.abs(x1 - x0);
  const dy = -Math.abs(y1 - y0);
  const sx = x0 < x1 ? 1 : -1;
  const sy = y0 < y1 ? 1 : -1;
  let err = dx + dy;
  let x = x0;
  let y = y0;
  for (;;) {
    ctx.fillRect(x, y, 1, 1);
    if (x === x1 && y === y1) break;
    const e2 = 2 * err;
    if (e2 >= dy) {
      err += dy;
      x += sx;
    }
    if (e2 <= dx) {
      err += dx;
      y += sy;
    }
  }
}

// Cuadrado de `size` × `size` píxeles lógicos con la esquina superior izquierda en (x, y).
export function fillPixels(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  color: string,
): void {
  ctx.fillStyle = color;
  ctx.fillRect(x, y, size, size);
}

// Dibuja un contorno en coordenadas locales (origen + rotación). Vectorial (pixelScale 1):
// translate, rotate y stroke. Pixel art (pixelScale > 1): rota los puntos a mano y los traza con plotLine.
// Arreglos de trabajo de la grilla lógica de Retro: se reescriben en cada trazo y se leen en el mismo
const gridX: number[] = [];
const gridY: number[] = [];

export function strokeShape(
  ctx: CanvasRenderingContext2D,
  skin: AsteroidsSkin,
  x: number,
  y: number,
  rotation: number,
  points: readonly (readonly [number, number])[],
  color: string,
  closed: boolean,
): void {
  if (points.length === 0) return;

  if (skin.pixelScale <= 1) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rotation);
    ctx.strokeStyle = color;
    ctx.lineWidth = skin.lineWidth;
    ctx.lineJoin = "round";
    ctx.beginPath();
    ctx.moveTo(points[0][0], points[0][1]);
    for (let i = 1; i < points.length; i++)
      ctx.lineTo(points[i][0], points[i][1]);
    if (closed) ctx.closePath();
    ctx.stroke();
    ctx.restore();
    return;
  }

  // Toda coordenada del mundo (800×600) pasa a la grilla lógica con floor, para alinear a enteros.
  const cos = Math.cos(rotation);
  const sin = Math.sin(rotation);
  const n = points.length;
  for (let i = 0; i < n; i++) {
    const p = points[i];
    gridX[i] = Math.floor((x + p[0] * cos - p[1] * sin) / skin.pixelScale);
    gridY[i] = Math.floor((y + p[0] * sin + p[1] * cos) / skin.pixelScale);
  }
  for (let i = 1; i < n; i++)
    plotLine(ctx, gridX[i - 1], gridY[i - 1], gridX[i], gridY[i], color);
  if (closed && n > 2)
    plotLine(ctx, gridX[n - 1], gridY[n - 1], gridX[0], gridY[0], color);
}

// "#ff006e", 0.5 → "rgba(255, 0, 110, 0.50)"
export function hexToRgba(hex: string, alpha: number): string {
  const value = parseInt(hex.slice(1), 16);
  const r = (value >> 16) & 255;
  const g = (value >> 8) & 255;
  const b = value & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha.toFixed(2)})`;
}
