import { defineStage2Permission, defineStage2Responsibility, } from "../../core/stage2-models.js";
const routerResponsibilities = [
    defineStage2Responsibility("Goal classification", "Classifies the incoming goal into a route, lane, and execution posture before the job engine starts work.", ["routeGoal"]),
    defineStage2Responsibility("Risk triage", "Detects when the request should stay in assist mode or require an approval checkpoint.", ["routeGoal", "approval gating"]),
    defineStage2Responsibility("Routing rationale", "Produces a concise routing reason that the rest of the runtime can audit and display.", ["routeGoal", "workflow logs"]),
];
const routerPermissions = [
    defineStage2Permission("route", ["classify"], "May classify goals into workflow routes and risk tiers."),
];
export function createRouterAgent(_context, bridge) {
    return {
        id: "router-agent",
        title: "NStep Router Agent",
        stage: "stage2",
        responsibilities: routerResponsibilities,
        permissions: routerPermissions,
        route: bridge.routeGoal,
    };
}
//# sourceMappingURL=index.js.map