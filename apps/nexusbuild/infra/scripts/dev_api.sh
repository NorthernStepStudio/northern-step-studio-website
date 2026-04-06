#!/bin/bash
set -euo pipefail

echo "Starting Node backend on port 3000..."
cd apps/backend
npm run dev
