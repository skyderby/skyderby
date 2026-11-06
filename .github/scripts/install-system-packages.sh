#!/usr/bin/env bash
set -u

apt() {
  timeout 180 sudo apt-get -o Acquire::Retries=3 -o Acquire::http::Timeout=30 "$@"
}

for attempt in 1 2 3; do
  apt update && apt install -y libeccodes-dev libvips-dev && exit 0
  echo "apt-get attempt $attempt failed, retrying" >&2
  sleep 10
done

exit 1
