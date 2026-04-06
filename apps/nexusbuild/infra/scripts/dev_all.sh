#!/usr/bin/env bash
set -euo pipefail

root_dir="$(dirname "$0")/../.."

(cd "$root_dir/apps/backend" && npm run dev) &
api_pid=$!

(cd "$root_dir/apps/web" && npm install && npm run dev) &
web_pid=$!

(cd "$root_dir/apps/web-amazon" && npm install && npm run dev) &
web_amazon_pid=$!

if [ -f "$root_dir/apps/reco/package.json" ]; then
  (cd "$root_dir" && npm --workspace apps/reco start) &
  reco_pid=$!
else
  reco_pid=""
fi

wait "$api_pid" "$web_pid" "$web_amazon_pid" ${reco_pid:-}
