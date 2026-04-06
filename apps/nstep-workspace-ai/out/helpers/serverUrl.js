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
exports.resolveServerUrl = resolveServerUrl;
exports.readPortStateFile = readPortStateFile;
const fs = __importStar(require("node:fs"));
const path = __importStar(require("node:path"));
function resolveServerUrl(options) {
    const configuredServerUrl = trimOptional(options.configuredServerUrl);
    if (configuredServerUrl && configuredServerUrl !== options.defaultServerUrl) {
        return {
            serverUrl: configuredServerUrl,
            source: "configured",
        };
    }
    // Use the workspace root if available, otherwise fallback to the current process CWD or a fixed path
    const searchRoot = options.workspaceRoot ?? process.cwd();
    const portStateFilePath = path.join(searchRoot, ".nstep-workspace-ai-server-port.json");
    const discoveredPort = readPortStateFile(portStateFilePath);
    if (discoveredPort !== undefined) {
        return {
            serverUrl: `http://127.0.0.1:${discoveredPort}`,
            source: "workspace-port-file",
            portStateFilePath,
        };
    }
    return {
        serverUrl: configuredServerUrl ?? options.defaultServerUrl,
        source: "default",
        portStateFilePath,
    };
}
function readPortStateFile(filePath) {
    try {
        const raw = fs.readFileSync(filePath, "utf8").trim();
        if (!raw) {
            return undefined;
        }
        const directPort = parsePort(raw);
        if (directPort !== undefined) {
            return directPort;
        }
        const parsed = JSON.parse(raw);
        return parsePort(parsed?.port);
    }
    catch {
        return undefined;
    }
}
function trimOptional(value) {
    const trimmed = value?.trim();
    return trimmed ? trimmed : undefined;
}
function parsePort(value) {
    if (typeof value === "number" && Number.isInteger(value) && value > 0) {
        return value;
    }
    if (typeof value === "string" && /^\d+$/.test(value)) {
        const parsed = Number(value);
        return Number.isInteger(parsed) && parsed > 0 ? parsed : undefined;
    }
    return undefined;
}
//# sourceMappingURL=serverUrl.js.map