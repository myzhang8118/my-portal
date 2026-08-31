#!/bin/bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"
MSG="${1:-release $(date -Is)}"
git add -A
if git diff --cached --quiet; then
  echo "??????????"
  exit 0
fi
git commit --trailer "Co-authored-by: Cursor <cursoragent@cursor.com>" -m "$MSG"
if [[ -n "${2:-}" ]]; then
  git tag -a "$2" -m "$MSG" 2>/dev/null || git tag -f "$2"
  echo "??: $2"
fi
"$ROOT/scripts/deploy-local.sh"
echo "release OK: $(git rev-parse --short HEAD)  $(git log -1 --oneline)"
