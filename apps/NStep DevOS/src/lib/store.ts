import { promises as fs } from "node:fs";
import os from "node:os";
import path from "node:path";

import {
  AgentExecutionResult,
  AppStore,
  CreateProjectInput,
  EngineeringMemoryRecord,
  ExecutionMode,
  ManualProvider,
  NextTaskDecision,
  Project,
  ProviderConfig,
  ResultSource,
  RunProvider,
  SupervisorIntervention,
  Task,
  TaskRun,
  VerificationResult,
} from "@/lib/types";
import {
  buildMilestoneBlueprints,
  buildProjectSlug,
  buildStructuredSpec,
  buildTaskPacket,
  buildTaskBlueprints,
  createMilestone,
  instantiateTask,
} from "@/lib/planner";
import { buildMasterPrompt, buildResultTemplate } from "@/lib/prompt";
import {
  findSimilarPatterns,
  mergePatternMemory,
  recordFailurePattern,
  recordSuccessPattern,
  suggestStrategy,
} from "@/lib/pattern-memory";
import {
  dispatchConnectedRun,
  syncConnectedRunState,
} from "@/lib/provider-adapters";
import { runAllVerificationCommands } from "@/lib/command-runner";
import { captureRepoSnapshot } from "@/lib/repo-inspector";
import { buildRepoComparison } from "@/lib/repo-verifier";
import { buildLocalRepoCheck, detectActualChangedFiles } from "@/lib/snapshot-store";
import { verifyRun } from "@/lib/verifier";
import { compactText, getActiveTask } from "@/lib/utils";

function resolveStorePath() {
  if (process.env.NSS_DEVOS_STORE_PATH) {
    return process.env.NSS_DEVOS_STORE_PATH;
  }

  if (process.env.NDO_STORE_PATH) {
    return process.env.NDO_STORE_PATH;
  }

  const baseDir =
    process.env.LOCALAPPDATA
      ? path.join(process.env.LOCALAPPDATA, "NSS DevOS")
      : path.join(os.homedir(), ".nss-devos");

  return path.join(baseDir, "store.json");
}

function resolvePreviousStorePath() {
  return process.env.LOCALAPPDATA
    ? path.join(process.env.LOCALAPPDATA, "NSS Dev Orchestrator", "store.json")
    : path.join(os.homedir(), ".nss-dev-orchestrator", "store.json");
}

function resolveLegacyStorePath() {
  return path.join(process.cwd(), "data", "store.json");
}

function getRequiredConnectedProviderEnvName(
  connectedProvider: ProviderConfig["connectedProvider"],
  apiKeyHint?: string,
) {
  if (connectedProvider === "codex-api") {
    return apiKeyHint?.trim() || "OPENAI_API_KEY";
  }

  return apiKeyHint?.trim() || undefined;
}

function deriveProviderConnectionStatus(
  connectedProvider: ProviderConfig["connectedProvider"],
  baseUrl?: string,
  model?: string,
  apiKeyHint?: string,
): ProviderConfig["connectionStatus"] {
  if (connectedProvider === "mock-connected") {
    return "mock_ready";
  }

  if (connectedProvider === "codex-api") {
    const envName = getRequiredConnectedProviderEnvName(connectedProvider, apiKeyHint);

    return envName && process.env[envName]?.trim() ? "configured" : "not_configured";
  }

  if (baseUrl?.trim() || model?.trim() || apiKeyHint?.trim()) {
    return "configured";
  }

  return "not_configured";
}

function normalizeProviderConfig(options: {
  executionMode?: ExecutionMode;
  providerConfig?: Partial<ProviderConfig>;
  manualProvider?: ManualProvider;
  connectedProvider?: ProviderConfig["connectedProvider"];
  providerBaseUrl?: string;
  providerModel?: string;
  providerApiKeyHint?: string;
}) {
  const manualProvider =
    options.manualProvider ?? options.providerConfig?.manualProvider ?? "codex-app";
  const connectedProvider =
    options.connectedProvider ??
    options.providerConfig?.connectedProvider ??
    "mock-connected";
  const baseUrl =
    options.providerBaseUrl?.trim() || options.providerConfig?.baseUrl?.trim() || undefined;
  const model =
    options.providerModel?.trim() || options.providerConfig?.model?.trim() || undefined;
  const apiKeyHint =
    options.providerApiKeyHint?.trim() ||
    options.providerConfig?.apiKeyHint?.trim() ||
    undefined;
  const executionMode = options.executionMode ?? "manual";

  return {
    manualProvider,
    connectedProvider,
    connectionStatus: deriveProviderConnectionStatus(
      connectedProvider,
      baseUrl,
      model,
      apiKeyHint,
    ),
    baseUrl,
    model,
    apiKeyHint,
    autoDispatchEnabled:
      options.providerConfig?.autoDispatchEnabled ??
      (executionMode === "connected" && connectedProvider === "mock-connected"),
    autoIngestEnabled: options.providerConfig?.autoIngestEnabled ?? false,
    autopilotEnabled: options.providerConfig?.autopilotEnabled ?? false,
  } satisfies ProviderConfig;
}

function getProjectCreationAutomationDefaults(
  executionMode: ExecutionMode,
  connectedProvider: ProviderConfig["connectedProvider"],
) {
  const enableConnectedAutomation =
    executionMode === "connected" &&
    (connectedProvider === "mock-connected" || connectedProvider === "codex-api");

  return {
    autoDispatchEnabled: enableConnectedAutomation,
    autoIngestEnabled: enableConnectedAutomation,
    autopilotEnabled: enableConnectedAutomation,
  };
}

function canAutoStartInitialRun(project: Project) {
  return (
    project.executionMode === "connected" &&
    project.providerConfig.autoDispatchEnabled &&
    project.providerConfig.autoIngestEnabled &&
    project.providerConfig.autopilotEnabled &&
    (project.providerConfig.connectedProvider === "mock-connected" ||
      project.providerConfig.connectedProvider === "codex-api")
  );
}

function describeInitialRunAutostartSkip(project: Project) {
  if (project.executionMode !== "connected") {
    return "Manual mode leaves task one ready for an operator to start.";
  }

  if (project.providerConfig.connectedProvider === "antigravity-api") {
    return "Task one was not auto-started because Antigravity API is still a planned connected adapter.";
  }

  if (project.providerConfig.connectedProvider === "ollama-code-api") {
    return "Task one was not auto-started because Ollama Code automation is still a planned connected adapter.";
  }

  return "Task one was not auto-started because connected automation is not fully enabled for this provider configuration.";
}

function buildDispatchNote(
  executionMode: ExecutionMode,
  provider: RunProvider,
  providerConfig: ProviderConfig,
) {
  if (executionMode === "connected") {
    if (providerConfig.connectedProvider === "mock-connected") {
      return `Connected mode is on. NSS staged this run for ${provider}, but this step still uses pasted-result fallback until automatic provider ingestion is finished.`;
    }

    if (providerConfig.connectedProvider === "codex-api") {
      return `Connected mode is on. NSS can dispatch this run directly to Codex API when auto-dispatch is enabled. The fallback prompt stays available for recovery.`;
    }

    return `Connected mode is on. NSS prepared provider metadata for ${provider}, but this step still falls back to pasted results until direct dispatch and ingestion are completed.`;
  }

  return `Manual mode is on. Copy the generated prompt into ${provider} and paste the structured JSON result back into NSS DevOS.`;
}

