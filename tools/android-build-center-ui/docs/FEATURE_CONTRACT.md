NStep Android Build Center — Feature Contract
===========================================

Purpose
-------
NStep Android Build Center is a private local developer tool used on the owner's PC to build APK/AAB artifacts. It is not a hosted public application. This contract defines the required features, visible behaviors, and non‑functional invariants for the Local Build Center UI and backend. The goal is to preserve existing capabilities, eliminate brittle assumptions, and provide stable local API/behavioral boundaries that future changes must respect.

Required Features (high level)
-------------------------------
- App Discovery: configured apps from `apps.json` must render immediately; a subsequent Scan Workspace enriches or replaces configured apps with discovered metadata. Discovery detects nested app roots and Android projects.
- Credential Engine: must detect keystore files and credential sources, support a session vault and Windows Credential Manager (WCM) without exposing secrets.
- Scan / Get / Fill / Generate workflow: Scan finds apps and credentials; Get/Use accesses approved sources; Fill uses session-only secrets; Generate creates keys only for private apps and is disabled for protected production apps.
- Production Guard: apps with `alreadyOnGooglePlay: true` or explicit `isProduction` must be protected and never auto-generated or overwritten.
- Build Engine: build scripts exist (PowerShell) for APK/AAB, must validate credentials, produce artifacts, stream logs, and never report false success.
- UI: required cards, state display, inline password entry, clear action buttons; no blocking browser dialogs.
- Security: no plaintext passwords in `apps.json`, logs, or committed files; temporary signing props must be cleaned up after builds.

Local API contract — frontend-facing local API fields expected from `/api/apps`
----------------------------------------------------------------------------
Each returned app object SHOULD contain (default values acceptable when unknown):
- `id` (string)
- `displayName` (string)
- `path`, `appRoot`, `androidPath` (strings)
- `packageName`, `versionName`, `versionCode` (strings)
- `classification`: one of `private`, `production`, `private_assumed`, `unknown` (default: `unknown`)
- `credentialState`: one of `ready`, `found_unvalidated`, `keystore_found_password_missing`, `password_found_keystore_missing`, `missing`, `invalid`, `production_protected` (default: `missing`)
- `safeMessage`: string (default: "Run Scan Workspace to discover credential state.")
- `readiness`: human label (default: `Unknown`)
- `warnings`: array (default: [])
- `nextActions`: array (default: ["scan"]) 
- Booleans: `keystoreFound`, `passwordSourceFound`, `credentialsLoaded`, `credentialsValidated`, `alreadyOnGooglePlay`, `productionWarning`, `isProduction` (defaults: false)

UI actions by credentialState
--------------------------------
- `ready`: render `Select & Fill` action
- `found_unvalidated`: render `Validate Existing` action
- `keystore_found_password_missing`: `Enter Password` (or `Generate` for non-production/private)
- `password_found_keystore_missing`: `Fix Path` or `Manual Entry`
- `missing`: for private apps `Generate` + `Enter Password`, for production apps, show protected state
- `invalid`: show validation error and `Enter Password` / `Fix Path`
- `production_protected`: show guarded UI; disable generation and destructive actions

Build state behavior
--------------------
- Build steps produce streaming logs; a phase detector classifies phases; errors produce `FAILED_PRECHECK` or `BUILD_FAILED` labels that appear in logs and stop build flow.
- `signing.temp.properties` must be created per-build and removed immediately after build; never commit it.

What must never be removed
-------------------------
- App Discovery and configured apps rendering
- Credential Engine and its states enforcement
- Production guard rules
- Security rules regarding secrets

Contract enforcement
--------------------
Any code touching discovery, credential resolution, or rendering must:
- Use `normalizeApp()` before rendering
- Avoid calling string methods on possibly-undefined values
- Respect immutable production guard checks

Change management
-----------------
All changes that alter the contract must update `docs/FEATURE_CONTRACT.md` and pass `scripts/verify-build-center.js` checks before merging.

Signed-off-by: NStep Build Center Maintainer
# Feature Contract: NStep Android Build Center

This document defines the mandatory features and behaviors of the NStep Android Build Center. Any refactoring or modification MUST preserve these invariants.

## 1. App Discovery
- **Recursive Scan:** Must recursively scan the workspace for directories containing `package.json` with `expo` or `react-native` dependencies.
- **Path Support:** Must support nested app paths (e.g., `apps/nexusbuild/apps/mobile`).
- **Metadata Detection:** Must extract `packageName` from `build.gradle` and `version` from `package.json`.
- **Config Sync:** Discovered apps must be matched against `apps.json` using their relative path as the unique key.

## 2. Credential Engine
- **Hierarchical Detection:** Must check for credentials in this order:
  1. Current Session Vault (Memory)
  2. Windows Credential Manager (OS)
  3. EAS `credentials.json` (Local file)
  4. `signing.temp.properties` (Local file - recovery only)
- **Validation:** Credential status "Ready" MUST only be granted if `keytool -list` succeeds with the provided password.
- **States:**
  - `ready`: Validated keystore + password.
  - `found_unvalidated`: Keystore + password detected but not yet verified.
  - `keystore_found_password_missing`: Keystore exists but no password found.
  - `password_found_keystore_missing`: Password found but keystore file missing.
  - `missing`: No credentials detected.
  - `invalid`: Keystore validation failed.
  - `production_protected`: Guarded state for live apps.

## 3. Production Guard
- **Immutable Keys:** Apps flagged as `alreadyOnGooglePlay: true` or `isProduction: true` MUST NEVER have their keys auto-generated or replaced.
- **Explicit NexusBuild Protection:** `nexusbuild` is explicitly a production app and must be shielded from all destructive actions.
- **Visual Shielding:** Production apps must be clearly badged (e.g., 🛡 PRODUCTION).

## 4. Build Orchestration
- **PowerShell Integration:** Must trigger `build-apk.ps1` and `build-aab.ps1`.
- **Real-time Streaming:** Logs must be streamed to the UI via Server-Sent Events (SSE).
- **Phase Detection:** Must detect and display build phases (e.g., "Cleaning Gradle", "Running Gradle", "Signing").
- **Failure Handling:** If the build process exits with a non-zero code, the UI must show "FAILED" and extract the relevant error from the log.
- **Artifact Verification:** A "Success" state MUST only be shown if the output file actually exists on disk.

## 5. UI Requirements
- **Action-Oriented Cards:** Each app card must show specific actions based on state (e.g., "Select & Fill", "Generate", "Enter Password").
- **Non-Intrusive:** No browser `alert()`, `confirm()`, or `prompt()`. All interactions must be inline.
- **Responsive Layout:** No horizontal scrollbars in the app discovery area.
- **Visual Feedback:** Clear color-coded indicators for credential readiness.
