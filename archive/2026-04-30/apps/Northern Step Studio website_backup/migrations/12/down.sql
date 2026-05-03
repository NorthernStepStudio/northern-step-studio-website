
-- Remove indexes first
DROP INDEX idx_app_media_sort;
DROP INDEX idx_app_media_app_uuid;

-- Drop app_media table
DROP TABLE app_media;

-- Remove visibility column
ALTER TABLE apps DROP COLUMN visibility;
