# SPEC 06 — Catálogo de juegos y ranking global en Supabase

> **Estado:** Implementado
> **Depende de:** SPEC 01, SPEC 04, SPEC 05
> **Fecha:** 2026-09-24
> **Objetivo:** Crear en Supabase las tablas `games` y `scores` y que el catálogo y los rankings de la app se lean y guarden ahí, en lugar de en `lib/games.ts`, los mocks de `lib/scores.ts` y `localStorage`.

## Por qué existe este spec

Hoy el catálogo es un arreglo fijo (`GAMES` en `lib/games.ts`) y los rankings mezclan diez puntuaciones inventadas por juego (`getMockScores`) con las que cada navegador guarda en `e1230_scores`. Nadie ve las puntuaciones de otra persona, y desde el SPEC 05 ASTEROIDS produce puntuaciones reales que nadie más ve.

El SPEC 04 dejó los clientes de Supabase listos y el esquema `public` sigue vacío. Este spec crea las dos primeras tablas: `games`, con el catálogo, y `scores`, con una fila por puntuación guardada y un ranking por juego. Con eso, el ranking pasa a ser global.

La autenticación sigue simulada. Por eso las puntuaciones se guardan con el nombre de la sesión simulada (o `INVITADO`) mediante un insert anónimo que la base valida con restricciones `CHECK` y políticas RLS. Es posible hacer trampa y se acepta hasta el spec de autenticación real, que vuelve a ser el siguiente número libre.

## Alcance

**Incluye:**

- **Tabla `games`** con todos los campos del catálogo y un `sort_order`, sembrada con los 8 juegos actuales de `lib/games.ts` en el mismo orden. Es de solo lectura para el público.
- **Tabla `scores`** con `game_id → games.id`, `name`, `score` y `created_at`. El público la puede leer e insertar filas (sin `UPDATE` ni `DELETE`). Nombre de 1 a 20 caracteres tras recortar espacios, puntuación entera de 0 a 9.999.999.
- **Vista `leaderboard`**: las 10 mejores entradas de cada juego con su rango. Desempate por la entrada más antigua. Un mismo nombre puede aparecer varias veces.
- **Tipos generados** `lib/supabase/database.types.ts`, usados por los clientes de `lib/supabase/`.
- **Lectura en el servidor:** la Biblioteca, el Detalle, el Reproductor, el Salón de la Fama y «Juegos disponibles» del Home leen el catálogo y los rankings de Supabase desde Server Components.
- **Render dinámico:** `/games/[id]` y `/games/[id]/play` dejan de generarse en el build (se quitan `generateStaticParams` y `dynamicParams`). Un id inexistente sigue mostrando la 404 con `notFound()`.
- **Guardado:** GUARDAR PUNTUACIÓN inserta en `scores` desde el navegador, con estados de guardando, guardado y error con reintento.
- **Mejor puntuación** de cada tarjeta de la Biblioteca: el primer lugar del ranking, o `—` si el juego no tiene puntuaciones.
- **«TU MEJOR MARCA»** del Salón de la Fama: la mejor entrada de `scores` con el nombre de la sesión (si no es invitado), consultada desde el navegador.
- **Ranking vacío:** sin puntuaciones, el Detalle y el Salón de la Fama muestran «SÉ EL PRIMERO EN ENTRAR AL RANKING».
- **Modo degradado:** si faltan las variables de Supabase o la consulta falla, la página muestra un mensaje neón («SEÑAL PERDIDA» o «RANKING NO DISPONIBLE»). No hay respaldo local.
- **Limpieza:** se eliminan `GAMES`, `getGame`, los mocks de `lib/scores.ts`, `lib/local-scores.ts`, la clave `scores` de `STORAGE_KEYS` y `formatToday`. `e1230_scores` se abandona sin migrar.
- **Home:** «Juegos disponibles» lee los 6 primeros juegos de Supabase. «Actividad en vivo» y las estadísticas siguen con datos fijos, y `lib/activity.ts` guarda el título del juego en lugar de buscarlo con `getGame`.
- **Documentación:** actualizar `CLAUDE.md` (proyecto, rutas, estructura, persistencia y notas del stack).

