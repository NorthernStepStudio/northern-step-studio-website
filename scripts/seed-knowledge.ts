/**
 * seed-knowledge.ts — NStep AI Knowledge Base Seeder
 *
 * Populates the `knowledge_chunks` table from the authoritative in-memory
 * sources: appsCatalog, docs, faqs, and studioKnowledge.
 *
 * Usage:
 *   DATABASE_URL=postgres://... npx tsx scripts/seed-knowledge.ts
 *   DATABASE_URL=postgres://... npx tsx scripts/seed-knowledge.ts --dry-run
 *   DATABASE_URL=postgres://... npx tsx scripts/seed-knowledge.ts --lane=nexusbuild
 *   DATABASE_URL=postgres://... npx tsx scripts/seed-knowledge.ts --migrate
 *
 * Flags:
 *   --dry-run       Print what would be seeded without writing to DB
 *   --migrate       Run CREATE TABLE / CREATE INDEX before seeding
 *   --lane=<slug>   Only seed one lane (for incremental updates)
 *   --reset         DELETE all existing active chunks before re-seeding
 */

import postgres from "postgres";
import { createHash } from "node:crypto";
import { CATALOG_APPS } from "../src/shared/data/appsCatalog.ts";
import { docsArticles } from "../src/shared/data/docs.ts";
import { siteFaqEntries } from "../src/shared/data/faq.ts";
import {
  STUDIO_APP_FAMILIES,
  STUDIO_EXPERTS,
  STUDIO_GLOBAL_CONTEXT,
  STUDIO_IDENTITY,
} from "../src/shared/data/studioKnowledge.ts";
import { getKnowledgeTableSchema } from "../src/worker/knowledge.ts";


// ─── CLI Args ─────────────────────────────────────────────────────────────────

const args = new Set(process.argv.slice(2));
const isDryRun = args.has("--dry-run");
const runMigrate = args.has("--migrate");
const doReset = args.has("--reset");
const laneFilter = [...args].find((a) => a.startsWith("--lane="))?.split("=")?.[1] ?? null;

// ─── DB Setup ─────────────────────────────────────────────────────────────────

const databaseUrl = process.env.DATABASE_URL || process.env.SUPABASE_DB_URL || "";

if (!databaseUrl && !isDryRun) {
  console.error("❌  DATABASE_URL or SUPABASE_DB_URL is required.");
  console.error("    Run: DATABASE_URL=postgres://... npx tsx scripts/seed-knowledge.ts");
  process.exit(1);
}

const sql = databaseUrl
  ? postgres(databaseUrl, { ssl: { rejectUnauthorized: false }, max: 1 })
  : null;

// ─── Chunk Shape ──────────────────────────────────────────────────────────────

interface SeedChunk {
  doc_id: string;
  chunk_id: string;
  doc_version: string;
  doc_hash: string;
  lane: string;
  status: "active";
  access: "public";
  title: string | null;
  section: string | null;
  content: string;
  metadata: Record<string, unknown>;
  source_url: string | null;
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log("🧠  NStep AI — Knowledge Base Seeder");
  console.log(`    Mode: ${isDryRun ? "DRY RUN" : "LIVE"}`);
  if (laneFilter) console.log(`    Lane filter: ${laneFilter}`);
  console.log("");

  if (sql && runMigrate) {
    console.log("📐  Running schema migration...");
    await runSchemaMigration(sql);
    console.log("✅  Schema ready.\n");
  }

  if (sql && doReset) {
    console.log("🗑   Resetting existing active chunks...");
    if (laneFilter) {
      await sql`DELETE FROM knowledge_chunks WHERE lane = ${laneFilter} AND status = 'active'`;
      console.log(`    Deleted chunks for lane: ${laneFilter}`);
    } else {
      await sql`DELETE FROM knowledge_chunks WHERE status = 'active'`;
      console.log("    Deleted all active chunks.");
    }
    console.log("");
  }

  const chunks = buildAllChunks();
  const filtered = laneFilter ? chunks.filter((c) => c.lane === laneFilter) : chunks;

  // Lane summary
  const laneSummary = new Map<string, number>();
  for (const c of filtered) {
    laneSummary.set(c.lane, (laneSummary.get(c.lane) ?? 0) + 1);
  }

  console.log("📦  Chunks to seed:");
  for (const [lane, count] of [...laneSummary.entries()].sort()) {
    console.log(`    ${lane.padEnd(20)} ${count} chunks`);
  }
  console.log(`    ${"TOTAL".padEnd(20)} ${filtered.length} chunks\n`);

