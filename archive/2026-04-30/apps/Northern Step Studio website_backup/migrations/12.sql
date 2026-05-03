
-- Add visibility column to apps table
ALTER TABLE apps ADD COLUMN visibility TEXT DEFAULT 'draft';

-- Create app_media table for screenshots
CREATE TABLE app_media (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  app_uuid TEXT NOT NULL,
  url TEXT NOT NULL,
  media_type TEXT NOT NULL DEFAULT 'screenshot',
  sort_order INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Create index for efficient lookups
CREATE INDEX idx_app_media_app_uuid ON app_media(app_uuid);
CREATE INDEX idx_app_media_sort ON app_media(app_uuid, sort_order);
