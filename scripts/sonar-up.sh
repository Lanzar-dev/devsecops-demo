#!/usr/bin/env bash
set -euo pipefail

echo "Starting SonarQube locally..."
docker compose -f compose.sonarqube.yaml up -d

echo
echo "SonarQube UI: http://127.0.0.1:9000"
echo "Default login: admin / admin"
echo "Once logged in, create a token and export it as SONAR_TOKEN before running the scanner."