  if (isDryRun) {
    console.log("🔍  Dry-run complete. No writes performed.");
    return;
  }

  if (!sql) {
    console.error("❌  No DB client available.");
    return;
  }

  // Upsert in batches
  const BATCH_SIZE = 50;
  let inserted = 0;
  let skipped = 0;

  for (let i = 0; i < filtered.length; i += BATCH_SIZE) {
    const batch = filtered.slice(i, i + BATCH_SIZE);

    for (const chunk of batch) {
      try {
        const result = await sql`
          INSERT INTO knowledge_chunks (
            chunk_id, doc_id, doc_version, doc_hash, lane,
            status, access, title, section, content, metadata, source_url,
            updated_at
          )
          VALUES (
            ${chunk.chunk_id},
            ${chunk.doc_id},
            ${chunk.doc_version},
            ${chunk.doc_hash},
            ${chunk.lane},
            ${chunk.status},
            ${chunk.access},
            ${chunk.title},
            ${chunk.section},
            ${chunk.content},
            ${JSON.stringify(chunk.metadata)},
            ${chunk.source_url},
            NOW()
          )
          ON CONFLICT (doc_id, chunk_id, doc_hash)
            DO UPDATE SET
              doc_version = EXCLUDED.doc_version,
              lane        = EXCLUDED.lane,
              status      = EXCLUDED.status,
              title       = EXCLUDED.title,
              section     = EXCLUDED.section,
              content     = EXCLUDED.content,
              metadata    = EXCLUDED.metadata,
              source_url  = EXCLUDED.source_url,
              updated_at  = NOW()
          RETURNING id
        `;
        if (result.length) {
          inserted += 1;
        }
      } catch (err) {
        console.warn(`    ⚠  Skipped chunk ${chunk.chunk_id}: ${(err as Error).message}`);
        skipped += 1;
      }
    }


    const done = Math.min(i + BATCH_SIZE, filtered.length);
    process.stdout.write(`\r⏳  Seeding... ${done}/${filtered.length}`);
  }

  console.log(`\n\n✅  Done.`);
  console.log(`    Inserted/updated: ${inserted}`);
  if (skipped) console.log(`    Skipped: ${skipped}`);

  // Go/no-go health check
  console.log("\n📊  Knowledge Lane Health:");
  const health = await sql<{ lane: string; status: string; chunk_count: string; doc_count: string }[]>`
    SELECT
      lane,
      status,
      COUNT(*)               AS chunk_count,
      COUNT(DISTINCT doc_id) AS doc_count
    FROM knowledge_chunks
    GROUP BY lane, status
    ORDER BY lane, status
  `;

  const total = health.reduce((sum, row) => sum + Number(row.chunk_count), 0);
  for (const row of health) {
    console.log(
      `    ${row.lane.padEnd(22)} ${row.status.padEnd(12)} ${String(row.chunk_count).padStart(4)} chunks  ${String(row.doc_count).padStart(3)} docs`,
    );
  }
  console.log(`\n    TOTAL: ${total} chunks`);

  if (total === 0) {
    console.error("\n❌  No chunks in the database — something went wrong.");
    process.exit(1);
  }

  console.log("\n🟢  Go/no-go: PASS");
  await sql.end();
}

// ─── Schema Migration ─────────────────────────────────────────────────────────

async function runSchemaMigration(db: ReturnType<typeof postgres>) {
  const schema = getKnowledgeTableSchema();
  const statements = schema
    .split(";")
    .map((s) => s.trim())
    .filter((s) => s.length > 0 && !s.startsWith("--"));

  for (const statement of statements) {
    try {
      await db.unsafe(statement + ";");
    } catch (err) {
      const msg = (err as Error).message ?? "";
      // Tolerate "already exists" notices — these are idempotent DDL
      const isIdempotent =
        msg.includes("already exists") || msg.includes("does not exist");
      if (isIdempotent) {
        console.log(`    ℹ  Skipped (already applied): ${msg.slice(0, 80)}`);
      } else {
        throw err;
      }
    }
  }
}

// ─── Chunk Builders ───────────────────────────────────────────────────────────

function buildAllChunks(): SeedChunk[] {
  const chunks: SeedChunk[] = [
    ...buildStudioChunks(),
    ...buildAppChunks(),
    ...buildDocChunks(),
    ...buildFaqChunks(),
  ];
  return chunks;
}

