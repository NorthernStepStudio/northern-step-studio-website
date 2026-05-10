-- Synox System Hardening
-- Migration: 0034_synox_system_hardening.sql

-- 1. Performance Indexes for Reasoning
CREATE INDEX IF NOT EXISTS idx_project_notes_project ON project_notes(project_id);
CREATE INDEX IF NOT EXISTS idx_project_goals_project ON project_goals(project_id);
CREATE INDEX IF NOT EXISTS idx_project_risks_project ON project_risks(project_id);
CREATE INDEX IF NOT EXISTS idx_project_decisions_project ON project_decisions(project_id);

CREATE INDEX IF NOT EXISTS idx_build_runs_app ON build_runs(app_key);
CREATE INDEX IF NOT EXISTS idx_build_run_logs_build ON build_run_logs(build_run_id);
CREATE INDEX IF NOT EXISTS idx_deployment_runs_app ON deployment_runs(app_key);

-- 2. Constraint Hardening
-- Ensure unique app_key for readiness checks to prevent duplicates
CREATE UNIQUE INDEX IF NOT EXISTS idx_readiness_app_check ON release_readiness_checks(app_key, check_key);

-- 3. Consistency Pass (Renaming metadata if legacy names found)
-- No destructive renames, just adding comments/labels
ALTER TABLE projects ADD COLUMN internal_type TEXT DEFAULT 'studio_project';