**Fuera de alcance (para futuros specs):**

- Autenticación real con Supabase Auth, y puntuaciones ligadas a `auth.users`.
- Validación antitrampas: topes por juego, firma de partidas, límite de envíos por IP o captcha.
- «Actividad en vivo», «Top del día» y la franja de estadísticas del Home con datos reales.
- Migrar las puntuaciones que ya están en `e1230_scores`.
- Paginación del ranking o más de 10 entradas por juego.
- Ranking con la mejor marca de cada jugador (un nombre por fila).
- Panel de administración, o crear y editar juegos desde la app.
- Portadas o imágenes de juegos en la base de datos.
- Tiempo real (Supabase Realtime) en los rankings.
- Cambiar la sesión simulada (`lib/session.ts`, `e1230_user`) o `components/auth/`.
- Tests automatizados.
- Modificar los specs 01 a 05.

## Rutas y archivos

```
app/
  page.tsx                          (sin cambios) GamesRail pasa a ser async
  games/page.tsx                    (cambia) lee juegos y mejores puntuaciones; SignalLost si falla
  games/[id]/page.tsx               (cambia) fetchGame + fetchLeaderboard; sin generateStaticParams
  games/[id]/play/page.tsx          (cambia) fetchGame; sin generateStaticParams
  hall-of-fame/page.tsx             (cambia) lee juegos y todos los rankings
lib/
  supabase/database.types.ts        (nuevo) tipos generados con el MCP de Supabase
  supabase/client.ts                (cambia) SupabaseClient<Database>
  supabase/server.ts                (cambia) SupabaseClient<Database>
  supabase/result.ts                (nuevo) QueryResult<T>
  catalog.ts                        (nuevo, solo servidor) fetchGames, fetchGame
  leaderboard.ts                    (nuevo, solo servidor) fetchLeaderboard, fetchAllLeaderboards, fetchBestScores
  leaderboard-client.ts             (nuevo, navegador) insertScore, fetchPersonalBest
  games.ts                          (cambia) − GAMES, − getGame, + toGame
  scores.ts                         (cambia) solo tipos y toRankedScore; − mocks y buildLeaderboard
  local-scores.ts                   (se elimina)
  storage.ts                        (cambia) − STORAGE_KEYS.scores
  format.ts                         (cambia) − formatToday, + formatScoreDate
  activity.ts                       (cambia) gameId → gameTitle
components/
  ui/SignalLost.tsx                 (nuevo) mensaje neón de error de datos
  library/LibraryView.tsx           (cambia) recibe games y bestScores por props
  library/GameCard.tsx              (cambia) recibe bestScore por props
  game/DetailLeaderboard.tsx        (cambia) recibe rows (o null) por props
  game/PlayerView.tsx               (cambia) guarda con insertScore y maneja saveStatus
  game/GameOverModal.tsx            (cambia) saveStatus en lugar de saved; texto de invitado
  hall-of-fame/HallOfFameView.tsx   (cambia) recibe games y leaderboards por props
  hall-of-fame/GameTabs.tsx         (cambia) recibe games por props
  hall-of-fame/HallOfFameTable.tsx  (cambia) recibe rows por props; mejor marca con fetchPersonalBest
  home/GamesRail.tsx                (cambia) async, lee los 6 primeros juegos
  home/LiveActivity.tsx             (cambia) usa entry.gameTitle
CLAUDE.md                           (cambia)
```

Base de datos (proyecto `xanuntuhanyubcqiudlp`, aplicada con `apply_migration` del MCP de Supabase): migraciones `create_games`, `seed_games`, `create_scores` y `create_leaderboard_view`.

Convenciones:

