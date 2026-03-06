#!/usr/bin/env bash
set -euo pipefail

INPUT=$(cat)
NAME=$(echo "$INPUT" | jq -r '.name')
CWD=$(echo "$INPUT" | jq -r '.cwd')

WORKTREE_DIR="$HOME/code/worktrees/$NAME"
PORTS_FILE="$HOME/.ports-registry"

mkdir -p "$(dirname "$WORKTREE_DIR")"
git -C "$CWD" worktree add "$WORKTREE_DIR" -b "$NAME" HEAD >&2

for file in .env .kamal/secrets config/credentials/production.key config/application.yml; do
  if [ -f "$CWD/$file" ]; then
    mkdir -p "$WORKTREE_DIR/$(dirname "$file")"
    ln -sf "$CWD/$file" "$WORKTREE_DIR/$file"
  fi
done

touch "$PORTS_FILE"

allocate_port() {
  local port=$1
  while grep -q "^$port " "$PORTS_FILE" 2>/dev/null || lsof -i ":$port" >/dev/null 2>&1; do
    port=$((port + 1))
  done
  echo "$port"
}

RAILS_PORT=$(allocate_port 3000)
echo "$RAILS_PORT $WORKTREE_DIR rails" >> "$PORTS_FILE"
WEBPACK_PORT=$(allocate_port 3135)
echo "$WEBPACK_PORT $WORKTREE_DIR webpack" >> "$PORTS_FILE"

cat > "$WORKTREE_DIR/.env.local" <<EOF
PORT=$RAILS_PORT
WEBPACKER_DEV_SERVER_PORT=$WEBPACK_PORT
EOF

cat > "$WORKTREE_DIR/Procfile.local" <<EOF
web: bin/rails server -p $RAILS_PORT
webpack: WEBPACKER_DEV_SERVER_PORT=$WEBPACK_PORT bin/webpacker-dev-server
scanner: docker inspect --format='{{.State.Running}}' track-scanner 2>/dev/null | grep -q true || (docker rm -f track-scanner 2>/dev/null; docker run -d -p 8000:80 --name track-scanner skyderby/track-scanner >&2); echo "Scanner running"
ngrok: ngrok http $RAILS_PORT
EOF

cd "$WORKTREE_DIR"
yarn install >&2
bundle install >&2

echo "$WORKTREE_DIR"
