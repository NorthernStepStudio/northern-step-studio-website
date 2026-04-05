import type { AgentInput, AgentOutput } from "./types.ts";
import { callSpecialistModel } from "./_shared.ts";

export async function neuroMoveAgent(input: AgentInput): Promise<AgentOutput> {
  return callSpecialistModel(
    {
      product: "Neuromove",
      description:
        "Routine support, skill-building workflows, caregiver-friendly planning, and supportive structure for developmental progress.",
      expertise: [
        "Routine-building support",
        "Caregiver-friendly workflows",
        "Skill progression structure",
        "Therapy-adjacent practical planning",
        "Simple, supportive next steps",
      ],
      tone: "supportive",
    },
    input,
  );
}
