import { spawn } from "node:child_process";
import { createHash } from "node:crypto";
import { promises as fs } from "node:fs";
import path from "node:path";

import {
  RepoBranchState,
  RepoFileSignature,
  RepoSnapshot,
  RepoStatusCode,
  RepoStatusEntry,
  WorkspaceIssue,
} from "@/lib/types";
import { isSystemManagedPath, normalizePath } from "@/lib/utils";

const IGNORED_DIR_NAMES = new Set([
  ".git",
  ".next",
  "node_modules",
  "dist",
  "build",
  "coverage",
  ".turbo",
]);

type GitCommandResult = {
  ok: boolean;
  stdout: string;
  stderr: string;
  exitCode: number | null;
};

function trimLines(value: string) {
  return value
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
}

async function pathExists(targetPath: string) {
  try {
    await fs.access(targetPath);
    return true;
  } catch {
    return false;
  }
}

async function runGitCommand(repoPath: string, args: string[]): Promise<GitCommandResult> {
  return new Promise((resolve) => {
    const child = spawn("git", ["-C", repoPath, ...args], {
      stdio: ["ignore", "pipe", "pipe"],
    });

    let stdout = "";
    let stderr = "";

    child.stdout.on("data", (chunk) => {
      stdout += chunk.toString();
    });

    child.stderr.on("data", (chunk) => {
      stderr += chunk.toString();
    });

    child.on("error", (error) => {
      resolve({
        ok: false,
        stdout,
        stderr: error.message,
        exitCode: null,
      });
    });

    child.on("close", (exitCode) => {
      resolve({
        ok: exitCode === 0,
        stdout,
        stderr,
        exitCode,
      });
    });
  });
}

async function walkWorkspaceFiles(rootPath: string, currentPath = rootPath): Promise<string[]> {
  const entries = await fs.readdir(currentPath, { withFileTypes: true });
  const files: string[] = [];

  for (const entry of entries) {
    if (entry.name.startsWith(".") && entry.name !== ".env.example") {
      if (IGNORED_DIR_NAMES.has(entry.name)) {
        continue;
      }
    }

    if (IGNORED_DIR_NAMES.has(entry.name)) {
      continue;
    }

    const absolutePath = path.join(currentPath, entry.name);

    if (entry.isDirectory()) {
      files.push(...(await walkWorkspaceFiles(rootPath, absolutePath)));
      continue;
    }

    if (!entry.isFile()) {
      continue;
    }

    const relativePath = normalizePath(path.relative(rootPath, absolutePath));
    if (isSystemManagedPath(relativePath)) {
      continue;
    }

    files.push(absolutePath);
  }

  return files;
}

async function hashFile(absolutePath: string) {
  const buffer = await fs.readFile(absolutePath);
  const hash = createHash("sha1").update(buffer).digest("hex");
  return { hash, size: buffer.byteLength };
}

async function buildFileSignatures(repoPath: string): Promise<RepoFileSignature[]> {
  const absoluteRepoPath = path.resolve(repoPath);
  const files = await walkWorkspaceFiles(absoluteRepoPath);
  const signatures: RepoFileSignature[] = [];

  for (const filePath of files) {
    const { hash, size } = await hashFile(filePath);
    signatures.push({
      path: normalizePath(path.relative(absoluteRepoPath, filePath)),
      hash,
      size,
    });
  }

  return signatures.sort((left, right) => left.path.localeCompare(right.path));
}

function mapStatusCode(indexStatus: string, workingTreeStatus: string): RepoStatusCode {
  const combined = `${indexStatus}${workingTreeStatus}`;

  if (combined === "??") {
    return "untracked";
  }

  if (combined === "!!") {
    return "ignored";
  }

  if (combined.includes("R")) {
    return "renamed";
  }

  if (combined.includes("C")) {
    return "copied";
  }

  if (combined.includes("A")) {
    return "added";
  }

  if (combined.includes("D")) {
    return "deleted";
  }

  if (combined.includes("M") || combined.includes("T")) {
    return "modified";
  }

  return "unknown";
}

function parseStatusLine(line: string): RepoStatusEntry | null {
  if (line.length < 3) {
    return null;
  }

  const indexStatus = line.slice(0, 1);
  const workingTreeStatus = line.slice(1, 2);
  const rawPath = line.slice(3).trim();

  if (!rawPath) {
    return null;
  }

  if (rawPath.includes(" -> ")) {
    const [oldPath, newPath] = rawPath.split(" -> ");
    return {
      path: normalizePath(newPath),
      oldPath: normalizePath(oldPath),
      indexStatus,
      workingTreeStatus,
      statusCode: mapStatusCode(indexStatus, workingTreeStatus),
    };
  }

  return {
    path: normalizePath(rawPath),
    indexStatus,
    workingTreeStatus,
    statusCode: mapStatusCode(indexStatus, workingTreeStatus),
  };
}

