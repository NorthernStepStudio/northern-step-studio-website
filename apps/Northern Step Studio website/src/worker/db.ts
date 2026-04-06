import postgres from "postgres";

export interface Env {
  DATABASE_URL?: string;
  SUPABASE_DB_URL?: string;
  DB?: any;
  [key: string]: any;
}

export function getDb(env: Env) {
  const connectionString = env.SUPABASE_DB_URL || env.DATABASE_URL;

  // 1. Prioritize Postgres (Supabase)
  if (connectionString && !connectionString.includes("YOUR_PASSWORD")) {
    try {
      const sql = postgres(connectionString, {
        ssl: "require",
        max: 1, // Single connection for Cloudflare Worker efficiency
        idle_timeout: 20,
        connect_timeout: 10,
      });
      
      const client = sql as any;
      client.isPostgres = true;
      client.isD1 = false;
      return client;
    } catch (e) {
      console.error("[Database] Connection initialization failed. Falling back.", e);
    }
  }

  // 2. Fallback to D1 (Cloudflare Native)
  const d1Binding = env.DB;
  if (d1Binding && typeof d1Binding.prepare === "function") {
    const d1stack = createD1Client(d1Binding);
    const d1Client = d1stack as any;
    d1Client.isPostgres = false;
    d1Client.isD1 = true;
    return d1Client;
  }

  // 3. Final Fallback: Development Mock
  console.warn("[Database] Using MOCK database.");
  const mockSql = ((_strings: TemplateStringsArray, ..._values: any[]) => Promise.resolve([])) as any;
  mockSql.isPostgres = false;
  mockSql.isD1 = false;
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
