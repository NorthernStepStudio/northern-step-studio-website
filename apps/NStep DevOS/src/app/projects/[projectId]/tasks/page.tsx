import Link from "next/link";
import { notFound } from "next/navigation";

import { ProjectNav } from "@/components/project-nav";
import { StartRunButton } from "@/components/start-run-button";
import { getProject } from "@/lib/store";
import {
  formatDate,
  getMilestoneStageLabel,
  getTaskStageLabel,
  humanizeStatus,
  statusTone,
} from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function ProjectTasksPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  const project = await getProject(projectId);

  if (!project) {
    notFound();
  }

  return (
    <main className="page-shell space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-3">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-cyan-300">
            Task board
          </p>
          <h1 className="text-4xl font-semibold tracking-tight text-white">
            {project.name}
          </h1>
          <p className="max-w-3xl text-sm leading-7 text-slate-300">
            Review the bounded task queue, attempt history, and the next runnable step in one
            place.
          </p>
        </div>
        <ProjectNav current="tasks" projectId={project.id} />
      </div>

      <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-4">
          {project.tasks.map((task) => {
            const latestRun = project.runs.find((run) => run.taskId === task.id);
            return (
              <div key={task.id} className="panel-strong rounded-[1.8rem] p-6">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="space-y-3">
                    <div className={`status-pill ${statusTone(task.status)}`}>
                      {humanizeStatus(task.status)}
                    </div>
                    <div>
                      <h2 className="text-2xl font-semibold text-white">{task.title}</h2>
                      <p className="mt-2 text-xs font-semibold uppercase tracking-[0.18em] text-cyan-200">
                        {getTaskStageLabel(project, task)}
                      </p>
                      <p className="mt-2 max-w-3xl text-sm leading-7 text-slate-300">
                        {task.instructions}
                      </p>
                    </div>
                  </div>
                  <div className="text-right text-xs text-slate-400">
                    Order {task.orderIndex}
                    <div className="mt-1 text-sm text-slate-200">
                      Attempts {task.attemptCount}
                    </div>
                  </div>
                </div>

                <div className="mt-5 grid gap-4 md:grid-cols-3">
                  <div className="rounded-2xl border border-white/8 bg-white/4 p-4">
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                      Acceptance criteria
                    </p>
                    <p className="mt-2 text-lg font-semibold text-white">
                      {task.acceptanceCriteria.length}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-white/8 bg-white/4 p-4">
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                      Latest run
                    </p>
                    <p className="mt-2 text-lg font-semibold text-white">
                      {latestRun ? humanizeStatus(latestRun.status) : "No run yet"}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-white/8 bg-white/4 p-4">
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                      Last updated
                    </p>
                    <p className="mt-2 text-sm font-semibold text-white">
                      {formatDate(latestRun?.updatedAt ?? task.createdAt)}
                    </p>
                  </div>
                </div>

                <div className="mt-5 flex flex-wrap gap-3">
                  <Link className="btn-secondary" href={`/projects/${project.id}/tasks/${task.id}`}>
                    Open task detail
                  </Link>
                  {latestRun ? (
                    <Link className="btn-secondary" href={`/projects/${project.id}/runs/${latestRun.id}`}>
                      Open latest run
                    </Link>
                  ) : null}
                  {["ready", "needs_retry", "needs_review"].includes(task.status) ? (
                    <StartRunButton
                      executionMode={project.executionMode}
                      projectId={project.id}
                      providerConfig={project.providerConfig}
                      taskId={task.id}
                    />
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>

        <aside className="space-y-6">
          <div className="panel rounded-[1.8rem] p-6">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-teal-300">
              Blueprint roadmap
            </p>
            <div className="mt-4 space-y-3">
              {project.taskBlueprints.map((blueprint, index) => {
                const task = project.tasks[index];
                const milestone = task
                  ? project.milestones.find((item) => item.id === task.milestoneId)
                  : project.milestones.find((item) => item.key === blueprint.milestoneKey);
                const tone = task ? statusTone(task.status) : "status-info";
                const label = task ? humanizeStatus(task.status) : "Planned";

                return (
                  <div key={blueprint.key} className="rounded-2xl border border-white/8 bg-white/4 p-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="font-semibold text-white">{blueprint.title}</p>
                        {milestone ? (
                          <p className="mt-2 text-xs font-semibold uppercase tracking-[0.18em] text-cyan-200">
                            {getMilestoneStageLabel(project, milestone)}
                          </p>
                        ) : null}
                      </div>
                      <div className={`status-pill ${tone}`}>{label}</div>
                    </div>
                    <p className="mt-2 text-sm leading-7 text-slate-300">
                      {blueprint.objective}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="panel rounded-[1.8rem] p-6">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-sky-300">
              Milestone progress
            </p>
            <div className="mt-4 rounded-3xl border border-white/8 bg-white/4 p-5">
              <p className="text-4xl font-semibold text-white">
                {project.tasks.filter((task) => task.status === "completed").length}/
                {project.taskBlueprints.length}
              </p>
              <p className="mt-2 text-sm leading-7 text-slate-300">
                Completed tasks across the current supervised roadmap.
              </p>
            </div>
          </div>
        </aside>
      </section>
    </main>
  );
}
