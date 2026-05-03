import type { AgentRoute } from "../agents/types.ts";

export type KnowledgeLane =
  | "studio"
  | "nexusbuild"
  | "provly"
  | "noobs"
  | "neuromove"
  | "pasoscore";

export function routeToLane(route: AgentRoute): KnowledgeLane {
  switch (route) {
    case "nexusbuild":
      return "nexusbuild";
    case "provly":
      return "provly";
    case "noobs":
      return "noobs";
    case "neuromove":
      return "neuromove";
    case "pasoscore":
      return "pasoscore";
    case "general":
    default:
      return "studio";
  }
}
