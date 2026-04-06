import { randomUUID } from "node:crypto";
import type { RedisAdapter } from "../redis/index.js";

export interface ScheduledTask {
  readonly id: string;
  readonly runAt: string;
  readonly status: "scheduled" | "running" | "completed" | "failed" | "cancelled";
  readonly detail?: string;
}

export interface ScheduleRequest {
  readonly id?: string;
  readonly runAt: string;
  readonly task: () => Promise<void> | void;
  readonly detail?: string;
}

export interface SchedulerAdapter {
  schedule(input: ScheduleRequest): Promise<ScheduledTask>;
  list(): Promise<readonly ScheduledTask[]>;
  cancel(id: string): Promise<void>;
}

interface RedisSchedulerAdapterOptions {
  readonly redis: RedisAdapter;
  readonly namespace?: string;
}

export function createMemorySchedulerAdapter(): SchedulerAdapter {
  const scheduled = new Map<string, ScheduledTask>();
  const timers = new Map<string, ReturnType<typeof setTimeout>>();

  return {
    async schedule(input) {
      const id = input.id || `task_${randomUUID()}`;
      const task: ScheduledTask = {
        id,
        runAt: input.runAt,
        status: "scheduled",
        detail: input.detail,
      };
      scheduled.set(id, task);

      const delay = Math.max(0, Date.parse(input.runAt) - Date.now());
      const timer = setTimeout(async () => {
        scheduled.set(id, { ...task, status: "running" });
        try {
          await input.task();
          scheduled.set(id, { ...task, status: "completed" });
        } catch {
          scheduled.set(id, { ...task, status: "failed" });
        }
      }, delay);
      timer.unref?.();

      timers.set(id, timer);
      return task;
    },
    async list() {
      return [...scheduled.values()];
    },
    async cancel(id) {
      const timer = timers.get(id);
      if (timer) {
        clearTimeout(timer);
        timers.delete(id);
      }
      const current = scheduled.get(id);
      if (current) {
        scheduled.set(id, { ...current, status: "cancelled" });
      }
    },
  };
}

export function createRedisSchedulerAdapter(options: RedisSchedulerAdapterOptions): SchedulerAdapter {
  const scheduled = new Map<string, ScheduledTask>();
  const timers = new Map<string, ReturnType<typeof setTimeout>>();
  const namespace = options.namespace || "nstep:jobs:scheduler";
  const indexKey = `${namespace}:index`;
  const taskKey = (id: string) => `${namespace}:task:${id}`;

  async function loadIndex(): Promise<string[]> {
    const raw = await options.redis.get(indexKey);
    if (!raw) {
      return [];
    }
    try {
      const parsed = JSON.parse(raw) as unknown;
      return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === "string") : [];
    } catch {
      return [];
    }
  }

  async function saveIndex(ids: readonly string[]): Promise<void> {
    await options.redis.set(indexKey, JSON.stringify([...new Set(ids)]));
  }

  async function persistTask(task: ScheduledTask): Promise<void> {
    await options.redis.set(taskKey(task.id), JSON.stringify(task));
    scheduled.set(task.id, task);
  }

  async function scheduleTimer(id: string, task: ScheduledTask, run: () => Promise<void> | void): Promise<void> {
    const delay = Math.max(0, Date.parse(task.runAt) - Date.now());
    const timer = setTimeout(async () => {
      const running = { ...task, status: "running" as const };
      scheduled.set(id, running);
      await persistTask(running);
      try {
        await run();
        const completed = { ...task, status: "completed" as const };
        scheduled.set(id, completed);
        await persistTask(completed);
      } catch {
        const failed = { ...task, status: "failed" as const };
        scheduled.set(id, failed);
        await persistTask(failed);
      }
    }, delay);
    timer.unref?.();

    timers.set(id, timer);
  }

  return {
    async schedule(input) {
      const id = input.id || `task_${randomUUID()}`;
      const task: ScheduledTask = {
        id,
        runAt: input.runAt,
        status: "scheduled",
        detail: input.detail,
      };

      await persistTask(task);
      await saveIndex([...(await loadIndex()), id]);
      await scheduleTimer(id, task, input.task);
      return task;
    },
    async list() {
      const ids = await loadIndex();
      const tasks = await Promise.all(
        ids.map(async (id) => {
          const raw = await options.redis.get(taskKey(id));
          if (!raw) {
            return undefined;
          }
          try {
            return JSON.parse(raw) as ScheduledTask;
          } catch {
            return undefined;
          }
        }),
      );
      return tasks.filter((task): task is ScheduledTask => Boolean(task));
    },
    async cancel(id) {
      const timer = timers.get(id);
      if (timer) {
        clearTimeout(timer);
        timers.delete(id);
      }
      const current = scheduled.get(id);
      if (current) {
        const cancelled = { ...current, status: "cancelled" as const };
        await persistTask(cancelled);
      }
      const ids = await loadIndex();
      await saveIndex(ids);
    },
  };
}
