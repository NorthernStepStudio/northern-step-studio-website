# ProvLy Legal and Privacy Operations Notes

## Provider Identity
- Product: ProvLy
- Company: Northern Step Studio
- Legal Contact: legal@provly.app
- Website: https://northernstep.studio

## Regulatory Baseline (US-focused)
- CCPA/CPRA obligations where applicable.
- App store privacy disclosures kept aligned with shipped behavior.
- Subscription disclosures must clearly identify billing source and renewal model.

## In-App Legal Endpoints and Controls
- `POST /v1/account/export-all`: Full account export.
- `DELETE /v1/account`: Account deletion request.
- `GET /v1/account/audit-logs`: Export/deletion activity log.

## Local-First Policy Position
ProvLy operates in local-first mode by default:
- inventory data remains on device unless user enables cloud-linked features.
- cloud-linked features are explicit user actions (login, sync, export, AI).

## Contract Set
- [TERMS.md](./TERMS.md): Terms of Service.
- [PRIVACY.md](./PRIVACY.md): Privacy Policy.

Both documents must be kept in sync with:
- mobile Legal screen text,
- app store policy declarations,
- backend feature behavior.

