#!/bin/bash
set -euo pipefail

export PORT=3002
export API_BASE_URL=http://localhost:3000/api
echo "Starting Reco service on port $PORT..."
echo "Connecting to API at $API_BASE_URL"
cd apps/reco
npm start
