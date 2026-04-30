import { createNoopLogger } from "../core/logger.js";
export function makeRuntimeConfig(overrides = {}) {
    const base = {
        serviceName: "NStepOS Test",
        port: 0,
        dataDir: "/tmp/nstep-os-test",
        providerMode: "mock",
        executionMode: "inline",
        openaiApiKey: undefined,
        openaiModel: "gpt-5.4",
        openaiBaseUrl: "https://api.openai.com/v1",
        geminiApiKey: undefined,
        geminiModel: "gemini-2.5-flash",
        geminiBaseUrl: "https://generativelanguage.googleapis.com/v1",
        ocr: {
            provider: "mock",
            endpoint: undefined,
            apiKey: undefined,
            timeoutMs: 15_000,
        },
        twilio: {
            accountSid: undefined,
            authToken: undefined,
            fromNumber: undefined,
            baseUrl: "https://api.twilio.com",
        },
        sms: {
            provider: "mock",
            statusCallbackUrl: undefined,
        },
        email: {
            from: undefined,
            webhookUrl: undefined,
        },
        database: {
            provider: "file",
            connectionString: undefined,
        },
        browser: {
            provider: "mock",
        },
        redis: {
            url: undefined,
        },
        auth: {
            internalToken: "test-token",
        },
        worker: {
            pollIntervalMs: 1_000,
            staleAfterMs: 300_000,
        },
        maxRetries: 2,
        approvalThreshold: "high",
    };
    return {
        ...base,
        ...overrides,
    };
}
export function makeGoalInput(overrides = {}) {
    const base = {
        goal: "Recover missed calls",
        product: "lead-recovery",
        priority: "high",
        constraints: [],
        mode: "autonomous",
        tenantId: "tenant-alpha",
        requestedBy: "tester",
        requestedByRole: "operator",
        source: "system",
        payload: {},
    };
    const merged = {
        ...base,
        ...overrides,
    };
    return {
        ...merged,
        constraints: overrides.constraints ? [...overrides.constraints] : [...merged.constraints],
        payload: overrides.payload ? { ...overrides.payload } : { ...(merged.payload || {}) },
    };
}
export function makeRouteDecision(overrides = {}) {
    const base = {
        workflow: "lead-recovery",
        lane: "internal",
        riskLevel: "medium",
        approvalRequired: false,
        reasoning: "Test route.",
        confidence: 0.95,
        tags: ["test"],
    };
    const merged = {
        ...base,
        ...overrides,
    };
    return {
        ...merged,
        tags: overrides.tags ? [...overrides.tags] : [...merged.tags],
    };
}
export function makeWorkflowStep(overrides = {}) {
    const base = {
        id: "step-1",
        type: "test",
        title: "Test step",
        tool: "database",
        dependsOn: [],
        input: {},
        approvalRequired: false,
        retryable: false,
    };
    const merged = {
        ...base,
        ...overrides,
    };
    return {
        ...merged,
        dependsOn: overrides.dependsOn ? [...overrides.dependsOn] : [...merged.dependsOn],
        input: overrides.input ? { ...overrides.input } : { ...(merged.input || {}) },
    };
}
export function makeWorkflowPlan(overrides = {}) {
    const base = {
        workflow: "lead-recovery",
        jobId: "job_test",
        steps: [makeWorkflowStep()],
        approvalsRequired: false,
        summary: "Test plan.",
    };
    const merged = {
        ...base,
        ...overrides,
    };
    return {
        ...merged,
        steps: overrides.steps ? [...overrides.steps] : [...merged.steps],
    };
}
export function makeJobRecord(goal, overrides = {}) {
    const now = "2026-04-03T00:00:00.000Z";
    const base = {
        jobId: "job_test",
        tenantId: goal.tenantId,
        goal,
        status: "pending",
        createdAt: now,
        updatedAt: now,
        steps: [],
        logs: [],
        scratchpad: [],
        approvedStepIds: [],
        approvalStatus: "not_required",
    };
    const merged = {
        ...base,
        ...overrides,
    };
    return {
        ...merged,
        steps: overrides.steps ? [...overrides.steps] : [...merged.steps],
        logs: overrides.logs ? [...overrides.logs] : [...merged.logs],
        scratchpad: overrides.scratchpad ? [...overrides.scratchpad] : [...merged.scratchpad],
        approvedStepIds: overrides.approvedStepIds ? [...overrides.approvedStepIds] : [...merged.approvedStepIds],
    };
}
export function makeMemoryEntry(overrides = {}) {
    const now = "2026-04-03T00:00:00.000Z";
    const base = {
        id: "memory_test",
        tenantId: "tenant-alpha",
        product: "lead-recovery",
        category: "workflow-template",
        key: "workflow.lead-recovery.result",
        value: { summary: "cached" },
        confidence: 0.9,
        editable: true,
        createdAt: now,
        updatedAt: now,
    };
    return {
        ...base,
        ...overrides,
    };
}
export function makeWorkflowExecutionContext(params) {
    return {
        config: params.config,
        logger: params.logger ?? createNoopLogger(),
        stores: params.stores,
        tools: params.tools ?? {},
        route: params.route,
        job: params.job,
    };
}
export function makeRuntimeStores() {
    const jobs = new InMemoryJobStore();
    const queue = new InMemoryQueueStore();
    const memory = new InMemoryMemoryStore();
    const knowledge = new InMemoryKnowledgeStore();
    const domain = new InMemoryDomainStore();
    return {
        jobs,
        queue,
        memory,
        knowledge,
        domain,
        nexusbuild: {},
        provly: {},
    };
}
class InMemoryJobStore {
    records = new Map();
    async load() {
        return [...this.records.values()];
    }
    async save(jobs) {
        this.records.clear();
        for (const job of jobs) {
            this.records.set(job.jobId, job);
        }
    }
    async list() {
        return [...this.records.values()];
    }
    async get(jobId) {
        return this.records.get(jobId);
    }
    async upsert(job) {
        this.records.set(job.jobId, job);
        return job;
    }
}
class InMemoryQueueStore {
    records = new Map();
    async load() {
        return [...this.records.values()];
    }
    async save(entries) {
        this.records.clear();
        for (const entry of entries) {
            this.records.set(entry.jobId, entry);
        }
    }
    async list() {
        return [...this.records.values()];
    }
    async get(jobId) {
        return this.records.get(jobId);
    }
    async upsert(entry) {
        this.records.set(entry.jobId, entry);
        return entry;
    }
    async enqueue(job, reason) {
        const now = "2026-04-03T00:00:00.000Z";
        const entry = {
            jobId: job.jobId,
            tenantId: job.tenantId,
            product: job.goal.product,
            workflow: job.route?.workflow || job.goal.product,
            priority: job.goal.priority,
            status: "queued",
            attempts: 0,
            availableAt: now,
            createdAt: now,
            updatedAt: now,
            reason,
            metadata: {},
        };
        this.records.set(job.jobId, entry);
        return entry;
    }
    async claim(jobId, workerId) {
        const entry = this.records.get(jobId);
        if (!entry) {
            return undefined;
        }
        const now = "2026-04-03T00:00:00.000Z";
        const claimed = {
            ...entry,
            status: "claimed",
            attempts: entry.attempts + 1,
            claimedAt: now,
            updatedAt: now,
            workerId,
        };
        this.records.set(jobId, claimed);
        return claimed;
    }
    async claimNext(workerId) {
        for (const entry of this.records.values()) {
            if (entry.status === "queued" || entry.status === "deferred") {
                return this.claim(entry.jobId, workerId);
            }
        }
        return undefined;
    }
    async complete(jobId, workerId) {
        const entry = this.records.get(jobId);
        if (!entry) {
            return undefined;
        }
        const now = "2026-04-03T00:00:00.000Z";
        const completed = {
            ...entry,
            status: "completed",
            updatedAt: now,
            completedAt: now,
            workerId: workerId || entry.workerId,
        };
        this.records.set(jobId, completed);
        return completed;
    }
    async defer(jobId, reason, availableAt) {
        const entry = this.records.get(jobId);
        if (!entry) {
            return undefined;
        }
        const now = "2026-04-03T00:00:00.000Z";
        const deferred = {
            ...entry,
            status: "deferred",
            updatedAt: now,
            availableAt: availableAt || now,
            reason,
        };
        this.records.set(jobId, deferred);
        return deferred;
    }
    async fail(jobId, reason) {
        const entry = this.records.get(jobId);
        if (!entry) {
            return undefined;
        }
        const now = "2026-04-03T00:00:00.000Z";
        const failed = {
            ...entry,
            status: "failed",
            updatedAt: now,
            completedAt: now,
            lastError: reason,
        };
        this.records.set(jobId, failed);
        return failed;
    }
    async releaseStaleClaims() {
        return 0;
    }
}
class InMemoryMemoryStore {
    records = new Map();
    async load() {
        return [...this.records.values()];
    }
    async get(id) {
        return this.records.get(id);
    }
    async save(entries) {
        this.records.clear();
        for (const entry of entries) {
            this.records.set(entry.id, entry);
        }
    }
    async list() {
        return [...this.records.values()];
    }
    async upsert(entry) {
        this.records.set(entry.id, entry);
        return entry;
    }
}
class InMemoryKnowledgeStore {
    records = new Map();
    async load() {
        return this.list();
    }
    async get(id) {
        return this.records.get(id);
    }
    async save(entries) {
        this.records.clear();
        for (const entry of entries) {
            this.records.set(entry.id, entry);
        }
    }
    async list() {
        return [...this.records.values()].sort((left, right) => {
            if (left.sourcePath !== right.sourcePath) {
                return left.sourcePath.localeCompare(right.sourcePath);
            }
            if (left.sectionPath !== right.sectionPath) {
                return left.sectionPath.localeCompare(right.sectionPath);
            }
            return left.chunkIndex - right.chunkIndex;
        });
    }
    async upsert(entry) {
        this.records.set(entry.id, entry);
        return entry;
    }
    async search(query, limit = 5) {
        const { searchKnowledgeChunks } = await import("../knowledge/index.js");
        return searchKnowledgeChunks(query, await this.list(), limit);
    }
}
class InMemoryDomainStore {
    leads = new Map();
    interactions = [];
    outbounds = [];
    callEvents = new Map();
    async loadLeads() {
        return [...this.leads.values()];
    }
    async saveLeads(leads) {
        this.leads.clear();
        for (const lead of leads) {
            const record = lead;
            const key = record.id || record.leadId;
            if (key) {
                this.leads.set(key, lead);
            }
        }
    }
    async getLeadByPhone() {
        return undefined;
    }
    async upsertLead(lead) {
        const record = lead;
        const key = record.id || record.leadId || `lead_${this.leads.size + 1}`;
        this.leads.set(key, lead);
        return lead;
    }
    async appendInteraction(interaction) {
        this.interactions.push(interaction);
    }
    async appendOutboundMessage(message) {
        this.outbounds.push(message);
    }
    async listInteractions() {
        return [...this.interactions];
    }
    async listOutbounds() {
        return [...this.outbounds];
    }
    async getCallEvent(eventId) {
        return this.callEvents.get(eventId);
    }
    async upsertCallEvent(event) {
        const record = event;
        const key = record.id || record.eventId || `event_${this.callEvents.size + 1}`;
        this.callEvents.set(key, event);
        return event;
    }
}
//# sourceMappingURL=fixtures.js.map