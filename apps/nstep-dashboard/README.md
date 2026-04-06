# NStep Dashboard

Production admin console for NStepOS.

## Staging Environment

Set these variables in staging and production:

- `NSTEP_OS_API_URL` - public backend URL for the NStepOS API deployment.
- `NSTEP_OS_INTERNAL_TOKEN` - shared bearer token used between the dashboard and backend.
- `NSTEP_DASHBOARD_AUTH_SECRET` - secret used to sign dashboard sessions.
- `NSTEP_DASHBOARD_AUTH_USERS` - JSON array of dashboard users with `username`, `password`, `role`, and `tenantId`.

The dashboard gates `/dashboard/*` routes and injects trusted role headers into `/api/nstep/*` requests after login.

## What it does

- Displays live job, workflow, approval, and memory state from NStepOS.
- Lets operators submit structured goals and approve waiting steps.
- Proxies API traffic through the local Next app so the browser stays on one origin.

## Setup

1. Install dependencies in this app folder.
2. Set `NSTEP_OS_API_URL` to the NStepOS backend base URL.
3. Run the dashboard and backend at the same time.

## Development

```bash
npm install
npm run dev
```

## Environment

- `NSTEP_OS_API_URL` - required in production
- `NSTEP_OS_INTERNAL_TOKEN` - shared service token for backend requests
- `NSTEP_DASHBOARD_AUTH_SECRET` - session signing secret
- `NSTEP_DASHBOARD_AUTH_USERS` - dashboard credential JSON
