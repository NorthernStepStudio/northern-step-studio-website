import {
  defineStage2Permission,
  defineStage2Responsibility,
  type Stage2AgentDescriptor,
  type Stage2AgentFactoryContext,
  type Stage2Bridge,
  type Stage2MessageDraft,
  type Stage2MessageRequest,
} from "../../core/stage2-models.js";

const communicationResponsibilities = [
  defineStage2Responsibility(
    "Message drafting",
    "Drafts editable, business-safe outbound copy for future SMS, email, or internal message workflows.",
    ["compose"],
  ),
  defineStage2Responsibility(
    "Tone control",
    "Keeps the message posture aligned with the runtime's selected communication tone and constraints.",
    ["compose", "tone policy"],
  ),
  defineStage2Responsibility(
    "Template handling",
    "Supports simple template rendering so product workflows can inject reusable message patterns later.",
    ["compose", "template rendering"],
  ),
] as const;

const communicationPermissions = [
  defineStage2Permission("message", ["compose"], "May prepare message drafts but not send them directly."),
] as const;

export interface CommunicationAgent extends Stage2AgentDescriptor {
  composeMessage(request: Stage2MessageRequest): Stage2MessageDraft;
}

export function createCommunicationAgent(context: Stage2AgentFactoryContext, _bridge: Stage2Bridge): CommunicationAgent {
  const logger = context.logger?.child("communication-agent");

  return {
    id: "communication-agent",
    title: "NStep Communication Agent",
    stage: "stage2",
    responsibilities: communicationResponsibilities,
    permissions: communicationPermissions,
    composeMessage(request) {
      const body = renderMessageBody(request);
      logger?.debug("Stage 2 message scaffold produced a draft.", {
        subject: request.subject,
        channel: request.channel,
      });

      return {
        subject: request.subject,
        body,
        tone: request.tone,
        channel: request.channel,
        notes: [
          request.template ? "Template text was rendered from the provided context." : "Generated from the contextual message scaffold.",
          request.constraints.length ? `Applied ${request.constraints.length} constraint(s).` : "No message constraints supplied.",
        ],
      };
    },
  };
}

function renderMessageBody(request: Stage2MessageRequest): string {
  const renderedTemplate = request.template ? renderTemplate(request.template, request.context) : "";
  const contextSummary = summarizeContext(request.context);
  const constraintsSummary = request.constraints.length ? `Constraints: ${request.constraints.join("; ")}` : "";
  const goalSummary = request.goal ? `Goal: ${request.goal.goal}` : "";
  const fallback = `${request.subject}\n${request.audience}`;

  return [renderedTemplate || fallback, goalSummary, constraintsSummary, contextSummary]
    .filter((line) => line.length > 0)
    .join("\n")
    .trim();
}

function renderTemplate(template: string, context: Record<string, unknown>): string {
  return template.replace(/\{\{\s*([^}]+)\s*\}\}/g, (_match, token: string) => {
    const value = resolveContextValue(context, token.trim());
    return value === undefined || value === null ? "" : String(value);
  });
}

function resolveContextValue(context: Record<string, unknown>, path: string): unknown {
  return path.split(".").reduce<unknown>((value, segment) => {
    if (value === undefined || value === null || typeof value !== "object") {
      return undefined;
    }

    return (value as Record<string, unknown>)[segment];
  }, context);
}

function summarizeContext(context: Record<string, unknown>): string {
  const entries = Object.entries(context).filter(([, value]) => value !== undefined && value !== null);
  if (entries.length === 0) {
    return "";
  }

  return entries
    .map(([key, value]) => `${key}: ${formatValue(value)}`)
    .join("\n");
}

function formatValue(value: unknown): string {
  if (Array.isArray(value)) {
    return value.map((entry) => formatValue(entry)).join(", ");
  }

  if (value && typeof value === "object") {
    return JSON.stringify(value);
  }

  return String(value);
}
