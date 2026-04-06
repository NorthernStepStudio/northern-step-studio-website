import {
  CommandReport,
  FileChange,
  LocalRepoCheck,
  RepoComparison,
  RepoSnapshot,
  RepoStatusEntry,
  WorkspaceIssue,
} from "@/lib/types";
import { isSystemManagedPath } from "@/lib/utils";

function summarizeDetectedChange(changeType: FileChange["changeType"]) {
  switch (changeType) {
    case "added":
      return "Detected a new file in the repo after this run started.";
    case "deleted":
      return "Detected a file that was removed from the repo during this run.";
    case "renamed":
      return "Detected a file rename in the repo during this run.";
    default:
      return "Detected a file that changed in the repo during this run.";
  }
}

function changeTypeFromStatus(entry?: RepoStatusEntry): FileChange["changeType"] | undefined {
  if (!entry) {
    return undefined;
  }

  switch (entry.statusCode) {
    case "added":
    case "deleted":
    case "renamed":
      return entry.statusCode;
    default:
      return "modified";
  }
}

export function detectActualChangedFiles(
  snapshotBefore?: RepoSnapshot,
  snapshotAfter?: RepoSnapshot,
): FileChange[] {
  if (!snapshotBefore?.available || !snapshotAfter?.available) {
    return [];
  }

  const beforeByPath = new Map(snapshotBefore.fileSignatures.map((entry) => [entry.path, entry]));
  const afterByPath = new Map(snapshotAfter.fileSignatures.map((entry) => [entry.path, entry]));
  const afterStatusByPath = new Map(snapshotAfter.statusEntries.map((entry) => [entry.path, entry]));
  const changedFiles: FileChange[] = [];

  for (const [filePath, afterEntry] of afterByPath) {
    const beforeEntry = beforeByPath.get(filePath);

    if (!beforeEntry) {
      const changeType = changeTypeFromStatus(afterStatusByPath.get(filePath)) ?? "added";
      changedFiles.push({
        path: filePath,
        changeType,
        summary: summarizeDetectedChange(changeType),
      });
      continue;
    }

    if (beforeEntry.hash !== afterEntry.hash || beforeEntry.size !== afterEntry.size) {
      const changeType = changeTypeFromStatus(afterStatusByPath.get(filePath)) ?? "modified";
      changedFiles.push({
        path: filePath,
        changeType,
        summary: summarizeDetectedChange(changeType),
      });
    }
  }

  for (const [filePath] of beforeByPath) {
    if (!afterByPath.has(filePath)) {
      changedFiles.push({
        path: filePath,
        changeType: "deleted",
        summary: summarizeDetectedChange("deleted"),
      });
    }
  }

  return changedFiles
    .filter((file) => !isSystemManagedPath(file.path))
    .sort((left, right) => left.path.localeCompare(right.path));
}

export function buildLocalRepoCheck(args: {
  snapshotBefore?: RepoSnapshot;
  snapshotAfter?: RepoSnapshot;
  actualChangedFiles: FileChange[];
  comparison: RepoComparison;
  commands: CommandReport[];
  issues: WorkspaceIssue[];
}): LocalRepoCheck {
  const { snapshotBefore, snapshotAfter, actualChangedFiles, comparison, commands, issues } = args;
  const referenceSnapshot = snapshotAfter ?? snapshotBefore;
  const combinedIssues = [...issues];

  if (snapshotBefore?.available && snapshotBefore.branchState === "dirty") {
    combinedIssues.push({
      severity: "warning",
      message:
        "The repo was already dirty before this run started. NSS DevOS compared before and after snapshots, but unrelated pre-existing changes may still require manual review.",
    });
  }

  if (!referenceSnapshot) {
    combinedIssues.push({
      severity: "warning",
      message: "No repo snapshot was captured for this run, so repo truth checks were skipped.",
    });
  }

  const dedupedIssues = combinedIssues.filter((issue, index, items) => {
    return (
      items.findIndex(
        (candidate) =>
          candidate.severity === issue.severity && candidate.message === issue.message,
      ) === index
    );
  });

  return {
    available: Boolean(referenceSnapshot?.available),
    checkedAt: new Date().toISOString(),
    repoPath: referenceSnapshot?.repoPath ?? "",
    repoDetected: Boolean(referenceSnapshot?.repoDetected),
    gitRepo: Boolean(referenceSnapshot?.gitRepo),
    branchName: referenceSnapshot?.branchName,
    branchState: referenceSnapshot?.branchState ?? "unknown",
    snapshotBefore,
    snapshotAfter,
    actualChangedFiles,
    actualChangedPaths: actualChangedFiles.map((file) => file.path),
    untrackedFiles: snapshotAfter?.untrackedFiles ?? [],
    comparison,
    commands,
    issues: dedupedIssues,
  };
}
