-- Add parent_id to rooms table for nested functionality
ALTER TABLE rooms
ADD COLUMN IF NOT EXISTS parent_id UUID REFERENCES rooms(id) ON DELETE
SET NULL;