# Architecture Overview

## Monorepo layout

- `apps/backend`: Node.js / TypeScript API
- `apps/reco`: recommendations service
- `apps/mobile`: Expo mobile app
- `apps/web`: main web app
- `apps/web-amazon`: Amazon-safe web variant
- `packages/shared`: shared helpers, including API base-url resolution

## Backend boundary

The backend owns:

- auth and profile endpoints
- builds and community build APIs
- admin moderation and reporting
- price-search and trending-price routes

## Shared config

Use `packages/shared/src/api/getApiBaseUrl.js` as the source of truth for dev and production API resolution.
