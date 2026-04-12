import postgres from 'postgres';
import fs from 'fs/promises';
import dotenv from 'dotenv';
import path from 'path';

// Load .dev.vars from Northern Step Studio website
dotenv.config({ path: path.join(process.cwd(), '.dev.vars') });

const connectionString = 
  process.env.DATABASE_URL?.trim() || 
  process.env.SUPABASE_DB_URL?.trim() || 
  '';

if (!connectionString) {
  console.error('Missing DATABASE_URL or SUPABASE_DB_URL. Set one in env or .dev.vars before running.');
  process.exit(1);
}

async function migrate() {
  const sql = postgres(connectionString, { ssl: 'require' });

  try {
    console.log('Creating responseos_state table...');
    await sql`
      CREATE TABLE IF NOT EXISTS responseos_state (
        id text PRIMARY KEY DEFAULT 'default',
        data jsonb NOT NULL DEFAULT '{}'::jsonb
      );
    `;

    console.log('Reading local responseos-store.json...');
    const dataPath =
      process.env.RESPONSEOS_STORE_PATH?.trim() ||
      path.join(process.cwd(), '../responseos/server-data/responseos-store.json');
    let rawData = '{}';
    try {
      rawData = await fs.readFile(dataPath, 'utf8');
    } catch (e) {
      console.log('No local data found. Skipping seed.');
    }

    if (rawData !== '{}') {
      console.log('Upserting existing data into Supabase...');
      const parsedData = JSON.parse(rawData);
      await sql`
        INSERT INTO responseos_state (id, data) 
        VALUES ('default', ${sql.json(parsedData)})
        ON CONFLICT (id) DO UPDATE SET data = EXCLUDED.data;
      `;
      console.log('Migration successful!');
    }
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await sql.end();
  }
}

migrate();
