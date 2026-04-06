import { defineStage2Permission, defineStage2Responsibility, } from "../../core/stage2-models.js";
const verificationResponsibilities = [
    defineStage2Responsibility("Outcome validation", "Confirms whether a workflow completed successfully and whether the result should be accepted.", ["verifyJob"]),
    defineStage2Responsibility("Retry and escalation detection", "Identifies failures that should retry, escalate, or stay in human review.", ["verifyJob", "retry policy"]),
    defineStage2Responsibility("Audit readiness", "Produces a verification result that can be surfaced in the dashboard and logs.", ["verifyJob", "reporting"]),
];
const verificationPermissions = [
    defineStage2Permission("job", ["verify"], "May verify completed or paused jobs against the workflow contract."),
];
export function createVerificationAgent(_context, bridge) {
    return {
        id: "verification-agent",
        title: "NStep Verification Agent",
        stage: "stage2",
        responsibilities: verificationResponsibilities,
        permissions: verificationPermissions,
        verify: bridge.verifyJob,
    };
}
//# sourceMappingURL=index.js.map