- `lib/catalog.ts` y `lib/leaderboard.ts` importan `@/lib/supabase/server`, así que solo los usan Server Components. Si un componente cliente los importa, `npm run build` falla (`next/headers`).
- `lib/leaderboard-client.ts` usa `@/lib/supabase/client` y solo lo importan componentes cliente.
- `lib/games.ts` y `lib/scores.ts` no importan clientes de Supabase, solo tipos (`import type`), para que los puedan usar componentes de ambos lados.
- `fetchGame` se envuelve con `cache()` de React para que `generateMetadata` y la página hagan una sola consulta por petición.
- Se mantienen las convenciones del SPEC 01: código en inglés, comentarios en español latinoamericano y módulos sin JSX en kebab-case.

## Modelo de datos

### Tabla `games` — migración `create_games`

```sql
create table public.games (
  id text primary key check (id ~ '^[a-z0-9-]+$'),
  title text not null check (char_length(title) between 1 and 40),
  category text not null check (category in ('Clásicos', 'Disparos', 'Puzles', 'Laberinto')),
  accent text not null check (accent in ('cyan', 'pink', 'yellow')),
  short_description text not null,
  long_description text not null,
  sort_order smallint not null unique,
  created_at timestamptz not null default now()
);

alter table public.games enable row level security;

create policy "games are readable by everyone"
  on public.games for select
  to anon, authenticated
  using (true);
```

Sin políticas de `insert`, `update` ni `delete`: el catálogo solo cambia con migraciones.

### Semilla — migración `seed_games`

Inserta los 8 juegos de `lib/games.ts` con sus textos exactos, con `sort_order` del 1 al 8 en el orden actual del arreglo: `arkanoid`, `tetris`, `snake`, `pacman`, `invaders`, `asteroids`, `frogger`, `galaga`.

### Tabla `scores` — migración `create_scores`

```sql
create table public.scores (
  id bigint generated always as identity primary key,
  game_id text not null references public.games (id) on delete cascade,
  name text not null check (name = btrim(name) and char_length(name) between 1 and 20),
  score integer not null check (score between 0 and 9999999),
  created_at timestamptz not null default now()
);

create index scores_game_ranking_idx
  on public.scores (game_id, score desc, created_at asc);

create index scores_game_name_idx
  on public.scores (game_id, name);

alter table public.scores enable row level security;

create policy "scores are readable by everyone"
  on public.scores for select
  to anon, authenticated
  using (true);

create policy "anyone can submit a score"
  on public.scores for insert
  to anon, authenticated
  with check (
    name = btrim(name)
    and char_length(name) between 1 and 20
    and score between 0 and 9999999
  );

-- El cliente solo puede escribir estas tres columnas: id y created_at los pone la base
revoke insert on public.scores from anon, authenticated;
grant insert (game_id, name, score) on public.scores to anon, authenticated;
```

Sin políticas de `update` ni `delete`: una puntuación guardada no se puede modificar desde la app.

### Vista `leaderboard` — migración `create_leaderboard_view`

```sql
create view public.leaderboard
with (security_invoker = true) as
select game_id, name, score, created_at, rank
from (
  select
    game_id,
    name,
    score,
    created_at,
    row_number() over (
      partition by game_id
      order by score desc, created_at asc, id asc
    )::int as rank
  from public.scores
) ranked
where rank <= 10;

grant select on public.leaderboard to anon, authenticated;
```

`security_invoker` hace que la vista respete las RLS de `scores`. `rank` es un `row_number`, así que no hay rangos repetidos: con puntuaciones empatadas, la entrada más antigua queda arriba.

### Tipos de la app

