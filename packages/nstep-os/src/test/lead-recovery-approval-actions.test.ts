import { strict as assert } from "node:assert";
import { randomUUID } from "node:crypto";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import { createNStepOsRuntime } from "../core/runtime.js";
import { makeRuntimeConfig } from "./fixtures.js";
import { startNStepOsServer } from "../server.js";

test("Lead Recovery approvals can be approved or rejected through the backend API", async () => {
  const dataDir = mkdtempSync(join(tmpdir(), `nstep-os-approval-${randomUUID()}-`));
  const runtime = await createNStepOsRuntime(
    makeRuntimeConfig({
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
    }),
  );
  const server = await startNStepOsServer(runtime, 0);

  try {
    const approvalJob = await runLeadRecoveryJob(server.port);
    const approvalStepId = getWaitingApprovalStepId(approvalJob);

    const approved = await mutateJobApproval(server.port, approvalJob.jobId, approvalStepId, "approve", approvalJob.tenantId);
    assert.equal(approved.status, "completed");
    assert.equal(approved.approvalStatus, "approved");
    assert.equal(approved.result?.status, "succeeded");

    const rejectJob = await runLeadRecoveryJob(server.port, "tenant-reject");
    const rejectStepId = getWaitingApprovalStepId(rejectJob);

    const rejected = await mutateJobApproval(server.port, rejectJob.jobId, rejectStepId, "reject", rejectJob.tenantId);
    assert.equal(rejected.status, "failed");
    assert.equal(rejected.approvalStatus, "rejected");
    assert.match(rejected.error || "", /Rejected from dashboard|Approval rejected/);

    const queueEntry = await runtime.stores.queue.get(rejectJob.jobId);
    assert.equal(queueEntry?.status, "failed");
  } finally {
    await server.close();
    rmSync(dataDir, { recursive: true, force: true });
  }
});

async function runLeadRecoveryJob(
  port: number,
  tenantId = "tenant-alpha",
): Promise<{
  readonly jobId: string;
  readonly tenantId: string;
  readonly status: string;
  readonly approvalStatus: string;
  readonly result?: { readonly status?: string };
  readonly steps: readonly { readonly id: string; readonly status: string }[];
}> {
  const response = await fetch(`http://127.0.0.1:${port}/v1/workflows/lead-recovery/run`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: "Bearer test-token",
      "x-nstep-role": "operator",
      "x-nstep-tenant-id": tenantId,
      "x-nstep-actor-id": "dashboard-admin",
    },
    body: JSON.stringify({
      goal: {
        goal: "Recover a missed call lead.",
        product: "lead-recovery",
        priority: "high",
        constraints: ["do not message leads contacted in the last 48 hours", "use a business-safe tone"],
        mode: "assist",
        tenantId,
        requestedBy: "dashboard-admin",
        requestedByRole: "operator",
        source: "system",
        payload: {
          leadRecovery: {
            goal: "Recover a missed call lead.",
            event: {
              eventId: `event_${tenantId}`,
              tenantId,
              callerPhone: "+15551234567",
              calledNumber: "+15557654321",
              missedAt: "2026-04-03T00:00:00.000Z",
              source: "manual",
              metadata: {
                channel: "lead-recovery-smoke",
              },
            },
            brand: {
              businessName: "Northern Step Studio",
              primaryNumber: "+15557654321",
              callbackNumber: "+15557654321",
              smsFromNumber: "+15557654321",
              timeZone: "America/New_York",
              tone: "business-safe",
              doNotContactWindowHours: 48,
            },
            lead: {
              leadId: `lead_${tenantId}`,
              tenantId,
              phone: "+15551234567",
              stage: "new",
              doNotContact: false,
              communicationTone: "business-safe",
              contactedWithin48h: false,
              metadata: {},
            },
          },
        },
      },
    }),
  });

  assert.equal(response.status, 200);
  const body = (await response.json()) as {
    readonly job: {
      readonly jobId: string;
      readonly tenantId: string;
      readonly status: string;
      readonly approvalStatus: string;
      readonly result?: { readonly status?: string };
      readonly steps: readonly { readonly id: string; readonly status: string }[];
    };
  };
  assert.equal(body.job.status, "waiting_approval");
  assert.equal(body.job.approvalStatus, "pending");
  return body.job;
}

async function mutateJobApproval(
  port: number,
  jobId: string,
  stepId: string,
  action: "approve" | "reject",
  tenantId: string,
): Promise<{ readonly status: string; readonly approvalStatus: string; readonly result?: { readonly status?: string }; readonly error?: string }> {
  const response = await fetch(`http://127.0.0.1:${port}/v1/jobs/${jobId}/${action}`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: "Bearer test-token",
      "x-nstep-role": "operator",
      "x-nstep-tenant-id": "tenant-alpha",
      "x-nstep-actor-id": "dashboard-admin",
    },
    body: JSON.stringify({
      stepId,
      tenantId,
      reason: action === "reject" ? "Rejected from dashboard." : undefined,
    }),
  });

  assert.equal(response.status, 200);
  const body = (await response.json()) as {
    readonly job: {
      readonly status: string;
      readonly approvalStatus: string;
      readonly result?: { readonly status?: string };
      readonly error?: string;
    };
  };
  return body.job;
}

function getWaitingApprovalStepId(job: { readonly steps: readonly { readonly id: string; readonly status: string }[] }): string {
  const step = job.steps.find((item) => item.status === "waiting_approval");
  assert.ok(step, "Expected a waiting approval step.");
  return step.id;
}
