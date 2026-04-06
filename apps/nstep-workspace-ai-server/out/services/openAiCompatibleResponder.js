"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.askOpenAiCompatible = askOpenAiCompatible;
async function askOpenAiCompatible(config, request) {
    if (!config.apiBaseUrl || !config.apiKey || !config.model) {
        throw new Error("OpenAI-compatible mode requires API base URL, API key, and model.");
    }
    const response = await fetch(new URL("/chat/completions", ensureTrailingSlash(config.apiBaseUrl)), {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${config.apiKey}`,
        },
        body: JSON.stringify({
            model: config.model,
            temperature: 0.2,
            response_format: {
                type: "json_object",
            },
            messages: buildMessages(request),
        }),
        signal: AbortSignal.timeout(config.requestTimeoutMs),
    });
    if (!response.ok) {
        throw new Error(`OpenAI-compatible request failed (${response.status}): ${await response.text()}`);
    }
    const payload = (await response.json());
    const content = payload.choices?.[0]?.message?.content?.trim();
    if (!content) {
        throw new Error("OpenAI-compatible response did not include message content.");
    }
    return normalizeModelResponse(content);
}
function buildMessages(request) {
    return [
        {
            role: "system",
            content: [
                "You are NSS Workspace AI, a local-first studio operating assistant for Northern Step Studio.",
                "Use only the provided JSON context.",
                "Do not invent files, commands, or project state that are not present.",
                "Respond with strict JSON.",
                'Required keys: "title" and "response".',
                'Optional keys: "preview" and "proposedText".',
                "Only include proposedText when you can safely provide a concrete file body.",
                "When you cannot safely generate code, explain why and keep the response review-only.",
            ].join(" "),
        },
        {
            role: "user",
            content: JSON.stringify(request, null, 2),
        },
    ];
}
function normalizeModelResponse(content) {
    const parsed = tryParseJson(content);
    if (parsed && typeof parsed === "object") {
        const record = parsed;
        return {
            title: firstString(record, ["title"]) ?? "NSS Workspace AI",
            response: firstString(record, ["response", "answer", "text", "message", "content"]) ?? content,
            preview: firstString(record, ["preview", "summary"]),
            proposedText: firstString(record, ["proposedText", "fileContent", "updatedFileContent", "replacement", "newFileContent"]),
        };
    }
    return {
        title: "NSS Workspace AI",
        response: content,
    };
}
function tryParseJson(value) {
    const trimmed = value.trim();
    if (!trimmed.startsWith("{")) {
        return undefined;
    }
    try {
        return JSON.parse(trimmed);
    }
    catch {
        return undefined;
    }
}
function firstString(record, keys) {
    for (const key of keys) {
        const value = record[key];
        if (typeof value === "string" && value.trim().length > 0) {
            return value;
        }
    }
    return undefined;
}
function ensureTrailingSlash(value) {
    return value.endsWith("/") ? value : `${value}/`;
}
//# sourceMappingURL=openAiCompatibleResponder.js.map