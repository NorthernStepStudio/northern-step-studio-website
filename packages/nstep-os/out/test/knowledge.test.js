import { strict as assert } from "node:assert";
import { randomUUID } from "node:crypto";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import { createDashboardService } from "../dashboard/service.js";
import { createNoopLogger } from "../core/logger.js";
import { createNStepOsRuntime } from "../core/runtime.js";
import { createStage2Agents } from "../agents/index.js";
import { chunkKnowledgeDocument, KNOWLEDGE_LANE_SPECS, searchKnowledgeChunks } from "../knowledge/index.js";
import { startNStepOsServer } from "../server.js";
import { makeRuntimeConfig, makeRuntimeStores } from "./fixtures.js";
const sampleSource = {
    sourcePath: "docs/studio-knowledge.md",
    markdown: `# Studio Knowledge

The docs are the source of truth for the studio runtime.

## Ingestion

The seeded fallback corpus should be replaced by real studio docs.

## Search

Search should retrieve the right section from knowledge_chunks.
`,
};
test("knowledge chunking preserves headings and summaries", () => {
    const chunks = chunkKnowledgeDocument(sampleSource);
    assert.equal(chunks.length, 3);
    assert.equal(chunks[0]?.sourceTitle, "Studio Knowledge");
    assert.equal(chunks[0]?.sectionPath, "Studio Knowledge");
    assert.equal(chunks[1]?.sectionPath, "Studio Knowledge > Ingestion");
    assert.match(chunks[1]?.summary || "", /seeded fallback corpus/);
    assert.notEqual(chunks[0]?.id, chunks[1]?.id);
});
test("knowledge search ranks the most relevant chunk first", () => {
    const chunks = chunkKnowledgeDocument(sampleSource);
    const results = searchKnowledgeChunks("seeded fallback corpus", chunks, 2);
    assert.ok(results.length >= 1);
    assert.equal(results[0]?.sectionPath, "Studio Knowledge > Ingestion");
    assert.match(results[0]?.excerpt || "", /seeded fallback corpus/);
});
test("knowledge search route reads from the runtime knowledge store", async () => {
    const dataDir = mkdtempSync(join(tmpdir(), `nstep-os-knowledge-${randomUUID()}-`));
    const runtime = await createNStepOsRuntime(makeRuntimeConfig({
        dataDir,
        executionMode: "inline",
        database: {
            provider: "file",
        },
        browser: {
            provider: "mock",
        },
        sms: {
            provider: "mock",
        },
        auth: {
            internalToken: "test-token",
        },
    }));
    const chunks = chunkKnowledgeDocument(sampleSource);
    await runtime.stores.knowledge.save(chunks);
    const started = await startNStepOsServer(runtime, 0);
    try {
        const response = await fetch(`http://127.0.0.1:${started.port}/v1/knowledge/search?q=seeded%20fallback%20corpus&limit=2`, {
            headers: {
                authorization: "Bearer test-token",
                "x-nstep-role": "system",
            },
        });
        assert.equal(response.status, 200);
        const payload = (await response.json());
        assert.equal(payload.query, "seeded fallback corpus");
        assert.equal(payload.count, 1);
        assert.equal(payload.matches[0]?.sourcePath, "docs/studio-knowledge.md");
        assert.equal(payload.matches[0]?.sectionPath, "Studio Knowledge > Ingestion");
        assert.ok((payload.matches[0]?.score || 0) > 0);
    }
    finally {
        await started.close();
        rmSync(dataDir, { recursive: true, force: true });
    }
});
test("source gatherer prefers knowledge chunks over seeded sources", async () => {
    const stores = makeRuntimeStores();
    await stores.knowledge.save(chunkKnowledgeDocument(sampleSource));
    const agents = createStage2Agents({
        config: makeRuntimeConfig(),
        logger: createNoopLogger(),
        stores,
    });
    const result = await agents.sourceGatherer.gatherSources({
        subject: "seeded fallback corpus",
        seedSources: ["Fallback corpus reference", "https://example.com/fallback"],
        maxSources: 2,
        constraints: ["source of truth"],
    });
    assert.equal(result.sources[0]?.kind, "document");
    assert.match(result.sources[0]?.title || "", /Studio Knowledge/);
    assert.match(result.sources[0]?.excerpt || "", /seeded fallback corpus/);
    assert.equal(result.sources.some((source) => source.kind !== "document"), false);
});
test("knowledge coverage surfaces lane doc counts in health and dashboard", async () => {
    const dataDir = mkdtempSync(join(tmpdir(), `nstep-os-coverage-${randomUUID()}-`));
    const runtime = await createNStepOsRuntime(makeRuntimeConfig({
        dataDir,
        executionMode: "inline",
        database: {
            provider: "file",
        },
        browser: {
            provider: "mock",
        },
        sms: {
            provider: "mock",
        },
        auth: {
            internalToken: "test-token",
        },
    }), {
        logger: createNoopLogger(),
    });
    const chunks = KNOWLEDGE_LANE_SPECS.slice(0, 6).flatMap((spec) => chunkKnowledgeDocument({
        sourcePath: spec.sourcePath,
        title: spec.title,
        markdown: `# ${spec.title}\n\nThis lane document anchors ${spec.title} retrieval.\n\n## Scope\n\nAuthoritative content for ${spec.title}.\n`,
    }));
    await runtime.stores.knowledge.save(chunks);
    try {
        const health = await runtime.health();
        const healthKnowledge = health.knowledge;
        assert.equal(healthKnowledge.totalDocuments, 6);
        assert.equal(healthKnowledge.coverage.expectedLaneDocuments, 7);
        assert.equal(healthKnowledge.coverage.presentLaneDocuments, 6);
        assert.equal(healthKnowledge.coverage.missingLaneDocuments, 1);
        assert.equal(healthKnowledge.coverage.coveragePercent, 86);
        assert.equal(healthKnowledge.coverage.lanes.filter((lane) => lane.present).length, 6);
        const dashboardService = createDashboardService(runtime.stores, runtime.config, runtime.orchestrator);
        const overview = await dashboardService.overview();
        assert.equal(overview.snapshot.knowledge.expectedLaneDocuments, 7);
        assert.equal(overview.snapshot.knowledge.presentLaneDocuments, 6);
        assert.equal(overview.snapshot.knowledge.missingLaneDocuments, 1);
        assert.equal(overview.snapshot.knowledge.coveragePercent, 86);
        const coverageCard = overview.summaryCards.find((card) => card.label === "Knowledge coverage");
        const missingCard = overview.summaryCards.find((card) => card.label === "Missing lane docs");
        assert.equal(coverageCard?.value, "86%");
        assert.equal(missingCard?.value, 1);
    }
    finally {
        rmSync(dataDir, { recursive: true, force: true });
    }
});
//# sourceMappingURL=knowledge.test.js.map