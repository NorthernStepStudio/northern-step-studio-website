export type SafeOperationType = 
  | "create_snapshot" 
  | "run_verification" 
  | "refresh_health" 
  | "diagnostic_scan" 
  | "generate_checklist" 
  | "restart_bridge" 
  | "clear_temp_cache" 
  | "validate_build" 
  | "repo_audit";

export interface SafeOperation {
  readonly type: SafeOperationType;
  readonly label: string;
  readonly description: string;
  readonly riskLevel: "low" | "medium";
  readonly requiresApproval: boolean;
  readonly impact: string;
}

export const SAFE_OPERATIONS: Record<SafeOperationType, SafeOperation> = {
  create_snapshot: {
    type: "create_snapshot",
    label: "Create Snapshot",
    description: "Capture the current operational state and file integrity hashes.",
    riskLevel: "low",
    requiresApproval: false,
    impact: "System state persisted to snapshot registry."
  },
  run_verification: {
    type: "run_verification",
    label: "Run Verification Pass",
    description: "Execute all governance and safety verification checks.",
    riskLevel: "low",
    requiresApproval: false,
    impact: "Verification scores updated across the dashboard."
  },
  refresh_health: {
    type: "refresh_health",
    label: "Refresh Health Telemetry",
    description: "Force a refresh of all app health and connectivity states.",
    riskLevel: "low",
    requiresApproval: false,
    impact: "Dashboard health indicators updated."
  },
  diagnostic_scan: {
    type: "diagnostic_scan",
    label: "Trigger Diagnostic Scan",
    description: "Run non-destructive diagnostics on bridge and app connectivity.",
    riskLevel: "low",
    requiresApproval: false,
    impact: "Diagnostic logs generated for investigation."
  },
  generate_checklist: {
    type: "generate_checklist",
    label: "Generate Deployment Checklist",
    description: "Produce a verification-backed checklist for production release.",
    riskLevel: "low",
    requiresApproval: false,
    impact: "Checklist generated and persisted to operational memory."
  },
  restart_bridge: {
    type: "restart_bridge",
    label: "Restart Local Bridge",
    description: "Safely cycle the local Synox bridge connection.",
    riskLevel: "medium",
    requiresApproval: true,
    impact: "Temporary loss of Matterhorn connectivity during cycle."
  },
  clear_temp_cache: {
    type: "clear_temp_cache",
    label: "Clear Temp Caches",
    description: "Clear non-essential operational and build caches.",
    riskLevel: "low",
    requiresApproval: true,
    impact: "Disk space reclaimed, next build may be slower."
  },
  validate_build: {
    type: "validate_build",
    label: "Run Build Validation",
    description: "Verify the integrity and safety of a specific build artifact.",
    riskLevel: "low",
    requiresApproval: false,
    impact: "Build status updated to 'validated' in registry."
  },
  repo_audit: {
    type: "repo_audit",
    label: "Generate Repo Audit",
    description: "Perform a comprehensive audit of repository structure and drift.",
    riskLevel: "low",
    requiresApproval: false,
    impact: "Audit report generated and linked to governance center."
  }
};
