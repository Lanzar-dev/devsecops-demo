#!/usr/bin/env bash
# Install Trivy (container/filesystem vulnerability scanner) into ~/.local/bin.
# No sudo required. Idempotent.
set -euo pipefail

BIN_DIR="${HOME}/.local/bin"
mkdir -p "${BIN_DIR}"

if command -v trivy >/dev/null 2>&1; then
  echo "trivy already installed: $(trivy --version | head -1)"
  exit 0
fi

echo "Installing trivy into ${BIN_DIR} ..."
curl -sfL https://raw.githubusercontent.com/aquasecurity/trivy/main/contrib/install.sh \
  | sh -s -- -b "${BIN_DIR}"

export PATH="${BIN_DIR}:${PATH}"
trivy --version | head -1
echo "Done. Ensure ${BIN_DIR} is on your PATH."
