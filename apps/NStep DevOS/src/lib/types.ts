export type ProjectStatus = "active" | "completed";

export type MilestoneStatus = "active" | "completed";

export type TaskStatus =
  | "ready"
  | "in_progress"
  | "needs_retry"
  | "needs_review"
  | "blocked"
  | "completed";

export type RunStatus =
  | "waiting_on_provider"
  | "awaiting_submission"
  | "accepted"
  | "needs_retry"
  | "needs_review"
  | "rollback_required";

export type AgentResultStatus =
  | "succeeded"
  | "failed"
  | "blocked"
  | "timed_out"
  | "cancelled";

export type ManualProvider =
  | "codex-app"
  | "antigravity"
  | "ollama-code"
  | "manual-other";
export type ConnectedProvider =
  | "mock-connected"
  | "codex-api"
  | "antigravity-api"
  | "ollama-code-api";
export type RunProvider = ManualProvider | ConnectedProvider;
export type ExecutionMode = "manual" | "connected";
export type ProviderConnectionStatus =
  | "not_configured"
  | "mock_ready"
  | "configured";

export type ProviderRunState =
  | "staged"
  | "running"
  | "ready_for_fallback"
  | "completed";

export type ResultSource = "manual_paste" | "connected_auto_ingest";

export type VerificationOutcome =
  | "accepted"
  | "retry_required"
  | "rollback_required"
  | "human_review_required";

export type EngineeringMemoryType = "success" | "mistake";

export type DecisionAction =
  | "accept_task"
  | "generate_next_task"
  | "retry_task"
  | "request_human_review"
  | "rollback_run"
  | "complete_milestone";

export type InterventionAction =
  | "approve_and_continue"
  | "request_retry_with_guidance"
  | "mark_rollback_complete"
  | "resume_task";

export type VerificationCommand = {
  key: string;
  label: string;
  command: string;
  cwd?: string;
};

export type ProviderConfig = {
  manualProvider: ManualProvider;
  connectedProvider: ConnectedProvider;
  connectionStatus: ProviderConnectionStatus;
  baseUrl?: string;
  model?: string;
  apiKeyHint?: string;
  autoDispatchEnabled: boolean;
  autoIngestEnabled: boolean;
  autopilotEnabled: boolean;
};

export type StructuredSpec = {
  summary: string;
  productType: string;
  primaryLoop: string;
  risks: string[];
  notes: string[];
};

export type Milestone = {
  id: string;
  key: string;
  title: string;
  goal: string;
  status: MilestoneStatus;
  successCriteria: string[];
};

export type TaskBlueprint = {
  key: string;
  milestoneKey: string;
  title: string;
  objective: string;
  instructions: string;
  acceptanceCriteria: string[];
  allowedPaths: string[];
  forbiddenPaths: string[];
};

export type MilestoneBlueprint = {
  key: string;
  title: string;
  goal: string;
  successCriteria: string[];
  taskBlueprints: TaskBlueprint[];
};

export type Task = {
  id: string;
  milestoneId: string;
  orderIndex: number;
  title: string;
  objective: string;
  instructions: string;
  acceptanceCriteria: string[];
  allowedPaths: string[];
  forbiddenPaths: string[];
  status: TaskStatus;
  attemptCount: number;
  supervisorGuidance?: string;
  supervisorGuidanceUpdatedAt?: string;
  createdAt: string;
  completedAt?: string;
};

export type TaskPacket = {
  taskId: string;
  taskTitle: string;
  objective: string;
  instructions: string;
  acceptanceCriteria: string[];
  allowedPaths: string[];
  forbiddenPaths: string[];
  verificationCommands: VerificationCommand[];
};

export type FileChange = {
  path: string;
  changeType: "added" | "modified" | "deleted" | "renamed";
  oldPath?: string;
  summary: string;
};

export type RepoFileSignature = {
  path: string;
  hash: string;
  size: number;
};

export type CommandReport = {
  key: string;
  command: string;
  cwd?: string;
  status: "passed" | "failed" | "skipped" | "not_run";
  exitCode?: number;
  durationMs?: number;
  stdoutText?: string;
  stderrText?: string;
};

export type BlockerReport = {
  type:
    | "missing_context"
    | "verification_failure"
    | "scope_conflict"
    | "repo_error"
    | "command_error"
    | "unknown";
  title: string;
  description: string;
  requestedDecision: string;
  retryable: boolean;
  relatedPaths?: string[];
};

export type WorkspaceIssue = {
  severity: "info" | "warning" | "error";
  message: string;
};

export type RepoBranchState = "clean" | "dirty" | "unknown";

export type RepoStatusCode =
  | "modified"
  | "added"
  | "deleted"
  | "renamed"
  | "copied"
  | "untracked"
  | "ignored"
  | "unknown";

export type RepoStatusEntry = {
  path: string;
  oldPath?: string;
  indexStatus: string;
  workingTreeStatus: string;
  statusCode: RepoStatusCode;
};

export type RepoSnapshot = {
  available: boolean;
  repoPath: string;
  capturedAt: string;
  runId: string;
  taskId: string;
  repoDetected: boolean;
  gitRepo: boolean;
  branchName?: string;
  branchState: RepoBranchState;
  statusShort: string[];
  statusEntries: RepoStatusEntry[];
  diffNameOnly: string[];
  untrackedFiles: string[];
  fileSignatures: RepoFileSignature[];
  issues: WorkspaceIssue[];
};

export type RepoComparison = {
  matchedFiles: string[];
  missingReportedFiles: string[];
  unexpectedActualFiles: string[];
  outsideAllowedFiles: string[];
  forbiddenFiles: string[];
  untrackedFiles: string[];
  integrityWarnings: string[];
};

