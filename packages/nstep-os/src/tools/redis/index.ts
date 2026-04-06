import { createClient } from "redis";

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

export function createRedisAdapter(config: RedisAdapterConfig): RedisAdapter {
  const memory = new Map<string, string>();
  let clientPromise: Promise<any | null> | null = null;
  let fallback = !config.url;

  async function getClient(): Promise<any | null> {
    if (fallback) {
      return null;
    }
    if (!clientPromise) {
      clientPromise = (async () => {
        try {
          const client = createClient({ url: config.url });
          client.on("error", () => {
            fallback = true;
          });
          await client.connect();
          return client;
        } catch {
          fallback = true;
          return null;
        }
      })();
    }
    return clientPromise;
  }

  return {
    provider: config.url ? "redis" : "mock",
    async ping() {
      const client = await getClient();
      if (!client) {
        return true;
      }
      try {
        return (await client.ping()) === "PONG";
      } catch {
        fallback = true;
        return true;
      }
    },
    async get(key) {
      const client = await getClient();
      if (!client) {
        return memory.get(key);
      }
      try {
        return (await client.get(key)) || undefined;
      } catch {
        fallback = true;
        return memory.get(key);
      }
    },
    async set(key, value) {
      const client = await getClient();
      if (!client) {
        memory.set(key, value);
        return;
      }
      try {
        await client.set(key, value);
      } catch {
        fallback = true;
        memory.set(key, value);
      }
    },
    async del(key) {
      const client = await getClient();
      if (!client) {
        return memory.delete(key) ? 1 : 0;
      }
      try {
        return await client.del(key);
      } catch {
        fallback = true;
        return memory.delete(key) ? 1 : 0;
      }
    },
    async close() {
      const client = await getClient();
      if (client) {
        await client.quit().catch(() => undefined);
      }
      clientPromise = null;
    },
  };
}
