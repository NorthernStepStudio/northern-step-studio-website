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
exports.buildFallbackResponse = buildFallbackResponse;
const path = __importStar(require("node:path"));
function buildFallbackResponse(request) {
    const title = buildTitle(request);
    const response = buildResponseBody(request);
    return {
        title,
        response,
        preview: response.split("\n").slice(0, 4).join("\n"),
    };
}
function buildTitle(request) {
    switch (request.intent) {
        case "explain-file":
            return request.activeFile ? `Explain ${path.basename(request.activeFile.path)}` : "Explain File";
        case "explain-project-structure":
            return "Project Structure";
        case "change-plan":
            return "Change Plan";
        case "ask-error-file":
            return request.activeFile ? `Likely Error File: ${path.basename(request.activeFile.path)}` : "Likely Error File";
        case "propose-edit":
            return request.activeFile ? `Proposed Edit: ${path.basename(request.activeFile.path)}` : "Proposed Edit";
        case "propose-error-file-fix":
            return request.activeFile ? `Proposed Error Fix: ${path.basename(request.activeFile.path)}` : "Proposed Error Fix";
        case "propose-multi-file-change":
            return "Multi-File Proposal";
        case "workspace-briefing":
            return "Workspace Briefing";
        case "knowledge-search":
            return "Knowledge Search";
        default:
            return "NSS Workspace AI";
    }
}
function buildResponseBody(request) {
    const lines = [];
    lines.push(`Intent: ${request.intent}`);
    lines.push(`Prompt: ${request.prompt}`);
    lines.push(`Workspace: ${request.workspace.name}${request.workspace.rootPath ? ` (${request.workspace.rootPath})` : ""}`);
    if (request.mode || request.presetId || request.studioProjectId) {
        lines.push(`Mode/Preset/Project: ${request.mode ?? "unspecified"} / ${request.presetId ?? "unspecified"} / ${request.studioProjectId ?? "unspecified"}`);
    }
    if (request.activeFile) {
        const file = request.activeFile;
        lines.push("");
        lines.push("Active file:");
        lines.push(`- Path: ${file.path}`);
        lines.push(`- Language: ${file.languageId}`);
        lines.push(`- Size: ${countLines(file.content)} lines`);
        lines.push(`- Imports: ${countMatches(file.content, /^\s*import\s/mg)}`);
        lines.push(`- Exports: ${countMatches(file.content, /^\s*export\s/mg)}`);
        lines.push(`- Functions: ${countMatches(file.content, /\bfunction\b|=>/g)}`);
        if (file.selection) {
            lines.push(`- Selection: ${truncate(file.selection, 180)}`);
        }
    }
    if (request.project?.structureSummary) {
        lines.push("");
        lines.push("Project structure snapshot:");
        lines.push(request.project.structureSummary);
    }
    if (request.task) {
        lines.push("");
        lines.push("Task context:");
        lines.push(`- Command: ${request.task.commandLine}`);
        lines.push(`- Exit code: ${String(request.task.exitCode)}`);
        lines.push(`- Summary: ${request.task.summary}`);
        if (request.task.likelyErrorFiles?.length) {
            lines.push(...request.task.likelyErrorFiles.slice(0, 5).map((file) => `- Likely error file: ${file}`));
        }
    }
    if (request.codebase?.relatedFiles?.length) {
        lines.push("");
        lines.push("Related files:");
        lines.push(...request.codebase.relatedFiles.slice(0, 6).map((file) => `- ${file}`));
    }
    if (request.codebase?.likelyErrorFiles?.length) {
        lines.push("");
        lines.push("Likely error files:");
        lines.push(...request.codebase.likelyErrorFiles.slice(0, 6).map((file) => `- ${file}`));
    }
    if (request.memory?.projectRules?.length || request.memory?.repairPatterns?.length || request.memory?.recurringFailures?.length) {
        lines.push("");
        lines.push("Workspace memory:");
        lines.push(...request.memory.projectRules?.slice(0, 4).map((rule) => `- Project rule: ${rule}`) ?? []);
        lines.push(...request.memory.repairPatterns?.slice(0, 3).map((pattern) => `- Repair pattern: ${pattern}`) ?? []);
        lines.push(...request.memory.recurringFailures?.slice(0, 3).map((failure) => `- Recurring failure: ${failure}`) ?? []);
    }
    if (request.knowledge?.length) {
        lines.push("");
        lines.push("Knowledge highlights:");
        lines.push(...request.knowledge.slice(0, 5).map((item) => `- ${item.title}: ${truncate(item.excerpt, 140)}`));
    }
    if (request.workflow) {
        lines.push("");
        lines.push(`Workflow: ${request.workflow.title} -> ${request.workflow.currentStep}`);
    }
    lines.push("");
    lines.push("Recommended next steps:");
    lines.push(...buildNextSteps(request).map((step) => `- ${step}`));
    if (isProposalIntent(request.intent)) {
        lines.push("");
        lines.push("This server is running in local fallback mode, so the proposal is review-only right now.");
        lines.push("To enable concrete `proposedText` generation, configure an OpenAI-compatible backend in the server env.");
    }
    return lines.join("\n");
}
function buildNextSteps(request) {
    switch (request.intent) {
        case "explain-file":
            return [
                "Confirm the file's role against the nearby related files.",
                "Check whether the current selection contains the riskiest logic path.",
                "Use a review proposal before applying any broad rewrite.",
            ];
        case "change-plan":
            return [
                "Clarify acceptance criteria before editing.",
                "Touch the smallest set of files that satisfies the change.",
                "Queue review items before applying multi-file edits.",
            ];
        case "ask-error-file":
        case "propose-error-file-fix":
        case "analyze-task-failure":
            return [
                "Start from the first concrete compiler or runtime error, not the last cascade message.",
                "Check the likely error file against the failing task output.",
                "Prefer a minimal fix and rerun the task before widening the change.",
            ];
        case "propose-edit":
        case "review-refresh":
        case "propose-multi-file-change":
            return [
                "Review the proposed scope before applying anything.",
                "Keep one file review item focused on one behavior change.",
                "Re-run the relevant task or workflow after apply.",
            ];
        case "workspace-briefing":
            return [
                "Use the current mode and preset to decide whether this is coding, debugging, product, marketing, or research work.",
                "Check project rules and repair patterns before repeating old mistakes.",
                "Move to a workflow if the work requires multiple steps.",
            ];
        default:
            return [
                "Use the active file and workspace context to narrow the task.",
                "Prefer review-first edits over blind replacement.",
                "Run a bounded local task after any meaningful change.",
            ];
    }
}
function isProposalIntent(intent) {
    return (intent === "propose-edit" ||
        intent === "propose-error-file-fix" ||
        intent === "propose-multi-file-change" ||
        intent === "review-refresh");
}
function countLines(value) {
    return value ? value.split(/\r?\n/).length : 0;
}
function countMatches(value, pattern) {
    return [...value.matchAll(pattern)].length;
}
function truncate(value, maxLength) {
    if (value.length <= maxLength) {
        return value;
    }
    return `${value.slice(0, Math.max(0, maxLength - 1)).trimEnd()}…`;
}
//# sourceMappingURL=fallbackResponder.js.map