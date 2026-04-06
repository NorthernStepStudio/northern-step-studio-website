import { defineStage2Permission, defineStage2Responsibility, } from "../../core/stage2-models.js";
import { inferMemoryLesson } from "../../memory/index.js";
const memoryResponsibilities = [
    defineStage2Responsibility("Pattern capture", "Captures successful workflow shapes and known failure patterns for future reuse.", ["createJobMemory"]),
    defineStage2Responsibility("Preference persistence", "Stores user and tenant preferences that improve later routing and planning decisions.", ["createJobMemory", "memory store"]),
    defineStage2Responsibility("Audit trail support", "Keeps memory entries editable and traceable back to the job that generated them.", ["createJobMemory", "job audit"]),
];
const memoryPermissions = [
    defineStage2Permission("memory", ["remember"], "May create memory entries from approved workflow outcomes."),
];
export function createMemoryAgent(_context, bridge) {
    return {
        id: "memory-agent",
        title: "NStep Memory Agent",
        stage: "stage2",
        responsibilities: memoryResponsibilities,
        permissions: memoryPermissions,
        async remember(workflow, job, context) {
            const entries = await bridge.createJobMemory(workflow, job, context);
            return entries.map((entry) => ({
                ...entry,
                lesson: inferMemoryLesson(job, entry),
            }));
        },
    };
}
//# sourceMappingURL=index.js.map