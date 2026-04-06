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
exports.probeServerHealth = probeServerHealth;
const http = __importStar(require("node:http"));
const https = __importStar(require("node:https"));
async function probeServerHealth(serverUrl) {
    const url = new URL("/health", ensureTrailingSlash(serverUrl));
    const transport = url.protocol === "https:" ? https : http;
    try {
        const response = await new Promise((resolve, reject) => {
            const request = transport.request(url, {
                method: "GET",
            }, (result) => {
                const chunks = [];
                result.on("data", (chunk) => {
                    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
                });
                result.on("end", () => {
                    resolve({
                        statusCode: result.statusCode ?? 0,
                        body: Buffer.concat(chunks).toString("utf8").trim(),
                    });
                });
            });
            request.setTimeout(3_000, () => {
                request.destroy(new Error("Health probe timed out."));
            });
            request.on("error", reject);
            request.end();
        });
        const detail = response.statusCode >= 200 && response.statusCode < 300
            ? response.body || "Backend health endpoint responded."
            : `Backend responded on /health with status ${response.statusCode}.`;
        return {
            status: "online",
            detail,
            checkedAt: new Date().toISOString(),
        };
    }
    catch (error) {
        return {
            status: "offline",
            detail: error instanceof Error ? error.message : "Backend health probe failed.",
            checkedAt: new Date().toISOString(),
        };
    }
}
function ensureTrailingSlash(value) {
    return value.endsWith("/") ? value : `${value}/`;
}
//# sourceMappingURL=health.js.map