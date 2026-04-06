import { FileChange, RepoComparison } from "@/lib/types";
import { isSystemManagedPath, matchesAnyPattern, normalizePath } from "@/lib/utils";

export function compareReportedVsActualChanges(
  reportedFiles: FileChange[],
  actualFiles: FileChange[],
): Pick<
  RepoComparison,
  "matchedFiles" | "missingReportedFiles" | "unexpectedActualFiles" | "integrityWarnings"
> {
  const reportedPaths = reportedFiles
    .map((file) => normalizePath(file.path))
    .filter((filePath) => !isSystemManagedPath(filePath));
  const actualPaths = actualFiles
    .map((file) => normalizePath(file.path))
    .filter((filePath) => !isSystemManagedPath(filePath));
  const reportedSet = new Set(reportedPaths);
  const actualSet = new Set(actualPaths);
  const matchedFiles = actualPaths.filter((filePath) => reportedSet.has(filePath));
  const missingReportedFiles = actualPaths.filter((filePath) => !reportedSet.has(filePath));
  const unexpectedActualFiles = reportedPaths.filter((filePath) => !actualSet.has(filePath));
  const integrityWarnings: string[] = [];

  if (matchedFiles.length === 0 && (reportedPaths.length > 0 || actualPaths.length > 0)) {
    integrityWarnings.push(
      "The AI-reported file list does not overlap with the files detected locally in the repo.",
    );
  }

  if (missingReportedFiles.length > 0) {
    integrityWarnings.push(
      `Unexpected changed file detected: ${missingReportedFiles.join(", ")}`,
    );
  }

  if (unexpectedActualFiles.length > 0) {
    integrityWarnings.push(
      `The AI reported files that were not detected locally: ${unexpectedActualFiles.join(", ")}`,
    );
  }

  return {
    matchedFiles: [...new Set(matchedFiles)].sort(),
    missingReportedFiles: [...new Set(missingReportedFiles)].sort(),
    unexpectedActualFiles: [...new Set(unexpectedActualFiles)].sort(),
    integrityWarnings,
  };
}

export function checkAllowedPaths(actualFiles: FileChange[], allowedPaths: string[]) {
  return actualFiles
    .map((file) => normalizePath(file.path))
    .filter((filePath) => !isSystemManagedPath(filePath))
    .filter((filePath) => !matchesAnyPattern(filePath, allowedPaths))
    .sort();
}

export function checkForbiddenPaths(actualFiles: FileChange[], forbiddenPaths: string[]) {
  return actualFiles
    .map((file) => normalizePath(file.path))
    .filter((filePath) => !isSystemManagedPath(filePath))
    .filter((filePath) => matchesAnyPattern(filePath, forbiddenPaths))
    .sort();
}

export function buildRepoComparison(args: {
  reportedFiles: FileChange[];
  actualFiles: FileChange[];
  allowedPaths: string[];
  forbiddenPaths: string[];
  untrackedFiles: string[];
}): RepoComparison {
  const fileMatch = compareReportedVsActualChanges(args.reportedFiles, args.actualFiles);
  const outsideAllowedFiles = checkAllowedPaths(args.actualFiles, args.allowedPaths);
  const forbiddenFiles = checkForbiddenPaths(args.actualFiles, args.forbiddenPaths);
  const integrityWarnings = [...fileMatch.integrityWarnings];

  if (outsideAllowedFiles.length > 0) {
    integrityWarnings.push(
      `Out-of-scope file detected: ${outsideAllowedFiles.join(", ")}`,
    );
  }

  if (forbiddenFiles.length > 0) {
    integrityWarnings.push(
      `Forbidden file detected: ${forbiddenFiles.join(", ")}`,
    );
  }

  if (args.untrackedFiles.length > 0) {
    integrityWarnings.push(
      `Untracked files remain in the repo: ${args.untrackedFiles.join(", ")}`,
    );
  }

  return {
    matchedFiles: fileMatch.matchedFiles,
    missingReportedFiles: fileMatch.missingReportedFiles,
    unexpectedActualFiles: fileMatch.unexpectedActualFiles,
    outsideAllowedFiles,
    forbiddenFiles,
    untrackedFiles: [
      ...new Set(
        args.untrackedFiles
          .map((filePath) => normalizePath(filePath))
          .filter((filePath) => !isSystemManagedPath(filePath)),
      ),
    ].sort(),
    integrityWarnings,
  };
}
