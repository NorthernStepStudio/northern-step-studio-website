# StudioOS UI Lock Layer

This directory is the protected visual layer for the StudioOS dashboard.

## Intent

- Keep approved dashboard appearance stable.
- Isolate visual shell/layout/card structure from business logic and services.
- Allow data, backend, governance, and agent work without accidental UI drift.

## Scope

- `studio-shell/`: locked shell frame primitives.
- `dashboard-layout/`: locked dashboard shell composition.
- `cards/`: locked executive overview card/layout rendering.
- `sidebar/`: locked sidebar navigation and workspace summary rendering.
- `topbar/`: locked telemetry/session header rendering.
- `tokens/`: UI lock metadata/constants.

## Rules

- Do not modify layout rhythm, card scale, typography hierarchy, sidebar geometry, or responsive behavior here unless explicitly requested.
- Keep data-loading, orchestration, service logic, and storage access outside `src/ui-lock`.
- Upstream callers should pass prepared view-model data; this layer should render only.
