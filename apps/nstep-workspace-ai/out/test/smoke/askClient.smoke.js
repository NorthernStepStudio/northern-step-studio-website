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
exports.runAskClientSmoke = runAskClientSmoke;
const node_assert_1 = require("node:assert");
const http = __importStar(require("node:http"));
const client_js_1 = require("../../api/client.js");
async function runAskClientSmoke() {
    const responses = [
        {
            statusCode: 200,
            contentType: "text/plain; charset=utf-8",
            body: "Plain text reply",
        },
        {
            statusCode: 200,
            contentType: "application/json; charset=utf-8",
            body: JSON.stringify({
                title: "Structured",
                response: "Structured reply",
                preview: "Short preview",
            }),
        },
        {
            statusCode: 200,
            contentType: "application/json; charset=utf-8",
            body: JSON.stringify({
                title: "Proposal",
                content: "Explain the change before applying it.",
                proposedText: "export const patched = true;\n",
                summary: "Concrete file body is available.",
                proposedMemories: [
                    {
                        content: "Hono is the backend stack for this workspace.",
                        tags: ["hono", "backend"],
                    },
                ],
            }),
        },
        {
            statusCode: 200,
            contentType: "application/json; charset=utf-8",
            body: JSON.stringify({
                title: "Preview only",
                fileContent: "const nextValue = true;\n",
                summary: "File content came back without a separate response field.",
            }),
        },
        {
            statusCode: 500,
            contentType: "text/plain; charset=utf-8",
            body: "Server exploded.",
        },
    ];
    let requestCount = 0;
    const server = http.createServer((request, response) => {
        const next = responses[requestCount];
        requestCount += 1;
        node_assert_1.strict.equal(request.method, "POST");
        node_assert_1.strict.equal(request.url, "/ask");
        const chunks = [];
        request.on("data", (chunk) => {
            chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
        });
        request.on("end", () => {
            const payload = JSON.parse(Buffer.concat(chunks).toString("utf8"));
            node_assert_1.strict.equal(payload.prompt, "Smoke test prompt");
            node_assert_1.strict.equal(payload.intent, "ask");
            response.statusCode = next.statusCode;
            response.setHeader("Content-Type", next.contentType);
            response.end(next.body);
        });
    });
    await new Promise((resolve) => {
        server.listen(0, "127.0.0.1", () => resolve());
    });
    const address = server.address();
    (0, node_assert_1.strict)(address && typeof address !== "string");
    try {
        const config = {
            serverUrl: `http://127.0.0.1:${address.port}`,
        };
        const payload = createPayload();
        const plain = await (0, client_js_1.postAskRequest)(config, payload);
        node_assert_1.strict.equal(plain.response, "Plain text reply");
        node_assert_1.strict.equal(plain.title, undefined);
        node_assert_1.strict.equal(plain.proposedText, undefined);
        const structured = await (0, client_js_1.postAskRequest)(config, payload);
        node_assert_1.strict.equal(structured.title, "Structured");
        node_assert_1.strict.equal(structured.response, "Structured reply");
        node_assert_1.strict.equal(structured.preview, "Short preview");
        const proposal = await (0, client_js_1.postAskRequest)(config, payload);
        node_assert_1.strict.equal(proposal.title, "Proposal");
        node_assert_1.strict.equal(proposal.response, "Explain the change before applying it.");
        node_assert_1.strict.equal(proposal.proposedText, "export const patched = true;\n");
        node_assert_1.strict.equal(proposal.preview, "Concrete file body is available.");
        node_assert_1.strict.equal(proposal.proposedMemories?.[0]?.content, "Hono is the backend stack for this workspace.");
        const previewOnly = await (0, client_js_1.postAskRequest)(config, payload);
        node_assert_1.strict.equal(previewOnly.title, "Preview only");
        node_assert_1.strict.equal(previewOnly.response, "File content came back without a separate response field.");
        node_assert_1.strict.equal(previewOnly.proposedText, "const nextValue = true;\n");
        await node_assert_1.strict.rejects(() => (0, client_js_1.postAskRequest)(config, payload), /Backend request failed \(500\): Server exploded\./);
    }
    finally {
        await new Promise((resolve, reject) => {
            server.close((error) => {
                if (error) {
                    reject(error);
                    return;
                }
                resolve();
            });
        });
    }
    node_assert_1.strict.equal(requestCount, responses.length);
}
function createPayload() {
    return {
        prompt: "Smoke test prompt",
        intent: "ask",
        workspace: {
            name: "NSS Workspace AI",
            rootPath: "D:\\dev\\Northern Step Studio\\apps\\nstep-workspace-ai",
        },
    };
}
//# sourceMappingURL=askClient.smoke.js.map