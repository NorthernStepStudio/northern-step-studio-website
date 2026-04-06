import postgres from "postgres";
import { CATALOG_APPS, type CatalogApp } from "../../../src/shared/data/appsCatalog.ts";
import { docsArticles } from "../../../src/shared/data/docs.ts";
import { siteFaqEntries } from "../../../src/shared/data/faq.ts";
import { createDemoLeadRecoveryWorkspace } from "../../../src/shared/lead-recovery.ts";
import {
  STUDIO_APP_FAMILIES,
  STUDIO_EXPERTS,
  STUDIO_GLOBAL_CONTEXT,
  STUDIO_IDENTITY,
} from "../../../src/shared/data/studioKnowledge.ts";
import type { AgentRoute } from "../agents/types.ts";
import type { KnowledgeLane } from "./lane-map.ts";
import { routeToLane } from "./lane-map.ts";
import type { RetrievedChunk, RetrievalResult } from "./types.ts";

type SeedChunk = Omit<RetrievedChunk, "score"> & {
  keywords: string[];
};

type SqlClient = ReturnType<typeof postgres>;

const sqlCache = new Map<string, SqlClient>();
const STATIC_CORPUS = buildStaticCorpus();

export async function retrieveLaneContext(args: {
  lane: KnowledgeLane;
  query: string;
  topK?: number;
  databaseUrl?: string;
}): Promise<RetrievalResult> {
  const { lane, query } = args;
  const topK = args.topK ?? 5;
  const normalizedQuery = normalizeText(query);
  const queryTokens = tokenize(query);

  const dbCorpus = await loadDatabaseCorpus(args.databaseUrl, lane);
  const corpus = dbCorpus.length
    ? dbCorpus
    : STATIC_CORPUS.filter((chunk) => chunk.lane === lane || (lane === "studio" && chunk.lane === "studio"));

  const ranked = corpus
    .map((chunk) => ({
      ...chunk,
      score: scoreChunk(chunk, normalizedQuery, queryTokens),
    }))
    .sort((left, right) => (right.score ?? 0) - (left.score ?? 0));

  const selected = ranked.filter((chunk) => (chunk.score ?? 0) > 0).slice(0, topK);
  const fallback = ranked.slice(0, topK).map((chunk) => ({ ...chunk, score: chunk.score ?? 0.05 }));
  const chunks = (selected.length ? selected : fallback).map(({ keywords: _keywords, ...chunk }) => chunk);

  return {
    lane,
    query,
    chunks,
  };
}

export function routeToKnowledgeLane(route: AgentRoute): KnowledgeLane {
  return routeToLane(route);
}

async function loadDatabaseCorpus(databaseUrl: string | undefined, lane: KnowledgeLane): Promise<SeedChunk[]> {
  const sql = getSqlClient(databaseUrl);
  if (!sql) {
    return [];
  }

  try {
    const rows = await sql<
      Array<{
        id: string;
        lane: KnowledgeLane;
        doc_id: string;
        doc_version: string;
        chunk_id: string;
        title: string | null;
        section: string | null;
        content: string;
        source_url: string | null;
        metadata: Record<string, unknown> | null;
      }>
    >`
      SELECT
        id::text,
        lane,
        doc_id,
        doc_version,
        chunk_id,
        title,
        section,
        content,
        source_url,
        metadata
      FROM knowledge_chunks
      WHERE
        lane     = ${lane}
        AND status = 'active'
        AND access = 'public'
      ORDER BY created_at ASC
      LIMIT 500
    `;

    return rows.map((row) => {
      const metadata = normalizeMetadata(row.metadata);
      // Build a rich sourceTitle from title + section for better retrieval scoring
      const sourceTitle = [row.title, row.section].filter(Boolean).join(" — ") || row.doc_id;
      const url = row.source_url ?? undefined;

      return {
        id: row.id,
        lane: row.lane,
        // Map new schema → existing SeedChunk shape so rest of pipeline is unchanged
        sourceId: row.doc_id,
        sourceTitle,
        content: row.content,
        url,
        metadata: {
          ...metadata,
          doc_id: row.doc_id,
          doc_version: row.doc_version,
          chunk_id: row.chunk_id,
          section: row.section,
        },
        keywords: collectKeywords(metadata, sourceTitle, row.doc_id, row.section ?? undefined),
      };
    });
  } catch {
    return [];
  }
}


function getSqlClient(databaseUrl?: string): SqlClient | null {
  const resolved = typeof databaseUrl === "string" ? databaseUrl.trim() : "";
  if (!resolved) {
    return null;
  }

  const cached = sqlCache.get(resolved);
  if (cached) {
    return cached;
  }

  const sql = postgres(resolved, {
    ssl: "require",
    max: 1,
  });

  sqlCache.set(resolved, sql);
  return sql;
}

