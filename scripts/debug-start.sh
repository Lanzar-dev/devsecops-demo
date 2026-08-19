#!/usr/bin/env bash
set -uo pipefail
export NVM_DIR="$HOME/.nvm"
# shellcheck disable=SC1091
. "$NVM_DIR/nvm.sh"
cd "$(dirname "$0")/.."

export NODE_ENV=production
export PORT=3055
export REPOSITORY_DRIVER=memory
export JWT_SECRET=smoke-test-secret-value-that-is-long-enough-01
export CORS_ORIGINS=http://localhost:3055

node dist/server.js >/tmp/server.log 2>&1 &
SERVER_PID=$!
sleep 2
echo "--- curl healthz ---"
curl -sS -i "http://localhost:${PORT}/healthz" || echo "curl failed"
echo ""
echo "--- server.log ---"
cat /tmp/server.log
echo "--- alive check ---"
if kill -0 "$SERVER_PID" 2>/dev/null; then echo "process alive"; else echo "process dead"; fi
kill "$SERVER_PID" 2>/dev/null || true
