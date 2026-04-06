export async function executeAdapterToolStep(step, context) {
    const instruction = parseInstruction(step);
    if (!instruction) {
        return undefined;
    }
    const tools = context.tools;
    const result = await dispatchInstruction(instruction, tools, context);
    if (!result) {
        return {
            status: "failed",
            message: `Unsupported adapter step ${instruction.tool}.${instruction.action}.`,
            retryable: false,
        };
    }
    return {
        status: result.status,
        message: result.summary,
        output: result.output,
        retryable: result.retryable,
    };
}
function parseInstruction(step) {
    const payload = step.input;
    if (!payload || typeof payload !== "object") {
        return undefined;
    }
    const tool = typeof payload.tool === "string" ? payload.tool : step.tool;
    const action = normalizeAction(tool, readAction(payload));
    if (!tool || !action) {
        return undefined;
    }
    const request = extractRequest(payload);
    return {
        tool: tool,
        action,
        request,
        metadata: isRecord(payload.metadata) ? payload.metadata : undefined,
    };
}
async function dispatchInstruction(instruction, tools, context) {
    switch (instruction.tool) {
        case "browser":
            return handleBrowserInstruction(instruction, tools);
        case "sms":
            return handleSmsInstruction(instruction, tools, context);
        case "email":
            return handleEmailInstruction(instruction, tools);
        case "database":
            return handleDatabaseInstruction(instruction, tools);
        case "api":
            return handleApiInstruction(instruction, tools);
        case "scraping":
            return handleScrapingInstruction(instruction, tools);
        case "scheduler":
            return handleSchedulerInstruction(instruction, tools);
        case "redis":
            return handleRedisInstruction(instruction, tools);
        case "ocr":
            return handleOcrInstruction(instruction, tools, context);
        default:
            return undefined;
    }
}
async function handleBrowserInstruction(instruction, tools) {
    const browser = tools.browser;
    if (!browser) {
        return unsupported("browser", instruction.action);
    }
    if (instruction.action === "close") {
        await browser.close();
        return success("browser", instruction.action, "Browser adapter closed.", { closed: true });
    }
    const url = readString(instruction.request, "url", "href");
    if (!url) {
        return failure("browser", instruction.action, "Browser step requires a url.", false);
    }
    if (instruction.action === "visit") {
        const result = await browser.visit({
            url,
            waitForMs: readNumber(instruction.request, "waitForMs"),
            headers: readRecord(instruction.request, "headers"),
        });
        return success("browser", instruction.action, `Visited ${result.url}.`, result);
    }
    if (instruction.action === "extract") {
        const result = await browser.extract({
            url,
            selector: readString(instruction.request, "selector"),
            headers: readRecord(instruction.request, "headers"),
        });
        return success("browser", instruction.action, `Extracted ${result.url}.`, result);
    }
    return unsupported("browser", instruction.action);
}
async function handleSmsInstruction(instruction, tools, context) {
    const sms = tools.sms;
    if (!sms) {
        return unsupported("sms", instruction.action);
    }
    if (instruction.action === "verify") {
        const messageId = readString(instruction.request, "messageId");
        if (!messageId) {
            return failure("sms", instruction.action, "SMS verification requires messageId.", false);
        }
        const result = await sms.verify(messageId);
        return success("sms", instruction.action, `SMS verification status: ${result.status}.`, result);
    }
    if (instruction.action === "send") {
        const to = readString(instruction.request, "to");
        const body = readString(instruction.request, "body");
        if (!to || !body) {
            return failure("sms", instruction.action, "SMS send requires to and body.", false);
        }
        const result = await sms.send({
            to,
            body,
            from: readString(instruction.request, "from") || "",
            tenantId: context.job.tenantId,
            provider: context.config.twilio?.accountSid && context.config.twilio?.authToken ? "twilio" : "mock",
            messageId: readString(instruction.request, "messageId"),
            status: readString(instruction.request, "status"),
            error: readString(instruction.request, "error"),
            sentAt: readString(instruction.request, "sentAt"),
            statusCallbackUrl: readString(instruction.request, "statusCallbackUrl"),
        });
        if (result.status === "failed") {
            return failure("sms", instruction.action, result.detail || "SMS send failed.", isRetryableSmsFailure(result.detail));
        }
        return success("sms", instruction.action, `SMS send status: ${result.status}.`, result);
    }
    return unsupported("sms", instruction.action);
}
async function handleEmailInstruction(instruction, tools) {
    const email = tools.email;
    if (!email) {
        return unsupported("email", instruction.action);
    }
    if (instruction.action === "send") {
        const to = readString(instruction.request, "to");
        const subject = readString(instruction.request, "subject");
        const text = readString(instruction.request, "text");
        if (!to || !subject || !text) {
            return failure("email", instruction.action, "Email send requires to, subject, and text.", false);
        }
        const result = await email.send({
            to,
            subject,
            text,
            html: readString(instruction.request, "html"),
            meta: readRecord(instruction.request, "meta"),
        });
        if (result.status === "failed") {
            return failure("email", instruction.action, result.detail || "Email send failed.", isRetryableEmailFailure(result.detail));
        }
        return success("email", instruction.action, `Email send status: ${result.status}.`, result);
    }
    return unsupported("email", instruction.action);
}
async function handleDatabaseInstruction(instruction, tools) {
    const database = tools.database;
    if (!database) {
        return unsupported("database", instruction.action);
    }
    const sql = readString(instruction.request, "sql");
    const params = readArray(instruction.request, "params");
    if (instruction.action === "query") {
        if (!sql) {
            return failure("database", instruction.action, "Database query requires sql.", false);
        }
        const result = await database.query({ sql, params });
        return success("database", instruction.action, `Database query returned ${result.rowCount} row(s).`, result);
    }
    if (instruction.action === "execute") {
        if (!sql) {
            return failure("database", instruction.action, "Database execute requires sql.", false);
        }
        const result = await database.execute({ sql, params });
        return success("database", instruction.action, `Database execute affected ${result.rowCount} row(s).`, result);
    }
    if (instruction.action === "close") {
        await database.close();
        return success("database", instruction.action, "Database adapter closed.", { closed: true });
    }
    return unsupported("database", instruction.action);
}
async function handleApiInstruction(instruction, tools) {
    const api = tools.api;
    if (!api) {
        return unsupported("api", instruction.action);
    }
    if (instruction.action === "request") {
        const url = readString(instruction.request, "url");
        if (!url) {
            return failure("api", instruction.action, "HTTP request requires url.", false);
        }
        const result = await api.request({
            url,
            method: readMethod(readString(instruction.request, "method")),
            headers: readRecord(instruction.request, "headers"),
            body: readValue(instruction.request, "body"),
        });
        if (!result.ok) {
            return failure("api", instruction.action, `HTTP ${result.status} for ${url}.`, result.status >= 500);
        }
        return success("api", instruction.action, `HTTP ${result.status} for ${url}.`, result);
    }
    if (instruction.action === "getJson") {
        const url = readString(instruction.request, "url");
        if (!url) {
            return failure("api", instruction.action, "HTTP GET requires url.", false);
        }
        const result = await api.getJson(url, readRecord(instruction.request, "headers"));
        if (!result.ok) {
            return failure("api", instruction.action, `HTTP ${result.status} for ${url}.`, result.status >= 500);
        }
        return success("api", instruction.action, `HTTP ${result.status} for ${url}.`, result);
    }
    if (instruction.action === "postJson") {
        const url = readString(instruction.request, "url");
        if (!url) {
            return failure("api", instruction.action, "HTTP POST requires url.", false);
        }
        const result = await api.postJson(url, readValue(instruction.request, "body"), readRecord(instruction.request, "headers"));
        if (!result.ok) {
            return failure("api", instruction.action, `HTTP ${result.status} for ${url}.`, result.status >= 500);
        }
        return success("api", instruction.action, `HTTP ${result.status} for ${url}.`, result);
    }
    return unsupported("api", instruction.action);
}
async function handleScrapingInstruction(instruction, tools) {
    const scraping = tools.scraping;
    if (!scraping) {
        return unsupported("scraping", instruction.action);
    }
    if (instruction.action === "scrape") {
        const url = readString(instruction.request, "url");
        if (!url) {
            return failure("scraping", instruction.action, "Scrape requires url.", false);
        }
        const result = await scraping.scrape({ url, headers: readRecord(instruction.request, "headers") });
        return success("scraping", instruction.action, `Scraped ${result.url}.`, result);
    }
    return unsupported("scraping", instruction.action);
}
async function handleSchedulerInstruction(instruction, tools) {
    const scheduler = tools.scheduler;
    if (!scheduler) {
        return unsupported("scheduler", instruction.action);
    }
    if (instruction.action === "schedule") {
        const runAt = readString(instruction.request, "runAt");
        if (!runAt) {
            return failure("scheduler", instruction.action, "Schedule requires runAt.", false);
        }
        const result = await scheduler.schedule({
            id: readString(instruction.request, "id"),
            runAt,
            detail: readString(instruction.request, "detail"),
            task: async () => undefined,
        });
        return success("scheduler", instruction.action, `Scheduled ${result.id} for ${result.runAt}.`, result);
    }
    if (instruction.action === "list") {
        const result = await scheduler.list();
        return success("scheduler", instruction.action, `Loaded ${result.length} scheduled task(s).`, result);
    }
    if (instruction.action === "cancel") {
        const id = readString(instruction.request, "id");
        if (!id) {
            return failure("scheduler", instruction.action, "Cancel requires id.", false);
        }
        await scheduler.cancel(id);
        return success("scheduler", instruction.action, `Cancelled ${id}.`, { cancelled: true, id });
    }
    return unsupported("scheduler", instruction.action);
}
async function handleRedisInstruction(instruction, tools) {
    const redis = tools.redis;
    if (!redis) {
        return unsupported("redis", instruction.action);
    }
    if (instruction.action === "ping") {
        const result = await redis.ping();
        return success("redis", instruction.action, `Redis ping ${result ? "succeeded" : "failed"}.`, result);
    }
    if (instruction.action === "get") {
        const key = readString(instruction.request, "key");
        if (!key) {
            return failure("redis", instruction.action, "Redis get requires key.", false);
        }
        const result = await redis.get(key);
        return success("redis", instruction.action, result === undefined ? `Redis key ${key} not found.` : `Redis key ${key} loaded.`, result);
    }
    if (instruction.action === "set") {
        const key = readString(instruction.request, "key");
        const value = readString(instruction.request, "value");
        if (!key || value === undefined) {
            return failure("redis", instruction.action, "Redis set requires key and value.", false);
        }
        await redis.set(key, value);
        return success("redis", instruction.action, `Redis key ${key} updated.`, { key, value });
    }
    if (instruction.action === "del") {
        const key = readString(instruction.request, "key");
        if (!key) {
            return failure("redis", instruction.action, "Redis del requires key.", false);
        }
        const result = await redis.del(key);
        return success("redis", instruction.action, `Redis key ${key} deleted (${result}).`, result);
    }
    if (instruction.action === "close") {
        await redis.close();
        return success("redis", instruction.action, "Redis adapter closed.", { closed: true });
    }
    return unsupported("redis", instruction.action);
}
async function handleOcrInstruction(instruction, tools, context) {
    const ocr = tools.ocr;
    if (!ocr) {
        return unsupported("ocr", instruction.action);
    }
    if (instruction.action === "extract") {
        const items = readArrayOfRecords(instruction.request, "items");
        if (items.length === 0) {
            return failure("ocr", instruction.action, "OCR extract requires items.", false);
        }
        const result = await ocr.extract({
            items: items.map((item, index) => ({
                id: readString(item, "id") || `item_${index + 1}`,
                url: readString(item, "url"),
                dataUrl: readString(item, "dataUrl"),
                mimeType: readString(item, "mimeType"),
                filename: readString(item, "filename"),
                label: readString(item, "label"),
                text: readString(item, "text"),
                metadata: readRecord(item, "metadata"),
            })),
            prompt: readString(instruction.request, "prompt"),
            tenantId: context.job.tenantId,
            jobId: context.job.jobId,
        });
        return success("ocr", instruction.action, `OCR extracted ${result.items.length} item(s).`, result);
    }
    if (instruction.action === "close") {
        await ocr.close();
        return success("ocr", instruction.action, "OCR adapter closed.", { closed: true });
    }
    return unsupported("ocr", instruction.action);
}
function readAction(request) {
    return readString(request, "action", "operation", "method");
}
function normalizeAction(tool, action) {
    if (!action) {
        return undefined;
    }
    const normalized = action.trim();
    if (!normalized) {
        return undefined;
    }
    if (tool === "api") {
        const upper = normalized.toUpperCase();
        if (upper === "GET") {
            return "getJson";
        }
        if (upper === "POST") {
            return "postJson";
        }
        if (upper === "PUT" || upper === "PATCH" || upper === "DELETE") {
            return "request";
        }
    }
    return normalized;
}
function extractRequest(request) {
    const payload = request.request;
    if (isRecord(payload)) {
        return payload;
    }
    const body = request.body;
    if (isRecord(body)) {
        return body;
    }
    const input = request.input;
    if (isRecord(input)) {
        return input;
    }
    return request;
}
function success(tool, action, summary, output, retryable = false) {
    return {
        tool,
        action,
        status: "completed",
        summary,
        output,
        retryable,
    };
}
function failure(tool, action, summary, retryable) {
    return {
        tool,
        action,
        status: "failed",
        summary,
        retryable,
    };
}
function unsupported(tool, action) {
    return {
        tool,
        action,
        status: "failed",
        summary: `Unsupported adapter action ${tool}.${action}.`,
        retryable: false,
    };
}
function isRetryableSmsFailure(detail) {
    if (!detail) {
        return true;
    }
    const lower = detail.toLowerCase();
    return !lower.includes("no sms from number is configured") && !lower.includes("invalid") && !lower.includes("blocked");
}
function isRetryableEmailFailure(detail) {
    if (!detail) {
        return true;
    }
    const lower = detail.toLowerCase();
    return lower.includes("5") || lower.includes("timeout") || lower.includes("network");
}
function readString(source, ...keys) {
    if (!source) {
        return undefined;
    }
    for (const key of keys) {
        const value = source[key];
        if (typeof value === "string" && value.trim()) {
            return value.trim();
        }
    }
    return undefined;
}
function readNumber(source, key) {
    if (!source) {
        return undefined;
    }
    const value = source[key];
    return typeof value === "number" && Number.isFinite(value) ? value : undefined;
}
function readMethod(value) {
    if (!value) {
        return undefined;
    }
    const upper = value.toUpperCase();
    return upper === "GET" || upper === "POST" || upper === "PUT" || upper === "PATCH" || upper === "DELETE"
        ? upper
        : undefined;
}
function readRecord(source, key) {
    if (!source) {
        return undefined;
    }
    const value = source[key];
    if (!isRecord(value)) {
        return undefined;
    }
    const result = {};
    for (const [entryKey, entryValue] of Object.entries(value)) {
        if (typeof entryValue === "string") {
            result[entryKey] = entryValue;
        }
    }
    return Object.keys(result).length ? result : undefined;
}
function readValue(source, key) {
    return source ? source[key] : undefined;
}
function readArray(source, key) {
    if (!source) {
        return undefined;
    }
    const value = source[key];
    return Array.isArray(value) ? value : undefined;
}
function readArrayOfRecords(source, key) {
    const value = readArray(source, key);
    if (!value) {
        return [];
    }
    return value.filter(isRecord);
}
function isRecord(value) {
    return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}
//# sourceMappingURL=tool-path.js.map