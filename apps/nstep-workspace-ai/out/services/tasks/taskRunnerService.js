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
exports.runWorkspaceTask = runWorkspaceTask;
const fs = __importStar(require("node:fs/promises"));
const path = __importStar(require("node:path"));
const node_child_process_1 = require("node:child_process");
const vscode = __importStar(require("vscode"));
const errorFileService_js_1 = require("../codebase/errorFileService.js");
async function runWorkspaceTask(kind) {
    const executionContext = await resolveTaskExecutionContext(kind);
    const startedAt = new Date().toISOString();
    return new Promise((resolve, reject) => {
        const child = (0, node_child_process_1.spawn)(executionContext.command, executionContext.args, {
            cwd: executionContext.cwd,
            shell: false,
            windowsHide: true,
        });
        const stdout = [];
        const stderr = [];
        child.stdout.on("data", (chunk) => {
            stdout.push(String(chunk));
        });
        child.stderr.on("data", (chunk) => {
            stderr.push(String(chunk));
        });
        child.on("error", reject);
        child.on("close", async (exitCode) => {
            const combinedStdout = stdout.join("");
            const combinedStderr = stderr.join("");
            const likelyErrorFiles = await (0, errorFileService_js_1.findLikelyErrorFilesFromOutput)(combinedStderr || combinedStdout);
            resolve({
                id: `task-${Date.now()}`,
                kind,
                commandLine: [executionContext.command, ...executionContext.args].join(" "),
                cwd: executionContext.cwd,
                status: exitCode === 0 ? "succeeded" : "failed",
                exitCode,
                stdout: combinedStdout,
                stderr: combinedStderr,
                summary: exitCode === 0 ? `${kind} completed successfully.` : `${kind} failed with exit code ${exitCode}.`,
                likelyErrorFiles,
                createdAt: startedAt,
                finishedAt: new Date().toISOString(),
            });
        });
    });
}
async function resolveTaskExecutionContext(kind) {
    const packageDirectory = await findNearestPackageDirectory();
    const packageJsonPath = path.join(packageDirectory, "package.json");
    const packageJson = JSON.parse(await fs.readFile(packageJsonPath, "utf8"));
    if (!packageJson.scripts?.[kind]) {
        throw new Error(`The nearest package.json at ${packageDirectory} does not define an "${kind}" script.`);
    }
    if (process.platform === "win32") {
        return {
            cwd: packageDirectory,
            command: "cmd.exe",
            args: ["/d", "/s", "/c", "npm", "run", kind],
        };
    }
    return {
        cwd: packageDirectory,
        command: "npm",
        args: ["run", kind],
    };
}
async function findNearestPackageDirectory() {
    const activeFilePath = vscode.window.activeTextEditor?.document.uri.fsPath;
    const workspaceRoot = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
    const startPath = activeFilePath ? path.dirname(activeFilePath) : workspaceRoot;
    if (!startPath) {
        throw new Error("Open a workspace or file before running NSS workspace tasks.");
    }
    let currentDirectory = startPath;
    while (true) {
        const candidate = path.join(currentDirectory, "package.json");
        try {
            await fs.stat(candidate);
            return currentDirectory;
        }
        catch {
            const parent = path.dirname(currentDirectory);
            if (parent === currentDirectory) {
                break;
            }
            currentDirectory = parent;
        }
    }
    throw new Error("NSS could not find a package.json above the current file or workspace root.");
}
//# sourceMappingURL=taskRunnerService.js.map