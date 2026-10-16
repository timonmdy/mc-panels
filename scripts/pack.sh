#!/usr/bin/env bash
set -euo pipefail

root="$(cd "$(dirname "$0")/.." && pwd)"
out="${root}/dist/mcpanels.blueprint"
zip_out="${root}/dist/mcpanels.zip"

mkdir -p "${root}/dist"
rm -f "${out}" "${zip_out}"

cd "${root}"
if command -v zip >/dev/null 2>&1; then
  zip -r "${out}" conf.yml admin console dashboard migrations routers app \
    -x "*.DS_Store" >/dev/null
elif command -v powershell.exe >/dev/null 2>&1; then
  MCPANELS_ROOT="$(pwd -W)" powershell.exe -NoProfile -NonInteractive -Command \
    '$ErrorActionPreference = "Stop"; $root = $env:MCPANELS_ROOT; $paths = @("conf.yml", "admin", "console", "dashboard", "migrations", "routers", "app") | ForEach-Object { Join-Path $root $_ }; Compress-Archive -Path $paths -DestinationPath (Join-Path $root "dist/mcpanels.zip") -Force; Move-Item (Join-Path $root "dist/mcpanels.zip") (Join-Path $root "dist/mcpanels.blueprint")'
else
  echo "Error: zip or Windows PowerShell (powershell.exe) is required to package the extension." >&2
  exit 1
fi

echo "Built ${out}"
echo "Install: copy to /var/www/pterodactyl and run: blueprint -install mcpanels"
