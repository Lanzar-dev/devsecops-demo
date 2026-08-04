#!/usr/bin/env bash
# Runs a command with the nvm-managed Node on PATH, from the repo root.
# Usage: bash scripts/node-run.sh npm install
set -euo pipefail
export NVM_DIR="$HOME/.nvm"
# shellcheck disable=SC1091
. "$NVM_DIR/nvm.sh"
cd "$(dirname "$0")/.."
exec "$@"