async function detectGitSnapshotState(
  repoPath: string,
): Promise<{
  gitRepo: boolean;
  branchName?: string;
  branchState: RepoBranchState;
  statusShort: string[];
  statusEntries: RepoStatusEntry[];
  diffNameOnly: string[];
  untrackedFiles: string[];
  issues: WorkspaceIssue[];
}> {
  const issues: WorkspaceIssue[] = [];
  const isGitRepoResult = await runGitCommand(repoPath, ["rev-parse", "--is-inside-work-tree"]);
  const gitRepo = isGitRepoResult.ok && isGitRepoResult.stdout.trim() === "true";

  if (!gitRepo) {
    if (isGitRepoResult.stderr.trim()) {
      issues.push({
        severity: "info",
        message:
          "The configured repo path is not a git repository. Branch and git status checks are unavailable, so NSS DevOS will fall back to file snapshot verification only.",
      });
    }

    return {
      gitRepo: false,
      branchName: undefined,
      branchState: "unknown" as RepoBranchState,
      statusShort: [] as string[],
      statusEntries: [] as RepoStatusEntry[],
      diffNameOnly: [] as string[],
      untrackedFiles: [] as string[],
      issues,
    };
  }

  const branchResult = await runGitCommand(repoPath, ["branch", "--show-current"]);
  const statusResult = await runGitCommand(repoPath, [
    "status",
    "--short",
    "--untracked-files=all",
  ]);
  const headResult = await runGitCommand(repoPath, ["rev-parse", "--verify", "HEAD"]);
  const diffResult = headResult.ok
    ? await runGitCommand(repoPath, ["diff", "--name-only", "--relative", "HEAD"])
    : await runGitCommand(repoPath, ["diff", "--name-only", "--relative"]);

  const statusShort = statusResult.ok ? trimLines(statusResult.stdout) : [];
  const statusEntries = statusShort
    .map((line) => parseStatusLine(line))
    .filter((entry): entry is RepoStatusEntry => entry !== null)
    .filter((entry) => !isSystemManagedPath(entry.path));
  const untrackedFiles = statusEntries
    .filter((entry) => entry.statusCode === "untracked")
    .map((entry) => entry.path);
  const diffNameOnly = diffResult.ok
    ? trimLines(diffResult.stdout)
        .map((filePath) => normalizePath(filePath))
        .filter((filePath) => !isSystemManagedPath(filePath))
    : statusEntries
        .filter((entry) => entry.statusCode !== "untracked" && entry.statusCode !== "ignored")
        .map((entry) => entry.path);

  if (!statusResult.ok && statusResult.stderr.trim()) {
    issues.push({
      severity: "warning",
      message: `git status could not be read: ${statusResult.stderr.trim()}`,
    });
  }

  if (!diffResult.ok && diffResult.stderr.trim()) {
    issues.push({
      severity: "warning",
      message: `git diff could not be read: ${diffResult.stderr.trim()}`,
    });
  }

  return {
    gitRepo: true,
    branchName: branchResult.ok ? branchResult.stdout.trim() || undefined : undefined,
    branchState: statusEntries.length > 0 ? "dirty" : "clean",
    statusShort,
    statusEntries,
    diffNameOnly,
    untrackedFiles,
    issues,
  };
}

export async function captureRepoSnapshot(
  repoPath: string,
  runId: string,
  taskId: string,
): Promise<RepoSnapshot> {
  const resolvedRepoPath = path.resolve(repoPath);
  const capturedAt = new Date().toISOString();

  if (!(await pathExists(resolvedRepoPath))) {
    return {
      available: false,
      repoPath: resolvedRepoPath,
      capturedAt,
      runId,
      taskId,
      repoDetected: false,
      gitRepo: false,
      branchState: "unknown",
      statusShort: [],
      statusEntries: [],
      diffNameOnly: [],
      untrackedFiles: [],
      fileSignatures: [],
      issues: [
        {
          severity: "warning",
          message: "The configured repo path does not exist, so repo truth checks are unavailable.",
        },
      ],
    };
  }

  try {
    const stat = await fs.stat(resolvedRepoPath);

    if (!stat.isDirectory()) {
      return {
        available: false,
        repoPath: resolvedRepoPath,
        capturedAt,
        runId,
        taskId,
        repoDetected: false,
        gitRepo: false,
        branchState: "unknown",
        statusShort: [],
        statusEntries: [],
        diffNameOnly: [],
        untrackedFiles: [],
        fileSignatures: [],
        issues: [
          {
            severity: "warning",
            message: "The configured repo path is not a directory, so repo truth checks are unavailable.",
          },
        ],
      };
    }

    const gitState = await detectGitSnapshotState(resolvedRepoPath);
    const fileSignatures = await buildFileSignatures(resolvedRepoPath);

    return {
      available: true,
      repoPath: resolvedRepoPath,
      capturedAt,
      runId,
      taskId,
      repoDetected: true,
      gitRepo: gitState.gitRepo,
      branchName: gitState.branchName,
      branchState: gitState.branchState,
      statusShort: gitState.statusShort,
      statusEntries: gitState.statusEntries,
      diffNameOnly: gitState.diffNameOnly,
      untrackedFiles: gitState.untrackedFiles,
      fileSignatures,
      issues: gitState.issues,
    };
  } catch (error) {
    return {
      available: false,
      repoPath: resolvedRepoPath,
      capturedAt,
      runId,
      taskId,
      repoDetected: false,
      gitRepo: false,
      branchState: "unknown",
      statusShort: [],
      statusEntries: [],
      diffNameOnly: [],
      untrackedFiles: [],
      fileSignatures: [],
      issues: [
        {
          severity: "warning",
          message:
            error instanceof Error
              ? `The repo snapshot could not be captured: ${error.message}`
              : "The repo snapshot could not be captured.",
        },
      ],
    };
  }
}
