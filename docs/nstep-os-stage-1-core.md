# NStepOS Stage 1 Core Runtime

Stage 1 is the reusable runtime foundation for NStepOS.
It covers intake, routing, planning, execution, durable job state, workflow status, logs, and retry tracking.
It does not include product-specific workflows.

## Stage 1 Scope

- structured goal intake
- route classification
- workflow planning
- base executor pipeline
- durable job engine
- workflow status model
- log model
- retry model

## Canonical Stage 1 File Paths

### `packages/nstep-os/src/core/stage1.ts`

Public Stage 1 barrel for reusable core runtime consumers.
It re-exports the intake, router, planner, and job engine entry points, plus the Stage 1 status and retry models.

### `packages/nstep-os/src/core/stage1-models.ts`

Defines the reusable runtime models for Stage 1:

- workflow status snapshot
- retry state
- log model alias
- helper builders for status and retry objects

### `packages/nstep-os/src/core/types.ts`

Defines the shared runtime types used by the Stage 1 engine:

- `GoalInput`
- `RouteDecision`
- `WorkflowPlan`
- `JobRecord`
- `JobStepState`
- `StepLogEntry`
- `WorkflowStatusModel`
- `RetryState`

### `packages/nstep-os/src/core/validation.ts`

Validates the goal intake boundary before any routing or planning occurs.

### `packages/nstep-os/src/intake/index.ts`

Normalizes raw user or system input into a `GoalInput`.

### `packages/nstep-os/src/router/index.ts`

Classifies the goal into a workflow lane, risk level, and approval requirement.

### `packages/nstep-os/src/planner/index.ts`

Builds a workflow plan from the routed goal and planning context.

### `packages/nstep-os/src/executor/index.ts`

Defines the base executor pipeline contract for executing a step or a job.

### `packages/nstep-os/src/jobs/job-engine.ts`

Owns durable job state, step state, retries, approval gating, and step execution sequencing.

### `packages/nstep-os/src/jobs/job-store.ts`

Persists jobs to durable storage.

### `packages/nstep-os/src/core/runtime.ts`

Composes the Stage 1 runtime with stores, tools, agents, and the job engine.

### `packages/nstep-os/src/phase-1/index.ts`

Public staged-build entrypoint for Phase 1. It exposes the same Stage 1 surface in a compact form.

### `packages/nstep-os/src/schemas/index.ts`

Collects the JSON-like schema objects for goal intake, jobs, logs, and memory records.

## Workflow Status Model

The workflow status model is a durable snapshot of a job's current state.
It is used for dashboards, monitoring, and operational visibility.

It tracks:

- job id
- workflow key
- current job status
- approval status
- current step
- completed, running, waiting, failed, and retryable step counts
- updated timestamp

## Log Model

The log model is `StepLogEntry`.
It is the reusable operational log shape for Stage 1 and the rest of the runtime.

It tracks:

- id
- timestamp
- log level
- message
- optional structured data

## Retry Model

The retry model is `RetryState`.
It captures retry behavior at the step level.

It tracks:

- current attempts
- max attempts
- whether the step is still retryable
- whether retries are exhausted
- last attempt time
- last error
- optional next retry time

## Stage 1 Runtime Flow

1. intake goal
2. validate goal schema
3. route goal
4. build workflow plan
5. create durable job record
6. execute steps through the base executor pipeline
7. update status and retry state
8. persist logs and job state

## Out of Scope For Stage 1

The following are later-stage concerns and are not part of the reusable Stage 1 runtime:

- product-specific workflow implementations
- browser automation workflows
- communication workflows
- memory learning workflows
- reporting workflows
- product dashboards

Those layers can be added after the Stage 1 runtime is stable.
