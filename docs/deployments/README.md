# Deployment Governance

Deployment readiness is managed through checklists in:

- `docs/deployments/readiness/`

For `high` and `critical` risk changes, checklist completion is required by the governance gate.

Create a checklist with:

- `npm run governance:readiness -- --change-id CHG-0001 --owner <name>`
