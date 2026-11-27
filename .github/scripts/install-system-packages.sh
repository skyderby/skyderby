#!/usr/bin/env bash
set -u

packages=(libeccodes-dev libvips42t64)
archives=$1

if [ "${CACHE_HIT:-}" = "true" ] && sudo dpkg -i "$archives"/*.deb; then
  exit 0
fi

mkdir -p "$archives/partial"
options=(
  -o Acquire::Retries=3
  -o Acquire::http::Timeout=30
  -o Dir::Cache::archives="$archives"
  -o APT::Keep-Downloaded-Packages=true
)

for attempt in 1 2 3; do
  if sudo timeout 180 apt-get "${options[@]}" update &&
     sudo apt-get "${options[@]}" install -y --no-install-recommends "${packages[@]}"; then
    sudo rm -rf "$archives/partial" "$archives/lock"
    sudo chown -R "$(id -u):$(id -g)" "$archives"
    exit 0
  fi
  echo "apt-get attempt $attempt failed, retrying" >&2
  sleep 10
done

exit 1
