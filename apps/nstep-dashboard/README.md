# NStep Dashboard

Internal StudioOS dashboard for NStepOS operations.

## Authentication Model

This dashboard does not maintain a separate username/password login.

- It validates the existing website admin session from `/api/users/me`.
- Unauthenticated access is redirected to the existing website admin login flow.
- Role checks fail closed and only allow configured admin roles.

## Required Environment

- `NSTEP_OS_API_URL` - NStepOS API base URL used for dashboard data.
- `NSTEP_OS_INTERNAL_TOKEN` - shared internal token forwarded to NStepOS API.
- `NSTEP_DASHBOARD_AUTH_BASE_URL` - base URL for the existing website/admin auth API (must expose `/api/users/me`).

## Optional Environment

- `NSTEP_DASHBOARD_ADMIN_LOGIN_URL` - override admin login URL (default: `<auth base>/admin/login`).
- `NSTEP_DASHBOARD_ADMIN_LOGOUT_URL` - override logout URL (default: `<auth base>/api/logout`).
- `NSTEP_DASHBOARD_ALLOWED_ADMIN_ROLES` - comma-separated roles allowed to access dashboard (default: `owner,admin`).
- `NSTEP_DASHBOARD_AUTH_COOKIE_NAMES` - comma-separated auth cookie names forwarded to auth API (default: `studio_session_token`).
- `NSTEP_DASHBOARD_TENANT_ID` - tenant id forwarded to NStepOS API (default: `default`).
- `NSTEP_DASHBOARD_AFTER_LOGIN_URL` - optional explicit URL sent to login as `next`.

## Local Development

Default local behavior still reuses existing website admin auth:

1. Start the website/admin app so `/api/users/me` can validate the existing session.
2. Sign in through the website admin login.
3. Start the dashboard app.

Optional local-only dev auth mode (no separate sign-in page) can be enabled with:

- `NSTEP_DASHBOARD_LOCAL_DEV_AUTH=1`
- `NSTEP_DASHBOARD_LOCAL_DEV_USER=<local-admin-identity>`
- Optional: `NSTEP_DASHBOARD_LOCAL_DEV_DISPLAY_NAME`, `NSTEP_DASHBOARD_LOCAL_DEV_EMAIL`, `NSTEP_DASHBOARD_LOCAL_DEV_TENANT_ID`

```bash
npm install
npm run dev
```
