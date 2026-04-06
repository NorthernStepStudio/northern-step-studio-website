# NStepOS Stage 7 - NexusBuild

Stage 7 is the NexusBuild product workflow layer on top of the reusable NStepOS core.
It turns the core runtime into a PC build research, compatibility, pricing, recommendation,
and premium report engine.

## What This Stage Does

- Accepts a build goal or saved build payload.
- Normalizes parts into a structured intake model.
- Runs compatibility analysis across CPU, motherboard, memory, PSU, case, cooling, and GPU fit.
- Optionally retrieves live pricing through browser, scraping, or API adapters.
- Generates a recommendation package with upgrade paths, alternates, and purchase strategy.
- Produces a dashboard-ready premium analysis report.
- Writes workflow memory and persists report artifacts.

## Exact File Map

### NexusBuild workflow layer

- `packages/nstep-os/src/workflows/nexusbuild/index.ts`
  - Main workflow definition.
  - Builds the step plan.
  - Executes each NexusBuild step.
  - Runs verification.
  - Assembles memory entries.
  - Produces the final workflow result.

- `packages/nstep-os/src/workflows/nexusbuild/intake.ts`
  - Parses and normalizes build intake.
  - Resolves workflow type, use case, build name, parts, comparison builds, price sources, and watchlists.

- `packages/nstep-os/src/workflows/nexusbuild/catalog.ts`
  - Shared normalization and scoring helpers.
  - Infers categories, sockets, memory types, form factors, wattage, and basic hardware scores.

- `packages/nstep-os/src/workflows/nexusbuild/compatibility.ts`
  - Compatibility rule engine.
  - Checks CPU socket, memory type, PSU headroom, case fit, GPU clearance, and missing parts.

- `packages/nstep-os/src/workflows/nexusbuild/analysis.ts`
  - Performance and value analysis.
  - Scores the build by use case, detects bottlenecks, and estimates budget fit.

- `packages/nstep-os/src/workflows/nexusbuild/pricing.ts`
  - Optional price retrieval abstraction.
  - Uses browser, scraping, or API adapters depending on the source.
  - Collects pricing snapshots and schedules price watch tasks.

- `packages/nstep-os/src/workflows/nexusbuild/recommendations.ts`
  - Recommendation flow.
  - Builds alternate parts, upgrade paths, budget optimizations, and purchase strategy guidance.

- `packages/nstep-os/src/workflows/nexusbuild/report.ts`
  - Premium analysis report output.
  - Produces the dashboard-facing report object and workflow result payload.

- `packages/nstep-os/src/workflows/nexusbuild/memory.ts`
  - Memory update layer.
  - Stores reusable workflow patterns, preference signals, and warning patterns.

- `packages/nstep-os/src/workflows/nexusbuild/store.ts`
  - Persistence layer for saved builds, compatibility checks, pricing snapshots, analysis reports, recommendation runs, and preferences.

### Core and runtime integration

- `packages/nstep-os/src/core/types.ts`
  - Shared contracts used by the workflow.
  - Defines NexusBuild intake, analysis, report, pricing, comparison, recommendation, memory, and store models.

- `packages/nstep-os/src/workflows/index.ts`
  - Registers NexusBuild as a first-class workflow key in the NStepOS workflow registry.

- `packages/nstep-os/src/core/runtime.ts`
  - Creates the runtime stores and Stage 3 tool runtime.
  - Passes tool access into the job engine and agent layer.

- `packages/nstep-os/src/jobs/job-engine.ts`
  - Runs the workflow against a durable job.
  - Handles routing, planning, execution, verification, memory writes, logs, and status persistence.

- `packages/nstep-os/src/server.ts`
  - Exposes the NexusBuild run route at `POST /v1/workflows/nexusbuild/run`.

## How NexusBuild Extends NStepOS Core

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

Stage 7 uses all of that core infrastructure without introducing new platform primitives.
It only adds a product-specific workflow definition for NexusBuild and wires it through the
existing job engine, tools, memory store, persistence layer, and dashboard report contract.

## Verification

- `npm run check` passes in `packages/nstep-os`.
- The NexusBuild workflow is already registered and exposed through the runtime.

