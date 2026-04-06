# Northern Step Studio: Hardened Deployment Guide

This project follows a strict **GitHub-to-Cloudflare Workers** deployment model. Vercel is no longer used in the production path.

---

## 🏗️ PRODUCTION ARCHITECTURE

- **Primary Host**: Cloudflare Workers with Assets (WSA).
- **Backend Entry**: `src/worker/index.ts`.
- **Frontend Entry**: `src/react-app` (built to `dist/`).
- **One Command Release**: GitHub `push origin main` triggers the CI/CD pipeline.

---

## 🚀 RELEASE WORKFLOW

To ship your changes:

```bash
# 1. Update your code
# 2. Run your single deploy command (Release 1.0.8)
npm run deploy
```

---

## ❄️ CACHE POLICY (HARDENED)

Our worker is now configured with a **"High-Freshness, High-Performance"** caching strategy:

1.  **The App Shell (`index.html`)**:
    - **Policy**: `no-cache, no-store, must-revalidate`.
    - **Benefit**: Users ALWAYS get the latest build metadata immediately after a push. No more "stale site" updates.

2.  **Static Assets (`dist/assets/*`)**:
    - **Policy**: `public, max-age=31536000, immutable`.
    - **Benefit**: Vite generates unique content hashes for every build. These files are cached forever at the edge and in users' browsers for lightning-fast speeds.

3.  **API Requests (`/api/*`)**:
    - **Policy**: Standard dynamic response (no cache).

---

## 🩺 TROUBLESHOOTING STALE UPDATES

1.  **Verify the Version**: Visit `https://northernstepstudio.com/api/health`. If it says **1.0.8**, the worker is fresh.
2.  **Hard Refresh**: On the homepage, press `Ctrl+F5` or `Cmd+Shift+R`. This clears any lingering browser-side service worker or temporary cache.
3.  **Check GitHub Actions**: If the site didn't update, the build may have failed. Go to the "Actions" tab in GitHub to verify.
4.  **Emergency Purge**: If everything looks right but content is old, log in to the Cloudflare Dashboard and click **"Purge Everything"** under Caching.
