import { buildWorkflowStatusModel } from "../core/stage1-models.js";
import { summarizeKnowledgeCoverage } from "../knowledge/index.js";
import { buildDashboardSnapshot } from "../reporting/index.js";
import { buildApprovalPolicy } from "../policies/index.js";
import { classifyMemoryTier } from "../memory/index.js";
const PAGE_SIZE_DEFAULT = 20;
const PAGE_SIZE_MAX = 100;
export function createDashboardService(stores, config, orchestrator) {
    return {
        async overview(query = {}) {
            const [jobs, memory, knowledge, panels] = await Promise.all([
                stores.jobs.list(),
                stores.memory.list(),
                stores.knowledge.list(),
                buildProductPanels(stores, query),
            ]);
            const filteredJobs = filterJobs(jobs, query);
            const filteredMemory = filterMemory(memory, query);
            const sharedWorkflowJobs = filterJobs(jobs, { ...query, product: undefined, workflow: "shared" });
            const sharedWorkflowMemory = filterMemory(memory, { ...query, product: undefined });
            const knowledgeCoverage = summarizeKnowledgeCoverage(knowledge);
            const snapshot = buildDashboardSnapshot(filteredJobs, filteredMemory, knowledge);
            const recentJobs = mapJobsForList(filteredJobs, filteredMemory).slice(0, 8);
            const approvals = buildApprovalQueueItems(filteredJobs).slice(0, 8);
            const logs = buildLogFeedItems(filteredJobs, query).slice(0, 12);
            const activitySummary = buildWorkflowActivitySummary(filteredJobs);
            const recentCompletedRuns = mapJobsForList(filteredJobs.filter((job) => job.status === "completed"), filteredMemory).slice(0, 8);
            const recentFailedRuns = mapJobsForList(filteredJobs.filter((job) => job.status === "failed"), filteredMemory).slice(0, 8);
            const recurringJobs = buildRecurringJobsForProduct(filteredJobs).slice(0, 8);
            const recentMemory = mapMemoryItems(filteredMemory).slice(0, 5);
            const sharedWorkflow = buildSharedWorkflowOverview(sharedWorkflowJobs, sharedWorkflowMemory);
            return {
                kind: "overview",
                version: "stage-5",
                generatedAt: nowIso(),
                tenantId: query.tenantId,
                filters: query,
                snapshot,
                summaryCards: buildSummaryCards(filteredJobs, filteredMemory, knowledgeCoverage),
                alerts: buildOverviewAlerts(filteredJobs, recentMemory, panels, knowledgeCoverage),
                recentJobs,
                recentApprovals: approvals,
                recentLogs: logs,
                activity: {
                    summary: activitySummary,
                    recentCompletedRuns,
                    recentFailedRuns,
                    recurringJobs,
                },
                sharedWorkflow,
                memory: {
                    total: filteredMemory.length,
                    editable: filteredMemory.filter((entry) => entry.editable).length,
                    byCategory: summarizeMemoryByCategory(filteredMemory),
                    byProduct: summarizeMemoryByProduct(filteredMemory),
                    recent: recentMemory,
                },
                productCards: panels.map((panel) => buildProductCard(panel, filteredJobs)),
            };
        },
        async jobs(query = {}) {
            const [jobs, memory] = await Promise.all([stores.jobs.list(), stores.memory.list()]);
            const filteredJobs = filterJobs(jobs, query);
            const page = normalizePage(query.page);
            const pageSize = normalizePageSize(query.pageSize);
            const pageInfo = buildPageInfo(filteredJobs.length, page, pageSize);
            const items = mapJobsForList(filteredJobs, filterMemory(memory, query)).slice((page - 1) * pageSize, (page - 1) * pageSize + pageSize);
            return {
                kind: "job-list",
                version: "stage-5",
                generatedAt: nowIso(),
                tenantId: query.tenantId,
                filters: query,
                pageInfo,
                summary: summarizeJobs(filteredJobs),
                items,
            };
        },
        async job(jobId, query = {}) {
            const job = await stores.jobs.get(jobId);
            if (!job) {
                return undefined;
            }
            if (query.tenantId && query.tenantId !== job.tenantId) {
                return undefined;
            }
            const memory = filterMemory(await stores.memory.list(), { ...query, tenantId: job.tenantId });
            const productPanel = await buildProductPanel(stores, job.goal.product, {
                ...query,
                tenantId: job.tenantId,
                jobId,
            });
            return {
                kind: "job-detail",
                version: "stage-5",
                generatedAt: nowIso(),
                tenantId: job.tenantId,
                filters: { ...query, jobId },
                job: mapJobForDetail(job, memory),
                timeline: mapJobTimeline(job),
                logs: mapJobLogs(job),
                approvals: buildApprovalQueueItems([job]),
                memoryUpdates: mapMemoryItems(memory).filter((entry) => entry.sourceJobId === job.jobId),
                productPanel,
            };
        },
        async approvals(query = {}) {
            const jobs = filterJobs(await stores.jobs.list(), query);
            const items = buildApprovalQueueItems(jobs);
            const page = normalizePage(query.page);
            const pageSize = normalizePageSize(query.pageSize);
            const pageInfo = buildPageInfo(items.length, page, pageSize);
            return {
                kind: "approval-queue",
                version: "stage-5",
                generatedAt: nowIso(),
                tenantId: query.tenantId,
                filters: query,
                pageInfo,
                summary: summarizeApprovals(items),
                items: items.slice((page - 1) * pageSize, (page - 1) * pageSize + pageSize),
            };
        },
        async logs(query = {}) {
            const jobs = filterJobs(await stores.jobs.list(), query);
            const items = buildLogFeedItems(jobs, query);
            const page = normalizePage(query.page);
            const pageSize = normalizePageSize(query.pageSize);
            const pageInfo = buildPageInfo(items.length, page, pageSize);
            return {
                kind: "log-feed",
                version: "stage-5",
                generatedAt: nowIso(),
                tenantId: query.tenantId,
                filters: query,
                scope: query.jobId ? "job" : query.product ? "product" : query.tenantId ? "tenant" : "global",
                pageInfo,
                summary: summarizeLogs(items),
                items: items.slice((page - 1) * pageSize, (page - 1) * pageSize + pageSize),
            };
        },
        async activity(query = {}) {
            const jobs = filterJobs(await stores.jobs.list(), query);
            const panels = await buildProductPanels(stores, query);
            return buildWorkflowActivityResponse(jobs, panels, query);
        },
        async memory(query = {}) {
            const memory = filterMemory(await stores.memory.list(), query);
            const page = normalizePage(query.page);
            const pageSize = normalizePageSize(query.pageSize);
            const pageInfo = buildPageInfo(memory.length, page, pageSize);
            const items = mapMemoryItems(memory).slice((page - 1) * pageSize, (page - 1) * pageSize + pageSize);
            return {
                kind: "memory-view",
                version: "stage-5",
                generatedAt: nowIso(),
                tenantId: query.tenantId,
                filters: query,
                pageInfo,
                summary: summarizeMemory(memory),
                items,
                patterns: mapMemoryItems(memory).filter((entry) => isPatternCategory(entry.category)),
                auditTrail: buildMemoryAuditTrail(memory),
            };
        },
        async settings(query = {}) {
            return buildDashboardSettings(stores, config, query, orchestrator);
        },
        async panel(product, query = {}) {
            return buildProductPanel(stores, product, query);
        },
    };
}
const PRODUCT_ORDER = ["lead-recovery", "nexusbuild", "provly", "neurormoves"];
const ACTIVE_JOB_STATUSES = ["pending", "queued", "routing", "planning", "waiting_approval", "running", "verifying"];
const PREFERRED_PATTERN_CATEGORIES = new Set(["workflow-template", "success-pattern", "failure-pattern", "business-rule", "communication-tone"]);
async function buildProductPanels(stores, query) {
    if (query.product) {
        return [await buildProductPanel(stores, query.product, query)];
    }
    return Promise.all(PRODUCT_ORDER.map((product) => buildProductPanel(stores, product, query)));
}
function buildSharedWorkflowOverview(jobs, memory) {
    const recentRuns = mapJobsForList(jobs, memory).slice(0, 4);
    return {
        summary: {
            ...summarizeSharedWorkflow(jobs),
            lastRunAt: recentRuns[0]?.updatedAt,
        },
        recentRuns,
    };
}
async function buildProductPanel(stores, product, query) {
    switch (product) {
        case "lead-recovery":
            return buildLeadRecoveryPanel(stores, query);
        case "nexusbuild":
            return buildNexusBuildPanel(stores, query);
        case "provly":
            return buildProvLyPanel(stores, query);
        case "neurormoves":
            return buildNeuroMovesPanel(stores, query);
        default:
            return buildLeadRecoveryPanel(stores, query);
    }
}
function filterJobs(jobs, query) {
    const sorted = [...jobs].filter((job) => {
        if (query.tenantId && job.tenantId !== query.tenantId) {
            return false;
        }
        if (query.product && job.goal.product !== query.product) {
            return false;
        }
        if (query.workflow && (job.route?.workflow || job.goal.product) !== query.workflow) {
            return false;
        }
        if (query.jobId && job.jobId !== query.jobId) {
            return false;
        }
        if (query.status) {
            const statuses = Array.isArray(query.status) ? query.status : [query.status];
            if (!statuses.includes(job.status)) {
                return false;
            }
        }
        if (query.approvalStatus) {
            const approvals = Array.isArray(query.approvalStatus) ? query.approvalStatus : [query.approvalStatus];
            if (!approvals.includes(job.approvalStatus)) {
                return false;
            }
        }
        if (query.lane && (job.route?.lane || "internal") !== query.lane) {
            return false;
        }
        if (!matchesDateRange(job.createdAt, query.from, query.to) && !matchesDateRange(job.updatedAt, query.from, query.to)) {
            return false;
        }
        if (!query.search) {
            return true;
        }
        return extractJobSearchText(job).includes(query.search.toLowerCase());
    });
    return sortJobs(sorted, query.sortBy, query.sortDirection);
}
function filterMemory(memory, query) {
    const filtered = [...memory].filter((entry) => {
        if (query.tenantId && entry.tenantId !== query.tenantId) {
            return false;
        }
        if (query.product && entry.product !== query.product) {
            return false;
        }
        if (!matchesDateRange(entry.createdAt, query.from, query.to) && !matchesDateRange(entry.updatedAt, query.from, query.to)) {
            return false;
        }
        if (!query.search) {
            return true;
        }
        return extractMemorySearchText(entry).includes(query.search.toLowerCase());
    });
    return sortMemory(filtered, query.sortBy, query.sortDirection);
}
function mapJobsForList(jobs, memory = []) {
    const memoryJobIds = new Set(memory.map((entry) => entry.sourceJobId).filter((item) => Boolean(item)));
    return [...jobs].sort(compareJobsByRecentUpdate).map((job) => ({
        ...buildJobSurface(job),
        hasLogs: job.logs.length > 0,
        hasMemoryUpdates: memoryJobIds.has(job.jobId),
        lastLogAt: job.logs.at(-1)?.at,
        approvalPreview: buildApprovalPreview(job),
    }));
}
function mapJobForDetail(job, memory = []) {
    return {
        ...buildJobSurface(job),
        goalPayload: job.goal.payload || {},
        route: job.route,
        plan: job.plan,
        result: job.result,
        workflowStatus: job.workflowStatus || buildWorkflowStatusModel(job),
        escalation: job.escalation,
        approvedStepIds: job.approvedStepIds,
        scratchpad: [...(job.scratchpad ?? [])]
            .sort((left, right) => right.at.localeCompare(left.at))
            .map((entry) => ({
            ...entry,
        })),
        worldState: job.worldState
            ? {
                ...job.worldState,
                actionHistory: [...job.worldState.actionHistory],
                observations: [...job.worldState.observations],
                repeatedActionWarnings: [...job.worldState.repeatedActionWarnings],
                modifiedPaths: [...job.worldState.modifiedPaths],
                failingTests: [...job.worldState.failingTests],
            }
            : undefined,
        logCount: job.logs.length,
        memoryUpdateCount: memory.filter((entry) => entry.sourceJobId === job.jobId).length,
    };
}
function mapJobTimeline(job) {
    return [...job.steps]
        .sort((left, right) => left.dependsOn.length - right.dependsOn.length || left.id.localeCompare(right.id))
        .map((step) => ({
        stepId: step.id,
        title: step.title,
        type: step.type,
        tool: step.tool,
        status: step.status,
        dependsOn: step.dependsOn,
        approvalRequired: Boolean(step.approvalRequired),
        retryable: Boolean(step.retryable || step.retry?.retryable),
        attempts: step.attempts,
        startedAt: step.startedAt,
        completedAt: step.completedAt,
        message: step.result?.message || step.error,
        error: step.error,
        retry: step.retry ? buildRetryView(step.retry) : undefined,
        inputSummary: summarizeValue(step.input),
        outputSummary: step.result ? summarizeValue(step.result.output) : undefined,
    }));
}
function mapJobLogs(job) {
    return [...job.logs]
        .sort((left, right) => right.at.localeCompare(left.at))
        .map((entry) => ({
        id: entry.id,
        at: entry.at,
        level: entry.level,
        message: entry.message,
        jobId: entry.jobId || job.jobId,
        tenantId: entry.tenantId || job.tenantId,
        product: entry.product || job.goal.product,
        workflow: entry.workflow || job.route?.workflow || job.goal.product,
        stepId: entry.stepId,
        stepType: entry.stepType,
        tool: entry.tool,
        agentId: entry.agentId,
        actorRole: entry.actorRole,
        actorId: entry.actorId,
        source: entry.source || (entry.stepId ? "step" : "job"),
        data: entry.data,
    }));
}
function buildApprovalQueueItems(jobs) {
    const items = [];
    for (const job of jobs) {
        const waitingSteps = job.steps.filter((step) => step.status === "waiting_approval" || step.approvalRequired);
        const candidateSteps = waitingSteps.length > 0
            ? waitingSteps
            : job.status === "waiting_approval" || job.approvalStatus === "pending"
                ? [currentApprovalStep(job)]
                : [];
        for (const step of candidateSteps) {
            if (!step) {
                continue;
            }
            const surface = buildJobSurface(job);
            items.push({
                ...surface,
                stepId: step.id,
                stepType: step.type,
                stepTitle: step.title,
                tool: step.tool,
                reason: step.result?.message || job.route?.reasoning || job.error || "Approval required before this action can continue.",
                preview: buildActionPreview(step, job),
                auditTrail: buildApprovalAuditTrail(job, step),
                canApprove: job.approvalStatus !== "rejected" && step.status !== "completed" && step.status !== "failed",
                canReject: job.approvalStatus !== "rejected" && step.status !== "completed",
                canEdit: Boolean(step.approvalRequired || step.tool === "sms" || step.tool === "email" || step.tool === "llm"),
                retryable: Boolean(step.retry?.retryable || step.retryable),
            });
        }
    }
    return items.sort((left, right) => right.updatedAt.localeCompare(left.updatedAt));
}
function buildApprovalAuditTrail(job, step) {
    const approvals = [];
    for (const log of [...job.logs].filter((entry) => entry.stepId === step.id)) {
        const action = resolveApprovalAuditAction(log);
        if (!action) {
            continue;
        }
        approvals.push({
            at: log.at,
            action,
            actorRole: log.actorRole,
            actorId: log.actorId,
            summary: log.message,
        });
    }
    approvals.sort((left, right) => right.at.localeCompare(left.at));
    if (approvals.length === 0 && step.status === "waiting_approval") {
        approvals.push({
            at: step.startedAt || job.updatedAt || job.createdAt,
            action: "request",
            actorRole: "system",
            actorId: undefined,
            summary: "Awaiting approval before this step can continue.",
        });
    }
    return approvals.slice(0, 3);
}
function resolveApprovalAuditAction(log) {
    const action = typeof log.data?.action === "string" ? log.data.action : undefined;
    if (action === "approve" || action === "reject") {
        return action;
    }
    const message = log.message.toLowerCase();
    if (message.includes("approval recorded")) {
        return "approve";
    }
    if (message.includes("approval rejected")) {
        return "reject";
    }
    if (message.includes("requires approval") || message.includes("waiting for approval")) {
        return "request";
    }
    return undefined;
}
function buildLogFeedItems(jobs, query = {}) {
    const items = [];
    for (const job of jobs) {
        if (query.jobId && job.jobId !== query.jobId) {
            continue;
        }
        for (const log of mapJobLogs(job)) {
            if (query.search && !`${log.message} ${JSON.stringify(log.data || {})}`.toLowerCase().includes(query.search.toLowerCase())) {
                continue;
            }
            if (query.product && log.product !== query.product) {
                continue;
            }
            if (query.workflow && log.workflow !== query.workflow) {
                continue;
            }
            if (!matchesDateRange(log.at, query.from, query.to)) {
                continue;
            }
            items.push(log);
        }
    }
    return items.sort((left, right) => right.at.localeCompare(left.at));
}
function summarizeJobs(jobs) {
    const byStatus = createJobStatusCountMap();
    const byProduct = createProductCountMap();
    const byWorkflow = {};
    const byApprovalStatus = createApprovalStatusCountMap();
    for (const job of jobs) {
        byStatus[job.status] += 1;
        byProduct[job.goal.product] += 1;
        byWorkflow[job.route?.workflow || job.goal.product] = (byWorkflow[job.route?.workflow || job.goal.product] || 0) + 1;
        byApprovalStatus[job.approvalStatus] += 1;
    }
    return {
        total: jobs.length,
        running: byStatus.running,
        waitingApproval: byStatus.waiting_approval,
        failed: byStatus.failed,
        completed: byStatus.completed,
        byStatus,
        byProduct,
        byWorkflow,
        byApprovalStatus,
    };
}
function summarizeSharedWorkflow(jobs) {
    let running = 0;
    let waitingApproval = 0;
    let failed = 0;
    let completed = 0;
    for (const job of jobs) {
        if (job.status === "running" || job.status === "routing" || job.status === "planning" || job.status === "verifying") {
            running += 1;
        }
        if (job.status === "waiting_approval" || job.approvalStatus === "pending") {
            waitingApproval += 1;
        }
        if (job.status === "failed") {
            failed += 1;
        }
        if (job.status === "completed") {
            completed += 1;
        }
    }
    return {
        total: jobs.length,
        running,
        waitingApproval,
        failed,
        completed,
    };
}
function summarizeApprovals(items) {
    const byProduct = createProductCountMap();
    const byWorkflow = {};
    const byLane = createLaneCountMap();
    let highRisk = 0;
    let mediumRisk = 0;
    let lowRisk = 0;
    for (const item of items) {
        byProduct[item.product] += 1;
        byWorkflow[item.workflow] = (byWorkflow[item.workflow] || 0) + 1;
        byLane[item.lane] += 1;
        if (item.riskLevel === "high" || item.riskLevel === "critical") {
            highRisk += 1;
        }
        else if (item.riskLevel === "medium") {
            mediumRisk += 1;
        }
        else {
            lowRisk += 1;
        }
    }
    return {
        total: items.length,
        highRisk,
        mediumRisk,
        lowRisk,
        byProduct,
        byWorkflow,
        byLane,
    };
}
function summarizeLogs(items) {
    const byProduct = createProductCountMap();
    const byWorkflow = {};
    let debug = 0;
    let info = 0;
    let warn = 0;
    let error = 0;
    for (const item of items) {
        byProduct[item.product || "lead-recovery"] += 1;
        byWorkflow[item.workflow || item.product || "shared"] = (byWorkflow[item.workflow || item.product || "shared"] || 0) + 1;
        switch (item.level) {
            case "debug":
                debug += 1;
                break;
            case "info":
                info += 1;
                break;
            case "warn":
                warn += 1;
                break;
            case "error":
                error += 1;
                break;
        }
    }
    return {
        total: items.length,
        debug,
        info,
        warn,
        error,
        byProduct,
        byWorkflow,
    };
}
function summarizeMemory(memory) {
    const byCategory = {};
    const byTier = {
        semantic: 0,
        procedural: 0,
        episodic: 0,
    };
    const byProduct = createProductCountMap();
    let patternCount = 0;
    let recentUpdates = 0;
    const cutoff = Date.now() - 24 * 60 * 60 * 1000;
    for (const entry of memory) {
        byCategory[entry.category] = (byCategory[entry.category] || 0) + 1;
        byTier[classifyMemoryTier(entry.category)] += 1;
        byProduct[entry.product] += 1;
        if (PREFERRED_PATTERN_CATEGORIES.has(entry.category)) {
            patternCount += 1;
        }
        if (Date.parse(entry.updatedAt) >= cutoff) {
            recentUpdates += 1;
        }
    }
    return {
        total: memory.length,
        editable: memory.filter((entry) => entry.editable).length,
        byCategory,
        byTier,
        byProduct,
        patternCount,
        recentUpdates,
    };
}
function summarizeMemoryByCategory(memory) {
    return memory.reduce((accumulator, entry) => {
        accumulator[entry.category] = (accumulator[entry.category] || 0) + 1;
        return accumulator;
    }, {});
}
function summarizeMemoryByProduct(memory) {
    const counts = createProductCountMap();
    for (const entry of memory) {
        counts[entry.product] += 1;
    }
    return counts;
}
function buildWorkflowActivitySummary(jobs) {
    const laneBreakdown = createLaneCountMap();
    let waitingApproval = 0;
    let failed = 0;
    let completed24h = 0;
    let failed24h = 0;
    const cutoff = Date.now() - 24 * 60 * 60 * 1000;
    for (const job of jobs) {
        laneBreakdown[job.route?.lane || "internal"] += 1;
        if (job.status === "waiting_approval") {
            waitingApproval += 1;
        }
        if (job.status === "failed") {
            failed += 1;
        }
        if (Date.parse(job.updatedAt) >= cutoff && job.status === "completed") {
            completed24h += 1;
        }
        if (Date.parse(job.updatedAt) >= cutoff && job.status === "failed") {
            failed24h += 1;
        }
    }
    return {
        totalActiveJobs: jobs.filter((job) => ACTIVE_JOB_STATUSES.includes(job.status)).length,
        waitingApproval,
        failed,
        completed24h,
        failed24h,
        laneBreakdown,
    };
}
function buildWorkflowActivityResponse(jobs, panels, query) {
    const products = panels.map((panel) => {
        const productJobs = jobs.filter((job) => job.goal.product === panel.product);
        return buildWorkflowActivityProductItem(panel, productJobs);
    });
    const recentCompletedRuns = mapJobsForList(jobs.filter((job) => job.status === "completed")).slice(0, 8);
    const recentFailedRuns = mapJobsForList(jobs.filter((job) => job.status === "failed")).slice(0, 8);
    const recurringJobs = buildRecurringJobsForProduct(jobs).slice(0, 8);
    const alerts = panels.flatMap((panel) => panel.alerts).slice(0, 10);
    return {
        kind: "workflow-activity",
        version: "stage-5",
        generatedAt: nowIso(),
        tenantId: query.tenantId,
        filters: query,
        summary: buildWorkflowActivitySummary(jobs),
        products,
        recentCompletedRuns,
        recentFailedRuns,
        recurringJobs,
        alerts,
    };
}
function buildOverviewAlerts(jobs, recentMemory, panels, knowledgeCoverage) {
    const alerts = [];
    const summary = summarizeJobs(jobs);
    if (summary.waitingApproval > 0) {
        alerts.push({
            id: `alert_${alerts.length + 1}`,
            level: summary.waitingApproval > 3 ? "critical" : "warning",
            title: "Approvals waiting",
            message: `${summary.waitingApproval} workflow step${summary.waitingApproval === 1 ? "" : "s"} need review before they can continue.`,
            createdAt: nowIso(),
            relatedProduct: undefined,
            actionLabel: "Review approvals",
            actionHref: "/dashboard/approvals",
            metadata: { waitingApproval: summary.waitingApproval },
        });
    }
    if (summary.failed > 0) {
        alerts.push({
            id: `alert_${alerts.length + 1}`,
            level: "critical",
            title: "Failed workflows",
            message: `${summary.failed} workflow${summary.failed === 1 ? "" : "s"} ended in a failed state.`,
            createdAt: nowIso(),
            actionLabel: "Inspect failures",
            actionHref: "/dashboard/jobs?status=failed",
            metadata: { failed: summary.failed },
        });
    }
    if (recentMemory.length > 0) {
        alerts.push({
            id: `alert_${alerts.length + 1}`,
            level: "info",
            title: "Memory updated",
            message: `${recentMemory.length} recent memory entr${recentMemory.length === 1 ? "y" : "ies"} are ready for review.`,
            createdAt: nowIso(),
            actionLabel: "Open memory",
            actionHref: "/dashboard/memory",
            metadata: { recentMemory: recentMemory.length },
        });
    }
    if (knowledgeCoverage.missingLaneDocuments > 0) {
        alerts.push({
            id: `alert_${alerts.length + 1}`,
            level: "warning",
            title: "Knowledge coverage incomplete",
            message: `${knowledgeCoverage.missingLaneDocuments} lane doc${knowledgeCoverage.missingLaneDocuments === 1 ? "" : "s"} are still missing from the authoritative corpus.`,
            createdAt: nowIso(),
            actionLabel: "Review knowledge corpus",
            metadata: {
                missingLaneDocuments: knowledgeCoverage.missingLaneDocuments,
                coveragePercent: knowledgeCoverage.coveragePercent,
            },
        });
    }
    for (const panel of panels) {
        const alert = panel.alerts[0];
        if (alert) {
            alerts.push(alert);
        }
    }
    return alerts.slice(0, 6);
}
function buildSummaryCards(jobs, memory, knowledgeCoverage) {
    const summary = summarizeJobs(jobs);
    const memorySummary = summarizeMemory(memory);
    return [
        {
            label: "Total jobs",
            value: summary.total,
            detail: "All workflow jobs in scope",
            tone: "neutral",
        },
        {
            label: "Running",
            value: summary.running,
            detail: "Currently executing jobs",
            tone: "accent",
        },
        {
            label: "Waiting approval",
            value: summary.waitingApproval,
            detail: "Jobs paused for review",
            tone: summary.waitingApproval > 0 ? "warning" : "success",
        },
        {
            label: "Failed",
            value: summary.failed,
            detail: "Jobs needing attention",
            tone: summary.failed > 0 ? "danger" : "success",
        },
        {
            label: "Completed",
            value: summary.completed,
            detail: "Finished jobs",
            tone: "success",
        },
        {
            label: "Memory patterns",
            value: memorySummary.patternCount,
            detail: "Reusable templates and rules",
            tone: memorySummary.patternCount > 0 ? "accent" : "neutral",
        },
        {
            label: "Knowledge coverage",
            value: `${knowledgeCoverage.coveragePercent}%`,
            detail: `${knowledgeCoverage.presentLaneDocuments}/${knowledgeCoverage.expectedLaneDocuments} lane docs present`,
            tone: knowledgeCoverage.missingLaneDocuments > 0 ? "warning" : "success",
        },
        {
            label: "Missing lane docs",
            value: knowledgeCoverage.missingLaneDocuments,
            detail: "Docs still needed for targeted retrieval",
            tone: knowledgeCoverage.missingLaneDocuments > 0 ? "warning" : "success",
        },
    ];
}
function buildProductCard(panel, jobs) {
    const productJobs = jobs.filter((job) => job.goal.product === panel.product);
    const activeJobs = productJobs.filter((job) => ACTIVE_JOB_STATUSES.includes(job.status)).length;
    const waitingApprovals = productJobs.filter((job) => job.status === "waiting_approval" || job.approvalStatus === "pending").length;
    const lastActivityAt = productJobs.reduce((latest, job) => (!latest || job.updatedAt > latest ? job.updatedAt : latest), panel.recentJobs[0]?.updatedAt);
    return {
        product: panel.product,
        title: panel.summary.title,
        description: panel.summary.description,
        primaryMetric: panel.summary.primaryMetric,
        secondaryMetrics: panel.summary.secondaryMetrics,
        activeJobs,
        waitingApprovals,
        alerts: panel.alerts.length,
        lastActivityAt,
    };
}
function buildRecurringJobsForProduct(jobs, product) {
    return [...jobs]
        .filter((job) => (product ? job.goal.product === product : true))
        .sort(compareJobsByRecentUpdate)
        .slice(0, 5)
        .map((job) => ({
        jobId: job.jobId,
        product: job.goal.product,
        workflow: job.route?.workflow || job.goal.product,
        title: job.goal.goal,
        stepId: currentJobStep(job)?.id,
        runAt: job.updatedAt,
        status: job.status,
        detail: job.result?.summary,
        source: "goal-payload",
    }));
}
function buildWorkflowActivityProductItem(panel, jobs) {
    const productJobs = [...jobs].sort(compareJobsByRecentUpdate);
    const recentJobs = mapJobsForList(productJobs).slice(0, 5);
    const recentCompletedRuns = mapJobsForList(productJobs.filter((job) => job.status === "completed")).slice(0, 5);
    const recentFailedRuns = mapJobsForList(productJobs.filter((job) => job.status === "failed")).slice(0, 5);
    const recurringJobs = buildRecurringJobsForProduct(productJobs, panel.product);
    const activeJobs = productJobs.filter((job) => ACTIVE_JOB_STATUSES.includes(job.status)).length;
    const runningJobs = productJobs.filter((job) => job.status === "running").length;
    const waitingApprovalJobs = productJobs.filter((job) => job.status === "waiting_approval").length;
    const failedJobs = productJobs.filter((job) => job.status === "failed").length;
    const completedJobs24h = productJobs.filter((job) => job.status === "completed" && Date.parse(job.updatedAt) >= Date.now() - 24 * 60 * 60 * 1000).length;
    const failedJobs24h = productJobs.filter((job) => job.status === "failed" && Date.parse(job.updatedAt) >= Date.now() - 24 * 60 * 60 * 1000).length;
    const laneBreakdown = createLaneCountMap();
    for (const job of productJobs) {
        laneBreakdown[job.route?.lane || "internal"] += 1;
    }
    return {
        product: panel.product,
        title: panel.title,
        activeJobs,
        runningJobs,
        waitingApprovalJobs,
        failedJobs,
        completedJobs24h,
        failedJobs24h,
        laneBreakdown,
        recentJobs,
        recentCompletedRuns,
        recentFailedRuns,
        recurringJobs,
        alerts: panel.alerts,
        lastActivityAt: productJobs[0]?.updatedAt,
    };
}
function buildActionPreview(step, job) {
    return {
        title: step.title,
        body: summarizeValue(step.input),
        tool: step.tool,
        stepId: step.id,
        stepType: step.type,
        actionLabel: step.approvalRequired ? "Approve action" : "Review action",
        data: {
            jobId: job.jobId,
            product: job.goal.product,
            workflow: job.route?.workflow || job.goal.product,
            input: step.input,
        },
    };
}
function buildRetryView(retry) {
    return {
        attempts: retry.attempts,
        maxAttempts: retry.maxAttempts,
        retryable: retry.retryable,
        exhausted: retry.exhausted,
        lastAttemptAt: retry.lastAttemptAt,
        lastError: retry.lastError,
        nextRetryAt: retry.nextRetryAt,
    };
}
function buildJobSurface(job) {
    const workflow = job.route?.workflow || job.goal.product;
    const currentStep = currentJobStep(job);
    const completedStepCount = job.steps.filter((step) => step.status === "completed").length;
    const waitingApprovalStepCount = job.steps.filter((step) => step.status === "waiting_approval").length;
    const failedStepCount = job.steps.filter((step) => step.status === "failed").length;
    const retryableStepCount = job.steps.filter((step) => Boolean(step.retry?.retryable || step.retryable)).length;
    return {
        jobId: job.jobId,
        tenantId: job.tenantId,
        product: job.goal.product,
        workflow,
        goal: job.goal.goal,
        priority: job.goal.priority,
        mode: job.goal.mode,
        status: job.status,
        approvalStatus: job.approvalStatus,
        riskLevel: job.route?.riskLevel || "low",
        lane: job.route?.lane || "internal",
        createdAt: job.createdAt,
        updatedAt: job.updatedAt,
        currentStepId: currentStep?.id,
        currentStepTitle: currentStep?.title,
        currentStepType: currentStep?.type,
        currentStepTool: currentStep?.tool,
        stepCount: job.steps.length,
        completedStepCount,
        waitingApprovalStepCount,
        failedStepCount,
        retryableStepCount,
        resultSummary: job.result?.summary,
        error: job.error,
        tags: buildJobTags(job),
    };
}
function buildJobTags(job) {
    const tags = new Set([
        job.goal.product,
        job.goal.mode,
        job.approvalStatus,
        job.route?.lane || "internal",
        job.route?.workflow || job.goal.product,
    ]);
    for (const tag of job.route?.tags || []) {
        tags.add(tag);
    }
    return [...tags];
}
function buildApprovalPreview(job) {
    const step = currentApprovalStep(job);
    if (!step) {
        return undefined;
    }
    return buildActionPreview(step, job);
}
function currentJobStep(job) {
    return (job.steps.find((step) => step.status === "running") ||
        job.steps.find((step) => step.status === "waiting_approval") ||
        job.steps.find((step) => step.status === "pending") ||
        job.steps.find((step) => step.status === "failed") ||
        job.steps.at(-1));
}
function currentApprovalStep(job) {
    return job.steps.find((step) => step.status === "waiting_approval" || step.approvalRequired) || currentJobStep(job);
}
function createJobStatusCountMap() {
    return {
        pending: 0,
        queued: 0,
        routing: 0,
        planning: 0,
        waiting_approval: 0,
        running: 0,
        verifying: 0,
        failed: 0,
        completed: 0,
    };
}
function createApprovalStatusCountMap() {
    return {
        not_required: 0,
        pending: 0,
        approved: 0,
        rejected: 0,
    };
}
function createProductCountMap() {
    return {
        "lead-recovery": 0,
        nexusbuild: 0,
        provly: 0,
        neurormoves: 0,
    };
}
function createLaneCountMap() {
    return {
        internal: 0,
        external: 0,
        mixed: 0,
    };
}
function buildPageInfo(total, page, pageSize) {
    const normalizedPage = Math.max(1, page);
    const normalizedPageSize = Math.max(1, pageSize);
    const totalPages = Math.max(1, Math.ceil(total / normalizedPageSize));
    const boundedPage = Math.min(normalizedPage, totalPages);
    const hasMore = boundedPage * normalizedPageSize < total;
    return {
        page: boundedPage,
        pageSize: normalizedPageSize,
        total,
        hasMore,
        nextPage: hasMore ? boundedPage + 1 : undefined,
    };
}
function normalizePage(value) {
    return Number.isFinite(value) && value && value > 0 ? Math.floor(value) : 1;
}
function normalizePageSize(value) {
    const size = Number.isFinite(value) && value ? Math.floor(value) : PAGE_SIZE_DEFAULT;
    return Math.min(Math.max(1, size), PAGE_SIZE_MAX);
}
function nowIso() {
    return new Date().toISOString();
}
function compareJobsByRecentUpdate(left, right) {
    return right.updatedAt.localeCompare(left.updatedAt) || right.createdAt.localeCompare(left.createdAt);
}
function sortJobs(jobs, sortBy, sortDirection) {
    const direction = sortDirection === "asc" ? 1 : -1;
    return [...jobs].sort((left, right) => direction * compareJobFields(left, right, sortBy));
}
function sortMemory(memory, sortBy, sortDirection) {
    const direction = sortDirection === "asc" ? 1 : -1;
    return [...memory].sort((left, right) => direction * compareMemoryFields(left, right, sortBy));
}
function compareJobFields(left, right, sortBy) {
    switch (sortBy) {
        case "createdAt":
            return left.createdAt.localeCompare(right.createdAt);
        case "status":
            return left.status.localeCompare(right.status);
        case "product":
            return left.goal.product.localeCompare(right.goal.product);
        case "priority":
            return left.goal.priority.localeCompare(right.goal.priority);
        case "updatedAt":
        default:
            return left.updatedAt.localeCompare(right.updatedAt);
    }
}
function compareMemoryFields(left, right, sortBy) {
    switch (sortBy) {
        case "createdAt":
            return left.createdAt.localeCompare(right.createdAt);
        case "status":
            return left.category.localeCompare(right.category);
        case "product":
            return left.product.localeCompare(right.product);
        case "priority":
            return String(left.confidence).localeCompare(String(right.confidence));
        case "updatedAt":
        default:
            return left.updatedAt.localeCompare(right.updatedAt);
    }
}
function matchesDateRange(value, from, to) {
    const timestamp = Date.parse(value);
    if (Number.isNaN(timestamp)) {
        return true;
    }
    if (from && timestamp < Date.parse(from)) {
        return false;
    }
    if (to && timestamp > Date.parse(to)) {
        return false;
    }
    return true;
}
function extractJobSearchText(job) {
    const logText = job.logs.map((log) => log.message).join(" ");
    return [
        job.jobId,
        job.goal.goal,
        job.goal.product,
        job.goal.mode,
        job.goal.priority,
        job.route?.workflow,
        job.route?.reasoning,
        job.result?.summary,
        job.error,
        logText,
        ...(job.route?.tags || []),
    ]
        .filter((value) => typeof value === "string" && value.length > 0)
        .join(" ")
        .toLowerCase();
}
function extractMemorySearchText(entry) {
    const value = typeof entry.value === "string" ? entry.value : JSON.stringify(entry.value);
    return [entry.id, entry.key, entry.category, entry.product, value].join(" ").toLowerCase();
}
function mapMemoryItems(memory) {
    return [...memory]
        .sort((left, right) => right.updatedAt.localeCompare(left.updatedAt))
        .map((entry) => ({
        ...entry,
        tier: classifyMemoryTier(entry.category),
        summary: summarizeValue(entry.value),
        sourceLabel: entry.sourceJobId ? `Job ${shortIdentifier(entry.sourceJobId)}` : undefined,
        sourceStepLabel: entry.sourceStepId ? `Step ${entry.sourceStepId}` : undefined,
    }));
}
function buildMemoryAuditTrail(memory) {
    const explicitAuditEntries = memory.flatMap((entry) => (entry.auditTrail || []).map((audit, index) => ({
        id: `${entry.id}_${index}`,
        at: audit.at,
        tenantId: entry.tenantId,
        product: entry.product,
        category: entry.category,
        key: entry.key,
        confidence: entry.confidence,
        editable: entry.editable,
        sourceJobId: audit.sourceJobId || entry.sourceJobId,
        sourceStepId: audit.sourceStepId || entry.sourceStepId,
        summary: audit.note || `${audit.action} ${entry.key}`,
        action: audit.action,
        actorRole: audit.actorRole,
        actorId: audit.actorId,
        note: audit.note,
    })));
    if (explicitAuditEntries.length > 0) {
        return explicitAuditEntries.sort((left, right) => right.at.localeCompare(left.at)).slice(0, 50);
    }
    return mapMemoryItems(memory)
        .slice(0, 50)
        .map((entry) => ({
        id: entry.id,
        at: entry.updatedAt,
        tenantId: entry.tenantId,
        product: entry.product,
        category: entry.category,
        key: entry.key,
        confidence: entry.confidence,
        editable: entry.editable,
        sourceJobId: entry.sourceJobId,
        sourceStepId: entry.sourceStepId,
        summary: entry.summary,
    }));
}
function isPatternCategory(category) {
    return PREFERRED_PATTERN_CATEGORIES.has(category);
}
function summarizeValue(value) {
    if (typeof value === "string") {
        return value.trim() || "No content.";
    }
    if (typeof value === "number" || typeof value === "boolean") {
        return String(value);
    }
    if (Array.isArray(value)) {
        const preview = value.slice(0, 3).map((item) => summarizeValue(item));
        return preview.length > 0 ? preview.join("; ") : "Empty array.";
    }
    if (value && typeof value === "object") {
        const entries = Object.entries(value)
            .slice(0, 4)
            .map(([key, item]) => `${key}: ${summarizeValue(item)}`);
        return entries.length > 0 ? entries.join("; ") : "Empty object.";
    }
    return "No content.";
}
function shortIdentifier(value) {
    return value.replace(/[^a-z0-9]/gi, "").slice(0, 8) || value.slice(0, 8);
}
async function buildLeadRecoveryPanel(stores, query) {
    const tenantId = query.tenantId || "default";
    const [jobs, memory, leads, interactions] = await Promise.all([
        stores.jobs.list(),
        stores.memory.list(),
        stores.domain.loadLeads(),
        stores.domain.listInteractions(tenantId),
    ]);
    const leadJobs = filterJobs(jobs, { ...query, product: "lead-recovery" });
    const leadMemory = filterMemory(memory, { ...query, product: "lead-recovery" });
    const tenantLeads = leads.filter((lead) => lead.tenantId === tenantId);
    const recentInteractions = [...interactions].sort((left, right) => right.at.localeCompare(left.at)).slice(0, 8);
    const recentCallEvents = extractLeadRecoveryCallEvents(leadJobs).slice(0, 6);
    const messageTemplates = extractLeadRecoveryTemplates(leadMemory).slice(0, 6);
    const allApprovalItems = buildApprovalQueueItems(leadJobs);
    const approvalItems = allApprovalItems.slice(0, 6);
    const pendingApprovals = allApprovalItems.length;
    const leadRecoveryResults = buildLeadRecoveryResults(leadJobs);
    const recentResults = leadRecoveryResults.slice(0, 8);
    const resultSummary = buildLeadRecoveryResultSummary(leadRecoveryResults, pendingApprovals);
    const recentLeads = [...tenantLeads]
        .sort((left, right) => compareLeadRecency(left, right))
        .slice(0, 8)
        .map((lead) => ({
        leadId: lead.leadId,
        phone: lead.phone,
        name: lead.name,
        stage: lead.stage,
        doNotContact: lead.doNotContact,
        lastContactedAt: lead.lastContactedAt,
    }));
    const contactedLeads = tenantLeads.filter((lead) => ["contacted", "replied", "qualified"].includes(lead.stage)).length;
    const optedOutLeads = tenantLeads.filter((lead) => lead.doNotContact || lead.stage === "opted_out").length;
    const blockedLeads = tenantLeads.filter((lead) => lead.stage === "blocked").length;
    const recentlyContactedLeads = tenantLeads.filter((lead) => isWithinHours(lead.lastContactedAt, 48)).length;
    const outsideBusinessHours = leadJobs.filter((job) => {
        const reason = `${job.result?.data?.suppressionReason || ""} ${job.route?.reasoning || ""} ${job.error || ""}`.toLowerCase();
        return reason.includes("outside-business-hours") || reason.includes("outside business hours");
    }).length;
    const within48Hours = leadJobs.filter((job) => {
        const reason = `${job.result?.data?.suppressionReason || ""} ${job.route?.reasoning || ""}`.toLowerCase();
        return reason.includes("within-48-hours") || reason.includes("48 hours");
    }).length;
    return {
        kind: "product-panel",
        version: "stage-5",
        generatedAt: nowIso(),
        tenantId,
        filters: query,
        product: "lead-recovery",
        title: "Lead Recovery",
        summary: {
            title: "Missed-call recovery operations",
            description: "Track lead follow-up, suppression handling, SMS drafts, and delivery outcomes for missed calls.",
            primaryMetric: {
                label: "Contacted leads",
                value: contactedLeads,
                tone: "success",
            },
            secondaryMetrics: [
                { label: "Total leads", value: tenantLeads.length, tone: "neutral" },
                { label: "Recently contacted", value: recentlyContactedLeads, tone: "accent" },
                { label: "Opted out", value: optedOutLeads, tone: "warning" },
                { label: "Pending approvals", value: pendingApprovals, tone: "danger" },
            ],
        },
        resultSummary,
        recentResults,
        approvalItems,
        recentJobs: mapJobsForList(leadJobs, leadMemory).slice(0, 8),
        alerts: buildLeadRecoveryAlerts({
            pendingApprovals,
            optedOutLeads,
            blockedLeads,
            within48Hours,
            outsideBusinessHours,
        }),
        recentMemory: mapMemoryItems(leadMemory).slice(0, 6),
        leadSummary: {
            totalLeads: tenantLeads.length,
            contactedLeads,
            optedOutLeads,
            blockedLeads,
            recentlyContactedLeads,
        },
        suppressionSummary: {
            within48Hours,
            optedOut: optedOutLeads,
            outsideBusinessHours,
            pendingApprovals,
        },
        recentLeads,
        recentInteractions: recentInteractions.map((interaction) => ({
            interactionId: interaction.interactionId,
            leadId: interaction.leadId,
            channel: interaction.channel,
            direction: interaction.direction,
            summary: interaction.summary,
            at: interaction.at,
        })),
        recentCallEvents,
        messageTemplates,
    };
}
function buildLeadRecoveryResults(jobs) {
    return [...jobs]
        .sort(compareJobsByRecentUpdate)
        .filter((job) => Boolean(job.result))
        .map((job) => {
        const data = resolveRecord(job.result?.data);
        const lead = extractLeadRecoveryLead(job);
        return {
            ...buildJobSurface(job),
            eventId: resolveText(data.eventId) || job.jobId,
            leadId: resolveText(data.leadId) || lead?.leadId,
            leadName: resolveText(data.leadName) || lead?.name,
            phone: resolveText(data.phone) || lead?.phone || "unknown",
            scenario: normalizeLeadRecoveryScenario(data.scenario),
            contactable: resolveBoolean(data.contactable),
            suppressionReason: resolveText(data.suppressionReason) || job.route?.reasoning || job.error || "Lead recovery completed.",
            leadStage: resolveText(data.leadStage) || lead?.stage || "new",
            resultStatus: job.result?.status || "partial",
            sendStatus: resolveText(data.sendStatus) || "unknown",
            sendProvider: resolveText(data.sendProvider),
            verificationStatus: resolveText(data.verificationStatus) || "unknown",
            summary: job.result?.summary || "Lead recovery result",
            message: resolveText(data.message),
            actionsTaken: job.result?.actionsTaken || [],
            deliveredAt: resolveText(data.deliveredAt) || resolveText(data.lastOutboundAt),
        };
    })
        .slice(0, 8);
}
function buildLeadRecoveryResultSummary(results, pendingApprovals) {
    return {
        total: results.length,
        succeeded: results.filter((result) => result.resultStatus === "succeeded").length,
        partial: results.filter((result) => result.resultStatus === "partial").length,
        blocked: results.filter((result) => !result.contactable).length,
        waitingApproval: pendingApprovals,
        delivered: results.filter((result) => result.sendStatus === "delivered").length,
        queued: results.filter((result) => result.sendStatus === "queued").length,
        failed: results.filter((result) => result.sendStatus === "failed").length,
    };
}
function extractLeadRecoveryLead(job) {
    const payload = job.goal.payload;
    if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
        return undefined;
    }
    const leadRecovery = payload.leadRecovery;
    const lead = leadRecovery?.lead;
    return lead ? { leadId: lead.leadId, name: lead.name, phone: lead.phone, stage: lead.stage } : undefined;
}
function resolveRecord(value) {
    return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}
