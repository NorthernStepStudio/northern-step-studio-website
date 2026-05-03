# Launch Blockers (Google Play)

Last updated: 2026-04-08

This doc tracks the remaining engineering + compliance blockers for a Google Play production launch.

## P0 (Must Fix Before Submission)

- [x] Supabase: enable/force RLS on sensitive public tables
  - Apply: `apps/backend-worker/sql/20260408_security_rls_hardening.sql`
  - Verify:
    - `select tablename, rowsecurity from pg_tables where schemaname='public' and tablename in ('users','user_sessions','responseos_state','knowledge_chunks') order by tablename;`

- [ ] Store policy URLs return HTTP 200
  - `Privacy Policy URL` (currently referenced as `https://nexusbuild.app/privacy` which returns 404)
  - `Support URL` / contact page
  - Fix by hosting stable pages (can be plain static HTML).

- [ ] Play Store listing assets are submission-ready
  - Minimum screenshots uploaded (phone), plus feature graphic and icon.
  - Track asset status in `infra/docs/docs/APP_STORE_CHECKLIST.md`.

- [ ] Account deletion compliance (Google Play)
  - Implement an in-app account deletion flow + backend endpoint (and/or a public deletion request URL if required for your policy category).
  - Current backend auth routes: `/register`, `/login`, `/refresh`, `/me`, `/verify-email`, `/update` (`apps/backend-worker/src/routes/auth.ts:326`).

- [ ] Monetization: RevenueCat + token wallet is production-safe
  - Database schema:
    - Apply: `apps/backend-worker/sql/20260408_billing_schema.sql`
    - Expected tables: `public.user_entitlements`, `public.user_token_balances`
  - Worker secrets (Cloudflare):
    - `REVENUECAT_API_KEY`
    - `REVENUECAT_WEBHOOK_SECRET`
  - Remove beta/free token bypass:
    - Backend accepts `bonus_*` products (`apps/backend-worker/src/routes/billing.ts:27`, `apps/backend-worker/src/routes/billing.ts:612`)
    - Mobile can claim bonuses (`apps/mobile/src/screens/UpgradeScreen.jsx:205`)
  - Verify:
    - `https://northernstepstudio.com/api/nexus/billing/health` returns `"ok": true`

- [ ] Mobile production release build is clean (AAB + signing + deps)
  - Fix `expo-doctor` duplicate native modules (prevents reliable production builds).
  - Remove plaintext keystore credentials from the repo:
    - `apps/mobile/credentials.json` contains release keystore passwords.
  - Ensure `eas` production profile builds an Android App Bundle (AAB) and uses secure signing (EAS-managed or external keystore stored outside the repo).
  - Ensure production env keys are not test/sandbox (RevenueCat mobile SDK keys, etc.).

## P0 (Accepted Limitation on Free Plan)

- [ ] Supabase Auth: Leaked Password Protection
  - Supabase documents this as **Pro plan and above**.
  - On Free plan, keep the Security Advisor warning as an accepted limitation, or upgrade to enable it.

## P1 (Strongly Recommended Before Launch)

- [ ] Email verification (Resend) in production worker
  - Backend supports verification when configured (`apps/backend-worker/src/routes/auth.ts:198`).
  - Requires Cloudflare Worker env:
    - `RESEND_API_KEY`
    - `EMAIL_FROM`

- [ ] Chat stability: token storage must exist
  - Chat can return `TOKEN_STORAGE_UNAVAILABLE` until token tables exist (`apps/backend-worker/src/routes/chat.ts:360`).
  - Fix by applying billing schema + ensuring worker uses `SUPABASE_SERVICE_ROLE_KEY`.

- [ ] Google sign-in (optional)
  - Backend OAuth endpoints exist (`apps/backend-worker/src/routes/auth.ts:729`) but mobile flow is not implemented.
  - If it's not ready, ship email+password only for v1.

## Quick Links

- Store checklist: `infra/docs/docs/APP_STORE_CHECKLIST.md`
- Quick start / operational notes: `QUICKSTART.md`