async function ensureStore() {
  const storePath = resolveStorePath();
  await fs.mkdir(path.dirname(storePath), { recursive: true });

  try {
    await fs.access(storePath);
  } catch {
    const previousStorePath = resolvePreviousStorePath();
    const legacyStorePath = resolveLegacyStorePath();

    try {
      if (previousStorePath !== storePath) {
        await fs.access(previousStorePath);
        await fs.copyFile(previousStorePath, storePath);
        return;
      }
    } catch {}

    try {
      if (legacyStorePath !== storePath) {
        await fs.access(legacyStorePath);
        await fs.copyFile(legacyStorePath, storePath);
        return;
      }
    } catch {}

    const emptyStore: AppStore = { projects: [], engineeringMemory: [] };
    await fs.writeFile(storePath, JSON.stringify(emptyStore, null, 2), "utf8");
  }
}

async function readStore(): Promise<AppStore> {
  await ensureStore();
  const raw = await fs.readFile(resolveStorePath(), "utf8");
  const parsed = JSON.parse(raw) as AppStore;

  return {
    engineeringMemory: parsed.engineeringMemory ?? [],
    projects: parsed.projects.map((project) => {
      const executionMode = project.executionMode ?? "manual";
      const providerConfig = normalizeProviderConfig({
        executionMode,
        providerConfig: project.providerConfig,
      });
      const milestoneBlueprints =
        project.milestoneBlueprints && project.milestoneBlueprints.length > 0
          ? project.milestoneBlueprints
          : buildMilestoneBlueprints({
              name: project.name,
              rawBrief: project.rawBrief,
              targetMvp: project.targetMvp,
              repoPath: project.repoPath,
              defaultBranch: project.defaultBranch,
              primaryPaths: project.primaryPaths,
              executionMode,
              manualProvider: providerConfig.manualProvider,
              connectedProvider: providerConfig.connectedProvider,
              providerBaseUrl: providerConfig.baseUrl,
              providerModel: providerConfig.model,
              providerApiKeyHint: providerConfig.apiKeyHint,
              verificationCommands: project.verificationCommands,
            });
      const taskBlueprints =
        project.taskBlueprints && project.taskBlueprints.length > 0
          ? project.taskBlueprints
          : milestoneBlueprints.flatMap((milestone) => milestone.taskBlueprints);
      const structuredSpec =
        project.structuredSpec?.productType &&
        project.structuredSpec.productType !== "supervised build orchestration"
          ? project.structuredSpec
          : buildStructuredSpec({
              name: project.name,
              rawBrief: project.rawBrief,
              targetMvp: project.targetMvp,
              repoPath: project.repoPath,
              defaultBranch: project.defaultBranch,
              primaryPaths: project.primaryPaths,
              executionMode,
              manualProvider: providerConfig.manualProvider,
              connectedProvider: providerConfig.connectedProvider,
              providerBaseUrl: providerConfig.baseUrl,
              providerModel: providerConfig.model,
              providerApiKeyHint: providerConfig.apiKeyHint,
              verificationCommands: project.verificationCommands,
            });
      const firstTask = project.tasks[0];
      const milestones = project.milestones.map((milestone, index) => ({
        ...milestone,
        key: milestone.key ?? milestoneBlueprints[index]?.key ?? `legacy-stage-${index + 1}`,
      }));
      const runs = project.runs.map((run) => {
        const runExecutionMode = run.executionMode ?? executionMode;
        const runProvider =
          run.provider ??
          (runExecutionMode === "connected"
            ? providerConfig.connectedProvider
            : providerConfig.manualProvider);
        const snapshotBefore = run.snapshotBefore ?? run.workspaceSnapshot;
        const localRepoCheck = run.localRepoCheck ?? run.localWorkspaceCheck;
        const snapshotAfter =
          run.snapshotAfter ??
          localRepoCheck?.snapshotAfter ??
          localRepoCheck?.snapshotBefore ??
          undefined;

        return {
          ...run,
          provider: runProvider,
          executionMode: runExecutionMode,
          providerRunId: run.providerRunId,
          providerState:
            run.providerState ??
            (runExecutionMode === "connected"
              ? run.parsedResult
                ? "completed"
                : run.status === "waiting_on_provider"
                  ? "running"
                  : "staged"
              : undefined),
          providerStateDetail:
            run.providerStateDetail ??
            (runExecutionMode === "connected"
              ? run.parsedResult
                ? "This connected run already has a provider result attached."
                : run.status === "waiting_on_provider"
                  ? "NSS is waiting for the next connected-provider update."
                  : "Connected provider metadata is available for this run."
              : undefined),
          lastProviderSyncAt: run.lastProviderSyncAt,
          dispatchNote:
            run.dispatchNote ?? buildDispatchNote(runExecutionMode, runProvider, providerConfig),
          snapshotBefore,
          snapshotAfter,
          actualChangedFiles:
            run.actualChangedFiles ??
            localRepoCheck?.actualChangedFiles ??
            (localRepoCheck as { changedFiles?: typeof run.actualChangedFiles } | undefined)
              ?.changedFiles ??
            [],
          localCommandReports:
            run.localCommandReports ?? localRepoCheck?.commands ?? [],
          repoComparison:
            run.repoComparison ??
            localRepoCheck?.comparison ?? {
              matchedFiles: [],
              missingReportedFiles: [],
              unexpectedActualFiles: [],
              outsideAllowedFiles: [],
              forbiddenFiles: [],
              untrackedFiles: [],
              integrityWarnings: [],
            },
          resultSource: run.resultSource ?? (run.parsedResult ? "manual_paste" : undefined),
          localRepoCheck,
          workspaceSnapshot: snapshotBefore,
          localWorkspaceCheck: localRepoCheck,
        };
      });

      return {
        ...project,
        executionMode,
        providerConfig,
        structuredSpec,
        milestones,
        milestoneBlueprints,
        taskBlueprints,
        runs,
        interventionLog: project.interventionLog ?? [],
        firstTaskPacket:
          project.firstTaskPacket ??
          (firstTask ? buildTaskPacket(firstTask, project.verificationCommands) : undefined),
      };
    }),
  };
}

async function writeStore(store: AppStore) {
  await fs.writeFile(resolveStorePath(), JSON.stringify(store, null, 2), "utf8");
}

async function mutateStore<T>(mutator: (store: AppStore) => T | Promise<T>) {
  const store = await readStore();
  const result = await mutator(store);
  await writeStore(store);
  return result;
}

