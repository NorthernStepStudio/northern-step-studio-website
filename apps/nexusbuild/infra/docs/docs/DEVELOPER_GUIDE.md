# Developer Guide

## Stack

- Backend: Node.js + TypeScript + Express + Prisma
- Database: PostgreSQL
- Mobile: Expo / React Native
- Web: Vite / React

## Local backend

```powershell
npm run bootstrap:backend:local
npm run dev:api
```

The API runs at `http://localhost:3000`.

## Mobile notes

- Android emulators use `10.0.2.2` for localhost.
- The mobile config resolves the API host automatically in dev, but `EXPO_PUBLIC_LOCAL_API_BASE_URL` can override it.

## Required backend env

| Variable | Purpose |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `JWT_SECRET` | JWT signing key |
| `PORT` | API port |
| `FRONTEND_URL` | Allowed web origin |
| `MOBILE_URL` | Allowed mobile origin |
| `APIFY_API_TOKEN` | Live price scraping |
