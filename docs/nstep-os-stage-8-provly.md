# NStepOS Stage 8 - ProvLy

Stage 8 is the ProvLy product workflow layer on top of the reusable NStepOS core.
It turns the core runtime into an inventory organization, documentation completeness,
and claim-preparation engine for home inventory workflows.

## What This Stage Does

- Accepts inventory goals, uploads, or manual item intake.
- Normalizes items, attachments, receipts, rooms, and claim context.
- Classifies inventory by room and category.
- Detects missing documentation, missing fields, and high-value risks.
- Applies claim-prep rules and generates claim-ready export structures.
- Produces reminders and structured report output.
- Writes memory entries and persists artifacts for later review.

## Exact File Map

### ProvLy workflow layer

- `packages/nstep-os/src/workflows/provly/index.ts`
  - Main workflow definition.
  - Builds the plan.
  - Executes inventory intake, normalization, classification, completeness checks,
    claim-prep rules, export generation, reminders, persistence, and final reporting.

- `packages/nstep-os/src/workflows/provly/intake.ts`
  - Item intake parser.
  - Resolves workflow type, claim context, receipts, attachments, rooms, reminders,
    export format, and policy metadata.

- `packages/nstep-os/src/workflows/provly/normalization.ts`
  - Normalization flow.
  - Converts raw item uploads and manual records into structured inventory items,
    attachments, and receipts.

- `packages/nstep-os/src/workflows/provly/classification.ts`
  - Room and category classification.
  - Groups items and computes totals and high-value counts.

- `packages/nstep-os/src/workflows/provly/completeness.ts`
  - Completeness detection.
  - Scores each inventory item and flags missing metadata, receipts, photos, and claim fields.

- `packages/nstep-os/src/workflows/provly/claims.ts`
  - Claim-prep logic.
  - Builds claim-ready export summaries and reminder drafts.

- `packages/nstep-os/src/workflows/provly/report.ts`
  - Export/report formatter.
  - Produces the dashboard-ready report object and workflow result payload.

- `packages/nstep-os/src/workflows/provly/memory.ts`
  - Memory update layer.
  - Stores workflow templates, preferences, and rule patterns for future runs.

- `packages/nstep-os/src/workflows/provly/store.ts`
  - Persistence layer for inventory items, categories, rooms, attachments, receipts,
    completeness checks, claim exports, analysis reports, and user preferences.

### Core and runtime integration

- `packages/nstep-os/src/core/types.ts`
  - Shared contracts used by the workflow.
  - Defines ProvLy intake, inventory, attachment, receipt, completeness, export,
    report, memory, and store models.

- `packages/nstep-os/src/workflows/index.ts`
  - Registers `provly` as a first-class workflow key in the NStepOS workflow registry.

- `packages/nstep-os/src/core/runtime.ts`
  - Builds the runtime stores and Stage 3 tool runtime.
  - Passes shared tool access into the job engine and agent layer.

- `packages/nstep-os/src/jobs/job-engine.ts`
  - Runs ProvLy as a durable job.
  - Handles routing, planning, step execution, verification, memory writes, logs,
    and status persistence.

- `packages/nstep-os/src/server.ts`
  - Exposes the ProvLy run route at `POST /v1/workflows/provly/run`.

## How ProvLy Extends NStepOS Core

Stage 1 provides the reusable runtime primitives:

- goal intake
- routing
- planning
- durable job state

Stage 2 adds the internal agent layer:

- router agent
- planner agent
- research agent
- execution agent
- communication agent
- verification agent
- memory agent
- reporting agent

Stage 3 adds the tool layer:

- browser
- SMS
- email
- database
- API
- scraping
- scheduler
- Redis

Stage 8 uses those core layers directly.
It does not change the runtime model; it adds product-specific workflow logic for
inventory intake, completeness scoring, claim packet preparation, and export/report output.

## Verification

- `npm run check` passes in `packages/nstep-os`.
- The ProvLy workflow is already registered and exposed through the runtime.

