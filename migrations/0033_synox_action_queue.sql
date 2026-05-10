-- Migration: Synox Action Queue
-- Implements a recommendation-based action queue for Synox and Matterhorn.

CREATE TABLE IF NOT EXISTS intelligence_action_queue (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  source_type TEXT NOT NULL, -- e.g. 'risk', 'build_failure', 'stale_momentum'
  source_id TEXT, -- Link to the originating record
  project_id INTEGER,
  app_key TEXT,
  priority TEXT DEFAULT 'medium', -- 'low', 'medium', 'high', 'critical'
  risk_level TEXT DEFAULT 'low',
  status TEXT DEFAULT 'suggested', -- 'suggested', 'accepted', 'in_progress', 'blocked', 'done', 'dismissed'
  recommended_by TEXT DEFAULT 'Matterhorn',
  reasoning_summary TEXT,
  suggested_prompt TEXT, -- Text-only prompt for Codex/Local Agent
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_action_queue_status ON intelligence_action_queue(status);
CREATE INDEX IF NOT EXISTS idx_action_queue_priority ON intelligence_action_queue(priority);
CREATE INDEX IF NOT EXISTS idx_action_queue_app ON intelligence_action_queue(app_key);
CREATE INDEX IF NOT EXISTS idx_action_queue_project ON intelligence_action_queue(project_id);
