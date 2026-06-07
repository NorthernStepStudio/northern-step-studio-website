# Repo Cleanup Log

Date: 2026-06-01
Branch: `cleanup/repo-organization`

## What Was Moved

- Moved the root deployment guide into `docs/deployments/hardened-deployment.md`.
- Moved the root release checklist into `docs/setup/release-verification.md`.

## What Was Removed

- Removed tracked local temp files, pid files, Playwright screenshots, lint reports, build logs, TypeScript build info, Android/CMake build outputs, APK/AAB artifacts, extracted APK contents, and package compiled outputs.
- Removed untracked generated outputs such as `dist/`, root temp logs, `build-artifacts/`, and Android Build Center scan cache output.
- Removed second-pass local clutter from root: `.expo/`, `.wrangler/`, `.venv/`, and `_backup-old-scanscribe/`.
- Removed untracked generated-only app folders: `apps/NStep AI Agent UI/`, `apps/nstep-godot-agent/`, `apps/nstep-local-ai/`, and `apps/zaywebsite/`.
- Removed generated-only pieces inside the ignored `apps/NStep Audio Engine app/` workspace: virtualenvs, desktop/mobile dependency/build folders, API cache folder, Python cache, and temp logs.

## What Was Fixed

- Replaced the conflicted root `README.md` with a clean workspace overview.
- Added `docs/architecture/repo-map.md` and `docs/setup/local-dev.md`.
- Expanded `.gitignore` for generated build, temp, TypeScript, Android, CMake, lint, and scan-cache outputs.
- Ignored the untracked local `apps/NStep Audio Engine app/` workspace to prevent accidental commits of virtualenvs, `node_modules`, generated `dist/` output, caches, and bundled third-party engine code.
- Expanded the repo hygiene scripts so generated artifacts are easier to detect and clean next time.
- Added safe placeholder environment variables for NStepOS and dashboard local development.

## What Was Intentionally Left Alone

- Existing product code, routes, database migrations, auth flows, and environment variable names.
- Pre-existing uncommitted changes in NeuroMoves and Android Build Center files.
- The large local `apps/NStep Audio Engine app/` folder is ignored because it appears to be an incubating app with generated dependencies and vendored engine code. It needs owner review before any source subset is tracked.
- Root diagnostic artifacts such as `build-center-broken-state.patch`, build-center screenshots, and repo snapshot JSON files because they may be evidence inputs for existing StudioOS tooling.
- Root `node_modules/` and app-specific dependency folders for tracked apps were left alone so the currently installed workspace remains runnable.
- `private-keys/` was left alone because it is ignored local key material and should not be deleted without explicit key-rotation intent.
- `.tmp-chrome-delete-account/` was left alone because Windows denied deletion even after no matching Chrome process was found.

## Remaining Risks And Follow-Up

- Decide whether to archive or remove root diagnostic artifacts that are still tracked.
- If `apps/NStep Audio Engine app/` should become a tracked app, extract only source/config/docs into a clean app folder and keep virtualenvs, `node_modules`, model artifacts, generated builds, and vendor drops ignored.
- Run full app-specific verification before merging if the existing NeuroMoves and Android Build Center edits are intended for release.
