import { strict as assert } from "node:assert";
import { randomUUID } from "node:crypto";
import { createServer } from "node:http";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import { createNStepOsRuntime } from "../core/runtime.js";
import { makeRuntimeConfig } from "./fixtures.js";
import { startNStepOsServer } from "../server.js";
test("shared adapter workflow runs end-to-end through the backend and adapter path", async () => {
    const dataDir = mkdtempSync(join(tmpdir(), `nstep-os-shared-${randomUUID()}-`));
    const { server: healthServer, port: healthPort } = await startHealthServer();
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
    const started = await startNStepOsServer(runtime, 0);
    try {
        const response = await fetch(`http://127.0.0.1:${started.port}/v1/workflows/shared/run`, {
            method: "POST",
            headers: {
                "content-type": "application/json",
                authorization: "Bearer test-token",
                "x-nstep-role": "system",
                "x-nstep-tenant-id": "tenant-shared",
            },
            body: JSON.stringify({
                goal: "Run the neutral adapter sample.",
                tenantId: "tenant-shared",
                requestedBy: "shared-smoke",
                label: "shared-smoke",
                healthUrl: `http://127.0.0.1:${healthPort}/health`,
                mode: "autonomous",
                priority: "low",
            }),
        });
        assert.equal(response.status, 200);
        const payload = (await response.json());
        const job = payload.job;
        assert.equal(job.route.workflow, "shared");
        assert.equal(job.plan.workflow, "shared");
        assert.equal(job.status, "completed");
        assert.equal(job.result.status, "succeeded");
        assert.equal(job.steps.length, 3);
        assert.deepEqual(job.steps.map((step) => step.status), ["completed", "completed", "completed"]);
        assert.equal(job.steps[0].tool, "database");
        assert.equal(job.steps[1].tool, "api");
        assert.equal(job.steps[2].tool, "browser");
        assert.equal(job.steps[0].result.status, "completed");
        assert.equal(job.steps[0].result.output.rowCount, 0);
        assert.equal(job.steps[1].result.output.json.source, "shared-test");
        assert.match(String(job.steps[2].result.output.text || ""), /shared-test/);
        assert.equal(healthServerRequests, 2);
    }
    finally {
        await started.close();
        await closeServer(healthServer);
        rmSync(dataDir, { recursive: true, force: true });
    }
});
let healthServerRequests = 0;
async function startHealthServer() {
    const server = createServer((request, response) => {
        const url = new URL(request.url || "/", "http://127.0.0.1");
        if (url.pathname !== "/health") {
            response.statusCode = 404;
            response.end("not found");
            return;
        }
        healthServerRequests += 1;
        response.statusCode = 200;
        response.setHeader("content-type", "application/json; charset=utf-8");
        response.end(JSON.stringify({
            status: "ok",
            source: "shared-test",
            hit: healthServerRequests,
        }));
    });
    const port = await listen(server);
    return { server, port };
}
function listen(server) {
    return new Promise((resolve, reject) => {
        server.once("error", reject);
        server.listen(0, "127.0.0.1", () => {
            const address = server.address();
            if (!address || typeof address === "string") {
                reject(new Error("Failed to bind health test server."));
                return;
            }
            resolve(address.port);
        });
    });
}
function closeServer(server) {
    return new Promise((resolve, reject) => {
        server.close((error) => {
            if (error) {
                reject(error);
                return;
            }
            resolve();
        });
    });
}
//# sourceMappingURL=shared-workflow.test.js.map