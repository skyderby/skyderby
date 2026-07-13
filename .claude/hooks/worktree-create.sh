#!/usr/bin/env bash
set -euo pipefail

if [ -d "$HOME/.asdf/shims" ]; then
  export PATH="$HOME/.asdf/shims:$PATH"
fi

INPUT=$(cat)
NAME=$(echo "$INPUT" | jq -r '.name')
CWD=$(echo "$INPUT" | jq -r '.cwd')

WORKTREE_DIR="$HOME/code/worktrees/$NAME"

mkdir -p "$(dirname "$WORKTREE_DIR")"

if git -C "$CWD" worktree list --porcelain | grep -qxF "worktree $WORKTREE_DIR"; then
  echo "Worktree already exists at $WORKTREE_DIR, reusing" >&2
elif [ -e "$WORKTREE_DIR" ]; then
  echo "Path $WORKTREE_DIR exists but is not a registered worktree" >&2
  exit 1
elif git -C "$CWD" show-ref --verify --quiet "refs/heads/$NAME"; then
  git -C "$CWD" worktree add "$WORKTREE_DIR" "$NAME" >&2
else
  git -C "$CWD" worktree add "$WORKTREE_DIR" -b "$NAME" HEAD >&2
fi

for file in .env .kamal/secrets config/credentials/production.key config/application.yml; do
  if [ -f "$CWD/$file" ]; then
    mkdir -p "$WORKTREE_DIR/$(dirname "$file")"
    ln -sf "$CWD/$file" "$WORKTREE_DIR/$file"
  fi
done

if [ -f "$CWD/Procfile.local" ]; then
  ln -sf "$CWD/Procfile.local" "$WORKTREE_DIR/Procfile.local"
else
  cat > "$WORKTREE_DIR/Procfile.local" <<'EOF'
web: bin/rails server -p $WEB_PORT
webpack: WEBPACKER_DEV_SERVER_PORT=$((WEB_PORT + 100)) bin/webpacker-dev-server
EOF
fi

cd "$WORKTREE_DIR"
yarn install >&2
bundle install >&2

echo "$WORKTREE_DIR"
