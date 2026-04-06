import {
  AgentExecutionResult,
  CommandReport,
  LocalWorkspaceCheck,
  Project,
  Task,
  VerificationFinding,
  VerificationOutcome,
  VerificationResult,
} from "@/lib/types";
import { matchesAnyPattern, normalizePath } from "@/lib/utils";

function normalizeCriterion(value: string) {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}

function finding(
  severity: VerificationFinding["severity"],
  category: VerificationFinding["category"],
  message: string,
  paths?: string[],
): VerificationFinding {
  return { severity, category, message, paths };
}

function dedupeFindings(findings: VerificationFinding[]) {
  return findings.filter((item, index, items) => {
    const normalizedPaths = [...(item.paths ?? [])].sort().join("|");

    return (
      items.findIndex((candidate) => {
        const candidatePaths = [...(candidate.paths ?? [])].sort().join("|");
        return (
          candidate.severity === item.severity &&
          candidate.category === item.category &&
          candidate.message === item.message &&
          candidatePaths === normalizedPaths
        );
      }) === index
    );
  });
}

function hasFailedCommand(
  commands: CommandReport[],
  project: Project,
  keys: string[],
) {
  const required = project.verificationCommands.filter((command) =>
    keys.includes(command.key.toLowerCase()),
  );

  if (required.length === 0) {
    return false;
  }

  return required.some((command) => {
    const report = commands.find((item) => item.key === command.key);
    return !report || report.status !== "passed";
  });
}

function getIntegrityMismatchDisposition(localWorkspaceCheck?: LocalWorkspaceCheck) {
  if (!localWorkspaceCheck?.available) {
    return "none" as const;
  }

  const {
    matchedFiles,
    missingReportedFiles,
    unexpectedActualFiles,
  } = localWorkspaceCheck.comparison;
  const mismatchCount =
    missingReportedFiles.length + unexpectedActualFiles.length;

  if (mismatchCount === 0) {
    return "none" as const;
  }

  const severeMismatch =
    matchedFiles.length === 0 ||
    (missingReportedFiles.length > 0 && unexpectedActualFiles.length > 0) ||
    mismatchCount >= 4;

  return severeMismatch ? ("human_review_required" as const) : ("retry_required" as const);
}