// ── Studio Identity & Philosophy ──────────────────────────────────────────────

function buildStudioChunks(): SeedChunk[] {
  const chunks: SeedChunk[] = [];
  const version = "2026-04-01";

  chunks.push(makeChunk({
    doc_id:  "studio.identity",
    section: "Mission & Philosophy",
    lane:    "studio",
    title:   "Northern Step Studio — Identity",
    version,
    content: [
      STUDIO_GLOBAL_CONTEXT,
      `Name: ${STUDIO_IDENTITY.name}`,
      `Tagline: ${STUDIO_IDENTITY.tagline}`,
      `Values: ${STUDIO_IDENTITY.values.join("; ")}`,
      `Public Promise: ${STUDIO_IDENTITY.publicPromise}`,
    ].join("\n"),
    url: "/about",
    meta: { kind: "studio", topic: "identity" },
  }));

  chunks.push(makeChunk({
    doc_id:  "studio.experts",
    section: "Expert Lanes",
    lane:    "studio",
    title:   "Studio Expert Domains",
    version,
    content: STUDIO_EXPERTS.map(
      (e) => `${e.label} (${e.lane}): ${e.summary}\nProducts: ${e.productSlugs.join(", ")}\nKeywords: ${e.keywords.join(", ")}`,
    ).join("\n\n"),
    url: "/apps",
    meta: { kind: "studio", topic: "expert-lanes" },
  }));

  chunks.push(makeChunk({
    doc_id:  "studio.app-families",
    section: "App Portfolio",
    lane:    "studio",
    title:   "Studio App Portfolio Overview",
    version,
    content: STUDIO_APP_FAMILIES.map(
      (f) => `${f.name} (${f.lane}): ${f.summary}\nPath: ${f.path}\nKeywords: ${[...f.keywords, ...f.aliases].join(", ")}`,
    ).join("\n\n"),
    url: "/apps",
    meta: { kind: "studio", topic: "portfolio" },
  }));

  return chunks;
}

// ── Product Catalog ───────────────────────────────────────────────────────────

function buildAppChunks(): SeedChunk[] {
  const chunks: SeedChunk[] = [];
  const version = "2026-04-01";

  for (const app of CATALOG_APPS) {
    const lane = appToLane(app.slug);

    // Core catalog chunk — what the app is
    chunks.push(makeChunk({
      doc_id:  `catalog.${app.slug}`,
      section: "Overview",
      lane,
      title:   `${app.name} — Overview`,
      version,
      content: [
        `${app.name} (${app.statusLabel}) — ${app.category}`,
        `Tagline: ${app.tagline}`,
        `Description: ${app.description}`,
        `Full Description: ${app.fullDescription}`,
        `Platform: ${app.platform}  |  Monetization: ${app.monetization}`,
      ].join("\n"),
      url: app.cta_url ?? `/apps/${app.slug}`,
      meta: { kind: "catalog", slug: app.slug, status: app.statusLabel, platform: app.platform },
    }));

    // Feature chunk — what it does
    chunks.push(makeChunk({
      doc_id:  `catalog.${app.slug}`,
      section: "Features",
      lane,
      title:   `${app.name} — Features`,
      version,
      content: [
        `Product: ${app.name}`,
        `Features:`,
        ...app.features.map((f) => `  - ${f}`),
        `Tech Stack: ${app.techStack.join(", ")}`,
        `Progress: ${app.progressPercent}%`,
        `Progress Items:`,
        ...app.progress.map((p) => `  [${p.completed ? "x" : " "}] ${p.text}`),
      ].join("\n"),
      url: app.cta_url ?? `/apps/${app.slug}`,
      meta: { kind: "features", slug: app.slug, progressPercent: app.progressPercent },
    }));
  }

  return chunks;
}

// ── Documentation Articles ────────────────────────────────────────────────────

function buildDocChunks(): SeedChunk[] {
  const chunks: SeedChunk[] = [];
  const version = "2026-04-01";

  for (const doc of docsArticles) {
    const lane = docCategoryToLane(doc.category);

    // Summary chunk
    chunks.push(makeChunk({
      doc_id:  `doc.${doc.slug}`,
      section: "Summary",
      lane,
      title:   `Doc: ${doc.slug}`,
      version,
      content: `${doc.summary}`,
      url: `/docs/${doc.slug}`,
      meta: { kind: "doc", slug: doc.slug, category: doc.category },
    }));

    // Body chunk (split if long)
    const bodyChunks = chunkText(doc.body, 350, 50);
    for (let idx = 0; idx < bodyChunks.length; idx++) {
      chunks.push(makeChunk({
        doc_id:  `doc.${doc.slug}`,
        section: `Body (${idx + 1}/${bodyChunks.length})`,
        lane,
        title:   `Doc: ${doc.slug}`,
        version,
        content: bodyChunks[idx],
        url: `/docs/${doc.slug}`,
        meta: { kind: "doc-body", slug: doc.slug, category: doc.category, chunkIndex: idx },
      }));
    }
  }

  return chunks;
}

