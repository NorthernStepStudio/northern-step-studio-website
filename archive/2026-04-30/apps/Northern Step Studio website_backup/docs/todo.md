# Todo

## Important Notes

- Owner and admin users can always see all features, even when toggles are disabled.
- Regular users and logged-out visitors respect feature toggles.
- Verify toggle behavior in an incognito session or with a non-admin test user.
- Development and production databases are separate; toggle changes must be applied in each environment.

## Recently Completed

- Feature toggle system with admin controls
- Reliable homepage GlitchedText startup
- Owner role hierarchy and admin visibility rules
- Website-services cleanup and studio positioning refresh

## Follow Up

- Plan a separate migration review for legacy `beta_interest`, `contact_messages.sms_consent`, and `responseos_state` data before deleting historical records or schema.
