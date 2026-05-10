import { telemetryService } from "./telemetry-service";

export interface AsyncJob {
  id: string;
  type: string;
  status: "pending" | "running" | "completed" | "failed";
  progress: number;
  result?: unknown;
  error?: string;
  startedAt?: string;
  completedAt?: string;
}

class AsyncJobService {
  private jobs: Map<string, AsyncJob> = new Map();

  async enqueue(type: string, operation: () => Promise<unknown>): Promise<string> {
    const jobId = `job-${Math.random().toString(36).slice(2, 11)}`;
    const job: AsyncJob = {
      id: jobId,
      type,
      status: "pending",
      progress: 0,
      startedAt: new Date().toISOString()
    };
    
    this.jobs.set(jobId, job);

    // Deferred execution
    setImmediate(async () => {
      const start = Date.now();
      job.status = "running";
      try {
        job.result = await operation();
        job.status = "completed";
        job.progress = 100;
      } catch (error) {
        job.status = "failed";
        job.error = error instanceof Error ? error.message : "Unknown background job failure";
      } finally {
        job.completedAt = new Date().toISOString();
        telemetryService.track({
          serviceName: `BackgroundJob:${type}`,
          latencyMs: Date.now() - start
        });
      }
    });

    return jobId;
  }

  getJob(id: string): AsyncJob | undefined {
    return this.jobs.get(id);
  }

  getActiveJobs(): AsyncJob[] {
    return Array.from(this.jobs.values()).filter(j => j.status === "running" || j.status === "pending");
  }
}

export const asyncJobService = new AsyncJobService();
