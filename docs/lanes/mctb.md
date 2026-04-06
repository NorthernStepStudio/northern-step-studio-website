# MCTB Knowledge

This lane is the canonical source for missed-call text back workflows, consent rules, opt-out handling, and message audit behavior.

## What this lane must answer

- Is texting allowed?
- What consent is required?
- How does opt-out work?
- What happens when delivery fails?

## MVP truth set

- Consent and opt-out policy.
- Message templates.
- Lead recovery playbook.
- Webhook and integration docs.
- Audit logging spec.

## P0 missing items

- Consent and opt-out policy.
- Message templates.
- Audit logging specification.

## P1 missing items

- Rate limits and quiet hours.
- Frequency guidance.
- Messaging compliance notes.

## P2 later items

- Deliverability playbook.
- Carrier compliance update process.
- Monitoring and escalation runbooks.

## Retrieval hooks

- Consent, revocation, and STOP questions should always use this lane.
- Lead recovery questions should cite the playbook, not general marketing advice.

## Safety notes

- Treat consent as mandatory.
- Respect revocation immediately.
- Keep audit trails and suppression rules explicit.

