# Ports

## Default local ports

| Component | Path | Port | Purpose |
|---|---|---:|---|
| Backend API | `apps/backend` | **3000** | Main REST API under `/api/*` |
| Reco service | `apps/reco` | **3002** | Recommendations service |
| Web (main) | `apps/web` | **5173** | Main web dev server |
| Web (Amazon) | `apps/web-amazon` | **5174** | Amazon web dev server |
| Expo Metro | `apps/mobile` | **8081** | Metro bundler |

## Health checks

- Backend: `http://localhost:3000/api/health`
- Web: `http://localhost:5173`
- Web-Amazon: `http://localhost:5174`

## Config variables

- Backend: `PORT`, `DATABASE_URL`, `JWT_SECRET`, `FRONTEND_URL`, `MOBILE_URL`
- Reco: `PORT`, `API_BASE_URL`
- Web: `VITE_API_BASE_URL`
- Mobile: `EXPO_PUBLIC_API_BASE_URL`, `EXPO_PUBLIC_LOCAL_API_BASE_URL`
