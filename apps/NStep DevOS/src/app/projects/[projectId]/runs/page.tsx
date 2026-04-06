import Link from "next/link";
import { notFound } from "next/navigation";

import { ProjectNav } from "@/components/project-nav";
import { getProject } from "@/lib/store";
import { describeScore, formatDate, getProviderLabel, humanizeStatus, statusTone } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function ProjectRunsPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  const project = await getProject(projectId);

  if (!project) {
    notFound();
  }

  const acceptedRuns = project.runs.filter((run) => run.status === "accepted").length;
  const reviewRuns = project.runs.filter((run) =>
    ["waiting_on_provider", "needs_review", "rollback_required", "needs_retry"].includes(
      run.status,
    ),
  ).length;

  return (
    <main className="page-shell space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-3">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-cyan-300">
            Run history
          </p>
          <h1 className="text-4xl font-semibold tracking-tight text-white">
            {project.name}
          </h1>
          <p className="max-w-3xl text-sm leading-7 text-slate-300">
            Inspect every manual coding-agent run, verification outcome, and supervisor decision.
          </p>
        </div>
        <ProjectNav current="runs" projectId={project.id} />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="panel rounded-[1.6rem] p-5">
          <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Runs logged</p>
          <p className="mt-2 text-3xl font-semibold text-white">{project.runs.length}</p>
        </div>
        <div className="panel rounded-[1.6rem] p-5">
          <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Accepted runs</p>
          <p className="mt-2 text-3xl font-semibold text-white">{acceptedRuns}</p>
        </div>
        <div className="panel rounded-[1.6rem] p-5">
          <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Needs follow-up</p>
          <p className="mt-2 text-3xl font-semibold text-white">{reviewRuns}</p>
        </div>
      </div>

      {project.runs.length > 0 ? (
        <section className="space-y-4">
          {project.runs.map((run) => {
            const task = project.tasks.find((item) => item.id === run.taskId);
            const scoreSummary = describeScore(run.verification?.score.overall);
            return (
              <div key={run.id} className="panel-strong rounded-[1.8rem] p-6">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="space-y-3">
                    <div className={`status-pill ${statusTone(run.status)}`}>
                      {humanizeStatus(run.status)}
                    </div>
                    <div>
                      <h2 className="text-2xl font-semibold text-white">
                        {task?.title ?? "Unknown task"}
                      </h2>
                      <p className="mt-2 text-sm leading-7 text-slate-300">
                        Attempt {run.attemptNumber} via {getProviderLabel(run.provider)}
                      </p>
                      {run.executionMode === "connected" && run.providerState ? (
                        <p className="mt-2 text-sm leading-7 text-slate-400">
                          Provider lifecycle: {humanizeStatus(run.providerState)}
                        </p>
                      ) : null}
                    </div>
                  </div>
                  <div className="text-right text-xs text-slate-400">
                    Updated
                    <div className="mt-1 text-sm text-slate-200">{formatDate(run.updatedAt)}</div>
                  </div>
                </div>

                <div className="mt-5 grid gap-4 md:grid-cols-3">
                  <div className="rounded-2xl border border-white/8 bg-white/4 p-4">
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                      Verification
                    </p>
                    <p className="mt-2 text-lg font-semibold text-white">
                      {humanizeStatus(run.verification?.outcome ?? "not_checked")}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-white/8 bg-white/4 p-4">
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                      Decision
                    </p>
                    <p className="mt-2 text-lg font-semibold text-white">
                      {humanizeStatus(run.decision?.action ?? "awaiting_submission")}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-white/8 bg-white/4 p-4">
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Confidence</p>
                    <p className="mt-2 text-lg font-semibold text-white">
                      {scoreSummary.label}
                    </p>
                    <p className="mt-2 text-sm leading-6 text-slate-300">{scoreSummary.detail}</p>
                  </div>
                </div>

                <div className="mt-5 flex flex-wrap gap-3">
                  <Link className="btn-primary" href={`/projects/${project.id}/runs/${run.id}`}>
                    Open run detail
                  </Link>
                  {task ? (
                    <Link className="btn-secondary" href={`/projects/${project.id}/tasks/${task.id}`}>
                      Open task
                    </Link>
                  ) : null}
                </div>
              </div>
            );
          })}
        </section>
      ) : (
        <section className="panel rounded-[2rem] border-dashed p-10 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-400">
            No runs yet
          </p>
          <h2 className="mt-4 text-2xl font-semibold text-white">
            Start the first manual task run.
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-sm leading-7 text-slate-300">
            Runs appear here after you open a task, generate a master prompt, and submit a
            coding-agent result.
          </p>
          <div className="mt-6">
            <Link className="btn-primary" href={`/projects/${project.id}`}>
              Back to project overview
            </Link>
          </div>
        </section>
      )}
    </main>
  );
}
