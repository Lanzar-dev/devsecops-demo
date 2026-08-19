#!/usr/bin/env bash
# Boots the compiled server, checks /healthz, then shuts it down.
set -euo pipefail
export NVM_DIR="$HOME/.nvm"
# shellcheck disable=SC1091
. "$NVM_DIR/nvm.sh"
cd "$(dirname "$0")/.."

export NODE_ENV=production
export PORT=3055
export LOG_LEVEL=info
export REPOSITORY_DRIVER=memory
export JWT_SECRET=smoke-test-secret-value-that-is-long-enough-01
export CORS_ORIGINS=http://localhost:3055

node dist/server.js &
SERVER_PID=$!
cleanup() { kill "$SERVER_PID" 2>/dev/null || true; wait "$SERVER_PID" 2>/dev/null || true; }
trap cleanup EXIT

# Wait for the port to accept connections. Cold module loading from the
# Windows /mnt/c filesystem under WSL2 is slow, so allow a generous window.
for _ in $(seq 1 120); do
  if curl -sf -o /dev/null "http://localhost:${PORT}/healthz"; then break; fi
  sleep 1
done

STATUS=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:${PORT}/healthz" || echo 000)
echo "healthz status: ${STATUS}"
test "${STATUS}" = "200"
echo "SMOKE OK"
