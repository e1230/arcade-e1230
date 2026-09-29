# Plantilla del spec de un juego

Esta es la forma que debe tener `specs/NN-<id>-game.md`. **No es texto para copiar literal**: las secciones, su orden y su nivel de detalle son obligatorios, y el contenido sale del análisis y de las respuestas del usuario. Los modelos reales son `specs/05-asteroids-game.md` y `specs/06-games-leaderboard.md`: si hay duda sobre el tono o el detalle, imítalos.

Marcadores:

| Marcador   | Ejemplo           |
| ---------- | ----------------- |
| `<ID>`     | `tetris`          |
| `<TÍTULO>` | `TETRIS`          |
| `<Pascal>` | `Tetris`          |
| `<camel>`  | `tetris`          |
| `<ORIGEN>` | `references/started-games/03-tetris/` o «sin referencia» |

Los bloques marcados **(si aplica)** se quitan enteros cuando no aplican. Reemplaza todos los marcadores y no dejes `TODO` ni valores sin fijar.

---

```markdown
# SPEC NN — <TÍTULO> jugable en el Reproductor

> **Estado:** Borrador
> **Depende de:** SPEC 05, SPEC 06
> **Fecha:** AAAA-MM-DD
> **Objetivo:** <Una frase. Con referencia: «Portar a TypeScript el <TÍTULO> de `<ORIGEN>` y hacerlo jugable en `/games/<ID>/play`, con su puntuación en el ranking global.» Sin referencia: «Crear un <TÍTULO> jugable en `/games/<ID>/play` …».>

## Por qué existe este spec

<Dos o tres párrafos. Qué hay hoy (el juego está en el catálogo con SIMULAR PARTIDA, o no existe). De dónde sale el juego (la referencia y su tamaño, o el diseño acordado). Qué del contrato o de la plataforma no le alcanza y cómo se resuelve. Si el spec mueve utilidades a `lib/arcade/shared/` o amplía el contrato, decirlo aquí.>

## Alcance

**Incluye:**

- **Catálogo** (si aplica): fila nueva `<ID>` en `games` con la migración `add_<ID>_game`, o textos corregidos con `update_<ID>_description`.
- **Categoría o acento nuevos** (si aplica): migración `extend_games_…_check` y cambios en `lib/games.ts`.
- **Utilidades compartidas** (si aplica): `keyboard.ts` y `math.ts` pasan de `lib/arcade/asteroids/` a `lib/arcade/shared/` sin cambios de comportamiento.
- **Port a TypeScript** (o **Motor nuevo**) en `lib/arcade/<ID>/`, con <resumen de la jugabilidad: reglas, puntos, vidas, niveles>.
- **Estilo**: <neón con `COLORS` o sprites de la referencia; color de cada entidad>.
- **HUD de la plataforma**: <qué alimenta PUNTUACIÓN, VIDAS y NIVEL; qué queda en el canvas>.
- **Ampliación del contrato** (si aplica): <campo o callback opcional y los componentes que cambian>.
- **Assets** (si aplica): <archivos copiados a `public/arcade/<ID>/`>.
- **Registro**: `<ID>` se agrega a `DEFINITIONS`, así que `/games/<ID>/play` deja de mostrar SIMULAR PARTIDA.
- **Ranking**: la puntuación final se guarda en `scores` con el flujo existente de `GameOverModal`, sin cambios en el código del ranking.
- **Documentación**: actualizar `CLAUDE.md`.

**Fuera de alcance (para futuros specs):**

- <Todo lo de la referencia que no se porta: sonido, selector de nivel, tema claro/oscuro…>
- Controles táctiles.
- Cambios de jugabilidad respecto de <la referencia / lo acordado>.
- Validación antitrampas o topes de puntuación por juego.
- Cambios en la Biblioteca, el Home o el Salón de la Fama más allá de lo que da la fila del catálogo.
- Tests automatizados.
- Modificar `references/` o los specs anteriores.

## Rutas y archivos

(Formato del SPEC 05: árbol con `(nuevo)`, `(cambia)` o `(se mueve)` y una línea de qué hace cada archivo.)

    lib/
      arcade/shared/keyboard.ts        (se mueve, si aplica) desde lib/arcade/asteroids/
      arcade/shared/math.ts            (se mueve, si aplica)
      arcade/asteroids/*.ts            (cambia, si aplica) imports de shared/
      arcade/<ID>/constants.ts         (nuevo) dimensiones, constantes, SCORE_MAX y COLORS
      arcade/<ID>/entities.ts          (nuevo) …
      arcade/<ID>/game.ts              (nuevo) create<Pascal>Engine
      arcade/<ID>/index.ts             (nuevo) <camel>Definition
      arcade/engine.ts                 (cambia, si aplica) campo opcional …
      arcade/registry.ts               (cambia) + <ID>
      games.ts                         (cambia, si aplica) categoría o acento
    components/game/
      PlayerHud.tsx                    (cambia, si aplica) …
      PlayerView.tsx                   (cambia, si aplica) …
    public/arcade/<ID>/                (nuevo, si aplica) assets copiados de la referencia
    CLAUDE.md                          (cambia)

Sin cambios: <lista explícita de lo compartido que NO se toca, p. ej. `GameCanvas`, `StartScreen`, `GameOverModal`, `lib/leaderboard*.ts`>.

Base de datos (proyecto `xanuntuhanyubcqiudlp`, con `apply_migration` del MCP de Supabase): <migraciones en orden, o «sin cambios»>.

Convenciones:

- Las de `lib/arcade/` del SPEC 05: sin React ni `"use client"`, DOM solo dentro de `create()`, estado en el cierre, loop por `dt` sin timers.
- Código en inglés, comentarios en español latinoamericano, módulos sin JSX en kebab-case.

## Modelo de datos

### Catálogo (si aplica)

<SQL completo de cada migración, como en el SPEC 06, y la fila resultante.>

### Definición de <TÍTULO> — `lib/arcade/<ID>/index.ts`

- `width: 800`, `height: 600` (4:3, igual que el CRT). <Si el tablero tiene otra proporción: cómo se encuadra.>
- `controls`:

| `keys` | `action` |
| ------ | -------- |
| …      | …        |
| `P`    | PAUSA    |

### Constantes — `lib/arcade/<ID>/constants.ts`

<Con referencia: «Los valores de jugabilidad se copian de `<archivo>` sin cambios». Sin referencia: los valores acordados.>

| Constante | Valor |
| --------- | ----- |
| …         | …     |
| `SCORE_MAX` | `9_999_999` |
| `MAX_DT`  | `0.05 s` |

Colores del canvas (espejo de los tokens de `app/globals.css`):

    export const COLORS = {
      background: "#05050a", // --deep
      …
    } as const;

### Estado interno de la partida — `lib/arcade/<ID>/game.ts`

    type Phase = …;

    interface <Pascal>State {
      phase: Phase;
      …
      score: number;
      lives: number;
      level: number;
    }

### Reglas del port que difieren de la referencia (o «Reglas del juego», sin referencia)

- `start()` emite `onScore(0)`, `onLives(…)` y `onLevel(1)`.
- <Cuándo se emite cada callback.>
- <Qué deja de dibujar el canvas y qué sigue dibujando.>
- <Teclas quitadas o cambiadas; P y reinicio los maneja la plataforma.>
- <Timers que pasan a acumuladores de `dt`.>
- <Fin de partida: derrota y victoria → `onGameOver(score)` una vez; teclado desconectado.>
- <Tope de puntuación.>

### Ampliación del contrato (si aplica)

<Tipos exactos del cambio en `engine.ts` y comportamiento de cada componente que lo consume. Debe quedar claro que ASTEROIDS no cambia.>

### Assets (si aplica)

<Tabla: archivo de origen → ruta en `public/arcade/<ID>/`, cómo se carga y qué pasa mientras carga.>

## Plan de implementación

(Cada paso deja la app funcionando y tiene su verificación. Numera solo los que aplican.)

1. **Catálogo** (si aplica). Aplicar <migraciones>. Verificación: `select … from games order by sort_order` muestra <fila>; `get_advisors` (security) sin alertas nuevas. `/games` muestra <TÍTULO> con SIMULAR PARTIDA.
2. **Utilidades compartidas** (si aplica). Mover `keyboard.ts` y `math.ts` a `lib/arcade/shared/` <y parametrizar `createKeyboard`>, y actualizar los imports de Asteroids. Verificación: `npx tsc --noEmit` y `npm run lint` pasan; ASTEROIDS se juega igual.
3. **Constantes y utilidades.** Crear `constants.ts` <y los módulos de datos>. Verificación: `npx tsc --noEmit` pasa.
4. **Entidades o modelo.** Crear <archivos> con `update(dt, …)` y `draw(ctx)`. Verificación: `npx tsc --noEmit` pasa.
5. **Motor.** Crear `game.ts` con `create<Pascal>Engine` y `index.ts` con `<camel>Definition`. Todavía no se registra. Verificación: `npx tsc --noEmit` y `npm run lint` pasan.
6. **Contrato y HUD** (si aplica). <Cambios en engine.ts y componentes>. Verificación: ASTEROIDS se ve y se juega igual.
7. **Registrar y conectar.** Agregar `<ID>` a `DEFINITIONS` <y copiar los assets>. Verificación: en `/games/<ID>/play` se juega una partida completa hasta el modal, y GUARDAR PUNTUACIÓN crea una fila en `scores` que aparece en `/games/<ID>`.
8. **Documentación.** Actualizar `CLAUDE.md` (proyecto, rutas, estructura <y esquema>). Verificación: `npm run format:check` pasa.

## Criterios de aceptación

**Generales**

- [ ] `npm run build`, `npm run lint` y `npx tsc --noEmit` terminan sin errores.
- [ ] Existen los archivos de `lib/arcade/<ID>/` listados en «Rutas y archivos».
- [ ] Ningún archivo de `lib/arcade/` importa `react` ni declara `"use client"`.
- [ ] `git diff main -- references/` no muestra cambios.
- [ ] Al jugar una partida completa en `/games/<ID>/play`, la consola del navegador no muestra errores ni advertencias de hidratación.

**Catálogo** (si aplica)

- [ ] `games` tiene la fila `<ID>` con <título, categoría, acento, textos y `sort_order`>, y el resto de las filas no cambió.
- [ ] `/games` muestra <TÍTULO> <en la posición N>, y el chip <Categoría> lo filtra.

**Flujo del Reproductor**

- [ ] `/games/<ID>/play` muestra el `PixelLoader` y luego `StartScreen` con «<TÍTULO>», las <N> filas de controles, «PRESIONA ESPACIO» e INICIAR.
- [ ] Presionar Espacio en `StartScreen` inicia la partida sin <acción de Espacio en el juego>.
- [ ] Con la partida iniciada, el HUD muestra <valores iniciales>.
- [ ] Las flechas y Espacio no hacen scroll durante la partida.

**Jugabilidad**

- [ ] <Un criterio verificable y con números por cada regla del juego.>
- [ ] El canvas no dibuja SCORE, NIVEL, vidas ni GAME OVER.
- [ ] <Criterio de estilo: color de cada entidad y fondo `#05050a`; el overlay CRT se ve encima.>

