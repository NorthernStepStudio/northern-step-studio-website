-- Migration: Synox Build and Deployment Intelligence
-- Adds structural tracking for build runs, logs, deployments, and release readiness.

-- 1. Build Runs
CREATE TABLE IF NOT EXISTS build_runs (
  id TEXT PRIMARY KEY,
  app_key TEXT NOT NULL,
  project_id INTEGER,
  source TEXT, -- e.g. 'manual', 'cicd', 'github_action'
  platform TEXT, -- e.g. 'android', 'ios', 'web', 'worker'
  build_type TEXT, -- e.g. 'debug', 'release', 'production'
  status TEXT DEFAULT 'pending', -- 'pending', 'running', 'success', 'failed'
  started_at TEXT DEFAULT CURRENT_TIMESTAMP,
  finished_at TEXT,
  duration_ms INTEGER,
  version_name TEXT,
  version_code TEXT,
  artifact_name TEXT,
  artifact_path_label TEXT,
  summary TEXT,
  risk_level TEXT DEFAULT 'low',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- 2. Build Run Logs
CREATE TABLE IF NOT EXISTS build_run_logs (
  id TEXT PRIMARY KEY,
  build_run_id TEXT NOT NULL,
  phase TEXT, -- e.g. 'init', 'compile', 'bundle', 'sign', 'upload'
  level TEXT DEFAULT 'info', -- 'info', 'warn', 'error', 'debug'
  message TEXT NOT NULL,
  redacted INTEGER DEFAULT 0,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(build_run_id) REFERENCES build_runs(id)
);

-- 3. Deployment Runs
CREATE TABLE IF NOT EXISTS deployment_runs (
  id TEXT PRIMARY KEY,
  app_key TEXT NOT NULL,
  project_id INTEGER,
  environment TEXT, -- e.g. 'preview', 'staging', 'production'
  provider TEXT, -- e.g. 'cloudflare', 'vercel', 'aws'
  status TEXT DEFAULT 'pending',
  url TEXT,
  commit_sha TEXT,
  started_at TEXT DEFAULT CURRENT_TIMESTAMP,
  finished_at TEXT,
  summary TEXT,
  risk_level TEXT DEFAULT 'low',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- 4. Release Artifacts
CREATE TABLE IF NOT EXISTS release_artifacts (
  id TEXT PRIMARY KEY,
  app_key TEXT NOT NULL,
  project_id INTEGER,
  artifact_type TEXT, -- e.g. 'apk', 'aab', 'bundle', 'wasm'
  artifact_name TEXT NOT NULL,
  version_name TEXT,
  version_code TEXT,
  path_label TEXT,
  size_bytes INTEGER,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- 5. Release Readiness Checks
CREATE TABLE IF NOT EXISTS release_readiness_checks (
  id TEXT PRIMARY KEY,
  app_key TEXT NOT NULL,
  project_id INTEGER,
  check_key TEXT NOT NULL,
  status TEXT DEFAULT 'pending', -- 'pending', 'pass', 'fail', 'warn'
  message TEXT,
  severity TEXT DEFAULT 'normal', -- 'normal', 'high', 'critical'
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_build_runs_app ON build_runs(app_key);
CREATE INDEX IF NOT EXISTS idx_build_runs_status ON build_runs(status);
CREATE INDEX IF NOT EXISTS idx_build_run_logs_run ON build_run_logs(build_run_id);
CREATE INDEX IF NOT EXISTS idx_deployment_runs_app ON deployment_runs(app_key);
CREATE INDEX IF NOT EXISTS idx_release_artifacts_app ON release_artifacts(app_key);
CREATE INDEX IF NOT EXISTS idx_readiness_checks_app ON release_readiness_checks(app_key);
