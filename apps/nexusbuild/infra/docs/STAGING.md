# Staging Runbook

## Backend env

Start from `apps/backend/.env.staging.example` and set:

- `DATABASE_URL`
- `JWT_SECRET`
- `ADMIN_EMAIL`
- `APIFY_API_TOKEN` if you want live scraped pricing instead of the fallback catalog

## Deploy target

Deploy `apps/backend` to the configured staging provider using `nixpacks.toml` or the `Procfile`.

## GitHub Actions secrets

Configure these repository or environment secrets for the `staging` environment:

- `NEXUSBUILD_STAGING_BASE_URL`
- `NEXUSBUILD_STAGING_ADMIN_EMAIL`
- `NEXUSBUILD_STAGING_ADMIN_PASSWORD`

`NEXUSBUILD_STAGING_BASE_URL` must include `/api`, for example:

```text
https://staging-api.nexusbuild.app/api
```

## Smoke validation

After a staging deploy, run the `Staging Smoke` GitHub Actions workflow in `.github/workflows/staging-smoke.yml`.

That workflow:

- checks the staging health endpoint
- runs the full backend smoke suite
- reuses the same smoke users if they already exist
- cleans up the smoke builds and reports when admin credentials are valid
