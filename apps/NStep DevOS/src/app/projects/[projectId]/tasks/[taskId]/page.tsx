import Link from "next/link";
import { notFound } from "next/navigation";

import { AutomationPausePanel } from "@/components/automation-pause-panel";
import { ProjectMemoryPanel } from "@/components/project-memory-panel";
import { ProjectNav } from "@/components/project-nav";
import { RunInterventionPanel } from "@/components/run-intervention-panel";
import { StartRunButton } from "@/components/start-run-button";
import { getProject, getTaskEngineeringMemories } from "@/lib/store";
import {
  getExecutionModeLabel,
  getExecutionModeSummary,
  formatDate,
  getProviderConnectionSummary,
  getProviderLabel,
  getTaskStageLabel,
  humanizeStatus,
  statusTone,
} from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function TaskDetailPage({
  params,
}: {
  params: Promise<{ projectId: string; taskId: string }>;
}) {
  const { projectId, taskId } = await params;
  const project = await getProject(projectId);

  if (!project) {
    notFound();
  }

  const task = project.tasks.find((item) => item.id === taskId);

  if (!task) {
    notFound();
  }

  const latestRun = project.runs.find((run) => run.taskId === task.id);
  const relevantMemories = await getTaskEngineeringMemories(projectId, taskId);

  return (
    <main className="page-shell space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-3">
          <div className={`status-pill ${statusTone(task.status)}`}>
            {humanizeStatus(task.status)}
          </div>
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-cyan-300">
              Task detail
            </p>
            <h1 className="mt-2 text-4xl font-semibold tracking-tight text-white">
              {task.title}
            </h1>
            <p className="mt-2 text-xs font-semibold uppercase tracking-[0.18em] text-cyan-200">
              {getTaskStageLabel(project, task)}
            </p>
            <p className="mt-2 max-w-3xl text-sm leading-7 text-slate-300">
              {task.objective}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-3">
          <ProjectNav current="tasks" projectId={project.id} />
          <Link className="btn-secondary" href={`/projects/${project.id}`}>
            Back to overview
          </Link>
          {latestRun ? (
            <Link className="btn-secondary" href={`/projects/${project.id}/runs/${latestRun.id}`}>
              Open latest run
            </Link>
          ) : null}
        </div>
      </div>

      <AutomationPausePanel
        decisionAction={latestRun?.decision?.action}
        projectId={project.id}
        runId={latestRun?.id}
        runStatus={latestRun?.status}
        taskId={task.id}
        taskStatus={task.status}
      />

      <section className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <div className="space-y-6">
          <div className="panel-strong rounded-[2rem] p-6">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-teal-300">
              Execution brief
            </p>
            <div className="mt-4 space-y-5">
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Instructions</p>
                <p className="mt-3 text-sm leading-7 text-slate-200">{task.instructions}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                  Acceptance criteria
                </p>
                <ul className="mt-3 space-y-2 text-sm leading-7 text-slate-200">
                  {task.acceptanceCriteria.map((criterion, index) => (
                    <li key={`${criterion}-${index}`}>- {criterion}</li>
                  ))}
                </ul>
              </div>
              {task.supervisorGuidance ? (
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-amber-300">
                    Supervisor guidance
                  </p>
                  <pre className="mt-3 overflow-auto rounded-[1.4rem] border border-amber-400/20 bg-amber-950/20 p-4 text-sm leading-7 text-amber-50">
                    <code>{task.supervisorGuidance}</code>
                  </pre>
                </div>
              ) : null}
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="panel rounded-[1.8rem] p-6">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-sky-300">
                Allowed paths
              </p>
              <div className="mt-4 space-y-2 font-mono text-xs text-slate-200">
                {task.allowedPaths.map((path, index) => (
                  <div
                    key={`${path}-${index}`}
                    className="rounded-2xl border border-white/8 bg-white/4 px-4 py-3"
                  >
                    {path}
                  </div>
                ))}
              </div>
            </div>
            <div className="panel rounded-[1.8rem] p-6">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-rose-300">
                Forbidden paths
              </p>
              <div className="mt-4 space-y-2 font-mono text-xs text-slate-200">
                {task.forbiddenPaths.map((path, index) => (
                  <div
                    key={`${path}-${index}`}
                    className="rounded-2xl border border-white/8 bg-white/4 px-4 py-3"
                  >
                    {path}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="panel rounded-[1.8rem] p-6">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-teal-300">
              Engineering memory
            </p>
            <p className="mt-3 text-sm leading-7 text-slate-300">
              NSS remembers what worked before and what caused retries or review for similar task
              boundaries.
            </p>
            {relevantMemories.length > 0 ? (
              <div className="mt-5 space-y-4">
                {relevantMemories.map((memory) => (
                  <div
                    key={memory.id}
                    className="rounded-[1.4rem] border border-white/8 bg-white/4 p-5"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="space-y-2">
                        <div
                          className={`status-pill ${statusTone(
                            memory.memoryType === "success" ? "accepted" : "needs_review",
                          )}`}
                        >
                          {memory.memoryType === "success" ? "Worked before" : "Watch out"}
                        </div>
                        <p className="text-lg font-semibold text-white">{memory.pattern}</p>
                      </div>
                      <div className="text-right text-xs text-slate-400">
                        <div>{formatDate(memory.timestamp)}</div>
                        <div className="mt-1">
                          Seen {memory.occurrenceCount} time
                          {memory.occurrenceCount === 1 ? "" : "s"}
                        </div>
                      </div>
                    </div>
                    <p className="mt-4 text-sm leading-7 text-slate-200">
                      {memory.memoryType === "success"
                        ? memory.successfulStrategy
                        : memory.mistakeToAvoid}
                    </p>
                    {memory.knownError || memory.recommendedFix ? (
                      <div className="mt-4 rounded-2xl border border-white/8 bg-black/20 p-4 text-sm leading-7 text-slate-300">
                        {memory.knownError ? (
                          <p>
                            <span className="font-semibold text-white">Known error:</span>{" "}
                            {memory.knownError}
                          </p>
                        ) : null}
                        {memory.recommendedFix ? (
                          <p className={memory.knownError ? "mt-2" : ""}>
                            <span className="font-semibold text-white">Recommended fix:</span>{" "}
                            {memory.recommendedFix}
                          </p>
                        ) : null}
                      </div>
                    ) : null}
                    {memory.confidence !== undefined ? (
                      <p className="mt-4 text-xs uppercase tracking-[0.18em] text-cyan-200">
                        Confidence {Math.round(memory.confidence * 100)}%
                      </p>
                    ) : null}
                    {memory.repoConventions && memory.repoConventions.length > 0 ? (
                      <div className="mt-4">
                        <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                          Repo conventions
                        </p>
                        <ul className="mt-2 space-y-2 text-sm leading-7 text-slate-300">
                          {memory.repoConventions.map((rule, index) => (
                            <li key={`${memory.id}-rule-${index}`}>- {rule}</li>
                          ))}
                        </ul>
                      </div>
                    ) : null}
                    {memory.exampleFiles.length > 0 ? (
                      <div className="mt-4 space-y-2 font-mono text-xs text-slate-300">
                        {memory.exampleFiles.map((file) => (
                          <div
                            key={`${memory.id}-${file}`}
                            className="rounded-2xl border border-white/8 bg-black/20 px-4 py-3"
                          >
                            {file}
                          </div>
                        ))}
                      </div>
                    ) : null}
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-4 text-sm leading-7 text-slate-400">
                No relevant engineering memory has been recorded for this task shape yet.
              </p>
            )}
          </div>

          <ProjectMemoryPanel project={project} task={task} />
        </div>

        <aside className="space-y-6">
          <div className="panel rounded-[1.8rem] p-6">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-cyan-300">
              Execution mode
            </p>
            <div className="mt-4 space-y-4 text-sm leading-7 text-slate-300">
              <div className="rounded-2xl border border-white/8 bg-white/4 p-4">
                <p className="font-semibold text-white">
                  {getExecutionModeLabel(project.executionMode)}
                </p>
                <p className="mt-2">{getExecutionModeSummary(project.executionMode)}</p>
                <p className="mt-2">
                  {project.executionMode === "connected"
                    ? `Connected provider: ${getProviderLabel(project.providerConfig.connectedProvider)}. ${getProviderConnectionSummary(
                        project.providerConfig.connectionStatus,
                        project.providerConfig.connectedProvider,
                        project.providerConfig.apiKeyHint,
                      )}`
                    : `Manual provider fallback: ${getProviderLabel(project.providerConfig.manualProvider)}.`}
                </p>
              </div>
              <p>Attempt count: {task.attemptCount}</p>
              <div className="flex flex-wrap gap-3">
                <Link className="btn-secondary" href={`/projects/${project.id}/tasks`}>
                  Open task board
                </Link>
                <Link className="btn-secondary" href={`/projects/${project.id}/runs`}>
                  Open run history
                </Link>
              </div>
              {["ready", "needs_retry", "needs_review"].includes(task.status) ? (
                <StartRunButton
                  executionMode={project.executionMode}
                  projectId={project.id}
                  providerConfig={project.providerConfig}
                  taskId={task.id}
                />
              ) : latestRun ? (
                <Link className="btn-primary" href={`/projects/${project.id}/runs/${latestRun.id}`}>
                  Open active run
                </Link>
              ) : (
                <p className="text-slate-400">This task is waiting on review or completion.</p>
              )}
            </div>
          </div>

          {latestRun ? (
            <div className="panel rounded-[1.8rem] p-6">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-teal-300">
                Latest run state
              </p>
              <div className="mt-4 space-y-3">
                <div className={`status-pill ${statusTone(latestRun.status)}`}>
                  {humanizeStatus(latestRun.status)}
                </div>
                <p className="text-sm leading-7 text-slate-300">
                  {getExecutionModeLabel(latestRun.executionMode)} via{" "}
                  {getProviderLabel(latestRun.provider)}. Attempt {latestRun.attemptNumber}.
                </p>
                {latestRun.executionMode === "connected" && latestRun.providerState ? (
                  <p className="text-sm leading-7 text-slate-400">
                    Provider lifecycle: {humanizeStatus(latestRun.providerState)}.
                  </p>
                ) : null}
                <Link className="btn-secondary" href={`/projects/${project.id}/runs/${latestRun.id}`}>
                  Review run detail
                </Link>
              </div>
              <div className="mt-5">
                <RunInterventionPanel
                  projectId={project.id}
                  runId={latestRun.id}
                  runStatus={latestRun.status}
                />
              </div>
            </div>
          ) : null}
        </aside>
      </section>
    </main>
  );
}
