import {
  AgentExecutionResult,
  EngineeringMemoryRecord,
  LocalRepoCheck,
  Task,
  VerificationResult,
} from "@/lib/types";
import { compactText, matchesAnyPattern, normalizePath, slugify, uniqueStrings } from "@/lib/utils";

const ACTION_PREFIX: Record<string, string> = {
  add: "add",
  build: "build",
  create: "create",
  design: "design",
  fix: "fix",
  implement: "implement",
  polish: "polish",
  refine: "refine",
  update: "update",
  wire: "wire",
};

const STOP_WORDS = new Set([
  "a",
  "an",
  "and",
  "for",
  "from",
  "in",
  "into",
  "of",
  "on",
  "or",
  "the",
  "to",
  "with",
]);

const KNOWN_FAILURE_PATTERNS = [
  {
    pattern: "async-store-access",
    test: /await(?:[\s\S]{0,80})non-async function|await isn't allowed in non-async function/i,
    error: "await in non-async function",
    fix: "Wrap the containing function with async or move the awaited call into an async helper or server action.",
  },
  {
    pattern: "react-missing-key",
    test: /each child in a list should have a unique ["']key["'] prop/i,
    error: "missing React key prop",
    fix: "Add a stable key prop for each rendered list item instead of relying on implicit ordering.",
  },
  {
    pattern: "scope-drift",
    test: /outside the allowed task boundary|unexpected changed file detected|out-of-scope file detected/i,
    error: "scope drift",
    fix: "Keep edits inside the allowed paths and revert unrelated file changes before resubmitting the run.",
  },
  {
    pattern: "build-failed",
    test: /build.*failed|next\.js build worker exited|production build/i,
    error: "local build failure",
    fix: "Fix the local build errors before claiming success and report the failing command output accurately.",
  },
  {
    pattern: "test-failed",
    test: /test command did not pass|tests passed.*failed them/i,
    error: "local test failure",
    fix: "Resolve the failing test cases locally before marking the task complete.",
  },
];

function tokenize(value: string) {
  return slugify(value)
    .split("-")
    .filter((token) => token && !STOP_WORDS.has(token));
}

function getActionPrefix(title: string) {
  const firstToken = tokenize(title)[0];

  if (!firstToken) {
    return "implement";
  }

  return ACTION_PREFIX[firstToken] ?? "implement";
}

function detectPatternKind(paths: string[]) {
  const normalizedPaths = paths.map((value) => normalizePath(value).toLowerCase());

  if (normalizedPaths.some((value) => value.includes("/api/") && value.endsWith("/route.ts"))) {
    return "next-api-route";
  }

  if (normalizedPaths.some((value) => value.includes("/app/") && value.endsWith("/page.tsx"))) {
    return "next-page";
  }

  if (normalizedPaths.some((value) => value.includes("/components/"))) {
    return "react-component";
  }

  if (normalizedPaths.some((value) => value.includes("/lib/"))) {
    return "core-lib-change";
  }

  if (normalizedPaths.some((value) => value.endsWith(".css"))) {
    return "style-update";
  }

  return "task-pattern";
}

function toDirectoryPattern(filePath: string) {
  const normalizedPath = normalizePath(filePath);
  const parts = normalizedPath.split("/");

  if (parts.length <= 1) {
    return normalizedPath;
  }

  return `${parts.slice(0, -1).join("/")}/**`;
}

function buildPattern(task: Task, paths: string[]) {
  const patternKind = detectPatternKind(paths);

  if (patternKind === "task-pattern") {
    return slugify(task.title);
  }

  return `${getActionPrefix(task.title)}-${patternKind}`;
}

function getPrimaryFinding(verification: VerificationResult) {
  return (
    verification.findings.find((item) => item.severity === "critical") ??
    verification.findings.find((item) => item.severity === "error") ??
    verification.findings.find((item) => item.severity === "warning")
  );
}

function getExampleFiles(
  result: AgentExecutionResult,
  localRepoCheck?: LocalRepoCheck,
) {
  const sourceFiles =
    localRepoCheck?.available === true && localRepoCheck.actualChangedFiles.length > 0
      ? localRepoCheck.actualChangedFiles
      : result.changedFiles;

  return uniqueStrings(sourceFiles.map((item) => normalizePath(item.path))).slice(0, 8);
}

function getScopedFiles(task: Task, exampleFiles: string[], primaryFindingPaths: string[]) {
  return uniqueStrings([
    ...task.allowedPaths.map((item) => normalizePath(item)),
    ...exampleFiles.map((item) => toDirectoryPattern(item)),
    ...primaryFindingPaths.map((item) => normalizePath(item)),
  ]).slice(0, 8);
}

function inferRepoConventions(files: string[]) {
  const normalizedFiles = files.map((item) => normalizePath(item));
  const conventions = new Set<string>();

  if (normalizedFiles.some((file) => file.startsWith("src/components/"))) {
    conventions.add("UI components live in src/components.");
  }

  if (normalizedFiles.some((file) => file.startsWith("src/lib/"))) {
    conventions.add("Logic utilities and orchestration helpers live in src/lib.");
  }

  if (normalizedFiles.some((file) => file.startsWith("src/app/api/") && file.endsWith("/route.ts"))) {
    conventions.add("Next.js API handlers live in src/app/api/**/route.ts with named HTTP exports.");
  }

  if (normalizedFiles.some((file) => file.startsWith("src/app/") && file.endsWith("/page.tsx"))) {
    conventions.add("App Router route screens live in src/app/**/page.tsx.");
  }

  if (normalizedFiles.some((file) => file.endsWith(".css"))) {
    conventions.add("Shared visual tokens and layout styling stay in the app CSS layers instead of inside logic utilities.");
  }

  return [...conventions];
}

function inferSuccessfulStrategy(task: Task, result: AgentExecutionResult, exampleFiles: string[]) {
  const patternKind = detectPatternKind(exampleFiles);
  const cannedGuidance =
    patternKind === "next-api-route"
      ? "Use Next.js route handlers in route.ts files with named HTTP exports and keep request handling close to the route."
      : patternKind === "next-page"
        ? "Keep route screens in App Router page.tsx files and push reusable logic out of the page when possible."
        : patternKind === "react-component"
          ? "Keep the UI focused in components and keep orchestration or pure helpers out of the render layer."
          : patternKind === "core-lib-change"
            ? "Keep shared engineering logic in src/lib and reuse it instead of duplicating behavior inside pages."
            : undefined;

  if (cannedGuidance) {
    return compactText(`${cannedGuidance} ${result.summary}`, 240);
  }

  return compactText(result.summary || task.instructions, 240);
}

function inferKnownFailure(args: {
  verification: VerificationResult;
  localRepoCheck?: LocalRepoCheck;
  result: AgentExecutionResult;
}) {
  const { verification, localRepoCheck, result } = args;
  const haystack = [
    ...verification.findings.map((item) => item.message),
    ...result.commands.flatMap((item) => [item.stdoutText ?? "", item.stderrText ?? ""]),
    ...result.changedFiles.map((item) => item.summary),
    ...((localRepoCheck?.commands ?? []).flatMap((item) => [item.stdoutText ?? "", item.stderrText ?? ""])),
    result.rawOutputText ?? "",
  ].join("\n");

  const known = KNOWN_FAILURE_PATTERNS.find((item) => item.test.test(haystack));

  if (known) {
    return {
      pattern: known.pattern,
      error: known.error,
      fix: known.fix,
    };
  }

  const primaryFinding = getPrimaryFinding(verification);

  if (!primaryFinding) {
    return undefined;
  }

  const fallbackFix =
    verification.outcome === "retry_required"
      ? "Tighten the implementation to satisfy the missing acceptance or build requirements, then rerun the task."
      : verification.outcome === "rollback_required"
        ? "Revert the unsafe changes, narrow the scope, and try again inside the allowed files only."
        : "Review the flagged files and command output, then resubmit with the scope corrected.";

  return {
    pattern: slugify(primaryFinding.category || "task-failure"),
    error: primaryFinding.message,
    fix: fallbackFix,
  };
}

function buildSharedFields(args: {
  projectId: string;
  task: Task;
  runId: string;
  result: AgentExecutionResult;
  localRepoCheck?: LocalRepoCheck;
  verification: VerificationResult;
}) {
  const { projectId, task, runId, result, localRepoCheck, verification } = args;
  const exampleFiles = getExampleFiles(result, localRepoCheck);
  const primaryFindingPaths = uniqueStrings(
    (getPrimaryFinding(verification)?.paths ?? []).map((item) => normalizePath(item)),
  );
  const repoConventions = inferRepoConventions(exampleFiles);

  return {
    pattern: buildPattern(task, exampleFiles),
    title: task.title,
    files: getScopedFiles(task, exampleFiles, primaryFindingPaths),
    exampleFiles,
    repoConventions,
    sourceProjectId: projectId,
    sourceTaskId: task.id,
    sourceTaskTitle: task.title,
    sourceRunId: runId,
    timestamp: new Date().toISOString(),
  };
}

export function buildEngineeringMemories(args: {
  projectId: string;
  task: Task;
  runId: string;
  result: AgentExecutionResult;
  verification: VerificationResult;
  localRepoCheck?: LocalRepoCheck;
}) {
  const { projectId, task, runId, result, verification, localRepoCheck } = args;
  const sharedFields = buildSharedFields({
    projectId,
    task,
    runId,
    result,
    verification,
    localRepoCheck,
  });
  const records: EngineeringMemoryRecord[] = [];
  const confidence = Number((verification.score.overall / 100).toFixed(2));

  if (verification.outcome === "accepted") {
    records.push({
      id: crypto.randomUUID(),
      memoryType: "success",
      pattern: sharedFields.pattern,
      title: sharedFields.title,
      files: sharedFields.files,
      successfulStrategy: inferSuccessfulStrategy(task, result, sharedFields.exampleFiles),
      confidence,
      repoConventions: sharedFields.repoConventions,
      verificationResult: verification.outcome,
      exampleFiles: sharedFields.exampleFiles,
      occurrenceCount: 1,
      sourceProjectId: sharedFields.sourceProjectId,
      sourceTaskId: sharedFields.sourceTaskId,
      sourceTaskTitle: sharedFields.sourceTaskTitle,
      sourceRunId: sharedFields.sourceRunId,
      timestamp: sharedFields.timestamp,
    });
  } else {
    const knownFailure = inferKnownFailure({ verification, localRepoCheck, result });
    const primaryFinding = getPrimaryFinding(verification);

    if (knownFailure || primaryFinding) {
      records.push({
        id: crypto.randomUUID(),
        memoryType: "mistake",
        pattern: knownFailure?.pattern ?? sharedFields.pattern,
        title: sharedFields.title,
        files: sharedFields.files,
        mistakeToAvoid: compactText(
          primaryFinding?.message ?? knownFailure?.error ?? "This pattern caused retry or review work before.",
          240,
        ),
        knownError: knownFailure?.error,
        recommendedFix: knownFailure?.fix,
        confidence,
        repoConventions: sharedFields.repoConventions,
        verificationResult: verification.outcome,
        exampleFiles: uniqueStrings([
          ...sharedFields.exampleFiles,
          ...((primaryFinding?.paths ?? []).map((item) => normalizePath(item))),
        ]).slice(0, 8),
        occurrenceCount: 1,
        sourceProjectId: sharedFields.sourceProjectId,
        sourceTaskId: sharedFields.sourceTaskId,
        sourceTaskTitle: sharedFields.sourceTaskTitle,
        sourceRunId: sharedFields.sourceRunId,
        timestamp: sharedFields.timestamp,
      });
    }
  }

  return records;
}

export function upsertEngineeringMemories(
  existing: EngineeringMemoryRecord[],
  incoming: EngineeringMemoryRecord[],
) {
  const next = [...existing];

  for (const record of incoming) {
    const duplicateIndex = next.findIndex(
      (candidate) =>
        candidate.memoryType === record.memoryType &&
        candidate.pattern === record.pattern &&
        candidate.verificationResult === record.verificationResult,
    );

    if (duplicateIndex === -1) {
      next.unshift(record);
      continue;
    }

    const existingRecord = next[duplicateIndex];
    next[duplicateIndex] = {
      ...existingRecord,
      files: uniqueStrings([...existingRecord.files, ...record.files]).slice(0, 8),
      exampleFiles: uniqueStrings([
        ...record.exampleFiles,
        ...existingRecord.exampleFiles,
      ]).slice(0, 8),
      successfulStrategy: record.successfulStrategy ?? existingRecord.successfulStrategy,
      mistakeToAvoid: record.mistakeToAvoid ?? existingRecord.mistakeToAvoid,
      knownError: record.knownError ?? existingRecord.knownError,
      recommendedFix: record.recommendedFix ?? existingRecord.recommendedFix,
      confidence: Math.max(record.confidence ?? 0, existingRecord.confidence ?? 0),
      repoConventions: uniqueStrings([
        ...(existingRecord.repoConventions ?? []),
        ...(record.repoConventions ?? []),
      ]),
      occurrenceCount: existingRecord.occurrenceCount + 1,
      sourceProjectId: record.sourceProjectId,
      sourceTaskId: record.sourceTaskId,
      sourceTaskTitle: record.sourceTaskTitle,
      sourceRunId: record.sourceRunId,
      timestamp: record.timestamp,
    };
  }

  return next.sort((left, right) => right.timestamp.localeCompare(left.timestamp));
}

function getPatternRoot(value: string) {
  return normalizePath(value).split("*")[0].replace(/\/+$/, "");
}

function overlapsTaskScope(record: EngineeringMemoryRecord, task: Task) {
  return (
    record.exampleFiles.some((file) => matchesAnyPattern(file, task.allowedPaths)) ||
    record.files.some((pattern) => {
      const recordRoot = getPatternRoot(pattern);
      return task.allowedPaths.some((allowedPattern) => {
        const allowedRoot = getPatternRoot(allowedPattern);
        return (
          (recordRoot && allowedRoot && recordRoot.startsWith(allowedRoot)) ||
          (recordRoot && allowedRoot && allowedRoot.startsWith(recordRoot))
        );
      });
    })
  );
}

function getTokenOverlapScore(record: EngineeringMemoryRecord, task: Task) {
  const taskTokens = new Set([...tokenize(task.title), ...tokenize(task.objective)]);
  const recordTokens = new Set([...tokenize(record.pattern), ...tokenize(record.title)]);
  let score = 0;

  for (const token of recordTokens) {
    if (taskTokens.has(token)) {
      score += 1;
    }
  }

  return score;
}

export function getRelevantEngineeringMemories(
  memories: EngineeringMemoryRecord[],
  task: Task,
  limit = 4,
) {
  return memories
    .map((record) => {
      let score = getTokenOverlapScore(record, task);

      if (overlapsTaskScope(record, task)) {
        score += 5;
      }

      if (record.memoryType === "success") {
        score += 1;
      }

      return { record, score };
    })
    .filter((item) => item.score > 0)
    .sort((left, right) => {
      if (right.score !== left.score) {
        return right.score - left.score;
      }

      if (right.record.occurrenceCount !== left.record.occurrenceCount) {
        return right.record.occurrenceCount - left.record.occurrenceCount;
      }

      return right.record.timestamp.localeCompare(left.record.timestamp);
    })
    .slice(0, limit)
    .map((item) => item.record);
}
