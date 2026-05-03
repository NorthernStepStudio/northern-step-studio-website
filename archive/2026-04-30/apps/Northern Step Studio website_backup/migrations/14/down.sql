
-- Remove index
DROP INDEX idx_analytics_app_uuid;

-- Remove app_uuid column
ALTER TABLE analytics DROP COLUMN app_uuid;
