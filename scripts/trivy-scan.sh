#!/usr/bin/env bash
# Trivy image scan wrapper.
# Prints the full HIGH/CRITICAL picture, then the ACTIONABLE (fixable) subset
# that a CI gate should actually fail on.
set -euo pipefail

export PATH="${HOME}/.local/bin:${PATH}"
IMAGE="${1:-devsecops_demo-api:latest}"

echo "############################################"
echo "# Trivy scan: ${IMAGE}"
echo "############################################"

echo
echo "===== ALL HIGH/CRITICAL (informational) ====="
trivy image --scanners vuln --severity HIGH,CRITICAL --no-progress "${IMAGE}" 2>/dev/null \
  | grep -E '\(debian|node-pkg\)|^Total:' || true

echo
echo "===== ACTIONABLE: fixable HIGH/CRITICAL (CI gate) ====="
# --ignore-unfixed drops CVEs with no upstream fix (will_not_fix / fix_deferred / affected).
trivy image --scanners vuln --severity HIGH,CRITICAL --ignore-unfixed \
  --no-progress "${IMAGE}" 2>/dev/null
