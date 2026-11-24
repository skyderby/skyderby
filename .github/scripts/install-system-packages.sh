#!/usr/bin/env bash
set -u

apt() {
  sudo apt-get -o Acquire::Retries=3 -o Acquire::http::Timeout=30 "$@"
}

for attempt in 1 2 3; do
  timeout 180 apt update && apt install -y --no-install-recommends libeccodes-dev libvips42t64 && exit 0
  echo "apt-get attempt $attempt failed, retrying" >&2
  sleep 10
done

exit 1
