import type { BrowserAdapter } from "../tools/browser/index.js";
import { createBrowserAdapter } from "../tools/browser/index.js";
import type { DomainStore, JobRecord, JobStore, MemoryEntry, MemoryStore, RuntimeConfig, RuntimeStores } from "./types.js";
import { createConsoleLogger } from "./logger.js";
import type { NStepLogger } from "./types.js";
import { loadRuntimeConfig } from "./config.js";
import { createSmsAdapter, type SmsAdapter } from "../tools/sms/index.js";
import { createEmailAdapter, type EmailAdapter } from "../tools/email/index.js";
import { createHttpApiAdapter, type HttpApiAdapter } from "../tools/api/index.js";
import { createScrapingAdapter, type ScrapingAdapter } from "../tools/scraping/index.js";
import { createMemorySchedulerAdapter, createRedisSchedulerAdapter, type SchedulerAdapter } from "../tools/scheduler/index.js";
import { createRedisAdapter, type RedisAdapter } from "../tools/redis/index.js";
import { createOcrAdapter, type OcrAdapter } from "../tools/ocr/index.js";
import { createStage2Agents, type Stage2Agents } from "../agents/index.js";
import { createJobEngine, type JobEngine, type JobEngineActor } from "../jobs/job-engine.js";
import { intakeGoal } from "../intake/index.js";
import { listWorkflowKeys } from "../workflows/index.js";
import type { DashboardSnapshot, GoalInput } from "./types.js";
import { createRuntimeStores } from "./storage.js";
import { createStage2Bridge } from "./stage2.js";
import { createStage2Orchestrator, type Stage2RuntimeOrchestrator } from "./stage2-orchestrator.js";
import { createRuntimeServices, type RuntimeServices } from "./runtime-services.js";
import { createDatabaseAdapter } from "../tools/database/runtime.js";
import { createStage3ToolRuntime, type Stage3ToolRuntime } from "../tools/runtime.js";
import { summarizeKnowledgeCoverage } from "../knowledge/index.js";

export interface RuntimeDependencies {
  readonly logger?: NStepLogger;
  readonly jobs?: JobStore;
  readonly queue?: RuntimeStores["queue"];
  readonly memory?: MemoryStore;
  readonly knowledge?: RuntimeStores["knowledge"];
  readonly domain?: DomainStore;
  readonly nexusbuild?: RuntimeStores["nexusbuild"];
  readonly provly?: RuntimeStores["provly"];
  readonly ocr?: OcrAdapter;
  readonly tools?: Partial<RuntimeTools>;
  readonly services?: RuntimeServices;
  readonly orchestrator?: Stage2RuntimeOrchestrator;
}

export type RuntimeTools = Stage3ToolRuntime;

export interface NStepOsRuntime {
  readonly config: RuntimeConfig;
  readonly logger: NStepLogger;
  readonly stores: RuntimeStores;
  readonly tools: RuntimeTools;
  readonly services: RuntimeServices;
  readonly agents: RuntimeAgents;
  readonly orchestrator: Stage2RuntimeOrchestrator;
  readonly engine: JobEngine;
  health(): Promise<Record<string, unknown>>;
  intake(goal: unknown): Promise<JobRecord>;
  route(jobId: string): Promise<JobRecord>;
  plan(jobId: string): Promise<JobRecord>;
  run(jobId: string): Promise<JobRecord>;
  approve(jobId: string, stepId: string, actor?: JobEngineActor): Promise<JobRecord>;
  reject(jobId: string, stepId: string, actor?: JobEngineActor): Promise<JobRecord>;
  getJob(jobId: string): Promise<JobRecord | undefined>;
  listJobs(): Promise<readonly JobRecord[]>;
  listMemory(): Promise<readonly MemoryEntry[]>;
  dashboard(): Promise<DashboardSnapshot>;
  runGoal(goal: unknown): Promise<JobRecord>;
}

export type RuntimeAgents = Stage2Agents;

