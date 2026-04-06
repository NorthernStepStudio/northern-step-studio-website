export function createOcrAdapter(config = {}) {
    const provider = config.endpoint && config.provider !== "mock" ? "generic-http" : "mock";
    return {
        provider,
        async extract(input) {
            const extractedAt = new Date().toISOString();
            if (provider === "generic-http" && config.endpoint) {
                const response = await fetchOcrEndpoint(config.endpoint, {
                    prompt: input.prompt,
                    tenantId: input.tenantId,
                    jobId: input.jobId,
                    items: input.items,
                }, config.apiKey, config.timeoutMs);
                const parsed = normalizeEndpointResponse(response, input.items, extractedAt);
                if (parsed.items.length > 0) {
                    return parsed;
                }
            }
            return {
                provider: "mock",
                extractedAt,
                summary: buildSummary(input.items, false),
                items: input.items.map((item) => ({
                    id: item.id,
                    text: deriveMockText(item),
                    confidence: deriveMockConfidence(item),
                    source: item,
                    raw: item.metadata,
                })),
            };
        },
        async close() {
            // no persistent resources to close
        },
    };
}
async function fetchOcrEndpoint(endpoint, payload, apiKey, timeoutMs) {
    const controller = typeof AbortController !== "undefined" ? new AbortController() : undefined;
    const timeout = timeoutMs && timeoutMs > 0 && controller ? setTimeout(() => controller.abort(), timeoutMs) : undefined;
    try {
        const response = await fetch(endpoint, {
            method: "POST",
            headers: {
                "content-type": "application/json",
                ...(apiKey ? { authorization: `Bearer ${apiKey}` } : {}),
            },
            body: JSON.stringify(payload),
            signal: controller?.signal,
        });
        const text = await response.text();
        let json;
        try {
            json = text ? JSON.parse(text) : undefined;
        }
        catch {
            json = undefined;
        }
        if (!response.ok) {
            const error = Object.assign(new Error(`OCR endpoint returned ${response.status}`), {
                status: response.status,
                body: json ?? text,
            });
            throw error;
        }
        return json ?? text;
    }
    finally {
        if (timeout) {
            clearTimeout(timeout);
        }
    }
}
function normalizeEndpointResponse(response, sources, extractedAt) {
    if (Array.isArray(response)) {
        return {
            provider: "generic-http",
            extractedAt,
            summary: buildSummary(sources, true),
            items: response.map((entry, index) => normalizeResultEntry(entry, sources[index] || sources[0], index)),
        };
    }
    const record = isRecord(response) ? response : {};
    const entries = Array.isArray(record.items)
        ? record.items
        : Array.isArray(record.results)
            ? record.results
            : Array.isArray(record.data)
                ? record.data
                : [];
    if (entries.length > 0) {
        return {
            provider: "generic-http",
            extractedAt,
            summary: typeof record.summary === "string" ? record.summary : buildSummary(sources, true),
            items: entries.map((entry, index) => normalizeResultEntry(entry, sources[index] || sources[0], index)),
        };
    }
    const text = typeof record.text === "string" ? record.text : typeof record.output === "string" ? record.output : typeof record.result === "string" ? record.result : undefined;
    if (text) {
        return {
            provider: "generic-http",
            extractedAt,
            summary: typeof record.summary === "string" ? record.summary : buildSummary(sources, true),
            items: sources.map((source, index) => ({
                id: source.id,
                text,
                confidence: 0.72,
                source,
                raw: { index, response },
            })),
        };
    }
    return {
        provider: "generic-http",
        extractedAt,
        summary: typeof record.summary === "string" ? record.summary : buildSummary(sources, false),
        items: [],
    };
}
function normalizeResultEntry(entry, source, index) {
    if (typeof entry === "string") {
        return {
            id: `${source.id}_${index + 1}`,
            text: entry.trim(),
            confidence: deriveMockConfidence(source),
            source,
            raw: entry,
        };
    }
    if (isRecord(entry)) {
        const id = typeof entry.id === "string" ? entry.id : `${source.id}_${index + 1}`;
        const text = typeof entry.text === "string" ? entry.text.trim() : typeof entry.ocrText === "string" ? entry.ocrText.trim() : typeof entry.output === "string" ? entry.output.trim() : "";
        const confidence = typeof entry.confidence === "number" ? Math.max(0, Math.min(1, entry.confidence)) : deriveMockConfidence(source);
        return {
            id,
            text: text || deriveMockText(source),
            confidence,
            source,
            raw: entry,
        };
    }
    return {
        id: `${source.id}_${index + 1}`,
        text: deriveMockText(source),
        confidence: deriveMockConfidence(source),
        source,
        raw: entry,
    };
}
function deriveMockText(item) {
    const text = [
        item.text,
        item.metadata && isRecord(item.metadata) ? stringFromRecord(item.metadata, "ocrText", "text", "transcript", "caption", "notes") : undefined,
        item.label,
        item.filename,
        item.url,
    ]
        .filter((value) => typeof value === "string" && value.trim().length > 0)
        .map((value) => value.trim());
    if (text.length > 0) {
        return text[0];
    }
    return "Visual asset";
}
function deriveMockConfidence(item) {
    if (item.text || (item.metadata && isRecord(item.metadata) && stringFromRecord(item.metadata, "ocrText", "text", "transcript", "caption"))) {
        return 0.94;
    }
    if (item.filename) {
        return 0.58;
    }
    if (item.url) {
        return 0.42;
    }
    return 0.3;
}
function buildSummary(items, hasStructuredResponse) {
    const total = items.length;
    return hasStructuredResponse
        ? `Extracted structured text from ${total} visual asset${total === 1 ? "" : "s"}.`
        : `Prepared ${total} visual asset${total === 1 ? "" : "s"} for OCR fallback parsing.`;
}
function stringFromRecord(record, ...keys) {
    for (const key of keys) {
        const value = record[key];
        if (typeof value === "string" && value.trim()) {
            return value.trim();
        }
    }
    return undefined;
}
function isRecord(value) {
    return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}
//# sourceMappingURL=index.js.map