import { Pool } from "pg";

export function createPostgresPool(connectionString: string): Pool {
  return new Pool({
    connectionString,
    max: 6,
    idleTimeoutMillis: 10_000,
    connectionTimeoutMillis: 5_000,
  });
}
