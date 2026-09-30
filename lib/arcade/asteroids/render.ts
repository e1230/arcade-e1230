// Funciones de dibujo que sirven a las tres skins de ASTEROIDS: trazo vectorial (Clásico y Neón)
// o píxeles sobre un búfer reducido (Retro). Son puras: reciben el contexto y la skin.

import type { AsteroidsSkin } from "@/lib/arcade/asteroids/skins";

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
export function strokeShape(
  ctx: CanvasRenderingContext2D,
  skin: AsteroidsSkin,
  origin: { x: number; y: number; rotation: number },
  points: readonly (readonly [number, number])[],
  color: string,
  closed: boolean,
): void {
  if (points.length === 0) return;

  if (skin.pixelScale <= 1) {
    ctx.save();
    ctx.translate(origin.x, origin.y);
    ctx.rotate(origin.rotation);
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
  const cos = Math.cos(origin.rotation);
  const sin = Math.sin(origin.rotation);
  const grid = points.map(([px, py]) => [
    Math.floor((origin.x + px * cos - py * sin) / skin.pixelScale),
    Math.floor((origin.y + px * sin + py * cos) / skin.pixelScale),
  ]);
  for (let i = 1; i < grid.length; i++)
    plotLine(
      ctx,
      grid[i - 1][0],
      grid[i - 1][1],
      grid[i][0],
      grid[i][1],
      color,
    );
  if (closed && grid.length > 2) {
    const last = grid[grid.length - 1];
    plotLine(ctx, last[0], last[1], grid[0][0], grid[0][1], color);
  }
}

// "#ff006e", 0.5 → "rgba(255, 0, 110, 0.50)"
export function hexToRgba(hex: string, alpha: number): string {
  const value = parseInt(hex.slice(1), 16);
  const r = (value >> 16) & 255;
  const g = (value >> 8) & 255;
  const b = value & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha.toFixed(2)})`;
}
