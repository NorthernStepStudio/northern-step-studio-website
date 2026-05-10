# Governance Quickstart

1. Create a change id (example: `CHG-0142`).
2. Create deployment readiness checklist:
   - `npm run governance:readiness -- --change-id CHG-0142 --owner <name>`
3. Capture pre-change evidence (read/analyze/snapshot):
   - `npm run governance:gate -- --change-id CHG-0142 --skip-verification`
4. If risk is `high` or `critical`, create approval:
   - `npm run governance:approve -- --change-id CHG-0142 --approved-by <name> --role admin --risk high`
5. Execute full verification and enforce controls:
   - `npm run governance:gate:enforce -- --change-id CHG-0142`
6. Deploy only after a passing enforced run and completed readiness checklist.
