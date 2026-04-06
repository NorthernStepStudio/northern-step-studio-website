# NSS DevOS

Development Orchestration System for Northern Step Studio.

Semi-manual v0 for Northern Step Studio's supervised coding loop.

## What It Does

- create a project from one plain-English brief
- normalize the brief into a structured project spec
- generate milestone one automatically
- generate task one with objective, instructions, acceptance criteria, and file boundaries
- produce a strict copy-paste prompt for Codex App, Antigravity, or another coding agent
- accept a pasted structured result JSON payload
- verify scope, acceptance criteria, blockers, and command status
- generate the next task when the run is accepted

## Run It

```bash
npm install
npm run dev
```

Open `http://localhost:3000/projects`.

## Check It

```bash
npm run lint
npm run build
```
