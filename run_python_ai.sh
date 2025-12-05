#!/usr/bin/env bash
set -euo pipefail

# Simple runner for the Python AI (Flask) service on port 5000
# Requires Python 3.9+ installed on your system.

PROJECT_ROOT="$(cd "$(dirname "$0")" && pwd)"
cd "$PROJECT_ROOT"

# Create and use a local virtual environment
if [[ ! -d .venv ]]; then
  python3 -m venv .venv
fi
source .venv/bin/activate

# Upgrade pip and install runtime deps
python -m pip install --upgrade pip >/dev/null
pip install --quiet flask python-dotenv openai

# Warn if API key missing (OpenAI) — script will still run, but /__ai__ will fail without it
if [[ -z "${api_key:-}" ]]; then
  echo "[WARN] Environment variable 'api_key' is not set. The /__ai__ endpoint will fail without it." >&2
  echo "       Export it before running: export api_key=YOUR_OPENAI_API_KEY" >&2
fi

echo "Starting Python AI (Flask) on http://127.0.0.1:5000 ..."
exec python base.py
