# NStepOS Stage 9 Governance

Stage 9 hardens the existing NStepOS runtime without redesigning the system. The goal is to make approvals, access control, memory edits, validation, retries, and escalation visible and enforceable across the same runtime, job, tool, and dashboard layers already in place.

## Control Model

- `viewer` can inspect surfaces only.
- `analyst` can inspect and review, but cannot execute external actions.
- `operator` can run approved workflows and approve routine steps.
- `admin` can approve escalated work, edit memory, and review cross-tenant issues when explicitly scoped.
- `system` is reserved for internal workflow execution.

## File Map

- [packages/nstep-os/src/core/types.ts](../packages/nstep-os/src/core/types.ts) defines the core role model, access decisions, escalation records, memory audit trail, and durable job state.
- [packages/nstep-os/src/core/validation.ts](../packages/nstep-os/src/core/validation.ts) validates goal intake, workflow results, and memory edit requests at the boundary.
- [packages/nstep-os/src/policies/index.ts](../packages/nstep-os/src/policies/index.ts) evaluates approval policy, action restrictions, tenant isolation, and escalation creation.
- [packages/nstep-os/src/tools/policy.ts](../packages/nstep-os/src/tools/policy.ts) gates browser, SMS, email, API, scraping, scheduler, and Redis actions by role and job scope.
- [packages/nstep-os/src/tools/runtime.ts](../packages/nstep-os/src/tools/runtime.ts) wraps tool execution with retry limits and invocation logging.
- [packages/nstep-os/src/jobs/job-engine.ts](../packages/nstep-os/src/jobs/job-engine.ts) enforces approval boundaries, retry boundaries, verification outcomes, escalation handling, and final result validation.
- [packages/nstep-os/src/memory/index.ts](../packages/nstep-os/src/memory/index.ts) supports memory editing, audit trail writes, and tenant-checked persistence.
- [packages/nstep-os/src/server.ts](../packages/nstep-os/src/server.ts) exposes hardened job, memory, workflow, approval, and dashboard endpoints.
- [packages/nstep-os/src/schemas/security.ts](../packages/nstep-os/src/schemas/security.ts) defines reusable schemas for principal roles, approval policies, access decisions, memory edits, memory audits, and escalations.
- [packages/nstep-os/src/schemas/dashboard.ts](../packages/nstep-os/src/schemas/dashboard.ts) exposes dashboard-safe response shapes for jobs, logs, memory, approvals, and escalation visibility.
- [packages/nstep-os/src/dashboard/contracts.ts](../packages/nstep-os/src/dashboard/contracts.ts) gives the frontend TypeScript contracts for actor roles, escalations, and memory audit entries.
- [packages/nstep-os/src/dashboard/service.ts](../packages/nstep-os/src/dashboard/service.ts) turns runtime state into dashboard-ready responses, including actor-role-aware logs and audit trails.

## What Stage 9 Hardens

### Approval Policies

Workflows now pass through approval policy evaluation before execution. Assist mode and higher-risk routes can be forced into approval, while safe autonomous work can continue only when the policy allows it.

### Action Restrictions

External tools are role-gated. Viewer and analyst roles cannot execute browser, SMS, email, API, or scraping actions. High-risk external work is additionally escalated to higher roles.

### Tenant Isolation

Tenant scope is preserved through job, memory, approval, and dashboard lookups. Cross-tenant access is rejected unless the caller is explicitly privileged and the policy allows it.

### Memory Editing and Audit

Memory entries are editable only when the record is tenant-owned and mutable. Every memory edit appends an audit entry with actor role, actor id, note, and diff metadata.

### Prompt and Output Validation

Goal intake and workflow results are schema-checked. Memory edit requests are schema-checked too, so malformed input does not reach execution or storage.

### Retry Boundaries

Tool retries are bounded. When retries are exhausted, the job engine records failure clearly and escalates rather than looping indefinitely.

### Escalation Handling

Verification failures, retry exhaustion, approval blocking, and policy violations can all produce a durable escalation record. The dashboard can surface the escalation object directly.

## Why This Is Safer

Stage 9 makes the system safer in three ways:

1. It narrows who can act.
2. It narrows what each job can do.
3. It preserves a durable audit trail for review.

That gives NStepOS a production-ready control plane without changing the core architecture or product workflows.
