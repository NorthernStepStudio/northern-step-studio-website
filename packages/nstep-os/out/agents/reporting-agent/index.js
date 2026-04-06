import { defineStage2Permission, defineStage2Responsibility, } from "../../core/stage2-models.js";
const reportingResponsibilities = [
    defineStage2Responsibility("Workflow reporting", "Produces the final workflow result that the runtime can show to users and operators.", ["buildWorkflowReport"]),
    defineStage2Responsibility("Dashboard summarization", "Builds a dashboard snapshot from jobs and memory without exposing runtime internals.", ["buildDashboardSnapshot"]),
    defineStage2Responsibility("Operational visibility", "Keeps reporting aligned with audit logs, approvals, and step-level execution history.", ["buildWorkflowReport", "buildDashboardSnapshot"]),
];
const reportingPermissions = [
    defineStage2Permission("report", ["report"], "May summarize workflow outcomes and dashboard state."),
];
export function createReportingAgent(_context, bridge) {
    return {
        id: "reporting-agent",
        title: "NStep Reporting Agent",
        stage: "stage2",
        responsibilities: reportingResponsibilities,
        permissions: reportingPermissions,
        report: bridge.buildWorkflowReport,
        summarize: bridge.buildDashboardSnapshot,
    };
}
//# sourceMappingURL=index.js.map