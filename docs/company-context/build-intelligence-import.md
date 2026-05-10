# Synox Build Intelligence: Import Specification

This document defines the payload shape for importing build and deployment intelligence from external systems (e.g., NStep Build Center, GitHub Actions, Cloudflare Pages).

## 1. Create Build Run
**Endpoint**: `POST /api/admin/intelligence/builds`

**Payload**:
```json
{
  "id": "optional-uuid",
  "app_key": "nexus-build",
  "project_id": 12,
  "source": "manual | cicd | github_action",
  "platform": "android | ios | web | worker",
  "build_type": "debug | release | production",
  "status": "pending | running | success | failed",
  "version_name": "1.0.4",
  "version_code": "104",
  "artifact_name": "nexus-build-release.apk",
  "artifact_path_label": "r2://builds/android/104",
  "summary": "Full production build with signing.",
  "risk_level": "low | medium | high"
}
```

## 2. Append Build Logs
**Endpoint**: `POST /api/admin/intelligence/builds/:id/logs`

**Payload**:
```json
{
  "phase": "init | compile | bundle | sign | upload",
  "level": "info | warn | error | debug",
  "message": "Raw log line or multi-line block."
}
```
*Note: Synox automatically redacts sensitive patterns (keys, tokens) before storage.*

## 3. Register Deployment
**Endpoint**: `POST /api/admin/intelligence/deployments`

**Payload**:
```json
{
  "app_key": "nstep-website",
  "environment": "preview | staging | production",
  "provider": "cloudflare | vercel | aws",
  "status": "success | failed",
  "url": "https://preview-123.nstep.dev",
  "commit_sha": "a1b2c3d4",
  "summary": "Deployed via GitHub Action #442",
  "risk_level": "low"
}
```

## 4. Release Readiness Check
**Endpoint**: `POST /api/admin/intelligence/release-readiness`

**Payload**:
```json
{
  "app_key": "neuromoves-mobile",
  "check_key": "A11Y_AUDIT",
  "status": "pass | fail | warn | pending",
  "message": "Accessibility audit passed with 0 critical issues.",
  "severity": "normal | high | critical"
}
```
