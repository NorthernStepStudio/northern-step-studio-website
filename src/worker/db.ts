import postgres from "postgres";

export interface Env {
  DATABASE_URL?: string;
  SUPABASE_DB_URL?: string;
  DB?: any;
  [key: string]: any;
}

import { neon } from '@neondatabase/serverless';

export function getDb(env: Env) {
  const connectionString = env.SUPABASE_DB_URL || env.DATABASE_URL;

  // 1. Prioritize Postgres with Cache
  if (connectionString && !connectionString.includes("YOUR_PASSWORD")) {
    const rawSql = neon(connectionString);
    const pgClient = ((strings: TemplateStringsArray, ...values: any[]) => {
      return rawSql(strings, ...values).then((res: any) => res ?? []);
    }) as any;
    
    pgClient.isPostgres = true;
    pgClient.isD1 = false;
    return pgClient;
  }

  // 2. Fallback to D1
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
