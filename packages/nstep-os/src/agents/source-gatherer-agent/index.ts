import {
  defineStage2Permission,
  defineStage2Responsibility,
  type Stage2AgentDescriptor,
  type Stage2AgentFactoryContext,
  type Stage2Bridge,
  type Stage2SourceRequest,
  type Stage2SourceResult,
} from "../../core/stage2-models.js";

const sourceGathererResponsibilities = [
  defineStage2Responsibility(
    "Source collection",
    "Collects source candidates from the allowed retrieval channels without doing the reasoning itself.",
    ["research sources", "browser adapter", "api adapter"],
  ),
  defineStage2Responsibility(
    "Evidence normalization",
    "Normalizes source metadata into a compact evidence list that the research agent can reason over.",
    ["research handoff"],
  ),
  defineStage2Responsibility(
    "Retrieval boundary",
    "Keeps the evidence-gathering phase separate from the reasoning phase.",
    ["research", "tool adapter boundary"],
  ),
] as const;

const sourceGathererPermissions = [
  defineStage2Permission(
    "sources",
    ["gather", "research"],
    "May gather source candidates and normalize evidence for downstream reasoning.",
    {
      mayUseExternalTools: true,
      requiresApprovalForExternalActions: true,
    },
  ),
] as const;

export interface SourceGathererAgent extends Stage2AgentDescriptor {
  gatherSources(request: Stage2SourceRequest): Promise<Stage2SourceResult>;
}

export function createSourceGathererAgent(context: Stage2AgentFactoryContext, _bridge: Stage2Bridge): SourceGathererAgent {
  const logger = context.logger?.child("source-gatherer-agent");

  return {
    id: "source-gatherer-agent",
    title: "NStep Source Gatherer Agent",
    stage: "stage2",
    responsibilities: sourceGathererResponsibilities,
    permissions: sourceGathererPermissions,
    async gatherSources(request) {
      const knowledgeQuery = buildKnowledgeQuery(request);
      const knowledgeStore = context.stores?.knowledge;
      if (knowledgeStore && knowledgeQuery) {
        const knowledgeMatches = await knowledgeStore.search(knowledgeQuery, request.maxSources ?? 5);
        if (knowledgeMatches.length > 0) {
          const sources = knowledgeMatches.map((match) => ({
            title: `${match.sourceTitle}${match.sectionPath ? ` - ${match.sectionPath}` : ""}`,
            excerpt: match.excerpt || match.summary,
            kind: "document" as const,
          }));

          logger?.debug("Stage 2 source gatherer resolved document sources from knowledge chunks.", {
            subject: request.subject,
            sourceCount: sources.length,
          });

          return {
            subject: request.subject,
            sources,
            summary: `Gathered ${sources.length} document source(s) from the knowledge store for ${request.subject}.`,
            confidence: Math.min(0.55 + sources.length * 0.1, 0.95),
            notes: [
              request.goal ? `Goal product: ${request.goal.product}` : "No goal context supplied.",
              "Knowledge chunks are treated as the source of truth for studio docs.",
            ],
          };
        }
      }

      const sources = uniqueSources(request.seedSources, request.maxSources ?? 5).map((source, index) => ({
        title: deriveTitle(source, index),
        url: looksLikeUrl(source) ? source : undefined,
        excerpt: request.constraints?.length ? `Constraints: ${request.constraints.join("; ")}` : undefined,
        kind: looksLikeUrl(source) ? "browser" : "manual",
      })) as Stage2SourceResult["sources"];

      logger?.debug("Stage 2 source gatherer scaffold executed.", {
        subject: request.subject,
        sourceCount: sources.length,
      });

      return {
        subject: request.subject,
        sources,
        summary: sources.length
          ? `Gathered ${sources.length} source candidate(s) for ${request.subject}.`
          : `No source candidates were provided for ${request.subject}.`,
        confidence: Math.min(0.35 + sources.length * 0.12, 0.9),
        notes: [
          request.goal ? `Goal product: ${request.goal.product}` : "No goal context supplied.",
          "Evidence gathering is separated from the reasoning phase.",
        ],
      };
    },
  };
}

function buildKnowledgeQuery(request: Stage2SourceRequest): string {
  return [request.subject, request.goal?.goal, ...(request.constraints || [])].filter((value) => typeof value === "string" && value.trim().length > 0).join(" ");
}

function uniqueSources(sources: readonly string[], maxSources: number): string[] {
  return [...new Set(sources.map((source) => source.trim()).filter((source) => source.length > 0))].slice(0, maxSources);
}

function looksLikeUrl(value: string): boolean {
  return /^https?:\/\//i.test(value);
}

function deriveTitle(source: string, index: number): string {
  if (looksLikeUrl(source)) {
    try {
      return new URL(source).hostname;
    } catch {
      return `Source ${index + 1}`;
    }
  }
  return source.length > 60 ? `${source.slice(0, 57)}...` : source;
}
