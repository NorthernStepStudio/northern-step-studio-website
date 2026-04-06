# NStepOS Dashboard UI Architecture

This document defines the dashboard and UI system for NStepOS as a production control surface for goal intake, workflow execution, approvals, logs, memory, and product-specific operations.

## Visual Thesis

The interface should feel like a modern operations console:

- dark-first
- premium and restrained
- business-trustworthy
- dense but readable
- status-forward, not decorative

The product should not open with a marketing hero. The first screen should be the working surface: current status, recent jobs, approvals, and alerts.

### Motion Thesis

Use motion sparingly and with purpose:

- a compact entrance sequence for the dashboard summary strip
- step expansion and collapse in job detail views
- approval state transitions that visibly change the panel
- subtle live refresh indicators, not constant animation

### Type and Color Direction

The current app already uses `Space Grotesk` and `IBM Plex Mono`. Keep that pairing.

Suggested token direction:

- background: near-black blue
- surface: deep slate
- accent: amber for action and focus
- secondary accent: teal for healthy state
- danger: muted red
- warning: gold
- success: green

## Navigation Structure

### Primary Left Rail

Use a persistent left rail on desktop and a slide-out drawer on mobile.

Sections:

1. Overview
2. Jobs
3. Approvals
4. Activity
5. Memory
6. Products
7. Rules
8. Settings

### Top Status Bar

The top bar should always show:

- tenant selector
- environment / backend mode
- live sync state
- search
- notification indicator
- admin/operator mode toggle

### Route Map

Recommended route structure for `apps/nstep-dashboard`:

- `apps/nstep-dashboard/src/app/page.tsx`
- `apps/nstep-dashboard/src/app/jobs/[jobId]/page.tsx`
- `apps/nstep-dashboard/src/app/approvals/page.tsx`
- `apps/nstep-dashboard/src/app/activity/page.tsx`
- `apps/nstep-dashboard/src/app/memory/page.tsx`
- `apps/nstep-dashboard/src/app/products/[product]/page.tsx`
- `apps/nstep-dashboard/src/app/settings/page.tsx`

Keep the current root page as the overview surface, then split detail work into route-based views.

## Component Hierarchy

### Shell Layer

Recommended shell components:

- `apps/nstep-dashboard/src/components/shell/nstep-shell.tsx`
- `apps/nstep-dashboard/src/components/navigation/side-nav.tsx`
- `apps/nstep-dashboard/src/components/navigation/top-bar.tsx`
- `apps/nstep-dashboard/src/components/navigation/search-command.tsx`

### Overview Layer

- `apps/nstep-dashboard/src/components/dashboard/overview-metrics.tsx`
- `apps/nstep-dashboard/src/components/dashboard/recent-jobs.tsx`
- `apps/nstep-dashboard/src/components/dashboard/alerts-rail.tsx`
- `apps/nstep-dashboard/src/components/dashboard/product-status-strip.tsx`

### Execution Layer

- `apps/nstep-dashboard/src/components/jobs/job-timeline.tsx`
- `apps/nstep-dashboard/src/components/jobs/job-summary.tsx`
- `apps/nstep-dashboard/src/components/jobs/job-logs.tsx`
- `apps/nstep-dashboard/src/components/jobs/job-result-panel.tsx`
- `apps/nstep-dashboard/src/components/jobs/job-retry-history.tsx`

### Approval Layer

- `apps/nstep-dashboard/src/components/approvals/approval-queue.tsx`
- `apps/nstep-dashboard/src/components/approvals/approval-detail.tsx`
- `apps/nstep-dashboard/src/components/approvals/approval-preview.tsx`
- `apps/nstep-dashboard/src/components/approvals/risk-badge.tsx`

### Memory Layer

- `apps/nstep-dashboard/src/components/memory/memory-table.tsx`
- `apps/nstep-dashboard/src/components/memory/pattern-editor.tsx`
- `apps/nstep-dashboard/src/components/memory/memory-audit-trail.tsx`

