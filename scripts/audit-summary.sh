#!/usr/bin/env bash
# Prints a concise per-advisory severity summary from `npm audit --json`.
set -euo pipefail
export NVM_DIR="$HOME/.nvm"
# shellcheck disable=SC1091
. "$NVM_DIR/nvm.sh"
cd "$(dirname "$0")/.."
npm audit --json \
  | jq -r '.vulnerabilities | to_entries[] | "\(.value.severity)\t\(.key)\tfixAvailable=\(.value.fixAvailable|type)"' \
  | sort
