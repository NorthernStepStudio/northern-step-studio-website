# Northern Step Studio Workspace

Northern Step Studio (NStep) is a multi-app studio workspace for the public website, internal operations dashboard, mobile products, and the Synox/MatterHorn operating layer.

The repo is intentionally a workspace, not a single app. Keep product-specific code inside its app folder, shared runtime code inside `packages/`, and operational notes inside `docs/`.

## Main Apps And Packages

- `src/react-app/` and `src/worker/`: the root Northern Step Studio website/admin surface and Cloudflare Worker backend.
- `apps/Northern Step Studio website/`: packaged website workspace used by the current npm workspace config.
- `apps/nstep-dashboard/`: internal StudioOS dashboard. It reuses the existing website/admin auth flow and should not grow a second login.
- `apps/neurormoves/`: Expo/React Native NeuroMoves mobile app.
- `packages/nstep-os/`: NStepOS orchestration runtime for jobs, agents, memory, workflows, and the dashboard API.
- `packages/synox/`: Synox agent and routing layer.
- `tools/android-build-center/` and `tools/android-build-center-ui/`: internal Android build tooling.

Other folders under `apps/` are product workspaces, prototypes, or app-specific tools. See `docs/architecture/repo-map.md` before moving app folders.

## Install

This repo uses npm workspaces. The root lockfile is `package-lock.json`.

```bash
npm install
```

Some standalone app folders also have their own lockfiles. Install from that app folder only when working on that app directly.

## Run Locally

```bash
npm run dev
```

For explicit service processes:

```bash
npm run dev:server
npm run dev:worker
npm run dev:dashboard
```

The dashboard depends on the existing website/admin auth API. For local-only dashboard auth, use the documented `NSTEP_DASHBOARD_LOCAL_DEV_AUTH` variables in `.env.example`.

## Build And Check

```bash
npm run hygiene:check
npm run check
npm run test
npm run build
```

Use `npm run governance:gate` before production-risk changes, and `npm run governance:readiness` to create deployment readiness checklists.

## Environment

Start from `.env.example` and `.dev.vars.example`. Use placeholder values in committed examples only. Real secrets belong in local `.env` files, Cloudflare secrets, GitHub Actions secrets, or the relevant deployment platform.

Important variable groups:

- Supabase and frontend auth: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `SUPABASE_URL`, `SUPABASE_ANON_KEY`.
- Worker/API integration: `VITE_BACKEND_URL`, `.dev.vars.example`, and Cloudflare secrets.
- NStepOS runtime: `NSTEP_OS_*`, `DATABASE_URL`, `REDIS_URL`, Twilio variables.
- Dashboard integration: `NSTEP_OS_API_URL`, `NSTEP_OS_INTERNAL_TOKEN`, `NSTEP_DASHBOARD_AUTH_BASE_URL`.

## Repo Structure

```text
apps/         Product apps, prototypes, and app-specific services
packages/     Shared workspace packages such as nstep-os and synox
src/          Root website React app, shared data, and Cloudflare Worker
public/       Root website public assets
migrations/   D1/database migration history
docs/         Architecture, setup, governance, prompts, and decisions
scripts/      Workspace automation and governance scripts
tools/        Larger internal tools such as Android Build Center
studioos/     StudioOS validation, recovery, reports, and snapshots
archive/      Historical snapshots with manifests
```

Do not place generated builds, temp files, screenshots, logs, APK/AAB outputs, local caches, or private keys at the repo root. Keep cleanup decisions recorded in `docs/decisions/repo-cleanup-log.md`.
