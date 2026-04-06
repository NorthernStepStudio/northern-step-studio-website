# NexusBuild Backend

Node.js/TypeScript API for NexusBuild.

## Setup

```powershell
cd apps/backend
Copy-Item .env.example .env
```

Or from the repo root:

```powershell
npm run bootstrap:backend:local
```

## Scripts

```bash
npm run dev
npm run build
npm test
npm run smoke
npm run seed:admin -- --password=replace-with-a-strong-password
```

## Local smoke test

```powershell
$env:NEXUSBUILD_SMOKE_ADMIN_EMAIL = "admin@nexusbuild.app"
$env:NEXUSBUILD_SMOKE_ADMIN_PASSWORD = "replace-with-your-admin-password"
npm run smoke
```

## Core endpoints

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `PUT /api/auth/update`
- `GET /api/builds`
- `POST /api/builds`
- `GET /api/builds/community`
- `POST /api/reports`
- `GET /api/reports/my`
- `GET /api/admin/stats`

## Notes

- Price endpoints use the curated fallback catalog when `APIFY_API_TOKEN` is missing or unavailable.
- Admin/moderator routes authenticate directly from the bearer token through the shared auth middleware.