### Product Layer

- `apps/nstep-dashboard/src/components/products/lead-recovery-panel.tsx`
- `apps/nstep-dashboard/src/components/products/nexusbuild-panel.tsx`
- `apps/nstep-dashboard/src/components/products/provly-panel.tsx`
- `apps/nstep-dashboard/src/components/products/product-runlist.tsx`

### Rules Layer

- `apps/nstep-dashboard/src/components/rules/tenant-rules-editor.tsx`
- `apps/nstep-dashboard/src/components/rules/approval-policy-editor.tsx`
- `apps/nstep-dashboard/src/components/rules/template-library.tsx`

### Shared UI Layer

- `apps/nstep-dashboard/src/components/ui/status-pill.tsx`
- `apps/nstep-dashboard/src/components/ui/metric-slab.tsx`
- `apps/nstep-dashboard/src/components/ui/empty-state.tsx`
- `apps/nstep-dashboard/src/components/ui/log-row.tsx`
- `apps/nstep-dashboard/src/components/ui/data-table.tsx`
- `apps/nstep-dashboard/src/components/ui/panel.tsx`

## Screen Designs

### 1. Main NStepOS Dashboard

This is the default operational landing page.

Layout:

- compact system header
- summary metrics row
- recent jobs list
- approval alert strip
- product activity overview
- live logs preview

What it should show:

- recent jobs
- workflow status cards
- success and failure counts
- pending approvals
- alerts
- product activity overview

Wireframe notes:

- left column: intake shortcut, system health, saved templates
- center column: recent jobs, activity, result snapshots
- right column: pending approvals, alerts, memory updates

Design rules:

- do not use a hero banner
- show the working surface immediately
- use one dominant action per region
- keep counts large and labels small

### 2. Job Detail View

This page is the deepest operational inspection surface.

Layout:

- top summary row
- execution timeline
- tool usage panel
- logs panel
- result panel
- retry history
- memory updates
- approval status block

What it should show:

- job summary
- step-by-step execution timeline
- tool usage
- logs
- results
- retry history
- memory updates
- approval status

Wireframe notes:

- left side: timeline and step state
- center: result details and structured output
- right side: logs, approvals, memory writes

Timeline design:

- vertical rail with step nodes
- each node shows step title, tool, state, attempt count, and dependency count
- expandable step detail reveals inputs, outputs, and error messages

### 3. Approval Queue

This should feel urgent and controlled.

Layout:

- queue list of pending items
- detail preview panel
- action rail with approve, reject, edit
- risk summary badge

What it should show:

- jobs waiting for approval
- why approval is needed
- approve / reject / edit options
- risk labels
- preview of outgoing action or message

Wireframe notes:

- first column: queue with severity and product tags
- second column: selected approval detail and diff preview
- third column: policy notes and final action buttons

Approval behavior:

- approve requires a note only for high-risk actions
- reject writes an audit event
- edit opens a composer with side-by-side preview

### 4. Workflow Activity View

This is the product operations view.

Layout:

- active workflows by product
- recent completed runs
- failed runs
- recurring jobs
- lane type indicators

What it should show:

- active workflows by product
- recent completed runs
- failed runs
- recurring jobs
- execution lane type

Wireframe notes:

- top summary strip by product
- activity lane for internal, external, and mixed execution
- failure lane with reasons and retries

### 5. Memory / Patterns View

This is the system learning surface.

Layout:

- searchable pattern table
- editable detail inspector
- audit trail
- confidence indicators
- source job links

What it should show:

- saved workflow patterns
- learned preferences
- known good templates
- editable memory entries
- audit trace of when memory was updated

Wireframe notes:

- left side: filters by product, category, confidence, editability
- center: memory table
- right side: selected pattern editor and provenance

### 6. Product-Specific Panels

Each product gets a focused panel within the same dashboard shell.