```ts
// lib/supabase/result.ts
export type QueryResult<T> = { ok: true; data: T } | { ok: false };

// lib/games.ts (se conservan Accent, ACCENTS, GameCategory, Game y CATEGORY_FILTERS)
export function toGame(row: Database["public"]["Tables"]["games"]["Row"]): Game;
// Mapea snake_case → camelCase. category y accent se convierten a sus uniones:
// los CHECK de la tabla garantizan que el valor es válido.

// lib/scores.ts
export interface RankedScore {
  rank: number; // 1..10
  name: string;
  score: number;
  date: string; // "dd/mm/aaaa", ya formateada con formatScoreDate
}

export interface LeaderboardRow extends RankedScore {
  isMine: boolean; // se calcula en el cliente con el nombre de la sesión
}

export function toRankedScore(
  row: Database["public"]["Views"]["leaderboard"]["Row"],
): RankedScore;

// lib/catalog.ts (servidor)
export async function fetchGames(): Promise<QueryResult<Game[]>>; // ordenados por sort_order
export const fetchGame: (id: string) => Promise<QueryResult<Game | null>>; // cache(); null si no existe

// lib/leaderboard.ts (servidor)
export async function fetchLeaderboard(
  gameId: string,
): Promise<QueryResult<RankedScore[]>>;
export async function fetchAllLeaderboards(): Promise<
  QueryResult<Record<string, RankedScore[]>>
>;
export async function fetchBestScores(): Promise<
  QueryResult<Record<string, number>>
>; // rank = 1

// lib/leaderboard-client.ts (navegador)
export async function insertScore(entry: {
  gameId: string;
  name: string;
  score: number;
}): Promise<{ ok: boolean }>;
export async function fetchPersonalBest(
  gameId: string,
  name: string,
): Promise<QueryResult<{ score: number; date: string } | null>>;
```

Reglas:

- Todas las funciones de lectura capturan tanto el error de Supabase como la excepción de `createClient()` cuando faltan las variables, y devuelven `{ ok: false }`. Nunca lanzan.
- `insertScore` recorta el nombre y lo corta a 20 caracteres antes de enviarlo. `score` va como entero (`Math.floor`).
- `fetchPersonalBest` busca `name` con coincidencia exacta y ordena por `score desc, created_at asc`, con `limit 1`.

### Fechas — `lib/format.ts`

```ts
// Zona fija para que el servidor y el navegador formateen igual (evita desajustes de hidratación)
const SCORE_TIME_ZONE = "America/Bogota";

export function formatScoreDate(iso: string): string; // "dd/mm/aaaa"
```

### Estado de guardado — `PlayerView` y `GameOverModal`

```ts
type SaveStatus = "idle" | "saving" | "saved" | "error";
```

- `idle`: se ve GUARDAR PUNTUACIÓN.
- `saving`: el botón muestra «GUARDANDO…» y queda deshabilitado, lo que impide un doble insert.
- `saved`: el mensaje tipeado de hoy (`SAVE_MESSAGE`).
- `error`: «NO SE PUDO GUARDAR. INTENTA DE NUEVO.» en rosa, y el botón GUARDAR PUNTUACIÓN vuelve a estar activo.
- El aviso de invitado cambia a «Como invitado, aparecerás como INVITADO en el ranking.».
- JUGAR DE NUEVO vuelve a `idle`, como hoy vuelve `saved` a `false`.

### `SignalLost` — `components/ui/SignalLost.tsx`

```ts
interface SignalLostProps {
  title?: string; // por defecto "SEÑAL PERDIDA"
  message?: string; // por defecto "No pudimos conectar con el servidor. Intenta de nuevo en unos segundos."
}
```

Bloque centrado con `font-pixel`, borde y glow rosa, al estilo del tema. Usos:

| Dónde                                 | Cuándo                                       | Texto                            |
| ------------------------------------- | -------------------------------------------- | -------------------------------- |
| `/games`, en lugar de `LibraryView`   | `fetchGames` o `fetchBestScores` fallan      | Por defecto                      |
| `/games/[id]` y `/games/[id]/play`    | `fetchGame` falla (no si devuelve null)      | Por defecto                      |
| `DetailLeaderboard`, dentro del aside | `fetchLeaderboard` falla                     | `title: "RANKING NO DISPONIBLE"` |
| `/hall-of-fame`, bajo el título       | `fetchGames` o `fetchAllLeaderboards` fallan | Por defecto                      |
| `GamesRail`, en lugar de la grilla    | `fetchGames` falla                           | Por defecto                      |

