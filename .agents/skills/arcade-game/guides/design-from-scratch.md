# Diseñar un juego sin referencia

Cuando no hay carpeta en `references/started-games/`, no hay reglas que copiar: el spec tiene que definir el juego completo. El riesgo es un spec vago que deje la jugabilidad a la improvisación del implementador. Esta guía evita eso.

## Punto de partida

- **Juego del catálogo** (hoy `snake`, `pacman`, `invaders`, `frogger`, `galaga`): parte de su `long_description` y `short_description` en `games`. Propón una jugabilidad que cumpla lo que la descripción promete. Si la jugabilidad acordada no coincide (por ejemplo, la descripción menciona algo que queda fuera del MVP), pregunta si el spec incluye la migración `update_<id>_description` o si la descripción queda como está, como pasó con ASTEROIDS en el SPEC 05.
- **Juego nuevo:** pide primero una descripción de una o dos frases de cómo se juega. Si no cabe en dos frases, el juego es demasiado grande para un spec: propón un MVP y deja el resto para specs posteriores.

## Preguntas de diseño

Cubre todos estos temas en la Fase 4, además de los generales del skill. Propón siempre valores concretos, con tu recomendación basada en el clásico que se imita.

1. **Objetivo y fin de partida.** Qué hace el jugador, cómo pierde y si puede ganar. Si puede ganar, la puntuación de victoria se reporta con `onGameOver` igual que la de derrota.
2. **Entidades.** Qué objetos hay en pantalla (jugador, enemigos, proyectiles, obstáculos, ítems) y cómo se mueve cada uno.
3. **Controles.** Solo teclado, salvo que el usuario pida mouse. P queda reservada para la pausa de la plataforma. Espacio sirve para jugar, pero ya inicia la partida desde `StartScreen` (el filtro de `event.repeat` evita que la misma pulsación actúe dos veces). Máximo 5 o 6 acciones.
4. **Puntuación.** Tabla de puntos por acción. Multiplicadores por nivel, si los hay, con resultado entero.
5. **Vidas.** Cuántas, cómo se pierden, invencibilidad al reaparecer. Si el juego no tiene vidas, aplica las opciones de HUD de `engine-contract.md`.
6. **Niveles y dificultad.** Qué cambia al subir de nivel (velocidad, cantidad de enemigos, trazado) y con qué fórmula. Si hay un número fijo de niveles, qué pasa al terminar el último.
7. **Estilo.** Neón con los tokens del tema, como Asteroids, salvo que el usuario quiera otra cosa. Qué color lleva cada entidad (de `COLORS`).
8. **Alcance del MVP.** Por defecto quedan fuera el sonido, los controles táctiles, los power-ups complejos y los editores. Pregunta cuáles entran.

## Exigencias al spec

- **Cada constante numérica fijada en una tabla** (velocidades en px/s, tamaños en px, tiempos en s, probabilidades, puntos), como la tabla de constantes del SPEC 05. Nada de «ajustar a gusto», «un valor razonable» o «a definir en la implementación».
- Resolución interna 4:3 (800×600 por defecto) y todas las posiciones expresadas en esa resolución.
- Un «Estado interno de la partida» con su `Phase` y los campos del estado, como en el SPEC 05.
- **Criterios de jugabilidad verificables y con números**, uno por regla: «comer una fruta suma 10 puntos y alarga la serpiente 1 celda», «la velocidad sube de 8 a 9 celdas/s al pasar al nivel 2», «chocar con el borde quita una vida».
- Si una regla depende del azar, el criterio dice cómo se verifica (por ejemplo, «a más tardar en la quinta destrucción aparece…», como el power-up de Asteroids).
- En «Decisiones», cada regla que se eligió frente a una alternativa razonable, con la razón (por ejemplo: «Sí: la serpiente atraviesa los bordes. No: chocar con el borde. Lo eligió el usuario.»).
