import path from "node:path";
export function loadRuntimeConfig(env = process.env) {
    const serviceName = env.NSTEP_OS_SERVICE_NAME?.trim() || "NStepOS";
    const port = parseNumber(env.NSTEP_OS_PORT, 3060);
    const dataDir = env.NSTEP_OS_DATA_DIR?.trim() ||
        (env.VERCEL ? path.join("/tmp", "nstep-os") : path.resolve(process.cwd(), "data", "nstep-os"));
    const providerMode = resolveProviderMode(env.NSTEP_OS_PROVIDER_MODE, env.NSTEP_OS_OPENAI_API_KEY, env.NSTEP_OS_GEMINI_API_KEY);
    const supabaseConnectionString = trimOptional(env.SUPABASE_DB_URL) || trimOptional(env.SUPABASE_DATABASE_URL);
    const databaseConnectionString = trimOptional(env.NSTEP_OS_DATABASE_URL) ||
        trimOptional(env.DATABASE_URL) ||
        supabaseConnectionString;
    const redisUrl = trimOptional(env.NSTEP_OS_REDIS_URL) || trimOptional(env.REDIS_URL);
    const ocrEndpoint = trimOptional(env.NSTEP_OS_OCR_ENDPOINT);
    const executionMode = resolveExecutionMode(env.NSTEP_OS_EXECUTION_MODE, Boolean(databaseConnectionString));
    const hasTwilioConfig = Boolean(trimOptional(env.TWILIO_ACCOUNT_SID) &&
        trimOptional(env.TWILIO_AUTH_TOKEN) &&
        trimOptional(env.TWILIO_FROM_NUMBER));
    return {
        serviceName,
        port,
        dataDir,
        providerMode,
        executionMode,
        openaiApiKey: trimOptional(env.NSTEP_OS_OPENAI_API_KEY),
        openaiModel: trimOptional(env.NSTEP_OS_OPENAI_MODEL) || "gpt-5.4",
        openaiBaseUrl: trimOptional(env.NSTEP_OS_OPENAI_BASE_URL) || "https://api.openai.com/v1",
        geminiApiKey: trimOptional(env.NSTEP_OS_GEMINI_API_KEY),
        geminiModel: trimOptional(env.NSTEP_OS_GEMINI_MODEL) || "gemini-2.5-flash",
        geminiBaseUrl: trimOptional(env.NSTEP_OS_GEMINI_BASE_URL) || "https://generativelanguage.googleapis.com/v1beta",
        ocr: {
            provider: resolveOcrProvider(env.NSTEP_OS_OCR_PROVIDER, ocrEndpoint),
            endpoint: ocrEndpoint,
            apiKey: trimOptional(env.NSTEP_OS_OCR_API_KEY),
            timeoutMs: parseNumber(env.NSTEP_OS_OCR_TIMEOUT_MS, 15_000),
        },
        twilio: {
            accountSid: trimOptional(env.TWILIO_ACCOUNT_SID),
            authToken: trimOptional(env.TWILIO_AUTH_TOKEN),
            fromNumber: trimOptional(env.TWILIO_FROM_NUMBER),
            baseUrl: trimOptional(env.TWILIO_BASE_URL) || "https://api.twilio.com",
        },
        sms: {
            provider: resolveSmsProvider(env.NSTEP_OS_SMS_PROVIDER, hasTwilioConfig),
            statusCallbackUrl: trimOptional(env.NSTEP_OS_SMS_STATUS_CALLBACK_URL),
        },
        email: {
            from: trimOptional(env.NSTEP_OS_EMAIL_FROM),
            webhookUrl: trimOptional(env.NSTEP_OS_EMAIL_WEBHOOK_URL),
        },
        database: {
            provider: resolveDatabaseProvider(env.NSTEP_OS_DATABASE_PROVIDER, databaseConnectionString, Boolean(supabaseConnectionString)),
            connectionString: databaseConnectionString,
        },
        browser: {
            provider: env.NSTEP_OS_BROWSER_PROVIDER === "playwright" ? "playwright" : "mock",
        },
        redis: {
            url: redisUrl,
        },
        auth: {
            internalToken: trimOptional(env.NSTEP_OS_INTERNAL_TOKEN) || trimOptional(env.NSTEP_OS_SERVICE_TOKEN),
        },
        worker: {
            pollIntervalMs: parseNumber(env.NSTEP_OS_WORKER_POLL_INTERVAL_MS, 1500),
            staleAfterMs: parseNumber(env.NSTEP_OS_WORKER_STALE_AFTER_MS, 300_000),
        },
        maxRetries: parseNumber(env.NSTEP_OS_MAX_RETRIES, 2),
        approvalThreshold: resolveApprovalThreshold(env.NSTEP_OS_APPROVAL_THRESHOLD),
    };
}
function trimOptional(value) {
    const trimmed = value?.trim();
    return trimmed ? trimmed : undefined;
}
function parseNumber(value, fallback) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
}
function resolveProviderMode(requested, openAiKey, geminiKey) {
    switch (requested?.trim().toLowerCase()) {
        case "openai":
            return openAiKey ? "openai" : "mock";
        case "gemini":
            return geminiKey ? "gemini" : "mock";
        case "mock":
            return "mock";
        default:
            if (openAiKey) {
                return "openai";
            }
            if (geminiKey) {
                return "gemini";
            }
            return "mock";
    }
}
function resolveOcrProvider(requested, endpoint) {
    switch (requested?.trim().toLowerCase()) {
        case "http":
            return endpoint ? "http" : "mock";
        case "mock":
            return "mock";
        default:
            return endpoint ? "http" : "mock";
    }
}
function resolveSmsProvider(requested, hasTwilioConfig) {
    switch (requested?.trim().toLowerCase()) {
        case "twilio":
            return "twilio";
        case "mock":
            return "mock";
        default:
            return hasTwilioConfig ? "twilio" : "mock";
    }
}
function resolveDatabaseProvider(value, connectionString, supabaseConnection) {
    switch (value?.trim().toLowerCase()) {
        case "supabase":
            return "supabase";
        case "postgres":
            return "postgres";
        case "file":
            return "file";
        default:
            if (!connectionString) {
                return "file";
            }
            return supabaseConnection ? "supabase" : "postgres";
    }
}
function resolveExecutionMode(value, hasDatabaseConnection) {
    switch (value?.trim().toLowerCase()) {
        case "queued":
            return "queued";
        case "inline":
            return "inline";
        default:
            return hasDatabaseConnection ? "queued" : "inline";
    }
}
function resolveApprovalThreshold(value) {
    switch (value?.trim().toLowerCase()) {
        case "low":
        case "medium":
        case "high":
        case "critical":
            return value.trim().toLowerCase();
        default:
            return "high";
    }
}
//# sourceMappingURL=config.js.map