### Salón de la Fama

- La pestaña inicial es el primer juego por `sort_order` (hoy está fija en `"arkanoid"`).
- Las 8 tablas llegan del servidor en una sola consulta a `leaderboard`. Cambiar de pestaña no hace otra consulta.
- «TU MEJOR MARCA» se consulta con `fetchPersonalBest` al cambiar de pestaña, solo con sesión no invitada. Mientras carga o si falla, la fila no se muestra.

## Plan de implementación

1. **Tabla `games` y semilla.** Aplicar `create_games` y `seed_games` con el MCP. Verificación: `select id, sort_order from games order by sort_order` devuelve los 8 juegos en orden, y `get_advisors` (security) no reporta tablas sin RLS. La app no cambia.
2. **Tabla `scores` y vista `leaderboard`.** Aplicar `create_scores` y `create_leaderboard_view`. Verificación con `execute_sql` bajo `set role anon`: un insert válido pasa; un nombre de 21 caracteres, una puntuación negativa, un `game_id` inexistente o un `created_at` explícito fallan; `update` y `delete` no afectan filas. Borrar las filas de prueba (como `postgres`). `get_advisors` sin alertas nuevas.
3. **Tipos y capa de datos.** Generar `lib/supabase/database.types.ts` con `generate_typescript_types` y tipar `client.ts` y `server.ts` con `Database`. Crear `result.ts`, `catalog.ts`, `leaderboard.ts`, `leaderboard-client.ts`, `toGame`, `RankedScore`/`toRankedScore` y `formatScoreDate`. Todavía nada los usa. Verificación: `npx tsc --noEmit` y `npm run lint` pasan.
4. **`SignalLost`.** Crear el componente. Verificación: `npx tsc --noEmit` pasa.
5. **Biblioteca desde la base.** `/games` llama a `fetchGames` y `fetchBestScores`. `LibraryView` recibe `games` y `bestScores`, y `GameCard` recibe `bestScore: number | undefined` (muestra `—` si falta). Verificación: `/games` muestra los 8 juegos; buscador y chips funcionan igual.
6. **Detalle y Reproductor desde la base.** Las dos páginas usan `fetchGame` (también en `generateMetadata`) y se quitan `generateStaticParams` y `dynamicParams`. El Detalle llama a `fetchLeaderboard` y pasa `rows` a `DetailLeaderboard`, que calcula `isMine` y muestra el estado vacío. Verificación: `/games/asteroids` muestra «SÉ EL PRIMERO…», y `/games/no-existe` muestra la 404.
7. **Guardar en Supabase.** `PlayerView` guarda con `insertScore` y maneja `SaveStatus`. `GameOverModal` recibe `saveStatus` y el nuevo texto de invitado. Verificación: una partida de ASTEROIDS guardada aparece en `/games/asteroids` al entrar.
8. **Salón de la Fama desde la base.** La página llama a `fetchGames` y `fetchAllLeaderboards`. `HallOfFameView`, `GameTabs` y `HallOfFameTable` reciben los datos por props, y la mejor marca usa `fetchPersonalBest`. Verificación: la pestaña ASTEROIDS muestra la puntuación del paso 7, y «TU MEJOR MARCA» aparece con sesión.
9. **Home.** `GamesRail` pasa a ser async y lee `fetchGames` (6 primeros). En `lib/activity.ts`, `gameId` pasa a `gameTitle` y `LiveActivity` deja de usar `getGame`. Verificación: el Home se ve igual que antes.
10. **Limpieza.** Eliminar `GAMES`, `getGame`, `MOCK_PLAYER_NAMES`, `getMockScores`, `buildLeaderboard`, `getBestScore`, `LocalScores`, `ScoreEntry`, `lib/local-scores.ts`, `STORAGE_KEYS.scores` y `formatToday`. Verificación: `grep -rn "GAMES\b\|getGame\|local-scores\|getMockScores\|formatToday" app components lib` no encuentra nada, y `npm run build` pasa.
11. **Documentación.** Actualizar `CLAUDE.md`: párrafo de «Proyecto» (SPEC 06), rutas (render dinámico), estructura (`catalog.ts`, `leaderboard.ts`, `leaderboard-client.ts`, `SignalLost`, `database.types.ts`), la sección de persistencia simulada (queda solo `e1230_user`), la frase sobre el código de servidor y el esquema de la base en «Notas del stack». Verificación: `npm run format:check` pasa.