export type LocalRepoCheck = {
  available: boolean;
  checkedAt: string;
  repoPath: string;
  repoDetected: boolean;
  gitRepo: boolean;
  branchName?: string;
  branchState: RepoBranchState;
  snapshotBefore?: RepoSnapshot;
  snapshotAfter?: RepoSnapshot;
  actualChangedFiles: FileChange[];
  actualChangedPaths: string[];
  untrackedFiles: string[];
  comparison: RepoComparison;
  commands: CommandReport[];
  issues: WorkspaceIssue[];
};

export type WorkspaceSnapshot = RepoSnapshot;
export type WorkspaceSnapshotEntry = RepoFileSignature;
export type LocalWorkspaceCheck = LocalRepoCheck;

export type AgentExecutionResult = {
  schemaVersion: "1.0";
  runId: string;
  taskId?: string;
  taskTitle?: string;
  provider: string;
  providerRunId?: string;
  status: AgentResultStatus;
  summary: string;
  completionState: {
    objectiveAddressed: boolean;
    acceptanceCriteriaStatus: Array<{
      criterion: string;
      status: "met" | "partially_met" | "not_met";
      note?: string;
    }>;
  };
  changedFiles: FileChange[];
  commands: CommandReport[];
  blocker?: BlockerReport;
  rawOutputText?: string;
  startedAt?: string;
  completedAt?: string;
};

export type VerificationFinding = {
  severity: "info" | "warning" | "error" | "critical";
  category:
    | "acceptance"
    | "allowed_files"
    | "forbidden_files"
    | "build"
    | "test"
    | "blocker"
    | "scope_expansion"
    | "deliverables"
    | "workspace"
    | "payload";
  message: string;
  paths?: string[];
};

export type VerificationResult = {
  outcome: VerificationOutcome;
  checkedAt: string;
  findings: VerificationFinding[];
  score: {
    acceptance: number;
    scope: number;
    commands: number;
    integrity: number;
    overall: number;
  };
};

export type EngineeringMemoryRecord = {
  id: string;
  memoryType: EngineeringMemoryType;
  pattern: string;
  title: string;
  files: string[];
  successfulStrategy?: string;
  mistakeToAvoid?: string;
  knownError?: string;
  recommendedFix?: string;
  confidence?: number;
  repoConventions?: string[];
  verificationResult: VerificationOutcome;
  exampleFiles: string[];
  occurrenceCount: number;
  sourceProjectId: string;
  sourceTaskId: string;
  sourceTaskTitle: string;
  sourceRunId: string;
  timestamp: string;
};

export type PatternMemorySuggestion = {
  successPatterns: EngineeringMemoryRecord[];
  failurePatterns: EngineeringMemoryRecord[];
  repoConventions: string[];
};

export type NextTaskDecision = {
  action: DecisionAction;
  reason: string;
  nextTaskId?: string;
  autopilotRunId?: string;
};

export type TaskRun = {
  id: string;
  projectId: string;
  taskId: string;
  attemptNumber: number;
  provider: RunProvider;
  executionMode: ExecutionMode;
  providerRunId?: string;
  providerState?: ProviderRunState;
  providerStateDetail?: string;
  lastProviderSyncAt?: string;
  dispatchNote?: string;
  status: RunStatus;
  prompt: string;
  expectedResultTemplate: string;
  memoryIds?: string[];
  snapshotBefore?: RepoSnapshot;
  snapshotAfter?: RepoSnapshot;
  actualChangedFiles?: FileChange[];
  localCommandReports?: CommandReport[];
  repoComparison?: RepoComparison;
  localRepoCheck?: LocalRepoCheck;
  workspaceSnapshot?: WorkspaceSnapshot;
  localWorkspaceCheck?: LocalWorkspaceCheck;
  submittedResultText?: string;
  resultSource?: ResultSource;
  parsedResult?: AgentExecutionResult;
  verification?: VerificationResult;
  decision?: NextTaskDecision;
  createdAt: string;
  updatedAt: string;
};

export type DecisionEntry = {
  id: string;
  createdAt: string;
  actor: "planner" | "verifier" | "supervisor" | "operator";
  title: string;
  detail: string;
  relatedTaskId?: string;
  relatedRunId?: string;
};

export type SupervisorIntervention = {
  id: string;
  createdAt: string;
  projectId: string;
  taskId: string;
  runId?: string;
  action: InterventionAction;
  summary: string;
  guidance?: string;
  startedRunId?: string;
};

export type Project = {
  id: string;
  name: string;
  slug: string;
  rawBrief: string;
  targetMvp?: string;
  repoPath: string;
  defaultBranch: string;
  primaryPaths: string[];
  executionMode: ExecutionMode;
  providerConfig: ProviderConfig;
  verificationCommands: VerificationCommand[];
  structuredSpec: StructuredSpec;
  firstTaskPacket?: TaskPacket;
  milestones: Milestone[];
  milestoneBlueprints: MilestoneBlueprint[];
  tasks: Task[];
  runs: TaskRun[];
  interventionLog: SupervisorIntervention[];
  taskBlueprints: TaskBlueprint[];
  roadmapCursor: number;
  decisionLog: DecisionEntry[];
  status: ProjectStatus;
  createdAt: string;
  updatedAt: string;
};

export type AppStore = {
  projects: Project[];
  engineeringMemory: EngineeringMemoryRecord[];
};

export type CreateProjectInput = {
  name: string;
  rawBrief: string;
  targetMvp?: string;
  repoPath: string;
  defaultBranch: string;
  primaryPaths: string[];
  executionMode: ExecutionMode;
  manualProvider: ManualProvider;
  connectedProvider: ConnectedProvider;
  providerBaseUrl?: string;
  providerModel?: string;
  providerApiKeyHint?: string;
  verificationCommands: VerificationCommand[];
};
