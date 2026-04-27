declare var process: { env: Record<string, string | undefined>; exit: (code?: number) => never; };
import postgres from "postgres";

const databaseUrl = process.env.SUPABASE_DB_URL || "";

if (!databaseUrl) {
  console.error("❌  SUPABASE_DB_URL is required.");
  process.exit(1);
}

const sql = postgres(databaseUrl, { ssl: { rejectUnauthorized: false }, max: 1 });

async function setup() {
  console.log("📐  Initializing Supabase Postgres Schema...");

  try {
    // 1. Users Table
    await sql.unsafe(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email TEXT NOT NULL UNIQUE,
        role TEXT NOT NULL DEFAULT 'user',
        display_name TEXT,
        bio TEXT,
        avatar_url TEXT,
        password_hash TEXT,
        password_salt TEXT,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );
      CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
      CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

      ALTER TABLE users ENABLE ROW LEVEL SECURITY;
      ALTER TABLE users FORCE ROW LEVEL SECURITY;
    `);
    console.log("✅  Users table ready (RLS enabled).");

    // 2. User Sessions Table
    await sql.unsafe(`
      CREATE TABLE IF NOT EXISTS user_sessions (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        session_token_hash TEXT NOT NULL UNIQUE,
        expires_at TIMESTAMPTZ NOT NULL,
        last_seen_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );
      CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON user_sessions(user_id);
      CREATE INDEX IF NOT EXISTS idx_sessions_token_hash ON user_sessions(session_token_hash);

      ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;
      ALTER TABLE user_sessions FORCE ROW LEVEL SECURITY;
    `);
    console.log("✅  User sessions table ready (RLS enabled).");

    // 3. Knowledge Chunks Table
    await sql.unsafe(`
      CREATE TABLE IF NOT EXISTS knowledge_chunks (
        id SERIAL PRIMARY KEY,
        chunk_id TEXT NOT NULL,
        doc_id TEXT NOT NULL,
        doc_version TEXT NOT NULL,
        doc_hash TEXT NOT NULL,
        lane TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'active',
        access TEXT NOT NULL DEFAULT 'public',
        title TEXT,
        section TEXT,
        content TEXT NOT NULL,
        metadata JSONB DEFAULT '{}',
        source_url TEXT,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        UNIQUE (doc_id, chunk_id, doc_hash)
      );
      CREATE INDEX IF NOT EXISTS idx_knowledge_lane ON knowledge_chunks(lane);
      CREATE INDEX IF NOT EXISTS idx_knowledge_status ON knowledge_chunks(status);
      CREATE INDEX IF NOT EXISTS idx_knowledge_doc_id ON knowledge_chunks(doc_id);

      ALTER TABLE knowledge_chunks ENABLE ROW LEVEL SECURITY;
      ALTER TABLE knowledge_chunks FORCE ROW LEVEL SECURITY;
    `);
    console.log("✅  Knowledge chunks table ready (RLS enabled).");

    await sql.end();
    console.log("\n🟢  Supabase Setup Complete.");
  } catch (error) {
    console.error("❌  Setup failed:", error);
    process.exit(1);
  }
}

setup();
