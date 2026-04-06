# NStepOS Agent Architecture Map

This document defines the formal Stage 2 agent split used by NStepOS.

## Agent Roles

- Router Agent
  - classifies the goal
  - selects workflow, lane, risk, approval requirement, and model tier
- Thinker Agent
  - reasons about the problem
  - writes structured scratchpad notes
  - surfaces risks, assumptions, and next focus
- Planner Agent
  - converts reasoning into a concrete workflow plan
  - annotates dependencies and approval checkpoints
- Executor Agent
  - performs workflow steps through the Stage 1 runtime
  - uses scoped tools only
- Verifier Agent
  - checks whether the workflow result should be accepted, retried, or escalated
- Memory Agent
  - compresses scratchpad notes into durable memory entries
  - stores reusable patterns and audit history
- Reporter Agent
  - produces final workflow and dashboard summaries
- Orchestrator
  - selects the next agent for each phase
  - records the handoff history

## Handoff Order

1. Router
2. Thinker
3. Planner
4. Executor
5. Verifier
6. Memory
7. Reporter

## Touch Boundaries

- Router: route metadata only
- Thinker: scratchpad and reasoning artifacts only
- Planner: workflow plan only
- Executor: step state and tools only
- Verifier: verification findings and escalation suggestions only
- Memory: durable memory and audit trail only
- Reporter: final summary payload only
- Orchestrator: control flow and invocation records only

## Implementation Files

- `packages/nstep-os/src/core/stage2-models.ts`
  - Stage 2 agent IDs, capabilities, permissions, reasoning request/result contracts, and orchestration phases
- `packages/nstep-os/src/agents/thinker-agent/index.ts`
  - Thinker agent implementation
- `packages/nstep-os/src/agents/index.ts`
  - Stage 2 agent registry
- `packages/nstep-os/src/core/stage2-orchestrator.ts`
  - phase routing, invocation history, and agent handoff logic
- `packages/nstep-os/src/jobs/job-engine.ts`
  - runtime call sites for thinker, planner, executor, verifier, memory, and reporter
- `packages/nstep-os/src/core/types.ts`
  - scratchpad entry and job record state
- `packages/nstep-os/src/dashboard/contracts.ts`
  - dashboard job detail scratchpad shape
- `packages/nstep-os/src/dashboard/service.ts`
  - job scratchpad mapping for dashboard responses
- `apps/nstep-dashboard/src/components/dashboard/job-scratchpad.tsx`
  - job detail UI for the scratchpad panel
- `apps/nstep-dashboard/src/components/dashboard/routes/job-detail-route.tsx`
  - job detail placement for the scratchpad panel

## Notes

- The Thinker Agent is intentionally separate from the Planner Agent.
- The Memory Agent should store compressed lessons, not raw chatter.
- The Verifier must remain a gate before completion.
- The Orchestrator should never execute business logic directly.
