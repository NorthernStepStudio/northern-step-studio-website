import type { WorkflowPlan, WorkflowPlanningContext, WorkflowStep } from "../../core/types.js";
import { buildLeadRecoveryAssessment } from "./assessment.js";
import type { LeadRecoveryInput } from "../../core/types.js";
import { STEP_TYPES } from "./models.js";
import { formatDateTime } from "./records.js";

export function planLeadRecovery(input: LeadRecoveryInput, context: WorkflowPlanningContext): WorkflowPlan {
  const assessment = buildLeadRecoveryAssessment(input);

  const steps: WorkflowStep[] = [
    {
      id: "s1",
      type: STEP_TYPES.captureEvent,
      title: "Capture the missed call event",
      tool: "database",
      dependsOn: [],
      input: {
        eventId: input.event.eventId,
        tenantId: input.event.tenantId,
      },
    },
    {
      id: "s2",
      type: STEP_TYPES.loadLead,
      title: "Load caller history and lead metadata",
      tool: "database",
      dependsOn: ["s1"],
      input: {
        phone: input.event.callerPhone,
      },
    },
    {
      id: "s3",
      type: STEP_TYPES.assess,
      title: "Check suppression rules and contact timing",
      tool: "llm",
      dependsOn: ["s2"],
      input: {
        assessment,
      },
    },
    {
      id: "s4",
      type: STEP_TYPES.draft,
      title: "Generate the SMS draft",
      tool: "llm",
      dependsOn: ["s3"],
      input: {},
    },
    {
      id: "s5",
      type: STEP_TYPES.send,
      title: "Send the SMS through Twilio",
      tool: "sms",
      dependsOn: ["s4"],
      input: {
        to: input.event.callerPhone,
        from: input.brand.smsFromNumber,
      },
      approvalRequired: context.route.approvalRequired || assessment.approvalRequired || !assessment.contactable,
      retryable: true,
    },
    {
      id: "s6",
      type: STEP_TYPES.verify,
      title: "Verify delivery or failure state",
      tool: "sms",
      dependsOn: ["s5"],
      input: {},
    },
    {
      id: "s7",
      type: STEP_TYPES.log,
      title: "Log the interaction and lead status",
      tool: "database",
      dependsOn: ["s6"],
      input: {},
    },
    {
      id: "s8",
      type: STEP_TYPES.remember,
      title: "Update workflow memory",
      tool: "memory",
      dependsOn: ["s7"],
      input: {},
    },
    {
      id: "s9",
      type: STEP_TYPES.report,
      title: "Build the dashboard result",
      tool: "api",
      dependsOn: ["s8"],
      input: {},
    },
  ];

  return {
    workflow: "lead-recovery",
    jobId: "pending",
    steps,
    approvalsRequired: assessment.approvalRequired || !assessment.contactable,
    summary: `Lead Recovery workflow for ${input.event.callerPhone} after a missed call at ${formatDateTime(input.event.missedAt)}.`,
  };
}
