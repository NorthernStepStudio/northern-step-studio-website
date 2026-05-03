# Northern Step Studio Deployment Model

## Production path

Production traffic is served by a single Cloudflare Worker deployment:

- GitHub `main` branch
- GitHub Actions workflow: `.github/workflows/deploy.yml`
- Cloudflare Worker: `northern-step-studio-website`
- Custom domain: `https://northernstepstudio.com`

The custom-domain attachment is currently managed in Cloudflare, not declared in `wrangler.toml`. That is why `wrangler deploy` can report `No deploy targets` even though the live hostname updates correctly.

`www.northernstepstudio.com` is redirected to the apex domain by the Worker. The public `workers.dev` hostname is disabled in `wrangler.toml`.

## Release flow

1. Run `npm run release:check`.
2. Commit reviewed changes.
3. Push to `main`.
4. Wait for the `Cloudflare Production Deploy` workflow to finish.
5. The workflow deploys with `wrangler deploy --keep-vars`.
6. The workflow runs `npm run verify:release` against production.

Use `npm run deploy:manual` only for emergency recovery when GitHub Actions is unavailable.

## Cache policy

- HTML shell and SPA navigations: `Cache-Control: no-store, max-age=0, must-revalidate`
- Hashed Vite assets under `/assets/*`: `Cache-Control: public, max-age=31536000, immutable`
- API responses: `Cache-Control: no-store, max-age=0, must-revalidate`

This keeps the HTML shell fresh while allowing hashed bundles to stay aggressively cached.

## Build fingerprinting

Every build generates `build-meta.json` and `src/shared/build-meta.ts` during `prebuild`.

The Worker exposes the build fingerprint through:

- `GET /api/health`
- `X-NSS-Build`
- `X-NSS-Version`
- `X-NSS-Commit`

## Verification

Run this locally after a manual deploy or use the GitHub Action output after an automated release:

```bash
npm run verify:release -- --base-url https://northernstepstudio.com
```

That check verifies:

- expected build fingerprint is live
- `/community` resolves as an SPA route
- `/assets/*` is immutable
- missing assets return `404`
- `www` redirects to apex

## Recovery

- Fast rollback: `npx wrangler rollback`
- Specific rollback: `npx wrangler rollback <version-id>`
- Inspect current deployment: `npx wrangler deployments status`
- Inspect recent deployments: `npx wrangler deployments list`

Do not re-enable local auto-deploy helpers or `workers.dev`, and do not detach the Cloudflare custom-domain binding, unless you intentionally want a second production path.
