import postgres from "postgres";

export interface Env {
  DATABASE_URL?: string;
  SUPABASE_DB_URL?: string;
  DB_PRIMARY?: string;
  DB?: any;
  [key: string]: any;
}

let cachedPostgresClient: any | null = null;

export function getDb(env: Env) {
  const preferredDb = (env.DB_PRIMARY || "").trim().toLowerCase();
  const connectionString = env.SUPABASE_DB_URL || env.DATABASE_URL;
  const d1Binding = env.DB;

  // 1. Default to D1 in Workers to avoid external subrequest limits.
  // Set DB_PRIMARY=postgres to force Postgres as primary.
  if (preferredDb !== "postgres" && d1Binding && typeof d1Binding.prepare === "function") {
    const d1stack = createD1Client(d1Binding);
    const d1Client = d1stack as any;
    d1Client.isPostgres = false;
    d1Client.isD1 = true;
    return d1Client;
  }

  // 2. Postgres (Supabase)
  if (connectionString && !connectionString.includes("YOUR_PASSWORD")) {
    try {
      if (!cachedPostgresClient) {
        const sql = postgres(connectionString, {
          ssl: "require",
          max: 1,
          idle_timeout: 20,
          connect_timeout: 10,
        });
        cachedPostgresClient = sql as any;
        cachedPostgresClient.isPostgres = true;
        cachedPostgresClient.isD1 = false;
      }

      return cachedPostgresClient;
    } catch (e) {
      console.error("[Database] Connection initialization failed. Falling back.", e);
    }
  }

  // 3. Fallback to D1 (Cloudflare Native)
  if (d1Binding && typeof d1Binding.prepare === "function") {
    const d1stack = createD1Client(d1Binding);
    const d1Client = d1stack as any;
    d1Client.isPostgres = false;
    d1Client.isD1 = true;
    return d1Client;
  }

  // 4. Final Fallback: Development Mock
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
