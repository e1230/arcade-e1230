// Skins de ASTEROIDS: cada una define todos los colores y trazos que usa el motor al dibujar.

import type { SkinId } from "@/lib/arcade/engine";
import { RETRO_PHOSPHOR } from "@/lib/arcade/shared/skins";

export interface AsteroidsSkin {
  background: string; // fondo del canvas
  ship: string; // trazo de la nave
  asteroid: string; // trazo de los asteroides
  bullet: string; // relleno de las balas
  powerUp: string; // contorno del power-up y textos «3x»
  flame: string; // llama del propulsor
  flameAlpha: number; // opacidad de la llama (0 a 1)
  particle: string; // partículas de explosión; el alfa se desvanece con su vida
  lineWidth: number; // grosor de nave, asteroides y power-up, en px internos (800×600)
  particleWidth: number; // grosor de las partículas
  glow: number; // shadowBlur en px; 0 = sin glow (solo Neón lo usa)
  pixelScale: number; // 1 = dibujo vectorial; >1 = pixel art en un búfer reducido
}

export const SKINS: Record<SkinId, AsteroidsSkin> = {
  classic: {
    background: "#000000", // game.js: `#000`
    ship: "#ffffff", // game.js: `#fff`
    asteroid: "#ffffff",
    bullet: "#ffffff",
    powerUp: "#00ffff", // game.js: `#0ff`
    flame: "#ff8200", // game.js: rgba(255, 130, 0, 0.85)
    flameAlpha: 0.85,
    particle: "#ffffff",
    lineWidth: 2,
    particleWidth: 2,
    glow: 0,
    pixelScale: 1,
  },
  neon: {
    background: "#05050a", // --deep
    ship: "#00f5ff", // --neon-cyan
    asteroid: "#ff006e", // --neon-pink
    bullet: "#f5ff00", // --neon-yellow
    powerUp: "#00ff88", // --neon-green
    flame: "#ff8c42", // --bronze
    flameAlpha: 1,
    particle: "#ff006e", // --neon-pink (antes "255, 0, 110")
    lineWidth: 2,
    particleWidth: 2,
    glow: 8,
    pixelScale: 1,
  },
  retro: {
    background: RETRO_PHOSPHOR.background,
    ship: RETRO_PHOSPHOR.peak,
    asteroid: RETRO_PHOSPHOR.mid,
    bullet: RETRO_PHOSPHOR.peak,
    powerUp: RETRO_PHOSPHOR.bright,
    flame: RETRO_PHOSPHOR.dim,
    flameAlpha: 1,
    particle: RETRO_PHOSPHOR.mid,
    lineWidth: 4, // en píxeles, cada trazo mide 1 píxel lógico (= pixelScale)
    particleWidth: 4,
    glow: 0,
    pixelScale: 4,
  },
};
