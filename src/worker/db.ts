import postgres from "postgres";

export function getDb(env: Env) {
  const connectionString = env.SUPABASE_DB_URL || env.DATABASE_URL;
  
  // Development Mock: If the password is not set, return a proxy that handles queries gracefully
  if (!connectionString || connectionString.includes("YOUR_PASSWORD")) {
    console.warn("[Database] Using MOCK database for development.");
    
    const mockSql = ((_strings: TemplateStringsArray, ..._values: any[]) => {
      // Return a proxy that looks like a promise/result
      const result: any = Promise.resolve([]);
      // Mock the tagged template behavior
      return result;
    }) as any;

    // Add common properties used by the postgres client if any
    mockSql.close = () => Promise.resolve();
    mockSql.begin = (cb: any) => cb(mockSql);
    
    return mockSql;
  }

  if (!connectionString) {
    throw new Error("DATABASE_URL or SUPABASE_DB_URL is not configured in environment variables.");
  }

  return postgres(connectionString, {
    ssl: "require",
    max: 1, // On Edge functions, we want to keep connections low
  });
}

// Helper for row-to-object mapping if needed
export type DBClient = ReturnType<typeof getDb>;
