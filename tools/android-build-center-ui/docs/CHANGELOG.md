# Changelog — NStep Android Build Center

All notable changes to this project should be documented in this file.

2026-05-04 — Stabilization and safety refactor
- Added feature contract, security rules, and architecture docs in `tools/android-build-center-ui/docs/`.
- Added/updated verification checks `scripts/verify-build-center.js` to validate UI anti-patterns, missing docs, and API contract.
- Introduced normalization in frontend (`normalizeApp`) to prevent crashes when discovery fields are missing.
- Added server dev cache-control headers and index.html cache-bust param to avoid stale ES modules during development.

Instructions
------------
- Before changing discovery, credential, or build logic update `docs/FEATURE_CONTRACT.md` and run `npm run verify` locally.
# Changelog: NStep Android Build Center

All notable changes to this project will be documented in this file.

## [1.1.0] - 2026-05-04
### Added
- Created foundational documentation: `FEATURE_CONTRACT.md`, `SECURITY_RULES.md`, `ARCHITECTURE.md`.
- Initiated project modularization and stabilization.

### Fixed
- Identified "debug.keystore" as a blocking artifact in discovery; implemented exclusion logic.
- Resolved orphaned keystore password mismatch by prioritizing workspace-detected secrets during auto-generation.

## [1.0.1] - 2026-05-04
### Added
- Windows Credential Manager integration for persistent password storage.
- Auto-generation policy for private apps.

### Fixed
- Resolved session vault data loss on server restart.

## [1.0.0] - 2026-05-03
### Added
- Initial implementation of the Build Center UI.
- App discovery and basic build orchestration.
