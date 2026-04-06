import type { GoalInput, MemoryEntry, RouteDecision } from "../../core/types.js";
import {
  defineStage2Permission,
  defineStage2Responsibility,
  type Stage2AgentDescriptor,
  type Stage2AgentFactoryContext,
  type Stage2Bridge,
  type Stage2ThinkRequest,
  type Stage2ThinkResult,
} from "../../core/stage2-models.js";
import { buildMemoryHierarchy, selectMemoryForReasoning } from "../../memory/index.js";

const thinkerResponsibilities = [
  defineStage2Responsibility(
    "Problem framing",
    "Breaks a goal into the actual problem shape before a plan is written.",
    ["goal input", "route context", "memory notes"],
  ),
  defineStage2Responsibility(
    "Reasoning capture",
    "Writes compact reasoning notes that can feed planning, memory, and operator review.",
    ["scratchpad", "planning handoff"],
  ),
  defineStage2Responsibility(
    "Risk surfacing",
    "Calls out ambiguity, dependencies, and assumptions before execution starts.",
    ["planning", "verification prep"],
  ),
] as const;

const thinkerPermissions = [
  defineStage2Permission(
    "thinking",
    ["reason"],
    "May analyze goals and produce reasoning notes for downstream planning.",
    {
      mayUseExternalTools: false,
      requiresApprovalForExternalActions: false,
    },
  ),
] as const;

export interface ThinkerAgent extends Stage2AgentDescriptor {
  think(request: Stage2ThinkRequest): Stage2ThinkResult;
}

export function createThinkerAgent(context: Stage2AgentFactoryContext, bridge: Stage2Bridge): ThinkerAgent {
  const logger = context.logger?.child("thinker-agent");

  return {
    id: "thinker-agent",
    title: "NStep Thinker Agent",
    stage: "stage2",
    responsibilities: thinkerResponsibilities,
    permissions: thinkerPermissions,
    think(request) {
      const route = request.route;
      const reasoning: string[] = [];
      const prioritizedMemory = selectMemoryForReasoning(request.memory || [], 9);
      const memoryHierarchy = buildMemoryHierarchy(prioritizedMemory, 9);

      reasoning.push(`Goal: ${request.goal.goal}`);
      reasoning.push(`Product: ${request.goal.product}`);
      if (route) {
        reasoning.push(`Route: ${route.workflow} on the ${route.lane} lane with ${route.riskLevel} risk.`);
        reasoning.push(route.approvalRequired ? "Approval may be required before execution." : "Execution can proceed without pre-approval.");
      }
      if (request.notes?.length) {
        reasoning.push(`Prior notes: ${request.notes.slice(0, 3).join(" | ")}`);
      }
      if (prioritizedMemory.length) {
        reasoning.push(
          `Memory tiers loaded: ${memoryHierarchy.semantic.length} semantic, ${memoryHierarchy.procedural.length} procedural, ${memoryHierarchy.episodic.length} episodic item(s).`,
        );
        const semanticNotes = memoryHierarchy.semantic.slice(0, 2).map(summarizeMemoryEntry).filter(Boolean);
        const proceduralNotes = memoryHierarchy.procedural.slice(0, 2).map(summarizeMemoryEntry).filter(Boolean);
        const episodicNotes = memoryHierarchy.episodic.slice(0, 2).map(summarizeMemoryEntry).filter(Boolean);
        if (semanticNotes.length) {
          reasoning.push(`Semantic memory: ${semanticNotes.join(" | ")}`);
        }
        if (proceduralNotes.length) {
          reasoning.push(`Procedural memory: ${proceduralNotes.join(" | ")}`);
        }
        if (episodicNotes.length) {
          reasoning.push(`Episodic memory: ${episodicNotes.join(" | ")}`);
        }
      }

      const risks = collectRisks(request.goal, route);
      const assumptions = collectAssumptions(request.goal, route, memoryHierarchy);
      const nextFocus = route?.approvalRequired ? "Clarify approval boundaries before planning." : "Turn the reasoning into an ordered plan.";
      const summary = `${request.goal.goal} framed for ${request.goal.product} with ${risks.length} risk signal(s).`;

      logger?.debug("Stage 2 thinker scaffold produced reasoning notes.", {
        product: request.goal.product,
        tenantId: request.goal.tenantId,
        riskCount: risks.length,
      });

      return {
        summary,
        reasoning,
        risks,
        assumptions,
        nextFocus,
        confidence: Math.min(0.45 + reasoning.length * 0.08, 0.95),
      };
    },
  };
}

function collectRisks(goal: GoalInput, route?: RouteDecision): string[] {
  const risks = new Set<string>();
  if (goal.constraints.length > 0) {
    risks.add(`Constraints present: ${goal.constraints.join("; ")}`);
  }
  if (goal.mode === "assist") {
    risks.add("Assist mode may require human review before action.");
  }
  if (route?.approvalRequired) {
    risks.add("Route requires approval or additional gating.");
  }
  if (route?.riskLevel === "high" || route?.riskLevel === "critical") {
    risks.add(`Route risk level is ${route.riskLevel}.`);
  }
  if (goal.payload && Object.keys(goal.payload).length > 0) {
    risks.add("Payload contains workflow-specific context that may narrow the plan.");
  }
  return [...risks];
}

function collectAssumptions(
  goal: GoalInput,
  route?: RouteDecision,
  memoryHierarchy?: ReturnType<typeof buildMemoryHierarchy>,
): string[] {
  const assumptions = new Set<string>();
  assumptions.add(`Tenant ${goal.tenantId} is the active scope.`);
  assumptions.add(`Requested role is ${goal.requestedByRole || "operator"}.`);
  if (route) {
    assumptions.add(`Route ${route.workflow} should be treated as the current workflow lane.`);
  }
  if (memoryHierarchy?.semantic.length || memoryHierarchy?.procedural.length || memoryHierarchy?.episodic.length) {
    assumptions.add(
      `Memory loaded: ${memoryHierarchy.semantic.length} semantic, ${memoryHierarchy.procedural.length} procedural, ${memoryHierarchy.episodic.length} episodic item(s).`,
    );
    const semanticPreview = memoryHierarchy.semantic.slice(0, 2).map(summarizeMemoryEntry).filter(Boolean);
    const proceduralPreview = memoryHierarchy.procedural.slice(0, 2).map(summarizeMemoryEntry).filter(Boolean);
    if (semanticPreview.length) {
      assumptions.add(`Semantic memory to honor: ${semanticPreview.join(" | ")}`);
    }
    if (proceduralPreview.length) {
      assumptions.add(`Procedural memory to reuse: ${proceduralPreview.join(" | ")}`);
    }
  }
  return [...assumptions];
}

function summarizeMemoryEntry(entry: MemoryEntry): string {
  const valueSummary = summarizeMemoryValue(entry.value);
  return valueSummary ? `${entry.category}:${entry.key} - ${valueSummary}` : `${entry.category}:${entry.key}`;
}

function summarizeMemoryValue(value: MemoryEntry["value"]): string {
  if (typeof value === "string") {
    return value.trim();
  }

  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return "";
  }

  return Object.entries(value)
    .slice(0, 3)
    .map(([key, item]) => `${key}=${summarizeMemoryValue(item as MemoryEntry["value"]) || String(item)}`)
    .filter(Boolean)
    .join(", ");
}
