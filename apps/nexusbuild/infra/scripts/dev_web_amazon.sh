#!/bin/bash
export PORT=5174
echo "Starting Web (Amazon) on port $PORT..."
npm --workspace apps/web-amazon run dev -- --port $PORT