// ── FAQ Entries ───────────────────────────────────────────────────────────────

function buildFaqChunks(): SeedChunk[] {
  const chunks: SeedChunk[] = [];
  const version = "2026-04-01";

  for (const faq of siteFaqEntries) {
    const lane = faqTagsToLane(faq.tags);

    chunks.push(makeChunk({
      doc_id:  `faq.${faq.id}`,
      section: "FAQ",
      lane,
      title:   faq.question,
      version,
      content: `Q: ${faq.question}\nA: ${faq.answer}`,
      url: faq.url,
      meta: { kind: "faq", faqId: faq.id, tags: faq.tags },
    }));
  }

  return chunks;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function makeChunk(opts: {
  doc_id: string;
  section: string;
  lane: string;
  title: string;
  version: string;
  content: string;
  url: string | null;
  meta: Record<string, unknown>;
}): SeedChunk {
  const content = opts.content.trim();
  const hash = sha256(`${opts.doc_id}|${opts.section}|${content}`).slice(0, 16);
  // chunk_id is stable: doc_id + section slug so upsert can dedup reliably
  const chunk_id = slugify(`${opts.doc_id}--${opts.section}`);

  return {
    doc_id:      opts.doc_id,
    chunk_id,
    doc_version: opts.version,
    doc_hash:    hash,
    lane:        opts.lane,
    status:      "active",
    access:      "public",
    title:       opts.title,
    section:     opts.section,
    content,
    metadata:    opts.meta,
    source_url:  opts.url,
  };
}

function sha256(text: string): string {
  return createHash("sha256").update(text, "utf8").digest("hex");
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 120);
}

function chunkText(text: string, maxWords: number, overlapWords: number): string[] {
  const words = text.split(/\s+/).filter(Boolean);
  if (!words.length) return [];
  const chunks: string[] = [];
  const step = Math.max(1, maxWords - overlapWords);
  for (let start = 0; start < words.length; start += step) {
    chunks.push(words.slice(start, start + maxWords).join(" "));
    if (start + maxWords >= words.length) break;
  }
  return chunks;
}

function appToLane(slug: string): string {
  switch (slug) {
    case "nexusbuild":    return "nexusbuild";
    case "provly":        return "provly";
    case "noobs-investing": return "noobs";
    case "neuromoves":    return "neuromove";
    case "pasoscore":     return "pasoscore";
    default:              return "studio";
  }
}

function docCategoryToLane(category: string): string {
  const lower = category.toLowerCase();
  if (lower.includes("nexus"))       return "nexusbuild";
  if (lower.includes("provly"))      return "provly";
  if (lower.includes("noob") || lower.includes("invest")) return "noobs";
  if (lower.includes("neuro") || lower.includes("therapy")) return "neuromove";
  if (lower.includes("paso") || lower.includes("credit")) return "pasoscore";
  if (lower.includes("mctb") || lower.includes("lead") || lower.includes("sms")) return "mctb";
  return "studio";
}

function faqTagsToLane(tags: readonly string[]): string {
  const joined = tags.join(" ").toLowerCase();
  if (joined.includes("nexusbuild") || joined.includes("hardware") || joined.includes("build")) return "nexusbuild";
  if (joined.includes("provly") || joined.includes("inventory") || joined.includes("claim")) return "provly";
  if (joined.includes("noobs") || joined.includes("invest") || joined.includes("finance")) return "noobs";
  if (joined.includes("neuro") || joined.includes("therapy") || joined.includes("ot")) return "neuromove";
  if (joined.includes("paso") || joined.includes("credit") || joined.includes("score")) return "pasoscore";
  if (joined.includes("mctb") || joined.includes("sms") || joined.includes("lead")) return "mctb";
  return "studio";
}

// ─── Run ──────────────────────────────────────────────────────────────────────

main().catch((err) => {
  console.error("\n❌  Seed failed:", err);
  process.exit(1);
});
