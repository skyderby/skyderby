#!/usr/bin/env bash
set -euo pipefail

INPUT=$(cat)
WORKTREE_PATH=$(echo "$INPUT" | jq -r '.worktree_path')
PORTS_FILE="$HOME/.ports-registry"

if [ -f "$PORTS_FILE" ]; then
  grep -v "$WORKTREE_PATH" "$PORTS_FILE" > "$PORTS_FILE.tmp" || true
  mv "$PORTS_FILE.tmp" "$PORTS_FILE"
fi
