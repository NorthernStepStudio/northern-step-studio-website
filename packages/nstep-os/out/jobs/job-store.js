import path from "node:path";
import { ensureDirectory, readJsonFile, writeJsonFile } from "../core/persistence.js";
export async function createJsonJobStore(options) {
    const filePath = path.join(options.dataDir, options.fileName ?? "jobs.json");
    await ensureDirectory(options.dataDir);
    const load = async () => readJsonFile(filePath, []);
    return {
        async load() {
            return load();
        },
        async save(jobs) {
            await writeJsonFile(filePath, jobs);
        },
        async list() {
            return load();
        },
        async get(jobId) {
            const jobs = await load();
            return jobs.find((job) => job.jobId === jobId);
        },
        async upsert(job) {
            const jobs = await load();
            const index = jobs.findIndex((item) => item.jobId === job.jobId);
            const nextJobs = index >= 0 ? [...jobs.slice(0, index), job, ...jobs.slice(index + 1)] : [...jobs, job];
            await writeJsonFile(filePath, nextJobs);
            return job;
        },
    };
}
//# sourceMappingURL=job-store.js.map