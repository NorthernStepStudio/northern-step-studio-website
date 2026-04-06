# Quick Start

## Backend

```powershell
npm run bootstrap:backend:local
npm run dev:api
```

The bootstrap script creates a private local PostgreSQL cluster in `.local-pg`, writes `apps/backend/.env`, and applies Prisma migrations.

## Web

```bash
cd apps/web
npm run dev
```

Open `http://localhost:5173`.

## Mobile

```bash
cd apps/mobile
npm start
```

## Live Smoke Test

Standard user flows:

```bash
npm run smoke:backend -- --base-url http://127.0.0.1:3000/api
```

Include admin flows:

```powershell
$env:NEXUSBUILD_SMOKE_ADMIN_EMAIL = "admin@nexusbuild.app"
$env:NEXUSBUILD_SMOKE_ADMIN_PASSWORD = "replace-with-your-admin-password"
npm run smoke:backend -- --base-url http://127.0.0.1:3000/api
```

## CI

Static repo verification:

```bash
npm run verify:static
```

Full local verification:

```bash
npm run verify:all
```

## Staging

Use the manual GitHub Actions workflow `.github/workflows/staging-smoke.yml` after deploying staging.

Required GitHub secrets:

- `NEXUSBUILD_STAGING_BASE_URL`
- `NEXUSBUILD_STAGING_ADMIN_EMAIL`
- `NEXUSBUILD_STAGING_ADMIN_PASSWORD`
