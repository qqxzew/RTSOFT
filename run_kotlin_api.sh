#!/usr/bin/env bash
set -euo pipefail

# Runner for the Kotlin API using Gradle wrapper

PROJECT_ROOT="$(cd "$(dirname "$0")" && pwd)"
cd "$PROJECT_ROOT/api"

echo "Building and starting Kotlin API ..."
exec ./gradlew run
