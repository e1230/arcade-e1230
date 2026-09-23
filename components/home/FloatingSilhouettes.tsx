import type { CSSProperties } from "react";

// Posiciones, tamaños y colores de cada silueta (referencia: styles.css líneas 976-986)
interface SiloSpec {
  className: string;
  color: string;
  delay: string;
}

const SILOS: SiloSpec[] = [
  { className: "top-[14%] left-[8%] w-20", color: "var(--neon-cyan)", delay: "0s" },
  { className: "top-[22%] right-[10%] w-18", color: "var(--neon-pink)", delay: "-1.5s" },
  { className: "bottom-[18%] left-[12%] w-22", color: "var(--neon-yellow)", delay: "-3s" },
  { className: "bottom-[22%] right-[14%] w-15", color: "var(--neon-green)", delay: "-4.5s" },
  { className: "top-[38%] left-[4%] w-[70px]", color: "#aa00ff", delay: "-2s" },
  { className: "top-[8%] left-[46%] w-11", color: "var(--gold)", delay: "-3.5s" },
  { className: "bottom-[12%] left-[42%] w-13", color: "#ff3060", delay: "-1s" },
  { className: "top-1/2 right-[4%] w-15", color: "#00d4ff", delay: "-5s" },
];

// Siluetas pixel decorativas de formas clásicas de arcade (referencia: home.jsx líneas 15-84)
export function FloatingSilhouettes() {
  return (
    <div className="pointer-events-none absolute inset-0 z-1 opacity-55" aria-hidden="true">
      {SILOS.map((silo, i) => {
        const style = { color: silo.color, animationDelay: silo.delay } as CSSProperties;
        return (
          <svg
            key={i}
            className={`motion-safe:animate-float absolute [filter:drop-shadow(0_0_10px_currentColor)] [image-rendering:pixelated] ${silo.className}`}
            style={style}
            viewBox={SILO_VIEWBOX[i]}
          >
            {SILO_SHAPES[i]}
          </svg>
        );
      })}
    </div>
  );
}

const SILO_VIEWBOX = [
  "0 0 40 32",
  "0 0 32 32",
  "0 0 32 32",
  "0 0 24 24",
  "0 0 36 24",
  "0 0 20 20",
  "0 0 24 22",
  "0 0 24 24",
];

const SILO_SHAPES = [
  // s1: nave invasores
  <g key="s1" fill="currentColor">
    <rect x="6" y="4" width="4" height="4" />
    <rect x="30" y="4" width="4" height="4" />
    <rect x="2" y="8" width="36" height="4" />
    <rect x="2" y="12" width="4" height="4" />
    <rect x="14" y="12" width="4" height="4" />
    <rect x="22" y="12" width="4" height="4" />
    <rect x="34" y="12" width="4" height="4" />
    <rect x="2" y="16" width="36" height="4" />
    <rect x="6" y="20" width="4" height="4" />
    <rect x="30" y="20" width="4" height="4" />
  </g>,
  // s2: pala arkanoid
  <g key="s2" fill="currentColor">
    <rect x="8" y="0" width="16" height="4" />
    <rect x="4" y="4" width="24" height="4" />
    <rect x="0" y="8" width="32" height="12" />
    <rect x="0" y="20" width="6" height="6" />
    <rect x="10" y="20" width="4" height="6" />
    <rect x="18" y="20" width="4" height="6" />
    <rect x="26" y="20" width="6" height="6" />
  </g>,
  // s3: fantasma pac-man
  <g key="s3" fill="currentColor">
    <rect x="10" y="0" width="12" height="4" />
    <rect x="6" y="4" width="20" height="4" />
    <rect x="4" y="8" width="6" height="6" />
    <rect x="22" y="8" width="6" height="6" />
    <rect x="2" y="14" width="28" height="10" />
    <rect x="6" y="24" width="4" height="4" />
    <rect x="14" y="24" width="4" height="4" />
    <rect x="22" y="24" width="4" height="4" />
  </g>,
  // s4: cruz tetris
  <g key="s4" fill="currentColor">
    <rect x="10" y="0" width="4" height="24" />
    <rect x="0" y="10" width="24" height="4" />
    <rect x="6" y="6" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" />
  </g>,
  // s5: ovni
  <g key="s5" fill="currentColor">
    <rect x="14" y="2" width="8" height="4" />
    <rect x="10" y="6" width="16" height="4" />
    <rect x="4" y="10" width="28" height="4" />
    <rect x="0" y="14" width="36" height="4" />
    <rect x="6" y="18" width="4" height="2" />
    <rect x="16" y="18" width="4" height="2" />
    <rect x="26" y="18" width="4" height="2" />
  </g>,
  // s6: moneda
  <g key="s6" fill="currentColor">
    <rect x="6" y="0" width="8" height="2" />
    <rect x="2" y="2" width="16" height="2" />
    <rect x="0" y="4" width="20" height="12" />
    <rect x="2" y="16" width="16" height="2" />
    <rect x="6" y="18" width="8" height="2" />
    <rect x="8" y="4" width="4" height="12" fill="#0a0a0f" />
  </g>,
  // s7: corazón pixel
  <g key="s7" fill="currentColor">
    <rect x="2" y="2" width="6" height="2" />
    <rect x="16" y="2" width="6" height="2" />
    <rect x="0" y="4" width="10" height="4" />
    <rect x="14" y="4" width="10" height="4" />
    <rect x="0" y="8" width="24" height="4" />
    <rect x="2" y="12" width="20" height="2" />
    <rect x="4" y="14" width="16" height="2" />
    <rect x="6" y="16" width="12" height="2" />
    <rect x="8" y="18" width="8" height="2" />
    <rect x="10" y="20" width="4" height="2" />
  </g>,
  // s8: d-pad
  <g key="s8" fill="currentColor">
    <rect x="8" y="2" width="8" height="6" />
    <rect x="2" y="8" width="20" height="8" />
    <rect x="8" y="16" width="8" height="6" />
    <rect x="11" y="6" width="2" height="2" fill="#0a0a0f" />
    <rect x="11" y="16" width="2" height="2" fill="#0a0a0f" />
    <rect x="4" y="11" width="2" height="2" fill="#0a0a0f" />
    <rect x="18" y="11" width="2" height="2" fill="#0a0a0f" />
  </g>,
];
