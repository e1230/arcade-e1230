# GAME JAM — CRUCE

> **Tema:** «cruzar»
> **Fecha:** 2026-09-30
> **Juego:** `cruce` · Puzles · acento `pink` · fila nueva en `games`

## Interpretación del tema

En CRUCE el jugador no cruza: **hace cruzar**. Maneja el semáforo de un cruce de calles y decide en cada instante qué eje tiene el verde y quién espera. Cada auto que atraviesa el cruce suma puntos, y lo que distingue a un buen jugador es cuánto tiempo hace esperar a los demás y si la cola de una calle llega a desbordarse. El tema está en el cruce mismo: quién cruza primero y a qué costo.

**En qué se diferencia de FROGGER** (que sigue como pendiente del catálogo): en FROGGER el jugador es el bicho que salta de celda en celda entre carriles de tráfico y troncos hasta una casilla de meta. En CRUCE el jugador no tiene avatar ni salta: controla las luces, y los que cruzan son los autos, que se mueven solos por carriles fijos con frenado, colas y zona de dilema. La habilidad es de gestión y de anticipación, no de esquivar.

## Variantes

| Variante | Archivo                                    | Gancho                                                                                                | Fin de partida                                                 | Progresión                                                              | ¿Amplía el contrato?                                                                          | Costo                                                                                           | Puntaje máximo práctico                         |
| -------- | ------------------------------------------ | ----------------------------------------------------------------------------------------------------- | -------------------------------------------------------------- | ----------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- | ----------------------------------------------- |
| A ★      | [`a-un-solo-cruce.md`](a-un-solo-cruce.md) | Un cruce, semáforo seguro con amarillo y despeje automático; decides cuándo cambiar, sin choques      | 3 vidas: se pierde una por cada atasco (cola desbordada 2,5 s) | Continua: nivel cada 15 autos, más tráfico y autobuses desde el nivel 3 | No                                                                                            | Bajo (7 módulos, sin tocar componentes compartidos)                                             | 10.000 a 20.000 (tope `SCORE_MAX` inalcanzable) |
| B        | [`b-red-de-cruces.md`](b-red-de-cruces.md) | Red de 2×2 cruces con una tecla por cruce; cambio instantáneo con choques posibles; puntos por espera | Contra reloj de 120 s, sin vidas                               | 4 oleadas fijas de 30 s con intervalos de aparición de 5,0 a 2,6 s      | Sí, con campos opcionales: `onTime?` en `GameCallbacks` y `time?` en `GameHud` (celda TIEMPO) | Alto (8 carriles, 4 cruces, choques, regla de no bloquear el cruce y 4 componentes compartidos) | 15.000 a 22.000 (cota dura de unos 47.000)      |

## Recomendada

**A — Un solo cruce.** Es la más barata, no toca el contrato ni ningún componente compartido y todas sus reglas se pueden verificar con números (colas de 7 y 5 autos, atasco a los 2,5 s, 15 autos por nivel). Además su tensión es fácil de leer: una sola decisión, cuándo cambiar, con una consecuencia visible y una barra que avisa antes de perder. B es más profunda y espectacular, pero su dificultad no se puede afinar sin jugarla (oleadas, ventana de choque de unos 0,4 s), toca cuatro archivos compartidos y conviene hacerla como segundo paso, cuando A ya esté en la plataforma.

## Ideas descartadas

- **Rana que cruza carriles, troncos y tortugas:** es la mecánica central de FROGGER, que está pendiente en el catálogo (`frogger`, orden 7). Falla el filtro duro.
- **Gallina que cruza una autopista infinita (tipo Crossy Road):** saltar casilla a casilla entre carriles de tráfico es la misma mecánica de FROGGER con otro fondo. Falla el filtro duro.
- **Cruzar el río pisando piedras que se hunden:** saltar de casilla en casilla hacia la otra orilla es también la mecánica de FROGGER. Falla el filtro duro.
- **Equilibrista que cruza un abismo por una cuerda floja:** pasa el filtro, pero el control de equilibrio (un péndulo invertido con viento) no se puede fijar con números verificables sin jugarlo, y el riesgo de dejar un juego injugable es alto. Queda como idea para otra game jam.
- **Constructor de puentes (caravana que camina y el jugador coloca tablones):** para colocar piezas con precisión hace falta cursor, y con teclado el control es torpe; el mouse solo puede ser un extra. Además su MVP no cabe en dos frases.
- **Puzle de cruzar cables sin que se toquen (tipo Planarity):** se juega arrastrando con el mouse. Falla «se juega con teclado».

## Cómo pasar a implementación

1. Revisar las variantes y elegir una.
2. Promoverla: `git mv specs/game-jam/cruce/<archivo>.md specs/NN-cruce-game.md`, donde `NN` es el mayor número de `specs/` más uno.
3. En el spec promovido, cambiar el encabezado a `# SPEC NN — CRUCE jugable en el Reproductor`, quitar la línea «Game jam» y cambiar el estado a **Aprobado**.
4. Implementarlo con `/spec-impl NN-cruce-game`. `/spec-impl` solo busca en `specs/`, por eso el paso 2 es necesario.

Las variantes que no se eligen quedan en esta carpeta como registro de la game jam.
