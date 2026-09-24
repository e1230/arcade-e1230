#!/usr/bin/env bash
# Hook PostToolUse: formatea con Prettier y revisa con ESLint cada archivo
# que Claude crea o edita dentro del proyecto.

# Ruta del archivo tocado, leída del JSON que Claude Code envía por stdin
file=$(jq -r '.tool_input.file_path // empty')

project_dir="${CLAUDE_PROJECT_DIR:-$(pwd)}"

# Nada que hacer si no hay ruta, el archivo no existe o está fuera del proyecto
[ -z "$file" ] && exit 0
[ -f "$file" ] || exit 0
case "$file" in
  "$project_dir"/*) ;;
  *) exit 0 ;;
esac

cd "$project_dir" || exit 0

# Prettier: ignora en silencio los tipos que no conoce y lo listado en .prettierignore
npx --no-install prettier --write --ignore-unknown --log-level warn "$file" >&2

# ESLint solo aplica a archivos JavaScript/TypeScript
case "$file" in
  *.js | *.jsx | *.ts | *.tsx | *.mjs | *.cjs)
    if ! output=$(FORCE_COLOR=0 npx --no-install eslint --fix --no-warn-ignored "$file" 2>&1); then
      # Exit 2 le devuelve los errores a Claude para que los corrija
      echo "ESLint encontró errores en $file que no pudo corregir automáticamente:" >&2
      echo "$output" >&2
      exit 2
    fi
    ;;
esac

exit 0
