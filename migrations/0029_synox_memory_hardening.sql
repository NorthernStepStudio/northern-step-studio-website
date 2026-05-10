-- Migration: Synox Operational Memory Hardening
-- Adds structural fields to assistant_memory for better grounding and retrieval.

-- 1. Add new columns to assistant_memory
ALTER TABLE assistant_memory ADD COLUMN category TEXT;
ALTER TABLE assistant_memory ADD COLUMN tags TEXT; -- JSON array of strings
ALTER TABLE assistant_memory ADD COLUMN project_id INTEGER;
ALTER TABLE assistant_memory ADD COLUMN confidence REAL DEFAULT 1.0;
ALTER TABLE assistant_memory ADD COLUMN freshness_status TEXT DEFAULT 'active';
ALTER TABLE assistant_memory ADD COLUMN is_archived INTEGER DEFAULT 0;
ALTER TABLE assistant_memory ADD COLUMN created_by TEXT;

-- 2. Create indexes for faster retrieval
CREATE INDEX IF NOT EXISTS idx_assistant_memory_category ON assistant_memory(category);
CREATE INDEX IF NOT EXISTS idx_assistant_memory_project_id ON assistant_memory(project_id);
CREATE INDEX IF NOT EXISTS idx_assistant_memory_freshness ON assistant_memory(freshness_status);

-- 3. Add source_type to assistant_context_docs for better filtering
ALTER TABLE assistant_context_docs ADD COLUMN source_type TEXT DEFAULT 'manual';
