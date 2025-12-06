#!/usr/bin/env bash
set -euo pipefail

# Load environment variables from .env if present
if [[ -f "/app/.env" ]]; then
  echo "[kotlin-entrypoint] Loading environment from .env"
  set -a
  source /app/.env
  set +a
fi

# Diagnostics
echo "[kotlin-entrypoint] OPENAI_API_KEY=${OPENAI_API_KEY:-not set}"
echo "[kotlin-entrypoint] PAGE_ACCESS_TOKEN=${PAGE_ACCESS_TOKEN:-not set}"
echo "[kotlin-entrypoint] VERIFY_TOKEN=${VERIFY_TOKEN:-not set}"

# Run Gradle app
exec ./gradlew run
