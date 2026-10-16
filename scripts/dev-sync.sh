#!/usr/bin/env bash
set -euo pipefail

# Usage: PANEL_DIR=/var/www/pterodactyl bash scripts/dev-sync.sh
# Mirrors this repo into the Blueprint dev directory, then run `blueprint -build`.
root="$(cd "$(dirname "$0")/.." && pwd)"
panel="${PANEL_DIR:-/var/www/pterodactyl}"
dev="${panel}/.blueprint/dev"

mkdir -p "${dev}"
rsync -a --delete --exclude node_modules --exclude dist --exclude .git \
  --exclude scripts --exclude types --exclude package.json --exclude tsconfig.json \
  "${root}/" "${dev}/"

echo "Synced to ${dev}. Next: cd ${panel} && blueprint -build"
