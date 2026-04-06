#!/bin/bash
export PORT=5173
echo "Starting Web (Main) on port $PORT..."
npm --workspace apps/web run dev -- --port $PORT
