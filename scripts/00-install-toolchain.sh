#!/usr/bin/env bash
# Installs the DevSecOps learning toolchain inside Ubuntu (WSL2).
# Idempotent: safe to re-run. Only 'apt' and binary installs use sudo.
# Node is installed per-user via nvm (no sudo).
set -euo pipefail

NODE_MAJOR="22"
KUBECTL_VERSION="v1.30.4"
MINIKUBE_VERSION="latest"
HELM_VERSION="v3.15.4"

log()  { printf '\n\033[1;34m==> %s\033[0m\n' "$1"; }
have() { command -v "$1" >/dev/null 2>&1; }

# ----------------------------------------------------------------------------
log "Updating apt and installing base packages"
sudo apt-get update -y
sudo apt-get install -y \
  ca-certificates curl wget gnupg git jq make unzip build-essential \
  apt-transport-https lsb-release

# ----------------------------------------------------------------------------
log "Installing GitHub CLI (gh)"
if ! have gh; then
  sudo mkdir -p -m 755 /etc/apt/keyrings
  wget -nv -O- https://cli.github.com/packages/githubcli-archive-keyring.gpg \
    | sudo tee /etc/apt/keyrings/githubcli-archive-keyring.gpg >/dev/null
  sudo chmod go+r /etc/apt/keyrings/githubcli-archive-keyring.gpg
  echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/githubcli-archive-keyring.gpg] https://cli.github.com/packages stable main" \
    | sudo tee /etc/apt/sources.list.d/github-cli.list >/dev/null
  sudo apt-get update -y
  sudo apt-get install -y gh
else
  echo "gh already installed: $(gh --version | head -n1)"
fi

# ----------------------------------------------------------------------------
log "Installing Node.js ${NODE_MAJOR}.x via nvm (per-user)"
export NVM_DIR="$HOME/.nvm"
if [ ! -s "$NVM_DIR/nvm.sh" ]; then
  curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash
fi
# shellcheck disable=SC1091
. "$NVM_DIR/nvm.sh"
nvm install "$NODE_MAJOR"
nvm alias default "$NODE_MAJOR"
nvm use default
echo "node: $(node --version)  npm: $(npm --version)"

# ----------------------------------------------------------------------------
log "Installing kubectl ${KUBECTL_VERSION}"
if ! have kubectl; then
  curl -fsSLO "https://dl.k8s.io/release/${KUBECTL_VERSION}/bin/linux/amd64/kubectl"
  sudo install -o root -g root -m 0755 kubectl /usr/local/bin/kubectl
  rm -f kubectl
else
  echo "kubectl already installed: $(kubectl version --client 2>/dev/null | head -n1)"
fi

# ----------------------------------------------------------------------------
log "Installing minikube (${MINIKUBE_VERSION})"
if ! have minikube; then
  curl -fsSLO "https://storage.googleapis.com/minikube/releases/${MINIKUBE_VERSION}/minikube-linux-amd64"
  sudo install minikube-linux-amd64 /usr/local/bin/minikube
  rm -f minikube-linux-amd64
else
  echo "minikube already installed: $(minikube version --short 2>/dev/null || minikube version | head -n1)"
fi

# ----------------------------------------------------------------------------
log "Installing Helm ${HELM_VERSION}"
if ! have helm; then
  curl -fsSL "https://get.helm.sh/helm-${HELM_VERSION}-linux-amd64.tar.gz" -o /tmp/helm.tgz
  tar -xzf /tmp/helm.tgz -C /tmp
  sudo install /tmp/linux-amd64/helm /usr/local/bin/helm
  rm -rf /tmp/helm.tgz /tmp/linux-amd64
else
  echo "helm already installed: $(helm version --short)"
fi

# ----------------------------------------------------------------------------
log "Toolchain summary"
for t in git gh node npm kubectl minikube helm jq make; do
  if have "$t"; then
    printf '  %-9s OK\n' "$t"
  else
    printf '  %-9s MISSING\n' "$t"
  fi
done

log "Done. Open a new shell (or 'source ~/.bashrc') so nvm/node are on PATH."
echo "Docker is provided by Docker Desktop; enable WSL integration for Ubuntu before Minikube."
