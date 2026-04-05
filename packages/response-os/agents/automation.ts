import type { AgentInput, AgentOutput } from "./types.ts";
import { callSpecialistModel } from "./_shared.ts";

export async function automationAgent(input: AgentInput): Promise<AgentOutput> {
  return callSpecialistModel(
    {
      product: "NStep Automation",
      description:
        "Cross-product automation logic, workflow design, orchestration guidance, and system-level process support.",
      expertise: [
        "Workflow orchestration",
        "Cross-agent coordination",
        "Task automation patterns",
        "Operational systems thinking",
        "Practical process design",
      ],
      tone: "technical",
    },
    input,
  );
}
