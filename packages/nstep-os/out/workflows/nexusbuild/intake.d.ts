import type { GoalInput, NexusBuildBuildSnapshot, NexusBuildIntake, NexusBuildNormalizedPart, NexusBuildUseCase } from "../../core/types.js";
export declare function extractNexusBuildIntake(goal: GoalInput): NexusBuildIntake;
export declare function normalizeBuildSnapshot(raw: unknown, fallback: {
    readonly buildId: string;
    readonly tenantId: string;
    readonly name: string;
    readonly useCase: NexusBuildUseCase;
    readonly budget?: number;
    readonly currency: string;
    readonly parts: readonly NexusBuildNormalizedPart[];
    readonly preferred?: boolean;
    readonly notes?: string;
    readonly metadata: Record<string, unknown>;
}): NexusBuildBuildSnapshot;
