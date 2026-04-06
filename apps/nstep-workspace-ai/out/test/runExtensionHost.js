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
const node_child_process_1 = require("node:child_process");
const fs = __importStar(require("node:fs/promises"));
const os = __importStar(require("node:os"));
const path = __importStar(require("node:path"));
const node_url_1 = require("node:url");
const node_util_1 = require("node:util");
const execFileAsync = (0, node_util_1.promisify)(node_child_process_1.execFile);
const EXTENSION_TEST_TIMEOUT_MS = 120_000;
async function main() {
    const extensionRoot = path.resolve(__dirname, "..", "..");
    const bundledServer = await startBundledServer(extensionRoot);
    const tempRoot = await fs.mkdtemp(path.join(os.tmpdir(), "nstep-workspace-ai-"));
    const workspaceDir = path.join(tempRoot, "workspace");
    const userDataDir = path.join(tempRoot, "user-data");
    const extensionsDir = path.join(tempRoot, "extensions");
    await fs.mkdir(workspaceDir, { recursive: true });
    await fs.mkdir(userDataDir, { recursive: true });
    await fs.mkdir(extensionsDir, { recursive: true });
    await fs.writeFile(path.join(workspaceDir, "README.md"), "# NStep Workspace AI test workspace\n\nThis workspace exists for the extension-host smoke run.\n", "utf8");
    await fs.writeFile(path.join(workspaceDir, "package.json"), JSON.stringify({
        name: "nstep-workspace-ai-test-workspace",
        private: true,
        dependencies: {
            hono: "^4.0.0",
            "@supabase/supabase-js": "^2.0.0",
            react: "^19.0.0",
            "react-dom": "^19.0.0",
        },
    }, null, 2), "utf8");
    await fs.mkdir(path.join(workspaceDir, "src"), { recursive: true });
    await fs.writeFile(path.join(workspaceDir, "src", "integration.ts"), [
        'import { Hono } from "hono";',
        'import { createClient } from "@supabase/supabase-js";',
        'import { useState } from "react";',
        "",
        "export function calculateStudioScore(input: number): number {",
        "  return input + 1;",
        "}",
        "",
        "export function createWorkspaceApp() {",
        "  const app = new Hono();",
        "  const client = createClient(\"https://example.supabase.co\", \"public-anon-key\");",
        "  void client;",
        "  void useState;",
        "  return app;",
        "}",
        "",
    ].join("\n"), "utf8");
    try {
        await runVsCodeExtensionTests({
            codeExecutable: await resolveCodeExecutable(),
            extensionDevelopmentPath: extensionRoot,
            extensionTestsPath: path.join(__dirname, "integration", "runInHost.js"),
            workspacePath: workspaceDir,
            userDataDir,
            extensionsDir,
            env: {
                ...process.env,
                NSS_TEST_SERVER_URL: bundledServer.baseUrl,
            },
        });
    }
    finally {
        await bundledServer.close();
        await cleanupTempRoot(tempRoot);
    }
}
async function resolveCodeExecutable() {
    if (process.platform === "win32") {
        const localAppData = process.env.LOCALAPPDATA;
        if (localAppData) {
            const installedCode = path.join(localAppData, "Programs", "Microsoft VS Code", "bin", "code.cmd");
            if (await pathExists(installedCode)) {
                return installedCode;
            }
        }
        try {
            const { stdout } = await execFileAsync("where.exe", ["code.cmd"]);
            const resolved = stdout
                .split(/\r?\n/)
                .map((line) => line.trim())
                .find((line) => line.length > 0);
            if (resolved) {
                return resolved;
            }
        }
        catch {
            // Fall back to relying on PATH if direct lookup fails.
        }
    }
    return "code";
}
async function pathExists(targetPath) {
    try {
        await fs.stat(targetPath);
        return true;
    }
    catch {
        return false;
    }
}
async function startBundledServer(extensionRoot) {
    const serverRoot = path.resolve(extensionRoot, "..", "nstep-workspace-ai-server");
    const serverPackage = path.join(serverRoot, "package.json");
    if (!(await pathExists(serverPackage))) {
        throw new Error(`Bundled NStep server is missing at ${serverPackage}.`);
    }
    await runNpmCommand(["run", "compile"], serverRoot);
    const serverEntry = path.join(serverRoot, "out", "server.js");
    if (!(await pathExists(serverEntry))) {
        throw new Error(`Bundled NStep server did not compile to ${serverEntry}.`);
    }
    const imported = (await import((0, node_url_1.pathToFileURL)(serverEntry).href));
    const started = await imported.startNssWorkspaceAiServer({
        port: 0,
        mCore: {
            providerMode: "mock",
            requestTimeoutMs: 30_000,
        },
    }, {
        portStateFilePath: false,
    });
    return {
        baseUrl: `http://127.0.0.1:${started.port}`,
        close: () => started.close(),
    };
}
async function runNpmCommand(args, cwd) {
    if (process.platform === "win32") {
        await execFileAsync("cmd.exe", ["/d", "/s", "/c", "npm", ...args], {
            cwd,
            windowsHide: true,
        });
        return;
    }
    await execFileAsync("npm", [...args], {
        cwd,
        windowsHide: true,
    });
}
async function cleanupTempRoot(tempRoot) {
    for (let attempt = 0; attempt < 8; attempt += 1) {
        try {
            await fs.rm(tempRoot, { recursive: true, force: true });
            return;
        }
        catch (error) {
            if (!(error instanceof Error) || !("code" in error) || error.code !== "EBUSY") {
                throw error;
            }
            await delay(500);
        }
    }
    console.warn(`Skipping temp cleanup because ${tempRoot} is still locked by VS Code.`);
}
async function runVsCodeExtensionTests(options) {
    await new Promise((resolve, reject) => {
        const args = [
            "--new-window",
            "--disable-gpu",
            "--user-data-dir",
            options.userDataDir,
            "--extensions-dir",
            options.extensionsDir,
            "--extensionDevelopmentPath",
            options.extensionDevelopmentPath,
            "--extensionTestsPath",
            options.extensionTestsPath,
            options.workspacePath,
        ];
        const child = process.platform === "win32"
            ? (0, node_child_process_1.spawn)("powershell.exe", ["-NoProfile", "-ExecutionPolicy", "Bypass", "-Command", buildPowerShellCommand(options.codeExecutable, args)], {
                windowsHide: true,
                env: options.env,
            })
            : (0, node_child_process_1.spawn)(options.codeExecutable, args, { windowsHide: true, env: options.env });
        let settled = false;
        const timeout = setTimeout(() => {
            if (settled) {
                return;
            }
            settled = true;
            child.kill();
            reject(new Error(`VS Code extension host run timed out after ${EXTENSION_TEST_TIMEOUT_MS}ms.`));
        }, EXTENSION_TEST_TIMEOUT_MS);
        child.stdout?.pipe(process.stdout);
        child.stderr?.pipe(process.stderr);
        child.on("error", (error) => {
            if (settled) {
                return;
            }
            settled = true;
            clearTimeout(timeout);
            reject(error);
        });
        child.on("exit", (code, signal) => {
            if (settled) {
                return;
            }
            settled = true;
            clearTimeout(timeout);
            if (code === 0) {
                resolve();
                return;
            }
            reject(new Error(`VS Code extension host exited with code ${code ?? "unknown"}${signal ? ` (${signal})` : ""}.`));
        });
    });
}
function buildPowerShellCommand(executable, args) {
    const commandSegments = [escapePowerShellLiteral(executable), ...args.map(escapePowerShellLiteral)].join(" ");
    return `$ErrorActionPreference = 'Stop'; & ${commandSegments}; exit $LASTEXITCODE`;
}
function escapePowerShellLiteral(value) {
    return `'${value.replace(/'/g, "''")}'`;
}
function delay(ms) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}
void main();
//# sourceMappingURL=runExtensionHost.js.map