function buildStaticCorpus(): SeedChunk[] {
  const corpus: SeedChunk[] = [];

  corpus.push({
    id: "studio.identity",
    lane: "studio",
    sourceId: "studio-identity",
    sourceTitle: "Northern Step Studio Identity",
    content: [
      STUDIO_GLOBAL_CONTEXT,
      "Northern Step Studio builds practical software for real-world workflows.",
      "The public promise is to show what the product does, why it matters, and what the user should do next without overselling the outcome.",
    ].join("\n"),
    url: "/about",
    metadata: { keywords: ["studio", "mission", "philosophy", "brand", "about"] },
    keywords: ["studio", "mission", "philosophy", "brand", "about", "northern step studio"],
  });

  corpus.push({
    id: "studio.experts",
    lane: "studio",
    sourceId: "studio-experts",
    sourceTitle: "Studio Expert Lanes",
    content: STUDIO_EXPERTS.map((expert) => `${expert.label}: ${expert.summary}`).join("\n"),
    url: "/apps",
    metadata: { keywords: STUDIO_EXPERTS.flatMap((expert) => [expert.label, ...expert.keywords, ...expert.aliases]) },
    keywords: STUDIO_EXPERTS.flatMap((expert) => [expert.label, ...expert.keywords, ...expert.aliases]),
  });

  corpus.push({
    id: "studio.apps",
    lane: "studio",
    sourceId: "studio-app-families",
    sourceTitle: "Studio App Families",
    content: STUDIO_APP_FAMILIES.map((family) => `${family.name}: ${family.summary}\nPath: ${family.path}`).join("\n\n"),
    url: "/apps",
    metadata: { keywords: STUDIO_APP_FAMILIES.flatMap((family) => [family.name, family.slug, ...family.keywords, ...family.aliases]) },
    keywords: STUDIO_APP_FAMILIES.flatMap((family) => [family.name, family.slug, ...family.keywords, ...family.aliases]),
  });

  for (const entry of siteFaqEntries) {
    corpus.push({
      id: `studio.faq.${entry.id}`,
      lane: "studio",
      sourceId: `faq:${entry.id}`,
      sourceTitle: entry.question,
      content: `${entry.question}\n${entry.answer}\nURL: ${entry.url}`,
      url: entry.url,
      metadata: { keywords: [...entry.tags] },
      keywords: [...entry.tags, entry.question, entry.answer],
    });
  }

  for (const article of docsArticles) {
    corpus.push({
      id: `studio.doc.${article.slug}`,
      lane: "studio",
      sourceId: `doc:${article.slug}`,
      sourceTitle: `Doc: ${article.slug}`,
      content: `${article.summary}\n\n${article.body}`,
      url: `/docs/${article.slug}`,
      metadata: { category: article.category, keywords: [article.slug, article.category, article.summary] },
      keywords: [article.slug, article.category, article.summary],
    });
  }

  for (const app of CATALOG_APPS) {
    const lane = appToLane(app);
    corpus.push(createCatalogChunk(app, lane));
    corpus.push(createFeatureChunk(app, lane));
  }

  const leadRecovery = createDemoLeadRecoveryWorkspace();

  corpus.push({
    id: "mctb.workspace",
    lane: "mctb",
    sourceId: "lead-recovery-workspace",
    sourceTitle: "Lead Recovery Workspace",
    content: [
      `Business: ${leadRecovery.profile.businessName}`,
      `Main number: ${leadRecovery.profile.mainBusinessNumber}`,
      `Callback number: ${leadRecovery.profile.callbackNumber}`,
      `Services: ${leadRecovery.profile.services.join(", ")}`,
      `Service area: ${leadRecovery.profile.serviceArea}`,
      `Reply copy: ${leadRecovery.profile.missedCallReply}`,
      `Automation mode: ${leadRecovery.settings.automation.mode}`,
      `SMS status: ${leadRecovery.settings.sms.status}`,
      `Email status: ${leadRecovery.settings.email.status}`,
      `Calendar status: ${leadRecovery.settings.calendar.status}`,
      `Recovered leads: ${leadRecovery.metrics.missedCallsRecovered}`,
    ].join("\n"),
    url: "/missed-call-text-back",
    metadata: {
      keywords: [
        "lead recovery",
        "missed call",
        "text back",
        "sms",
        "twilio",
        "automation",
        "owner alert",
      ],
    },
    keywords: [
      "lead recovery",
      "missed call",
      "text back",
      "sms",
      "twilio",
      "automation",
      "owner alert",
      leadRecovery.profile.businessName,
    ],
  });

  corpus.push({
    id: "automation.lead-recovery",
    lane: "automation",
    sourceId: "automation-lead-recovery",
    sourceTitle: "Lead Recovery Automation Settings",
    content: [
      `Automation tier: ${leadRecovery.settings.automation.tier}`,
      `Automation mode: ${leadRecovery.settings.automation.mode}`,
      `Max requests per day: ${leadRecovery.settings.automation.maxRequestsPerDay}`,
      `Fallback on failure: ${leadRecovery.settings.automation.fallbackOnFailure ? "yes" : "no"}`,
      `Implementation status: ${leadRecovery.settings.automation.implementationStatus}`,
      `Emergency route: ${leadRecovery.profile.emergencyPolicy.emergencyRoute}`,
    ].join("\n"),
    url: "/missed-call-text-back",
    metadata: {
      keywords: [
        "automation",
        "workflow",
        "orchestration",
        "responseos",
        "lead recovery",
        "sms",
      ],
    },
    keywords: ["automation", "workflow", "orchestration", "responseos", "lead recovery", "sms"],
  });

  corpus.push({
    id: "automation.studio",
    lane: "automation",
    sourceId: "studio-automation",
    sourceTitle: "Studio Automation Philosophy",
    content: [
      STUDIO_IDENTITY.philosophy,
      STUDIO_IDENTITY.publicPromise,
      "Automation should stay practical, deliberate, and easy to explain.",
    ].join("\n"),
    url: "/about",
    metadata: {
      keywords: ["automation", "studio", "philosophy", "workflow", "system"],
    },
    keywords: ["automation", "studio", "philosophy", "workflow", "system"],
  });

  return corpus;
}

