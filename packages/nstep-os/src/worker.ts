import { fileURLToPath } from "node:url";
import { createNStepOsRuntime } from "./core/runtime.js";
import { createJobWorker } from "./workers/job-worker.js";

async function main(): Promise<void> {
  const runtime = await createNStepOsRuntime();
  const worker = createJobWorker(runtime);
  console.log(`NStepOS worker ${worker.workerId} listening for queued jobs.`);

  const stop = async (): Promise<void> => {
    await worker.stop();
    process.exitCode = 0;
  };

  process.once("SIGINT", () => {
    void stop();
  });
  process.once("SIGTERM", () => {
    void stop();
  });

  await worker.start();
}

const isDirectRun = (() => {
  try {
    return process.argv[1] ? fileURLToPath(import.meta.url) === process.argv[1] : false;
  } catch {
    return false;
  }
})();

if (isDirectRun) {
  void main().catch((error) => {
    const message = error instanceof Error ? error.message : String(error);
    console.error("NStepOS worker failed to start.", message);
    process.exitCode = 1;
  });
}
