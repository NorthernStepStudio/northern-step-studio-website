# Change Approval Layer

Approval artifacts live in:

- `studioos/validation/approvals/<change-id>.json`

Create an approval record with:

- `npm run governance:approve -- --change-id <id> --approved-by <name> --role admin --risk high`

Required schema checks:

- `changeId` matches run id
- `decision` is `approved`
- `approvedBy`, `approverRole`, and `approvedAt` are present
