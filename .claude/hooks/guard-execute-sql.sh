#!/usr/bin/env bash
# Hook PreToolUse de mcp__supabase__execute_sql: solo deja pasar SQL de lectura.
# Cualquier cambio en la base de desarrollo se hace con apply_migration y se
# guarda en db/production/migrations/ para aplicarlo después en producción.

query=$(jq -r '.tool_input.query // empty')
[ -z "$query" ] && exit 0

# Normaliza: quita comentarios y literales de texto (para no confundir una
# palabra dentro de un string con una sentencia) y pasa a minúsculas
normalized=$(printf '%s' "$query" \
  | sed -E 's/--.*$//' \
  | tr '\n' ' ' \
  | sed -E 's#/\*([^*]|\*+[^*/])*\*+/# #g' \
  | sed -E "s/'([^']|'')*'/''/g" \
  | tr '[:upper:]' '[:lower:]')

write_pattern='(^|[^a-z0-9_])(insert|update|delete|merge|upsert|truncate|create|alter|drop|grant|revoke|comment[[:space:]]+on|security[[:space:]]+label|reindex|cluster|vacuum|refresh[[:space:]]+materialized|copy|call|do|lock|import[[:space:]]+foreign|reassign|select[^;]*[[:space:]]into|setval|nextval|pg_terminate_backend|pg_cancel_backend|set_config|set[[:space:]]+(role|session))([^a-z0-9_]|$)'

if printf '%s' "$normalized" | grep -Eq "$write_pattern"; then
  cat >&2 <<'EOF'
Bloqueado: execute_sql solo se usa para consultas de lectura (select, explain sin analyze, pg_catalog).
Todo cambio en la base de desarrollo (esquema, datos, políticas, permisos o funciones) se aplica con
mcp__supabase__apply_migration y se guarda con el mismo SQL en
db/production/migrations/<version>_<name>.sql (version y name de list_migrations).
Si es una consulta de solo lectura que el filtro confundió, reescríbela sin esas palabras clave.
EOF
  exit 2
fi

exit 0
