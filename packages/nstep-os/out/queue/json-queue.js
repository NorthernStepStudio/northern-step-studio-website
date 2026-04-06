import path from "node:path";
import { ensureDirectory, readJsonFile, writeJsonFile } from "../core/persistence.js";
const DEFAULT_DELAY_MS = 60 * 60 * 1000;
export async function createJsonJobQueueStore(options) {
    const filePath = path.join(options.dataDir, options.fileName ?? "queue.json");
    await ensureDirectory(options.dataDir);
    const load = async () => readJsonFile(filePath, []);
    return {
        async load() {
            return load();
        },
        async save(entries) {
            await writeJsonFile(filePath, entries);
        },
        async list() {
            return load();
        },
        async get(jobId) {
            const entries = await load();
            return entries.find((entry) => entry.jobId === jobId);
        },
        async upsert(entry) {
            const entries = await load();
            const next = upsertEntry(entries, entry);
            await writeJsonFile(filePath, next);
            return entry;
        },
        async enqueue(job, reason) {
            const now = new Date().toISOString();
            const entries = await load();
            const existing = entries.find((entry) => entry.jobId === job.jobId);
            const entry = {
                jobId: job.jobId,
                tenantId: job.tenantId,
                product: job.goal.product,
                workflow: job.route?.workflow || job.goal.product,
                priority: job.goal.priority,
                status: "queued",
                attempts: existing?.attempts ?? 0,
                availableAt: now,
                createdAt: existing?.createdAt ?? now,
                updatedAt: now,
                claimedAt: undefined,
                completedAt: existing?.completedAt,
                workerId: undefined,
                reason,
                lastError: existing?.lastError,
                metadata: buildQueueMetadata(job, existing),
            };
            await writeJsonFile(filePath, upsertEntry(entries, entry));
            return entry;
        },
        async claim(jobId, workerId) {
            const now = new Date().toISOString();
            const entries = await load();
            const index = entries.findIndex((entry) => entry.jobId === jobId);
            if (index < 0) {
                return undefined;
            }
            const current = entries[index];
            if (!canClaim(current, Date.now())) {
                return undefined;
            }
            const claimed = {
                ...current,
                status: "claimed",
                attempts: current.attempts + 1,
                claimedAt: now,
                workerId,
                updatedAt: now,
            };
            await writeJsonFile(filePath, upsertEntry(entries, claimed));
            return claimed;
        },
        async claimNext(workerId) {
            const nowMs = Date.now();
            const entries = await load();
            const next = [...entries]
                .filter((entry) => canClaim(entry, nowMs))
                .sort(compareQueueEntries)[0];
            if (!next) {
                return undefined;
            }
            return claimEntry(filePath, entries, next.jobId, workerId);
        },
        async complete(jobId, workerId) {
            return updateEntry(filePath, await load(), jobId, (entry) => ({
                ...entry,
                status: "completed",
                completedAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                workerId: workerId || entry.workerId,
            }));
        },
        async defer(jobId, reason, availableAt) {
            return updateEntry(filePath, await load(), jobId, (entry) => ({
                ...entry,
                status: "deferred",
                reason,
                availableAt: availableAt || new Date(Date.now() + DEFAULT_DELAY_MS).toISOString(),
                updatedAt: new Date().toISOString(),
                workerId: undefined,
                claimedAt: undefined,
            }));
        },
        async fail(jobId, reason) {
            return updateEntry(filePath, await load(), jobId, (entry) => ({
                ...entry,
                status: "failed",
                reason,
                lastError: reason,
                updatedAt: new Date().toISOString(),
            }));
        },
        async releaseStaleClaims(staleAfterMs = DEFAULT_DELAY_MS, now = new Date().toISOString()) {
            const cutoff = Date.now() - staleAfterMs;
            const entries = await load();
            let updated = 0;
            const nextEntries = entries.map((entry) => {
                if (entry.status !== "claimed" || !entry.claimedAt || Date.parse(entry.claimedAt) >= cutoff) {
                    return entry;
                }
                updated += 1;
                return {
                    ...entry,
                    status: "queued",
                    availableAt: now,
                    claimedAt: undefined,
                    workerId: undefined,
                    reason: entry.reason || "stale claim requeued",
                    updatedAt: now,
                };
            });
            if (updated > 0) {
                await writeJsonFile(filePath, nextEntries);
            }
            return updated;
        },
    };
}
function upsertEntry(entries, entry) {
    const index = entries.findIndex((item) => item.jobId === entry.jobId);
    return index >= 0 ? [...entries.slice(0, index), entry, ...entries.slice(index + 1)] : [...entries, entry];
}
async function updateEntry(filePath, entries, jobId, mapper) {
    const index = entries.findIndex((entry) => entry.jobId === jobId);
    if (index < 0) {
        return undefined;
    }
    const nextEntry = mapper(entries[index]);
    await writeJsonFile(filePath, upsertEntry(entries, nextEntry));
    return nextEntry;
}
async function claimEntry(filePath, entries, jobId, workerId) {
    const index = entries.findIndex((entry) => entry.jobId === jobId);
    if (index < 0) {
        return undefined;
    }
    const current = entries[index];
    if (!canClaim(current, Date.now())) {
        return undefined;
    }
    const now = new Date().toISOString();
    const claimed = {
        ...current,
        status: "claimed",
        attempts: current.attempts + 1,
        claimedAt: now,
        workerId,
        updatedAt: now,
    };
    await writeJsonFile(filePath, upsertEntry(entries, claimed));
    return claimed;
}
function canClaim(entry, nowMs) {
    if (!entry) {
        return false;
    }
    if (entry.status !== "queued" && entry.status !== "deferred") {
        return false;
    }
    const availableAt = Date.parse(entry.availableAt);
    return Number.isFinite(availableAt) ? availableAt <= nowMs : true;
}
function compareQueueEntries(left, right) {
    const priorityDiff = priorityWeight(right.priority) - priorityWeight(left.priority);
    if (priorityDiff !== 0) {
        return priorityDiff;
    }
    const availableDiff = Date.parse(left.availableAt) - Date.parse(right.availableAt);
    if (availableDiff !== 0) {
        return availableDiff;
    }
    return Date.parse(left.createdAt) - Date.parse(right.createdAt);
}
function priorityWeight(priority) {
    switch (priority) {
        case "critical":
            return 4;
        case "high":
            return 3;
        case "medium":
            return 2;
        default:
            return 1;
    }
}
function buildQueueMetadata(job, existing) {
    return {
        ...(existing?.metadata || {}),
        product: job.goal.product,
        goal: job.goal.goal,
        mode: job.goal.mode,
        requestedBy: job.goal.requestedBy,
        requestedByRole: job.goal.requestedByRole,
        source: job.goal.source,
    };
}
//# sourceMappingURL=json-queue.js.map