export async function createNStepOsRuntime(
  config: RuntimeConfig = loadRuntimeConfig(),
  dependencies: RuntimeDependencies = {},
): Promise<NStepOsRuntime> {
  const logger = dependencies.logger ?? createConsoleLogger("runtime");
  const stores: RuntimeStores = await createRuntimeStores(config, {
    jobs: dependencies.jobs,
    queue: dependencies.queue,
    memory: dependencies.memory,
    knowledge: dependencies.knowledge,
    domain: dependencies.domain,
    nexusbuild: dependencies.nexusbuild,
    provly: dependencies.provly,
  });

  const redis = dependencies.tools?.redis ?? createRedisAdapter({ url: config.redis?.url });
  const ocr =
    dependencies.ocr ??
    dependencies.tools?.ocr ??
    createOcrAdapter({
      provider: config.ocr?.provider,
      endpoint: config.ocr?.endpoint,
      apiKey: config.ocr?.apiKey,
      timeoutMs: config.ocr?.timeoutMs,
      config: { serviceName: config.serviceName },
    });

  const browser =
    dependencies.tools?.browser ??
    createBrowserAdapter({
      provider: config.browser?.provider || "mock",
    });
  const sms =
    dependencies.tools?.sms ??
    createSmsAdapter({
      provider: config.sms?.provider || (config.twilio?.accountSid && config.twilio?.authToken ? "twilio" : "mock"),
      accountSid: config.twilio?.accountSid,
      authToken: config.twilio?.authToken,
      fromNumber: config.twilio?.fromNumber,
      baseUrl: config.twilio?.baseUrl,
      statusCallbackUrl: config.sms?.statusCallbackUrl,
    });
  const email =
    dependencies.tools?.email ??
    createEmailAdapter({
      provider: config.email?.webhookUrl ? "webhook" : "mock",
      webhookUrl: config.email?.webhookUrl,
      from: config.email?.from,
    });
  const database =
    dependencies.tools?.database ??
    createDatabaseAdapter({
      provider: config.database?.provider,
      connectionString: config.database?.connectionString,
      logger,
      maxAttempts: config.maxRetries,
    });
  const api = dependencies.tools?.api ?? createHttpApiAdapter();
  const scraping = dependencies.tools?.scraping ?? createScrapingAdapter();
  const scheduler =
    dependencies.tools?.scheduler ??
    (config.redis?.url ? createRedisSchedulerAdapter({ redis }) : createMemorySchedulerAdapter());

  const tools: RuntimeTools = createStage3ToolRuntime({
    config,
    logger,
    browser,
    sms,
    email,
    database,
    api,
    scraping,
    scheduler,
    redis,
    ocr,
    maxAttempts: Math.max(1, config.maxRetries + 1),
  });
  const services = dependencies.services ?? createRuntimeServices({ config, stores, logger });

  const stage2Bridge = createStage2Bridge();
  const agents: RuntimeAgents = createStage2Agents(
    {
      config,
      logger,
      stores,
      tools,
    },
    stage2Bridge,
  );
  const orchestrator =
    dependencies.orchestrator ??
    createStage2Orchestrator(agents, {
      logger,
    });

  const engine = createJobEngine({
    config,
    stores,
    logger,
    tools,
    services,
    orchestrator,
  });

  return {
    config,
    logger,
    stores,
    tools,
    services,
    agents,
    orchestrator,
    engine,
    async health() {
      const jobs = await stores.jobs.list();
      const queue = await stores.queue.list();
      const memory = await stores.memory.list();
      const knowledge = await stores.knowledge.list();
      const knowledgeCoverage = summarizeKnowledgeCoverage(knowledge);
      const nexusbuildReports = await stores.nexusbuild.listAnalysisReports();
      const nexusbuildSavedBuilds = await stores.nexusbuild.listSavedBuilds();
      const provlyItems = await stores.provly.listInventoryItems();
      const provlyExports = await stores.provly.listClaimExports();
      const provlyReports = await stores.provly.listAnalysisReports();
      const orchestrationHistory = orchestrator.history();
      return {
        status: "ok",
        service: config.serviceName,
        providerMode: config.providerMode,
        executionMode: config.executionMode,
        databaseProvider: config.database?.provider || "file",
        redisProvider: config.redis?.url ? "redis" : "mock",
        checkedAt: new Date().toISOString(),
        workflowKeys: listWorkflowKeys(),
        agents: {
          total: agents.descriptors.length,
          ids: agents.descriptors.map((agent) => agent.id),
        },
        orchestration: {
          total: orchestrationHistory.length,
          byPhase: countByPhase(orchestrationHistory),
        },
        tools: {
          total: tools.descriptors.length,
          providers: tools.descriptors.map((descriptor) => `${descriptor.tool}:${descriptor.provider}`),
        },
        sms: {
          provider: config.sms?.provider || (config.twilio?.accountSid && config.twilio?.authToken ? "twilio" : "mock"),
          fromNumberConfigured: Boolean(config.twilio?.fromNumber),
          callbackConfigured: Boolean(config.sms?.statusCallbackUrl),
        },
        jobs: jobs.length,
        queue: {
          total: queue.length,
          queued: queue.filter((entry) => entry.status === "queued").length,
          claimed: queue.filter((entry) => entry.status === "claimed").length,
          deferred: queue.filter((entry) => entry.status === "deferred").length,
          failed: queue.filter((entry) => entry.status === "failed").length,
          completed: queue.filter((entry) => entry.status === "completed").length,
        },
        memory: memory.length,
        knowledge: {
          totalChunks: knowledgeCoverage.totalChunks,
          totalDocuments: knowledgeCoverage.totalDocuments,
          coverage: knowledgeCoverage,
        },
        nexusbuild: {
          savedBuilds: nexusbuildSavedBuilds.length,
          reports: nexusbuildReports.length,
        },
        provly: {
          inventoryItems: provlyItems.length,
          claimExports: provlyExports.length,
          reports: provlyReports.length,
        },
        dataDir: config.dataDir,
      };
    },
    async intake(goal) {
      return engine.intake(intakeGoal(goal));
    },
    async route(jobId) {
      return engine.route(jobId);
    },
    async plan(jobId) {
      return engine.plan(jobId);
    },
    async run(jobId) {
      return engine.run(jobId);
    },
    async approve(jobId, stepId, actor) {
      return engine.approve(jobId, stepId, actor);
    },
    async reject(jobId, stepId, actor) {
      return engine.reject(jobId, stepId, actor);
    },
    async getJob(jobId) {
      return engine.get(jobId);
    },
    async listJobs() {
      return engine.list();
    },
    async listMemory() {
      return stores.memory.list();
    },
    async dashboard() {
      return engine.dashboard();
    },
    async runGoal(goal) {
      const job = await engine.intake(intakeGoal(goal));
      return engine.run(job.jobId);
    },
  };
}

export function createRuntimeLogger(scope = "runtime"): NStepLogger {
  return createConsoleLogger(scope);
}

function countByPhase(records: readonly { readonly phase: string }[]): Record<string, number> {
  return records.reduce<Record<string, number>>((accumulator, record) => {
    accumulator[record.phase] = (accumulator[record.phase] || 0) + 1;
    return accumulator;
  }, {});
}
