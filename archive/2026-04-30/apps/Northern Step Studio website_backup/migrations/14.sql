
-- Add app_uuid column to analytics table
ALTER TABLE analytics ADD COLUMN app_uuid TEXT;

-- Create index for efficient UUID lookups
CREATE INDEX idx_analytics_app_uuid ON analytics(app_uuid);
