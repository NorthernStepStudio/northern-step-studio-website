import postgres from 'postgres';
import fs from 'fs/promises';
import dotenv from 'dotenv';
import path from 'path';

// Load .dev.vars from Northern Step Studio website
dotenv.config({ path: path.join(process.cwd(), '../Northern Step Studio website/.dev.vars') });

const connectionString =
  process.env.DATABASE_URL ||
  process.env.SUPABASE_DB_URL ||
  `postgresql://postgres.frlcnipgnxzeemitzkmd:[YOUR-PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres`;

// Wait, the user's .dev.vars only has SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.
// We can use the Supabase REST API to create tables? No, REST API is for DML (select, insert).
// Wait, we need the connection string, which the user provided in previous tasks as `postgresql://postgres.frlcnipgnxzeemitzkmd:w2c7Z^86t#m4K@aws-0-us-east-1.pooler.supabase.com:6543/postgres`!
// (I saw this in the previous conversation logs when setting Vercel DATABASE_URL!).

async function migrate() {
  const sql = postgres('postgresql://postgres.frlcnipgnxzeemitzkmd:w2c7Z^86t#m4K@aws-0-us-east-1.pooler.supabase.com:6543/postgres', { ssl: 'require' });

  try {
    console.log('Creating responseos_state table...');
    await sql`
      CREATE TABLE IF NOT EXISTS responseos_state (
        id text PRIMARY KEY DEFAULT 'default',
        data jsonb NOT NULL DEFAULT '{}'::jsonb
      );
    `;

    console.log('Reading local server-data.json...');
    const dataPath = path.join(process.cwd(), '../NSS Missed Call Text Back/server-data/responseos-store.json');
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
