export type ActivityColor = "cyan" | "pink" | "yellow" | "green";

export interface RecentScore {
  player: string;
  gameId: string; // id de GAMES; el título se obtiene con getGame(gameId)
  score: number;
  timeAgo: string;
  color: ActivityColor; // color del nombre del jugador
}

export interface TopPlayer {
  rank: number; // 1..5
  player: string;
  score: number;
}

// Datos fijos de la sección «Actividad en vivo» del home (referencia: home.jsx líneas 197-204 y 222-228).
// Los juegos inventados de la referencia se mapearon a su equivalente del catálogo real:
// Caída → tetris, Glotón → pacman, Invasores → invaders, Rocas → asteroids,
// Bloque Buster → arkanoid, Serpentina → snake, Ranaria → frogger.
export const RECENT_SCORES: RecentScore[] = [
  { player: "NEONFOX", gameId: "tetris", score: 184220, timeAgo: "hace 2 min", color: "pink" },
  { player: "PX_KAI", gameId: "pacman", score: 96400, timeAgo: "hace 5 min", color: "yellow" },
  { player: "Z3R0COOL", gameId: "invaders", score: 54190, timeAgo: "hace 8 min", color: "green" },
  { player: "VAULT_07", gameId: "asteroids", score: 41200, timeAgo: "hace 12 min", color: "cyan" },
  { player: "GLITCHA", gameId: "arkanoid", score: 28450, timeAgo: "hace 18 min", color: "cyan" },
  { player: "ARKADYA", gameId: "snake", score: 7820, timeAgo: "hace 24 min", color: "green" },
  { player: "CYBER_LU", gameId: "frogger", score: 18900, timeAgo: "hace 31 min", color: "yellow" },
];

export const TOP_PLAYERS_TODAY: TopPlayer[] = [
  { rank: 1, player: "NEONFOX", score: 312840 },
  { rank: 2, player: "PX_KAI", score: 248110 },
  { rank: 3, player: "M00NRYU", score: 196720 },
  { rank: 4, player: "VAULT_07", score: 154300 },
  { rank: 5, player: "GLITCHA", score: 138900 },
];
