# Repository Map

Northern Step Studio is organized as a workspace with a root website/backend, product apps, shared packages, and internal tooling.

## Top-Level Folders

- `apps/`: product apps, app-specific services, prototypes, and standalone workspaces.
- `packages/`: shared runtime packages used across apps.
- `src/`: root website React app, shared data, and Cloudflare Worker backend.
- `public/`: root website public assets and static metadata.
- `migrations/`: database migration history. Do not move migrations during cleanup.
- `docs/`: architecture, setup, governance, deployment, recovery, and decision records.
- `scripts/`: root automation, hygiene checks, governance gates, and local orchestration.
- `tools/`: larger internal tools, including Android Build Center and repo scanner tooling.
- `studioos/`: validation profiles, recovery docs, reports, and snapshots for StudioOS governance.
- `archive/`: dated historical snapshots. New archive entries should include a manifest.

## Active Workspace Paths

The root `package.json` uses npm workspaces for:

- `apps/nstep-dashboard`
- `apps/nstep-fix`
- `apps/nstep-publish`
- `apps/neurormoves`
- `packages/nstep-os`
- `apps/Northern Step Studio website`

Several other app folders are tracked standalone projects with their own lockfiles. Do not move or rename them without auditing package scripts, deployment config, and app-specific imports.

Local incubators that contain generated dependencies, model/vendor drops, or runtime caches should stay ignored until a clean source-only app boundary is prepared.

## Main Code Areas

- Website UI: `src/react-app/`
- Worker API: `src/worker/`
- Shared website data/types: `src/shared/`
- Internal dashboard: `apps/nstep-dashboard/`
- NStepOS runtime: `packages/nstep-os/`
- Synox agent layer: `packages/synox/`
- NeuroMoves mobile app: `apps/neurormoves/`
- Android Build Center: `tools/android-build-center/` and `tools/android-build-center-ui/`

## Where New Code Should Go

- Product-specific UI, API, or scripts go under that product's folder in `apps/`.
- Reusable runtime code goes under `packages/` only after at least two consumers need it.
- Root website code stays in `src/react-app/`, `src/worker/`, `src/shared/`, and `public/`.
- Setup notes belong in `docs/setup/`.
- Architecture notes belong in `docs/architecture/`.
- Cleanup and process decisions belong in `docs/decisions/`.
- One-off generated output should stay out of the repo or go under ignored local temp paths.

## What Should Not Be Placed At Root

- APK, AAB, Gradle, CMake, Vite, Next, TypeScript, or package build outputs.
- Local logs, pid files, Playwright screenshots, lint reports, or scan caches.
- Private keys, keystores, credentials, local `.env` files, or copied secrets.
- App-specific docs that belong inside an app's `docs/` folder.
- New dashboards or auth surfaces that duplicate the existing website/admin login flow.
