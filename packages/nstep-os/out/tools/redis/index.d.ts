export interface RedisAdapter {
    readonly provider: "mock" | "redis";
    ping(): Promise<boolean>;
    get(key: string): Promise<string | undefined>;
    set(key: string, value: string): Promise<void>;
    del(key: string): Promise<number>;
    close(): Promise<void>;
}
interface RedisAdapterConfig {
    readonly url?: string;
}
export declare function createRedisAdapter(config: RedisAdapterConfig): RedisAdapter;
export {};
