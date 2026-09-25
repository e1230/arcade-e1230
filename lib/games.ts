import type { Database } from "./supabase/database.types";

export type Accent = "cyan" | "pink" | "yellow";

// Hex y tinte translúcido de cada acento (valores de la función tint() de la referencia)
export const ACCENTS: Record<Accent, { hex: string; tint: string }> = {
  cyan: { hex: "#00f5ff", tint: "rgba(0,245,255,.14)" },
  pink: { hex: "#ff006e", tint: "rgba(255,0,110,.16)" },
  yellow: { hex: "#f5ff00", tint: "rgba(245,255,0,.12)" },
};

export type GameCategory = "Clásicos" | "Disparos" | "Puzles" | "Laberinto";

export interface Game {
  id: string;
  title: string;
  category: GameCategory;
  accent: Accent;
  shortDescription: string;
  longDescription: string;
}

export const GAMES: Game[] = [
  {
    id: "arkanoid",
    title: "ARKANOID",
    category: "Clásicos",
    accent: "cyan",
    shortDescription: "Rompe todos los ladrillos con tu nave y la bola.",
    longDescription:
      "Controla la nave Vaus y devuelve la bola de energía para destruir cada muro de ladrillos. Atrapa las cápsulas que caen para ensanchar la nave, disparar láseres o multiplicar las bolas. Cada fase es más rápida que la anterior.",
  },
  {
    id: "tetris",
    title: "TETRIS",
    category: "Puzles",
    accent: "yellow",
    shortDescription: "Encaja las piezas y limpia líneas sin parar.",
    longDescription:
      "Gira y coloca las piezas que caen para completar líneas horizontales. Cada línea eliminada suma puntos y acelera la caída. La partida termina cuando las piezas alcanzan el techo.",
  },
  {
    id: "snake",
    title: "SNAKE",
    category: "Clásicos",
    accent: "pink",
    shortDescription: "Come, crece y no te muerdas la cola.",
    longDescription:
      "Guía a la serpiente por la pantalla y come los píxeles para crecer. Cada cinco bocados subes de nivel y la serpiente va más rápido. Chocar con las paredes o contigo mismo te cuesta una vida.",
  },
  {
    id: "pacman",
    title: "PAC-MAN",
    category: "Laberinto",
    accent: "yellow",
    shortDescription: "Recorre el laberinto y esquiva a los fantasmas.",
    longDescription:
      "Come todos los puntos del laberinto mientras cuatro fantasmas te persiguen. Las píldoras de poder te permiten darles la vuelta y comértelos durante unos segundos. Las frutas dan puntos extra.",
  },
  {
    id: "invaders",
    title: "SPACE INVADERS",
    category: "Disparos",
    accent: "cyan",
    shortDescription: "Detén la invasión alienígena fila a fila.",
    longDescription:
      "Oleadas de alienígenas descienden hacia la Tierra. Muévete tras los escudos y dispara antes de que lleguen al suelo. Cuantos menos quedan, más rápido avanzan.",
  },
  {
    id: "asteroids",
    title: "ASTEROIDS",
    category: "Disparos",
    accent: "pink",
    shortDescription: "Pulveriza rocas espaciales en gravedad cero.",
    longDescription:
      "Pilota una nave en un campo de asteroides y dispárales para partirlos en fragmentos cada vez más pequeños. Usa el hiperespacio para escapar en el último segundo y vigila los platillos enemigos.",
  },
  {
    id: "frogger",
    title: "FROGGER",
    category: "Clásicos",
    accent: "yellow",
    shortDescription: "Cruza la carretera y el río sin perder ancas.",
    longDescription:
      "Lleva a cada rana hasta su refugio al otro lado de la pantalla. Primero esquiva el tráfico de la autopista y luego salta entre troncos y tortugas en el río. El tiempo corre en tu contra.",
  },
  {
    id: "galaga",
    title: "GALAGA",
    category: "Disparos",
    accent: "cyan",
    shortDescription: "Combate escuadrones que atacan en picado.",
    longDescription:
      "Formaciones de insectos espaciales se lanzan en picado contra tu caza. Deja que un jefe capture tu nave y rescátala para disparar con doble potencia. Las fases de desafío premian la precisión.",
  },
];

export const CATEGORY_FILTERS = [
  "Todos",
  "Clásicos",
  "Disparos",
  "Puzles",
  "Laberinto",
] as const;
export type CategoryFilter = (typeof CATEGORY_FILTERS)[number];

export function getGame(id: string): Game | undefined {
  return GAMES.find((game) => game.id === id);
}

// Mapea snake_case → camelCase. category y accent se convierten a sus uniones:
// los CHECK de la tabla garantizan que el valor es válido.
export function toGame(
  row: Database["public"]["Tables"]["games"]["Row"],
): Game {
  return {
    id: row.id,
    title: row.title,
    category: row.category as GameCategory,
    accent: row.accent as Accent,
    shortDescription: row.short_description,
    longDescription: row.long_description,
  };
}
