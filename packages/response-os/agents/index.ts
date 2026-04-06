import { automationAgent } from "./automation.ts";
import { generalAgent } from "./general.ts";
import { mctbAgent } from "./mctb.ts";
import { neuroMoveAgent } from "./neuromove.ts";
import { nexusBuildAgent } from "./nexusbuild.ts";
import { noobsAgent } from "./noobs.ts";
import { pasoScoreAgent } from "./pasoscore.ts";
import { provlyAgent } from "./provly.ts";
import type { AgentInput, AgentOutput, AgentRoute } from "./types.ts";

export async function runAgent(options: {
  route: AgentRoute;
  input: AgentInput;
}): Promise<AgentOutput> {
  switch (options.route) {
    case "nexusbuild":
      return nexusBuildAgent(options.input);
    case "provly":
      return provlyAgent(options.input);
    case "noobs":
      return noobsAgent(options.input);
    case "neuromove":
      return neuroMoveAgent(options.input);
    case "pasoscore":
      return pasoScoreAgent(options.input);
    case "mctb":
      return mctbAgent(options.input);
    case "automation":
      return automationAgent(options.input);
    case "general":
    default:
      return generalAgent(options.input);
  }
}
