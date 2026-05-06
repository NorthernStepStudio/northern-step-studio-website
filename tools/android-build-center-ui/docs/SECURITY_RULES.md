NStep Android Build Center — Security Rules
=========================================

Important note
--------------
The `public/` folder contains static frontend assets only. This does not mean the Build Center is public or internet-facing — it is a local-only UI served by the local Node server for use on the owner's machine at `http://localhost:4545`.

Scope
-----
Rules that must be enforced across scripts, server, and UI to avoid secret leakage and accidental credential exposure.

Where secrets MAY exist (temporary / approved):
- In-memory session vault during runtime only (never persisted to disk by the server in plaintext).
- In temporary files created during a single build (e.g., `android/signing.temp.properties`) — these must be deleted immediately after build.
- Windows Credential Manager (WCM) entries (encrypted by OS) when `remember` is selected.

Where secrets MUST NEVER exist (persistent / committed):
- `tools/android-build-center/apps.json` — NEVER store passwords, keystore passwords, or key passwords here.
- Any file in repository tree (committed): `.md`, `.json`, `.js`, `.ps1`, `package.json`, etc.
- Logs stored under `logs/` must not contain passwords or full keystore secrets.

Keystore rules
--------------
- Keystores must be stored under `private-keys/android/<appId>/` (already .gitignored).
- `.keystore` and `.jks` files must be ignored by `.gitignore` (verify presence of patterns: `**/*.keystore`, `**/*.jks`, `private-keys/`).
- `create-keystore.ps1` and `generate-reset-key.ps1` can create keystores locally but must warn the user to backup and not commit.
- Keystore passwords must be supplied at build time through environment variables or session vault and must not be written to logs or committed files.

Password rules
--------------
- Passwords may be accepted from typed UI input (session only) and stored only in server session vault; when `remember` is chosen, use WCM.
- Never echo the password in UI, logs, or API responses. Any use of `console.log` must mask or avoid printing secrets.

Logging rules
-------------
- Log streams may contain operational messages, but must never include full credential strings.
- If a build tool prints a password, the log writer must redact it before saving or streaming.

.gitignore / repo hygiene
-------------------------
- Ensure `.gitignore` contains: `private-keys/`, `**/*.keystore`, `**/*.jks`, `**/signing.temp.properties`, `**/credentials.json`, `**/secrets.json`.
- Prevent accidental addition of keystores via CI hooks or verification scripts (verify script present in `tools/android-build-center-ui/scripts/verify-build-center.js`).

Production rules
----------------
- Apps with `alreadyOnGooglePlay:true` or explicit `isProduction:true` are protected: key replacement and auto-generation must be disabled; user must explicitly perform reset flows.

Verification
------------
- The verification script must run as part of local checks and CI to ensure these rules are honored.
# Security Rules: NStep Android Build Center

This document defines the security boundaries and credential handling rules for the Build Center. Violating these rules is a critical failure.

## 1. Password Persistence
- **Forbidden Locations:** Passwords MUST NEVER be saved to:
  - `apps.json`
  - `package.json`
  - `README.md`
  - `.log` files
  - Permanent `gradle.properties` files
  - Browser `localStorage` or `cookies`
- **Allowed Locations:**
  - **In-Memory:** `sessionVault` in the Node.js process (wiped on restart).
  - **Encrypted OS Store:** Windows Credential Manager (via `cmdkey`).
  - **Transient Files:** `signing.temp.properties` during a build (MUST be deleted immediately after build completion, regardless of success/failure).

## 2. Keystore Management
- **Git Ignore:** All `.keystore` and `.jks` files MUST be ignored by Git.
- **Secure Storage:** Auto-generated keys MUST be stored in `private-keys/android/<appId>/`.
- **Exclusion:** `debug.keystore` MUST be ignored by the discovery engine to prevent treating development keys as production keys.

## 3. Exposure Rules
- **UI Masking:** Passwords in the UI must use `type="password"`.
- **No Console Logging:** Full or partial passwords MUST NEVER be printed to the Node.js console or the browser developer console.
- **Restricted Returns:** API responses should only return boolean indicators (e.g., `credentialsLoaded: true`) rather than actual password strings, unless specifically requested for a one-time "show once" display after generation.

## 4. Production Safeguards
- **Manual Override Only:** Production apps (`alreadyOnGooglePlay: true`) cannot have credentials modified via auto-discovery. Changes must be made via explicit manual entry or recovery from approved sources.
- **Reset Key Flow:** Resetting a key for a production app is a destructive action and must be protected by additional UI confirmation (non-native) and explicit intent.
