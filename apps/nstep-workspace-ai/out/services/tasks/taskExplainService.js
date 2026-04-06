"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.explainTaskResult = explainTaskResult;
function explainTaskResult(task) {
    const lines = [
        `Task: ${task.kind}`,
        `Status: ${task.status}`,
        `Command: ${task.commandLine}`,
        `Exit code: ${task.exitCode ?? "unknown"}`,
        "",
        "Summary:",
        task.summary,
    ];
    if (task.stderr.trim()) {
        lines.push("", "Error output:", task.stderr.trim());
    }
    if (task.likelyErrorFiles.length > 0) {
        lines.push("", "Likely error files:", ...task.likelyErrorFiles.map((file) => `- ${file}`));
    }
    return lines.join("\n");
}
//# sourceMappingURL=taskExplainService.js.map