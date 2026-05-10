/**
 * StudioOS Platform Standardized Contracts (Phase 21 Hardening)
 * 
 * These contracts define the unified schema for all platform services,
 * ensuring consistency across UI, ViewModels, and Operational Engines.
 */

/**
 * Standardized Severity Schema
 * Used for: Incidents, Risks, Timeline, Intelligence, Governance
 */
export type StudioSeverity = "low" | "medium" | "high" | "critical" | "info";

/**
 * Standardized Operational Status
 * Used for: Apps, Workflows, Jobs, Deployments
 */
export type OperationalStatus = 
  | "online" 
  | "offline" 
  | "degraded" 
  | "maintenance" 
  | "running" 
  | "completed" 
  | "failed" 
  | "waiting_approval"
  | "cancelled"
  | "pending";

/**
 * Standardized Verification State
 * Used for: Governance, Integrity, Readiness
 */
export type VerificationState = "pass" | "warn" | "fail" | "unknown" | "checking";

/**
 * Standardized Evidence Model
 * Used for: Matterhorn reasoning, audits, incident investigations
 */
export interface StudioEvidence {
  id: string;
  source: string; // Service or Tool that produced the evidence
  type: "telemetry" | "snapshot" | "log" | "finding" | "metric" | "contract";
  at: string; // ISO Timestamp
  data: Record<string, unknown>; // Raw evidence context
  confidence: number; // 0.0 to 1.0
  validUntil?: string; // Cache expiration
}

/**
 * Standardized Causality Link
 * Used for: Timeline, Knowledge Graph, Incident correlation
 */
export interface CausalityLink {
  sourceId: string;
  targetId: string;
  relation: "causes" | "precedes" | "triggers" | "resolves" | "associates";
  strength: number; // 0.0 to 1.0
}

/**
 * Platform Performance Budget Limits (Phase 21)
 */
export const PLATFORM_BUDGET = {
  TIMELINE_SIZE_LIMIT: 500,
  MEMORY_RETENTION_DAYS: 30,
  GRAPH_NODE_LIMIT: 1000,
  GRAPH_EDGE_LIMIT: 5000,
  VERIFICATION_TIMEOUT_MS: 30000,
  MATTERHORN_LATENCY_BUDGET_MS: 5000,
  UI_RENDER_BUDGET_MS: 100,
  EXECUTION_QUEUE_LIMIT: 50
};
