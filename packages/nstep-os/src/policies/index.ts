import type {
  AccessDecision,
  ApprovalPolicy,
  GoalInput,
  JobEscalation,
  JobRecord,
  LeadRecoveryAssessment,
  PrincipalRole,
  RiskLevel,
  RouteDecision,
  ToolName,
  WorkflowStep,
} from "../core/types.js";

const RISK_ORDER: Record<RiskLevel, number> = {
  low: 0,
  medium: 1,
  high: 2,
  critical: 3,
};

const ROLE_ORDER: Record<PrincipalRole, number> = {
  viewer: 0,
  analyst: 1,
  operator: 2,
  admin: 3,
  system: 4,
};

const EXTERNAL_TOOLS = new Set<ToolName>(["browser", "sms", "email", "api", "scraping"]);

export function buildApprovalPolicy(
  approvalThreshold: RiskLevel,
  minimumRole: PrincipalRole = "operator",
): ApprovalPolicy {
  return {
    minimumRole,
    approvalThreshold,
    externalActionsRequireApproval: true,
    systemBypassAllowed: true,
  };
}

export function evaluateGoalRisk(goal: GoalInput): RiskLevel {
  const text = `${goal.goal} ${goal.constraints.join(" ")}`.toLowerCase();

  if (/(delete|destroy|payment|refund|send money|wire transfer)/.test(text)) {
    return "critical";
  }

  if (/(sms|email|browser|website|external|contact|call|text|lead)/.test(text)) {
    return "high";
  }

  if (/(research|compare|monitor|scrape|inventory|workflow)/.test(text)) {
    return "medium";
  }

  return goal.priority === "critical" ? "high" : "low";
}

export function evaluateLeadRecoveryRisk(goal: GoalInput): RiskLevel {
  const text = `${goal.goal} ${goal.constraints.join(" ")}`.toLowerCase();

  if (/(delete|destroy|payment|refund|send money|wire transfer)/.test(text)) {
    return "critical";
  }

  if (/(missed call|lead recovery|text back|follow up lead|recover lead|sms|text|call|email)/.test(text)) {
    return goal.mode === "assist" ? "high" : "medium";
  }

  return goal.priority === "critical" ? "high" : "medium";
}

export function evaluateNexusBuildRisk(goal: GoalInput): RiskLevel {
  const text = `${goal.goal} ${goal.constraints.join(" ")}`.toLowerCase();

  if (/(delete|destroy|payment transfer|wire transfer|refund|chargeback)/.test(text)) {
    return "critical";
  }

  if (/(checkout|order now|buy now|purchase|place order|payment|retailer action|submit order)/.test(text)) {
    return "high";
  }

  if (/(compare|comparison|compatibility|bottleneck|benchmark|price|pricing|watch prices|monitor prices|build report|parts list|pc build|gpu|cpu|motherboard|recommend)/.test(text)) {
    return "medium";
  }

  return goal.priority === "critical" ? "high" : "low";
}

export function evaluateProvLyRisk(goal: GoalInput): RiskLevel {
  const text = `${goal.goal} ${goal.constraints.join(" ")}`.toLowerCase();

  if (/(delete|destroy|payment|refund|send money|wire transfer)/.test(text)) {
    return "critical";
  }

  if (/(email reminder|sms reminder|message reminder|follow up|submit claim|claim deadline|export packet|photo extraction|ocr|upload|scan|external)/.test(text)) {
    return goal.mode === "assist" ? "high" : "medium";
  }

  if (/(inventory|documentation|claim packet|claim prep|claim-ready|room review|receipt|photo|missing info|incomplete|high value)/.test(text)) {
    return "medium";
  }

  return goal.priority === "critical" ? "high" : "low";
}

export function evaluateApprovalPolicy(
  goal: GoalInput,
  route: RouteDecision,
  approvalThreshold: RiskLevel = "high",
): AccessDecision {
  const role = goal.requestedByRole || "operator";
  const routeRisk = RISK_ORDER[route.riskLevel];
  const thresholdRisk = RISK_ORDER[approvalThreshold];
  const roleRank = ROLE_ORDER[role];
  const requiresApproval =
    goal.mode === "assist" ||
    route.approvalRequired ||
    routeRisk >= thresholdRisk ||
    (route.lane !== "internal" && roleRank < ROLE_ORDER.operator) ||
    (route.lane === "external" && roleRank < ROLE_ORDER.operator);

  return {
    allowed: true,
    requiresApproval,
    reason: requiresApproval
      ? `Approval required for ${goal.product} because the route is ${route.riskLevel} risk, the mode is ${goal.mode}, or the current role is ${role}.`
      : `Approval not required for ${goal.product}.`,
    requiredRole: requiresApproval && roleRank < ROLE_ORDER.operator ? "operator" : undefined,
  };
}

