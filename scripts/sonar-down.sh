#!/usr/bin/env bash
set -euo pipefail

echo "Stopping SonarQube containers..."
docker compose -f compose.sonarqube.yaml down
