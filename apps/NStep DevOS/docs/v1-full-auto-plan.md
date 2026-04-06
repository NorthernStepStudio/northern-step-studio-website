# NSS DevOS v1 Full-Auto Plan

## Goal
Go from one product brief to an automatically advancing build loop with real repo verification, connected provider execution, and human review only when NSS detects risk.

## Current state
- Done: brief intake and deterministic planning
- Done: manual run handoff and pasted result ingestion
- Done: repo-truth verification with local snapshots and local command checks
- Done: connected mock-provider dispatch
- Done: connected automatic ingestion from repo truth
- In progress: connected autopilot chaining to the next task
- Not done: real provider adapters, approval gates, rollback automation, and production-ready run isolation

## Milestone 1: Stable connected automation
- Finish connected autopilot chaining
- Keep operator UI human-readable while preserving repo-truth details behind disclosures
- Ignore NSS-managed runtime files from repo comparisons by default
- Keep `npm run check` green with connected automation covered by smoke

## Milestone 2: Real provider execution
- Add a real Codex API adapter
- Add provider settings validation and connection testing
- Replace fallback polling with actual provider lifecycle polling
- Keep manual paste as a fallback mode
- Keep Ollama Code on the roadmap as the future local-model automation path when cloud APIs are unavailable

## Milestone 3: Approval and safety controls
- Add approval-required states for forbidden paths, broad scope drift, and suspicious repo mismatches
- Add explicit rollback points and restore flow
- Separate operator-facing pass/fail summaries from low-level diagnostics

## Milestone 4: True brief-to-build autopilot
- Auto-dispatch task 1 after planning when connected mode is enabled
- Auto-ingest connected provider results
- Auto-advance to the next task when verification is accepted
- Pause only on retry, human review, rollback, or provider failure
- Add a future Ollama Code connected adapter so the same loop can run against local models without a cloud API key

## Definition of full auto for v1
- User submits the first app description once
- NSS creates the project, milestone, and first task
- NSS dispatches to a connected provider automatically
- NSS verifies against repo truth and local commands
- NSS advances to the next task automatically when safe
- NSS asks the user only when approval or recovery is required
