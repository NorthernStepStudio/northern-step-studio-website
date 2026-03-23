import postgres from "postgres";

export function getDb(env: Env) {
  const connectionString = env.SUPABASE_DB_URL || env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL or SUPABASE_DB_URL is not configured.");
  }

  return postgres(connectionString, {
    ssl: "require",
    max: 1, // On Edge functions, we want to keep connections low
  });
}

// Helper for row-to-object mapping if needed
export type DBClient = ReturnType<typeof getDb>;
