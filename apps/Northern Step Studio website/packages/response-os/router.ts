import type { AgentRoute } from "./agents/types.ts";

export async function routeMessage(message: string): Promise<AgentRoute> {
  const msg = message.toLowerCase();

  if (
    msg.includes("pc") ||
    msg.includes("build") ||
    msg.includes("gpu") ||
    msg.includes("cpu") ||
    msg.includes("motherboard") ||
    msg.includes("fps")
  ) {
    return "nexusbuild";
  }

  if (
    msg.includes("insurance") ||
    msg.includes("inventory") ||
    msg.includes("claim") ||
    msg.includes("home items") ||
    msg.includes("receipt")
  ) {
    return "provly";
  }

  if (
    msg.includes("invest") ||
    msg.includes("stocks") ||
    msg.includes("money") ||
    msg.includes("etf")
  ) {
    return "noobs";
  }

  if (
    msg.includes("routine") ||
    msg.includes("kids") ||
    msg.includes("therapy") ||
    msg.includes("caregiver")
  ) {
    return "neuromove";
  }

  if (
    msg.includes("score") ||
    msg.includes("match") ||
    msg.includes("team") ||
    msg.includes("tracking")
  ) {
    return "pasoscore";
  }

  if (
    msg.includes("missed call") ||
    msg.includes("missed-call") ||
    msg.includes("lead recovery") ||
    msg.includes("lead-recovery") ||
    msg.includes("sms") ||
    msg.includes("text back") ||
    msg.includes("text-back") ||
    msg.includes("follow-up")
  ) {
    return "mctb";
  }

  if (
    msg.includes("automation") ||
    msg.includes("workflow") ||
    msg.includes("orchestration") ||
    msg.includes("system")
  ) {
    return "automation";
  }

  return "general";
}
