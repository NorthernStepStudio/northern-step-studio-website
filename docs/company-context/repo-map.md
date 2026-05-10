# NStep Repository Map

## Root Structure
- `src/worker/`: The primary backend (Cloudflare Workers).
- `src/react-app/`: The frontend application (React).
- `migrations/`: D1 database migration history.
- `docs/`: System documentation and company context.
- `tools/`: Internal scripts and automation tools (e.g., Android Build Center).
- `apps/`: Managed application source code.
- `packages/`: Shared libraries and logic.

## Key Backend Files
- `src/worker/index.ts`: Worker entry point and routing.
- `src/worker/admin-assistant.ts`: AI assistant implementation.
- `src/worker/auth.ts`: Authentication and RBAC.

## Key Frontend Files
- `src/react-app/App.tsx`: React app entry point and routing.
- `src/react-app/pages/admin/StudioIntelligence.tsx`: The primary surface for the Studio Intelligence dashboard.
- `src/react-app/lib/adminNav.ts`: Admin navigation configuration for NStep AI modules.
