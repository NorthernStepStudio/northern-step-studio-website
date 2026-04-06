import { evaluateGoalRisk, evaluateLeadRecoveryRisk, evaluateNexusBuildRisk, evaluateProvLyRisk } from "../policies/index.js";
export function routeGoal(goal) {
    const text = `${goal.goal} ${goal.constraints.join(" ")}`.toLowerCase();
    const workflow = resolveWorkflowKey(goal, text);
    const lane = resolveLane(text, workflow);
    const riskLevel = workflow === "lead-recovery"
        ? evaluateLeadRecoveryRisk(goal)
        : workflow === "nexusbuild"
            ? evaluateNexusBuildRisk(goal)
            : workflow === "provly"
                ? evaluateProvLyRisk(goal)
                : evaluateGoalRisk(goal);
    const approvalRequired = goal.mode === "assist" || riskLevel === "critical" || riskLevel === "high";
    return {
        workflow,
        lane,
        riskLevel,
        approvalRequired,
        reasoning: buildReasoning(goal, workflow, lane, riskLevel),
        confidence: scoreConfidence(goal, workflow),
        tags: buildTags(goal, workflow, lane),
    };
}
function resolveWorkflowKey(goal, text) {
    const payloadWorkflow = goal.payload && typeof goal.payload === "object" && !Array.isArray(goal.payload)
        ? goal.payload.workflow
        : undefined;
    if (payloadWorkflow === "shared") {
        return "shared";
    }
    if (goal.product) {
        return goal.product;
    }
    if (/(missed call|text back|lead recovery|follow up lead|recover lead)/.test(text)) {
        return "lead-recovery";
    }
    if (/(part research|price monitoring|price watch|compatibility|bottleneck|benchmark|nexusbuild|pc build|gaming pc|creator pc|workstation build|parts list|build report|gpu|cpu|motherboard)/.test(text)) {
        return "nexusbuild";
    }
    if (/(inventory|claim packet|claim prep|provly|documentation)/.test(text)) {
        return "provly";
    }
    if (/(routine|support plan|progress tracking|neurormoves|parent guidance)/.test(text)) {
        return "neurormoves";
    }
    return "lead-recovery";
}
function resolveLane(text, workflow) {
    const hasExternal = /(browser|website|scrape|scraping|api|web|crm|twilio|sms|email|retailer|amazon|newegg|best buy|micro center|price|pricing|watch prices|monitor prices)/.test(text);
    const hasInternal = /(database|store|memory|lead|inventory|workflow)/.test(text);
    if (workflow === "nexusbuild") {
        if (hasExternal) {
            return "mixed";
        }
        return "internal";
    }
    if (hasExternal && hasInternal) {
        return "mixed";
    }
    if (hasExternal) {
        return "external";
    }
    return "internal";
}
function buildReasoning(goal, workflow, lane, riskLevel) {
    return `Goal maps to ${workflow} with ${lane} execution and ${riskLevel} risk because "${goal.goal}".`;
}
function scoreConfidence(goal, workflow) {
    if (goal.product === workflow) {
        return 0.98;
    }
    const text = goal.goal.toLowerCase();
    if (text.includes(workflow)) {
        return 0.91;
    }
    return 0.74;
}
function buildTags(goal, workflow, lane) {
    const tags = [workflow, lane, goal.mode, goal.priority];
    if (workflow === "shared") {
        tags.push("shared", "adapter-sample");
    }
    if (workflow === "nexusbuild") {
        tags.push("build-analysis", "compatibility", "pricing");
    }
    if (workflow === "provly") {
        tags.push("inventory", "documentation", "claim-prep", "room-review", "high-value-review");
    }
    if (goal.constraints.length > 0) {
        tags.push("constraints");
    }
    return [...new Set(tags)];
}
//# sourceMappingURL=index.js.map