Supported products:

- Lead Recovery
- NexusBuild
- ProvLy
- future NStep products

Design rules:

- keep the same shell and navigation
- swap the center content for product-specific operational controls
- preserve shared status patterns
- keep product jargon internal unless the product requires it

Recommended product panel content:

- Lead Recovery: missed-call queue, contactability, message preview, suppression state
- NexusBuild: parts list, compatibility flags, bottlenecks, price watch
- ProvLy: completeness score, missing docs, claim packet readiness, reminders

### 7. System Settings / Rules View

This page is the policy editor for admins.

Layout:

- tenant rules list
- safe/autonomous boundary editor
- approval policy editor
- suppression rules
- communication templates

What it should show:

- tenant rules
- safe/autonomous boundaries
- approval policies
- suppression rules
- communication templates

Wireframe notes:

- policy sections should be form-based and audit-friendly
- each change should show the last updater and timestamp
- destructive policy changes should require explicit confirmation

## Dashboard Card Design Suggestions

Avoid generic SaaS card mosaics. Use focused operational surfaces instead.

Card types:

- metric slab: one number, one label, one note
- status panel: current state and reason
- queue row: one object with actions
- activity lane: grouped runs by product
- inspection block: step, logs, or result payload

Design rules:

- one primary datum per block
- one secondary explanation line
- one state chip
- no decorative icon soup
- no chart unless the chart changes a decision

## Job Timeline UI Design

The timeline should be the clearest part of the job detail view.

Recommended pattern:

- vertical left rail
- step nodes with state color
- dependency line with subtle connectors
- active step highlighted
- completed steps collapsed by default

Each step should display:

- title
- step id
- tool
- attempts
- status
- approval state

Expanded step detail should show:

- input payload
- output payload
- retry history
- error text
- timestamps

## Approval UI Design

Approval UI should never feel hidden.

Required elements:

- risk label
- approval reason
- job summary
- action preview
- policy note
- approve button
- reject button
- edit button

Recommended interaction:

- open approval queue item
- show preview of the exact outbound action
- allow edits before approval
- preserve an audit note on all actions

For messaging workflows:

- show message body in monospace preview
- show character count or length warning
- show channel and recipient
- show suppression checks before approval

## Logs Table Design

Logs should be readable like a console, not a generic table.

Columns:

- time
- level
- job
- step
- product
- message
- details

Behavior:

- sticky filter bar
- full text search
- severity filters
- product filters
- expand row for JSON payload
- copy raw payload button

Visual rules:

- use monospace for payloads and ids
- color level chips sparingly
- keep row density high enough for ops use

## Memory View Design

The memory view should show what the system has learned and why.

Columns:

- key
- category
- product
- confidence
- updated at
- source job
- editability

Inspector panel:

- full memory value
- provenance
- source step
- audit history
- edit controls

The memory UI should support:

- filtering by product
- filtering by category
- searching keys and values
- promoting patterns to templates
- editing or disabling an entry

## Product Panel Design Notes

### Lead Recovery

Show:

- missed-call intake
- lead contactability
- suppression rules
- message preview
- delivery state
- response history

The panel should make it obvious when a follow-up is safe, queued, or blocked.

### NexusBuild

Show:

- intake goal
- build summary
- compatibility warnings
- bottleneck score
- live price watch
- recommended alternatives

The panel should emphasize parts intelligence and pricing deltas.

### ProvLy

Show:

- case status
- inventory completeness score
- missing documentation
- room and category organization
- claim export readiness
- reminder draft state

The panel should feel structured and documentation-focused.

## Suggested Frontend File Structure

Current files to keep and decompose:

- `apps/nstep-dashboard/src/app/page.tsx`
- `apps/nstep-dashboard/src/components/dashboard-client.tsx`
- `apps/nstep-dashboard/src/components/goal-form.tsx`
- `apps/nstep-dashboard/src/lib/backend.ts`
- `apps/nstep-dashboard/src/lib/templates.ts`
- `apps/nstep-dashboard/src/lib/types.ts`
- `apps/nstep-dashboard/src/lib/ui.ts`

