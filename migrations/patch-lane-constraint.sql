-- Run this in: Supabase Dashboard → SQL Editor
-- This patches the lane constraint to accept all product lane values.

-- Step 1: Drop the old constraint with the wrong values
ALTER TABLE knowledge_chunks
  DROP CONSTRAINT IF EXISTS knowledge_chunks_lane_check;

-- Step 2: Add the correct constraint with all product lanes
ALTER TABLE knowledge_chunks
  ADD CONSTRAINT knowledge_chunks_lane_check
  CHECK (lane IN (
    'studio',
    'nexusbuild',
    'provly',
    'noobs',
    'neuromove',
    'pasoscore',
    'automation'
  ));

-- Step 3: Verify it worked
SELECT constraint_name, check_clause
FROM information_schema.check_constraints
WHERE constraint_name = 'knowledge_chunks_lane_check';
