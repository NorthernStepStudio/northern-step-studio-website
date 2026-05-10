# NStep StudioOS Governance System

## Core Principle

`READ -> ANALYZE -> SNAPSHOT -> VERIFY -> THEN MODIFY`

Non-negotiable controls:

- no modify-first behavior
- no deploy-first behavior
- no silent overwrite
- no uncontrolled agent execution

## Governance Layers

1. Control Layer: role/scoped approvals before high-risk changes.
2. Audit Layer: immutable run records in `studioos/audits/`.
3. Verification Layer: risk-based command execution from `studioos/validation/verification-profile.json`.
4. Recovery Layer: rollback plans generated to `studioos/recovery/`.
5. Snapshot & Evidence Layer: repository state snapshots in `studioos/snapshots/`.
6. Change Approval Layer: structured approval manifests in `studioos/validation/approvals/`.
7. Deployment Readiness Layer: required checklists in `docs/deployments/readiness/`.
8. Risk Classification Layer: path-based risk policy in `studioos/validation/risk-policy.json`.

## Operational Commands

- Generate readiness checklist:
  - `npm run governance:readiness -- --change-id CHG-0001 --owner <name>`
- Write approval record:
  - `npm run governance:approve -- --change-id CHG-0001 --approved-by <name> --role admin --risk high`
- Execute governance gate:
  - `npm run governance:gate -- --change-id CHG-0001`
- Enforce hard-fail behavior:
  - `npm run governance:gate:enforce -- --change-id CHG-0001`

Step sequence reference:

- `docs/governance/quickstart.md`

## Evidence Output

Every governance run writes:

- snapshot JSON: `studioos/snapshots/<run-id>.snapshot.json`
- audit JSON: `studioos/audits/<run-id>.audit.json`
- report markdown: `studioos/reports/<run-id>.report.md`
- rollback plan: `studioos/recovery/<run-id>.rollback.md`
