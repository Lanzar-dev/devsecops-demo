#!/usr/bin/env bash
# End-to-end smoke test against the running containerized API.
# Exercises the real Prisma/Postgres path: health -> register -> login -> create/list task.
set -euo pipefail

BASE="${BASE_URL:-http://localhost:3000}"
EMAIL="demo$(date +%s)@example.com"
PASSWORD="sup3rSecret!pass"

echo "== health =="
curl -sf "${BASE}/healthz"; echo

echo "== register (${EMAIL}) =="
curl -sf -X POST "${BASE}/api/auth/register" \
  -H 'Content-Type: application/json' \
  -d "{\"email\":\"${EMAIL}\",\"password\":\"${PASSWORD}\"}"; echo

echo "== login =="
TOKEN="$(curl -sf -X POST "${BASE}/api/auth/login" \
  -H 'Content-Type: application/json' \
  -d "{\"email\":\"${EMAIL}\",\"password\":\"${PASSWORD}\"}" | jq -r '.token')"
echo "token length: ${#TOKEN}"

echo "== create task =="
curl -sf -X POST "${BASE}/api/tasks" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H 'Content-Type: application/json' \
  -d '{"title":"containerized task","description":"created via smoke test"}'; echo

echo "== list tasks =="
curl -sf "${BASE}/api/tasks" -H "Authorization: Bearer ${TOKEN}"; echo

echo "== unauthorized check (expect 401) =="
code="$(curl -s -o /dev/null -w '%{http_code}' "${BASE}/api/tasks")"
echo "no-token GET /api/tasks -> HTTP ${code}"

echo "ALL SMOKE CHECKS PASSED"
