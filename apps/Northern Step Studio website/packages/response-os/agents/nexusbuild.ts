import type { AgentInput, AgentOutput } from "./types.ts";
import { callSpecialistModel } from "./_shared.ts";

export async function nexusBuildAgent(input: AgentInput): Promise<AgentOutput> {
  return callSpecialistModel(
    {
      product: "NexusBuild",
      description:
        "PC build guidance, component analysis, compatibility thinking, upgrade strategy, and build planning.",
      expertise: [
        "Gaming and workstation PC recommendations",
        "CPU / GPU / RAM / storage tradeoffs",
        "Budget-based build planning",
        "Upgrade paths and performance tiers",
        "Practical buyer guidance",
      ],
      tone: "technical",
    },
    input,
  );
}
