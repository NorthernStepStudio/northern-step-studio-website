# Dashboard UI/Logic Boundary

This folder contains dashboard **view-model logic only**.

## Rules

1. `src/components/dashboard/**` is presentation-only:
- JSX, layout, visual composition, and class names.
2. `src/lib/dashboard/view-models/**` is behavior/computation:
- Derived metrics, status calculations, option sets, and display-state shaping.
3. `src/lib/dashboard/api.ts` remains data access only:
- Fetching and transport concerns, no JSX.

## Why

This keeps UI layout changes isolated from behavior changes so visual work can iterate without breaking dashboard logic.

