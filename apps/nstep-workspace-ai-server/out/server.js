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
exports.startNssWorkspaceAiServer = startNssWorkspaceAiServer;
const http = __importStar(require("node:http"));
const env_js_1 = require("./config/env.js");
const portState_js_1 = require("./config/portState.js");
const askService_js_1 = require("./services/askService.js");
async function startNssWorkspaceAiServer(overrides = {}, options = {}) {
    const config = {
        ...(0, env_js_1.getServerConfig)(),
        ...overrides,
    };
    const host = "127.0.0.1";
    const portStateFilePath = options.portStateFilePath === false ? undefined : options.portStateFilePath ?? (0, portState_js_1.resolveDefaultPortStateFilePath)();
    const server = http.createServer(async (request, response) => {
        try {
            setCommonHeaders(response);
            if (request.method === "GET" && request.url === "/health") {
                await respondJson(response, 200, createHealthResponse(config));
                return;
            }
            if (request.method === "POST" && request.url === "/ask") {
                const payload = (await readJsonBody(request));
                const answer = await (0, askService_js_1.handleAskRequest)(config, payload);
                await respondJson(response, 200, answer);
                return;
            }
            await respondJson(response, 404, {
                error: "Not found.",
            });
        }
        catch (error) {
            await respondJson(response, 400, {
                error: error instanceof Error ? error.message : "Request failed.",
            });
        }
    });
    const port = await listenOnAvailablePort(server, config.port, host);
    if (portStateFilePath) {
        await (0, portState_js_1.writePortStateFile)(portStateFilePath, port);
    }
    return {
        server,
        port,
        close: () => new Promise((resolve, reject) => {
            server.close((error) => {
                if (error) {
                    reject(error);
                    return;
                }
                resolve();
            });
        }),
    };
}
function createHealthResponse(config) {
    return {
        status: "ok",
        mode: config.mCore.providerMode,
        detail: (0, env_js_1.describeProvider)(config),
        checkedAt: new Date().toISOString(),
    };
}
async function readJsonBody(request) {
    const chunks = [];
    await new Promise((resolve, reject) => {
        request.on("data", (chunk) => {
            chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
        });
        request.on("end", () => resolve());
        request.on("error", reject);
    });
    const body = Buffer.concat(chunks).toString("utf8").trim();
    if (!body) {
        throw new Error("Request body is empty.");
    }
    try {
        return JSON.parse(body);
    }
    catch {
        throw new Error("Request body must be valid JSON.");
    }
}
async function respondJson(response, statusCode, payload) {
    response.statusCode = statusCode;
    response.setHeader("Content-Type", "application/json; charset=utf-8");
    response.end(JSON.stringify(payload));
}
function setCommonHeaders(response) {
    response.setHeader("Access-Control-Allow-Origin", "*");
    response.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
    response.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
}
async function listenOnAvailablePort(server, requestedPort, host) {
    try {
        return await listenOnPort(server, requestedPort, host);
    }
    catch (error) {
        if (isAddressInUseError(error) && requestedPort !== 0) {
            try {
                return await listenOnPort(server, 0, host);
            }
            catch (fallbackError) {
                throw createListenError(requestedPort, host, fallbackError, true);
            }
        }
        throw createListenError(requestedPort, host, error, false);
    }
}
async function listenOnPort(server, port, host) {
    await new Promise((resolve, reject) => {
        const onError = (error) => {
            server.off("error", onError);
            reject(error);
        };
        server.once("error", onError);
        server.listen(port, host, () => {
            server.off("error", onError);
            resolve();
        });
    });
    const address = server.address();
    if (!address || typeof address === "string") {
        throw new Error("Could not determine NSS server port.");
    }
    return address.port;
}
function isAddressInUseError(error) {
    return error instanceof Error && "code" in error && error.code === "EADDRINUSE";
}
function createListenError(port, host, error, fallbackAttempted) {
    if (isAddressInUseError(error)) {
        const detail = fallbackAttempted
            ? `NSS Workspace AI could not start because ${host}:${port} is already in use and no free fallback port was available.`
            : `NSS Workspace AI could not start because ${host}:${port} is already in use. Another server may already be running.`;
        return new Error(detail, { cause: error });
    }
    const message = error instanceof Error ? error.message : "Unknown listen failure.";
    const prefix = fallbackAttempted
        ? `NSS Workspace AI could not start after falling back from ${host}:${port}`
        : `NSS Workspace AI could not start on ${host}:${port}`;
    return new Error(`${prefix}: ${message}`, { cause: error instanceof Error ? error : undefined });
}
//# sourceMappingURL=server.js.map