# Local Development

## Requirements

- Node.js and npm.
- A local `.env` based on `.env.example`.
- `.dev.vars` based on `.dev.vars.example` when running the Cloudflare Worker locally.

The root workspace uses npm because `package-lock.json` is present.

## Install

```bash
npm install
```

When working inside a standalone app with its own lockfile, install dependencies from that app directory as needed.

## Common Commands

```bash
npm run dev
npm run dev:server
npm run dev:worker
npm run dev:dashboard
npm run hygiene:check
npm run check
npm run test
npm run build
```

## Dashboard Auth

The dashboard reuses the existing website/admin auth flow. Start the website/admin API first, sign in through that flow, then start the dashboard.

For local dashboard smoke testing only, use:

```bash
NSTEP_DASHBOARD_LOCAL_DEV_AUTH=1
NSTEP_DASHBOARD_ALLOW_LOCAL_ME=1
NSTEP_DASHBOARD_LOCAL_DEV_USER=localdev
```

Do not add a second dashboard login page.

## Troubleshooting

- If workspace commands cannot find a package, check the root `workspaces` list in `package.json`.
- If dashboard calls fail, confirm `NSTEP_OS_API_URL`, `NSTEP_OS_INTERNAL_TOKEN`, and `NSTEP_DASHBOARD_AUTH_BASE_URL`.
- If the Worker cannot read secrets, check `.dev.vars` locally and Cloudflare secrets in deployment.
- If generated artifacts appear in `git status`, run `npm run hygiene:check` and remove the generated files before committing.
