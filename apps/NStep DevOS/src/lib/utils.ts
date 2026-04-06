import {
  ConnectedProvider,
  ExecutionMode,
  ManualProvider,
  Milestone,
  Project,
  ProviderConnectionStatus,
  Task,
} from "@/lib/types";

const SYSTEM_MANAGED_PATH_PATTERNS = [
  "data/**",
  ".next/**",
  "next-env.d.ts",
  "*.log",
  "**/*.log",
  "*.tsbuildinfo",
  "**/*.tsbuildinfo",
];

export function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

export function normalizePath(value: string) {
  return value.replace(/\\/g, "/").replace(/^\.\//, "");
}

export function toLines(value: string) {
  return value
    .replace(/`n/g, "\n")
    .replace(/\\n/g, "\n")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
}

export function compactText(value: string, maxLength = 220) {
  if (value.length <= maxLength) {
    return value;
  }

  return `${value.slice(0, maxLength - 1).trimEnd()}...`;
}

export function matchesPattern(path: string, pattern: string) {
  const normalizedPath = normalizePath(path);
  const normalizedPattern = normalizePath(pattern)
    .replace(/[.+^${}()|[\]\\]/g, "\\$&")
    .replace(/\*\*/g, ":::double:::")
    .replace(/\*/g, "[^/]*")
    .replace(/:::double:::/g, ".*");

  return new RegExp(`^${normalizedPattern}$`, "i").test(normalizedPath);
}

export function matchesAnyPattern(path: string, patterns: string[]) {
  return patterns.some((pattern) => matchesPattern(path, pattern));
}

export function isSystemManagedPath(value: string) {
  return matchesAnyPattern(normalizePath(value), SYSTEM_MANAGED_PATH_PATTERNS);
}

export function formatDate(iso: string) {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(iso));
}

export function uniqueStrings(values: string[]) {
  return [...new Set(values.map((value) => value.trim()).filter(Boolean))];
}

export function getStepLabel(orderIndex: number, totalSteps: number) {
  return `Step ${orderIndex} of ${totalSteps}`;
}

export function getActiveTask(project: Project) {
  return (
    project.tasks.find((task) =>
      ["ready", "in_progress", "needs_retry", "needs_review"].includes(task.status),
    ) ?? project.tasks.at(-1)
  );
}

export function getMilestoneBlueprint(project: Project, milestoneKey?: string) {
  return milestoneKey
    ? project.milestoneBlueprints.find((item) => item.key === milestoneKey)
    : undefined;
}

export function getMilestoneStageLabel(project: Project, milestone: Milestone) {
  const milestoneIndex = Math.max(
    0,
    project.milestoneBlueprints.findIndex((item) => item.key === milestone.key),
  );

  return `Stage ${milestoneIndex + 1} of ${project.milestoneBlueprints.length}`;
}

export function getTaskStageLabel(project: Project, task: Task) {
  const milestone = project.milestones.find((item) => item.id === task.milestoneId);

  if (!milestone) {
    return getStepLabel(task.orderIndex, project.taskBlueprints.length);
  }

  const milestoneBlueprint = getMilestoneBlueprint(project, milestone.key);
  const milestoneTasks = project.tasks
    .filter((item) => item.milestoneId === milestone.id)
    .sort((left, right) => left.orderIndex - right.orderIndex);
  const milestoneStepIndex = Math.max(
    0,
    milestoneTasks.findIndex((item) => item.id === task.id),
  );
  const totalMilestoneSteps = milestoneBlueprint?.taskBlueprints.length ?? milestoneTasks.length;

  return `${getMilestoneStageLabel(project, milestone)} | Step ${milestoneStepIndex + 1} of ${totalMilestoneSteps}`;
}

export function statusTone(
  status: string,
): "status-ok" | "status-warn" | "status-danger" | "status-info" {
  if (
    ["completed", "accepted", "active", "ready", "succeeded", "clean", "matched"].includes(status)
  ) {
    return "status-ok";
  }

  if (
    [
      "needs_review",
      "needs_retry",
      "human_review_required",
      "rollback_required",
      "blocked",
      "failed",
      "critical",
      "error",
      "dirty",
    ].includes(status)
  ) {
    return status === "rollback_required" || status === "blocked" || status === "critical"
      ? "status-danger"
      : "status-warn";
  }

  return "status-info";
}

export function humanizeStatus(status: string) {
  switch (status) {
    case "manual":
      return "Manual handoff";
    case "connected":
      return "Connected automation";
    case "active":
      return "Active";
    case "completed":
      return "Completed";
    case "ready":
      return "Ready to start";
    case "in_progress":
      return "In progress";
    case "needs_retry":
      return "Ready to try again";
    case "needs_review":
      return "Needs your review";
    case "blocked":
      return "Blocked";
    case "awaiting_submission":
      return "Waiting for pasted result";
    case "waiting_on_provider":
      return "Waiting on provider";
    case "accepted":
      return "Accepted";
    case "rollback_required":
      return "Needs rollback review";
    case "human_review_required":
      return "Needs human review";
    case "succeeded":
      return "Succeeded";
    case "failed":
      return "Failed";
    case "critical":
      return "Critical";
    case "clean":
      return "Clean";
    case "dirty":
      return "Dirty";
    case "unknown":
      return "Unknown";
    case "error":
      return "Needs attention";
    case "warning":
      return "Heads up";
    case "info":
      return "Info";
    case "not_configured":
      return "Needs setup";
    case "mock_ready":
      return "Mock ready";
    case "configured":
      return "Configured";
    case "staged":
      return "Staged";
    case "ready_for_fallback":
      return "Ready for fallback";
    case "planned":
      return "Planned";
    case "generate_next_task":
      return "Next step ready";
    case "accept_task":
      return "Task accepted";
    case "retry_task":
      return "Try this step again";
    case "request_human_review":
      return "Review needed";
    case "rollback_run":
      return "Review before rollback";
    case "complete_milestone":
      return "Milestone complete";
    case "modified":
      return "Changed";
    case "added":
      return "Added";
    case "deleted":
      return "Deleted";
    case "renamed":
      return "Renamed";
    case "passed":
      return "Passed";
    case "not_run":
      return "Not run";
    default:
      return status
        .split("_")
        .map((part) => `${part.charAt(0).toUpperCase()}${part.slice(1)}`)
        .join(" ");
  }
}

export function getExecutionModeLabel(mode: ExecutionMode) {
  return mode === "connected" ? "Connected automation" : "Manual handoff";
}

export function getExecutionModeSummary(mode: ExecutionMode) {
  return mode === "connected"
    ? "NSS keeps the provider lifecycle inside the app, including connected dispatch, status refresh, and automatic ingestion where the adapter supports it."
    : "NSS prepares copy-paste runs for a human operator to use with Codex App, Antigravity, Ollama Code, or another coding agent.";
}

export function getProviderConnectionSummary(
  status: ProviderConnectionStatus,
  provider?: ConnectedProvider,
  apiKeyHint?: string,
) {
  const envName = apiKeyHint?.trim() || "OPENAI_API_KEY";

  switch (status) {
    case "configured":
      return provider === "codex-api"
        ? "Codex API dispatch is ready. NSS can start connected runs, refresh provider state, and ingest structured results automatically."
        : "Provider settings are present for connected automation.";
    case "mock_ready":
      return "The project is wired to the mock connected provider while direct automation is still being built.";
    default:
      if (provider === "codex-api") {
        return `Set ${envName} in the server environment before starting Codex API connected runs.`;
      }

      if (provider === "ollama-code-api") {
        return "Ollama Code automation is planned for a future local adapter. NSS will stay on the manual operator loop until that connected path is implemented.";
      }

      return "Connected mode is not configured yet. NSS will stay on the manual operator loop until setup is completed.";
  }
}

export function getProviderRunStateSummary(state?: string) {
  switch (state) {
    case "running":
      return "The connected provider has the run and NSS is waiting for the next provider update.";
    case "ready_for_fallback":
      return "Automatic dispatch finished, but this provider still needs the fallback prompt/result loop for ingestion.";
    case "staged":
      return "Provider metadata is saved, but direct API dispatch is not live yet.";
    case "completed":
      return "The provider lifecycle finished for this run.";
    default:
      return "No connected-provider lifecycle has been recorded for this run yet.";
  }
}

export function formatDurationMs(value?: number) {
  if (value === undefined || value === null) {
    return "Not measured";
  }

  if (value < 1000) {
    return `${value} ms`;
  }

  const seconds = value / 1000;

  if (seconds < 60) {
    return `${seconds.toFixed(1)} s`;
  }

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.round(seconds % 60);
  return `${minutes}m ${remainingSeconds}s`;
}

export function humanizeFindingCategory(category: string) {
  switch (category) {
    case "acceptance":
      return "Task fit";
    case "workspace":
      return "Local repo check";
    case "allowed_files":
      return "File boundaries";
    case "forbidden_files":
      return "Protected files";
    case "build":
      return "Build checks";
    case "test":
      return "Test checks";
    case "blocker":
      return "Blocker";
    case "scope_expansion":
      return "Scope drift";
    case "deliverables":
      return "Missing work";
    case "payload":
      return "AI vs repo mismatch";
    default:
      return humanizeStatus(category);
  }
}

export function humanizeCommandKey(key: string) {
  switch (key) {
    case "typecheck":
      return "Code checks";
    case "lint":
      return "Style checks";
    case "build":
      return "Build";
    case "test":
      return "Tests";
    default:
      return humanizeStatus(key);
  }
}

export function describeScore(score?: number | null) {
  if (score === undefined || score === null) {
    return {
      label: "Not checked yet",
      detail: "This run has not been verified yet.",
    };
  }

  if (score >= 95) {
    return {
      label: "Clear",
      detail: "Everything lines up well for this step.",
    };
  }

  if (score >= 80) {
    return {
      label: "Strong",
      detail: "This step looks solid with only minor concerns.",
    };
  }

  if (score >= 60) {
    return {
      label: "Mixed",
      detail: "Some parts are good, but this step still needs attention.",
    };
  }

  return {
    label: "Low confidence",
    detail: "This step is not ready to trust without more work or review.",
  };
}

export function getProviderLabel(
  provider: ManualProvider | ConnectedProvider | string,
) {
  switch (provider) {
    case "codex-app":
      return "Codex App";
    case "antigravity":
      return "Antigravity";
    case "ollama-code":
      return "Ollama Code";
    case "manual-other":
      return "Other Coding Agent";
    case "mock-connected":
      return "Mock connected provider";
    case "codex-api":
      return "Codex API";
    case "antigravity-api":
      return "Antigravity API";
    case "ollama-code-api":
      return "Ollama Code API";
    default:
      return provider;
  }
}

export function getAutomationPauseSummary(args: {
  taskStatus?: string;
  runStatus?: string;
  decisionAction?: string;
}) {
  const { taskStatus, runStatus, decisionAction } = args;

  if (taskStatus === "ready") {
    return null;
  }

  if (runStatus === "rollback_required" || decisionAction === "rollback_run") {
    return {
      title: "Automation paused for rollback review",
      detail:
        "NSS will not advance after a risky or forbidden change. Review the run findings here, clean up or roll back the repo outside NSS, then start another run from the same task once the workspace is safe.",
    };
  }

  if (
    taskStatus === "needs_review" ||
    runStatus === "needs_review" ||
    decisionAction === "request_human_review"
  ) {
    return {
      title: "Automation paused for human review",
      detail:
        "NSS is the supervisor, not the editor. Review the findings, make any repo changes or agent adjustments outside NSS, then start another run from this task when you are ready.",
    };
  }

  if (
    taskStatus === "needs_retry" ||
    runStatus === "needs_retry" ||
    decisionAction === "retry_task"
  ) {
    return {
      title: "Automation paused for a retry",
      detail:
        "The verifier found missing acceptance coverage or failing checks. Fix the task work in the repo or through your coding agent, then launch another run from the same task.",
    };
  }

  return null;
}
