import type { NStepLogger } from "../../core/types.js";
import { type Stage3ToolDescriptor, type Stage3ToolScope } from "../../core/stage3-models.js";
export interface DatabaseQueryRequest {
    readonly sql: string;
    readonly params?: readonly unknown[];
}
export interface DatabaseQueryResult<T = Record<string, unknown>> {
    readonly rows: readonly T[];
    readonly rowCount: number;
    readonly command?: string;
}
export interface DatabaseAdapter {
    readonly provider: "file" | "postgres" | "supabase";
    readonly descriptor: Stage3ToolDescriptor;
    query<T = Record<string, unknown>>(request: DatabaseQueryRequest, scope?: Stage3ToolScope): Promise<DatabaseQueryResult<T>>;
    execute(request: DatabaseQueryRequest, scope?: Stage3ToolScope): Promise<DatabaseQueryResult>;
    close(): Promise<void>;
    describe(): Stage3ToolDescriptor;
    scope(scope: Stage3ToolScope): DatabaseAdapter;
}
export interface DatabaseAdapterConfig {
    readonly provider?: "file" | "postgres" | "supabase";
    readonly connectionString?: string;
    readonly logger?: NStepLogger;
    readonly maxAttempts?: number;
    readonly scope?: Stage3ToolScope;
}
export declare function createDatabaseAdapter(config: DatabaseAdapterConfig): DatabaseAdapter;
