import { createClient } from '@supabase/supabase-js';
import fs from 'fs/promises';
import path from 'path';
import dotenv from 'dotenv';

// Read .dev.vars from the main website project
dotenv.config({ path: path.resolve(process.cwd(), '../Northern Step Studio website/.dev.vars') });

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('[ERROR] Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .dev.vars');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function seed() {
  console.log('Connecting to Supabase at:', SUPABASE_URL);
  const dataPath = path.resolve(process.cwd(), 'server-data/responseos-store.json');
  
  let rawData = '{}';
  try {
    rawData = await fs.readFile(dataPath, 'utf8');
    console.log(`Loaded local server-data.json (${rawData.length} bytes)`);
  } catch (e) {
    console.log('No local data found. Skipping migration.');
    return;
  }

  const parsedData = JSON.parse(rawData);

  console.log('Pushing data to responseos_state table...');
  const { data, error } = await supabase
    .from('responseos_state')
    .upsert({ id: 'default', data: parsedData }, { onConflict: 'id' })
    .select();

  if (error) {
    console.error('Failed to sync to Supabase:', error);
  } else {
    console.log('✅ Successfully migrated local JSON state to Supabase Postgres!');
  }
}

seed();
