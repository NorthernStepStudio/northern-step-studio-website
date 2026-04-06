
-- Remove index first
DROP INDEX idx_apps_uuid;

-- Remove uuid column
ALTER TABLE apps DROP COLUMN uuid;
