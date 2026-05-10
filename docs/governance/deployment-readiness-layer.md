# Deployment Readiness Layer

Deployment readiness checklists are maintained in:

- `docs/deployments/readiness/<change-id>.md`

Generate a checklist:

- `npm run governance:readiness -- --change-id <id> --owner <name>`

For `high` and `critical` risk classes, checklist completion is mandatory for a passing governance gate.
