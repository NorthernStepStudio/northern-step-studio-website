# NStepOS Architecture

NStepOS is the orchestration and execution layer for NStep. It sits on top of NSCore, accepts structured goals, routes them into workflows, assigns work to internal agents, runs tools, verifies outcomes, persists memory, and exposes results to the dashboard and API.

## System Boundaries

- `NSCore` is the internal reasoning layer.
- `NStepOS` is the orchestration, runtime, workflow control, and visible system layer.
- `Agents` are internal workers, not public features.
- `apps/nstep-dashboard` is the operator-facing surface.

## Repo Structure

```text
apps/
  nstep-dashboard/

packages/
  nstep-os/
    src/
      core/
        config.ts
        logger.ts
        persistence.ts
        postgres.ts
        runtime.ts
        storage.ts
        types.ts
        validation.ts
      intake/
      router/
      planner/
      executor/
      verifier/
      memory/
      reporting/
      agents/
        router-agent/
        planner-agent/
        research-agent/
        execution-agent/
        communication-agent/
        verification-agent/
        memory-agent/
        reporting-agent/
      tools/
        browser/
        sms/
        email/
        database/
        api/
        scraping/
        scheduler/
        redis/
      jobs/
      policies/
      schemas/
      memory-store/
      workflows/
        lead-recovery/
        nexusbuild/
        provly/
        neurormoves/
      dashboard/
      server.ts
```

## TypeScript Scaffolding

The package is built as a modular TypeScript runtime, with each layer owning one concern:

- `core` owns contracts, runtime config, persistence primitives, and store selection.
- `intake` normalizes user goals into typed jobs.
- `router` classifies the goal and selects the execution lane.
- `planner` expands a goal into an explicit step graph.
- `executor` runs step implementations.
- `verifier` checks completion and policy compliance.
- `memory` creates reusable memory entries from successful work.
- `reporting` turns jobs into dashboard-ready summaries.
- `agents` holds the internal worker abstractions.
- `tools` contains all adapter boundaries for external systems.
- `jobs` owns durable job state and orchestration.
- `workflows` contains product-specific workflow definitions.

## Execution Model

The lifecycle is:

1. Goal intake
2. Routing
3. Planning
4. Execution
5. Verification
6. Memory writeback
7. Reporting

## Phase 1 Scope

The current staged build starts with:

- goal intake
- router
- planner
- job engine

The stable entrypoint for this stage is `createPhase1Surface()` from `packages/nstep-os/src/phase-1/index.ts`.

The runtime supports two execution lanes:

- Internal product execution for NStep apps and data
- External operator execution for browsers, APIs, and third-party systems

It also supports two modes:

- `assist` for approval-gated work
- `autonomous` for safe, repeatable work

## Job Engine

The job engine is implemented in `packages/nstep-os/src/jobs/job-engine.ts`.

Responsibilities:

- create jobs from structured goals
- route jobs to the correct workflow
- generate plans and step states
- run steps with dependencies
- pause for approval when required
- retry retryable steps up to the configured limit
- verify the completed job
- store memory entries
- build the final workflow report
- expose a dashboard snapshot

Job state is durable and resumable. Each job tracks:

- job ID
- tenant ID
- goal
- route decision
- workflow plan
- step states
- logs
- approval state
- final result
- error state

## Storage

Storage is split by concern:

- jobs store
- memory store
- domain store for lead and interaction data

The runtime can use:

- file-backed JSON storage
- Postgres or Supabase-backed storage
- Redis for ephemeral queue-like state and scheduling

## Workflow Modules

The first product workflows are:

- `lead-recovery`
- `nexusbuild`
- `provly`
- `neurormoves`

Each workflow provides:

- `buildPlan`
- `executeStep`
- `verify`
- `createMemory`
- `report`

## Dashboard

The dashboard app is `apps/nstep-dashboard`.

It consumes the NStepOS API and shows:

- goals
- jobs
- steps
- logs
- approvals
- memory entries
- workflow summaries
- health status

## Build Order

The recommended build order is:

1. lock contracts in `core/types.ts`
2. finish the job engine
3. wire file-backed stores
4. add workflow implementations
5. connect live adapters
6. expose the dashboard
7. move toward production providers
