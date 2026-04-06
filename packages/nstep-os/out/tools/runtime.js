import { createNoopLogger } from "../core/logger.js";
import { defineStage3Descriptor, defineStage3Permission, } from "../core/stage3-models.js";
import { createStage3ToolPolicy, createToolInvocationId, createDefaultToolScope, evaluateStage3ToolAccess, shouldRetryToolError, ToolPermissionError, } from "./policy.js";
const BROWSER_PERMISSION = defineStage3Permission("browser", ["visit", "extract", "close"], "May browse and extract content from external pages.", {
    allowExternalActions: true,
    requiresApprovalForExternalActions: true,
    permittedAgents: ["research-agent", "execution-agent", "reporting-agent"],
});
const SMS_PERMISSION = defineStage3Permission("sms", ["send", "verify"], "May send or verify SMS delivery through the messaging adapter.", {
    allowExternalActions: true,
    requiresApprovalForExternalActions: true,
    permittedAgents: ["communication-agent", "execution-agent"],
});
const EMAIL_PERMISSION = defineStage3Permission("email", ["send"], "May send outbound email through the messaging adapter.", {
    allowExternalActions: true,
    requiresApprovalForExternalActions: true,
    permittedAgents: ["communication-agent", "execution-agent", "reporting-agent"],
});
const DATABASE_PERMISSION = defineStage3Permission("database", ["query", "execute", "close"], "May query or mutate data through the database adapter.", {
    allowExternalActions: false,
    requiresApprovalForExternalActions: false,
    permittedAgents: [],
});
const API_PERMISSION = defineStage3Permission("api", ["request", "getJson", "postJson"], "May call generic HTTP APIs through the adapter.", {
    allowExternalActions: true,
    requiresApprovalForExternalActions: true,
    permittedAgents: ["research-agent", "execution-agent", "reporting-agent"],
});
const SCRAPING_PERMISSION = defineStage3Permission("scraping", ["scrape"], "May scrape web content for research or monitoring workflows.", {
    allowExternalActions: true,
    requiresApprovalForExternalActions: true,
    permittedAgents: ["research-agent", "execution-agent"],
});
const SCHEDULER_PERMISSION = defineStage3Permission("scheduler", ["schedule", "list", "cancel"], "May schedule or cancel delayed jobs and reminders.", {
    allowExternalActions: false,
    requiresApprovalForExternalActions: false,
    permittedAgents: ["execution-agent", "memory-agent", "reporting-agent"],
});
const REDIS_PERMISSION = defineStage3Permission("redis", ["ping", "get", "set", "del", "close"], "May access the ephemeral Redis adapter for queueing and cache state.", {
    allowExternalActions: false,
    requiresApprovalForExternalActions: false,
    permittedAgents: ["execution-agent", "memory-agent", "reporting-agent"],
});
const OCR_PERMISSION = defineStage3Permission("ocr", ["extract", "close"], "May extract text from uploaded receipts and inventory photos.", {
    allowExternalActions: true,
    requiresApprovalForExternalActions: true,
    permittedAgents: ["research-agent", "execution-agent", "reporting-agent"],
});
export function createStage3ToolRuntime(inputs, scope = {}, sharedState = { invocations: [] }) {
    const logger = inputs.logger ?? createNoopLogger();
    const policy = createStage3ToolPolicy([
        BROWSER_PERMISSION,
        SMS_PERMISSION,
        EMAIL_PERMISSION,
        DATABASE_PERMISSION,
        API_PERMISSION,
        SCRAPING_PERMISSION,
        SCHEDULER_PERMISSION,
        REDIS_PERMISSION,
        OCR_PERMISSION,
    ], inputs.maxAttempts ?? Math.max(1, inputs.config.maxRetries + 1), true);
    const browserProvider = inputs.config.browser?.provider || "mock";
    const smsProvider = inputs.config.twilio?.accountSid && inputs.config.twilio?.authToken ? "twilio" : "mock";
    const emailProvider = inputs.config.email?.webhookUrl ? "webhook" : "mock";
    const databaseProvider = inputs.database.provider;
    const scrapingProvider = "mock";
    const schedulerProvider = inputs.config.redis?.url ? "redis" : "memory";
    const redisProvider = inputs.config.redis?.url ? "redis" : "mock";
    const ocrProvider = inputs.ocr.provider;
    const descriptors = [
        defineStage3Descriptor("browser", browserProvider, ["visit", "extract", "close"], BROWSER_PERMISSION, { canRetry: true, scoped: true }),
        defineStage3Descriptor("sms", smsProvider, ["send", "verify"], SMS_PERMISSION, { canRetry: true, scoped: true }),
        defineStage3Descriptor("email", emailProvider, ["send"], EMAIL_PERMISSION, { canRetry: true, scoped: true }),
        defineStage3Descriptor("database", databaseProvider, ["query", "execute", "close"], DATABASE_PERMISSION, { canRetry: true, scoped: true }),
        defineStage3Descriptor("api", "generic-http", ["request", "getJson", "postJson"], API_PERMISSION, { canRetry: true, scoped: true }),
        defineStage3Descriptor("scraping", scrapingProvider, ["scrape"], SCRAPING_PERMISSION, { canRetry: true, scoped: true }),
        defineStage3Descriptor("scheduler", schedulerProvider, ["schedule", "list", "cancel"], SCHEDULER_PERMISSION, { canRetry: true, scoped: true }),
        defineStage3Descriptor("redis", redisProvider, ["ping", "get", "set", "del", "close"], REDIS_PERMISSION, { canRetry: true, scoped: true }),
        defineStage3Descriptor("ocr", ocrProvider, ["extract", "close"], OCR_PERMISSION, { canRetry: true, scoped: true }),
    ];
    function recordInvocation(record) {
        sharedState.invocations.push(record);
        logger.debug(`Tool ${record.tool}.${record.action} ${record.status}.`, {
            invocationId: record.id,
            attempt: record.attempt,
            scope: sanitizeScope(record.scope),
            message: record.message,
            data: record.data,
        });
    }
    async function withRetries(tool, action, permission, operation, options = {}) {
        const gate = evaluateStage3ToolAccess(permission, scope);
        if (!gate.allowed) {
            const id = createToolInvocationId();
            recordInvocation({
                id,
                at: new Date().toISOString(),
                tool,
                action,
                attempt: 0,
                status: "blocked",
                scope,
                message: gate.reason,
                data: {
                    requiresApproval: gate.requiresApproval,
                    blockedBy: gate.blockedBy,
                },
            });
            throw new ToolPermissionError(tool, gate.reason, gate.requiresApproval);
        }
        const maxAttempts = policy.retry.maxAttempts;
        let lastError;
        for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
            const invocationId = createToolInvocationId();
            recordInvocation({
                id: invocationId,
                at: new Date().toISOString(),
                tool,
                action,
                attempt,
                status: attempt === 1 ? "started" : "retry",
                scope,
                message: attempt === 1 ? "Tool execution started." : "Tool execution retried.",
            });
            try {
                const result = await operation();
                const retryable = options.isRetryableResult?.(result) ?? false;
                const summary = options.resultSummary?.(result) || "Tool execution completed.";
                if (retryable && attempt < maxAttempts) {
                    recordInvocation({
                        id: invocationId,
                        at: new Date().toISOString(),
                        tool,
                        action,
                        attempt,
                        status: "retry",
                        scope,
                        message: summary,
                    });
                    await waitBackoff(policy.retry.backoffMs, policy.retry.jitterMs, attempt);
                    continue;
                }
                recordInvocation({
                    id: invocationId,
                    at: new Date().toISOString(),
                    tool,
                    action,
                    attempt,
                    status: retryable ? "failed" : "succeeded",
                    scope,
                    message: summary,
                });
                return result;
            }
            catch (error) {
                lastError = error;
                const retryable = (options.isRetryableError ?? shouldRetryToolError)(error);
                recordInvocation({
                    id: invocationId,
                    at: new Date().toISOString(),
                    tool,
                    action,
                    attempt,
                    status: retryable && attempt < maxAttempts ? "retry" : "failed",
                    scope,
                    message: error instanceof Error ? error.message : String(error),
                    data: {
                        retryable,
                    },
                });
                if (!retryable || attempt === maxAttempts) {
                    throw error;
                }
                await waitBackoff(policy.retry.backoffMs, policy.retry.jitterMs, attempt);
            }
        }
        throw lastError instanceof Error ? lastError : new Error(`Tool ${tool}.${action} failed.`);
    }
    const browser = {
        visit(input) {
            return withRetries("browser", "visit", BROWSER_PERMISSION, () => inputs.browser.visit(input), {
                resultSummary: (result) => `Visited ${result.url}.`,
            });
        },
        extract(input) {
            return withRetries("browser", "extract", BROWSER_PERMISSION, () => inputs.browser.extract(input), {
                resultSummary: (result) => `Extracted ${result.url}.`,
            });
        },
        close() {
            return withRetries("browser", "close", BROWSER_PERMISSION, () => inputs.browser.close(), {
                resultSummary: () => "Browser closed.",
                isRetryableError: shouldRetryToolError,
            });
        },
    };
    const sms = {
        send(message) {
            return withRetries("sms", "send", SMS_PERMISSION, () => inputs.sms.send(message), {
                isRetryableResult: (result) => result.status === "failed" && !isPermanentSmsFailure(result),
                resultSummary: (result) => `SMS send status: ${result.status}.`,
            });
        },
        verify(messageId) {
            return withRetries("sms", "verify", SMS_PERMISSION, () => inputs.sms.verify(messageId), {
                resultSummary: (result) => `SMS verification status: ${result.status}.`,
            });
        },
    };
    const email = {
        send(message) {
            return withRetries("email", "send", EMAIL_PERMISSION, () => inputs.email.send(message), {
                isRetryableResult: (result) => result.status === "failed" && !isPermanentEmailFailure(result),
                resultSummary: (result) => `Email send status: ${result.status}.`,
            });
        },
    };
    const database = {
        provider: inputs.database.provider,
        descriptor: { ...inputs.database.describe(), provider: inputs.database.provider },
        query(request) {
            return withRetries("database", "query", DATABASE_PERMISSION, () => inputs.database.query(request), {
                isRetryableError: shouldRetryToolError,
                resultSummary: (result) => `Database query returned ${result.rowCount} row(s).`,
            });
        },
        execute(request) {
            return withRetries("database", "execute", DATABASE_PERMISSION, () => inputs.database.execute(request), {
                isRetryableError: shouldRetryToolError,
                resultSummary: (result) => `Database execute affected ${result.rowCount} row(s).`,
            });
        },
        close() {
            return withRetries("database", "close", DATABASE_PERMISSION, () => inputs.database.close(), {
                resultSummary: () => "Database adapter closed.",
            });
        },
        describe() {
            return { ...inputs.database.describe(), provider: inputs.database.provider };
        },
        scope(nextScope) {
            return inputs.database.scope(mergeScope(scope, nextScope));
        },
    };
    const api = {
        request(request) {
            return withRetries("api", "request", API_PERMISSION, () => inputs.api.request(request), {
                isRetryableResult: (result) => !result.ok && result.status >= 500,
                resultSummary: (result) => `HTTP ${result.status} for ${request.url}.`,
            });
        },
        getJson(url, headers) {
            return withRetries("api", "getJson", API_PERMISSION, () => inputs.api.getJson(url, headers), {
                isRetryableResult: (result) => !result.ok && result.status >= 500,
                resultSummary: (result) => `GET ${url} returned ${result.status}.`,
            });
        },
        postJson(url, body, headers) {
            return withRetries("api", "postJson", API_PERMISSION, () => inputs.api.postJson(url, body, headers), {
                isRetryableResult: (result) => !result.ok && result.status >= 500,
                resultSummary: (result) => `POST ${url} returned ${result.status}.`,
            });
        },
    };
    const scraping = {
        scrape(input) {
            return withRetries("scraping", "scrape", SCRAPING_PERMISSION, () => inputs.scraping.scrape(input), {
                resultSummary: (result) => `Scraped ${result.url}.`,
            });
        },
    };
    const scheduler = {
        schedule(input) {
            return withRetries("scheduler", "schedule", SCHEDULER_PERMISSION, () => inputs.scheduler.schedule(input), {
                resultSummary: (result) => `Scheduled ${result.id} for ${result.runAt}.`,
            });
        },
        list() {
            return withRetries("scheduler", "list", SCHEDULER_PERMISSION, () => inputs.scheduler.list(), {
                resultSummary: (result) => `Loaded ${result.length} scheduled task(s).`,
            });
        },
        cancel(id) {
            return withRetries("scheduler", "cancel", SCHEDULER_PERMISSION, () => inputs.scheduler.cancel(id), {
                resultSummary: () => `Cancelled ${id}.`,
            });
        },
    };
    const redis = {
        provider: inputs.redis.provider,
        ping() {
            return withRetries("redis", "ping", REDIS_PERMISSION, () => inputs.redis.ping(), {
                resultSummary: (result) => `Redis ping ${result ? "succeeded" : "failed"}.`,
            });
        },
        get(key) {
            return withRetries("redis", "get", REDIS_PERMISSION, () => inputs.redis.get(key), {
                resultSummary: (result) => (result === undefined ? `Redis key ${key} not found.` : `Redis key ${key} loaded.`),
            });
        },
        set(key, value) {
            return withRetries("redis", "set", REDIS_PERMISSION, () => inputs.redis.set(key, value), {
                resultSummary: () => `Redis key ${key} updated.`,
            });
        },
        del(key) {
            return withRetries("redis", "del", REDIS_PERMISSION, () => inputs.redis.del(key), {
                resultSummary: (result) => `Redis key ${key} deleted (${result}).`,
            });
        },
        close() {
            return withRetries("redis", "close", REDIS_PERMISSION, () => inputs.redis.close(), {
                resultSummary: () => "Redis adapter closed.",
            });
        },
    };
    const ocr = {
        provider: inputs.ocr.provider,
        extract(input) {
            return withRetries("ocr", "extract", OCR_PERMISSION, () => inputs.ocr.extract(input), {
                resultSummary: (result) => `OCR extracted ${result.items.length} item(s).`,
            });
        },
        close() {
            return withRetries("ocr", "close", OCR_PERMISSION, () => inputs.ocr.close(), {
                resultSummary: () => "OCR adapter closed.",
            });
        },
    };
    function createScopedRuntime(nextScope) {
        return createStage3ToolRuntime(inputs, mergeScope(scope, nextScope), sharedState);
    }
    return {
        browser,
        sms,
        email,
        database,
        api,
        scraping,
        scheduler,
        redis,
        ocr,
        policy,
        descriptors,
        invocations: sharedState.invocations,
        scope: createScopedRuntime,
    };
}
function mergeScope(base, next) {
    return createDefaultToolScope({
        ...base,
        ...next,
    });
}
function sanitizeScope(scope) {
    if (!scope) {
        return undefined;
    }
    return {
        agentId: scope.agentId,
        jobId: scope.jobId,
        stepId: scope.stepId,
        tenantId: scope.tenantId,
        product: scope.product,
        mode: scope.mode,
        approvalStatus: scope.approvalStatus,
        riskLevel: scope.riskLevel,
        role: scope.role,
        purpose: scope.purpose,
        externalAllowed: scope.externalAllowed,
    };
}
function isPermanentSmsFailure(result) {
    const detail = (result.detail || "").toLowerCase();
    return detail.includes("no sms from number is configured");
}
function isPermanentEmailFailure(result) {
    const detail = (result.detail || "").toLowerCase();
    return detail.includes("webhook returned 400") || detail.includes("webhook returned 401") || detail.includes("webhook returned 403");
}
async function waitBackoff(baseMs, jitterMs, attempt) {
    const delay = Math.max(0, baseMs * attempt + Math.floor(Math.random() * jitterMs));
    if (delay <= 0) {
        return;
    }
    await new Promise((resolve) => setTimeout(resolve, delay));
}
//# sourceMappingURL=runtime.js.map