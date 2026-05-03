import type { AgentInput, AgentOutput } from "./types.ts";
import { callSpecialistModel } from "./_shared.ts";

export async function pasoScoreAgent(input: AgentInput): Promise<AgentOutput> {
  return callSpecialistModel(
    {
      product: "PasoScore",
      description:
        "Score tracking, structured progress capture, and result-oriented interaction flows for performance-style use cases.",
      expertise: [
        "Scoring workflows",
        "Progress and result tracking",
        "Simple structured data capture",
        "User-friendly status summaries",
        "Practical outcome visibility",
      ],
      tone: "helpful",
    },
    input,
  );
}
