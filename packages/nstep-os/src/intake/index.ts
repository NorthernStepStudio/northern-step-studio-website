import type { GoalInput } from "../core/types.js";
import { assertGoalInput } from "../core/validation.js";

export function intakeGoal(input: unknown): GoalInput {
  assertGoalInput(input);
  return {
    ...input,
    goal: input.goal.trim(),
    tenantId: input.tenantId.trim(),
    requestedBy: input.requestedBy?.trim() || undefined,
    requestedByRole: input.requestedByRole || "operator",
    source: input.source || "user",
    constraints: Array.isArray(input.constraints) ? input.constraints.map((item) => String(item).trim()).filter(Boolean) : [],
  };
}