export function verifyRun(
  project: Project,
  task: Task,
  result: AgentExecutionResult,
  localWorkspaceCheck?: LocalWorkspaceCheck,
): VerificationResult {
  const findings: VerificationFinding[] = [];
  let outcome: VerificationOutcome = "accepted";
  const effectiveChangedFiles =
    localWorkspaceCheck?.available === true
      ? localWorkspaceCheck.actualChangedFiles
      : result.changedFiles;
  const commandReports =
    localWorkspaceCheck &&
    localWorkspaceCheck.commands.some((item) => item.status !== "not_run")
      ? localWorkspaceCheck.commands
      : result.commands;
  const reportedCriteria = result.completionState.acceptanceCriteriaStatus.map((item) =>
    normalizeCriterion(item.criterion),
  );
  const criteriaStatusMap = new Map(
    result.completionState.acceptanceCriteriaStatus.map((item) => [
      normalizeCriterion(item.criterion),
      item,
    ]),
  );

  const currentTaskCriteria = task.acceptanceCriteria.map((criterion) =>
    normalizeCriterion(criterion),
  );
  const currentTaskMatchCount = currentTaskCriteria.filter((criterion) =>
    reportedCriteria.includes(criterion),
  ).length;

  const bestMatchingOtherTask = project.tasks
    .filter((candidateTask) => candidateTask.id !== task.id)
    .map((candidateTask) => ({
      task: candidateTask,
      matchCount: candidateTask.acceptanceCriteria
        .map((criterion) => normalizeCriterion(criterion))
        .filter((criterion) => reportedCriteria.includes(criterion)).length,
    }))
    .sort((left, right) => right.matchCount - left.matchCount)[0];

  if (result.taskId && result.taskId !== task.id) {
    findings.push(
      finding(
        "error",
        "payload",
        `The pasted result says it belongs to task ${result.taskId}, but this run is for task ${task.id} (${task.title}). Start a new run from the current task prompt before using this result.`,
      ),
    );

    if (outcome === "accepted") {
      outcome = "retry_required";
    }
  } else if (
    bestMatchingOtherTask &&
    bestMatchingOtherTask.matchCount > currentTaskMatchCount &&
    bestMatchingOtherTask.matchCount >= 2
  ) {
    findings.push(
      finding(
        "error",
        "payload",
        `The pasted result appears to match a different task: "${bestMatchingOtherTask.task.title}" instead of the current task "${task.title}". Copy the prompt from the current task run and generate a fresh result for this task.`,
        ),
    );

    if (outcome === "accepted") {
      outcome = "retry_required";
    }
  }

  if (localWorkspaceCheck) {
    for (const issue of localWorkspaceCheck.issues) {
      findings.push(finding(issue.severity, "workspace", issue.message));
      if (
        (issue.severity === "error" ||
          (!localWorkspaceCheck.available && issue.severity === "warning")) &&
        outcome === "accepted"
      ) {
        outcome = "human_review_required";
      }
    }
  }

  if (localWorkspaceCheck?.available) {
    const integrityMismatchDisposition =
      getIntegrityMismatchDisposition(localWorkspaceCheck);

    if (effectiveChangedFiles.length === 0) {
      findings.push(
        finding(
          "error",
          "workspace",
          "No actual file changes were detected in the configured repo path after this run started.",
        ),
      );

      if (outcome === "accepted") {
        outcome = "retry_required";
      }
    }

    if (localWorkspaceCheck.comparison.integrityWarnings.length > 0) {
      findings.push(
        finding(
          "warning",
          "payload",
          localWorkspaceCheck.comparison.integrityWarnings.join(" "),
          [
            ...new Set([
              ...localWorkspaceCheck.comparison.missingReportedFiles,
              ...localWorkspaceCheck.comparison.unexpectedActualFiles,
              ...localWorkspaceCheck.comparison.untrackedFiles,
            ]),
          ],
        ),
      );

      if (integrityMismatchDisposition === "human_review_required" && outcome === "accepted") {
        outcome = "human_review_required";
      } else if (
        integrityMismatchDisposition === "retry_required" &&
        outcome === "accepted"
      ) {
        outcome = "retry_required";
      }
    }
  }

  const normalizedPaths = effectiveChangedFiles.map((file) => normalizePath(file.path));
  const forbiddenFiles =
    localWorkspaceCheck?.available === true
      ? localWorkspaceCheck.comparison.forbiddenFiles
      : normalizedPaths.filter((filePath) => matchesAnyPattern(filePath, task.forbiddenPaths));

  if (forbiddenFiles.length > 0) {
    findings.push(
      finding(
        "critical",
        "forbidden_files",
        "The run touched forbidden files. This should be rolled back before continuing.",
        forbiddenFiles,
      ),
    );
    outcome = "rollback_required";
  }

  const outsideAllowed =
    localWorkspaceCheck?.available === true
      ? localWorkspaceCheck.comparison.outsideAllowedFiles
      : normalizedPaths.filter((filePath) => !matchesAnyPattern(filePath, task.allowedPaths));

  if (outsideAllowed.length > 0 && outcome !== "rollback_required") {
    findings.push(
      finding(
        "error",
        "allowed_files",
        "The run changed files outside the allowed task boundary.",
        outsideAllowed,
      ),
    );
    outcome = "human_review_required";
  }

  if (result.blocker || result.status === "blocked") {
    findings.push(
      finding(
        "warning",
        "blocker",
        result.blocker?.description ??
          "The coding agent reported that the task is blocked.",
        result.blocker?.relatedPaths,
      ),
    );

    if (outcome === "accepted") {
      outcome = result.blocker?.retryable ? "retry_required" : "human_review_required";
    }
  }

  if (result.changedFiles.length === 0) {
    findings.push(
      finding(
        "error",
        "deliverables",
        "The result did not report any changed files, so the task cannot be accepted.",
      ),
    );

    if (outcome === "accepted") {
      outcome = "retry_required";
    }
  }

  const unmetAcceptance = task.acceptanceCriteria.filter((criterion) => {
    const status = criteriaStatusMap.get(normalizeCriterion(criterion));
    return !status || status.status !== "met";
  });

  if (unmetAcceptance.length > 0) {
    findings.push(
      finding(
        "error",
        "acceptance",
        `The run left ${unmetAcceptance.length} acceptance criteria unmet, partially met, or unreported.`,
      ),
    );

    if (outcome === "accepted") {
      outcome = "retry_required";
    }
  }

  if (!result.completionState.objectiveAddressed && outcome === "accepted") {
    findings.push(
      finding(
        "error",
        "deliverables",
        "The result said the task objective was not fully addressed.",
      ),
    );
    outcome = "retry_required";
  }

  const buildFailed = hasFailedCommand(commandReports, project, ["build", "typecheck", "lint"]);
  const testFailed = hasFailedCommand(commandReports, project, ["test"]);
  const aiBuildClaimedPassed = hasFailedCommand(result.commands, project, ["build", "typecheck", "lint"]) === false;
  const aiTestClaimedPassed = hasFailedCommand(result.commands, project, ["test"]) === false;

  if (buildFailed) {
    findings.push(
      finding(
        "error",
        "build",
        aiBuildClaimedPassed
          ? "AI reported the required build checks passed, but the local repo check failed them."
          : "A required build, typecheck, or lint command did not pass.",
      ),
    );

    if (outcome === "accepted") {
      outcome = "retry_required";
    }
  }

  if (testFailed) {
    findings.push(
      finding(
        "error",
        "test",
        aiTestClaimedPassed
          ? "AI reported the required tests passed, but the local repo check failed them."
          : "A required test command did not pass.",
      ),
    );

    if (outcome === "accepted") {
      outcome = "retry_required";
    }
  }

  if (
    localWorkspaceCheck?.available &&
    localWorkspaceCheck.comparison.untrackedFiles.length > 0
  ) {
    findings.push(
      finding(
        "warning",
        "workspace",
        "Untracked files remain after the run. Review them before trusting this step.",
        localWorkspaceCheck.comparison.untrackedFiles,
      ),
    );
  }

  const suspiciousScopeExpansion =
    effectiveChangedFiles.length > Math.max(task.allowedPaths.length * 4, 12);

  if (suspiciousScopeExpansion) {
    findings.push(
      finding(
        "warning",
        "scope_expansion",
        "The run changed an unusually large number of files for a bounded task.",
      ),
    );
  }

  if (findings.length === 0) {
    findings.push(
      finding(
        "info",
        "acceptance",
        "The run satisfied acceptance criteria, stayed in scope, and reported passing required commands.",
      ),
    );
  }

  const acceptanceScore = unmetAcceptance.length === 0 ? 100 : 40;
  const scopeScore = forbiddenFiles.length > 0 ? 0 : outsideAllowed.length > 0 ? 45 : 100;
  const commandsScore = buildFailed || testFailed ? 30 : 100;
  const integrityScore = localWorkspaceCheck?.available
    ? localWorkspaceCheck.comparison.missingReportedFiles.length > 0 ||
      localWorkspaceCheck.comparison.unexpectedActualFiles.length > 0
      ? getIntegrityMismatchDisposition(localWorkspaceCheck) === "human_review_required"
        ? 55
        : 72
      : localWorkspaceCheck.comparison.untrackedFiles.length > 0
        ? 75
        : 100
    : effectiveChangedFiles.length === 0
      ? 20
      : suspiciousScopeExpansion
        ? 60
        : 90;

  return {
    outcome,
    checkedAt: new Date().toISOString(),
    findings: dedupeFindings(findings),
    score: {
      acceptance: acceptanceScore,
      scope: scopeScore,
      commands: commandsScore,
      integrity: integrityScore,
      overall: Math.round(
        acceptanceScore * 0.35 +
          scopeScore * 0.3 +
          commandsScore * 0.25 +
          integrityScore * 0.1,
      ),
    },
  };
}
