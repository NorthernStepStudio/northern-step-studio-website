# ProvLy Backend

Express and TypeScript backend for ProvLy. This service already uses Supabase for data storage and object storage, which makes it a good Cloud Run target.

## Local setup

1. Copy `.env.example` to `.env`
2. Fill in the Supabase keys and optional integration keys
3. Install and run:

```bash
npm install
npm run dev
```

Local health checks:

```bash
curl http://localhost:4000/health
curl http://localhost:4000/v1/health
```

## Cloud Run deployment

Included deployment assets:

- `Dockerfile`
- `.dockerignore`
- `cloud-run.env.example.yaml`
- `deploy-cloud-run.ps1`

### Required runtime config

Non-secret runtime values belong in `cloud-run.env.yaml`:

```yaml
SUPABASE_URL: https://your-project-ref.supabase.co
SUPABASE_STRICT_KEYS: "1"
SUPABASE_UPLOADS_BUCKET: uploads
SUPABASE_EXPORTS_BUCKET: exports
MAX_UPLOAD_MB: "15"
```

Required Google Secret Manager secrets:

- `provly-supabase-anon-key`
- `provly-supabase-service-role-key`

Optional secrets:

- Gemini API key for AI features
- RevenueCat API key for subscription checks

### Deploy

Run this from `apps/ProvLy Home Inventory/apps/backend`:

```powershell
./deploy-cloud-run.ps1 -ProjectId your-gcp-project-id
```

Useful flags:

```powershell
./deploy-cloud-run.ps1 `
  -ProjectId your-gcp-project-id `
  -Region us-central1 `
  -ServiceName provly-backend `
  -GeminiApiKeySecret provly-gemini-api-key `
  -RevenueCatApiKeySecret provly-revenuecat-api-key
```

## Production notes

- This service already stores uploads and exports in Supabase Storage instead of local disk.
- Cloud Run is therefore a clean fit for the current document and export flows.
- `SERVICE_GIT_COMMIT_SHA` can be set as an optional env var if you want health responses to expose the source revision.
