#!/bin/sh
set -eu

# Next rewrites are generated at build time. Patch only the Vexa destination
# in the standalone manifest so the same image can target legacy or upstream
# Vexa during the reversible migration.
if [ -n "${VEXA_API_URL:-}" ]; then
  for file in \
    /app/apps/web/.next/required-server-files.json \
    /app/apps/web/.next/routes-manifest.json; do
    if [ -f "$file" ]; then
      sed -i "s|http://host.docker.internal:8056|${VEXA_API_URL}|g" "$file"
    fi
  done
fi

exec node /app/apps/web/server.js

