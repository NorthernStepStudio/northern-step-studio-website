import Link from "next/link";

import { getProjects } from "@/lib/store";
import {
  getExecutionModeLabel,
  getProviderLabel,
  formatDate,
  getActiveTask,
  getMilestoneStageLabel,
  getTaskStageLabel,
  humanizeStatus,
  statusTone,
} from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function ProjectsPage() {
  const projects = await getProjects();
  const codexEnvName = "OPENAI_API_KEY";
  const codexConfigured = Boolean(process.env[codexEnvName]?.trim());

  return (
    <main className="page-shell space-y-8">
      <header className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
        <div className="space-y-3">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-cyan-300">
            NSS DevOS
          </p>
          <div className="space-y-2">
            <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-white md:text-5xl">
              Start from one brief, then grow from manual runs into connected automation.
            </h1>
            <p className="max-w-3xl text-base leading-7 text-slate-300 md:text-lg">
              Capture a product brief, generate the supervised roadmap, prove the loop in
              manual mode, then move the same project into connected-provider automation.
            </p>
          </div>
        </div>
        <Link className="btn-primary" href="/projects/new">
          New project brief
        </Link>
      </header>

      <section className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <div className="panel-strong rounded-[2rem] p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-teal-300">
                First-open Codex setup
              </p>
              <h2 className="mt-2 text-2xl font-semibold text-white">
                Connect Codex API before starting connected automation
              </h2>
            </div>
            <div className={`status-pill ${statusTone(codexConfigured ? "accepted" : "needs_review")}`}>
              {codexConfigured ? "Server key detected" : "Server key missing"}
            </div>
          </div>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-300">
            NSS DevOS reads the Codex API key from the server environment, not from the browser.
            When the key is present, connected Codex projects can auto-start task one immediately
            after you create the brief.
          </p>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <div className="rounded-[1.4rem] border border-white/8 bg-white/4 p-5">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Current server status</p>
              <p className="mt-3 text-lg font-semibold text-white">
                {codexConfigured
                  ? `${codexEnvName} is available to NSS DevOS.`
                  : `${codexEnvName} is not available to NSS DevOS yet.`}
              </p>
              <p className="mt-3 text-sm leading-7 text-slate-300">
                {codexConfigured
                  ? "You can create a Connected automation project with Codex API and expect NSS DevOS to open the live first run directly."
                  : "Set the key in the same shell that starts the app, then restart the dev server before creating the project."}
              </p>
            </div>
            <div className="rounded-[1.4rem] border border-white/8 bg-white/4 p-5">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-400">PowerShell example</p>
              <pre className="mt-3 overflow-auto rounded-xl border border-white/8 bg-slate-950/80 p-4 text-xs leading-6 text-slate-100">
                <code>{`$env:${codexEnvName}="sk-your-real-key"
npm run dev`}</code>
              </pre>
              <p className="mt-3 text-sm leading-7 text-slate-300">
                If the app is already running, stop it and start it again in that same window. The
                placeholder text must be replaced with your real API key.
              </p>
            </div>
          </div>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link className="btn-primary" href="/projects/new">
              Create connected project
            </Link>
            <Link className="btn-secondary" href="/projects/new">
              Open project form
            </Link>
          </div>
        </div>

        <div className="panel rounded-[2rem] p-6">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-sky-300">
            Connected mode quick path
          </p>
          <div className="mt-4 space-y-3 text-sm leading-7 text-slate-300">
            <p>1. Start NSS DevOS from a shell where <code>OPENAI_API_KEY</code> is set.</p>
            <p>2. Open <code>New project brief</code>.</p>
            <p>3. Choose <code>Connected automation</code> and <code>Codex API</code>.</p>
            <p>4. Leave <code>API key hint</code> as <code>OPENAI_API_KEY</code> unless you use a different env var.</p>
            <p>5. Create the project. NSS DevOS will auto-start task one and open the live run when setup is valid.</p>
          </div>
        </div>
      </section>

      <section className="grid-auto">
        {projects.length > 0 ? (
          projects.map((project) => {
            const completedTasks = project.tasks.filter((task) => task.status === "completed").length;
            const currentTask = getActiveTask(project);
            const currentMilestone = currentTask
              ? project.milestones.find((milestone) => milestone.id === currentTask.milestoneId)
              : project.milestones.at(-1);

            return (
              <Link
                key={project.id}
                className="panel rounded-[1.8rem] p-6 transition duration-150 hover:border-cyan-300/30 hover:bg-slate-900/80"
                href={`/projects/${project.id}`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-3">
                    <div className={`status-pill ${statusTone(project.status)}`}>
                      {humanizeStatus(project.status)}
                    </div>
                    <div>
                      <h2 className="text-2xl font-semibold text-white">{project.name}</h2>
                      <p className="mt-1 text-sm uppercase tracking-[0.22em] text-slate-400">
                        {project.slug}
                      </p>
                    </div>
                  </div>
                  <div className="text-right text-xs text-slate-400">
                    Updated
                    <div className="mt-1 text-sm text-slate-200">{formatDate(project.updatedAt)}</div>
                  </div>
                </div>

                <p className="mt-5 line-clamp-3 text-sm leading-7 text-slate-300">
                  {project.structuredSpec.summary}
                </p>

                <div className="mt-6 grid gap-3 sm:grid-cols-4">
                  <div className="rounded-2xl border border-white/8 bg-white/4 p-4">
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                      Milestone
                    </p>
                    <p className="mt-2 text-lg font-semibold text-white">
                      {currentMilestone?.title ?? project.milestones[0]?.title}
                    </p>
                    {currentMilestone ? (
                      <p className="mt-2 text-xs font-semibold uppercase tracking-[0.18em] text-cyan-200">
                        {getMilestoneStageLabel(project, currentMilestone)}
                      </p>
                    ) : null}
                  </div>
                  <div className="rounded-2xl border border-white/8 bg-white/4 p-4">
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                      Progress
                    </p>
                    <p className="mt-2 text-lg font-semibold text-white">
                      {completedTasks}/{project.tasks.length} tasks
                    </p>
                  </div>
                  <div className="rounded-2xl border border-white/8 bg-white/4 p-4">
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                      Current task
                    </p>
                    <p className="mt-2 text-sm font-semibold text-white">
                      {currentTask?.title ?? "No task generated"}
                    </p>
                    {currentTask ? (
                      <p className="mt-2 text-xs font-semibold uppercase tracking-[0.18em] text-cyan-200">
                        {getTaskStageLabel(project, currentTask)}
                      </p>
                    ) : null}
                  </div>
                  <div className="rounded-2xl border border-white/8 bg-white/4 p-4">
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                      Execution mode
                    </p>
                    <p className="mt-2 text-sm font-semibold text-white">
                      {getExecutionModeLabel(project.executionMode)}
                    </p>
                    <p className="mt-2 text-xs text-slate-300">
                      {project.executionMode === "connected"
                        ? getProviderLabel(project.providerConfig.connectedProvider)
                        : getProviderLabel(project.providerConfig.manualProvider)}
                    </p>
                  </div>
                </div>
              </Link>
            );
          })
        ) : (
          <div className="panel col-span-full rounded-[2rem] border-dashed p-10 text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-400">
              Empty workspace
            </p>
            <h2 className="mt-4 text-2xl font-semibold text-white">
              No supervised projects yet.
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-sm leading-7 text-slate-300">
              Create the first brief, let NSS generate the roadmap, prove the loop in manual
              mode, then keep the same project moving toward full connected automation.
            </p>
            <div className="mt-6">
              <Link className="btn-primary" href="/projects/new">
                Create the first project
              </Link>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
