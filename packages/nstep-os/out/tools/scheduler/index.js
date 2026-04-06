import { randomUUID } from "node:crypto";
export function createMemorySchedulerAdapter() {
    const scheduled = new Map();
    const timers = new Map();
    return {
        async schedule(input) {
            const id = input.id || `task_${randomUUID()}`;
            const task = {
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
                }
                catch {
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
export function createRedisSchedulerAdapter(options) {
    const scheduled = new Map();
    const timers = new Map();
    const namespace = options.namespace || "nstep:jobs:scheduler";
    const indexKey = `${namespace}:index`;
    const taskKey = (id) => `${namespace}:task:${id}`;
    async function loadIndex() {
        const raw = await options.redis.get(indexKey);
        if (!raw) {
            return [];
        }
        try {
            const parsed = JSON.parse(raw);
            return Array.isArray(parsed) ? parsed.filter((item) => typeof item === "string") : [];
        }
        catch {
            return [];
        }
    }
    async function saveIndex(ids) {
        await options.redis.set(indexKey, JSON.stringify([...new Set(ids)]));
    }
    async function persistTask(task) {
        await options.redis.set(taskKey(task.id), JSON.stringify(task));
        scheduled.set(task.id, task);
    }
    async function scheduleTimer(id, task, run) {
        const delay = Math.max(0, Date.parse(task.runAt) - Date.now());
        const timer = setTimeout(async () => {
            const running = { ...task, status: "running" };
            scheduled.set(id, running);
            await persistTask(running);
            try {
                await run();
                const completed = { ...task, status: "completed" };
                scheduled.set(id, completed);
                await persistTask(completed);
            }
            catch {
                const failed = { ...task, status: "failed" };
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
            const task = {
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
            const tasks = await Promise.all(ids.map(async (id) => {
                const raw = await options.redis.get(taskKey(id));
                if (!raw) {
                    return undefined;
                }
                try {
                    return JSON.parse(raw);
                }
                catch {
                    return undefined;
                }
            }));
            return tasks.filter((task) => Boolean(task));
        },
        async cancel(id) {
            const timer = timers.get(id);
            if (timer) {
                clearTimeout(timer);
                timers.delete(id);
            }
            const current = scheduled.get(id);
            if (current) {
                const cancelled = { ...current, status: "cancelled" };
                await persistTask(cancelled);
            }
            const ids = await loadIndex();
            await saveIndex(ids);
        },
    };
}
//# sourceMappingURL=index.js.map