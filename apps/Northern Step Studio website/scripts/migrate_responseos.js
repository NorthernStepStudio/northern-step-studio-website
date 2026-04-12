import postgres from 'postgres';
import fs from 'fs/promises';
import path from 'path';

const connectionString =
  process.env.DATABASE_URL?.trim() ||
  process.env.SUPABASE_DB_URL?.trim() ||
  '';

if (!connectionString) {
  console.error('Missing DATABASE_URL or SUPABASE_DB_URL.');
  process.exit(1);
}

const sql = postgres(connectionString, { ssl: 'require' });

async function migrate() {

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
      path.resolve(process.cwd(), '../responseos/server-data/responseos-store.json');
    let rawData = '{}';
    try {
      rawData = await fs.readFile(dataPath, 'utf8');
      console.log(`Found data: ${rawData.length} bytes`);
    } catch (e) {
      console.log('No local data found. Skipping seed.', e.message);
    }

    if (rawData && rawData.trim() !== '{}' && rawData.trim() !== '') {
      console.log('Upserting existing data into Supabase...');
      const parsedData = JSON.parse(rawData);
      await sql`
        INSERT INTO responseos_state (id, data) 
        VALUES ('default', ${sql.json(parsedData)})
        ON CONFLICT (id) DO UPDATE SET data = EXCLUDED.data;
      `;
      console.log('Migration successfully written to Supabase!');
    } else {
      console.log('No meaningful data to push.');
    }
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await sql.end();
  }
}

migrate();