## Criterios de aceptación

**Base de datos**

- [ ] `games` tiene 8 filas con los mismos `id`, títulos, categorías, acentos y textos que tenía `lib/games.ts`, con `sort_order` del 1 al 8 en el orden original.
- [ ] Con la clave publicable (rol `anon`), `select` sobre `games`, `scores` y `leaderboard` funciona.
- [ ] Con la clave publicable, `insert`, `update` y `delete` sobre `games` fallan o no afectan filas.
- [ ] Con la clave publicable, un insert en `scores` con `game_id: "asteroids"`, `name: "PRUEBA"` y `score: 1200` crea la fila con `created_at` puesto por la base.
- [ ] Con la clave publicable, fallan los inserts con nombre vacío, con espacios al inicio o al final, o de 21 caracteres, con puntuación negativa, decimal o de 10.000.000, con un `game_id` inexistente, o con `created_at` o `id` explícitos.
- [ ] Con la clave publicable, `update` y `delete` sobre `scores` no afectan filas.
- [ ] `leaderboard` devuelve como máximo 10 filas por juego, con `rank` de 1 a N sin repetir, y en un empate de puntuación queda primero la entrada más antigua.
- [ ] `get_advisors` (security) no reporta tablas sin RLS ni vistas con `security definer`.

**Biblioteca y Home**

- [ ] `/games` muestra los 8 juegos en el orden de `sort_order`, y el buscador y los chips de categoría filtran igual que antes.
- [ ] Una tarjeta sin puntuaciones muestra `—` en MEJOR PUNTUACIÓN. Con puntuaciones, muestra la del primer lugar del ranking.
- [ ] «Juegos disponibles» del Home muestra los 6 primeros juegos por `sort_order`.
- [ ] «Actividad en vivo» muestra los mismos nombres de juego que antes del spec.

**Detalle y Reproductor**

- [ ] `/games/asteroids` y `/games/asteroids/play` cargan con los datos de la base. El título de la pestaña es `ASTEROIDS` y `Jugando ASTEROIDS`.
- [ ] `/games/no-existe` y `/games/no-existe/play` muestran la 404 temática.
- [ ] Con el ranking vacío, el Detalle muestra «SÉ EL PRIMERO EN ENTRAR AL RANKING».
- [ ] Al terminar una partida con sesión `NEÓN` y pulsar GUARDAR PUNTUACIÓN, el botón pasa a «GUARDANDO…» y luego aparece el mensaje tipeado. Hay exactamente una fila nueva en `scores`.
- [ ] Con esa puntuación en el top 10, `/games/asteroids` la muestra con la fecha de hoy en formato `dd/mm/aaaa` y resaltada como propia.
- [ ] Como invitado, la puntuación se guarda con el nombre `INVITADO` y el modal dice «Como invitado, aparecerás como INVITADO en el ranking.».
- [ ] Si el insert falla (por ejemplo, sin red), el modal muestra «NO SE PUDO GUARDAR. INTENTA DE NUEVO.» y GUARDAR PUNTUACIÓN vuelve a estar activo. Reintentar con red guarda una sola fila.
- [ ] Una puntuación guardada desde otro navegador aparece en el ranking al recargar `/games/asteroids`.

**Salón de la Fama**

