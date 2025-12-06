#!/usr/bin/env bash
set -euo pipefail

# Load environment variables from .env if present
if [[ -f "/app/.env" ]]; then
  echo "[flask-entrypoint] Loading environment from .env"
  set -a
  source /app/.env
  set +a
fi

# Map api_key if needed
if [[ -n "${api_key:-}" && -z "${OPENAI_API_KEY:-}" ]]; then
  export OPENAI_API_KEY="${api_key}"
fi

# Diagnostics
echo "[flask-entrypoint] OPENAI_API_KEY=${OPENAI_API_KEY:-not set}"
echo "[flask-entrypoint] PAGE_ACCESS_TOKEN=${PAGE_ACCESS_TOKEN:-not set}"
echo "[flask-entrypoint] VERIFY_TOKEN=${VERIFY_TOKEN:-not set}"

# Start Flask
exec python3 base.py
