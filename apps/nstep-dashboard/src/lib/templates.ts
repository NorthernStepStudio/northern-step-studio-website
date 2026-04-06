import type { GoalInput } from "./types";

export type GoalDraft = {
  goal: string;
  product: "lead-recovery" | "nexusbuild" | "provly" | "neurormoves";
  priority: "low" | "medium" | "high" | "critical";
  mode: "assist" | "autonomous";
  tenantId: string;
  requestedBy: string;
  constraints: string;
  payloadText: string;
};

export const PRODUCT_ORDER: GoalDraft["product"][] = ["lead-recovery", "nexusbuild", "provly", "neurormoves"];

export function buildTemplate(product: GoalDraft["product"]): GoalDraft {
  switch (product) {
    case "lead-recovery":
      return buildLeadRecoveryTemplate();
    case "nexusbuild":
      return buildNexusBuildTemplate();
    case "provly":
      return buildProvLyTemplate();
    case "neurormoves":
      return buildNeuroMovesTemplate();
  }
}

export function goalDraftToGoalInput(goal: GoalDraft): GoalInput {
  return {
    goal: goal.goal.trim(),
    product: goal.product,
    priority: goal.priority,
    constraints: goal.constraints
      .split("\n")
      .map((item) => item.trim())
      .filter(Boolean),
    mode: goal.mode,
    tenantId: goal.tenantId.trim(),
    requestedBy: goal.requestedBy.trim() || undefined,
    source: "user",
    payload: goal.payloadText.trim() ? (JSON.parse(goal.payloadText) as Record<string, unknown>) : undefined,
  };
}

export function buildLeadRecoveryTemplate(): GoalDraft {
  return {
    goal: "Recover missed leads from phone calls",
    product: "lead-recovery",
    priority: "high",
    mode: "assist",
    tenantId: "tenant_alpha",
    requestedBy: "operator@nstep",
    constraints: "Do not message leads contacted in the last 48 hours.\nUse a business-safe tone.\nKeep the reply under 320 characters.",
    payloadText: JSON.stringify(
      {
        leadRecovery: {
          event: {
            eventId: "twilio_evt_001",
            tenantId: "tenant_alpha",
            callerPhone: "+15551234567",
            calledNumber: "+15559876543",
            missedAt: new Date().toISOString(),
            callSid: "CA_00000000000000000000000000000000",
            source: "webhook",
            metadata: {
              campaign: "inbound-missed-call",
              urgent: false,
            },
          },
          brand: {
            businessName: "NStep Lead Recovery",
            primaryNumber: "+15559876543",
            callbackNumber: "+15559876543",
            smsFromNumber: "+15559876543",
            timeZone: "America/New_York",
            tone: "business-safe",
            doNotContactWindowHours: 48,
            signature: "NStepOS",
            followupTemplate: "",
          },
        },
      },
      null,
      2,
    ),
  };
}

export function buildNexusBuildTemplate(): GoalDraft {
  return {
    goal: "Research live PC part prices and compare compatibility",
    product: "nexusbuild",
    priority: "high",
    mode: "assist",
    tenantId: "tenant_alpha",
    requestedBy: "operator@nstep",
    constraints: "Use live web sources.\nPrefer current retail listings.\nFlag compatibility risks clearly.",
    payloadText: JSON.stringify(
      {
        nexusbuild: {
          query: "mini ITX gaming build under $1500",
          sources: ["https://www.newegg.com/", "https://www.bhphotovideo.com/", "https://pcpartpicker.com/"],
          targetBuild: {
            budget: 1500,
            currency: "USD",
            cpu: "AMD Ryzen 7",
            gpu: "RTX 4070 SUPER",
          },
          watchlist: [
            {
              label: "CPU price watch",
              url: "https://pcpartpicker.com/",
            },
          ],
        },
      },
      null,
      2,
    ),
  };
}

export function buildProvLyTemplate(): GoalDraft {
  return {
    goal: "Prepare a claim packet and track missing inventory documents",
    product: "provly",
    priority: "high",
    mode: "assist",
    tenantId: "tenant_alpha",
    requestedBy: "operator@nstep",
    constraints: "Keep the tone reassuring.\nDo not invent documents.\nOnly send reminders for missing items.",
    payloadText: JSON.stringify(
      {
        provly: {
          caseId: "case_1024",
          claimantName: "Jordan Smith",
          claimType: "home inventory",
          inventoryCount: 18,
          missingDocuments: ["purchase receipt for TV", "serial number photo for laptop"],
          reminderEmail: "customer@example.com",
          policyDeadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        },
      },
      null,
      2,
    ),
  };
}

export function buildNeuroMovesTemplate(): GoalDraft {
  return {
    goal: "Generate a family support routine and follow-up plan",
    product: "neurormoves",
    priority: "medium",
    mode: "assist",
    tenantId: "tenant_alpha",
    requestedBy: "operator@nstep",
    constraints: "Keep guidance practical.\nAvoid clinical language.\nInclude a simple next check-in.",
    payloadText: JSON.stringify(
      {
        neurormoves: {
          childName: "Avery",
          ageGroup: "school-age",
          focus: "morning routine",
          strengths: ["visual cues", "short checklists"],
          challenges: ["transition delays", "task initiation"],
          preferredTone: "warm",
          parentEmail: "parent@example.com",
          nextCheckInDays: 5,
        },
      },
      null,
      2,
    ),
  };
}
