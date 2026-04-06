import { defineStage2Permission, defineStage2Responsibility, } from "../../core/stage2-models.js";
const plannerResponsibilities = [
    defineStage2Responsibility("Task graph generation", "Turns a routed goal into an ordered execution graph with explicit dependencies and step types.", ["planGoal"]),
    defineStage2Responsibility("Tool selection", "Assigns the most appropriate tool class to each step without baking in product logic.", ["planGoal", "job steps"]),
    defineStage2Responsibility("Approval annotation", "Marks risky or uncertain steps so the runtime can pause for human review when required.", ["planGoal", "approval gating"]),
];
const plannerPermissions = [
    defineStage2Permission("plan", ["plan"], "May construct workflow plans and annotate approval checkpoints."),
];
export function createPlannerAgent(_context, bridge) {
    return {
        id: "planner-agent",
        title: "NStep Planner Agent",
        stage: "stage2",
        responsibilities: plannerResponsibilities,
        permissions: plannerPermissions,
        plan: bridge.planGoal,
    };
}
//# sourceMappingURL=index.js.map