import { defineStage2Permission, defineStage2Responsibility, } from "../../core/stage2-models.js";
const researchResponsibilities = [
    defineStage2Responsibility("Source digestion", "Collects and structures source references for later research and monitoring workflows.", ["research"]),
    defineStage2Responsibility("Evidence summary", "Produces a compact evidence summary that can be audited by the runtime or admin views.", ["research", "reporting"]),
    defineStage2Responsibility("Research readiness", "Keeps the interface generic so the runtime can swap in browser, API, or local providers later.", ["research", "tool adapter boundary"]),
];
const researchPermissions = [
    defineStage2Permission("research", ["research"], "May prepare and structure research requests and source lists.", {
        mayUseExternalTools: true,
        requiresApprovalForExternalActions: true,
    }),
];
export function createResearchAgent(context, _bridge) {
    const logger = context.logger?.child("research-agent");
    return {
        id: "research-agent",
        title: "NStep Research Agent",
        stage: "stage2",
        responsibilities: researchResponsibilities,
        permissions: researchPermissions,
        async research(request) {
            const goalText = request.goal?.goal || request.subject;
            const sourcesUsed = uniqueSources(request.sources, request.maxSources ?? 3);
            const findings = sourcesUsed.map((source, index) => `${index + 1}. Source queued: ${source}`);
            logger?.debug("Stage 2 research scaffold executed.", {
                subject: request.subject,
                sourceCount: sourcesUsed.length,
            });
            return {
                summary: `Research scaffold prepared for ${goalText}. ${sourcesUsed.length} source(s) registered for future retrieval.`,
                findings,
                sourcesUsed,
                confidence: Math.min(0.4 + sourcesUsed.length * 0.15, 0.9),
                notes: [
                    request.constraints?.length ? `Constraints: ${request.constraints.join("; ")}` : "No additional constraints supplied.",
                    "Stage 2 does not execute live retrieval from this agent layer.",
                ],
            };
        },
    };
}
function uniqueSources(sources, maxSources) {
    return [...new Set(sources.map((source) => source.trim()).filter((source) => source.length > 0))].slice(0, maxSources);
}
//# sourceMappingURL=index.js.map