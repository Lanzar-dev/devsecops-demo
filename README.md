# DevSecOps Demo — Task Management API

A hands-on, cloud-free DevSecOps learning project. A TypeScript/Node.js REST API is
carried through a production-style pipeline with security gates, running entirely
on a local Minikube cluster.

## Learning objectives

- Secure Node.js/TypeScript application development
- Branch protection and PR-based workflow (`feature/*` → `dev` → `main`)
- Supply-chain security: dependency review, SBOM, image scanning
- SAST (CodeQL + SonarQube) and DAST (OWASP ZAP)
- Kubernetes deployment and hardening on Minikube
- Trusted local CI with a self-hosted runner

## Branching model

```
feature/*  fix/*  chore/*   ──PR──▶   dev   ──PR──▶   main
   (topic branches)                (integration)     (release)
```

- Direct pushes and force pushes to `dev`/`main` are blocked.
- Only `dev` may open a PR into `main`.
- Required checks (tests, security scans, staging deploy) gate every merge.

## Pipeline stages

| Stage | Runs on | Purpose |
| ----- | ------- | ------- |
| PR checks | GitHub-hosted | lint, typecheck, tests, `npm audit`, dependency review, CodeQL |
| `dev` deploy | Self-hosted (local) | SonarQube quality gate, image build/scan, staging deploy, ZAP |
| `main` deploy | Self-hosted (local) | promote the tested image to production namespace |

## Prerequisites

- Windows + WSL2 (Ubuntu) + Docker Desktop (WSL integration enabled)
- Node.js 22 (via `nvm`), Minikube, kubectl, Helm, GitHub CLI

Run `scripts/00-install-toolchain.sh` inside Ubuntu to install the toolchain.

## Status

Project is under active, phased construction. See the implementation phases in the
project plan.
