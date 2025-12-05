#!/usr/bin/env bash
set -euo pipefail

# Load environment variables from /app/.env if present (e.g., api_key)
if [[ -f "/app/.env" ]]; then
  echo "[entrypoint] Loading environment from /app/.env"
  set -a
  # shellcheck disable=SC1091
  source /app/.env
  set +a
fi

# Basic diagnostics
echo "[entrypoint] Java version:"; java -version || true
echo "[entrypoint] Python version:"; python3 --version || true

# Ensure compatibility: if api_key is set but OPENAI_API_KEY is not, map it.
if [[ -n "${api_key:-}" && -z "${OPENAI_API_KEY:-}" ]]; then
  export OPENAI_API_KEY="${api_key}"
fi

if [[ -n "${OPENAI_API_KEY:-}" ]]; then
  echo "[entrypoint] OPENAI_API_KEY detected in environment."
elif [[ -n "${api_key:-}" ]]; then
  echo "[entrypoint] api_key detected and mapped to OPENAI_API_KEY."
else
  echo "[entrypoint] WARNING: No OpenAI key set (OPENAI_API_KEY or api_key). /__ai__ will return 500 until provided."
fi

# Forward signals to children (Python Flask and Kotlin API)
term_handler() {
  echo "[entrypoint] Caught termination signal, stopping services..."
  if [[ -n "${PY_PID:-}" ]] && kill -0 "$PY_PID" 2>/dev/null; then
    kill "$PY_PID" || true
  fi
  if [[ -n "${KT_PID:-}" ]] && kill -0 "$KT_PID" 2>/dev/null; then
    kill "$KT_PID" || true
  fi
}
trap term_handler SIGTERM SIGINT

echo "[entrypoint] Starting Python AI (Flask) on port 5000..."
python3 /app/base.py &
PY_PID=$!

echo "[entrypoint] Building and starting Kotlin API (Gradle run)..."
cd /app/api
./gradlew --no-daemon run &
KT_PID=$!

echo "[entrypoint] Services started. Python PID=$PY_PID, Kotlin PID=$KT_PID"

# Wait for any process to exit
set +e
wait -n "$PY_PID" "$KT_PID"
exit_code=$?
exited_pid=$!
set -e
echo "[entrypoint] Process exit detected. Exit code=$exit_code"

# If one exits, shut down the other
if kill -0 "$PY_PID" 2>/dev/null; then kill "$PY_PID" || true; fi
if kill -0 "$KT_PID" 2>/dev/null; then kill "$KT_PID" || true; fi

wait || true
exit "$exit_code"