function resolveText(value) {
    return typeof value === "string" && value.trim() ? value.trim() : undefined;
}
function resolveBoolean(value) {
    if (typeof value === "boolean") {
        return value;
    }
    if (typeof value === "string") {
        return ["true", "1", "yes"].includes(value.trim().toLowerCase());
    }
    return Boolean(value);
}
function extractLeadRecoveryCallEvents(jobs) {
    const events = [];
    for (const job of jobs) {
        const leadRecovery = job.goal.payload && typeof job.goal.payload === "object"
            ? job.goal.payload.leadRecovery
            : undefined;
        const event = leadRecovery?.event;
        if (!event) {
            continue;
        }
        events.push({
            eventId: typeof event.eventId === "string" ? event.eventId : job.jobId,
            callerPhone: typeof event.callerPhone === "string" ? event.callerPhone : "unknown",
            calledNumber: typeof event.calledNumber === "string" ? event.calledNumber : "unknown",
            missedAt: typeof event.missedAt === "string" ? event.missedAt : job.updatedAt,
            source: event.source === "import" || event.source === "manual" ? event.source : "webhook",
        });
    }
    return events.sort((left, right) => right.missedAt.localeCompare(left.missedAt));
}
function extractLeadRecoveryTemplates(memory) {
    return mapMemoryItems(memory)
        .filter((entry) => ["success-pattern", "workflow-template", "communication-tone", "business-rule"].includes(entry.category))
        .map((entry) => {
        const value = typeof entry.value === "object" && entry.value ? entry.value : undefined;
        const scenario = normalizeLeadRecoveryScenario(value?.scenario || entry.key);
        return {
            scenario,
            title: humanizeScenarioLabel(scenario),
            body: typeof value?.template === "string" ? value.template : summarizeValue(entry.value),
            tone: normalizeLeadRecoveryTone(value?.tone),
            editable: entry.editable,
            updatedAt: entry.updatedAt,
            sourceJobId: entry.sourceJobId,
        };
    })
        .sort((left, right) => (right.updatedAt || "").localeCompare(left.updatedAt || ""));
}
function buildLeadRecoveryAlerts(input) {
    const alerts = [];
    if (input.pendingApprovals > 0) {
        alerts.push({
            id: `lead-alert-${alerts.length + 1}`,
            level: "warning",
            title: "Lead follow-up awaiting approval",
            message: `${input.pendingApprovals} missed-call recovery job${input.pendingApprovals === 1 ? "" : "s"} still need approval.`,
            createdAt: nowIso(),
            relatedProduct: "lead-recovery",
            actionLabel: "Review queue",
            actionHref: "/dashboard/approvals?product=lead-recovery",
            metadata: { pendingApprovals: input.pendingApprovals },
        });
    }
    if (input.optedOutLeads > 0 || input.blockedLeads > 0) {
        alerts.push({
            id: `lead-alert-${alerts.length + 1}`,
            level: "critical",
            title: "Suppression in effect",
            message: `${input.optedOutLeads + input.blockedLeads} lead${input.optedOutLeads + input.blockedLeads === 1 ? "" : "s"} cannot receive follow-up.`,
            createdAt: nowIso(),
            relatedProduct: "lead-recovery",
            actionLabel: "Inspect leads",
            actionHref: "/dashboard/panels/lead-recovery",
            metadata: {
                optedOutLeads: input.optedOutLeads,
                blockedLeads: input.blockedLeads,
            },
        });
    }
    if (input.within48Hours > 0) {
        alerts.push({
            id: `lead-alert-${alerts.length + 1}`,
            level: "info",
            title: "Recent contact suppression",
            message: `${input.within48Hours} follow-up check${input.within48Hours === 1 ? "" : "s"} were blocked by the 48-hour timing rule.`,
            createdAt: nowIso(),
            relatedProduct: "lead-recovery",
            metadata: { within48Hours: input.within48Hours },
        });
    }
    if (input.outsideBusinessHours > 0) {
        alerts.push({
            id: `lead-alert-${alerts.length + 1}`,
            level: "warning",
            title: "After-hours requests",
            message: `${input.outsideBusinessHours} lead follow-up action${input.outsideBusinessHours === 1 ? "" : "s"} happened outside business hours.`,
            createdAt: nowIso(),
            relatedProduct: "lead-recovery",
            metadata: { outsideBusinessHours: input.outsideBusinessHours },
        });
    }
    return alerts;
}
function normalizeLeadRecoveryScenario(value) {
    const text = typeof value === "string" ? value.toLowerCase() : "";
    if (text.includes("after-hours")) {
        return "after-hours";
    }
    if (text.includes("service")) {
        return "service-inquiry";
    }
    if (text.includes("quote")) {
        return "quote-followup";
    }
    if (text.includes("appointment")) {
        return "appointment-callback";
    }
    return "generic-callback";
}
function normalizeLeadRecoveryTone(value) {
    if (value === "warm" || value === "urgent") {
        return value;
    }
    return "business-safe";
}
function humanizeScenarioLabel(scenario) {
    switch (scenario) {
        case "after-hours":
            return "After-hours callback";
        case "service-inquiry":
            return "Service inquiry follow-up";
        case "quote-followup":
            return "Quote follow-up";
        case "appointment-callback":
            return "Appointment callback";
        case "generic-callback":
        default:
            return "Generic callback";
    }
}
function compareLeadRecency(left, right) {
    return getLeadRecency(right) - getLeadRecency(left);
}
function getLeadRecency(lead) {
    return Date.parse(lead.lastContactedAt || lead.lastOutboundAt || lead.lastInboundAt || "1970-01-01T00:00:00.000Z");
}
function isWithinHours(value, hours) {
    if (!value) {
        return false;
    }
    const timestamp = Date.parse(value);
    return !Number.isNaN(timestamp) && Date.now() - timestamp <= hours * 60 * 60 * 1000;
}
async function buildNexusBuildPanel(stores, query) {
    const tenantId = query.tenantId || "default";
    const [jobs, memory, savedBuilds, checks, snapshots, reports, runs] = await Promise.all([
        stores.jobs.list(),
        stores.memory.list(),
        stores.nexusbuild.listSavedBuilds(tenantId),
        stores.nexusbuild.listCompatibilityChecks(tenantId),
        stores.nexusbuild.listPricingSnapshots(tenantId),
        stores.nexusbuild.listAnalysisReports(tenantId),
        stores.nexusbuild.listRecommendationRuns(tenantId),
    ]);
    const selectedReportBuildId = query.reportBuildId?.trim() || undefined;
    const selectedPriceSource = query.priceSource?.trim() || undefined;
    const selectedComparisonBuildId = query.comparisonBuildId?.trim() || undefined;
    const productJobs = filterJobs(jobs, { ...query, product: "nexusbuild" });
    const productMemory = filterMemory(memory, { ...query, product: "nexusbuild" });
    const visibleReports = filterNexusBuildReports(reports, selectedReportBuildId);
    const visibleChecks = filterNexusBuildChecks(checks, selectedReportBuildId);
    const visibleRuns = filterNexusBuildRuns(runs, selectedReportBuildId);
    const scopedSnapshots = filterNexusBuildSnapshots(snapshots, selectedReportBuildId);
    const visibleSnapshots = selectedPriceSource
        ? scopedSnapshots.filter((snapshot) => snapshot.source === selectedPriceSource)
        : scopedSnapshots;
    const latestScore = visibleChecks[0]?.score;
    const pricedSnapshots = visibleSnapshots.filter((snapshot) => typeof snapshot.price === "number");
    const livePricingEnabled = visibleSnapshots.some((snapshot) => /browser|api|retail|marketplace/i.test(snapshot.source));
    const watchedItems = new Set(visibleSnapshots.map((snapshot) => snapshot.partId || snapshot.label || snapshot.source)).size;
    const latestAveragePrice = pricedSnapshots.length > 0 ? Math.round(pricedSnapshots.reduce((total, snapshot) => total + (snapshot.price || 0), 0) / pricedSnapshots.length) : undefined;
    const recentReports = visibleReports.slice(0, 6);
    const recentRuns = [...visibleRuns].sort(compareRunByRecentUpdate).slice(0, 6);
    const latestReport = recentReports[0] ? buildFilteredNexusBuildReport(recentReports[0], selectedPriceSource, selectedComparisonBuildId) : undefined;
    const preferredBuilds = savedBuilds.filter((build) => build.preferred).length;
    return {
        kind: "product-panel",
        version: "stage-5",
        generatedAt: nowIso(),
        tenantId,
        filters: query,
        product: "nexusbuild",
        title: "NexusBuild",
        summary: {
            title: "PC build analysis",
            description: "Review compatibility, bottlenecks, live price signals, and build value across saved or imported part lists.",
            primaryMetric: {
                label: "Compatibility score",
                value: latestScore ?? 0,
                tone: latestScore && latestScore >= 85 ? "success" : latestScore && latestScore >= 70 ? "accent" : "warning",
            },
            secondaryMetrics: [
                { label: "Saved builds", value: savedBuilds.length, tone: "neutral" },
                { label: "Preferred builds", value: preferredBuilds, tone: "accent" },
                { label: "Price snapshots", value: visibleSnapshots.length, tone: "neutral" },
                { label: "Recommendation runs", value: visibleRuns.length, tone: "neutral" },
            ],
        },
        recentJobs: mapJobsForList(productJobs, productMemory).slice(0, 8),
        alerts: buildNexusBuildAlerts({
            latestScore,
            snapshots: visibleSnapshots,
            productJobs,
        }),
        recentMemory: mapMemoryItems(productMemory).slice(0, 6),
        buildSummary: {
            savedBuilds: savedBuilds.length,
            preferredBuilds,
            recommendationRuns: visibleRuns.length,
            reportCount: visibleReports.length,
            compatibilityChecks: visibleChecks.length,
            pricingSnapshots: visibleSnapshots.length,
        },
        compatibilitySummary: {
            pass: visibleChecks.filter((check) => check.status === "pass").length,
            warn: visibleChecks.filter((check) => check.status === "warn").length,
            fail: visibleChecks.filter((check) => check.status === "fail").length,
            latestScore,
        },
        pricingSummary: {
            livePricingEnabled,
            snapshotCount: visibleSnapshots.length,
            watchedItems,
            latestAveragePrice,
        },
        savedBuilds: savedBuilds
            .slice()
            .sort((left, right) => right.updatedAt.localeCompare(left.updatedAt))
            .slice(0, 8)
            .map((build) => ({
            buildId: build.buildId,
            name: build.name,
            useCase: build.useCase,
            budget: build.budget,
            currency: build.currency,
            preferred: Boolean(build.preferred),
            partCount: build.parts.length,
            updatedAt: build.updatedAt,
        })),
        latestReports: recentReports.map((report) => ({
            reportId: report.reportId,
            buildId: report.buildId,
            title: report.title,
            summary: report.summary,
            compatibilityScore: report.compatibility.score,
            performanceScore: report.performance.score,
            valueScore: report.value.score,
            createdAt: report.createdAt,
            updatedAt: report.updatedAt,
        })),
        latestRecommendationRuns: recentRuns.map((run) => ({
            runId: run.runId,
            buildId: run.buildId,
            operation: run.operation,
            status: run.status,
            score: run.score,
            updatedAt: run.updatedAt,
        })),
        latestReport,
    };
}
function buildNexusBuildAlerts(input) {
    const alerts = [];
    if (input.latestScore !== undefined && input.latestScore < 70) {
        alerts.push({
            id: `nexus-alert-${alerts.length + 1}`,
            level: "warning",
            title: "Compatibility needs review",
            message: `Latest compatibility score is ${input.latestScore}. Review the build before purchase.`,
            createdAt: nowIso(),
            relatedProduct: "nexusbuild",
            actionLabel: "Open report",
            actionHref: "/dashboard/panels/nexusbuild",
            metadata: { latestScore: input.latestScore },
        });
    }
    if (input.snapshots.length === 0) {
        alerts.push({
            id: `nexus-alert-${alerts.length + 1}`,
            level: "info",
            title: "No live price snapshots",
            message: "NexusBuild is operating on saved or catalog data only.",
            createdAt: nowIso(),
            relatedProduct: "nexusbuild",
            metadata: {},
        });
    }
    if (input.productJobs.some((job) => job.status === "failed")) {
        alerts.push({
            id: `nexus-alert-${alerts.length + 1}`,
            level: "critical",
            title: "Build workflow failure",
            message: "One or more NexusBuild jobs failed and may need a retry or manual correction.",
            createdAt: nowIso(),
            relatedProduct: "nexusbuild",
            actionLabel: "Inspect failures",
            actionHref: "/dashboard/jobs?product=nexusbuild&status=failed",
            metadata: {},
        });
    }
    return alerts;
}
function compareReportByRecentUpdate(left, right) {
    return right.updatedAt.localeCompare(left.updatedAt);
}
function compareRunByRecentUpdate(left, right) {
    return right.updatedAt.localeCompare(left.updatedAt);
}
function filterNexusBuildReports(reports, buildId) {
    const sorted = [...reports].sort(compareReportByRecentUpdate);
    if (!buildId) {
        return sorted;
    }
    return sorted.filter((report) => report.buildId === buildId);
}
function filterNexusBuildChecks(checks, buildId) {
    if (!buildId) {
        return checks;
    }
    return checks.filter((check) => check.buildId === buildId);
}
function filterNexusBuildRuns(runs, buildId) {
    if (!buildId) {
        return runs;
    }
    return runs.filter((run) => run.buildId === buildId);
}
function filterNexusBuildSnapshots(snapshots, buildId) {
    if (!buildId) {
        return snapshots;
    }
    return snapshots.filter((snapshot) => snapshot.buildId === buildId);
}
function buildFilteredNexusBuildReport(report, priceSource, comparisonBuildId) {
    const snapshots = priceSource ? report.pricing.snapshots.filter((snapshot) => snapshot.source === priceSource) : report.pricing.snapshots;
    const comparison = report.comparison
        ? {
            ...report.comparison,
            matrix: filterNexusBuildComparisonMatrix(report.comparison.matrix, comparisonBuildId, report.comparison.winnerBuildId),
        }
        : undefined;
    return {
        ...report,
        comparison,
        pricing: {
            ...report.pricing,
            snapshotCount: snapshots.length,
            snapshots,
            livePricingEnabled: snapshots.some((snapshot) => /browser|api|retail|marketplace/i.test(snapshot.source)),
        },
    };
}
function filterNexusBuildComparisonMatrix(matrix, comparisonBuildId, winnerBuildId) {
    if (!comparisonBuildId) {
        return matrix;
    }
    const selectedBuildId = comparisonBuildId === "winner" ? winnerBuildId : comparisonBuildId;
    if (!selectedBuildId) {
        return [];
    }
    return matrix.filter((row) => row.buildId === selectedBuildId);
}
async function buildProvLyPanel(stores, query) {
    const tenantId = query.tenantId || "default";
    const caseId = query.caseId;
    const [jobs, memory, items, categories, rooms, attachments, receipts, checks, exports, reports, preferences] = await Promise.all([
        stores.jobs.list(),
        stores.memory.list(),
        stores.provly.listInventoryItems(tenantId, caseId),
        stores.provly.listInventoryCategories(tenantId, caseId),
        stores.provly.listRooms(tenantId, caseId),
        stores.provly.listAttachments(tenantId, caseId),
        stores.provly.listReceipts(tenantId, caseId),
        stores.provly.listCompletenessChecks(tenantId, caseId),
        stores.provly.listClaimExports(tenantId, caseId),
        stores.provly.listAnalysisReports(tenantId, caseId),
        stores.provly.listUserPreferences(tenantId),
    ]);
    const productJobs = filterJobs(jobs, { ...query, product: "provly" });
    const productMemory = filterMemory(memory, { ...query, product: "provly" });
    const latestCheck = checks[0];
    const readyExportCount = exports.filter((item) => item.status === "ready" || item.status === "exported").length;
    const latestReport = reports[0];
    const highValueItems = [...items]
        .filter((item) => item.highValue)
        .sort((left, right) => (right.estimatedValue || 0) - (left.estimatedValue || 0))
        .slice(0, 8)
        .map((item) => ({
        itemId: item.itemId,
        name: item.name,
        roomLabel: item.roomLabel,
        categoryLabel: item.categoryLabel,
        estimatedValue: item.estimatedValue,
        missingFields: lookupProvLyMissingFields(item, latestCheck),
    }));
    return {
        kind: "product-panel",
        version: "stage-5",
        generatedAt: nowIso(),
        tenantId,
        filters: query,
        product: "provly",
        title: "ProvLy",
        summary: {
            title: "Claim readiness",
            description: "Organize inventory, receipts, and documentation into export-ready claim packets with completeness tracking.",
            primaryMetric: {
                label: "Completeness score",
                value: latestCheck?.score ?? 0,
                tone: latestCheck?.claimReady ? "success" : latestCheck && latestCheck.score >= 70 ? "accent" : "warning",
            },
            secondaryMetrics: [
                { label: "Claim-ready exports", value: readyExportCount, tone: "success" },
                { label: "Inventory items", value: items.length, tone: "neutral" },
                { label: "High-value items", value: items.filter((item) => item.highValue).length, tone: "accent" },
                { label: "Reminders", value: latestCheck?.reminders.length || 0, tone: "warning" },
            ],
        },
        recentJobs: mapJobsForList(productJobs, productMemory).slice(0, 8),
        alerts: buildProvLyAlerts({
            latestCheck,
            readyExportCount,
            items,
        }),
        recentMemory: mapMemoryItems(productMemory).slice(0, 6),
        inventorySummary: {
            itemCount: items.length,
            roomCount: rooms.length,
            categoryCount: categories.length,
            attachmentCount: attachments.length,
            receiptCount: receipts.length,
            highValueItemCount: items.filter((item) => item.highValue).length,
            totalEstimatedValue: sumEstimatedValue(items),
        },
        claimSummary: {
            completenessScore: latestCheck?.score ?? 0,
            claimReady: Boolean(latestCheck?.claimReady || readyExportCount > 0),
            exportCount: exports.length,
            readyExportCount,
            missingFieldCount: latestCheck?.missingFields.length || 0,
            reminderCount: latestCheck?.reminders.length || 0,
        },
        rooms: [...rooms]
            .sort((left, right) => right.updatedAt.localeCompare(left.updatedAt))
            .slice(0, 10)
            .map((room) => ({
            roomId: room.roomId,
            roomLabel: room.label,
            itemCount: room.itemCount,
            highValueCount: room.highValueCount,
            completenessScore: room.completenessScore,
            estimatedValue: room.estimatedValue,
        })),
        categories: [...categories]
            .sort((left, right) => right.updatedAt.localeCompare(left.updatedAt))
            .slice(0, 10)
            .map((category) => ({
            categoryId: category.categoryId,
            categoryLabel: category.label,
            itemCount: category.itemCount,
            highValueCount: category.highValueCount,
            completenessScore: category.completenessScore,
            estimatedValue: category.estimatedValue,
        })),
        latestExports: [...exports]
            .sort((left, right) => right.updatedAt.localeCompare(left.updatedAt))
            .slice(0, 6)
            .map((exportRecord) => ({
            exportId: exportRecord.exportId,
            title: exportRecord.title,
            status: exportRecord.status,
            format: exportRecord.format,
            completenessScore: exportRecord.completenessScore,
            missingFieldCount: exportRecord.missingFieldCount,
        })),
        latestReports: [...reports]
            .sort((left, right) => right.updatedAt.localeCompare(left.updatedAt))
            .slice(0, 6)
            .map((report) => ({
            reportId: report.reportId,
            title: report.title,
            summary: report.summary,
            createdAt: report.createdAt,
            updatedAt: report.updatedAt,
        })),
        latestReport,
        highValueItems,
        reminders: [...new Set([...(latestCheck?.reminders || []), ...collectProvLyReminders(items, latestCheck)])],
        userPreferences: preferences,
    };
}
function buildProvLyAlerts(input) {
    const alerts = [];
    if (input.latestCheck && !input.latestCheck.claimReady) {
        alerts.push({
            id: `provly-alert-${alerts.length + 1}`,
            level: input.latestCheck.score < 60 ? "critical" : "warning",
            title: "Documentation incomplete",
            message: `${input.latestCheck.missingFields.length} required field${input.latestCheck.missingFields.length === 1 ? "" : "s"} still need attention before export.`,
            createdAt: nowIso(),
            relatedProduct: "provly",
            actionLabel: "Review completeness",
            actionHref: "/dashboard/panels/provly",
            metadata: { missingFields: input.latestCheck.missingFields },
        });
    }
    if (input.readyExportCount > 0) {
        alerts.push({
            id: `provly-alert-${alerts.length + 1}`,
            level: "success",
            title: "Claim-ready exports available",
            message: `${input.readyExportCount} export${input.readyExportCount === 1 ? "" : "s"} are ready for claim use.`,
            createdAt: nowIso(),
            relatedProduct: "provly",
            metadata: { readyExportCount: input.readyExportCount },
        });
    }
    return alerts;
}
function lookupProvLyMissingFields(item, latestCheck) {
    const fromCheck = latestCheck?.itemScores.find((score) => score.itemId === item.itemId)?.missingFields || [];
    if (fromCheck.length > 0) {
        return fromCheck;
    }
    const missingFields = [];
    if (item.receiptIds.length === 0) {
        missingFields.push("receipt");
    }
    if (item.attachmentIds.length === 0) {
        missingFields.push("attachment");
    }
    if (!item.purchaseDate) {
        missingFields.push("purchase date");
    }
    if (!item.serialNumber && item.estimatedValue && item.estimatedValue >= 1000) {
        missingFields.push("serial number");
    }
    return missingFields;
}
function collectProvLyReminders(items, latestCheck) {
    const reminders = new Set(latestCheck?.reminders || []);
    for (const item of items) {
        if (item.highValue && (item.receiptIds.length === 0 || item.attachmentIds.length === 0)) {
            reminders.add(`${item.name} still needs supporting documentation.`);
        }
    }
    return [...reminders];
}
function sumEstimatedValue(items) {
    const values = items
        .map((item) => item.estimatedValue)
        .filter((value) => typeof value === "number" && Number.isFinite(value));
    if (values.length === 0) {
        return undefined;
    }
    return values.reduce((total, value) => total + value, 0);
}
async function buildNeuroMovesPanel(stores, query) {
    const tenantId = query.tenantId || "default";
    const [jobs, memory] = await Promise.all([stores.jobs.list(), stores.memory.list()]);
    const productJobs = filterJobs(jobs, { ...query, product: "neurormoves" });
    const productMemory = filterMemory(memory, { ...query, product: "neurormoves" });
    const completedJobs = productJobs.filter((job) => job.status === "completed").length;
    const pendingApprovals = productJobs.filter((job) => job.status === "waiting_approval" || job.approvalStatus === "pending").length;
    const scheduledCheckIns = buildRecurringJobsForProduct(productJobs, "neurormoves").length;
    const sentSummaries = productJobs.filter((job) => job.status === "completed" && Boolean(job.result?.summary)).length;
    return {
        kind: "product-panel",
        version: "stage-5",
        generatedAt: nowIso(),
        tenantId,
        filters: query,
        product: "neurormoves",
        title: "NeuroMoves",
        summary: {
            title: "Support routines",
            description: "Track routine generation, progress summaries, and scheduled family or provider check-ins behind the scenes.",
            primaryMetric: {
                label: "Completed jobs",
                value: completedJobs,
                tone: completedJobs > 0 ? "success" : "neutral",
            },
            secondaryMetrics: [
                { label: "Active jobs", value: productJobs.filter((job) => ACTIVE_JOB_STATUSES.includes(job.status)).length, tone: "accent" },
                { label: "Scheduled check-ins", value: scheduledCheckIns, tone: "neutral" },
                { label: "Pending approvals", value: pendingApprovals, tone: "warning" },
                { label: "Sent summaries", value: sentSummaries, tone: "success" },
            ],
        },
        recentJobs: mapJobsForList(productJobs, productMemory).slice(0, 8),
        alerts: buildNeuroMovesAlerts({
            productJobs,
            pendingApprovals,
            scheduledCheckIns,
        }),
        recentMemory: mapMemoryItems(productMemory).slice(0, 6),
        routineSummary: {
            activeJobs: productJobs.filter((job) => ACTIVE_JOB_STATUSES.includes(job.status)).length,
            completedJobs,
            scheduledCheckIns,
            pendingApprovals,
            sentSummaries,
        },
        routinePatterns: mapMemoryItems(productMemory)
            .filter((entry) => entry.editable || isPatternCategory(entry.category))
            .slice(0, 8)
            .map((entry) => ({
            memoryId: entry.id,
            key: entry.key,
            confidence: entry.confidence,
            updatedAt: entry.updatedAt,
            editable: entry.editable,
        })),
        recentCheckIns: buildRecurringJobsForProduct(productJobs, "neurormoves"),
        recentSummaries: productJobs
            .filter((job) => job.status === "completed")
            .sort(compareJobsByRecentUpdate)
            .slice(0, 8)
            .map((job) => ({
            jobId: job.jobId,
            title: job.goal.goal,
            summary: job.result?.summary || "Completed workflow",
            updatedAt: job.updatedAt,
        })),
    };
}
function buildNeuroMovesAlerts(input) {
    const alerts = [];
    if (input.pendingApprovals > 0) {
        alerts.push({
            id: `neurormoves-alert-${alerts.length + 1}`,
            level: "warning",
            title: "Routine approval pending",
            message: `${input.pendingApprovals} NeuroMoves routine step${input.pendingApprovals === 1 ? "" : "s"} require approval.`,
            createdAt: nowIso(),
            relatedProduct: "neurormoves",
            metadata: { pendingApprovals: input.pendingApprovals },
        });
    }
    if (input.productJobs.some((job) => job.status === "failed")) {
        alerts.push({
            id: `neurormoves-alert-${alerts.length + 1}`,
            level: "critical",
            title: "Routine workflow failure",
            message: "At least one NeuroMoves routine run failed and should be reviewed.",
            createdAt: nowIso(),
            relatedProduct: "neurormoves",
            actionLabel: "Inspect jobs",
            actionHref: "/dashboard/jobs?product=neurormoves&status=failed",
            metadata: {},
        });
    }
    if (input.scheduledCheckIns === 0) {
        alerts.push({
            id: `neurormoves-alert-${alerts.length + 1}`,
            level: "info",
            title: "No scheduled check-ins detected",
            message: "NeuroMoves has no inferred check-ins yet. Add a routine or intake a support job.",
            createdAt: nowIso(),
            relatedProduct: "neurormoves",
            metadata: {},
        });
    }
    return alerts;
}
async function buildDashboardSettings(stores, config, query, orchestrator) {
    const tenantId = query.tenantId || "default";
    const memory = filterMemory(await stores.memory.list(), { ...query, tenantId });
    const memoryItems = mapMemoryItems(memory);
    const auditTrail = buildMemoryAuditTrail(memory).slice(0, 12);
    const communicationTemplates = buildSettingsCommunicationTemplates(memory);
    const tenantRules = buildTenantRules(tenantId, config, communicationTemplates);
    const suppressionRules = buildSettingsSuppressionRules(memory);
    const approvalPolicy = buildApprovalPolicy(config.approvalThreshold);
    const orchestrationHistory = buildSettingsOrchestrationHistory(orchestrator, query);
    return {
        kind: "settings",
        version: "stage-5",
        generatedAt: nowIso(),
        tenantId,
        filters: { ...query, tenantId },
        runtime: buildSettingsRuntimeSummary(config),
        approvalPolicy,
        summary: buildSettingsSummary(tenantRules, communicationTemplates, suppressionRules, memory, auditTrail),
        orchestrationHistory,
        tenantRules,
        communicationTemplates,
        suppressionRules,
        memoryPatterns: memoryItems.filter((entry) => isPatternCategory(entry.category)).slice(0, 16),
        auditTrail,
    };
}
function buildSettingsRuntimeSummary(config) {
    return {
        serviceName: config.serviceName,
        providerMode: config.providerMode,
        executionMode: config.executionMode,
        port: config.port,
        dataDir: config.dataDir,
        databaseProvider: config.database?.provider || "file",
        browserProvider: config.browser?.provider || "mock",
        smsProvider: config.sms?.provider || (config.twilio?.accountSid && config.twilio?.authToken ? "twilio" : "mock"),
        emailProvider: config.email?.webhookUrl ? "webhook" : "mock",
        ocrProvider: config.ocr?.provider || "mock",
        redisEnabled: Boolean(config.redis?.url),
        maxRetries: config.maxRetries,
    };
}
function buildSettingsSummary(tenantRules, communicationTemplates, suppressionRules, memory, auditTrail) {
    return {
        tenantRuleCount: tenantRules.length,
        communicationTemplateCount: communicationTemplates.length,
        suppressionRuleCount: suppressionRules.length,
        editableMemoryCount: memory.filter((entry) => entry.editable).length,
        recentAuditEntries: auditTrail.length,
    };
}
const STAGE2_PHASE_ORDER = [
    "supervision",
    "routing",
    "planning",
    "research",
    "execution",
    "communication",
    "verification",
    "memory",
    "reporting",
];
const STAGE2_AGENT_ORDER = [
    "supervisor-agent",
    "router-agent",
    "planner-agent",
    "research-agent",
    "execution-agent",
    "communication-agent",
    "verification-agent",
    "memory-agent",
    "reporting-agent",
];
function buildSettingsOrchestrationHistory(orchestrator, query) {
    const history = orchestrator?.history() ?? [];
    const filtered = history.filter((record) => {
        if (query.tenantId && record.tenantId !== query.tenantId) {
            return false;
        }
        if (query.jobId && record.jobId !== query.jobId) {
            return false;
        }
        if (query.product && record.product !== query.product) {
            return false;
        }
        if (query.workflow && record.workflow !== query.workflow) {
            return false;
        }
        return true;
    });
    const sorted = [...filtered].sort((left, right) => Date.parse(right.startedAt) - Date.parse(left.startedAt));
    return {
        summary: summarizeOrchestrationHistory(sorted),
        recent: sorted.slice(0, 25).map(mapSettingsOrchestrationHistoryItem),
    };
}
function summarizeOrchestrationHistory(history) {
    const byPhase = createPhaseCountMap();
    const byAgent = createAgentCountMap();
    let completed = 0;
    let failed = 0;
    let approvalGated = 0;
    let externalCapable = 0;
    const jobs = new Set();
    for (const record of history) {
        byPhase[record.phase] += 1;
        byAgent[record.agentId] += 1;
        if (record.status === "completed") {
            completed += 1;
        }
        else {
            failed += 1;
        }
        if (record.selection.requiresApprovalForExternalActions) {
            approvalGated += 1;
        }
        if (record.selection.mayUseExternalTools) {
            externalCapable += 1;
        }
        if (record.jobId) {
            jobs.add(record.jobId);
        }
    }
    return {
        total: history.length,
        completed,
        failed,
        approvalGated,
        externalCapable,
        uniqueJobs: jobs.size,
        byPhase,
        byAgent,
    };
}
function createPhaseCountMap() {
    return STAGE2_PHASE_ORDER.reduce((accumulator, phase) => {
        accumulator[phase] = 0;
        return accumulator;
    }, {});
}
function createAgentCountMap() {
    return STAGE2_AGENT_ORDER.reduce((accumulator, agentId) => {
        accumulator[agentId] = 0;
        return accumulator;
    }, {});
}
function mapSettingsOrchestrationHistoryItem(record) {
    return {
        invocationId: record.invocationId,
        phase: record.phase,
        agentId: record.agentId,
        agentTitle: record.agentTitle,
        selection: {
            phase: record.selection.phase,
            agentId: record.selection.agentId,
            agentTitle: record.selection.agentTitle,
            capability: record.selection.capability,
            permissionScope: record.selection.permissionScope,
            mayUseExternalTools: record.selection.mayUseExternalTools,
            requiresApprovalForExternalActions: record.selection.requiresApprovalForExternalActions,
            reason: record.selection.reason,
        },
        status: record.status,
        startedAt: record.startedAt,
        completedAt: record.completedAt,
        durationMs: record.durationMs,
        jobId: record.jobId,
        tenantId: record.tenantId,
        product: record.product,
        workflow: record.workflow,
        stepId: record.stepId,
        stepType: record.stepType,
        summary: record.summary,
        error: record.error,
    };
}
function buildTenantRules(tenantId, config, communicationTemplates) {
    const approvalMode = config.executionMode === "queued" ? "assist" : "autonomous";
    return PRODUCT_ORDER.map((product) => {
        const productTemplates = communicationTemplates
            .filter((template) => template.product === product)
            .reduce((accumulator, template) => {
            accumulator[template.key] = template.body;
            return accumulator;
        }, {});
        return {
            tenantId,
            product,
            approvalMode,
            doNotContactWindowHours: product === "lead-recovery" ? 48 : 0,
            defaultTone: product === "neurormoves" ? "warm" : "business-safe",
            messageTemplates: productTemplates,
            businessHours: product === "lead-recovery"
                ? {
                    open: "09:00",
                    close: "17:00",
                    days: ["mon", "tue", "wed", "thu", "fri"],
                }
                : undefined,
            updatedAt: nowIso(),
            metadata: {
                source: "dashboard-settings",
                executionMode: config.executionMode,
                providerMode: config.providerMode,
            },
        };
    });
}
function buildSettingsCommunicationTemplates(memory) {
    const leadRecoveryTemplates = extractLeadRecoveryTemplates(memory).map((template) => ({
        key: `lead-recovery:${template.scenario}`,
        title: template.title,
        body: template.body,
        tone: template.tone,
        product: "lead-recovery",
        editable: template.editable,
        source: template.sourceJobId ? "memory" : "runtime",
        updatedAt: template.updatedAt || nowIso(),
    }));
    const genericTemplates = mapMemoryItems(memory)
        .filter((entry) => ["message-template", "workflow-template", "communication-tone"].includes(entry.category))
        .map((entry) => {
        const value = typeof entry.value === "object" && entry.value ? entry.value : undefined;
        const product = entry.product;
        const key = `${product}:${entry.key}`;
        const tone = normalizeSettingsTone(value?.tone || (typeof value?.body === "string" ? value.body : undefined));
        return {
            key,
            title: value?.title && typeof value.title === "string" ? value.title : entry.key,
            body: typeof value?.body === "string" ? value.body : summarizeValue(entry.value),
            tone,
            product,
            editable: entry.editable,
            source: entry.sourceJobId ? "memory" : "runtime",
            updatedAt: entry.updatedAt,
        };
    });
    return dedupeTemplates([...leadRecoveryTemplates, ...genericTemplates]);
}
function buildSettingsSuppressionRules(memory) {
    const defaultRules = [
        {
            key: "lead-recovery:48h-suppression",
            title: "48-hour follow-up suppression",
            description: "Do not contact a lead again within 48 hours of the last outbound message.",
            product: "lead-recovery",
            enabled: true,
            source: "runtime",
            windowHours: 48,
        },
        {
            key: "lead-recovery:opt-out",
            title: "Opt-out and STOP handling",
            description: "Respect opt-out and STOP requests before any outbound communication is sent.",
            product: "lead-recovery",
            enabled: true,
            source: "runtime",
        },
        {
            key: "lead-recovery:business-hours",
            title: "Business-hours gating",
            description: "Hold risky or uncertain lead follow-ups outside configured business hours.",
            product: "lead-recovery",
            enabled: true,
            source: "runtime",
        },
    ];
    const memoryRules = mapMemoryItems(memory)
        .filter((entry) => /suppression|opt[- ]?out|stop|do not contact|dnc/i.test(entry.key))
        .map((entry) => ({
        key: `${entry.product}:${entry.key}`,
        title: entry.key,
        description: entry.summary,
        product: entry.product,
        enabled: true,
        source: "memory",
        windowHours: extractWindowHours(entry),
    }));
    return dedupeSuppressionRules([...defaultRules, ...memoryRules]);
}
function dedupeTemplates(templates) {
    const seen = new Set();
    const deduped = [];
    for (const template of templates) {
        if (seen.has(template.key)) {
            continue;
        }
        seen.add(template.key);
        deduped.push(template);
    }
    return deduped;
}
function dedupeSuppressionRules(rules) {
    const seen = new Set();
    const deduped = [];
    for (const rule of rules) {
        if (seen.has(rule.key)) {
            continue;
        }
        seen.add(rule.key);
        deduped.push(rule);
    }
    return deduped;
}
function normalizeSettingsTone(value) {
    if (value === "warm" || value === "urgent") {
        return value;
    }
    return "business-safe";
}
function extractWindowHours(entry) {
    const value = typeof entry.value === "object" && entry.value ? entry.value : undefined;
    const numberValue = value && typeof value.windowHours === "number" ? value.windowHours : undefined;
    if (numberValue !== undefined && Number.isFinite(numberValue)) {
        return numberValue;
    }
    if (/48/i.test(entry.key) || /48/i.test(entry.summary)) {
        return 48;
    }
    return undefined;
}
//# sourceMappingURL=service.js.map