import postgres from "postgres";

export function getDb(env: Env) {
  const d1 = (env as any).DB;
  if (d1 && typeof d1.prepare === "function") {
    return createD1Client(d1);
  }

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

function createD1Client(db: any) {
  const sql = ((strings: TemplateStringsArray, ...values: any[]) => {
    const { query, params } = buildD1Query(strings, values);
    return db
      .prepare(query)
      .bind(...params)
      .all()
      .then((result: any) => result?.results ?? []);
  }) as any;

  return sql;
}

function buildD1Query(strings: TemplateStringsArray, values: any[]) {
  let query = strings[0] ?? "";
  const params: any[] = [];

  for (let index = 0; index < values.length; index += 1) {
    query += "?";
    params.push(values[index]);
    query += strings[index + 1] ?? "";
  }

  return { query, params };
}

// Helper for row-to-object mapping if needed
export type DBClient = ReturnType<typeof getDb>;
