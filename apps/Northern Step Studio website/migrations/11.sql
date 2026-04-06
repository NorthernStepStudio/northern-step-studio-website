
-- Add uuid column for stable internal identifiers
ALTER TABLE apps ADD COLUMN uuid TEXT;

-- Generate UUIDs for existing apps
UPDATE apps SET uuid = lower(
  hex(randomblob(4)) || '-' ||
  hex(randomblob(2)) || '-' ||
  '4' || substr(hex(randomblob(2)), 2) || '-' ||
  substr('89ab', abs(random()) % 4 + 1, 1) || substr(hex(randomblob(2)), 2) || '-' ||
  hex(randomblob(6))
);

-- Create index on uuid for performance
CREATE INDEX idx_apps_uuid ON apps(uuid);
