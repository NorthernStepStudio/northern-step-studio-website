# Deployment Reliability Report

## 1. Current architecture

- DNS and CDN: Cloudflare nameservers for `northernstepstudio.com`
- Production host: Cloudflare Worker `northern-step-studio-website`
- Application entrypoint: `src/worker/index.ts`
- Static asset bundle: Vite output in `dist/`
- Release trigger: push to `main` runs `.github/workflows/deploy.yml`
- Hostname attachment: Cloudflare dashboard-managed custom-domain binding
- Emergency fallback: local `wrangler deploy --keep-vars`

## 2. Issues found

- Critical: deep SPA routes such as `/community` returned `500`
- High: repo still contained Vercel-oriented auto-deploy helpers
- High: public `workers.dev` hostname remained active alongside the production domain
- High: build identity was not strong enough to prove what code was live
- Medium: health check performed an expensive database probe and produced noisy failures
- Medium: CI deployed successfully but did not verify the live release afterward
- Medium: local dry-run script targeted a missing `wrangler.json`
- Medium: cache policy described in docs was not actually enforced on live traffic

## 3. Root causes

| Issue | Root cause | Evidence | Fix |
| --- | --- | --- | --- |
| SPA routes returned `500` | Worker relied on `env.ASSETS.fetch()` only in `notFound`, but the asset-routing configuration did not define SPA behavior and the binding path was unreliable in production fallback requests | live `/community` and `/does-not-exist` returned `Asset serving misconfigured. Check ASSETS binding.` | forced Worker-first asset handling, added explicit SPA shell fallback, and codified asset routing in `wrangler.toml` |
| Legacy dual-deploy risk | old helper scripts still attempted to publish through Vercel | `scripts/auto-deploy.js` and `scripts/auto-deploy.ps1` referenced Vercel despite Cloudflare docs | disabled the helpers and standardized the repo on GitHub Actions to Cloudflare only |
| Split-brain hostname exposure | `workers.dev` remained enabled | public `https://northern-step-studio-website.proyectgate.workers.dev/` still served production content | set `workers_dev = false` |
| Deploys were hard to prove | health endpoint only exposed a hardcoded version string | `/api/health` returned `version: "1.0.8"` without commit or build identity | added generated build metadata plus response headers and CI verification |
| Health endpoint was noisy | health endpoint attempted a database probe on every request | live `/api/health` reported `Too many subrequests by single Worker invocation` | changed `/api/health` to lightweight release and environment reporting |
| CI stopped too early | workflow deployed but did not verify live routing, headers, or build identity | `.github/workflows/deploy.yml` ended after `wrangler deploy` | added post-deploy verification against production |
| Local validation drifted | `scripts/wrangler-dry-run.mjs` expected `wrangler.json`, but repo uses `wrangler.toml` | dry-run failed locally before deployment | pointed dry-run to the actual config |

## 4. Changes made

- Updated `wrangler.toml`
  - disabled `workers.dev`
  - enabled `keep_vars`
  - enabled Worker-first asset handling
  - enabled SPA asset fallback
- Updated `src/worker/index.ts`
  - added canonical `www` to apex redirect
  - added explicit static asset serving helper
  - added explicit HTML and asset cache headers
  - added build fingerprint headers
  - simplified `/api/health`
- Added `scripts/generate-build-meta.mjs`
- Added `scripts/verify-release.mjs`
- Added `scripts/release-gate.mjs`
- Reworked `scripts/wrangler-dry-run.mjs`
- Disabled legacy `scripts/auto-deploy.js` and `scripts/auto-deploy.ps1`
- Removed legacy `public/_routes.json`
- Hardened `.github/workflows/deploy.yml`
- Updated deployment documentation

## 5. Final deployment model

One production path:

1. Build metadata is generated during `prebuild`.
2. GitHub Actions builds the app on pushes to `main`.
3. GitHub Actions deploys the Worker with `wrangler deploy --keep-vars`.
4. GitHub Actions verifies the live build fingerprint, SPA routing, cache headers, and canonical redirect.
5. Production traffic is served from `https://northernstepstudio.com` only.

The hostname binding itself remains dashboard-managed today. That is acceptable because live verification proves the attached custom domain updated to the new Worker version, but it should not be edited casually.

## 6. How to deploy safely going forward

1. Run `npm run release:check`.
2. Review only the intended website changes.
3. Commit the release.
4. Push to `main`.
5. Watch the GitHub Actions run finish green.

## 7. How to verify a deploy actually went live

Use:

```bash
npm run verify:release -- --base-url https://northernstepstudio.com
```

Or manually check:

- `GET /api/health`
- `GET /` response headers
- `GET /community`
- current hashed asset under `/assets/*`
- `GET https://www.northernstepstudio.com/` without following redirects

## 8. What must never be changed casually

- `workers_dev = false`
- the Worker-first asset routing model in `wrangler.toml`
- the HTML `no-store` cache policy
- the immutable cache policy for hashed `/assets/*` files
- the canonical redirect from `www` to apex
- the post-deploy verification step in GitHub Actions
- the build metadata generation step
