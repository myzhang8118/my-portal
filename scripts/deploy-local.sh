#!/bin/bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT/backend"
if [[ -f package-lock.json ]]; then npm ci --omit=dev; else npm install --omit=dev; fi
cd "$ROOT/frontend"
if [[ -f package-lock.json ]]; then npm ci; else npm install; fi
npm run build
pm2 restart my-portal --update-env
echo "deploy-local: OK ($(date -Is))"
