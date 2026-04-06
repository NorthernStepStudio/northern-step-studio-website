import { createNoopLogger } from "../core/logger.js";
import type {
  DomainStore,
  GoalInput,
  JobRecord,
  JobQueueEntry,
  JobQueueStore,
  JobQueueStatus,
  JobStore,
  KnowledgeChunk,
  KnowledgeStore,
  MemoryEntry,
  MemoryStore,
  NStepLogger,
  RuntimeConfig,
  RuntimeStores,
  RouteDecision,
  WorkflowExecutionContext,
  WorkflowPlan,
  WorkflowStep,
} from "../core/types.js";

export function makeRuntimeConfig(overrides: Partial<RuntimeConfig> = {}): RuntimeConfig {
  const base: RuntimeConfig = {
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
    geminiBaseUrl: "https://generativelanguage.googleapis.com/v1beta",
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

export function makeGoalInput(overrides: Partial<GoalInput> = {}): GoalInput {
  const base: GoalInput = {
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

export function makeRouteDecision(overrides: Partial<RouteDecision> = {}): RouteDecision {
  const base: RouteDecision = {
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

export function makeWorkflowStep(overrides: Partial<WorkflowStep> = {}): WorkflowStep {
  const base: WorkflowStep = {
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

export function makeWorkflowPlan(overrides: Partial<WorkflowPlan> = {}): WorkflowPlan {
  const base: WorkflowPlan = {
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

export function makeJobRecord(goal: GoalInput, overrides: Partial<JobRecord> = {}): JobRecord {
  const now = "2026-04-03T00:00:00.000Z";
  const base: JobRecord = {
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

export function makeMemoryEntry(overrides: Partial<MemoryEntry> = {}): MemoryEntry {
  const now = "2026-04-03T00:00:00.000Z";
  const base: MemoryEntry = {
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

export function makeWorkflowExecutionContext(params: {
  readonly config: RuntimeConfig;
  readonly stores: RuntimeStores;
  readonly route: RouteDecision;
  readonly job: JobRecord;
  readonly logger?: NStepLogger;
  readonly tools?: Record<string, unknown>;
}): WorkflowExecutionContext {
  return {
    config: params.config,
    logger: params.logger ?? createNoopLogger(),
    stores: params.stores,
    tools: params.tools ?? {},
    route: params.route,
    job: params.job,
  };
}

export function makeRuntimeStores(): RuntimeStores {
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
    nexusbuild: {} as RuntimeStores["nexusbuild"],
    provly: {} as RuntimeStores["provly"],
  };
}

class InMemoryJobStore implements JobStore {
  private readonly records = new Map<string, JobRecord>();

  async load(): Promise<readonly JobRecord[]> {
    return [...this.records.values()];
  }

  async save(jobs: readonly JobRecord[]): Promise<void> {
    this.records.clear();
    for (const job of jobs) {
      this.records.set(job.jobId, job);
    }
  }

  async list(): Promise<readonly JobRecord[]> {
    return [...this.records.values()];
  }

  async get(jobId: string): Promise<JobRecord | undefined> {
    return this.records.get(jobId);
  }

  async upsert(job: JobRecord): Promise<JobRecord> {
    this.records.set(job.jobId, job);
    return job;
  }
}

class InMemoryQueueStore implements JobQueueStore {
  private readonly records = new Map<string, JobQueueEntry>();

  async load(): Promise<readonly JobQueueEntry[]> {
    return [...this.records.values()];
  }

  async save(entries: readonly JobQueueEntry[]): Promise<void> {
    this.records.clear();
    for (const entry of entries) {
      this.records.set(entry.jobId, entry);
    }
  }

  async list(): Promise<readonly JobQueueEntry[]> {
    return [...this.records.values()];
  }

  async get(jobId: string): Promise<JobQueueEntry | undefined> {
    return this.records.get(jobId);
  }

  async upsert(entry: JobQueueEntry): Promise<JobQueueEntry> {
    this.records.set(entry.jobId, entry);
    return entry;
  }

  async enqueue(job: JobRecord, reason?: string): Promise<JobQueueEntry> {
    const now = "2026-04-03T00:00:00.000Z";
    const entry: JobQueueEntry = {
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

  async claim(jobId: string, workerId: string): Promise<JobQueueEntry | undefined> {
    const entry = this.records.get(jobId);
    if (!entry) {
      return undefined;
    }
    const now = "2026-04-03T00:00:00.000Z";
    const claimed: JobQueueEntry = {
      ...entry,
      status: "claimed" as JobQueueStatus,
      attempts: entry.attempts + 1,
      claimedAt: now,
      updatedAt: now,
      workerId,
    };
    this.records.set(jobId, claimed);
    return claimed;
  }

  async claimNext(workerId: string): Promise<JobQueueEntry | undefined> {
    for (const entry of this.records.values()) {
      if (entry.status === "queued" || entry.status === "deferred") {
        return this.claim(entry.jobId, workerId);
      }
    }
    return undefined;
  }

  async complete(jobId: string, workerId?: string): Promise<JobQueueEntry | undefined> {
    const entry = this.records.get(jobId);
    if (!entry) {
      return undefined;
    }
    const now = "2026-04-03T00:00:00.000Z";
    const completed: JobQueueEntry = {
      ...entry,
      status: "completed",
      updatedAt: now,
      completedAt: now,
      workerId: workerId || entry.workerId,
    };
    this.records.set(jobId, completed);
    return completed;
  }

  async defer(jobId: string, reason: string, availableAt?: string): Promise<JobQueueEntry | undefined> {
    const entry = this.records.get(jobId);
    if (!entry) {
      return undefined;
    }
    const now = "2026-04-03T00:00:00.000Z";
    const deferred: JobQueueEntry = {
      ...entry,
      status: "deferred",
      updatedAt: now,
      availableAt: availableAt || now,
      reason,
    };
    this.records.set(jobId, deferred);
    return deferred;
  }

  async fail(jobId: string, reason: string): Promise<JobQueueEntry | undefined> {
    const entry = this.records.get(jobId);
    if (!entry) {
      return undefined;
    }
    const now = "2026-04-03T00:00:00.000Z";
    const failed: JobQueueEntry = {
      ...entry,
      status: "failed",
      updatedAt: now,
      completedAt: now,
      lastError: reason,
    };
    this.records.set(jobId, failed);
    return failed;
  }

  async releaseStaleClaims(): Promise<number> {
    return 0;
  }
}

class InMemoryMemoryStore implements MemoryStore {
  private readonly records = new Map<string, MemoryEntry>();

  async load(): Promise<readonly MemoryEntry[]> {
    return [...this.records.values()];
  }

  async get(id: string): Promise<MemoryEntry | undefined> {
    return this.records.get(id);
  }

  async save(entries: readonly MemoryEntry[]): Promise<void> {
    this.records.clear();
    for (const entry of entries) {
      this.records.set(entry.id, entry);
    }
  }

  async list(): Promise<readonly MemoryEntry[]> {
    return [...this.records.values()];
  }

  async upsert(entry: MemoryEntry): Promise<MemoryEntry> {
    this.records.set(entry.id, entry);
    return entry;
  }
}

class InMemoryKnowledgeStore implements KnowledgeStore {
  private readonly records = new Map<string, KnowledgeChunk>();

  async load(): Promise<readonly KnowledgeChunk[]> {
    return this.list();
  }

  async get(id: string): Promise<KnowledgeChunk | undefined> {
    return this.records.get(id);
  }

  async save(entries: readonly KnowledgeChunk[]): Promise<void> {
    this.records.clear();
    for (const entry of entries) {
      this.records.set(entry.id, entry);
    }
  }

  async list(): Promise<readonly KnowledgeChunk[]> {
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

  async upsert(entry: KnowledgeChunk): Promise<KnowledgeChunk> {
    this.records.set(entry.id, entry);
    return entry;
  }

  async search(query: string, limit = 5) {
    const { searchKnowledgeChunks } = await import("../knowledge/index.js");
    return searchKnowledgeChunks(query, await this.list(), limit);
  }
}

class InMemoryDomainStore implements DomainStore {
  private readonly leads = new Map<string, unknown>();
  private readonly interactions: unknown[] = [];
  private readonly outbounds: unknown[] = [];
  private readonly callEvents = new Map<string, unknown>();

  async loadLeads(): Promise<readonly any[]> {
    return [...this.leads.values()];
  }

  async saveLeads(leads: readonly any[]): Promise<void> {
    this.leads.clear();
    for (const lead of leads) {
      const record = lead as { readonly id?: string; readonly leadId?: string };
      const key = record.id || record.leadId;
      if (key) {
        this.leads.set(key, lead);
      }
    }
  }

  async getLeadByPhone(): Promise<any> {
    return undefined;
  }

  async upsertLead(lead: any): Promise<any> {
    const record = lead as { readonly id?: string; readonly leadId?: string };
    const key = record.id || record.leadId || `lead_${this.leads.size + 1}`;
    this.leads.set(key, lead);
    return lead;
  }

  async appendInteraction(interaction: any): Promise<void> {
    this.interactions.push(interaction);
  }

  async appendOutboundMessage(message: any): Promise<void> {
    this.outbounds.push(message);
  }

  async listInteractions(): Promise<readonly any[]> {
    return [...this.interactions];
  }

  async listOutbounds(): Promise<readonly any[]> {
    return [...this.outbounds];
  }

  async getCallEvent(eventId: string): Promise<any> {
    return this.callEvents.get(eventId);
  }

  async upsertCallEvent(event: any): Promise<any> {
    const record = event as { readonly id?: string; readonly eventId?: string };
    const key = record.id || record.eventId || `event_${this.callEvents.size + 1}`;
    this.callEvents.set(key, event);
    return event;
  }
}
