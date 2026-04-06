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
exports.runServerUrlSmoke = runServerUrlSmoke;
const node_assert_1 = require("node:assert");
const fs = __importStar(require("node:fs/promises"));
const os = __importStar(require("node:os"));
const path = __importStar(require("node:path"));
const defaults_js_1 = require("../../config/defaults.js");
const serverUrl_js_1 = require("../../helpers/serverUrl.js");
async function runServerUrlSmoke() {
    const tempRoot = await fs.mkdtemp(path.join(os.tmpdir(), "nstep-workspace-ai-"));
    const workspaceRoot = path.join(tempRoot, "workspace");
    await fs.mkdir(workspaceRoot, { recursive: true });
    try {
        const portStateFilePath = path.join(workspaceRoot, ".nstep-workspace-ai-server-port.json");
        await fs.writeFile(portStateFilePath, JSON.stringify({
            pid: 12345,
            port: 4321,
            startedAt: new Date().toISOString(),
        }, null, 2), "utf8");
        const resolvedFromPortFile = (0, serverUrl_js_1.resolveServerUrl)({
            configuredServerUrl: defaults_js_1.DEFAULT_BACKEND_URL,
            workspaceRoot,
            defaultServerUrl: defaults_js_1.DEFAULT_BACKEND_URL,
        });
        node_assert_1.strict.equal(resolvedFromPortFile.serverUrl, "http://127.0.0.1:4321");
        node_assert_1.strict.equal(resolvedFromPortFile.source, "workspace-port-file");
        const resolvedConfigured = (0, serverUrl_js_1.resolveServerUrl)({
            configuredServerUrl: "http://127.0.0.1:9000",
            workspaceRoot,
            defaultServerUrl: defaults_js_1.DEFAULT_BACKEND_URL,
        });
        node_assert_1.strict.equal(resolvedConfigured.serverUrl, "http://127.0.0.1:9000");
        node_assert_1.strict.equal(resolvedConfigured.source, "configured");
    }
    finally {
        await fs.rm(tempRoot, { recursive: true, force: true });
    }
}
//# sourceMappingURL=serverUrl.smoke.js.map