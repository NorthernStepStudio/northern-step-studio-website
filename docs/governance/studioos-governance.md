# NStep StudioOS Governance Rules

## Protected Files
- `wrangler.toml`
- `.dev.vars`
- `src/worker/auth.ts`
- `package-lock.json`
- `credentials/`
- `private-keys/`

## Forbidden Actions
- auto deploy
- auto git push
- auto delete
- destructive migration
- env overwrite
- silent dependency upgrades
- silent repo rewrites
- uncontrolled shell execution

## Mandatory Actions
- snapshot before edits
- diff generation
- rollback creation
- validation pass
- audit log creation
- dependency impact scan

## Agent Constraints

### Matterhorn
- advisory-first
- no autonomous deployment
- no protected file modifications
- no destructive actions

### Synox
- orchestration only
- policy enforcement
- governance routing
- approval management

### Repo Tools
- read-first policy
- verification before write

## Audit Layer

### Objective
Track every important operation performed across StudioOS.

Every action must log:
- timestamp
- actor
- repo
- action type
- changed files
- risk level
- validation result
- rollback availability

## D1 Tables

### `audit_events`
```sql
CREATE TABLE audit_events (
  id TEXT PRIMARY KEY,
  timestamp TEXT,
  actor TEXT,
  action_type TEXT,
  project TEXT,
  risk_level TEXT,
  summary TEXT,
  affected_files TEXT,
  validation_status TEXT,
  rollback_available INTEGER
);
```

### `repo_integrity_reports`
```sql
CREATE TABLE repo_integrity_reports (
  id TEXT PRIMARY KEY,
  repo_name TEXT,
  timestamp TEXT,
  duplicate_files INTEGER,
  orphan_files INTEGER,
  broken_imports INTEGER,
  circular_dependencies INTEGER,
  missing_envs INTEGER,
  ts_errors INTEGER,
  warnings TEXT
);
```

### `deployment_readiness`
```sql
CREATE TABLE deployment_readiness (
  id TEXT PRIMARY KEY,
  project_name TEXT,
  timestamp TEXT,
  build_passed INTEGER,
  lint_passed INTEGER,
  tests_passed INTEGER,
  secrets_valid INTEGER,
  mobile_verified INTEGER,
  rollback_verified INTEGER,
  approved_by TEXT
);
```

### `snapshot_registry`
```sql
CREATE TABLE snapshot_registry (
  id TEXT PRIMARY KEY,
  project_name TEXT,
  timestamp TEXT,
  snapshot_path TEXT,
  git_commit TEXT,
  created_by TEXT,
  recovery_verified INTEGER
);
```

## Verification Layer

### Objective
Nothing is trusted unless verified.

### Verification Types

#### A. Structural Verification
Checks:
- broken imports
- orphaned files
- duplicated modules
- circular dependencies
- missing routes
- dead screens
- config mismatches
- package inconsistencies

Run against:
- `/apps/`
- `/packages/`
- `/tools/`

#### B. Runtime Verification
Checks:
- local servers boot
- APIs respond
- D1 connections work
- Supabase auth works
- Ollama reachable
- LM Studio reachable
- SSE streams function
- Android build scripts function
- Workers boot correctly

#### C. UI Verification
Checks:
- visual overflow
- broken navigation
- missing buttons
- spacing inconsistencies
- mobile responsiveness
- dark mode consistency
- scroll lock issues
- layout breakage

Critical targets:
- Build Center
- Matterhorn UI
- Studio Dashboard
- NeuroMoves
- NexusBuild
- ProvLy

#### D. Security Verification
Checks:
- exposed secrets
- env leakage
- committed private keys
- unrestricted endpoints
- unsafe shell execution
- admin bypass
- unsafe CORS
- token exposure
- unrestricted file access

## Snapshot & Evidence Layer

### Objective
Every major change must be recoverable.

### Snapshot Requirements
Before major edits generate:
- repo tree snapshot
- dependency snapshot
- git status snapshot
- route snapshot
- DB schema snapshot
- screenshot snapshot
- build status snapshot

### Snapshot Structure
`/studioos/snapshots/`

```plaintext
snapshots/
  2026-05-09/
    nexusbuild/
    neuromoves/
    matterhorn/
```

## Change Approval System

### Objective
Prevent uncontrolled architecture drift.

### Change Pipeline

#### Stage 1 - Proposal
Agent explains:
- what changes
- why
- affected files
- estimated risk
- dependencies impacted

#### Stage 2 - Dry Audit
NO edits yet.

Only:
- impact analysis
- dependency scan
- breakage prediction
- integrity scan

#### Stage 3 - Snapshot
Create recovery point.

#### Stage 4 - Controlled Change
Edits restricted to approved files.

#### Stage 5 - Verification Pass
Must pass:
- TypeScript
- runtime
- UI
- build
- security
- deployment validation

#### Stage 6 - Human Approval
ONLY after approval:
- merge
- deploy
- publish

## StudioOS Governance Dashboard

Create a dedicated Governance section inside StudioOS.

### Governance Modules
- Audit Feed
- Repo Integrity
- Deployment Readiness
- Validation Center
- Risk Monitor
- Recovery Snapshots
- Protected Files
- Change Queue
- Agent Activity
- Build Verification
- Security Warnings
- Dependency Health
- Snapshot Explorer

## Risk Classification System

Every operation receives a risk score.

### GREEN - SAFE
Examples:
- text changes
- spacing fixes
- documentation
- isolated UI tweaks

### YELLOW - MODERATE
Examples:
- component rewrites
- routing changes
- DB reads
- dependency updates
- refactors

### ORANGE - HIGH
Examples:
- auth changes
- build scripts
- Android signing
- Worker routing
- deployment configs
- runtime engine changes

### RED - CRITICAL
Examples:
- env vars
- secrets
- DB migrations
- auth providers
- delete operations
- deployment infra
- credential systems

RED requires:
- snapshot
- validation
- manual approval
- rollback verification

## Agent Responsibilities

### Matterhorn
Purpose:
- execution intelligence
- repo analysis
- audits
- validation reports
- risk detection

Restrictions:
- no autonomous deployment
- no destructive actions
- no protected file edits

### Synox
Purpose:
- orchestration
- governance enforcement
- workflow sequencing
- approval routing
- memory coordination
- policy enforcement

Restrictions:
- no direct infrastructure overwrite
- no uncontrolled repo execution

## Protected Files

These files/folders require elevated approval:
- `wrangler.toml`
- `.dev.vars`
- `src/worker/auth.ts`
- `package-lock.json`
- `credentials/`
- `private-keys/`
- `android/keystore/`

## Required Pre-Commit Checks

Before merge/deploy:
- TypeScript pass
- lint pass
- runtime validation
- route validation
- build verification
- mobile verification
- dependency validation
- security scan
- snapshot creation

## Deployment Readiness Checklist

Before deployment verify:
- build succeeds
- envs valid
- secrets present
- rollback exists
- mobile builds verified
- Workers deploy correctly
- APIs respond
- auth works
- DB migrations safe
- analytics intact

## Recommended Implementation Order
- Governance Docs
- Audit Tables
- Repo Integrity Scanner
- Validation Center
- Risk Classification System
- Snapshot Manager
- Deployment Readiness Dashboard
- Approval Queue
- Protected File Locking
- Agent Governance Routing

## Final Objective

NStep StudioOS should operate as:
- a controlled execution environment
- a governed AI-native workspace
- a recoverable infrastructure platform
- a verification-first engineering system
- a safe multi-agent operating layer

NOT:
- uncontrolled autonomous tooling
- unsafe AI repo mutation
- silent architecture drift
- deployment roulette
