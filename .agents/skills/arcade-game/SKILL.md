---
name: arcade-game
description: Diseña el spec de un juego jugable para Arcade E1230 (motor en lib/arcade/, fila en el catálogo de Supabase y ranking global), portado de references/started-games/ o creado desde cero. Hace preguntas y escribe specs/NN-<id>-game.md en Borrador; no escribe código. Úsalo cuando se quiera agregar un juego nuevo a la plataforma o hacer jugable uno del catálogo.
argument-hint: "<id del catálogo, carpeta de references/started-games/ o descripción del juego>"
allowed-tools: Read, Glob, Grep, Write, AskUserQuestion, Bash(ls:*), Bash(cat:*), Bash(date:*), mcp__supabase__execute_sql, mcp__supabase__list_tables
---

# /arcade-game — Spec de un juego jugable con ranking

## Contexto de la sesión

Fecha de hoy (úsala en el encabezado del spec, nunca la adivines):
!`date +%F`

Specs existentes:
!`ls specs/ 2>/dev/null || echo "La carpeta specs/ no existe"`

Juegos de referencia disponibles:
!`ls references/started-games/ 2>/dev/null || echo "No hay juegos de referencia"`

Motores implementados:
!`ls lib/arcade/ 2>/dev/null || echo "La carpeta lib/arcade/ no existe"`

Registro de motores:
!`cat lib/arcade/registry.ts 2>/dev/null || echo "No existe lib/arcade/registry.ts"`

---

Este skill convierte un juego en un spec listo para `/spec-impl`. El juego puede venir de `references/started-games/` (port) o no tener referencia (diseño desde cero). Puede estar ya en el catálogo de Supabase o ser nuevo. **Aquí no se escribe código ni se aplican migraciones**: el único archivo que se crea es `specs/NN-<id>-game.md`.

El skill aplica lo que los SPEC 05 (Asteroids jugable) y 06 (catálogo y ranking en Supabase) ya decidieron, para no volver a discutirlo en cada juego. Lo que sí cambia de un juego a otro se pregunta.

Archivos de apoyo, en la misma carpeta que este skill:

| Archivo                          | Para qué                                                               |
| -------------------------------- | ---------------------------------------------------------------------- |
| `template.md`                    | Forma del spec de un juego. Respétala sección por sección.             |
| `guides/engine-contract.md`      | Contrato de motor, reglas de `lib/arcade/`, HUD, resolución y puntaje. |
| `guides/port-from-reference.md`  | Cómo analizar y portar un juego de `references/started-games/`.        |
| `guides/design-from-scratch.md`  | Cómo definir un juego sin referencia.                                  |
| `guides/catalog-leaderboard.md`  | Fila en `games`, migraciones, ranking y verificación en Supabase.      |

Responde siempre en español. El spec también se escribe en español, con código en inglés y comentarios en español latinoamericano, como pide `CLAUDE.md`.

## Fase 1 — Contexto

1. Lee `CLAUDE.md` (y `AGENTS.md`, que incluye).
2. Lee `specs/05-asteroids-game.md` y `specs/06-games-leaderboard.md` completos. Son el modelo vivo: el spec que escribas debe usar sus mismos encabezados, su tono y su nivel de detalle.
3. Lee las cuatro guías y `template.md`.
4. Lee `lib/arcade/engine.ts`, `lib/arcade/asteroids/index.ts`, `lib/arcade/asteroids/game.ts` y `components/game/PlayerView.tsx`. Si un spec anterior amplió el contrato o movió utilidades a `lib/arcade/shared/`, lo vas a ver ahí; parte del estado actual del código, no del que describen las guías.
5. Consulta el catálogo con `mcp__supabase__execute_sql`, solo lectura:

   ```sql
   select id, title, category, accent, sort_order, short_description, long_description
   from public.games
   order by sort_order;
   ```

   Si el MCP de Supabase no responde, dilo y pide al usuario los datos que hagan falta. **Nunca inventes filas del catálogo.**

## Fase 2 — Identificar y clasificar el juego

El argumento recibido es: `$ARGUMENTS`

Si viene vacío, pregunta qué juego se quiere agregar y detente hasta tener respuesta.

Resuélvelo contra, en este orden:

1. Una carpeta de `references/started-games/`, por nombre completo (`03-tetris`) o por el slug sin número (`tetris`).
2. Un `id` o un título del catálogo (`snake`, `PAC-MAN`).
3. Una descripción libre de un juego nuevo.

Clasifica el juego en dos ejes y díselo al usuario en una línea:

| Eje      | Valores                                                                          |
| -------- | -------------------------------------------------------------------------------- |
| Origen   | **Referencia** (hay carpeta en `references/started-games/`) o **desde cero**      |
| Catálogo | **Fila existente** (el `id` está en `games`) o **fila nueva** (hay que insertarla) |

Detente sin escribir nada en estos casos:

- El `id` ya está en `DEFINITIONS` del registro: el juego ya es jugable. Cualquier cambio se hace con `/spec`.
- Ya hay en `specs/` un spec para ese juego en Borrador o Aprobado (busca el `id` y el título con Grep). Muestra la ruta y pregunta si se retoma ese spec en lugar de crear otro.
- El pedido abarca más de un juego. Un spec por juego: pregunta con cuál se empieza.

## Fase 3 — Análisis

