"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.postAskRequest = postAskRequest;
const http = __importStar(require("node:http"));
const https = __importStar(require("node:https"));
async function postAskRequest(config, payload) {
    const url = new URL("/ask", ensureTrailingSlash(config.serverUrl));
    const body = JSON.stringify(payload);
    const transport = url.protocol === "https:" ? https : http;
    const response = await new Promise((resolve, reject) => {
        const request = transport.request(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Content-Length": Buffer.byteLength(body),
            },
        }, (result) => {
            const chunks = [];
            result.on("data", (chunk) => {
                chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
            });
            result.on("end", () => {
                resolve({
                    statusCode: result.statusCode ?? 0,
                    body: Buffer.concat(chunks).toString("utf8"),
                    contentType: String(result.headers["content-type"] ?? ""),
                });
            });
        });
        request.on("error", reject);
        request.write(body);
        request.end();
    });
    if (response.statusCode < 200 || response.statusCode >= 300) {
        throw new Error(`Backend request failed (${response.statusCode}): ${response.body || "No response body."}`);
    }
    return normalizeAskResponse(response.body, response.contentType);
}
function normalizeAskResponse(body, contentType) {
    const parsed = tryParseJson(body, contentType);
    if (parsed && typeof parsed === "object") {
        const record = parsed;
        const proposedText = firstString(record, [
            "proposedText",
            "fileContent",
            "updatedFileContent",
            "replacement",
            "newFileContent",
        ]);
        const proposedMemories = parseProposedMemories(record.proposedMemories);
        const responseText = firstString(record, ["response", "answer", "text", "message", "content", "body", "output", "result"]) ??
            firstString(record, ["preview", "summary"]) ??
            body;
        return {
            title: firstString(record, ["title"]),
            response: responseText,
            proposedText,
            preview: firstString(record, ["preview", "summary"]),
            proposedMemories,
        };
    }
    return { response: body };
}
function tryParseJson(body, contentType) {
    if (!body.trim()) {
        return undefined;
    }
    if (!contentType.includes("json") && !body.trimStart().startsWith("{")) {
        return undefined;
    }
    try {
        return JSON.parse(body);
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
function parseProposedMemories(value) {
    if (!Array.isArray(value)) {
        return undefined;
    }
    const memories = value
        .map((item) => {
        if (!item || typeof item !== "object") {
            return undefined;
        }
        const record = item;
        const content = firstString(record, ["content"]);
        const tags = Array.isArray(record.tags)
            ? record.tags.filter((tag) => typeof tag === "string" && tag.trim().length > 0)
            : [];
        if (!content) {
            return undefined;
        }
        return {
            content,
            tags,
        };
    })
        .filter((memory) => Boolean(memory));
    return memories.length > 0 ? memories : undefined;
}
function ensureTrailingSlash(value) {
    return value.endsWith("/") ? value : `${value}/`;
}
//# sourceMappingURL=client.js.map