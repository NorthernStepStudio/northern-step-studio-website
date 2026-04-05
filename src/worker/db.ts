import postgres from "postgres";

export interface Env {
  DATABASE_URL?: string;
  SUPABASE_DB_URL?: string;
  DB?: any;
  [key: string]: any;
}

let sql: any = null;

export function getDb(env: Env) {
  const connectionString = env.SUPABASE_DB_URL || env.DATABASE_URL;

  // Prioritize Postgres and cache the instance
  if (connectionString && !connectionString.includes("YOUR_PASSWORD")) {
    if (!sql) {
      sql = postgres(connectionString, {
        ssl: { rejectUnauthorized: false },
        max: 1,
        idle_timeout: 1, // Close connection immediately
        connect_timeout: 2,
      });
    }
    const client = sql as any;
    client.isPostgres = true;
    client.isD1 = false;
    return client;
  }

  // Fallback to D1 if Postgres is not available
  const d1 = env.DB;
  if (d1 && typeof d1.prepare === "function") {
    const client = createD1Client(d1);
    client.isPostgres = false;
    client.isD1 = true;
    return client;
  }

  // Final Fallback: Development Mock
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
