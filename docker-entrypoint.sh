#!/usr/bin/env bash
set -euo pipefail

# Load environment variables from /app/.env if present (e.g., api_key)
if [[ -f "/app/.env" ]]; then
  echo "[entrypoint] Loading environment from /app/.env"
  set -a
  source /app/.env
  set +a
fi

# Diagnostics
echo "[entrypoint] Java version:"; java -version || true
echo "[entrypoint] Python version:"; python3 --version || true
echo "[entrypoint] Node version:"; node -v || true
echo "[entrypoint] npm version:"; npm -v || true

# Map api_key if needed
if [[ -n "${api_key:-}" && -z "${OPENAI_API_KEY:-}" ]]; then
  export OPENAI_API_KEY="${api_key}"
fi

if [[ -n "${OPENAI_API_KEY:-}" ]]; then
  echo "[entrypoint] OPENAI_API_KEY detected in environment."
else
  echo "[entrypoint] WARNING: No OpenAI key set."
fi

# Forward signals to children
term_handler() {
  echo "[entrypoint] Caught termination signal, stopping services..."
  kill "$PY_PID" "$KT_PID" "$REACT_PID" 2>/dev/null || true
}
trap term_handler SIGTERM SIGINT

# Start Flask AI
echo "[entrypoint] Starting Python AI (Flask) on port 5000..."
python3 /app/base.py &
PY_PID=$!

# Start Kotlin API
echo "[entrypoint] Building and starting Kotlin API (Gradle run)..."
cd /app/api
./gradlew --no-daemon run &
KT_PID=$!

# Start React dev server
echo "[entrypoint] Starting React app on port 3000..."
cd /app/frontend  # adjust if your React app is elsewhere
npm install
npm start &
REACT_PID=$!

echo "[entrypoint] Services started. Python PID=$PY_PID, Kotlin PID=$KT_PID, React PID=$REACT_PID"

# Wait for any process to exit
set +e
wait -n "$PY_PID" "$KT_PID" "$REACT_PID"
exit_code=$?
set -e

echo "[entrypoint] Process exit detected. Exit code=$exit_code"

# Kill remaining processes
kill "$PY_PID" "$KT_PID" "$REACT_PID" 2>/dev/null || true
wait || true
exit "$exit_code"
