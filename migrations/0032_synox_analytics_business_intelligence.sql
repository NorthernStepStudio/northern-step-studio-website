-- Migration: Synox Analytics and Business Intelligence
-- Extends the analytics system with daily momentum, activity logs, and intelligence summaries.

-- 1. App Momentum Daily (Aggregated metrics)
CREATE TABLE IF NOT EXISTS app_momentum_daily (
  id TEXT PRIMARY KEY,
  app_key TEXT NOT NULL,
  date_key TEXT NOT NULL, -- e.g. '2026-05-08'
  page_views INTEGER DEFAULT 0,
  cta_clicks INTEGER DEFAULT 0,
  play_clicks INTEGER DEFAULT 0,
  build_count INTEGER DEFAULT 0,
  deploy_count INTEGER DEFAULT 0,
  risk_count INTEGER DEFAULT 0,
  readiness_score INTEGER DEFAULT 0,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(app_key, date_key)
);

-- 2. Project Activity Daily
CREATE TABLE IF NOT EXISTS project_activity_daily (
  id TEXT PRIMARY KEY,
  project_id INTEGER NOT NULL,
  date_key TEXT NOT NULL,
  notes_count INTEGER DEFAULT 0,
  decisions_count INTEGER DEFAULT 0,
  risks_count INTEGER DEFAULT 0,
  goals_completed INTEGER DEFAULT 0,
  build_failures INTEGER DEFAULT 0,
  deploy_failures INTEGER DEFAULT 0,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(project_id, date_key)
);

-- 3. Admin Activity Log (Internal audit)
CREATE TABLE IF NOT EXISTS admin_activity_log (
  id TEXT PRIMARY KEY,
  actor_id TEXT NOT NULL, -- UUID or user ID
  action TEXT NOT NULL, -- e.g. 'update_project', 'seed_memory', 'import_snapshot'
  target_type TEXT, -- e.g. 'project', 'memory', 'build'
  target_id TEXT,
  summary TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- 4. Intelligence Summaries (Matterhorn reasoning outputs)
CREATE TABLE IF NOT EXISTS intelligence_summaries (
  id TEXT PRIMARY KEY,
  summary_type TEXT NOT NULL, -- e.g. 'weekly_momentum', 'launch_readiness', 'risk_audit'
  period_key TEXT, -- e.g. '2026-W18'
  app_key TEXT,
  project_id INTEGER,
  summary TEXT NOT NULL,
  risk_level TEXT DEFAULT 'low',
  confidence REAL DEFAULT 1.0,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- 5. Business Events (Optional: higher fidelity events if raw analytics table is too noisy)
-- We will use the existing 'analytics' table for now to avoid duplication, 
-- but adding a view or structured access pattern in Synox logic.

-- Indexes
CREATE INDEX IF NOT EXISTS idx_app_momentum_date ON app_momentum_daily(date_key);
CREATE INDEX IF NOT EXISTS idx_project_activity_date ON project_activity_daily(date_key);
CREATE INDEX IF NOT EXISTS idx_admin_activity_actor ON admin_activity_log(actor_id);
CREATE INDEX IF NOT EXISTS idx_intelligence_period ON intelligence_summaries(period_key);
