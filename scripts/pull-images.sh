#!/usr/bin/env bash
# Pulls images with retries to work around flaky Docker Desktop/WSL DNS.
set -uo pipefail
images=("docker/dockerfile:1" "node:22-bookworm-slim" "postgres:16-alpine")
for img in "${images[@]}"; do
  ok=0
  for attempt in 1 2 3 4 5; do
    echo ">> pulling ${img} (attempt ${attempt})"
    if docker pull "${img}"; then ok=1; break; fi
    sleep 3
  done
  if [ "${ok}" -ne 1 ]; then
    echo "FAILED to pull ${img}" >&2
    exit 1
  fi
done
echo "ALL IMAGES PULLED"
