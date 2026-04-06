-- Migration: Add Site Content Table for CMS
-- Targeted at: Supabase / PostgreSQL

CREATE TABLE IF NOT EXISTS site_content (
    id BIGSERIAL PRIMARY KEY,
    key TEXT NOT NULL UNIQUE,
    content TEXT NOT NULL,
    metadata JSONB DEFAULT '{}',
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Index for fast key lookups
CREATE INDEX IF NOT EXISTS idx_site_content_key ON site_content(key);

-- Seed some initial content (optional fallback if not using hardcoded defaults)
-- INSERT INTO site_content (key, content) VALUES ('terms_last_updated', 'March 24, 2026') ON CONFLICT (key) DO NOTHING;
