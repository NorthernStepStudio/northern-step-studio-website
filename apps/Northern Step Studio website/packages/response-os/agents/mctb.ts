import type { AgentInput, AgentOutput } from "./types.ts";
import { callSpecialistModel } from "./_shared.ts";

export async function mctbAgent(input: AgentInput): Promise<AgentOutput> {
  return callSpecialistModel(
    {
      product: "MCTB",
      description:
        "Missed-call text-back, lead recovery messaging, simple business follow-up automation, and conversion-oriented communication support.",
      expertise: [
        "Missed-call recovery flows",
        "Lead follow-up structure",
        "SMS automation concepts",
        "Business communication timing",
        "Conversion-minded messaging guidance",
      ],
      tone: "grounded",
    },
    input,
  );
}
