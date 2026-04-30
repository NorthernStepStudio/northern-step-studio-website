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
exports.getServerConfig = getServerConfig;
exports.describeProvider = describeProvider;
const fs = __importStar(require("node:fs"));
const path = __importStar(require("node:path"));
function getServerConfig(env = process.env) {
    discoverAndLoadEnvironmentVariables(env);
    const geminiApiKey = firstDefined(trimOptional(env.M_CORE_GEMINI_API_KEY), trimOptional(env.RESPONSE_OS_GEMINI_API_KEY), trimOptional(env.GEMINI_API_KEY), trimOptional(env.NSS_WORKSPACE_AI_API_KEY));
    const geminiModel = firstDefined(trimOptional(env.M_CORE_GEMINI_MODEL), trimOptional(env.RESPONSE_OS_GEMINI_MODEL), trimOptional(env.GEMINI_MODEL), trimOptional(env.NSS_WORKSPACE_AI_MODEL), "gemini-2.5-flash");
    const requestedMode = firstDefined(trimOptional(env.M_CORE_PROVIDER_MODE), trimOptional(env.RESPONSE_OS_PROVIDER_MODE), trimOptional(env.NSS_WORKSPACE_AI_PROVIDER_MODE));
    return {
        port: parseNumber(env.PORT, 3001),
        mCore: {
            providerMode: resolveProviderMode(requestedMode, geminiApiKey),
            geminiApiKey,
            geminiModel,
            geminiBaseUrl: firstDefined(trimOptional(env.M_CORE_GEMINI_BASE_URL), trimOptional(env.RESPONSE_OS_GEMINI_BASE_URL), "https://generativelanguage.googleapis.com/v1"),
            requestTimeoutMs: parseNumber(firstDefined(env.M_CORE_REQUEST_TIMEOUT_MS, env.RESPONSE_OS_REQUEST_TIMEOUT_MS, env.NSS_WORKSPACE_AI_REQUEST_TIMEOUT_MS), 30_000),
        },
    };
}
function describeProvider(config) {
    switch (config.mCore.providerMode) {
        case "gemini":
            return `NSS Master Core (M-CORE) Gemini mode using ${config.mCore.geminiModel ?? "gemini-2.5-flash"}.`;
        case "off":
            return "NSS Master Core (M-CORE) provider is off.";
        case "mock":
        default:
            return "NSS Master Core (M-CORE) mock mode. Deterministic local responses, no external model required.";
    }
}
function resolveProviderMode(requestedMode, geminiApiKey) {
    if (requestedMode === "off") {
        return "off";
    }
    if (requestedMode === "mock") {
        return "mock";
    }
    if (requestedMode === "gemini") {
        return geminiApiKey ? "gemini" : "mock";
    }
    return geminiApiKey ? "gemini" : "mock";
}
function trimOptional(value) {
    const trimmed = value?.trim();
    return trimmed ? trimmed : undefined;
}
function firstDefined(...values) {
    return values.find((value) => value !== undefined);
}
function parseNumber(value, fallback) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
}
function discoverAndLoadEnvironmentVariables(env) {
    const searchableNames = [".env", ".dev.vars", ".nss.vars"];
    let currentDir = process.cwd();
    const rootDir = path.parse(currentDir).root;
    // Search up to 4 levels or root
    for (let i = 0; i < 4; i++) {
        for (const name of searchableNames) {
            const filePath = path.join(currentDir, name);
            if (fs.existsSync(filePath)) {
                try {
                    const content = fs.readFileSync(filePath, "utf8");
                    const lines = content.split(/\r?\n/);
                    for (const line of lines) {
                        const trimmed = line.trim();
                        if (!trimmed || trimmed.startsWith("#")) {
                            continue;
                        }
                        const equalsIndex = trimmed.indexOf("=");
                        if (equalsIndex > 0) {
                            const key = trimmed.slice(0, equalsIndex).trim();
                            const value = trimmed.slice(equalsIndex + 1).trim();
                            const unquotedValue = (value.startsWith('"') && value.endsWith('"')) ||
                                (value.startsWith("'") && value.endsWith("'"))
                                ? value.slice(1, -1) : value;
                            if (key && unquotedValue && !env[key]) {
                                env[key] = unquotedValue;
                            }
                        }
                    }
                }
                catch {
                    // Ignore read errors
                }
            }
        }
        if (currentDir === rootDir) {
            break;
        }
        currentDir = path.dirname(currentDir);
    }
}
//# sourceMappingURL=env.js.map
