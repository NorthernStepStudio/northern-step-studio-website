# AG Bridge

Lightweight mobile interface for Antigravity Agent on the same machine or LAN.

This project includes:

- a bridge server built with Express and WebSocket
- a mobile web client that talks to that bridge

## Local setup

### 1. Start Antigravity with remote debugging

```bash
antigravity.exe . --remote-debugging-port=9000
```

### 2. Run the bridge server

```bash
cd apps/ag-bridge
npm install
npm start
```

### 3. Open on phone

Open `http://<PC_IP>:4173` from the phone on the same network.

The bridge prints a pairing code and the local IP address on startup.

## Why this should not be deployed to Cloud Run as-is

This service is intentionally local-first and currently depends on a local agent process:

- `server/index.js` calls `http://localhost:${AG_PORT}/poke`
- `server/index.js` calls `http://localhost:${AG_PORT}/message`
- pairing is based on the machine's LAN IP address
- the intended client flow assumes the phone can reach the same local machine running the agent

Cloud Run cannot satisfy that architecture without redesigning the bridge and the agent transport.

## What would have to change before cloud deployment

1. Replace the localhost agent calls with a real remote agent API.
2. Redesign pairing so it does not depend on a LAN IP and a local console.
3. Decide where agent state and chat history live in production.
4. Re-evaluate whether the WebSocket flow belongs on Cloud Run or another platform.

Until that redesign is done, keep this app local-only.
