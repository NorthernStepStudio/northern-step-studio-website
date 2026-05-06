NStep Android Build Center — Architecture Overview
===============================================

Overview
--------
The local Node server serves the static frontend assets from the `public/` folder for local browser use at http://localhost:4545. This Build Center is a private, local-only developer tool run on the owner's machine.

This document describes the module boundaries and data flow for the Build Center. It is intended to guide refactors and ensure responsibilities remain clear.

Target backend layout (key modules)
----------------------------------
tools/android-build-center-ui/
  server.js                — minimal boot + middleware + route wiring
  src/
    config/
      paths.js             — workspace and config path locations
      settings.js          — settings load/save
      constants.js         — enums and invariants
    discovery/
      scanWorkspace.js     — orchestrates a workspace scan (top-level)
      detectApps.js        — finds app roots / package.json / expo projects
      detectAndroidProject.js — validates android/ structure
      detectKeystores.js   — locates keystore files
      detectCredentialSources.js — finds session/WCM indicators
      classifyApp.js       — classification heuristics
    credentials/
      sessionVault.js      — in-memory vault API
      windowsCredentialManager.js — WCM read/write (wrapper)
      credentialResolver.js — given app id, find source and retrieve indicator (not password)
      credentialValidator.js — validates a keystore with given password
      keystoreGenerator.js  — generates keystore (script-driven; careful access)
    builds/
      buildRunner.js       — runs Gradle/Gradlew and orchestrates build phases
      phaseDetector.js     — parses logs for phases
      errorExtractor.js    — extracts meaningful errors
      artifactDetector.js  — finds APK/AAB artifacts and validates size/timestamp
      logWriter.js         — writes and redacts logs
    routes/
      apps.routes.js       — GET /api/apps (normalized), POST/PUT for config
      discovery.routes.js  — /api/discovery endpoints
      credentials.routes.js— endpoints for secrets, validation, save
      builds.routes.js     — build start/cancel/status
      keystore.routes.js   — create/generate keystore endpoints
    utils/
      safeLogging.js       — redact helpers
      pathUtils.js         — safe path joins and normalization
      jsonUtils.js         — readJson/writeJson helpers
      processUtils.js      — spawn helpers and env helpers

Frontend layout
---------------
public/
  index.html
  style.css
  src/
    api.js                — small fetch wrapper
    state.js              — app-level subscription state
    render/
      renderApps.js
      renderBuildStatus.js
      renderLogs.js
      renderCredentialPanel.js
    actions/
      appActions.js
      credentialActions.js
      buildActions.js
    utils/
      dom.js
      format.js            — safe formatting

Data flow (scan → build)
------------------------
1. Client requests configured apps (`GET /api/apps`) — server returns normalized app objects.
2. Client triggers Scan (`POST /api/discovery/scan` or similar) — `scanWorkspace.js` runs detectors and returns `discovered` object or array.
3. Client normalizes discovered app objects and merges them into UI state.
4. Credential resolution uses `sessionVault` and `windowsCredentialManager` — no raw passwords are serialized to responses.
5. Build requests go to buildRunner which creates `signing.temp.properties` (if needed), runs Gradle, streams logs to SSE, and cleans temp files.

Rules for module ownership
--------------------------
- Discovery must not perform credential validation (it may detect keystores but not try passwords). Validation belongs to `credentials/credentialValidator.js`.
- UI rendering must only consume normalized app objects and not rely on optional fields being present.
# Architecture: NStep Android Build Center

This document outlines the modular structure of the Build Center UI and backend.

## 1. Directory Structure

### Backend (`src/`)
- `config/`: Path definitions and security constants.
- `discovery/`: Workspace scanning and app identification logic.
- `credentials/`: Vault management, WCM integration, and validation.
- `builds/`: Build orchestration, log streaming, and artifact detection.
- `routes/`: Express route handlers grouped by domain.
- `utils/`: Common helpers (logging, JSON, shell execution).

### Frontend (`public/src/`)
- `api.js`: All fetch calls to the backend.
- `state.js`: Global UI state management.
- `render/`: Modules for rendering specific UI components (Apps, Logs, Build Info).
- `actions/`: Event handlers and business logic.
- `utils/`: DOM and formatting helpers.

## 2. Data Flow

### Discovery Flow
1. User clicks **Scan Workspace**.
2. Backend scans directories for apps (`discovery/scan`).
3. For each app, it checks for keystores and passwords in allowed sources.
4. It compares findings against `apps.json`.
5. It returns a unified "App Card" object containing metadata and readiness state.

### Build Flow
1. User clicks **Build APK/AAB**.
2. Backend validates that the app is "Ready" (credentials exist and are validated).
3. Backend creates `signing.temp.properties` in the app root.
4. Backend spawns the PowerShell build script.
5. Standard output/error is piped to SSE clients.
6. Build phases are extracted from the stream to update UI status.
7. Upon exit, backend verifies the output artifact and DELETES the temp properties.

## 3. Modular Responsibilities
- **`server.js`**: Main entry point; initializes middleware and wires routes.
- **`src/discovery/scanWorkspace.js`**: Pure logic for finding apps on disk.
- **`src/credentials/sessionVault.js`**: The authoritative in-memory secret store.
- **`src/builds/buildRunner.js`**: Manages the child process lifecycle.
