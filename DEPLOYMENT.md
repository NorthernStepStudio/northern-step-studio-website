# Northern Step Studio Deployment Guide

This project follows a unified **Git-to-Vercel** deployment model. GitHub is the single source of truth for the codebase, and Vercel hosts both the Frontend (Vite/React) and the Backend (Hono Edge Function) as a single atomic unit.

---

## 🚀 HOW NSTEP DEPLOYS NOW

### 1. Local Development
- Work on your machine in the `main` branch.
- Run `npm run dev` to test locally.

### 2. Shipping Changes (One Path)
To go live, simply push your changes to GitHub. Vercel will automatically detect the push, build the site, and update production.

```bash
# In your terminal
git add .
git commit -m "Your update message"
git push origin main
```
*Note: You can also run **`npm run deploy`** which executes this sequence for you.*

### 3. Verification
- **Vercel**: Visit your [Vercel Dashboard](https://vercel.com/northern-step-studio-projects/northern-step-website) to ensure the build is green.
- **Live Site**: Visit `https://northernstepstudio.com/api/health` to confirm the version matches your latest push.

---

## 🔍 IF MY CHANGES DO NOT SHOW LIVE

If your site is not reflecting your latest push, verify these in order:

1.  **The Correct Branch**: Are you pushing to **`main`**? Vercel is configured to only update production from the `main` branch.
2.  **Build Status**: Check the Vercel Dashboard for "Build Failures". If the build is red, look at the logs for syntax or type errors.
3.  **Cloudflare Cache**: 
    - Cloudflare typically proxies Vercel. While Vercel handles its own cache, Cloudflare may be caching the legacy HTML shell.
    - **Fix**: Log in to Cloudflare and click **"Purge Everything"** in the Caching tab.
4.  **Browser Cache**: Use a Hard Refresh (`Ctrl+F5` or `Cmd+Shift+R`) to ensure your browser isn't serving a local cached version.
5.  **Wrong Repo Link**: Ensure your Vercel project is linked to the GitHub repo `NorthernStepStudio/northern-step-studio-website`.
6.  **Stale Environment Variables**: If the site works but logic is old, verify your `SUPABASE_DB_URL` and `STRIPE_SECRET_KEY` in the [Vercel Dashboard Environment Variables](https://vercel.com/northern-step-studio-projects/northern-step-website/settings/environment-variables).

---

## 🛠️ FINAL ARCHITECTURE

- **Source Control**: GitHub (Single Source of Truth)
- **Production Branch**: `main`
- **Hosting Provider**: Vercel (All site logic and assets)
- **Framework**: Vite/React + Hono Edge Backend
- **DNS & Security**: Cloudflare (Proxied to Vercel)

---

## ☁️ CLOUDFLARE CACHE STRATEGY

To ensure you never serve stale files through Cloudflare while maintaining high performance:

1.  **Proxied Mode**: Ensure the little cloud icon next to your DNS records is **ORANGE** (Proxied).
2.  **No-Cache for API**: All requests to `/api/*` are configured in `vercel.json` to have `Cache-Control: no-store`. This ensures AI chat and user data are always fresh.
3.  **Edge Purging**: If you make a major design change and it doesn't appear, run a **Purge Everything** in the Cloudflare Dashboard once. For normal updates, the `s-maxage=1` rule in `vercel.json` will ensure Cloudflare refreshes within seconds.
