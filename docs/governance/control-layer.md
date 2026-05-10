# Control Layer

Control decisions are enforced by `scripts/studioos-governance-gate.mjs`.

Rules:

- classify change risk from `studioos/validation/risk-policy.json`
- require approval for risk at or above `approvalRequiredAtOrAbove`
- reject high-risk execution when approval is missing or invalid
