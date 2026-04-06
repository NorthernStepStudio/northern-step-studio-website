import { randomUUID } from "node:crypto";
import { setTimeout as delay } from "node:timers/promises";
export function createJobWorker(runtime, options = {}) {
    const workerId = options.workerId?.trim() || `worker_${randomUUID()}`;
    const pollIntervalMs = Math.max(250, options.pollIntervalMs ?? runtime.config.worker.pollIntervalMs);
    const staleAfterMs = Math.max(60_000, options.staleAfterMs ?? runtime.config.worker.staleAfterMs);
    let running = false;
    let stopping = false;
    let startPromise;
    async function tick() {
        const processed = [];
        await runtime.stores.queue.releaseStaleClaims(staleAfterMs);
        while (!stopping) {
            const claim = await runtime.stores.queue.claimNext(workerId);
            if (!claim) {
                break;
            }
            runtime.logger.info("Claimed queued job.", {
                workerId,
                jobId: claim.jobId,
                tenantId: claim.tenantId,
                product: claim.product,
                status: claim.status,
            });
            try {
                const job = await runtime.engine.process(claim.jobId);
                processed.push(job);
            }
            catch (error) {
                const message = error instanceof Error ? error.message : String(error);
                runtime.logger.error("Queued job failed during worker execution.", {
                    workerId,
                    jobId: claim.jobId,
                    error: message,
                });
                await runtime.stores.queue.fail(claim.jobId, message);
                const failedJob = await runtime.getJob(claim.jobId);
                if (failedJob) {
                    failedJob.status = "failed";
                    failedJob.error = message;
                    await runtime.stores.jobs.upsert(failedJob);
                    processed.push(failedJob);
                }
            }
        }
        return processed;
    }
    async function start() {
        if (startPromise) {
            return startPromise;
        }
        stopping = false;
        running = true;
        startPromise = (async () => {
            try {
                while (!stopping) {
                    try {
                        await tick();
                    }
                    catch (error) {
                        const message = error instanceof Error ? error.message : String(error);
                        runtime.logger.error("Job worker tick failed.", { workerId, error: message });
                    }
                    if (stopping) {
                        break;
                    }
                    await delay(pollIntervalMs);
                }
            }
            finally {
                running = false;
                startPromise = undefined;
            }
        })();
        return startPromise;
    }
    async function stop() {
        stopping = true;
        if (startPromise) {
            await startPromise.catch(() => undefined);
        }
    }
    return {
        workerId,
        start,
        stop,
        tick,
        isRunning() {
            return running;
        },
    };
}
export async function startJobWorker(runtime, options = {}) {
    const worker = createJobWorker(runtime, options);
    void worker.start();
    return worker;
}
//# sourceMappingURL=job-worker.js.map