import type { GoalInput, LeadRecoveryInput } from "../../core/types.js";
import type { LeadRecoveryWorkflowPayload } from "./models.js";

export function extractLeadRecoveryInput(goal: GoalInput): LeadRecoveryInput {
  const payload = goal.payload as unknown as LeadRecoveryWorkflowPayload | undefined;
  const rawInput = payload?.leadRecovery ?? (goal.payload as unknown as LeadRecoveryInput | undefined);

  if (!rawInput || !rawInput.event || !rawInput.brand) {
    throw new Error("Lead recovery goal payload must include leadRecovery.event and leadRecovery.brand.");
  }

  if ("goal" in rawInput && rawInput.goal) {
    return rawInput;
  }

  return {
    goal,
    event: rawInput.event,
    brand: rawInput.brand,
    lead: rawInput.lead,
    previousInteractions: rawInput.previousInteractions,
  };
}

