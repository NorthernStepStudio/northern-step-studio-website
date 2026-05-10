-- Migration: Synox Operational Memory Hardening (Part 2)
-- Adds remaining fields for full grounding support.

-- 1. Add source and app tracking to assistant_memory
ALTER TABLE assistant_memory ADD COLUMN source_type TEXT;
ALTER TABLE assistant_memory ADD COLUMN source_id TEXT;
ALTER TABLE assistant_memory ADD COLUMN app_key TEXT;

-- 2. Add freshness and archiving to assistant_context_docs
ALTER TABLE assistant_context_docs ADD COLUMN freshness_status TEXT DEFAULT 'active';
ALTER TABLE assistant_context_docs ADD COLUMN is_archived INTEGER DEFAULT 0;

-- 3. Add indexes for the new columns
CREATE INDEX IF NOT EXISTS idx_assistant_memory_source ON assistant_memory(source_type, source_id);
CREATE INDEX IF NOT EXISTS idx_assistant_memory_app_key ON assistant_memory(app_key);
CREATE INDEX IF NOT EXISTS idx_assistant_context_docs_freshness ON assistant_context_docs(freshness_status);
