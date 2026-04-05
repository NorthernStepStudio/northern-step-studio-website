import type { AgentInput, AgentOutput } from "./types.ts";
import { callSpecialistModel } from "./_shared.ts";

export async function noobsAgent(input: AgentInput): Promise<AgentOutput> {
  return callSpecialistModel(
    {
      product: "NooBS Investing",
      description:
        "Beginner-friendly investing education, investing simulations, and practical learning support for new investors.",
      expertise: [
        "Beginner investing concepts",
        "Portfolio basics",
        "Risk awareness",
        "Educational simulations",
        "Simple explanations without jargon overload",
      ],
      tone: "grounded",
    },
    input,
  );
}
