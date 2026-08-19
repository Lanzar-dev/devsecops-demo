#!/usr/bin/env bash
# Creates/applies a Prisma migration against the local compose Postgres.
# Usage: bash scripts/migrate-dev.sh [migration_name]
set -euo pipefail
export NVM_DIR="$HOME/.nvm"
# shellcheck disable=SC1091
. "$NVM_DIR/nvm.sh"
cd "$(dirname "$0")/.."
export DATABASE_URL="postgresql://taskuser:devpassword@localhost:5432/tasks?schema=public"
npx prisma migrate dev --name "${1:-init}"