export function evaluateActionRestriction(
  step: WorkflowStep,
  route: RouteDecision,
  principalRole: PrincipalRole = "operator",
  approvalGranted = false,
): AccessDecision {
  const roleRank = ROLE_ORDER[principalRole];
  const isExternalTool = EXTERNAL_TOOLS.has(step.tool);
  const requiresApproval = Boolean(step.approvalRequired);

  if (principalRole === "viewer") {
    return {
      allowed: false,
      requiresApproval: true,
      reason: "Viewer role cannot execute workflow actions.",
      requiredRole: "operator",
    };
  }

  if (principalRole === "analyst" && isExternalTool) {
    return {
      allowed: false,
      requiresApproval: true,
      reason: `Analyst role cannot execute external ${step.tool} actions.`,
      requiredRole: "operator",
    };
  }

  if (route.riskLevel === "critical" && isExternalTool && roleRank < ROLE_ORDER.admin) {
    return {
      allowed: false,
      requiresApproval: true,
      reason: `${step.tool} is restricted at critical risk.`,
      requiredRole: "admin",
    };
  }

  if (requiresApproval && !approvalGranted) {
    return {
      allowed: false,
      requiresApproval: true,
      reason: `${step.title} requires approval before it can continue.`,
      requiredRole: roleRank < ROLE_ORDER.operator ? "operator" : undefined,
    };
  }

  return {
    allowed: true,
    requiresApproval: false,
    reason: `Action permitted for ${principalRole}.`,
  };
}

export function evaluateTenantIsolation(
  resourceTenantId: string,
  requestedTenantId: string | undefined,
  principalRole: PrincipalRole = "operator",
): AccessDecision {
  if (!requestedTenantId || requestedTenantId === resourceTenantId) {
    return {
      allowed: true,
      requiresApproval: false,
      reason: "Tenant scope matched.",
    };
  }

  if (principalRole === "admin" || principalRole === "system") {
    return {
      allowed: true,
      requiresApproval: false,
      reason: `Tenant mismatch allowed for ${principalRole}.`,
    };
  }

  return {
    allowed: false,
    requiresApproval: false,
    reason: `Tenant ${requestedTenantId} cannot access tenant ${resourceTenantId}.`,
    blockedBy: "tenant-isolation",
  };
}

export function buildJobEscalation(
  job: Pick<JobRecord, "jobId" | "tenantId" | "goal" | "route">,
  reason: string,
  severity: RiskLevel,
  source: JobEscalation["source"],
  ownerRole?: PrincipalRole,
  metadata: Record<string, unknown> = {},
): JobEscalation {
  const now = new Date().toISOString();
  return {
    escalationId: `escalation_${job.jobId}_${Date.now().toString(36)}`,
    jobId: job.jobId,
    tenantId: job.tenantId,
    product: job.goal.product,
    workflow: job.route?.workflow || job.goal.product,
    severity,
    status: "open",
    reason,
    source,
    ownerRole,
    createdAt: now,
    updatedAt: now,
    metadata,
  };
}

export function requiresApproval(route: RouteDecision, goal: GoalInput): boolean {
  return evaluateApprovalPolicy(goal, route).requiresApproval;
}

export function requiresStepApproval(step: WorkflowStep, route: RouteDecision): boolean {
  if (step.approvalRequired) {
    return true;
  }

  return route.riskLevel === "critical" && step.tool !== "database";
}

export function evaluateLeadRecoverySafety(input: LeadRecoveryAssessment): LeadRecoveryAssessment {
  const complianceFlags = new Set(input.complianceFlags);

  if (!input.contactWindowAllowed) {
    complianceFlags.add("outside-business-hours");
  }

  if (!input.contactable) {
    complianceFlags.add("do-not-contact");
  }

  return {
    ...input,
    complianceFlags: [...complianceFlags],
  };
}
