# Hardened Deployment Guide

Northern Step Studio follows a GitHub-to-Cloudflare Workers deployment model for the production website path.

## Production Architecture

- Primary host: Cloudflare Workers with Assets.
- Backend entry: `src/worker/index.ts`.
- Frontend entry: `src/react-app/`, built to `dist/`.
- Release path: a push to `main` triggers the configured GitHub Actions deployment workflow.

## Release Workflow

```bash
npm run check
npm run build
npm run governance:gate
```

Production deployment is handled by the repository workflow or by the app-specific deploy script when explicitly needed.

## Cache Policy

- `index.html`: no-store style behavior so the app shell can refresh immediately after deployment.
- `dist/assets/*`: long-lived immutable caching because Vite emits content-hashed files.
- `/api/*`: dynamic Worker responses; do not cache unless a route explicitly opts in.

## Stale Update Troubleshooting

1. Check the deployed health endpoint, such as `https://northernstepstudio.com/api/health`.
2. Hard-refresh the browser with `Ctrl+F5` on Windows or `Cmd+Shift+R` on macOS.
3. Check the GitHub Actions deployment logs.
4. Use Cloudflare cache purge only when the deployed version is correct but stale assets are still served.