- **Con referencia:** sigue `guides/port-from-reference.md`. Lee **todos** los archivos de la carpeta (no solo `game.js`) y arma el inventario que pide la guía. Muéstrale al usuario un resumen corto del inventario antes de preguntar: qué se mapea al HUD de la plataforma, qué queda en el canvas y qué se quita.
- **Desde cero:** sigue `guides/design-from-scratch.md`. Si el juego ya está en el catálogo, parte de su `long_description`.

En los dos casos, revisa `guides/engine-contract.md` para detectar lo que el contrato actual no cubre (un juego sin vidas, datos extra en el HUD, mouse, otra proporción de pantalla).

## Fase 4 — Preguntas

Pregunta en bloques de 3 a 5, con `AskUserQuestion`, con 2 a 4 opciones concretas por pregunta y tu recomendación primero, marcada «(Recomendado)». Espera la respuesta de cada bloque antes del siguiente. No preguntes lo que ya está decidido por los SPEC 05 y 06 ni lo que el usuario ya contestó.

Estos temas se cubren siempre. Omite solo los que el análisis ya resolvió sin ambigüedad, y dilo:

1. **Jugabilidad.** ¿Idéntica a la referencia (constantes, controles, reglas) o con ajustes? Sin referencia: las preguntas de diseño de `design-from-scratch.md`.
2. **HUD.** Cómo se alimentan PUNTUACIÓN, VIDAS y NIVEL. Si el juego no tiene vidas o tiene más de 3, o no tiene niveles, ofrece las opciones de `engine-contract.md`.
3. **Datos extra del juego** (siguiente pieza, líneas, temporizador, power-ups): se dibujan en el canvas o se amplía el contrato para mostrarlos fuera.
4. **Encuadre.** El canvas es 4:3. Si el tablero de la referencia tiene otra proporción, cómo se acomoda.
5. **Estilo visual.** Neón con los tokens del tema (como Asteroids) o sprites e imágenes de la referencia.
6. **Assets y sonido.** Qué archivos se copian a `public/arcade/<id>/` y si el sonido entra en este spec o queda fuera (el SPEC 05 lo dejó fuera).
7. **Entrada.** Teclas definitivas, conflictos con P (reservada para la pausa) y con Espacio (inicia desde `StartScreen`), y qué se hace con el mouse o con controles propios de la referencia.
8. **Fin de partida.** Condición de derrota, condición de victoria si existe, y qué puntuación se reporta en cada caso.
9. **Catálogo.** Fila existente: ¿se corrigen `short_description` o `long_description` si no coinciden con el juego real? Fila nueva: `id`, título, categoría, acento, descripciones y posición (`sort_order`).
10. **Categoría o acento nuevos**, solo si el juego no encaja en los actuales. El usuario ya autorizó proponerlos; el spec incluye la migración y los cambios en `lib/games.ts` descritos en `catalog-leaderboard.md`.
11. **Puntaje máximo.** Si el juego puede superar 9.999.999 puntos, cómo se limita.

Si una respuesta abre algo grande (multijugador, controles táctiles, editor de niveles), señala que merece su propio spec y pregunta si queda fuera.

**Cuándo dejar de preguntar:** cuando puedas responder, sin suponer nada:

1. Qué archivos aparecen o cambian (incluidas las migraciones).
2. Cuál es el primer paso ejecutable y cuál el último.
3. Cómo se verifica que el juego quedó terminado y su ranking funciona.

## Fase 5 — Escribir el spec

1. **Número:** el mayor de `specs/` más uno, con dos dígitos.
2. **Slug:** `<id>-game`, por ejemplo `specs/07-tetris-game.md`.
3. **Encabezado:** `# SPEC NN — <TÍTULO> jugable en el Reproductor`, estado `Borrador`, «Depende de: SPEC 05, SPEC 06» (más cualquier spec de juego del que dependa, por ejemplo el que movió utilidades a `shared/`), y la fecha del contexto de la sesión. Revisa que cada spec citado exista.
4. **Contenido:** sigue `template.md`. Reemplaza todos los marcadores (`<ID>`, `<TÍTULO>`, `<Pascal>`, `<camel>`) y quita los bloques «(si aplica)» que no apliquen. No dejes ningún `TODO`, «a definir» ni valor sin fijar.
5. Escríbelo completo de una vez: la información ya se cerró en la Fase 4. No lo muestres por secciones ni pidas permiso para guardarlo. Solo pregunta si el archivo ya existe.
6. No toques `specs/.spec-config.yml`.

## Fase 6 — Confirmar y detenerse

Dile al usuario:

- La ruta del spec creado y la clasificación del juego (origen y catálogo).
- Que el spec está en **Borrador** y que, después de releerlo, debe cambiarlo a **Aprobado** a mano.
- El siguiente paso: `/spec-impl NN-<id>-game`.

**Detente ahí.** No propongas implementar ni empieces a hacerlo.

## Reglas duras

- **No escribas código, migraciones ni ningún archivo** fuera de `specs/NN-<id>-game.md`.
- **Con SQL, solo `select`.** Las migraciones se describen en el spec; las aplica `/spec-impl` con `apply_migration`.
- **No modifiques `references/`.** Es material de solo lectura.
- **Un juego por spec.**
- **No supongas decisiones.** Si algo no está cerrado, pregúntalo en la Fase 4.
- **No reabras lo que decidieron los SPEC 05 y 06** (motor en TypeScript dentro del bundle, sin iframe; HUD y fin de partida de la plataforma; ranking genérico por `game_id`; render dinámico), salvo que el usuario lo pida. En ese caso va en «Decisiones» con su justificación.
