export interface ResponseOsLogger {
    debug(message: string, meta?: unknown): void;
    info(message: string, meta?: unknown): void;
    warn(message: string, meta?: unknown): void;
    error(message: string, meta?: unknown): void;
}
export declare function createConsoleLogger(prefix?: string): ResponseOsLogger;
export declare function createNoopLogger(): ResponseOsLogger;