Recommended next-step structure:

- `apps/nstep-dashboard/src/app/layout.tsx`
- `apps/nstep-dashboard/src/app/page.tsx`
- `apps/nstep-dashboard/src/app/jobs/[jobId]/page.tsx`
- `apps/nstep-dashboard/src/app/approvals/page.tsx`
- `apps/nstep-dashboard/src/app/activity/page.tsx`
- `apps/nstep-dashboard/src/app/memory/page.tsx`
- `apps/nstep-dashboard/src/app/products/[product]/page.tsx`
- `apps/nstep-dashboard/src/app/settings/page.tsx`
- `apps/nstep-dashboard/src/components/shell/nstep-shell.tsx`
- `apps/nstep-dashboard/src/components/navigation/side-nav.tsx`
- `apps/nstep-dashboard/src/components/navigation/top-bar.tsx`
- `apps/nstep-dashboard/src/components/dashboard/overview-metrics.tsx`
- `apps/nstep-dashboard/src/components/jobs/job-timeline.tsx`
- `apps/nstep-dashboard/src/components/approvals/approval-queue.tsx`
- `apps/nstep-dashboard/src/components/memory/memory-table.tsx`
- `apps/nstep-dashboard/src/components/products/provly-panel.tsx`
- `apps/nstep-dashboard/src/components/products/nexusbuild-panel.tsx`
- `apps/nstep-dashboard/src/components/products/lead-recovery-panel.tsx`
- `apps/nstep-dashboard/src/components/settings/tenant-rules-editor.tsx`

## State Management Suggestions

Keep remote state and local UI state separate.

Recommended split:

- remote data: jobs, memory, approvals, workflow activity, product panels
- local UI state: selected job, filters, active tab, search query, edit drafts

Suggested approach:

- use server-rendered page data where possible
- keep the dashboard shell client-side for live refresh and interactions
- use small custom hooks for each resource
- use a reducer for complex view state if needed

Suggested hooks:

- `apps/nstep-dashboard/src/hooks/use-dashboard.ts`
- `apps/nstep-dashboard/src/hooks/use-job.ts`
- `apps/nstep-dashboard/src/hooks/use-approvals.ts`
- `apps/nstep-dashboard/src/hooks/use-memory.ts`

If the app grows, a lightweight query layer such as SWR or TanStack Query can replace the ad hoc fetch logic.

## Backend Data Contract Suggestions

The current backend already exposes:

- `GET /v1/dashboard`
- `GET /v1/jobs`
- `GET /v1/jobs/:jobId`
- `GET /v1/memory`
- `GET /v1/workflows`
- `POST /v1/goals`
- `POST /v1/jobs/:jobId/approve`

Recommended additions for the dashboard:

- `GET /v1/approvals`
- `GET /v1/jobs/:jobId/detail`
- `GET /v1/workflows/:workflow/runs`
- `GET /v1/products/:product/summary`
- `GET /v1/rules`
- `PATCH /v1/rules/:tenantId`

Suggested detail response shape:

- `job`
- `timeline`
- `logs`
- `result`
- `memoryUpdates`
- `approvalContext`
- `retryHistory`

## Implementation Order

Build the UI in this order:

1. split the current dashboard shell into reusable components
2. replace the landing hero with an operational overview
3. add the job detail route and timeline
4. add the approval queue and preview composer
5. add memory and rules views
6. add product-specific panels for Lead Recovery, NexusBuild, and ProvLy
7. add mobile navigation and search
8. add audit-friendly polish and motion

## Final Design Rule

The UI should always answer three questions fast:

- what is happening
- what needs attention
- what can be done next

If a screen does not help an operator monitor, approve, or correct work, remove it.
