import postgres from 'postgres';
import fs from 'fs/promises';
import path from 'path';

const sql = postgres({
  host: 'db.frlcnipgnxzeemitzkmd.supabase.co',
  port: 5432,
  database: 'postgres',
  user: 'postgres',
  password: '348754Win!',
  ssl: 'require'
});

async function migrate() {

  try {
    console.log('Creating responseos_state table...');
    await sql`
      CREATE TABLE IF NOT EXISTS responseos_state (
        id text PRIMARY KEY DEFAULT 'default',
        data jsonb NOT NULL DEFAULT '{}'::jsonb
      );
    `;

    console.log('Reading local server-data.json...');
    const dataPath = path.resolve(process.cwd(), '../NSS Missed Call Text Back/server-data/responseos-store.json');
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