- [ ] La pestaña inicial es ARKANOID (primer `sort_order`) y hay una pestaña por cada juego de la base.
- [ ] Cambiar de pestaña muestra el top 10 de ese juego sin una petición nueva a `leaderboard`.
- [ ] Con sesión no invitada y al menos una puntuación con ese nombre, aparece «TU MEJOR MARCA» con la mejor, aunque esté fuera del top 10.
- [ ] Sin sesión, no aparece «TU MEJOR MARCA» y se ve el enlace «Inicia sesión».

**Modo degradado**

- [ ] Sin `NEXT_PUBLIC_SUPABASE_URL` en `.env`, `/games`, `/games/asteroids`, `/games/asteroids/play` y `/hall-of-fame` muestran «SEÑAL PERDIDA» sin error en la consola del servidor que tumbe la página, y el Home carga con «SEÑAL PERDIDA» en lugar de la grilla de juegos.
- [ ] Si solo falla `fetchLeaderboard`, el Detalle muestra el juego y el aside dice «RANKING NO DISPONIBLE».

**Limpieza y build**

- [ ] `lib/local-scores.ts` no existe, y `GAMES`, `getGame`, `getMockScores`, `buildLeaderboard`, `formatToday` y `STORAGE_KEYS.scores` no aparecen en `app/`, `components/` ni `lib/`.
- [ ] La app no escribe en `e1230_scores` al guardar una puntuación.
- [ ] `npm run build`, `npm run lint` y `npx tsc --noEmit` pasan. `npm run build` pasa también sin las variables de Supabase.
- [ ] El flujo de sesión (`/login`, invitado, cerrar sesión) funciona igual que antes.

## Decisiones

- **Sí:** tabla `games` en Supabase con todos los campos del catálogo y `sort_order`. Lo eligió el usuario. La base pasa a ser la única fuente del catálogo.
- **No:** tabla `games` solo con `id` y título para la FK. Mantendría dos fuentes del catálogo.
- **Sí:** una sola tabla `scores` con `game_id` y un ranking por juego. Lo eligió el usuario. Agregar un juego no exige una migración de puntuaciones.
- **No:** una tabla de puntuaciones por juego (`scores_asteroids`…). Multiplica tablas y políticas RLS.
- **Sí:** nombre libre con insert anónimo validado por `CHECK` y RLS. Lo eligió el usuario. Se acepta que se pueda hacer trampa hasta la autenticación real.
- **No:** insert solo desde una Server Action. Sin identidad real no agrega seguridad frente a un envío directo con la clave publicable, que sigue siendo posible salvo que se quite el permiso de insert al rol `anon`.
- **No:** autenticación real en este spec. Duplicaría el tamaño del spec; va en el siguiente.
- **Sí:** `GRANT INSERT` solo sobre `game_id`, `name` y `score`. Impide falsear `created_at` y alterar el desempate.
- **Sí:** límites de nombre 1–20 y puntuación 0–9.999.999. Lo eligió el usuario. El login ya corta los nombres a 14 caracteres.
- **No:** tope de puntuación distinto por juego. Exige definir 8 topes sin datos reales.
- **Sí:** eliminar los rankings mock; los rankings arrancan vacíos con «SÉ EL PRIMERO…». Lo eligió el usuario.
- **No:** sembrar las puntuaciones mock en la base. Mezclaría datos inventados con puntuaciones reales.
- **Sí:** abandonar `e1230_scores` sin migrar. Lo eligió el usuario. Los datos viejos quedan huérfanos en el navegador sin afectar a la app.
- **Sí:** el top 10 son las 10 mejores entradas, con nombres repetidos. Lo eligió el usuario. Es el comportamiento actual.
- **Sí:** desempate por la entrada más antigua (`created_at asc`, luego `id`). Premia a quien llegó primero y da rangos estables.
- **Sí:** vista `leaderboard` con `row_number()` y `security_invoker`. Una sola consulta sirve al Salón de la Fama y a las mejores puntuaciones, y respeta las RLS.
- **Sí:** render dinámico por petición. Lo eligió el usuario. Los rankings siempre están al día y `next build` no depende de Supabase.
- **No:** páginas estáticas con revalidación. El build fallaría si Supabase no responde.
- **Sí:** lectura en Server Components y props hacia los componentes cliente. El Salón de la Fama recibe los 8 rankings de una vez y no consulta al cambiar de pestaña.
- **Sí:** «TU MEJOR MARCA» se consulta desde el navegador. El nombre de la sesión vive en `localStorage` y el servidor no lo conoce.
- **Sí:** mensaje de error en pantalla sin respaldo local. Lo eligió el usuario. Mantener dos fuentes de datos no vale la pena.
- **Sí:** «Juegos disponibles» del Home desde la base; «Actividad en vivo» y estadísticas siguen fijas. Lo eligió el usuario. Con la base vacía, la actividad real se vería vacía.
- **Sí:** `lib/activity.ts` guarda el título del juego (`gameTitle`). Es un dato decorativo y así no depende del catálogo.
- **Sí:** fechas formateadas con zona fija `America/Bogota`. Evita que servidor y navegador formateen distinto. Se puede cambiar en una sola constante.
- **Sí:** `lib/catalog.ts` y `lib/leaderboard.ts` separados de `lib/games.ts` y `lib/scores.ts`. Los componentes cliente siguen importando tipos y `ACCENTS` sin arrastrar `next/headers`.
- **No:** agregar el paquete `server-only`. `next/headers` ya hace fallar el build si un componente cliente importa esos módulos.
- **Sí:** los tipos generados viven en `lib/supabase/database.types.ts`, junto a los clientes. `CLAUDE.md` ya anunciaba que se generan en el primer spec con tablas.

