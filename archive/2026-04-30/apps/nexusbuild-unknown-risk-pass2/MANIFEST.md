# NexusBuild Unknown-Risk Pass 2 Manifest

Date: 2026-04-30
Scope: `apps/nexusbuild` untracked (`??`) additions only.
Method: proof-first classification against script/import/config references before any move/delete.

## Keep (in place)

- `apps/nexusbuild/apps/backend/src/scripts/seed.ts`
  - Proof: referenced by a tracked script entry in `apps/nexusbuild/apps/backend/package.json:16` (`"db:seed": "tsx src/scripts/seed.ts"`).

## Delete (safe + sensitive/local generated)

- `apps/nexusbuild/apps/mobile/google-services.json`
  - Reason: local Firebase credential artifact (contains client keys/project IDs), should not live as an unmanaged untracked file.
- `apps/nexusbuild/apps/mobile/analytics.settings`
  - Reason: local device/user analytics state artifact; generated runtime state, not source.

## Archive (not currently wired into tracked runtime/build paths)

Archived root: `archive/2026-04-30/apps/nexusbuild-unknown-risk-pass2/`

- `apps/nexusbuild/app.json`
- `apps/nexusbuild/GOOGLE_PLAY_RELEASE_VALIDATION.md`
- `apps/nexusbuild/apps/backend/src/data/partsDatabase11.ts`
- `apps/nexusbuild/apps/backend/src/data/partsDatabase9.ts`
- `apps/nexusbuild/apps/backend/src/scripts/seedCatalog.ts`
- `apps/nexusbuild/apps/backend/src/services/priceCatalogMonitor.ts`
- `apps/nexusbuild/apps/backend/src/utils/jwt.ts`
- `apps/nexusbuild/apps/backend-worker/sql/20260408_billing_schema.sql`
- `apps/nexusbuild/apps/backend-worker/sql/20260408_security_rls_hardening.sql`
- `apps/nexusbuild/apps/backend-worker/sql/20260418_core_schema.sql`
- `apps/nexusbuild/apps/backend-worker/src/routes/inventory.ts`
- `apps/nexusbuild/apps/backend-worker/src/routes/reports.ts`
- `apps/nexusbuild/apps/backend-worker/src/utils/jwt.ts`
- `apps/nexusbuild/apps/backend-worker/src/utils/supabase.ts`
- `apps/nexusbuild/apps/backend-worker/src/utils/tokenWallet.ts`
- `apps/nexusbuild/apps/mobile/scripts/build-local-aab.cjs`
- `apps/nexusbuild/apps/mobile/scripts/download-latest-aab.cjs`
- `apps/nexusbuild/apps/mobile/src/components/AIReviewModal.jsx`
- `apps/nexusbuild/apps/mobile/src/components/DevDebugDashboard.jsx`
- `apps/nexusbuild/apps/mobile/src/components/ScrollToTop.jsx`
- `apps/nexusbuild/apps/mobile/src/config/betaConfig.ts`
- `apps/nexusbuild/apps/mobile/src/contexts/PartsContext.jsx`
- `apps/nexusbuild/apps/mobile/src/core/sentry.js`
- `apps/nexusbuild/apps/mobile/src/screens/BuildDetailsScreen.jsx`
- `apps/nexusbuild/apps/mobile/src/services/googleAuth.js`
- `apps/nexusbuild/apps/mobile/src/utils/buildBudgeting.js`
- `apps/nexusbuild/apps/mobile/src/utils/smartBuildParts.js`
- `apps/nexusbuild/apps/mobile/src/utils/__tests__/smartBuildParts.test.js`
- `apps/nexusbuild/apps/web/postcss.config.cjs`
- `apps/nexusbuild/apps/web/src/hooks/usePageTracking.js`
- `apps/nexusbuild/apps/web-amazon/postcss.config.cjs`
- `apps/nexusbuild/apps/web-amazon/src/hooks/usePageTracking.js`
- `apps/nexusbuild/infra/docs/docs/LAUNCH_BLOCKERS.md`
- `apps/nexusbuild/scripts/pre-google-play-validate.mjs`
- `apps/nexusbuild/scripts/sync-worker-secrets-from-website.ps1`

## Evidence Notes

- `apps/nexusbuild/apps/backend-worker/src/index.ts:3-7,38-42` only mounts `auth`, `builds`, `chat`, `prices`, `billing`; archived `inventory`/`reports` routes were not wired into tracked route registration.
- `apps/nexusbuild/scripts/check-google-auth.mjs:51,73` explicitly reads `apps/mobile/app.json`, not root `apps/nexusbuild/app.json`.

## Guard Added Alongside Pass

- Added ignore rules in `apps/nexusbuild/.gitignore`:
  - `apps/mobile/google-services.json`
  - `apps/mobile/analytics.settings`
