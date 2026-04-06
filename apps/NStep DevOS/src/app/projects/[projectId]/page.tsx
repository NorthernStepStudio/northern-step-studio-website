import Link from "next/link";
import { notFound } from "next/navigation";

import { AutomationPausePanel } from "@/components/automation-pause-panel";
import { ContinueRoadmapButton } from "@/components/continue-roadmap-button";
import { ExecutionModePanel } from "@/components/execution-mode-panel";
import { ProjectNav } from "@/components/project-nav";
import { RunInterventionPanel } from "@/components/run-intervention-panel";
import { StartRunButton } from "@/components/start-run-button";
import { buildTaskPacket } from "@/lib/planner";
import { getProject, getProjectEngineeringMemories } from "@/lib/store";
import {
  getExecutionModeLabel,
  getExecutionModeSummary,
  getAutomationPauseSummary,
  formatDate,
  getActiveTask,
  getMilestoneStageLabel,
  getProviderConnectionSummary,
  getProviderLabel,
  getTaskStageLabel,
  humanizeStatus,
  statusTone,
} from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function ProjectOverviewPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  const project = await getProject(projectId);

  if (!project) {
    notFound();
  }

  const currentTask = getActiveTask(project);
  const currentMilestone = currentTask
    ? project.milestones.find((milestone) => milestone.id === currentTask.milestoneId)
    : project.milestones.at(-1);
  const completedTaskCount = project.tasks.filter((task) => task.status === "completed").length;
  const currentTaskPacket = currentTask
    ? buildTaskPacket(currentTask, project.verificationCommands)
    : null;
  const firstTaskPacket =
    project.firstTaskPacket ??
    (project.tasks[0] ? buildTaskPacket(project.tasks[0], project.verificationCommands) : null);
  const latestRun = currentTask ? project.runs.find((run) => run.taskId === currentTask.id) : null;
  const memoryHighlights = await getProjectEngineeringMemories(projectId);
  const canOpenNextStage =
    project.status === "completed" && project.tasks.length < project.taskBlueprints.length;
  const nextMilestoneBlueprint =
    project.tasks.length < project.taskBlueprints.length
      ? project.milestoneBlueprints.find(
          (milestone) => !project.milestones.some((existing) => existing.key === milestone.key),
        ) ?? null
      : null;
  const pauseSummary = getAutomationPauseSummary({
    taskStatus: currentTask?.status,
    runStatus: latestRun?.status,
    decisionAction: latestRun?.decision?.action,
  });
  const nextOperatorStep = !currentTask
    ? canOpenNextStage
      ? "Open the next stage to move from the manual proof loop into connected-provider automation."
      : "Review the completed milestone and confirm the final supervised loop is documented."
    : pauseSummary
      ? `${pauseSummary.detail} Use the supervisor actions below or open the task/run detail if you need the full review context.`
      : latestRun?.status === "waiting_on_provider"
      ? "Open the active run and refresh the provider status. NSS already dispatched the connected run and is waiting for the next provider-side update."
    : ["ready", "needs_retry", "needs_review"].includes(currentTask.status)
      ? project.executionMode === "connected"
        ? "Open the active task and start a connected run. NSS will stage the provider handoff and keep pasted-result fallback until automatic ingestion is finished."
        : "Open the active task and start a run to generate the copy-ready prompt for your coding agent."
      : currentTask.status === "in_progress"
        ? "Open the active run, paste the coding-agent JSON result, and review the verifier output."
        : "Review the latest run findings before deciding whether to retry, roll back, or request human review.";

  return (
    <main className="page-shell space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-3">
          <div className={`status-pill ${statusTone(project.status)}`}>
            {humanizeStatus(project.status)}
          </div>
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-cyan-300">
              Project overview
            </p>
            <h1 className="mt-2 text-4xl font-semibold tracking-tight text-white">
              {project.name}
            </h1>
            <p className="mt-2 max-w-3xl text-sm leading-7 text-slate-300">
              {project.structuredSpec.summary}
            </p>
          </div>
        </div>
        <ProjectNav current="overview" projectId={project.id} />
      </div>

      <AutomationPausePanel
        decisionAction={latestRun?.decision?.action}
        projectId={project.id}
        runId={latestRun?.id}
        runStatus={latestRun?.status}
        taskId={currentTask?.id}
        taskStatus={currentTask?.status}
      />

      <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-4">
            <div className="panel rounded-[1.6rem] p-5">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Tasks complete</p>
              <p className="mt-2 text-3xl font-semibold text-white">{completedTaskCount}</p>
            </div>
            <div className="panel rounded-[1.6rem] p-5">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Planned path</p>
              <p className="mt-2 text-3xl font-semibold text-white">
                {project.taskBlueprints.length}
              </p>
            </div>
            <div className="panel rounded-[1.6rem] p-5">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Runs logged</p>
              <p className="mt-2 text-3xl font-semibold text-white">{project.runs.length}</p>
            </div>
            <div className="panel rounded-[1.6rem] p-5">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Current stage</p>
              <p className="mt-2 text-lg font-semibold text-white">
                {currentMilestone?.title ?? "Roadmap complete"}
              </p>
              {currentMilestone ? (
                <p className="mt-2 text-xs font-semibold uppercase tracking-[0.18em] text-cyan-200">
                  {getMilestoneStageLabel(project, currentMilestone)}
                </p>
              ) : null}
            </div>
            <div className="panel rounded-[1.6rem] p-5">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                Execution mode
              </p>
              <p className="mt-2 text-lg font-semibold text-white">
                {getExecutionModeLabel(project.executionMode)}
              </p>
              <p className="mt-2 text-xs text-slate-300">
                {project.executionMode === "connected"
                  ? getProviderLabel(project.providerConfig.connectedProvider)
                  : getProviderLabel(project.providerConfig.manualProvider)}
              </p>
            </div>
          </div>

          <div className="panel-strong rounded-[2rem] p-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-teal-300">
                  Structured spec
                </p>
                <h2 className="mt-2 text-2xl font-semibold text-white">
                  {currentMilestone?.title ?? project.milestones[0]?.title}
                </h2>
                {currentMilestone ? (
                  <p className="mt-2 text-xs font-semibold uppercase tracking-[0.18em] text-cyan-200">
                    {getMilestoneStageLabel(project, currentMilestone)}
                  </p>
                ) : null}
              </div>
              <div className="text-right text-xs text-slate-400">
                Updated
                <div className="mt-1 text-sm text-slate-200">{formatDate(project.updatedAt)}</div>
              </div>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <div className="rounded-[1.4rem] border border-white/8 bg-white/4 p-5">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Product type</p>
                <p className="mt-3 text-sm leading-7 text-slate-200">
                  {project.structuredSpec.productType}
                </p>
              </div>
              <div className="rounded-[1.4rem] border border-white/8 bg-white/4 p-5">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Primary loop</p>
                <p className="mt-3 text-sm leading-7 text-slate-200">
                  {project.structuredSpec.primaryLoop}
                </p>
              </div>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <div className="rounded-[1.4rem] border border-white/8 bg-white/4 p-5">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Risks</p>
                <ul className="mt-3 space-y-2 text-sm leading-7 text-slate-200">
                  {project.structuredSpec.risks.map((risk, index) => (
                    <li key={`${risk}-${index}`}>- {risk}</li>
                  ))}
                </ul>
              </div>
              <div className="rounded-[1.4rem] border border-white/8 bg-white/4 p-5">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Notes</p>
                <ul className="mt-3 space-y-2 text-sm leading-7 text-slate-200">
                  {project.structuredSpec.notes.map((note, index) => (
                    <li key={`${note}-${index}`}>- {note}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {currentTaskPacket ? (
            <div className="panel rounded-[2rem] p-6">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.24em] text-sky-300">
                    Active task packet
                  </p>
                  <h2 className="mt-2 text-2xl font-semibold text-white">
                    {currentTaskPacket.taskTitle}
                  </h2>
                  {currentTask ? (
                    <p className="mt-2 text-xs font-semibold uppercase tracking-[0.18em] text-cyan-200">
                      {getTaskStageLabel(project, currentTask)}
                    </p>
                  ) : null}
                </div>
                <div className={`status-pill ${statusTone(currentTask?.status ?? "ready")}`}>
                  {humanizeStatus(currentTask?.status ?? "ready")}
                </div>
              </div>

              <div className="mt-5 rounded-[1.4rem] border border-white/8 bg-white/4 p-5">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Objective</p>
                <p className="mt-3 text-sm leading-7 text-slate-200">
                  {currentTaskPacket.objective}
                </p>
              </div>

              <div className="mt-4 rounded-[1.4rem] border border-white/8 bg-white/4 p-5">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Instructions</p>
                <p className="mt-3 text-sm leading-7 text-slate-200">
                  {currentTaskPacket.instructions}
                </p>
              </div>

              {currentTask?.supervisorGuidance ? (
                <div className="mt-4 rounded-[1.4rem] border border-amber-400/20 bg-amber-950/20 p-5">
                  <p className="text-xs uppercase tracking-[0.18em] text-amber-300">
                    Supervisor guidance
                  </p>
                  <pre className="mt-3 overflow-auto text-sm leading-7 text-amber-50">
                    <code>{currentTask.supervisorGuidance}</code>
                  </pre>
                </div>
              ) : null}

              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <div className="rounded-[1.4rem] border border-white/8 bg-white/4 p-5">
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                    Acceptance criteria
                  </p>
                  <ul className="mt-3 space-y-2 text-sm leading-7 text-slate-200">
                    {currentTaskPacket.acceptanceCriteria.map((criterion, index) => (
                      <li key={`${criterion}-${index}`}>- {criterion}</li>
                    ))}
                  </ul>
                </div>
                <div className="rounded-[1.4rem] border border-white/8 bg-white/4 p-5">
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                    File boundaries
                  </p>
                  <div className="mt-3 space-y-3 text-sm text-slate-200">
                    <div>
                      <p className="font-semibold text-white">Allowed</p>
                      <ul className="mt-2 space-y-1">
                        {currentTaskPacket.allowedPaths.map((pathValue, index) => (
                          <li
                            key={`${pathValue}-${index}`}
                            className="font-mono text-xs text-slate-300"
                          >
                            {pathValue}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <p className="font-semibold text-white">Forbidden</p>
                      <ul className="mt-2 space-y-1">
                        {currentTaskPacket.forbiddenPaths.map((pathValue, index) => (
                          <li
                            key={`${pathValue}-${index}`}
                            className="font-mono text-xs text-slate-300"
                          >
                            {pathValue}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : null}

          {firstTaskPacket && currentTask && currentTask.id !== project.tasks[0]?.id ? (
            <div className="panel rounded-[2rem] p-6">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-300">
                    Task one reference
                  </p>
                  <h2 className="mt-2 text-2xl font-semibold text-white">
                    {firstTaskPacket.taskTitle}
                  </h2>
                </div>
                <div className={`status-pill ${statusTone(project.tasks[0]?.status ?? "ready")}`}>
                  {humanizeStatus(project.tasks[0]?.status ?? "ready")}
                </div>
              </div>
              <p className="mt-4 text-sm leading-7 text-slate-300">
                The original first-task packet is still shown here for reference, but the active
                prompt should always come from the current task or current run.
              </p>
            </div>
          ) : null}

          <div className="panel rounded-[2rem] p-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-sky-300">
                  Task queue
                </p>
                <h2 className="mt-2 text-2xl font-semibold text-white">
                  Milestone task progression
                </h2>
              </div>
              <div className="text-sm text-slate-300">
                {completedTaskCount}/{project.taskBlueprints.length} complete
              </div>
            </div>

            <div className="mt-6 space-y-4">
              {project.tasks.map((task) => (
                <div
                  key={task.id}
                  className="rounded-[1.4rem] border border-white/8 bg-white/4 p-5"
                >
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="space-y-3">
                      <div className={`status-pill ${statusTone(task.status)}`}>
                        {humanizeStatus(task.status)}
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold text-white">{task.title}</h3>
                        <p className="mt-2 text-xs font-semibold uppercase tracking-[0.18em] text-cyan-200">
                          {getTaskStageLabel(project, task)}
                        </p>
                        <p className="mt-2 max-w-3xl text-sm leading-7 text-slate-300">
                          {task.objective}
                        </p>
                      </div>
                    </div>
                    <Link className="btn-secondary" href={`/projects/${project.id}/tasks/${task.id}`}>
                      Open task
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <aside className="space-y-6">
          <div className="panel rounded-[1.8rem] p-6">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-sky-300">
              Execution settings
            </p>
            <div className="mt-4 rounded-2xl border border-white/8 bg-white/4 p-4 text-sm leading-7 text-slate-300">
              <p className="font-semibold text-white">
                {getExecutionModeLabel(project.executionMode)}
              </p>
              <p className="mt-2">{getExecutionModeSummary(project.executionMode)}</p>
              <p className="mt-2">
                Connected provider: {getProviderLabel(project.providerConfig.connectedProvider)}.
              </p>
              <p className="mt-2">
                {getProviderConnectionSummary(
                  project.providerConfig.connectionStatus,
                  project.providerConfig.connectedProvider,
                  project.providerConfig.apiKeyHint,
                )}
              </p>
            </div>
            <div className="mt-4">
              <ExecutionModePanel
                executionMode={project.executionMode}
                projectId={project.id}
                providerConfig={project.providerConfig}
              />
            </div>
          </div>

          <div className="panel rounded-[1.8rem] p-6">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-teal-300">
              Operator guide
            </p>
            <div className="mt-4 space-y-4 text-sm leading-7 text-slate-300">
              <div className="rounded-2xl border border-white/8 bg-white/4 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                  Progress snapshot
                </p>
                <p className="mt-2 text-lg font-semibold text-white">
                  {completedTaskCount}/{project.taskBlueprints.length} tasks completed
                </p>
                <p className="mt-2 text-sm leading-7 text-slate-300">
                  {latestRun
                    ? `Latest run: ${humanizeStatus(latestRun.status)} via ${getProviderLabel(latestRun.provider)} in ${getExecutionModeLabel(latestRun.executionMode)}.`
                    : "No runs logged yet for the current task."}
                </p>
              </div>
              <div className="rounded-2xl border border-white/8 bg-white/4 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                  Recommended next move
                </p>
                <p className="mt-2 text-sm leading-7 text-slate-200">{nextOperatorStep}</p>
              </div>
              {nextMilestoneBlueprint ? (
                <div className="rounded-2xl border border-white/8 bg-white/4 p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Next stage</p>
                  <p className="mt-2 text-lg font-semibold text-white">
                    {nextMilestoneBlueprint.title}
                  </p>
                  <p className="mt-2 text-sm leading-7 text-slate-300">
                    {nextMilestoneBlueprint.goal}
                  </p>
                  {canOpenNextStage ? (
                    <div className="mt-4">
                      <ContinueRoadmapButton projectId={project.id} />
                    </div>
                  ) : null}
                </div>
              ) : null}
            </div>
          </div>

          <div className="panel rounded-[1.8rem] p-6">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-cyan-300">
              Active task
            </p>
            {currentTask ? (
              <div className="mt-4 space-y-4">
                <div className={`status-pill ${statusTone(currentTask.status)}`}>
                  {humanizeStatus(currentTask.status)}
                </div>
                <div>
                  <h2 className="text-2xl font-semibold text-white">{currentTask.title}</h2>
                  <p className="mt-2 text-xs font-semibold uppercase tracking-[0.18em] text-cyan-200">
                    {getTaskStageLabel(project, currentTask)}
                  </p>
                  <p className="mt-2 text-sm leading-7 text-slate-300">
                    {currentTask.instructions}
                  </p>
                </div>
              <div className="flex flex-wrap gap-3">
                <Link className="btn-secondary" href={`/projects/${project.id}/tasks/${currentTask.id}`}>
                  Review task
                </Link>
                <Link className="btn-secondary" href={`/projects/${project.id}/tasks`}>
                    Open task board
                  </Link>
                  {["ready", "needs_retry", "needs_review"].includes(currentTask.status) ? (
                    <StartRunButton
                      executionMode={project.executionMode}
                      projectId={project.id}
                      providerConfig={project.providerConfig}
                      taskId={currentTask.id}
                    />
                  ) : null}
                </div>
                {latestRun ? (
                  <RunInterventionPanel
                    projectId={project.id}
                    runId={latestRun.id}
                    runStatus={latestRun.status}
                  />
                ) : null}
              </div>
            ) : (
              <div className="mt-4 space-y-4">
                <p className="text-sm leading-7 text-slate-300">
                  No active task remains for the current milestone.
                </p>
                {canOpenNextStage ? <ContinueRoadmapButton projectId={project.id} /> : null}
              </div>
            )}
          </div>

          <div className="panel rounded-[1.8rem] p-6">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-teal-300">
              Engineering memory
            </p>
            <p className="mt-4 text-sm leading-7 text-slate-300">
              NSS keeps a short memory of patterns that worked well and patterns that caused
              retries or review.
            </p>
            {memoryHighlights.length > 0 ? (
              <div className="mt-4 space-y-4">
                {memoryHighlights.map((memory) => (
                  <div key={memory.id} className="rounded-2xl border border-white/8 bg-white/4 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div
                          className={`status-pill ${statusTone(
                            memory.memoryType === "success" ? "accepted" : "needs_review",
                          )}`}
                        >
                          {memory.memoryType === "success" ? "Worked before" : "Watch out"}
                        </div>
                        <p className="mt-3 font-semibold text-white">{memory.pattern}</p>
                      </div>
                      <p className="text-xs text-slate-400">{formatDate(memory.timestamp)}</p>
                    </div>
                    <p className="mt-3 text-sm leading-7 text-slate-300">
                      {memory.memoryType === "success"
                        ? memory.successfulStrategy
                        : memory.mistakeToAvoid}
                    </p>
                    {memory.recommendedFix ? (
                      <p className="mt-3 text-sm leading-7 text-slate-300">
                        <span className="font-semibold text-white">Fix:</span>{" "}
                        {memory.recommendedFix}
                      </p>
                    ) : null}
                    {memory.confidence !== undefined ? (
                      <p className="mt-3 text-xs uppercase tracking-[0.18em] text-cyan-200">
                        Confidence {Math.round(memory.confidence * 100)}%
                      </p>
                    ) : null}
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-4 text-sm leading-7 text-slate-400">
                No reusable engineering memory is recorded yet for this project.
              </p>
            )}
          </div>

          <div className="panel rounded-[1.8rem] p-6">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-teal-300">
              Verification commands
            </p>
            <div className="mt-4 space-y-3 text-sm text-slate-300">
              {project.verificationCommands.map((command, index) => (
                <div
                  key={`${command.key}-${command.command}-${index}`}
                  className="rounded-2xl border border-white/8 bg-white/4 p-4"
                >
                  <p className="font-semibold text-white">{command.label}</p>
                  <p className="mt-1 font-mono text-xs text-slate-300">{command.command}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="panel rounded-[1.8rem] p-6">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-sky-300">
              Decision history
            </p>
            {project.decisionLog.length > 0 ? (
              <div className="mt-4 space-y-4">
                {project.decisionLog.map((entry) => (
                  <div key={entry.id} className="rounded-2xl border border-white/8 bg-white/4 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-semibold text-white">{entry.title}</p>
                      <p className="text-xs text-slate-400">{formatDate(entry.createdAt)}</p>
                    </div>
                    <p className="mt-2 text-sm leading-7 text-slate-300">{entry.detail}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-4 text-sm leading-7 text-slate-300">
                No supervisor decisions have been logged yet. Start a run to begin the review loop.
              </p>
            )}
          </div>
        </aside>
      </section>
    </main>
  );
}