**Pausa**

- [ ] P y el botón PAUSA congelan el juego y muestran el overlay PAUSA; P y SEGUIR lo reanudan sin saltos.
- [ ] Mantener una tecla de movimiento durante la pausa y soltarla no la deja «pegada» al reanudar.
- [ ] Cambiar de pestaña o hacer clic fuera de la ventana durante la partida la deja en PAUSA.
- [ ] <Los temporizadores del juego (caída, respawn…) no avanzan durante la pausa.>

**Fin de partida y ranking**

- [ ] <Condición de derrota> abre `GameOverModal` con la misma puntuación que mostraba el HUD.
- [ ] <Condición de victoria (si aplica)> también abre el modal con la puntuación final.
- [ ] GUARDAR PUNTUACIÓN crea exactamente una fila en `scores` con `game_id = '<ID>'`, y aparece en `/games/<ID>` y en la pestaña <TÍTULO> del Salón de la Fama si entra en el top 10.
- [ ] La tarjeta de <TÍTULO> en `/games` muestra esa puntuación como MEJOR PUNTUACIÓN si es la primera.
- [ ] JUGAR DE NUEVO vuelve a `PixelLoader` y `StartScreen`, y la nueva partida arranca desde cero.
- [ ] SALIR durante la partida lleva a `/games/<ID>`, y volver a jugar no deja dos loops corriendo.