## Riesgos

| Riesgo                                                                                                    | Mitigación                                                                                                                                              |
| --------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Cualquiera con la clave publicable puede insertar puntuaciones falsas o nombres ofensivos.                | Se acepta hasta la autenticación real. Los `CHECK` limitan tamaño y rango, y se pueden borrar filas desde el panel de Supabase.                         |
| Envío masivo de filas (spam) llena `scores`.                                                              | El ranking solo lee el top 10 con índice, así que el rendimiento no se degrada. Un límite de envíos va en el spec antitrampas.                          |
| Los textos sembrados se desalinean de los que tenía `lib/games.ts`.                                       | La semilla copia los textos literalmente, y un criterio de aceptación compara los 8 juegos.                                                             |
| Quitar `generateStaticParams` hace más lentas las páginas de juego.                                       | Son dos consultas pequeñas por petición, y `fetchGame` usa `cache()` para no repetir la de `generateMetadata`.                                          |
| El caché del router de Next muestra un ranking viejo al volver al Detalle después de guardar.             | En Next 16, las páginas dinámicas no se reutilizan del caché del cliente por defecto. Si aparece, `PlayerView` llama a `router.refresh()` tras guardar. |
| Un componente cliente importa `lib/catalog.ts` por error.                                                 | `next/headers` hace fallar `npm run build`, y la convención está documentada en «Rutas y archivos».                                                     |
| El `insert` devuelve error porque el cliente pide la fila de vuelta (`.select()`) sin permiso sobre `id`. | `insertScore` no encadena `.select()`: solo necesita saber si el insert funcionó.                                                                       |

## Lo que **no** entra en este spec

- Autenticación real y puntuaciones ligadas a usuarios.
- Validación antitrampas, límites de envío o captcha.
- «Actividad en vivo», «Top del día» y estadísticas del Home con datos reales.
- Migración de `e1230_scores`.
- Paginación del ranking, más de 10 entradas o un nombre por fila.
- Administración del catálogo, portadas en la base o tiempo real.
- Cambios en la sesión simulada.
- Tests automatizados.
- Cambios en los specs 01 a 05.

Si alguna de estas llega, va en su propio spec.
