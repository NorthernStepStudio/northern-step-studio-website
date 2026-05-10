# NStep Deployment Rules

## General Principles
- **No Manual Deploys**: All production changes must go through the CI/CD pipeline.
- **Rollback First**: If a deployment causes regression, roll back immediately before debugging.
- **Staging Validation**: Test critical features in the staging environment before production.

## Worker Deploys
- Use `wrangler deploy`.
- Ensure all environment variables are correctly set in the dashboard.
- Verify D1 migrations are applied before deploying worker changes that depend on them.

## Frontend Deploys
- Vite builds must be verified for asset integrity.
- Use Cloudflare Pages or Workers for frontend hosting.

## Maintenance Windows
- Schedule maintenance for low-traffic periods.
- Use the `MaintenancePage` feature for scheduled downtime.