**Sin regresiones**

- [ ] ASTEROIDS se juega igual que antes del spec (HUD, pausa, fin de partida y guardado).
- [ ] Los juegos sin motor siguen mostrando SIMULAR PARTIDA.
- [ ] `/`, `/games`, `/hall-of-fame` y `/about` se ven igual que antes del spec, salvo <TÍTULO> donde corresponda.

## Decisiones

(Formato del SPEC 05: **Sí:** / **No:** + justificación + «Lo eligió el usuario» cuando corresponda. Una línea por decisión de la Fase 4, incluidas las descartadas.)

- **Sí:** port a TypeScript dentro del bundle, con el contrato del SPEC 05. <…>
- **Sí:** HUD y fin de partida de la plataforma; el canvas solo dibuja <indicadores propios>.
- **Sí/No:** <cada decisión de jugabilidad, HUD, encuadre, estilo, assets, sonido, entrada, catálogo…>

## Riesgos

| Riesgo | Mitigación |
| ------ | ---------- |
| En desarrollo, React Strict Mode monta el efecto dos veces y deja dos loops corriendo. | `destroy()` cancela el `requestAnimationFrame` y quita todos los listeners. Hay un criterio de «volver a jugar no deja dos loops». |
| Acceder a `window`, `document`, `Image` o `Audio` al importar `lib/arcade/<ID>/` rompe el prerender. | La convención obliga a tocar el DOM solo dentro de `create()`. `npm run build` lo detecta. |
| El salto de `dt` al reanudar mueve los objetos de golpe. | `resume()` pone `lastTime = null` y el tope de `dt` es de 50 ms. |
| La pulsación de Espacio que inicia la partida también actúa en el juego. | `consume()` ignora `event.repeat` y la transición a `playing` solo ocurre desde `ready`. |
| Una puntuación mayor que 9.999.999 hace fallar el guardado por el `CHECK` de `scores`. | `SCORE_MAX` en el motor. |
| <Si hay assets: las rutas fallan en producción.> | <Rutas absolutas `/arcade/<ID>/…` desde `public/`, verificadas con `npm run build` y `npm run start`.> |
| <Riesgos propios del juego.> | <…> |

## Lo que **no** entra en este spec

- <Resumen en viñetas del «Fuera de alcance».>

Si alguna de estas llega, va en su propio spec.
```
