---
name: spec-impl-game
description: Implementa un spec de juego aprobado (specs/NN-<id>-game.md) con el mismo flujo de /spec-impl (valida el estado, crea la rama spec-NN-slug e implementa paso a paso con pausas para revisar diffs) y, al terminar, lanza en cadena al subagente skin-designer y después a mobile-porter para ese juego.
disable-model-invocation: true
argument-hint: <NN-id-game>
allowed-tools: Read, Glob, Grep, Edit, Write, AskUserQuestion, Agent, Bash(git status:*), Bash(git branch:*), Bash(git checkout:*), Bash(git log:*), Bash(git diff:*), Bash(git stash:*), Bash(cat:*), Bash(ls:*)
---

# /spec-impl-game — Implementar un juego y prepararlo con skins y controles táctiles

## Contexto de la sesión

Estado actual del repositorio:
!`git status --short`

Rama actual:
!`git branch --show-current`

Specs disponibles:
!`ls specs/ 2>/dev/null || echo "La carpeta specs/ no existe"`

Configuración de creación de ramas:
!`cat specs/.spec-config.yml 2>/dev/null || echo "AutoCreateBranch: true (por defecto, sin archivo de configuración)"`

---

## Instrucciones

Este comando es `/spec-impl` más dos agentes al final. **No repite sus reglas: las toma de su propio archivo**, para que haya una sola fuente de verdad.

El argumento recibido es: `$ARGUMENTS`

### Fases 1 a 4 — Igual que `/spec-impl`

1. Lee `.agents/skills/spec-impl/SKILL.md` completo con la herramienta Read.
2. Sigue sus **Fases 1, 2, 3 y 4 al pie de la letra**, con `$ARGUMENTS` como argumento y el contexto de sesión de arriba (es el mismo que inyecta `/spec-impl`). Eso incluye: aceptar solo specs Aprobados con su mensaje de error estándar, crear o retomar la rama `spec-NN-slug` según `AutoCreateBranch`, mostrar el resumen, esperar la confirmación antes del Paso 1, pausar después de cada paso y **no hacer nunca un commit automático**.

Agregados propios de los juegos, que se suman a esas fases:

- **Fase 1 — Tiene que ser un spec de juego.** El archivo debe llamarse `specs/NN-<id>-game.md`. Si el spec encontrado no es de juego (por ejemplo `10-asteroids-skins.md`), detente antes de la Fase 2 y responde:

  ```
  ❌ Este comando solo implementa specs de juego (specs/NN-<id>-game.md).
  Para «<archivo>» usa /spec-impl <NN-slug>.
  ```

  Si el spec está en `specs/game-jam/<id>/`, no lo implementes desde ahí: recuerda que primero hay que promoverlo con `git mv` a `specs/NN-<id>-game.md`, con el encabezado `# SPEC NN — …` y el estado Aprobado (ver `CLAUDE.md`).

- **Fase 1 — El `id` del juego.** Sácalo del nombre del archivo (`NN-<id>-game.md` → `<id>`). Si el spec declara otro id (en la fila de `games` o en `lib/arcade/<id>/`), manda el del spec. Muéstralo en el resumen de la Fase 3 como una línea más: `Juego:  <id>`.

- **Fase 4 — Mensaje final.** Cuando termines el último paso y muestres su resumen, en lugar de cerrar con el mensaje final de `/spec-impl`, di:

  ```
  Paso N completado. ¿Revisas el diff? Si lo apruebas, cierro la implementación
  y lanzo skin-designer y después mobile-porter para <id>.
  ```

  Espera la aprobación. Si el usuario pide cambios, hazlos y vuelve a pedirla. Si la implementación se detiene antes del último paso, **no lances ningún agente**.

### Fase 5 — Agentes en cadena

Corre solo cuando el usuario aprueba el diff del último paso. No vuelvas a preguntar.

1. **Muestra el cierre de `/spec-impl`:**

   ```
   ✅ Todos los pasos del plan están implementados.
   ```

2. **Comprueba el motor.** Lee `lib/arcade/registry.ts` y verifica que `<id>` está en `DEFINITIONS`. Si no está, detente: los dos agentes solo trabajan con juegos con motor. Dilo y no lances nada.

3. **Lanza `skin-designer`** con la herramienta Agent: `subagent_type: "skin-designer"`, `description: "Skins de <id>"` y un prompt que pida el modo aplicar para ese único juego, por ejemplo `Aplica skins a <id>. Su motor se acaba de implementar con specs/NN-<id>-game.md.`

   **Espera la notificación de que terminó** antes de seguir. Mientras tanto no lances nada más. Transmite su resultado al usuario en pocas líneas: el spec de skins que escribió (en Borrador) o que el juego ya tenía skins.

4. **Recién entonces lanza `mobile-porter`**: `subagent_type: "mobile-porter"`, `description: "Táctil de <id>"`, prompt `Agrega controles táctiles a <id>.`. Espera la notificación y transmite su resultado: archivos tocados, si creó la base común y el mapeo táctil.

   Los dos agentes son independientes: si `skin-designer` falla o no escribe nada, igual lanza `mobile-porter` e informa el fallo. **Nunca los lances en paralelo** ni en el mismo mensaje.

5. **Cierre.** Sin hacer commit, termina con:

   ```
   ✅ Implementación de <id> lista.

   Siguientes pasos:
     1. Verifica uno por uno los criterios de aceptación de specs/NN-<id>-game.md.
        Si pasan, cambia su estado a «Implementado».
     2. Revisa el diff de mobile-porter (controles táctiles), que escribe código directo.
     3. El spec de skins de skin-designer queda en Borrador: revísalo, apruébalo
        e impleméntalo con /spec-impl.
     4. Haz el commit final antes de fusionar la rama.
   ```

   Adapta las líneas 2 y 3 a lo que de verdad hizo cada agente (por ejemplo, quita la 3 si el juego ya tenía skins).

---

## Resumen del comportamiento esperado

```
/spec-impl-game 11-pacman-game   (estado: Aprobado)

  Fases 1–4  →  Lo mismo que /spec-impl: rama spec-11-pacman-game, resumen
                y pasos con pausa. Juego: pacman
  Último paso →  El usuario aprueba el diff
  Fase 5      →  registry.ts tiene pacman ✅
                 skin-designer «Aplica skins a pacman» → espera → resumen
                 mobile-porter «Agrega controles táctiles a pacman» → espera → resumen
                 Cierre sin commit

/spec-impl-game 10-asteroids-skins

  Fase 1  →  No es un spec de juego → ❌ sugiere /spec-impl 10-asteroids-skins
```
