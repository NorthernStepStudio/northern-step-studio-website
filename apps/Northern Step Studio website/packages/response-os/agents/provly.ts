import type { AgentInput, AgentOutput } from "./types.ts";
import { callSpecialistModel } from "./_shared.ts";

export async function provlyAgent(input: AgentInput): Promise<AgentOutput> {
  return callSpecialistModel(
    {
      product: "ProvLy",
      description:
        "Home inventory, claim-readiness support, insurance preparation workflows, and household documentation organization.",
      expertise: [
        "Home inventory structure",
        "Insurance claim preparation",
        "Documentation workflows",
        "Category-based item tracking",
        "Practical claim-readiness guidance",
      ],
      tone: "grounded",
    },
    input,
  );
}
