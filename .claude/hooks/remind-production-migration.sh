#!/usr/bin/env bash
# Hook PostToolUse de mcp__supabase__apply_migration: recuerda guardar la copia
# de la migración para producción en db/production/migrations/.

name=$(jq -r '.tool_input.name // "<name>"')

jq -n --arg name "$name" '{
  hookSpecificOutput: {
    hookEventName: "PostToolUse",
    additionalContext: ("Migración aplicada en dev. Ahora: (1) corre mcp__supabase__list_migrations para obtener el version de \"" + $name + "\"; (2) guarda exactamente el mismo SQL en db/production/migrations/<version>_" + $name + ".sql; (3) si cambiaron tablas, políticas, funciones o permisos, actualiza db/production/03-verify.sql; (4) si cambió el esquema, regenera lib/supabase/database.types.ts con generate_typescript_types.")
  }
}'
