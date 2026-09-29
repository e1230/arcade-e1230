# Catálogo y ranking en Supabase

Esta guía resume cómo integra la plataforma a un juego desde el SPEC 06 y qué migraciones puede necesitar su spec. Proyecto de Supabase: `xanuntuhanyubcqiudlp`, conectado por MCP. No hay carpeta `supabase/` ni Supabase CLI: las migraciones se aplican con `apply_migration` sobre el proyecto remoto.

## Cómo funciona hoy

- **Una fila en `games` basta para que el juego aparezca** en:
  - la Biblioteca (`/games`, en orden de `sort_order`, con su mejor puntuación);
  - el Detalle (`/games/<id>`, con su top 10);
  - el Reproductor (`/games/<id>/play`);
  - una pestaña del Salón de la Fama;
  - «Juegos disponibles» del Home, solo si queda entre los 6 primeros por `sort_order`.
- **El ranking es genérico:** `scores` guarda una fila por puntuación con `game_id`, y la vista `leaderboard` da el top 10 de cada juego. `PlayerView` guarda con `insertScore` para cualquier juego. **El código del ranking (`lib/leaderboard.ts`, `lib/leaderboard-client.ts`, `DetailLeaderboard`, `HallOfFameTable`) no se toca en un spec de juego.**
- **Un juego es jugable si y solo si `getGameDefinition(id)` devuelve una definición.** Sin motor, el Reproductor muestra el placeholder y SIMULAR PARTIDA, y la partida simulada también guarda en `scores`.
- Las páginas se renderizan por petición: un juego nuevo aparece sin volver a correr el build.

## Restricciones de `games`

Nombres reales de los constraints, sacados de `pg_constraint`:

| Constraint             | Regla                                                  |
| ---------------------- | ------------------------------------------------------ |
| `games_pkey`           | `id` es la clave primaria                              |
| `games_id_check`       | `id ~ '^[a-z0-9-]+$'`                                  |
| `games_title_check`    | `char_length(title)` entre 1 y 40                      |
| `games_category_check` | `category` en `'Clásicos', 'Disparos', 'Puzles', 'Laberinto'` |
| `games_accent_check`   | `accent` en `'cyan', 'pink', 'yellow'`                 |
| `games_sort_order_key` | `sort_order` único                                     |

`short_description` y `long_description` son `text not null`, sin límite. El `id` es también el segmento de la URL y la carpeta `lib/arcade/<id>/`. Antes de escribir el spec, confirma los nombres con:

```sql
select conname, pg_get_constraintdef(oid)
from pg_constraint
where conrelid = 'public.games'::regclass;
```

## Caso 1 — Fila existente

No hay cambios en la base. Opcionalmente, si el usuario decide alinear los textos con el juego real:

```sql
-- migración update_<id>_description
update public.games
set short_description = '…',
    long_description = '…'
where id = '<id>';
```

## Caso 2 — Fila nueva

Migración `add_<id>_game`. El `sort_order` se calcula en la misma sentencia, para no chocar con el constraint único si otro juego se agregó mientras tanto:

```sql
-- migración add_<id>_game
insert into public.games (id, title, category, accent, short_description, long_description, sort_order)
select '<id>', '<TÍTULO>', '<Categoría>', '<acento>', '<descripción corta>', '<descripción larga>',
       coalesce(max(sort_order), 0) + 1
from public.games;
```

- Si el usuario quiere otra posición (por ejemplo, entre los 6 del Home), el spec debe decir qué filas se corren y hacerlo en la misma migración, cuidando el constraint único (primero se mueven las filas a valores temporales o de mayor a menor).
- El título va en mayúsculas, como el resto del catálogo (`ASTEROIDS`, `PAC-MAN`).
- Las descripciones siguen el tono de las existentes: léelas en la Fase 1.

## Caso 3 — Categoría o acento nuevos

Solo si el juego no encaja en los actuales. El usuario autorizó proponerlos.

**Base de datos:** migración `extend_games_category_check` (o `extend_games_accent_check`), **antes** de la que inserta la fila:

```sql
-- migración extend_games_category_check
alter table public.games drop constraint games_category_check;
alter table public.games add constraint games_category_check
  check (category in ('Clásicos', 'Disparos', 'Puzles', 'Laberinto', '<Nueva>'));
```

**App** (`lib/games.ts`):

- Categoría: agregar el valor a `GameCategory` y a `CATEGORY_FILTERS`. El orden de `CATEGORY_FILTERS` es el orden de los chips de la Biblioteca, así que el spec lo fija.
- Acento: agregar el valor a `Accent` y su entrada en `ACCENTS` (`hex` y `tint` translúcido, como los existentes). El `hex` sale de un token de `app/globals.css` (hoy: `--neon-cyan`, `--neon-pink`, `--neon-yellow`, `--neon-green`). Si hace falta un color nuevo, el spec agrega primero el token.
- Buscar los usos para confirmar que nada más cambia: `grep -rn "ACCENTS\[\|CATEGORY_FILTERS\|GameCategory\|: Accent" app components lib`. Hoy son `app/games/[id]/page.tsx`, `GameCard`, `MiniGameCard` y `PlayerView` (acento), y `CategoryFilter` (categorías). `NeonAccent` de `components/ui/NeonButton.tsx` es independiente y no cambia.

## Tipos generados

Insertar filas, actualizar textos o cambiar un `CHECK` **no cambia** `lib/supabase/database.types.ts`: las columnas siguen siendo `text`. Solo se regenera con `generate_typescript_types` si el spec cambia columnas, tablas o vistas, y eso normalmente no pasa en un spec de juego.

## Puntaje

`scores` exige `score between 0 and 9999999`, entero. El motor respeta ese tope (ver `engine-contract.md`). No hay topes por juego ni validación antitrampas: eso es otro spec.

## Verificación en el spec

Pasos del plan que tocan la base:

- Después de cada migración: `select id, title, category, accent, sort_order from public.games order by sort_order` muestra la fila esperada y el resto sin cambios.
- `get_advisors` (security) sin alertas nuevas.

Criterios de aceptación de ranking que siempre van:

- Al terminar una partida y pulsar GUARDAR PUNTUACIÓN, hay exactamente una fila nueva en `scores` con `game_id = '<id>'` y la misma puntuación que mostraba el HUD.
- Esa puntuación aparece en `/games/<id>` (si entra en el top 10) y en la pestaña `<TÍTULO>` del Salón de la Fama.
- La tarjeta de `<TÍTULO>` en `/games` muestra como MEJOR PUNTUACIÓN la del primer lugar.

Si el spec pide borrar las filas de prueba, se hace con `execute_sql` como `postgres` (`delete from public.scores where game_id = '<id>' and name = '…'`) y queda escrito en el paso.

## Lo que queda fuera por defecto

Autenticación real, topes por juego o antitrampas, portadas o capturas en la base, una etiqueta «JUGABLE» en la Biblioteca y cambios en «Actividad en vivo» o en las estadísticas del Home. Si el usuario los pide, se señala que van en su propio spec.

## `CLAUDE.md`

El último paso de todo spec de juego actualiza `CLAUDE.md`:

- El párrafo de «Proyecto»: el SPEC NN implementado y el juego jugable.
- «Rutas» → `/games/[id]/play`: qué juegos tienen motor real.
- «Estructura» → `lib/arcade/`: la carpeta `<id>/` con sus archivos, `shared/` si se creó, y la lista del registro (hoy dice «solo `asteroids` tiene motor»).
- Si hubo migraciones, la descripción del esquema en «Notas del stack».
