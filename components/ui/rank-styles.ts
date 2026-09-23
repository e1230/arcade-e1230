export interface RankStyle {
  color: string;
  glow: string;
  bg: string;
  edge: string;
}

// Oro, plata y bronce para los tres primeros puestos (valores de RANK en la referencia)
export const RANK_STYLES: RankStyle[] = [
  {
    color: "#ffd23f",
    glow: "0 0 8px #ffd23f,0 0 18px rgba(255,210,63,.6)",
    bg: "rgba(255,210,63,.08)",
    edge: "#ffd23f",
  },
  {
    color: "#d6e2ee",
    glow: "0 0 8px #d6e2ee,0 0 16px rgba(214,226,238,.5)",
    bg: "rgba(214,226,238,.06)",
    edge: "#d6e2ee",
  },
  {
    color: "#ff8c42",
    glow: "0 0 8px #ff8c42,0 0 16px rgba(255,140,66,.5)",
    bg: "rgba(255,140,66,.07)",
    edge: "#ff8c42",
  },
];

const DEFAULT_RANK_STYLE: RankStyle = {
  color: "#e6f7ff",
  glow: "none",
  bg: "transparent",
  edge: "transparent",
};

const MINE_BG = "rgba(255,0,110,.12)";
const MINE_EDGE = "#ff006e";

export function getRankStyle(rank: number, isMine: boolean): RankStyle {
  const base = RANK_STYLES[rank - 1] ?? DEFAULT_RANK_STYLE;
  if (!isMine) return base;
  return { ...base, bg: MINE_BG, edge: MINE_EDGE };
}
