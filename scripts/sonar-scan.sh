#!/usr/bin/env bash
set -euo pipefail

SONAR_URL="${SONAR_URL:-http://host.docker.internal:9000}"
SONAR_TOKEN="${SONAR_TOKEN:-}"
PROJECT_KEY="${PROJECT_KEY:-devsecops-demo}"
PROJECT_NAME="${PROJECT_NAME:-devsecops-demo}"

if [[ -z "$SONAR_TOKEN" ]]; then
  echo "Set SONAR_TOKEN first, for example:"
  echo "  SONAR_TOKEN=<your-token> ./scripts/sonar-scan.sh"
  exit 1
fi

PROJECT_DIR="$(pwd -P)"

echo "Scanning with SonarQube at $SONAR_URL"
echo "Mounting project directory: $PROJECT_DIR"
docker run --rm \
  -e SONAR_HOST_URL="$SONAR_URL" \
  -e SONAR_TOKEN="$SONAR_TOKEN" \
  -v "$PROJECT_DIR:/workspace" \
  -w /workspace \
  sonarsource/sonar-scanner-cli:latest \
  -Dsonar.projectKey="$PROJECT_KEY" \
  -Dsonar.projectName="$PROJECT_NAME" \
  -Dsonar.projectBaseDir=/workspace \
  -Dsonar.sources=src,tests \
  -Dsonar.exclusions='**/node_modules/**,**/dist/**,**/coverage/**,**/prisma/**,**/*.test.ts' \
  -Dsonar.sourceEncoding=UTF-8 \
  -Dsonar.scm.provider=git