function createCatalogChunk(app: CatalogApp, lane: KnowledgeLane): SeedChunk {
  return {
    id: `${lane}.${app.slug}.catalog`,
    lane,
    sourceId: `catalog:${app.slug}`,
    sourceTitle: `${app.name} Catalog Entry`,
    content: [
      `${app.name} (${app.statusLabel})`,
      app.tagline,
      app.description,
      app.fullDescription,
      `Features: ${app.features.join(" | ")}`,
      `Platform: ${app.platform}`,
      `Monetization: ${app.monetization}`,
      `CTA: ${app.cta_url ?? "not listed"}`,
    ].join("\n"),
    url: app.cta_url ?? `/apps/${app.slug}`,
    metadata: {
      keywords: [app.name, app.slug, app.category, app.statusLabel, app.platform, app.monetization, ...app.features],
    },
    keywords: [app.name, app.slug, app.category, app.statusLabel, app.platform, app.monetization, ...app.features],
  };
}

function createFeatureChunk(app: CatalogApp, lane: KnowledgeLane): SeedChunk {
  return {
    id: `${lane}.${app.slug}.features`,
    lane,
    sourceId: `features:${app.slug}`,
    sourceTitle: `${app.name} Feature Summary`,
    content: [
      `Product: ${app.name}`,
      `Category: ${app.category}`,
      `Progress: ${app.progressPercent}%`,
      `Tech stack: ${app.techStack.join(", ")}`,
      `Progress items: ${app.progress.map((item) => item.text).join(" | ")}`,
      `Feature highlights: ${app.features.join(" | ")}`,
    ].join("\n"),
    url: app.cta_url ?? `/apps/${app.slug}`,
    metadata: {
      keywords: [app.name, app.slug, app.category, ...app.techStack, ...app.progress.map((item) => item.text)],
    },
    keywords: [app.name, app.slug, app.category, ...app.techStack, ...app.progress.map((item) => item.text)],
  };
}

function appToLane(app: CatalogApp): KnowledgeLane {
  switch (app.slug) {
    case "nexusbuild":
      return "nexusbuild";
    case "provly":
      return "provly";
    case "noobs-investing":
      return "noobs";
    case "neuromoves":
      return "neuromove";
    case "pasoscore":
      return "pasoscore";
    default:
      return "studio";
  }
}

function scoreChunk(chunk: SeedChunk, normalizedQuery: string, queryTokens: readonly string[]): number {
  const haystack = normalizeText([chunk.sourceTitle, chunk.content, chunk.sourceId, chunk.url ?? "", ...(chunk.keywords ?? [])].join(" "));
  let score = 0;

  for (const token of queryTokens) {
    if (haystack.includes(token)) {
      score += token.length > 5 ? 1.8 : 1.2;
    }
  }

  if (normalizedQuery.includes(chunk.sourceTitle.toLowerCase())) {
    score += 4;
  }

  if (chunk.keywords.some((keyword) => normalizedQuery.includes(keyword.toLowerCase()))) {
    score += 2.5;
  }

  if (normalizedQuery.includes(chunk.sourceId.toLowerCase())) {
    score += 3;
  }

  return Math.round(score * 100) / 100;
}

function tokenize(value: string): string[] {
  return Array.from(new Set(value.toLowerCase().match(/[a-z0-9]+/g) ?? [])).filter((token) => token.length > 2);
}

function normalizeText(value: string): string {
  return value.toLowerCase();
}

function normalizeMetadata(metadata: unknown): Record<string, any> {
  if (!metadata || typeof metadata !== "object" || Array.isArray(metadata)) {
    return {};
  }

  return metadata as Record<string, any>;
}

function collectKeywords(
  metadata: Record<string, any>,
  sourceTitle: string,
  sourceId: string,
  sourceType?: string,
): string[] {
  const keywords = new Set<string>([
    ...extractStringValues(metadata.keywords),
    ...extractStringValues(metadata.tags),
    sourceTitle,
    sourceId,
    sourceType ?? "",
  ]);

  return Array.from(keywords).filter((keyword) => keyword.trim().length > 0);
}

function extractStringValues(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.flatMap((item) => (typeof item === "string" ? [item] : []));
  }

  if (typeof value === "string") {
    return [value];
  }

  return [];
}