export async function getProjects() {
  const store = await readStore();
  return store.projects.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export async function getProject(projectId: string) {
  const store = await readStore();
  return store.projects.find((project) => project.id === projectId);
}

export async function getProjectEngineeringMemories(projectId: string, limit = 6) {
  const store = await readStore();
  const project = store.projects.find((item) => item.id === projectId);

  if (!project) {
    return [] as EngineeringMemoryRecord[];
  }

  const activeTask = getActiveTask(project);

  if (activeTask) {
    return findSimilarPatterns(store.engineeringMemory, activeTask, limit);
  }

  return store.engineeringMemory.slice(0, limit);
}

export async function getTaskEngineeringMemories(
  projectId: string,
  taskId: string,
  limit = 6,
) {
  const store = await readStore();
  const project = store.projects.find((item) => item.id === projectId);

  if (!project) {
    return [] as EngineeringMemoryRecord[];
  }

  const task = project.tasks.find((item) => item.id === taskId);

  if (!task) {
    return [] as EngineeringMemoryRecord[];
  }

  return findSimilarPatterns(store.engineeringMemory, task, limit);
}

export async function createProject(input: CreateProjectInput) {
  return mutateStore(async (store) => {
    const automationDefaults = getProjectCreationAutomationDefaults(
      input.executionMode,
      input.connectedProvider,
    );
    const providerConfig = normalizeProviderConfig({
      executionMode: input.executionMode,
      providerConfig: automationDefaults,
      manualProvider: input.manualProvider,
      connectedProvider: input.connectedProvider,
      providerBaseUrl: input.providerBaseUrl,
      providerModel: input.providerModel,
      providerApiKeyHint: input.providerApiKeyHint,
    });
    const milestoneBlueprints = buildMilestoneBlueprints(input);
    const milestone = createMilestone(milestoneBlueprints[0]);
    const structuredSpec = buildStructuredSpec(input);
    const taskBlueprints = buildTaskBlueprints(input);
    const firstTask = instantiateTask(taskBlueprints[0], milestone.id, 1);
    const now = new Date().toISOString();

    const project: Project = {
      id: crypto.randomUUID(),
      name: input.name.trim(),
      slug: buildProjectSlug(input.name),
      rawBrief: input.rawBrief.trim(),
      targetMvp: input.targetMvp?.trim(),
      repoPath: input.repoPath.trim(),
      defaultBranch: input.defaultBranch.trim() || "main",
      primaryPaths: input.primaryPaths,
      executionMode: input.executionMode,
      providerConfig,
      verificationCommands: input.verificationCommands,
      structuredSpec,
      firstTaskPacket: buildTaskPacket(firstTask, input.verificationCommands),
      milestones: [milestone],
      milestoneBlueprints,
      tasks: [firstTask],
      runs: [],
      interventionLog: [],
      taskBlueprints,
      roadmapCursor: 0,
      decisionLog: [
        {
          id: crypto.randomUUID(),
          createdAt: now,
          actor: "planner",
          title: "Project planned",
          detail: `Created the first milestone and generated the first bounded task for ${input.executionMode === "connected" ? "connected-provider automation" : "manual execution"}.`,
          relatedTaskId: firstTask.id,
        },
      ],
      status: "active",
      createdAt: now,
      updatedAt: now,
    };

    store.projects.unshift(project);
    let initialRun: TaskRun | undefined;
    let initialRunError: string | undefined;

    if (canAutoStartInitialRun(project)) {
      try {
        initialRun = await createTaskRunInProject(project, firstTask, store.engineeringMemory);
        project.decisionLog.unshift({
          id: crypto.randomUUID(),
          createdAt: new Date().toISOString(),
          actor: "supervisor",
          title: "Initial connected run started automatically",
          detail: `NSS DevOS auto-started task one immediately after planning because ${project.providerConfig.connectedProvider} is configured for connected automation.`,
          relatedTaskId: firstTask.id,
          relatedRunId: initialRun.id,
        });
      } catch (error) {
        initialRunError =
          error instanceof Error
            ? error.message
            : "Task one could not be started automatically.";
        project.decisionLog.unshift({
          id: crypto.randomUUID(),
          createdAt: new Date().toISOString(),
          actor: "supervisor",
          title: "Initial connected run did not auto-start",
          detail: initialRunError,
          relatedTaskId: firstTask.id,
        });
      }
    } else {
      project.decisionLog.unshift({
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
        actor: "supervisor",
        title: "Initial run left ready",
        detail: describeInitialRunAutostartSkip(project),
        relatedTaskId: firstTask.id,
      });
    }

    return {
      project,
      initialRun,
      initialRunError,
    };
  });
}

function getTaskOrThrow(project: Project, taskId: string) {
  const task = project.tasks.find((item) => item.id === taskId);

  if (!task) {
    throw new Error("Task not found.");
  }

  return task;
}

function getMilestoneOrThrow(project: Project, milestoneId: string) {
  const milestone = project.milestones.find((item) => item.id === milestoneId);

  if (!milestone) {
    throw new Error("Milestone not found.");
  }

  return milestone;
}

function getMilestoneBlueprintOrThrow(project: Project, milestoneKey: string) {
  const blueprint = project.milestoneBlueprints.find((item) => item.key === milestoneKey);

  if (!blueprint) {
    throw new Error("Milestone blueprint not found.");
  }

  return blueprint;
}

function getNextTaskBlueprint(project: Project) {
  return project.taskBlueprints[project.roadmapCursor + 1];
}

function getRunOrThrow(project: Project, runId: string) {
  const run = project.runs.find((item) => item.id === runId);

  if (!run) {
    throw new Error("Run not found.");
  }

  return run;
}

function createDecisionForAcceptedTask(project: Project): NextTaskDecision {
  const nextBlueprint = getNextTaskBlueprint(project);

  if (!nextBlueprint) {
    return {
      action: "complete_milestone",
      reason:
        "This accepted run completed the final planned task in the current milestone.",
    };
  }

  return {
    action: "generate_next_task",
    reason:
      "The task passed verification, so the supervisor generated the next bounded task.",
    nextTaskId: "",
  };
}

function clearTaskSupervisorGuidance(task: Task) {
  delete task.supervisorGuidance;
  delete task.supervisorGuidanceUpdatedAt;
}

function setTaskSupervisorGuidance(task: Task, guidance: string, updatedAt: string) {
  task.supervisorGuidance = guidance.trim();
  task.supervisorGuidanceUpdatedAt = updatedAt;
}

function formatVerificationGuidance(verification?: VerificationResult) {
  const findings = verification?.findings.filter((item) => item.severity !== "info") ?? [];

  if (findings.length === 0) {
    return "Reattempt the task carefully and keep the work tightly inside the existing task boundary.";
  }

  return findings
    .slice(0, 4)
    .map((item, index) => {
      const paths =
        item.paths && item.paths.length > 0
          ? ` Relevant paths: ${item.paths.join(", ")}.`
          : "";
      return `${index + 1}. ${item.message}${paths}`;
    })
    .join("\n");
}

function buildSupervisorGuidance(args: {
  task: Task;
  run: TaskRun;
  operatorNote?: string;
  rollbackComplete?: boolean;
}) {
  const rollbackComplete = args.rollbackComplete === true;
  const parts = [
    `Supervisor follow-up for ${args.task.title}:`,
    rollbackComplete
      ? "Assume the previous risky change has already been cleaned up in the repo before you start."
      : "Use the previous verifier findings as the correction target for this retry.",
    formatVerificationGuidance(args.run.verification),
  ];

  if (args.operatorNote?.trim()) {
    parts.push(`Operator note: ${args.operatorNote.trim()}`);
  }

  parts.push(
    "Do not broaden scope. Fix only the flagged issues, then return the normal bounded result JSON.",
  );

  return parts.join("\n\n");
}

function getRollbackVerificationPaths(run: TaskRun) {
  const comparison = run.repoComparison ?? run.localRepoCheck?.comparison;
  const findingPaths =
    run.verification?.findings
      .filter(
        (item) =>
          item.category === "forbidden_files" || item.category === "allowed_files",
      )
      .flatMap((item) => item.paths ?? []) ?? [];

  return [...new Set([
    ...(comparison?.forbiddenFiles ?? []),
    ...(comparison?.outsideAllowedFiles ?? []),
    ...findingPaths,
  ])].sort();
}

async function verifyRollbackCompleted(project: Project, task: Task, run: TaskRun) {
  const snapshotBefore = run.snapshotBefore ?? run.workspaceSnapshot;

  if (!snapshotBefore?.available) {
    throw new Error(
      "NSS DevOS cannot verify rollback completion because the original repo snapshot for this run is unavailable.",
    );
  }

  const riskyPaths = getRollbackVerificationPaths(run);

  if (riskyPaths.length === 0) {
    throw new Error(
      "NSS DevOS could not identify the risky files from this run, so rollback completion cannot be verified automatically.",
    );
  }

  const currentSnapshot = await captureRepoSnapshot(project.repoPath, run.id, task.id);

  if (!currentSnapshot.available) {
    throw new Error(
      "NSS DevOS cannot verify rollback completion because the current repo snapshot is unavailable.",
    );
  }

  const remainingChangedFiles = detectActualChangedFiles(snapshotBefore, currentSnapshot);
  const remainingRiskyPaths = remainingChangedFiles
    .map((item) => item.path)
    .filter((filePath) => riskyPaths.includes(filePath));

  if (remainingRiskyPaths.length > 0) {
    throw new Error(
      `Rollback is not complete yet. These risky files still differ from the pre-run snapshot: ${remainingRiskyPaths.join(", ")}.`,
    );
  }

  return {
    verifiedAt: currentSnapshot.capturedAt,
    riskyPaths,
    currentSnapshot,
  };
}

async function advanceAcceptedRun(args: {
  project: Project;
  task: Task;
  run: TaskRun;
  engineeringMemory: EngineeringMemoryRecord[];
  now: string;
  acceptedPrefix?: string;
}) {
  const { project, task, run, engineeringMemory, now, acceptedPrefix } = args;
  const milestone = getMilestoneOrThrow(project, task.milestoneId);

  task.status = "completed";
  task.completedAt = now;
  clearTaskSupervisorGuidance(task);

  const decision = createDecisionForAcceptedTask(project);

  if (decision.action === "generate_next_task") {
    const nextBlueprint = getNextTaskBlueprint(project);

    if (nextBlueprint) {
      let targetMilestone =
        project.milestones.find((item) => item.key === nextBlueprint.milestoneKey) ?? null;

      if (!targetMilestone) {
        const nextMilestoneBlueprint = getMilestoneBlueprintOrThrow(
          project,
          nextBlueprint.milestoneKey,
        );

        milestone.status = "completed";
        targetMilestone = createMilestone(nextMilestoneBlueprint);
        project.milestones.push(targetMilestone);
      }

      const nextTask = instantiateTask(
        nextBlueprint,
        targetMilestone.id,
        project.tasks.length + 1,
      );
      project.tasks.push(nextTask);
      project.roadmapCursor += 1;
      decision.nextTaskId = nextTask.id;
      decision.reason = acceptedPrefix
        ? `${acceptedPrefix} ${nextTask.title} is now ready as the next bounded task.`
        : `Accepted. ${nextTask.title} is now ready as the next bounded task.`;

      if (shouldAutopilot(project)) {
        const autopilotRun = await createTaskRunInProject(project, nextTask, engineeringMemory);
        decision.autopilotRunId = autopilotRun.id;
        decision.reason = acceptedPrefix
          ? `${acceptedPrefix} ${nextTask.title} is now active and NSS already started the next connected run automatically.`
          : `Accepted. ${nextTask.title} is now active and NSS already started the next connected run automatically.`;
        project.decisionLog.unshift({
          id: crypto.randomUUID(),
          createdAt: now,
          actor: "supervisor",
          title: "Autopilot started the next run",
          detail: `NSS started ${nextTask.title} automatically after accepting the previous connected run.`,
          relatedTaskId: nextTask.id,
          relatedRunId: autopilotRun.id,
        });
      }
    }
  } else {
    milestone.status = "completed";
    project.status = "completed";
    decision.reason = acceptedPrefix
      ? `${acceptedPrefix} This run completed the final planned task in the current milestone.`
      : "Accepted. This run completed the final planned task in the current milestone.";
  }

  run.status = "accepted";
  return decision;
}

function shouldAutopilot(project: Project) {
  return (
    project.executionMode === "connected" &&
    project.providerConfig.autoDispatchEnabled &&
    project.providerConfig.autoIngestEnabled &&
    project.providerConfig.autopilotEnabled
  );
}

const MAX_AUTOMATIC_RETRY_ATTEMPTS = 3;

function canAutomaticallyRetryRun(args: {
  project: Project;
  task: Task;
  run: TaskRun;
  parsedResult: AgentExecutionResult;
  verification: VerificationResult;
}) {
  const { project, task, run, parsedResult, verification } = args;

  if (!shouldAutopilot(project) || verification.outcome !== "retry_required") {
    return false;
  }

  if (parsedResult.status !== "succeeded" || parsedResult.blocker) {
    return false;
  }

  if (task.attemptCount >= MAX_AUTOMATIC_RETRY_ATTEMPTS) {
    return false;
  }

  return run.provider === "codex-api" || run.provider === "mock-connected";
}

function canAutomaticallyRecoverProviderFailure(args: {
  project: Project;
  task: Task;
  run: TaskRun;
  parsedResult: AgentExecutionResult;
  verification: VerificationResult;
  resultSource: ResultSource;
}) {
  const { project, task, run, parsedResult, verification, resultSource } = args;

  if (!shouldAutopilot(project) || resultSource !== "connected_auto_ingest") {
    return false;
  }

  if (verification.outcome !== "retry_required") {
    return false;
  }

  if (task.attemptCount >= MAX_AUTOMATIC_RETRY_ATTEMPTS) {
    return false;
  }

  if (run.provider !== "codex-api") {
    return false;
  }

  if (!["failed", "timed_out"].includes(parsedResult.status)) {
    return false;
  }

  return true;
}

function buildProviderRecoveryGuidance(args: {
  task: Task;
  run: TaskRun;
  parsedResult: AgentExecutionResult;
}) {
  const providerOutput = args.parsedResult.rawOutputText?.trim();
  const parts = [
    `Supervisor recovery for ${args.task.title}:`,
    "The previous connected-provider attempt did not return an acceptable structured result.",
    `Provider summary: ${args.parsedResult.summary}`,
    "Retry the same bounded task. Return valid JSON matching the NSS DevOS result schema exactly.",
  ];

  if (providerOutput) {
    parts.push(`Provider output excerpt: ${compactText(providerOutput, 280)}`);
  }

  parts.push(
    "Do not broaden scope. If work was not completed, finish only this task and report the real changed files and command results.",
  );

  return parts.join("\n\n");
}

function validateAutomationSettings(providerConfig: ProviderConfig) {
  if (!providerConfig.autoDispatchEnabled && providerConfig.autoIngestEnabled) {
    throw new Error("Auto-ingest requires auto-dispatch to be enabled first.");
  }

  if (
    providerConfig.autopilotEnabled &&
    (!providerConfig.autoDispatchEnabled || !providerConfig.autoIngestEnabled)
  ) {
    throw new Error(
      "Autopilot requires both auto-dispatch and auto-ingest to be enabled.",
    );
  }
}

async function createTaskRunInProject(
  project: Project,
  task: Task,
  engineeringMemory: EngineeringMemoryRecord[],
  provider?: ManualProvider,
) {
  if (!["ready", "needs_retry", "needs_review"].includes(task.status)) {
    throw new Error("This task is not ready for a new run.");
  }

  if (
    project.executionMode === "connected" &&
    project.providerConfig.connectionStatus === "not_configured"
  ) {
    const envName = getRequiredConnectedProviderEnvName(
      project.providerConfig.connectedProvider,
      project.providerConfig.apiKeyHint,
    );

    throw new Error(
      project.providerConfig.connectedProvider === "codex-api"
        ? `Connected mode is selected, but ${envName} is not set in the server environment for Codex API dispatch.`
        : "Connected mode is selected, but the project does not have connected provider settings yet.",
    );
  }

  const runProvider: RunProvider =
    project.executionMode === "connected"
      ? project.providerConfig.connectedProvider
      : provider ?? project.providerConfig.manualProvider;

  const now = new Date().toISOString();
  const run: TaskRun = {
    id: crypto.randomUUID(),
    projectId: project.id,
    taskId: task.id,
    attemptNumber: task.attemptCount + 1,
    provider: runProvider,
    executionMode: project.executionMode,
    providerRunId:
      project.executionMode === "connected"
        ? `staged-${crypto.randomUUID().slice(0, 12)}`
        : undefined,
    dispatchNote: buildDispatchNote(project.executionMode, runProvider, project.providerConfig),
    status: "awaiting_submission",
    prompt: "",
    expectedResultTemplate: "",
    createdAt: now,
    updatedAt: now,
  };

  if (project.executionMode === "manual") {
    project.providerConfig.manualProvider = runProvider as ManualProvider;
  }

  run.snapshotBefore = await captureRepoSnapshot(project.repoPath, run.id, task.id);
  run.workspaceSnapshot = run.snapshotBefore;
  const relevantMemories = findSimilarPatterns(engineeringMemory, task);
  const memorySuggestion = suggestStrategy(engineeringMemory, task);
  run.expectedResultTemplate = buildResultTemplate(project, task, run);
  run.memoryIds = relevantMemories.map((item) => item.id);
  run.prompt = buildMasterPrompt(project, task, run, memorySuggestion);

  if (project.executionMode === "connected" && project.providerConfig.autoDispatchEnabled) {
    const dispatch = await dispatchConnectedRun(project, task, run, project.providerConfig);
    run.providerRunId = dispatch.providerRunId;
    run.providerState = dispatch.providerState;
    run.providerStateDetail = dispatch.providerStateDetail;
    run.dispatchNote = dispatch.dispatchNote;
    run.lastProviderSyncAt = now;
    run.status = dispatch.runStatus;
  }

  task.status = "in_progress";
  task.attemptCount += 1;
  project.runs.unshift(run);
  project.updatedAt = now;

  return run;
}

function getPrimaryVerificationMessage(
  verification: VerificationResult,
  fallback: string,
) {
  const primaryFinding =
    verification.findings.find((item) => item.severity === "critical") ??
    verification.findings.find((item) => item.severity === "error") ??
    verification.findings.find((item) => item.severity === "warning");

  return primaryFinding?.message ?? fallback;
}

export async function updateProjectExecutionSettings(
  projectId: string,
  settings: {
    executionMode: ExecutionMode;
    manualProvider: ManualProvider;
    connectedProvider: ProviderConfig["connectedProvider"];
    providerBaseUrl?: string;
    providerModel?: string;
    providerApiKeyHint?: string;
    autoDispatchEnabled: boolean;
    autoIngestEnabled: boolean;
    autopilotEnabled: boolean;
  },
) {
  return mutateStore((store) => {
    const project = store.projects.find((item) => item.id === projectId);

    if (!project) {
      throw new Error("Project not found.");
    }

    const providerConfig = normalizeProviderConfig({
      executionMode: settings.executionMode,
      providerConfig: {
        ...project.providerConfig,
        autoDispatchEnabled: settings.autoDispatchEnabled,
        autoIngestEnabled: settings.autoIngestEnabled,
        autopilotEnabled: settings.autopilotEnabled,
      },
      manualProvider: settings.manualProvider,
      connectedProvider: settings.connectedProvider,
      providerBaseUrl: settings.providerBaseUrl,
      providerModel: settings.providerModel,
      providerApiKeyHint: settings.providerApiKeyHint,
    });
    validateAutomationSettings(providerConfig);

    project.executionMode = settings.executionMode;
    project.providerConfig = providerConfig;
    project.updatedAt = new Date().toISOString();
    project.decisionLog.unshift({
      id: crypto.randomUUID(),
      createdAt: project.updatedAt,
      actor: "supervisor",
      title: "Execution settings updated",
      detail: `Execution mode is now ${settings.executionMode === "connected" ? "connected automation" : "manual handoff"} with ${providerConfig.connectedProvider === "mock-connected" ? "the mock connected provider" : providerConfig.connectedProvider} ready for the next automation stage.`,
    });

    return project;
  });
}

export async function startTaskRun(
  projectId: string,
  taskId: string,
  provider?: ManualProvider,
) {
  return mutateStore(async (store) => {
    const project = store.projects.find((item) => item.id === projectId);

    if (!project) {
      throw new Error("Project not found.");
    }

    const task = getTaskOrThrow(project, taskId);

    const run = await createTaskRunInProject(project, task, store.engineeringMemory, provider);
    return run;
  });
}

export async function syncConnectedRun(runId: string) {
  return mutateStore(async (store) => {
    const project = store.projects.find((item) =>
      item.runs.some((run) => run.id === runId),
    );

    if (!project) {
      throw new Error("Run project not found.");
    }

    const run = getRunOrThrow(project, runId);
    const task = getTaskOrThrow(project, run.taskId);

    if (run.executionMode !== "connected") {
      throw new Error("Only connected runs can refresh provider status.");
    }

    if (run.parsedResult) {
      return run;
    }

    const now = new Date().toISOString();
    const snapshotBefore = run.snapshotBefore ?? run.workspaceSnapshot;
    const snapshotAfter = await captureRepoSnapshot(project.repoPath, run.id, task.id);
    const actualChangedFiles = detectActualChangedFiles(snapshotBefore, snapshotAfter);

    if (
      project.providerConfig.autoIngestEnabled &&
      project.providerConfig.connectedProvider === "mock-connected" &&
      actualChangedFiles.length > 0
    ) {
      const autoResult = buildAutoIngestedResult(project, task, run, actualChangedFiles);

      await finalizeRunWithParsedResult({
        project,
        task,
        run,
        engineeringMemory: store.engineeringMemory,
        parsedResult: autoResult,
        submissionText: JSON.stringify(autoResult, null, 2),
        resultSource: "connected_auto_ingest",
        snapshotBefore,
        snapshotAfter,
      });

      run.providerState = "completed";
      run.providerStateDetail = `NSS detected ${actualChangedFiles.length} workspace change${actualChangedFiles.length === 1 ? "" : "s"} and automatically ingested the connected-provider result.`;
      run.dispatchNote = `NSS finished the automatic provider lifecycle for ${task.title}. The result was ingested without a manual paste and routed through the normal verifier.`;
      run.lastProviderSyncAt = now;
      run.updatedAt = now;

      return run;
    }

    const sync = await syncConnectedRunState(project, task, run, project.providerConfig);

    if (sync.terminalStatus) {
      let parsedResult: AgentExecutionResult;
      let submissionText = sync.terminalOutputText ?? "";

      if (sync.terminalStatus === "completed" && submissionText) {
        try {
          parsedResult = parseAgentResult(submissionText);
        } catch (error) {
          const message =
            error instanceof Error
              ? error.message
              : "NSS could not validate the Codex API result payload.";
          parsedResult = buildConnectedProviderFallbackResult({
            project,
            task,
            run,
            terminalStatus: "completed",
            terminalSummary: `Codex API completed the run, but NSS could not validate the returned JSON. ${message}`,
            rawOutputText: submissionText,
            startedAt: sync.startedAt,
            completedAt: sync.completedAt,
          });
          submissionText = JSON.stringify(parsedResult, null, 2);
        }
      } else {
        parsedResult = buildConnectedProviderFallbackResult({
          project,
          task,
          run,
          terminalStatus: sync.terminalStatus,
          terminalSummary:
            sync.terminalSummary ??
            `Codex API ended this run with status ${sync.terminalStatus}.`,
          rawOutputText: submissionText || sync.providerStateDetail,
          startedAt: sync.startedAt,
          completedAt: sync.completedAt,
        });
        submissionText = JSON.stringify(parsedResult, null, 2);
      }

      await finalizeRunWithParsedResult({
        project,
        task,
        run,
        engineeringMemory: store.engineeringMemory,
        parsedResult,
        submissionText,
        resultSource: "connected_auto_ingest",
        snapshotBefore,
        snapshotAfter,
      });

      run.providerState = "completed";
      run.providerStateDetail = sync.providerStateDetail;
      run.dispatchNote = sync.dispatchNote;
      run.lastProviderSyncAt = now;
      run.updatedAt = now;

      return run;
    }

    run.providerState = sync.providerState;
    run.providerStateDetail =
      project.providerConfig.autoIngestEnabled &&
      project.providerConfig.connectedProvider === "mock-connected"
        ? "Automatic ingestion is on, but NSS did not detect new workspace changes for this run yet. Keep waiting or use the fallback prompt/result flow."
        : sync.providerStateDetail;
    run.dispatchNote =
      project.providerConfig.autoIngestEnabled &&
      project.providerConfig.connectedProvider === "mock-connected"
        ? `NSS checked the workspace for ${task.title} but did not find a provider result it could ingest automatically yet.`
        : sync.dispatchNote;
    run.status = sync.runStatus;
    run.lastProviderSyncAt = now;
    run.updatedAt = now;
    project.updatedAt = now;
    project.decisionLog.unshift({
      id: crypto.randomUUID(),
      createdAt: now,
      actor: "supervisor",
      title: "Provider status refreshed",
      detail: sync.providerStateDetail,
      relatedTaskId: task.id,
      relatedRunId: run.id,
    });

    return run;
  });
}

function parseAgentResult(text: string): AgentExecutionResult {
  const cleaned = text
    .trim()
    .replace(/^```json/i, "")
    .replace(/^```/i, "")
    .replace(/```$/i, "")
    .trim();

  let parsed: unknown;

  try {
    parsed = JSON.parse(cleaned);
  } catch {
    throw new Error("The pasted result is not valid JSON.");
  }

  if (!parsed || typeof parsed !== "object") {
    throw new Error("The pasted result must be a JSON object.");
  }

  const candidate = parsed as Partial<AgentExecutionResult>;
  const validCriterionStatuses = new Set(["met", "partially_met", "not_met"]);
  const validChangeTypes = new Set(["added", "modified", "deleted", "renamed"]);
  const validCommandStatuses = new Set(["passed", "failed", "skipped", "not_run"]);
  const validResultStatuses = new Set([
    "succeeded",
    "failed",
    "blocked",
    "timed_out",
    "cancelled",
  ]);

  if (candidate.schemaVersion !== "1.0") {
    throw new Error("schemaVersion must be 1.0.");
  }

  if (!candidate.runId || !candidate.provider || !candidate.status || !candidate.summary) {
    throw new Error("runId, provider, status, and summary are required.");
  }

  if (!validResultStatuses.has(candidate.status)) {
    throw new Error(
      "status must be one of succeeded, failed, blocked, timed_out, or cancelled.",
    );
  }

  if (
    candidate.taskId !== undefined &&
    (typeof candidate.taskId !== "string" || !candidate.taskId.trim())
  ) {
    throw new Error("taskId must be a non-empty string when provided.");
  }

  if (
    candidate.taskTitle !== undefined &&
    (typeof candidate.taskTitle !== "string" || !candidate.taskTitle.trim())
  ) {
    throw new Error("taskTitle must be a non-empty string when provided.");
  }

  if (
    !candidate.completionState ||
    typeof candidate.completionState.objectiveAddressed !== "boolean" ||
    !Array.isArray(candidate.completionState.acceptanceCriteriaStatus)
  ) {
    throw new Error("completionState is required and must include acceptanceCriteriaStatus.");
  }

  if (!Array.isArray(candidate.changedFiles) || !Array.isArray(candidate.commands)) {
    throw new Error("changedFiles and commands must both be arrays.");
  }

  candidate.completionState.acceptanceCriteriaStatus.forEach((item, index) => {
    if (!item || typeof item !== "object") {
      throw new Error(
        `completionState.acceptanceCriteriaStatus[${index}] must be an object.`,
      );
    }

    if (typeof item.criterion !== "string" || !item.criterion.trim()) {
      throw new Error(
        `completionState.acceptanceCriteriaStatus[${index}].criterion must be a non-empty string.`,
      );
    }

    if (!validCriterionStatuses.has(item.status)) {
      throw new Error(
        `completionState.acceptanceCriteriaStatus[${index}].status must be met, partially_met, or not_met.`,
      );
    }

    if (item.note !== undefined && typeof item.note !== "string") {
      throw new Error(
        `completionState.acceptanceCriteriaStatus[${index}].note must be a string when provided.`,
      );
    }
  });

  candidate.changedFiles.forEach((item, index) => {
    if (!item || typeof item !== "object") {
      throw new Error(`changedFiles[${index}] must be an object.`);
    }

    if (typeof item.path !== "string" || !item.path.trim()) {
      throw new Error(`changedFiles[${index}].path must be a non-empty string.`);
    }

    if (!validChangeTypes.has(item.changeType)) {
      throw new Error(
        `changedFiles[${index}].changeType must be added, modified, deleted, or renamed.`,
      );
    }

    if (item.changeType === "renamed" && (!item.oldPath || !item.oldPath.trim())) {
      throw new Error(`changedFiles[${index}].oldPath is required when changeType is renamed.`);
    }

    if (typeof item.summary !== "string" || !item.summary.trim()) {
      throw new Error(`changedFiles[${index}].summary must be a non-empty string.`);
    }
  });

  candidate.commands.forEach((item, index) => {
    if (!item || typeof item !== "object") {
      throw new Error(`commands[${index}] must be an object.`);
    }

    if (typeof item.key !== "string" || !item.key.trim()) {
      throw new Error(`commands[${index}].key must be a non-empty string.`);
    }

    if (typeof item.command !== "string" || !item.command.trim()) {
      throw new Error(`commands[${index}].command must be a non-empty string.`);
    }

    if (!validCommandStatuses.has(item.status)) {
      throw new Error(
        `commands[${index}].status must be passed, failed, skipped, or not_run.`,
      );
    }

    if (item.cwd !== undefined && typeof item.cwd !== "string") {
      throw new Error(`commands[${index}].cwd must be a string when provided.`);
    }
  });

  if (candidate.blocker) {
    if (typeof candidate.blocker.title !== "string" || !candidate.blocker.title.trim()) {
      throw new Error("blocker.title must be a non-empty string when blocker is provided.");
    }

    if (
      typeof candidate.blocker.description !== "string" ||
      !candidate.blocker.description.trim()
    ) {
      throw new Error(
        "blocker.description must be a non-empty string when blocker is provided.",
      );
    }

    if (
      typeof candidate.blocker.requestedDecision !== "string" ||
      !candidate.blocker.requestedDecision.trim()
    ) {
      throw new Error(
        "blocker.requestedDecision must be a non-empty string when blocker is provided.",
      );
    }
  }

  const normalized = candidate as AgentExecutionResult;

  if (
    normalized.blocker &&
    normalized.status !== "blocked" &&
    normalized.blocker.title.trim().toLowerCase().includes("use only when execution is blocked")
  ) {
    delete normalized.blocker;
  }

  return normalized;
}

function buildAutoIngestedResult(
  project: Project,
  task: Task,
  run: TaskRun,
  actualChangedFiles: AgentExecutionResult["changedFiles"],
): AgentExecutionResult {
  return {
    schemaVersion: "1.0",
    runId: run.id,
    taskId: task.id,
    taskTitle: task.title,
    provider: run.provider,
    providerRunId: run.providerRunId,
    status: "succeeded",
    summary: `NSS automatically ingested a connected-provider result for ${task.title} after detecting ${actualChangedFiles.length} workspace change${actualChangedFiles.length === 1 ? "" : "s"}.`,
    completionState: {
      objectiveAddressed: actualChangedFiles.length > 0,
      acceptanceCriteriaStatus: task.acceptanceCriteria.map((criterion) => ({
        criterion,
        status: actualChangedFiles.length > 0 ? "met" : "not_met",
        note:
          actualChangedFiles.length > 0
            ? "This acceptance signal was auto-ingested from the connected provider flow after NSS confirmed local workspace changes."
            : "NSS could not confirm any local workspace changes for this connected run yet.",
      })),
    },
    changedFiles: actualChangedFiles,
    commands: project.verificationCommands.map((command) => ({
      key: command.key,
      command: command.command,
      cwd: command.cwd,
      status: "not_run",
      stdoutText: "Connected provider result was ingested automatically. NSS ran the local command checks separately.",
      stderrText: "",
    })),
    rawOutputText:
      "Automatically ingested by NSS DevOS from the connected provider lifecycle.",
    startedAt: run.createdAt,
    completedAt: new Date().toISOString(),
  };
}

function buildConnectedProviderFallbackResult(args: {
  project: Project;
  task: Task;
  run: TaskRun;
  terminalStatus: "completed" | "failed" | "cancelled" | "incomplete";
  terminalSummary: string;
  rawOutputText?: string;
  startedAt?: string;
  completedAt?: string;
}) {
  const {
    project,
    task,
    run,
    terminalStatus,
    terminalSummary,
    rawOutputText,
    startedAt,
    completedAt,
  } = args;
  const normalizedStatus =
    terminalStatus === "cancelled"
      ? "cancelled"
      : terminalStatus === "incomplete"
        ? "timed_out"
        : "failed";
  const note =
    terminalStatus === "completed"
      ? "Codex API finished, but NSS could not validate the returned payload as the required result JSON."
      : `Codex API ended this run with status ${terminalStatus}.`;

  return {
    schemaVersion: "1.0",
    runId: run.id,
    taskId: task.id,
    taskTitle: task.title,
    provider: run.provider,
    providerRunId: run.providerRunId,
    status: normalizedStatus,
    summary: terminalSummary,
    completionState: {
      objectiveAddressed: false,
      acceptanceCriteriaStatus: task.acceptanceCriteria.map((criterion) => ({
        criterion,
        status: "not_met" as const,
        note,
      })),
    },
    changedFiles: [],
    commands: project.verificationCommands.map((command) => ({
      key: command.key,
      command: command.command,
      cwd: command.cwd,
      status: "not_run" as const,
      stdoutText:
        "NSS did not receive a valid structured coding result from the connected provider for this run.",
      stderrText: "",
    })),
    rawOutputText,
    startedAt,
    completedAt: completedAt ?? new Date().toISOString(),
  } satisfies AgentExecutionResult;
}

async function finalizeRunWithParsedResult(args: {
  project: Project;
  task: Task;
  run: TaskRun;
  engineeringMemory: EngineeringMemoryRecord[];
  parsedResult: AgentExecutionResult;
  submissionText: string;
  resultSource: ResultSource;
  snapshotBefore?: TaskRun["snapshotBefore"];
  snapshotAfter?: TaskRun["snapshotAfter"];
}) {
  const {
    project,
    task,
    run,
    engineeringMemory,
    parsedResult,
    submissionText,
    resultSource,
    snapshotBefore = run.snapshotBefore ?? run.workspaceSnapshot,
  } = args;
  const snapshotAfter =
    args.snapshotAfter ?? (await captureRepoSnapshot(project.repoPath, run.id, task.id));
  const actualChangedFiles = detectActualChangedFiles(snapshotBefore, snapshotAfter);
  const localCommandResult = await runAllVerificationCommands(
    project.repoPath,
    project.verificationCommands,
  );
  const repoComparison = buildRepoComparison({
    reportedFiles: parsedResult.changedFiles,
    actualFiles: actualChangedFiles,
    allowedPaths: task.allowedPaths,
    forbiddenPaths: task.forbiddenPaths,
    untrackedFiles: snapshotAfter.untrackedFiles,
  });
  const localRepoCheck = buildLocalRepoCheck({
    snapshotBefore,
    snapshotAfter,
    actualChangedFiles,
    comparison: repoComparison,
    commands: localCommandResult.reports,
    issues: [
      ...(snapshotBefore?.issues ?? []),
      ...snapshotAfter.issues,
      ...localCommandResult.issues,
    ],
  });
  const verification = verifyRun(project, task, parsedResult, localRepoCheck);
  const memoryRecords =
    verification.outcome === "accepted"
      ? recordSuccessPattern({
          projectId: project.id,
          task,
          runId: run.id,
          result: parsedResult,
          verification,
          localRepoCheck,
        })
      : recordFailurePattern({
          projectId: project.id,
          task,
          runId: run.id,
          result: parsedResult,
          verification,
          localRepoCheck,
        });
  const nextEngineeringMemory = mergePatternMemory(engineeringMemory, memoryRecords);
  engineeringMemory.splice(0, engineeringMemory.length, ...nextEngineeringMemory);

  const now = new Date().toISOString();
  let decision: NextTaskDecision;

  if (verification.outcome === "accepted") {
    decision = await advanceAcceptedRun({
      project,
      task,
      run,
      engineeringMemory,
      now,
    });
  } else if (verification.outcome === "retry_required") {
    task.status = "needs_retry";
    const providerFailureRecovery = canAutomaticallyRecoverProviderFailure({
      project,
      task,
      run,
      parsedResult,
      verification,
      resultSource,
    });
    setTaskSupervisorGuidance(
      task,
      providerFailureRecovery
        ? buildProviderRecoveryGuidance({
            task,
            run,
            parsedResult,
          })
        : buildSupervisorGuidance({
            task,
            run,
          }),
      now,
    );
    decision = {
      action: "retry_task",
      reason: `Retry required. ${getPrimaryVerificationMessage(
        verification,
        "The verifier found missing acceptance coverage or failing required commands.",
      )}`,
    };
    run.status = "needs_retry";

    if (
      canAutomaticallyRetryRun({
        project,
        task,
        run,
        parsedResult,
        verification,
      })
      || providerFailureRecovery
    ) {
      const autoRetryRun = await createTaskRunInProject(project, task, engineeringMemory);
      decision.autopilotRunId = autoRetryRun.id;
      decision.reason = `Retry required. ${getPrimaryVerificationMessage(
        verification,
        "The verifier found missing acceptance coverage or failing required commands.",
      )} NSS DevOS attached retry guidance and already started the next connected attempt automatically.`;
      project.decisionLog.unshift({
        id: crypto.randomUUID(),
        createdAt: now,
        actor: "supervisor",
        title: "Automatic retry started",
        detail: `NSS DevOS started attempt ${autoRetryRun.attemptNumber} for ${task.title} automatically after a recoverable verifier failure.`,
        relatedTaskId: task.id,
        relatedRunId: autoRetryRun.id,
      });
    }
  } else if (verification.outcome === "rollback_required") {
    task.status = "needs_review";
    decision = {
      action: "rollback_run",
      reason: `Rollback review required. ${getPrimaryVerificationMessage(
        verification,
        "The run touched forbidden files and should be reviewed before any further progress.",
      )}`,
    };
    run.status = "rollback_required";
  } else {
    task.status = "needs_review";
    decision = {
      action: "request_human_review",
      reason: `Human review required. ${getPrimaryVerificationMessage(
        verification,
        "Scope, blocker, or reporting issues prevent automatic acceptance.",
      )}`,
    };
    run.status = "needs_review";
  }

  run.submittedResultText = submissionText;
  run.resultSource = resultSource;
  run.parsedResult = parsedResult;
  run.snapshotBefore = snapshotBefore;
  run.snapshotAfter = snapshotAfter;
  run.actualChangedFiles = actualChangedFiles;
  run.localCommandReports = localCommandResult.reports;
  run.repoComparison = repoComparison;
  run.localRepoCheck = localRepoCheck;
  run.localWorkspaceCheck = localRepoCheck;
  run.verification = verification;
  run.decision = decision;
  run.updatedAt = now;
  run.lastProviderSyncAt = run.executionMode === "connected" ? now : run.lastProviderSyncAt;
  if (run.executionMode === "connected") {
    run.providerState = "completed";
    run.providerStateDetail =
      resultSource === "connected_auto_ingest"
        ? "NSS automatically ingested the connected-provider result and ran the usual verification checks."
        : run.providerStateDetail ?? "The connected-provider lifecycle finished for this run.";
  }
  project.updatedAt = now;
  if (resultSource === "connected_auto_ingest") {
    project.decisionLog.unshift({
      id: crypto.randomUUID(),
      createdAt: now,
      actor: "supervisor",
      title: "Provider result ingested automatically",
      detail:
        "NSS captured the connected-provider result without a manual paste and routed it through the normal verifier.",
      relatedTaskId: task.id,
      relatedRunId: run.id,
    });
  }
  project.decisionLog.unshift({
    id: crypto.randomUUID(),
    createdAt: now,
    actor: "verifier",
    title: decision.action.replaceAll("_", " "),
    detail: decision.reason,
    relatedTaskId: task.id,
    relatedRunId: run.id,
  });

  return {
    projectId: project.id,
    runId: run.id,
    taskId: task.id,
    decision,
  };
}

export async function submitTaskRun(runId: string, submissionText: string) {
  return mutateStore(async (store) => {
    const project = store.projects.find((item) =>
      item.runs.some((run) => run.id === runId),
    );

    if (!project) {
      throw new Error("Run project not found.");
    }

    const run = getRunOrThrow(project, runId);
    const task = getTaskOrThrow(project, run.taskId);
    const parsedResult = parseAgentResult(submissionText);

    if (parsedResult.runId !== run.id) {
      throw new Error(
        `runId must match the active run. Expected ${run.id} but received ${parsedResult.runId}.`,
      );
    }

    if (parsedResult.taskId && parsedResult.taskId !== task.id) {
      throw new Error(
        `taskId must match the active task. Expected ${task.id} but received ${parsedResult.taskId}.`,
      );
    }

    if (parsedResult.taskTitle && parsedResult.taskTitle !== task.title) {
      throw new Error(
        `taskTitle must match the active task title. Expected "${task.title}" but received "${parsedResult.taskTitle}".`,
      );
    }

    return finalizeRunWithParsedResult({
      project,
      task,
      run,
      engineeringMemory: store.engineeringMemory,
      parsedResult,
      submissionText,
      resultSource: "manual_paste",
    });
  });
}

export async function applyRunIntervention(
  runId: string,
  action: SupervisorIntervention["action"],
  options?: {
    guidance?: string;
    startNextRun?: boolean;
  },
) {
  return mutateStore(async (store) => {
    const project = store.projects.find((item) =>
      item.runs.some((run) => run.id === runId),
    );

    if (!project) {
      throw new Error("Run project not found.");
    }

    const run = getRunOrThrow(project, runId);
    const task = getTaskOrThrow(project, run.taskId);
    const now = new Date().toISOString();
    const trimmedGuidance = options?.guidance?.trim();
    const startNextRun = options?.startNextRun === true;

    if (!run.verification || !run.decision) {
      throw new Error("This run does not have a completed verification result yet.");
    }

    let summary = "";
    let nextRun: TaskRun | undefined;

    if (action === "approve_and_continue") {
      if (!["needs_review", "needs_retry", "rollback_required"].includes(run.status)) {
        throw new Error("Only paused runs can be approved and continued.");
      }

      const decision = await advanceAcceptedRun({
        project,
        task,
        run,
        engineeringMemory: store.engineeringMemory,
        now,
        acceptedPrefix: "Operator approved this paused run.",
      });

      run.decision = decision;
      run.updatedAt = now;
      project.updatedAt = now;
      summary = decision.reason;
      clearTaskSupervisorGuidance(task);
      if (decision.autopilotRunId) {
        nextRun = project.runs.find((item) => item.id === decision.autopilotRunId);
      }
    } else if (action === "request_retry_with_guidance") {
      task.status = "needs_retry";
      task.completedAt = undefined;
      setTaskSupervisorGuidance(
        task,
        buildSupervisorGuidance({
          task,
          run,
          operatorNote: trimmedGuidance,
        }),
        now,
      );
      project.updatedAt = now;
      summary = "Operator requested a retry with supervisor guidance attached to the next run prompt.";
    } else if (action === "mark_rollback_complete") {
      if (run.status !== "rollback_required") {
        throw new Error("Rollback completion can only be recorded for rollback-required runs.");
      }

      const rollbackVerification = await verifyRollbackCompleted(project, task, run);
      task.status = "ready";
      task.completedAt = undefined;
      setTaskSupervisorGuidance(
        task,
        buildSupervisorGuidance({
          task,
          run,
          operatorNote: trimmedGuidance,
          rollbackComplete: true,
        }),
        now,
      );
      project.updatedAt = now;
      summary = `NSS DevOS verified that ${rollbackVerification.riskyPaths.length} risky path${rollbackVerification.riskyPaths.length === 1 ? "" : "s"} no longer differ from the pre-run snapshot. The task is ready for a new supervised attempt.`;
    } else {
      task.status = "ready";
      task.completedAt = undefined;

      if (trimmedGuidance) {
        setTaskSupervisorGuidance(task, trimmedGuidance, now);
      }

      project.updatedAt = now;
      summary = "Operator resumed the task for another run.";
    }

    if (startNextRun && action !== "approve_and_continue") {
      nextRun = await createTaskRunInProject(project, task, store.engineeringMemory);
      summary = `${summary} NSS immediately started the next run.`;
    }

    const intervention: SupervisorIntervention = {
      id: crypto.randomUUID(),
      createdAt: now,
      projectId: project.id,
      taskId: task.id,
      runId: run.id,
      action,
      summary,
      guidance: task.supervisorGuidance,
      startedRunId: nextRun?.id,
    };

    project.interventionLog.unshift(intervention);
    project.decisionLog.unshift({
      id: crypto.randomUUID(),
      createdAt: now,
      actor: "operator",
      title: action.replaceAll("_", " "),
      detail: summary,
      relatedTaskId: task.id,
      relatedRunId: run.id,
    });

    return {
      projectId: project.id,
      taskId: task.id,
      runId: run.id,
      action,
      summary,
      taskStatus: task.status,
      supervisorGuidance: task.supervisorGuidance,
      nextRunId: nextRun?.id,
      nextRunStatus: nextRun?.status,
    };
  });
}

export async function continueProjectRoadmap(projectId: string) {
  return mutateStore((store) => {
    const project = store.projects.find((item) => item.id === projectId);

    if (!project) {
      throw new Error("Project not found.");
    }

    const nextBlueprint = getNextTaskBlueprint(project);

    if (!nextBlueprint) {
      throw new Error("No further roadmap stages are available for this project.");
    }

    const activeTask = project.tasks.find((task) =>
      ["ready", "in_progress", "needs_retry", "needs_review"].includes(task.status),
    );

    if (activeTask) {
      throw new Error("This project already has an active task.");
    }

    const now = new Date().toISOString();
    const latestMilestone = project.milestones.at(-1);

    if (latestMilestone && latestMilestone.status !== "completed") {
      latestMilestone.status = "completed";
    }

    let targetMilestone =
      project.milestones.find((item) => item.key === nextBlueprint.milestoneKey) ?? null;

    if (!targetMilestone) {
      const nextMilestoneBlueprint = getMilestoneBlueprintOrThrow(
        project,
        nextBlueprint.milestoneKey,
      );
      targetMilestone = createMilestone(nextMilestoneBlueprint);
      project.milestones.push(targetMilestone);
    }

    const nextTask = instantiateTask(nextBlueprint, targetMilestone.id, project.tasks.length + 1);
    project.tasks.push(nextTask);
    project.roadmapCursor += 1;
    project.status = "active";
    project.updatedAt = now;
    project.decisionLog.unshift({
      id: crypto.randomUUID(),
      createdAt: now,
      actor: "supervisor",
      title: "Next stage opened",
      detail: `Moved into ${targetMilestone.title} and generated the next bounded task.`,
      relatedTaskId: nextTask.id,
    });

    return {
      projectId: project.id,
      milestoneId: targetMilestone.id,
      nextTaskId: nextTask.id,
    };
  });
}
