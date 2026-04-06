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
const node_assert_1 = require("node:assert");
const fs = __importStar(require("node:fs/promises"));
const http = __importStar(require("node:http"));
const os = __importStar(require("node:os"));
const path = __importStar(require("node:path"));
const server_js_1 = require("../server.js");
async function main() {
    const { portStateFilePath, tempRoot } = await createTempPortStateLocation();
    const started = await (0, server_js_1.startNssWorkspaceAiServer)({
        port: 0,
        mCore: {
            providerMode: "mock",
            requestTimeoutMs: 30_000,
        },
    }, {
        portStateFilePath,
    });
    try {
        const baseUrl = `http://127.0.0.1:${started.port}`;
        const health = await fetchJson(`${baseUrl}/health`);
        node_assert_1.strict.equal(health.status, "ok");
        node_assert_1.strict.equal(health.mode, "mock");
        await assertPortStateFile(portStateFilePath, started.port);
        const explainFile = await postAsk(baseUrl, {
            prompt: "Explain this file clearly.",
            intent: "explain-file",
            workspace: {
                name: "Northern Step Studio",
                rootPath: "D:\\dev\\Northern Step Studio",
            },
            mode: "coding",
            presetId: "general-nss-studio",
            studioProjectId: "general-nss-studio",
            activeFile: {
                path: "apps/nstep-workspace-ai/src/extension.ts",
                languageId: "typescript",
                content: "import * as vscode from 'vscode';\nexport function test() {}\n",
            },
        });
        node_assert_1.strict.equal(explainFile.title, "Explain extension.ts");
        (0, node_assert_1.strict)(explainFile.response.includes("Active file:"));
        const proposal = await postAsk(baseUrl, {
            prompt: "Propose a safer edit.",
            intent: "propose-edit",
            workspace: {
                name: "Northern Step Studio",
            },
            activeFile: {
                path: "apps/nstep-workspace-ai/src/extension.ts",
                languageId: "typescript",
                content: "export function test() {}\n",
            },
        });
        node_assert_1.strict.equal(proposal.title, "Proposed Edit: extension.ts");
        node_assert_1.strict.equal(proposal.proposedText, undefined);
        (0, node_assert_1.strict)(proposal.response.includes("review-only"));
        await assertListenConflictIsAutoPicked();
    }
    finally {
        await started.close();
        await fs.rm(tempRoot, { recursive: true, force: true });
    }
}
async function fetchJson(url) {
    const response = await fetch(url);
    node_assert_1.strict.equal(response.ok, true);
    return (await response.json());
}
async function postAsk(baseUrl, payload) {
    const response = await fetch(`${baseUrl}/ask`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
    });
    node_assert_1.strict.equal(response.ok, true);
    return (await response.json());
}
async function assertPortStateFile(portStateFilePath, expectedPort) {
    const raw = await fs.readFile(portStateFilePath, "utf8");
    const parsed = JSON.parse(raw);
    node_assert_1.strict.equal(parsed.port, expectedPort);
    node_assert_1.strict.equal(parsed.pid, process.pid);
}
async function assertListenConflictIsAutoPicked() {
    const blocker = await createListeningServer();
    try {
        const started = await (0, server_js_1.startNssWorkspaceAiServer)({
            port: blocker.port,
            mCore: {
                providerMode: "mock",
                requestTimeoutMs: 30_000,
            },
        }, {
            portStateFilePath: false,
        });
        node_assert_1.strict.notEqual(started.port, blocker.port);
        try {
            const health = await fetchJson(`http://127.0.0.1:${started.port}/health`);
            node_assert_1.strict.equal(health.status, "ok");
        }
        finally {
            await started.close();
        }
    }
    finally {
        await new Promise((resolve, reject) => {
            blocker.server.close((error) => {
                if (error) {
                    reject(error);
                    return;
                }
                resolve();
            });
        });
    }
}
async function createListeningServer() {
    const server = http.createServer();
    await new Promise((resolve, reject) => {
        server.once("error", reject);
        server.listen(0, "127.0.0.1", () => resolve());
    });
    const address = server.address();
    if (!address || typeof address === "string") {
        throw new Error("Could not determine blocker server port.");
    }
    return {
        server,
        port: address.port,
    };
}
async function createTempPortStateLocation() {
    const tempRoot = await fs.mkdtemp(path.join(os.tmpdir(), "nstep-workspace-ai-server-"));
    return {
        tempRoot,
        portStateFilePath: path.join(tempRoot, "port-state.json"),
    };
}
void main();
//# sourceMappingURL=runSmoke.js.map