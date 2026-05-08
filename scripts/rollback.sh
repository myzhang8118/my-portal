#!/bin/bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
TARGET="${1:-}"
if [[ -z "$TARGET" ]]; then
  echo "??: $0 <commit|tag|??>"
  echo "??: $0 HEAD~1"
  echo "????: cd $ROOT && git log --oneline -n 20"
  exit 1
fi
cd "$ROOT"
git checkout "$TARGET"
"$ROOT/scripts/deploy-local.sh"
echo "????: $(git rev-parse --short HEAD)  $(git log -1 --oneline)"
