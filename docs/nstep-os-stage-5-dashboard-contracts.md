# NStepOS Stage 5 Dashboard Contracts

This stage adds the dashboard/backend integration layer only. No frontend UI is built here.

## Backend files

- `packages/nstep-os/src/dashboard/contracts.ts`
  - TypeScript response contracts for overview, jobs, approvals, logs, activity, memory, and product panels.
- `packages/nstep-os/src/dashboard/service.ts`
  - Translates durable job, memory, domain, and product-store data into dashboard response objects.
- `packages/nstep-os/src/dashboard/index.ts`
  - Public dashboard barrel that exports the service and contract types.
- `packages/nstep-os/src/schemas/dashboard.ts`
  - Runtime JSON-schema definitions for the dashboard response layer.
- `packages/nstep-os/src/schemas/index.ts`
  - Schema registry export for dashboard validation and discovery.
- `packages/nstep-os/src/core/types.ts`
  - Shared log-model update so job logs can carry job, step, product, workflow, and source context.
- `packages/nstep-os/src/jobs/job-engine.ts`
  - Emits enriched log entries that the dashboard can display directly.
- `packages/nstep-os/src/server.ts`
  - HTTP routes for dashboard consumers.

## Route surface

- `GET /v1/dashboard/overview`
  - Main shell payload with summary cards, alerts, recent jobs, recent approvals, logs, workflow activity, memory, and product cards.
- `GET /v1/dashboard/jobs`
  - Paginated job list contract.
- `GET /v1/dashboard/jobs/:jobId`
  - Job detail contract with timeline, logs, approvals, memory updates, and the related product panel.
- `GET /v1/dashboard/approvals`
  - Approval queue contract.
- `GET /v1/dashboard/logs`
  - Log feed contract.
- `GET /v1/dashboard/activity`
  - Workflow activity contract, grouped by product and execution lane.
- `GET /v1/dashboard/memory`
  - Memory view contract, including patterns and audit trail.
- `GET /v1/dashboard/panels/:product`
  - Product-specific panel contract for `lead-recovery`, `nexusbuild`, `provly`, or `neurormoves`.

## Frontend consumption

The frontend should consume these responses as stable JSON contracts, not as loosely shaped job data.

- The main dashboard page should call `GET /v1/dashboard/overview` first.
- The job list page should call `GET /v1/dashboard/jobs` with `tenantId`, `product`, `status`, `page`, `pageSize`, and `search` query params.
- The job detail page should call `GET /v1/dashboard/jobs/:jobId` and render the returned `job`, `timeline`, `logs`, `approvals`, `memoryUpdates`, and `productPanel` sections directly.
- Approval, log, activity, memory, and product panel views should each call their matching endpoint and render the returned arrays without client-side reshaping beyond formatting and filtering.
- Query filtering is already normalized in the backend through `DashboardQuery`, so the frontend can pass raw URL params through SWR, server components, or route loaders.

## Integration intent

- The frontend should not infer workflow status from raw job internals.
- It should treat the dashboard response layer as the source of truth for operational UI.
- Product panels should be displayed as the operator view for each product while keeping NStepOS branding and internal complexity hidden from end users.
