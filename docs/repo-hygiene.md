# Repo Hygiene Rules

## Scope
- Keep active workspace code in `apps/`, `packages/`, `src/`, `public/`, `scripts/`, `docs/`.
- Use `archive/YYYY-MM-DD/` for stale snapshots and backups.

## Do Not Commit
- Local browser profiles (`.tmp-chrome-delete-account/`)
- Test run outputs (`test-results/`)
- Local dev logs (`dev-server*.log`, `.vite-dev.*.log`, `build_log.txt`)
- Mobile export caches (`.expo-export-smoke/`, `.gradle/`)
- Scratch folders (`apps/*/scratch/`)
- Assistant scratch files (`.codex_*.txt`)

## Archive Rules
- Archive stale artifacts under `archive/YYYY-MM-DD/`.
- Preserve relative source structure in archive paths.
- Add `archive/YYYY-MM-DD/MANIFEST.md` with reason per item.

## Validation Workflow
1. Run `npm run hygiene:check`.
2. Run `npm run hygiene:clean` for a dry run.
3. Run `npm run hygiene:clean -- --apply` only when reviewed.
4. Re-run `npm run hygiene:check` and project checks before commit.
