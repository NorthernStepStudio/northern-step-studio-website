import { defineStage2Permission, defineStage2Responsibility, } from "../../core/stage2-models.js";
const supervisorResponsibilities = [
    defineStage2Responsibility("Drift detection", "Checks worker outputs for missing constraints, instruction drift, and unsupported assumptions.", ["thinking", "planning", "research", "reporting"]),
    defineStage2Responsibility("Correction guidance", "Returns actionable corrections so the orchestrator can steer workers back on mission.", ["thinking", "planning", "research", "reporting"]),
];
const supervisorPermissions = [
    defineStage2Permission("supervision", ["review"], "May review worker outputs for drift and control issues.", {
        mayUseExternalTools: false,
    }),
];
export function createSupervisorAgent(_context, _bridge) {
    return {
        id: "supervisor-agent",
        title: "NStep Supervisor Agent",
        stage: "stage2",
        responsibilities: supervisorResponsibilities,
        permissions: supervisorPermissions,
        async supervise(request) {
            const evidence = request.evidence || [];
            const findings = detectFindings(request, evidence);
            const corrections = buildCorrections(request, findings);
            const verdict = findings.some((finding) => finding.toLowerCase().includes("block")) ? "blocked" : findings.length > 0 ? "needs_adjustment" : "approved";
            return {
                subject: request.subject,
                targetPhase: request.targetPhase,
                verdict,
                findings,
                corrections,
                confidence: verdict === "approved" ? 0.92 : verdict === "needs_adjustment" ? 0.78 : 0.66,
                notes: [
                    verdict === "approved" ? "Output is aligned with the current mission." : "Review found drift or missing controls.",
                    ...(request.constraints || []).slice(0, 3).map((constraint) => `Constraint check: ${constraint}`),
                ],
            };
        },
    };
}
function detectFindings(request, evidence) {
    const findings = [];
    const joined = [request.subject, request.summary, ...evidence].join(" ").toLowerCase();
    if (joined.includes("ignore previous") || joined.includes("forget") || joined.includes("override")) {
        findings.push("Potential instruction drift or prompt override language detected.");
    }
    if (joined.includes("maybe") || joined.includes("i think") || joined.includes("possibly")) {
        findings.push("Output includes uncertain reasoning that should be tightened before delivery.");
    }
    if (joined.includes("error") || joined.includes("failed") || joined.includes("blocked")) {
        findings.push("Output references failure conditions that may require an explicit recovery plan.");
    }
    if (evidence.length === 0) {
        findings.push("No supporting evidence was provided to the supervisor.");
    }
    return findings;
}
function buildCorrections(request, findings) {
    if (findings.length === 0) {
        return [`Proceed with the ${request.targetPhase} output.`];
    }
    return findings.map((finding) => {
        if (finding.toLowerCase().includes("drift")) {
            return "Re-anchor the worker on the original goal and remove unrelated tangents.";
        }
        if (finding.toLowerCase().includes("uncertain")) {
            return "Tighten the reasoning with explicit evidence, then retry the worker output.";
        }
        if (finding.toLowerCase().includes("failure")) {
            return "Add a recovery step or escalation path before continuing.";
        }
        return "Review and revise the worker output before handing it to the next phase.";
    });
}
//# sourceMappingURL=index.js.map