import { Pool } from "pg";
export function createPostgresPool(connectionString) {
    return new Pool({
        connectionString,
        max: 6,
        idleTimeoutMillis: 10_000,
        connectionTimeoutMillis: 5_000,
    });
}
//# sourceMappingURL=postgres.js.map