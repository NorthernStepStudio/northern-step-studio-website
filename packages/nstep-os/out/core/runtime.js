import { createBrowserAdapter } from "../tools/browser/index.js";
import { createConsoleLogger } from "./logger.js";
import { loadRuntimeConfig } from "./config.js";
import { createSmsAdapter } from "../tools/sms/index.js";
import { createEmailAdapter } from "../tools/email/index.js";
import { createHttpApiAdapter } from "../tools/api/index.js";
import { createScrapingAdapter } from "../tools/scraping/index.js";
import { createMemorySchedulerAdapter, createRedisSchedulerAdapter } from "../tools/scheduler/index.js";
import { createRedisAdapter } from "../tools/redis/index.js";
import { createOcrAdapter } from "../tools/ocr/index.js";
import { createStage2Agents } from "../agents/index.js";
import { createJobEngine } from "../jobs/job-engine.js";
import { intakeGoal } from "../intake/index.js";
import { listWorkflowKeys } from "../workflows/index.js";
import { createRuntimeStores } from "./storage.js";
import { createStage2Bridge } from "./stage2.js";
import { createStage2Orchestrator } from "./stage2-orchestrator.js";
import { createRuntimeServices } from "./runtime-services.js";
import { createDatabaseAdapter } from "../tools/database/runtime.js";
import { createStage3ToolRuntime } from "../tools/runtime.js";
import { summarizeKnowledgeCoverage } from "../knowledge/index.js";
export async function createNStepOsRuntime(config = loadRuntimeConfig(), dependencies = {}) {
    const logger = dependencies.logger ?? createConsoleLogger("runtime");
    const stores = await createRuntimeStores(config, {
        jobs: dependencies.jobs,
        queue: dependencies.queue,
        memory: dependencies.memory,
        knowledge: dependencies.knowledge,
        domain: dependencies.domain,
        nexusbuild: dependencies.nexusbuild,
        provly: dependencies.provly,
    });
    const redis = dependencies.tools?.redis ?? createRedisAdapter({ url: config.redis?.url });
    const ocr = dependencies.ocr ??
        dependencies.tools?.ocr ??
        createOcrAdapter({
            provider: config.ocr?.provider,
            endpoint: config.ocr?.endpoint,
            apiKey: config.ocr?.apiKey,
            timeoutMs: config.ocr?.timeoutMs,
            config: { serviceName: config.serviceName },
        });
    const browser = dependencies.tools?.browser ??
        createBrowserAdapter({
            provider: config.browser?.provider || "mock",
        });
    const sms = dependencies.tools?.sms ??
        createSmsAdapter({
            provider: config.sms?.provider || (config.twilio?.accountSid && config.twilio?.authToken ? "twilio" : "mock"),
            accountSid: config.twilio?.accountSid,
            authToken: config.twilio?.authToken,
            fromNumber: config.twilio?.fromNumber,
            baseUrl: config.twilio?.baseUrl,
            statusCallbackUrl: config.sms?.statusCallbackUrl,
        });
    const email = dependencies.tools?.email ??
        createEmailAdapter({
            provider: config.email?.webhookUrl ? "webhook" : "mock",
            webhookUrl: config.email?.webhookUrl,
            from: config.email?.from,
        });
    const database = dependencies.tools?.database ??
        createDatabaseAdapter({
            provider: config.database?.provider,
            connectionString: config.database?.connectionString,
            logger,
            maxAttempts: config.maxRetries,
        });
    const api = dependencies.tools?.api ?? createHttpApiAdapter();
    const scraping = dependencies.tools?.scraping ?? createScrapingAdapter();
    const scheduler = dependencies.tools?.scheduler ??
        (config.redis?.url ? createRedisSchedulerAdapter({ redis }) : createMemorySchedulerAdapter());
    const tools = createStage3ToolRuntime({
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
    const agents = createStage2Agents({
        config,
        logger,
        stores,
        tools,
    }, stage2Bridge);
    const orchestrator = dependencies.orchestrator ??
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
export function createRuntimeLogger(scope = "runtime") {
    return createConsoleLogger(scope);
}
function countByPhase(records) {
    return records.reduce((accumulator, record) => {
        accumulator[record.phase] = (accumulator[record.phase] || 0) + 1;
        return accumulator;
    }, {});
}
//# sourceMappingURL=runtime.js.map