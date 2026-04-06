import Link from "next/link";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";

import { AutomationPausePanel } from "@/components/automation-pause-panel";
import { CopyPromptButton } from "@/components/copy-prompt-button";
import { ProjectMemoryPanel } from "@/components/project-memory-panel";
import { ProviderSyncButton } from "@/components/provider-sync-button";
import { ProjectNav } from "@/components/project-nav";
import { RunInterventionPanel } from "@/components/run-intervention-panel";
import { RunSubmissionForm } from "@/components/run-submission-form";
import { StartRunButton } from "@/components/start-run-button";
import { getProject } from "@/lib/store";
import {
  describeScore,
  formatDate,
  formatDurationMs,
  getExecutionModeLabel,
  getMilestoneStageLabel,
  getProviderLabel,
  getProviderRunStateSummary,
  getTaskStageLabel,
  humanizeCommandKey,
  humanizeFindingCategory,
  humanizeStatus,
  statusTone,
} from "@/lib/utils";

export const dynamic = "force-dynamic";

function DisclosureSection({
  title,
  summary,
  children,
  defaultOpen = false,
}: {
  title: string;
  summary: string;
  children: ReactNode;
  defaultOpen?: boolean;
}) {
  return (
    <details className="panel rounded-[1.8rem] p-6" open={defaultOpen}>
      <summary className="cursor-pointer list-none">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-sky-300">
              {title}
            </p>
            <p className="mt-2 text-sm leading-7 text-slate-300">{summary}</p>
          </div>
          <div className="status-pill status-info">Show details</div>
        </div>
      </summary>
      <div className="mt-5">{children}</div>
    </details>
  );
}

export default async function RunDetailPage({
  params,
}: {
  params: Promise<{ projectId: string; runId: string }>;
}) {
  const { projectId, runId } = await params;
  const project = await getProject(projectId);

  if (!project) {
    notFound();
  }

  const run = project.runs.find((item) => item.id === runId);

  if (!run) {
    notFound();
  }

  const task = project.tasks.find((item) => item.id === run.taskId);

  if (!task) {
    notFound();
  }

  const milestone = project.milestones.find((item) => item.id === task.milestoneId);
  const stepLabel = getTaskStageLabel(project, task);
  const nextTask = run.decision?.nextTaskId
    ? project.tasks.find((item) => item.id === run.decision?.nextTaskId)
    : undefined;
  const autopilotRun = run.decision?.autopilotRunId
    ? project.runs.find((item) => item.id === run.decision?.autopilotRunId)
    : undefined;
  const localRepoCheck = run.localRepoCheck ?? run.localWorkspaceCheck;
  const snapshotBefore = run.snapshotBefore ?? run.workspaceSnapshot ?? localRepoCheck?.snapshotBefore;
  const snapshotAfter = run.snapshotAfter ?? localRepoCheck?.snapshotAfter;
  const actualChangedFiles = run.actualChangedFiles ?? localRepoCheck?.actualChangedFiles ?? [];
  const localCommandReports = run.localCommandReports ?? localRepoCheck?.commands ?? [];
  const repoComparison = run.repoComparison ?? localRepoCheck?.comparison;
  const overallScore = describeScore(run.verification?.score.overall);
  const acceptanceScore = describeScore(run.verification?.score.acceptance);
  const scopeScore = describeScore(run.verification?.score.scope);
  const commandsScore = describeScore(run.verification?.score.commands);
  const integrityScore = describeScore(run.verification?.score.integrity);
  const severityRank: Record<string, number> = {
    critical: 0,
    error: 1,
    warning: 2,
    info: 3,
  };
  const sortedFindings = [...(run.verification?.findings ?? [])].sort(
    (left, right) => (severityRank[left.severity] ?? 99) - (severityRank[right.severity] ?? 99),
  );
  const operatorFacingFindings = sortedFindings.filter(
    (item) => !(item.category === "workspace" && item.severity === "info"),
  );
  const warningOrErrorFindings = sortedFindings.filter((item) => item.severity !== "info");
  const headlineFindings =
    warningOrErrorFindings.length > 0
      ? warningOrErrorFindings.slice(0, 3)
      : operatorFacingFindings.slice(0, 2);
  const failedLocalCommands = localCommandReports.filter((item) => item.status === "failed");
  const passedLocalCommands = localCommandReports.filter((item) => item.status === "passed");
  const repoTruthTitle = !localRepoCheck
    ? "NSS has not checked the workspace yet"
    : !localRepoCheck.available
      ? "NSS could not fully verify the workspace"
      : run.verification?.outcome === "accepted"
        ? "NSS confirmed the step locally"
        : run.verification?.outcome === "retry_required"
          ? "NSS found a local problem that should be retried"
          : run.verification?.outcome === "rollback_required"
            ? "NSS found a risky local change"
            : "NSS found something that needs your review";
  const repoTruthDetail = !localRepoCheck
    ? "The decision is based on the pasted result only."
    : !localRepoCheck.available
      ? "Repo truth was not fully available for this run, so NSS fell back to lighter checks."
      : run.verification?.outcome === "accepted"
        ? "The reported work, actual changed files, and local command checks line up well enough to trust this step."
        : run.verification?.outcome === "retry_required"
          ? "The local workspace or local command checks did not support accepting this step yet."
          : run.verification?.outcome === "rollback_required"
            ? "Protected files or a dangerous local change were detected."
            : "The pasted result and local workspace do not line up cleanly enough to accept automatically.";
  const nextActionTitle = !run.parsedResult
    ? run.status === "waiting_on_provider"
      ? run.provider === "codex-api"
        ? "NSS is monitoring the Codex run"
        : "Refresh provider status or wait for the next update"
      : run.executionMode === "connected"
        ? "Review the connected run and paste fallback output if needed"
        : "Paste the coding-agent JSON result"
    : run.decision?.autopilotRunId
      ? "Open the live autopilot run"
      : run.decision?.nextTaskId
      ? "Open the generated next task"
      : task.status === "needs_retry"
        ? "Retry this task with a new run"
        : run.decision?.action === "complete_milestone"
          ? "Review the completed milestone"
          : "Review the verifier findings";
  const nextActionDetail = !run.parsedResult
    ? run.status === "waiting_on_provider"
      ? run.provider === "codex-api"
        ? run.providerStateDetail ??
          run.dispatchNote ??
          "NSS is polling Codex API automatically and will ingest the structured result as soon as the run reaches a terminal state."
        : run.providerStateDetail ??
          run.dispatchNote ??
          `NSS already dispatched this run to ${getProviderLabel(run.provider)}. Refresh the provider status to continue the automatic lifecycle.`
      : run.executionMode === "connected"
        ? run.dispatchNote ??
          (run.provider === "codex-api"
            ? `NSS already supports direct Codex API dispatch for this run. Use the fallback prompt only if you need to recover outside the normal connected lifecycle.`
            : `NSS staged this run for ${getProviderLabel(run.provider)}. Use the prompt as a fallback and paste the JSON result here if the provider is still running outside the app.`)
        : `Copy the master prompt into ${getProviderLabel(run.provider)}, wait for the agent to finish, then paste the exact JSON payload into the form below.`
    : run.decision?.autopilotRunId
      ? "The run was accepted and NSS already started the next connected run automatically."
      : run.decision?.nextTaskId
      ? "The run was accepted and the supervisor generated the next bounded step."
      : task.status === "needs_retry"
        ? "The verifier found gaps. Review the findings and launch another run with an updated implementation."
        : run.decision?.action === "complete_milestone"
          ? "This run finished the last planned step in the milestone."
          : "Use the verification findings and decision summary below to decide the next manual action.";

  return (
    <main className="page-shell space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-3">
          <div className={`status-pill ${statusTone(run.status)}`}>{humanizeStatus(run.status)}</div>
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-cyan-300">
              Run detail
            </p>
            <h1 className="mt-2 text-4xl font-semibold tracking-tight text-white">{task.title}</h1>
            <p className="mt-2 text-xs font-semibold uppercase tracking-[0.18em] text-cyan-200">
              {stepLabel}
            </p>
            {milestone ? (
              <p className="mt-2 text-sm leading-7 text-slate-300">
                {milestone.title} | {getMilestoneStageLabel(project, milestone)}
              </p>
            ) : null}
            <p className="mt-2 text-sm leading-7 text-slate-300">
              {getExecutionModeLabel(run.executionMode)} | {getProviderLabel(run.provider)} |
              Attempt {run.attemptNumber} | Created {formatDate(run.createdAt)}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-3">
          <ProjectNav current="runs" projectId={project.id} />
          <Link className="btn-secondary" href={`/projects/${project.id}/tasks/${task.id}`}>
            Back to task
          </Link>
        </div>
      </div>

      <AutomationPausePanel
        decisionAction={run.decision?.action}
        projectId={project.id}
        runId={run.id}
        runStatus={run.status}
        taskId={task.id}
        taskStatus={task.status}
      />

      <section className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <div className="space-y-6">
          <div className="panel-strong rounded-[2rem] p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-teal-300">
                  Master prompt
                </p>
                <p className="mt-2 text-sm leading-7 text-slate-300">
                  {run.executionMode === "connected"
                    ? run.provider === "codex-api"
                      ? `Fallback prompt for ${getProviderLabel(run.provider)}. NSS already dispatched this run directly, but the prompt stays available for manual recovery or debugging.`
                      : `Connected-mode fallback prompt for ${getProviderLabel(run.provider)}. NSS keeps this available while other provider adapters are still using fallback execution.`
                    : `Copy this into ${getProviderLabel(run.provider)} exactly. It already includes the task boundary, stage label, rules, and result contract.`}
                </p>
                <p className="mt-2 text-xs font-semibold uppercase tracking-[0.18em] text-cyan-200">
                  Current stage: {stepLabel}
                </p>
              </div>
              <CopyPromptButton
                doneLabel="Prompt copied"
                label="Copy master prompt"
                prompt={run.prompt}
              />
            </div>
            <pre className="mt-5 max-h-[38rem] overflow-auto rounded-[1.6rem] border border-white/8 bg-slate-950/90 p-5 text-xs leading-6 text-slate-100">
              <code>{run.prompt}</code>
            </pre>
          </div>

          <div className="panel rounded-[2rem] p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-sky-300">
                  Expected result template
                </p>
                <p className="mt-2 text-sm leading-7 text-slate-300">
                  Use this if you need a clean JSON starting point before pasting the real{" "}
                  {getProviderLabel(run.provider)} output.
                </p>
              </div>
              <CopyPromptButton
                doneLabel="Template copied"
                label="Copy result template"
                prompt={run.expectedResultTemplate}
              />
            </div>
            <pre className="mt-5 max-h-[28rem] overflow-auto rounded-[1.6rem] border border-white/8 bg-slate-950/90 p-5 text-xs leading-6 text-slate-100">
              <code>{run.expectedResultTemplate}</code>
            </pre>
          </div>

          <ProjectMemoryPanel project={project} task={task} />
        </div>

        <div className="space-y-6">
          <div className="panel rounded-[2rem] p-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-cyan-300">
                  Next operator action
                </p>
                <h2 className="mt-2 text-2xl font-semibold text-white">{nextActionTitle}</h2>
              </div>
              <div className={`status-pill ${statusTone(run.status)}`}>{humanizeStatus(run.status)}</div>
            </div>
            <p className="mt-4 text-sm leading-7 text-slate-300">{nextActionDetail}</p>
            {nextTask ? (
              <div className="mt-4 rounded-2xl border border-white/8 bg-white/4 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Next stage</p>
                <p className="mt-2 text-lg font-semibold text-white">{nextTask.title}</p>
                <p className="mt-2 text-xs font-semibold uppercase tracking-[0.18em] text-cyan-200">
                  {getTaskStageLabel(project, nextTask)}
                </p>
              </div>
            ) : null}
          </div>

          {run.executionMode === "connected" ? (
            <div className="panel rounded-[2rem] p-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.24em] text-cyan-300">
                    Connected provider lifecycle
                  </p>
                  <h2 className="mt-2 text-2xl font-semibold text-white">
                    {run.providerState ? humanizeStatus(run.providerState) : "Not dispatched yet"}
                  </h2>
                </div>
                <div className={`status-pill ${statusTone(run.status)}`}>
                  {humanizeStatus(run.status)}
                </div>
              </div>
              <div className="mt-4 grid gap-3 md:grid-cols-3">
                <div className="rounded-2xl border border-white/8 bg-white/4 p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Provider</p>
                  <p className="mt-2 text-sm font-semibold text-white">
                    {getProviderLabel(run.provider)}
                  </p>
                </div>
                <div className="rounded-2xl border border-white/8 bg-white/4 p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                    Provider run ID
                  </p>
                  <p className="mt-2 break-all font-mono text-xs text-slate-200">
                    {run.providerRunId ?? "Not assigned"}
                  </p>
                </div>
                <div className="rounded-2xl border border-white/8 bg-white/4 p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Last sync</p>
                  <p className="mt-2 text-sm font-semibold text-white">
                    {run.lastProviderSyncAt ? formatDate(run.lastProviderSyncAt) : "Not synced yet"}
                  </p>
                </div>
              </div>
              <p className="mt-4 text-sm leading-7 text-slate-300">
                {run.providerStateDetail ?? getProviderRunStateSummary(run.providerState)}
              </p>
              {run.dispatchNote ? (
                <p className="mt-3 text-sm leading-7 text-slate-400">{run.dispatchNote}</p>
              ) : null}
              {run.status === "waiting_on_provider" ? (
                <div className="mt-5">
                  <ProviderSyncButton
                    lastProviderSyncAt={run.lastProviderSyncAt}
                    autoIngestEnabled={project.providerConfig.autoIngestEnabled}
                    provider={run.provider}
                    runId={run.id}
                    runStatus={run.status}
                  />
                </div>
              ) : null}
            </div>
          ) : null}

          <div className="panel rounded-[2rem] p-6">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-teal-300">
              Active task contract
            </p>
            <div className="mt-4 space-y-5">
              <div className="grid gap-3 md:grid-cols-3">
                <div className="rounded-2xl border border-white/8 bg-white/4 p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Run ID</p>
                  <p className="mt-2 break-all font-mono text-xs text-slate-200">{run.id}</p>
                </div>
                <div className="rounded-2xl border border-white/8 bg-white/4 p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Task ID</p>
                  <p className="mt-2 break-all font-mono text-xs text-slate-200">{task.id}</p>
                </div>
                <div className="rounded-2xl border border-white/8 bg-white/4 p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Current step</p>
                  <p className="mt-2 text-sm font-semibold text-white">{stepLabel}</p>
                </div>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Objective</p>
                <p className="mt-3 text-sm leading-7 text-slate-200">{task.objective}</p>
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
            </div>
          </div>

          <div className="panel-strong rounded-[2rem] p-6">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-cyan-300">
              Paste coding-agent result
            </p>
            <p className="mt-2 text-sm leading-7 text-slate-300">
              {run.executionMode === "connected"
                ? `Paste the exact JSON result returned by ${getProviderLabel(run.provider)} only if NSS has not already ingested it automatically. The fallback payload still has to match this run ID, task ID, and acceptance criteria.`
                : `Paste the exact JSON result returned by ${getProviderLabel(run.provider)} for this run. Make sure the result matches the run ID, task ID, and acceptance criteria shown above.`}{" "}
              The verifier now compares that JSON against real repo truth from the configured
              workspace.
            </p>
            <div className="mt-5">
              <RunSubmissionForm
                initialText={run.submittedResultText}
                runId={run.id}
                templateText={run.expectedResultTemplate}
              />
            </div>
          </div>

          {run.parsedResult ? (
            <div className="space-y-6">
              <DisclosureSection
                title="Submitted result payload"
                summary={
                  run.resultSource === "connected_auto_ingest"
                    ? "Open the exact JSON NSS ingested automatically from the connected-provider flow."
                    : "Open the exact JSON that was pasted back from the coding agent."
                }
              >
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="grid flex-1 gap-3 md:grid-cols-4">
                    <div className="rounded-2xl border border-white/8 bg-white/4 p-4">
                      <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                        Reported status
                      </p>
                      <p className="mt-2 text-lg font-semibold text-white">
                        {humanizeStatus(run.parsedResult.status)}
                      </p>
                    </div>
                    <div className="rounded-2xl border border-white/8 bg-white/4 p-4">
                      <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                        Result source
                      </p>
                      <p className="mt-2 text-sm font-semibold text-white">
                        {run.resultSource === "connected_auto_ingest"
                          ? "Ingested automatically"
                          : "Pasted by operator"}
                      </p>
                    </div>
                    <div className="rounded-2xl border border-white/8 bg-white/4 p-4">
                      <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Started</p>
                      <p className="mt-2 text-sm font-semibold text-white">
                        {run.parsedResult.startedAt
                          ? formatDate(run.parsedResult.startedAt)
                          : "Not reported"}
                      </p>
                    </div>
                    <div className="rounded-2xl border border-white/8 bg-white/4 p-4">
                      <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                        Completed
                      </p>
                      <p className="mt-2 text-sm font-semibold text-white">
                        {run.parsedResult.completedAt
                          ? formatDate(run.parsedResult.completedAt)
                          : "Not reported"}
                      </p>
                    </div>
                  </div>
                  <CopyPromptButton
                    doneLabel="Payload copied"
                    label="Copy submitted payload"
                    prompt={run.submittedResultText ?? run.expectedResultTemplate}
                  />
                </div>
                <pre className="mt-5 max-h-[24rem] overflow-auto rounded-[1.6rem] border border-white/8 bg-slate-950/90 p-5 text-xs leading-6 text-slate-100">
                  <code>{run.submittedResultText ?? run.expectedResultTemplate}</code>
                </pre>
              </DisclosureSection>

              <div className="grid gap-4 md:grid-cols-3">
                <div className="panel rounded-[1.6rem] p-5">
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Run status</p>
                  <p className="mt-2 text-2xl font-semibold text-white">
                    {humanizeStatus(run.status)}
                  </p>
                </div>
                <div className="panel rounded-[1.6rem] p-5">
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Verification</p>
                  <p className="mt-2 text-2xl font-semibold text-white">
                    {humanizeStatus(run.verification?.outcome ?? "not_checked")}
                  </p>
                </div>
                <div className="panel rounded-[1.6rem] p-5">
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Confidence</p>
                  <p className="mt-2 text-2xl font-semibold text-white">{overallScore.label}</p>
                  <p className="mt-2 text-sm leading-6 text-slate-300">{overallScore.detail}</p>
                </div>
              </div>

              <div className="panel rounded-[1.8rem] p-6">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.24em] text-sky-300">
                      What NSS confirmed locally
                    </p>
                    <h3 className="mt-2 text-2xl font-semibold text-white">{repoTruthTitle}</h3>
                  </div>
                  {run.verification ? (
                    <div className={`status-pill ${statusTone(run.verification.outcome)}`}>
                      {humanizeStatus(run.verification.outcome)}
                    </div>
                  ) : null}
                </div>
                <p className="mt-4 text-sm leading-7 text-slate-300">{repoTruthDetail}</p>
                <div className="mt-4 grid gap-3 md:grid-cols-4">
                  <div className="rounded-2xl border border-white/8 bg-white/4 p-4">
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Repo mode</p>
                    <p className="mt-2 text-sm font-semibold text-white">
                      {!localRepoCheck
                        ? "Not checked"
                        : localRepoCheck.gitRepo
                          ? "Git repo"
                          : "File snapshot"}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-white/8 bg-white/4 p-4">
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                      Files matched
                    </p>
                    <p className="mt-2 text-2xl font-semibold text-white">
                      {repoComparison?.matchedFiles.length ?? 0}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-white/8 bg-white/4 p-4">
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                      Extra local files
                    </p>
                    <p className="mt-2 text-2xl font-semibold text-white">
                      {repoComparison?.missingReportedFiles.length ?? 0}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-white/8 bg-white/4 p-4">
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                      Local checks passed
                    </p>
                    <p className="mt-2 text-2xl font-semibold text-white">
                      {passedLocalCommands.length}/{localCommandReports.length || 0}
                    </p>
                  </div>
                </div>
                {failedLocalCommands.length > 0 ? (
                  <p className="mt-4 text-sm leading-7 text-slate-300">
                    Local checks failed for {failedLocalCommands.map((item) => humanizeCommandKey(item.key)).join(", ")}.
                  </p>
                ) : null}
              </div>

              <div className="panel rounded-[1.8rem] p-6">
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-teal-300">
                  Agent summary
                </p>
                <p className="mt-4 text-sm leading-7 text-slate-200">{run.parsedResult.summary}</p>
              </div>

              {localRepoCheck ? (
                <DisclosureSection
                  title="Repo truth details"
                  summary="Open the exact workspace snapshots, repo notes, and environment details behind NSS's local check."
                >
                  <div className="grid gap-3 md:grid-cols-2">
                    <div className="rounded-2xl border border-white/8 bg-white/4 p-4">
                      <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Repo path</p>
                      <p className="mt-2 break-all font-mono text-xs text-slate-200">
                        {localRepoCheck.repoPath || "Not available"}
                      </p>
                    </div>
                    <div className="rounded-2xl border border-white/8 bg-white/4 p-4">
                      <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Branch</p>
                      <p className="mt-2 text-sm font-semibold text-white">
                        {localRepoCheck.branchName ?? "Not available"}
                      </p>
                    </div>
                    <div className="rounded-2xl border border-white/8 bg-white/4 p-4">
                      <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Repo type</p>
                      <p className="mt-2 text-sm font-semibold text-white">
                        {localRepoCheck.gitRepo ? "Git repo detected" : "File snapshot fallback"}
                      </p>
                    </div>
                    <div className="rounded-2xl border border-white/8 bg-white/4 p-4">
                      <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                        Branch state
                      </p>
                      <p className="mt-2 text-sm font-semibold text-white">
                        {humanizeStatus(localRepoCheck.branchState)}
                      </p>
                    </div>
                    <div className="rounded-2xl border border-white/8 bg-white/4 p-4">
                      <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                        Snapshot before
                      </p>
                      <p className="mt-2 text-sm font-semibold text-white">
                        {snapshotBefore ? formatDate(snapshotBefore.capturedAt) : "Not captured"}
                      </p>
                    </div>
                    <div className="rounded-2xl border border-white/8 bg-white/4 p-4">
                      <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                        Snapshot after
                      </p>
                      <p className="mt-2 text-sm font-semibold text-white">
                        {snapshotAfter ? formatDate(snapshotAfter.capturedAt) : "Not captured"}
                      </p>
                    </div>
                  </div>

                  {localRepoCheck.issues.length > 0 ? (
                    <div className="mt-4 space-y-3">
                      {localRepoCheck.issues.map((issue, index) => (
                        <div
                          key={`${issue.message}-${index}`}
                          className="rounded-2xl border border-white/8 bg-white/4 p-4"
                        >
                          <div className="flex flex-wrap items-center justify-between gap-3">
                            <p className="font-semibold text-white">Local repo note</p>
                            <div className={`status-pill ${statusTone(issue.severity)}`}>
                              {humanizeStatus(issue.severity)}
                            </div>
                          </div>
                          <p className="mt-2 text-sm leading-7 text-slate-300">{issue.message}</p>
                        </div>
                      ))}
                    </div>
                  ) : null}
                </DisclosureSection>
              ) : null}

              <div className="panel rounded-[1.8rem] p-6">
                <div className="flex items-center justify-between gap-4">
                  <p className="text-sm font-semibold uppercase tracking-[0.24em] text-sky-300">
                    Verification
                  </p>
                  {run.verification ? (
                    <div className={`status-pill ${statusTone(run.verification.outcome)}`}>
                      {humanizeStatus(run.verification.outcome)}
                    </div>
                  ) : null}
                </div>
                {run.verification ? (
                  <div className="mt-4 space-y-3">
                    <div className="grid gap-3 sm:grid-cols-4">
                      <div className="rounded-2xl border border-white/8 bg-white/4 p-4">
                        <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                          Acceptance
                        </p>
                        <p className="mt-2 text-lg font-semibold text-white">
                          {acceptanceScore.label}
                        </p>
                        <p className="mt-2 text-sm leading-6 text-slate-300">
                          {acceptanceScore.detail}
                        </p>
                      </div>
                      <div className="rounded-2xl border border-white/8 bg-white/4 p-4">
                        <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Scope</p>
                        <p className="mt-2 text-lg font-semibold text-white">{scopeScore.label}</p>
                        <p className="mt-2 text-sm leading-6 text-slate-300">{scopeScore.detail}</p>
                      </div>
                      <div className="rounded-2xl border border-white/8 bg-white/4 p-4">
                        <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                          Commands
                        </p>
                        <p className="mt-2 text-lg font-semibold text-white">
                          {commandsScore.label}
                        </p>
                        <p className="mt-2 text-sm leading-6 text-slate-300">
                          {commandsScore.detail}
                        </p>
                      </div>
                      <div className="rounded-2xl border border-white/8 bg-white/4 p-4">
                        <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                          Integrity
                        </p>
                        <p className="mt-2 text-lg font-semibold text-white">
                          {integrityScore.label}
                        </p>
                        <p className="mt-2 text-sm leading-6 text-slate-300">
                          {integrityScore.detail}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      {headlineFindings.map((item, index) => (
                        <div
                          key={`headline-${item.category}-${index}`}
                          className="rounded-2xl border border-white/8 bg-white/4 p-4"
                        >
                          <div className="flex flex-wrap items-center justify-between gap-3">
                            <p className="font-semibold text-white">
                              {humanizeFindingCategory(item.category)}
                            </p>
                            <div className={`status-pill ${statusTone(item.severity)}`}>
                              {humanizeStatus(item.severity)}
                            </div>
                          </div>
                          <p className="mt-2 text-sm leading-7 text-slate-300">{item.message}</p>
                          {item.paths && item.paths.length > 0 ? (
                            <div className="mt-3 space-y-2 text-xs font-mono text-slate-300">
                              {item.paths.map((filePath, pathIndex) => (
                                <div
                                  key={`${filePath}-${pathIndex}`}
                                  className="rounded-xl border border-white/8 bg-slate-950/70 px-3 py-2"
                                >
                                  {filePath}
                                </div>
                              ))}
                            </div>
                          ) : null}
                        </div>
                      ))}
                    </div>

                    {operatorFacingFindings.length > headlineFindings.length ? (
                      <DisclosureSection
                        title="Full verification notes"
                        summary="Open every verifier note, including lower-priority info items."
                      >
                        <div className="space-y-3">
                          {operatorFacingFindings.map((item, index) => (
                            <div
                              key={`detail-${item.category}-${index}`}
                              className="rounded-2xl border border-white/8 bg-white/4 p-4"
                            >
                              <div className="flex flex-wrap items-center justify-between gap-3">
                                <p className="font-semibold text-white">
                                  {humanizeFindingCategory(item.category)}
                                </p>
                                <div className={`status-pill ${statusTone(item.severity)}`}>
                                  {humanizeStatus(item.severity)}
                                </div>
                              </div>
                              <p className="mt-2 text-sm leading-7 text-slate-300">{item.message}</p>
                              {item.paths && item.paths.length > 0 ? (
                                <div className="mt-3 space-y-2 text-xs font-mono text-slate-300">
                                  {item.paths.map((filePath, pathIndex) => (
                                    <div
                                      key={`finding-${filePath}-${pathIndex}`}
                                      className="rounded-xl border border-white/8 bg-slate-950/70 px-3 py-2"
                                    >
                                      {filePath}
                                    </div>
                                  ))}
                                </div>
                              ) : null}
                            </div>
                          ))}
                        </div>
                      </DisclosureSection>
                    ) : null}
                  </div>
                ) : null}
              </div>

              <div className="panel rounded-[1.8rem] p-6">
                <div className="flex items-center justify-between gap-4">
                  <p className="text-sm font-semibold uppercase tracking-[0.24em] text-cyan-300">
                    Supervisor decision
                  </p>
                  {run.decision ? (
                    <div className={`status-pill ${statusTone(run.decision.action)}`}>
                      {humanizeStatus(run.decision.action)}
                    </div>
                  ) : null}
                </div>
                {run.decision ? (
                  <div className="mt-4 space-y-4">
                    <p className="text-sm leading-7 text-slate-300">{run.decision.reason}</p>
                    {nextTask ? (
                      <div className="rounded-2xl border border-white/8 bg-white/4 p-4">
                        <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Next stage</p>
                        <p className="mt-2 text-lg font-semibold text-white">{nextTask.title}</p>
                        <p className="mt-2 text-xs font-semibold uppercase tracking-[0.18em] text-cyan-200">
                          {getTaskStageLabel(project, nextTask)}
                        </p>
                        {autopilotRun ? (
                          <p className="mt-2 text-sm leading-6 text-emerald-300">
                            NSS already started this step automatically.
                          </p>
                        ) : null}
                      </div>
                    ) : null}
                    <div className="flex flex-wrap gap-3">
                      {run.decision.autopilotRunId ? (
                        <Link
                          className="btn-primary"
                          href={`/projects/${project.id}/runs/${run.decision.autopilotRunId}`}
                        >
                          Open live autopilot run
                        </Link>
                      ) : null}
                      {run.decision.nextTaskId && !run.decision.autopilotRunId ? (
                        <Link
                          className="btn-primary"
                          href={`/projects/${project.id}/tasks/${run.decision.nextTaskId}`}
                        >
                          Open generated next task
                        </Link>
                      ) : null}
                      {run.decision.action === "complete_milestone" ? (
                        <Link className="btn-primary" href={`/projects/${project.id}`}>
                          View completed milestone
                        </Link>
                      ) : null}
                        {["needs_retry", "needs_review"].includes(task.status) ? (
                        <StartRunButton
                          executionMode={project.executionMode}
                          projectId={project.id}
                          providerConfig={project.providerConfig}
                          taskId={task.id}
                        />
                        ) : null}
                      <Link className="btn-secondary" href={`/projects/${project.id}/tasks/${task.id}`}>
                        Return to task
                      </Link>
                    </div>
                  </div>
                ) : null}
              </div>

              <RunInterventionPanel
                projectId={project.id}
                runId={run.id}
                runStatus={run.status}
              />

              <DisclosureSection
                title="AI-reported changed files"
                summary="Open the file list that Codex or the coding agent claimed it changed."
              >
                {run.parsedResult.changedFiles.length > 0 ? (
                  <div className="space-y-3">
                    {run.parsedResult.changedFiles.map((file, index) => (
                      <div
                        key={`${file.path}-${file.summary}-${index}`}
                        className="rounded-2xl border border-white/8 bg-white/4 p-4"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <p className="font-mono text-xs text-cyan-200">{file.path}</p>
                          <div className={`status-pill ${statusTone(file.changeType)}`}>
                            {humanizeStatus(file.changeType)}
                          </div>
                        </div>
                        <p className="mt-2 text-sm leading-7 text-slate-300">{file.summary}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm leading-7 text-slate-300">
                    The pasted payload did not report any changed files.
                  </p>
                )}
              </DisclosureSection>

              {localRepoCheck ? (
                <DisclosureSection
                  title="Repo changes detected locally"
                  summary="Open the exact files NSS detected in the workspace after the run."
                >
                  {actualChangedFiles.length > 0 ? (
                    <div className="space-y-3">
                      {actualChangedFiles.map((file, index) => (
                        <div
                          key={`${file.path}-${file.changeType}-${index}-local`}
                          className="rounded-2xl border border-white/8 bg-white/4 p-4"
                        >
                          <div className="flex flex-wrap items-center justify-between gap-3">
                            <p className="font-mono text-xs text-cyan-200">{file.path}</p>
                            <div className={`status-pill ${statusTone(file.changeType)}`}>
                              {humanizeStatus(file.changeType)}
                            </div>
                          </div>
                          <p className="mt-2 text-sm leading-7 text-slate-300">{file.summary}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm leading-7 text-slate-300">
                      No actual file changes were detected in the configured repo path for this run.
                    </p>
                  )}
                </DisclosureSection>
              ) : null}

              {repoComparison ? (
                <DisclosureSection
                  title="AI vs repo comparison"
                  summary="Open the full comparison between what the agent reported and what NSS found locally."
                >
                  <div className="grid gap-3 md:grid-cols-4">
                    <div className="rounded-2xl border border-white/8 bg-white/4 p-4">
                      <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Matched</p>
                      <p className="mt-2 text-2xl font-semibold text-white">
                        {repoComparison.matchedFiles.length}
                      </p>
                    </div>
                    <div className="rounded-2xl border border-white/8 bg-white/4 p-4">
                      <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                        Extra actual files
                      </p>
                      <p className="mt-2 text-2xl font-semibold text-white">
                        {repoComparison.missingReportedFiles.length}
                      </p>
                    </div>
                    <div className="rounded-2xl border border-white/8 bg-white/4 p-4">
                      <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                        Missing locally
                      </p>
                      <p className="mt-2 text-2xl font-semibold text-white">
                        {repoComparison.unexpectedActualFiles.length}
                      </p>
                    </div>
                    <div className="rounded-2xl border border-white/8 bg-white/4 p-4">
                      <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                        Untracked files
                      </p>
                      <p className="mt-2 text-2xl font-semibold text-white">
                        {repoComparison.untrackedFiles.length}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 space-y-3">
                    {repoComparison.missingReportedFiles.length > 0 ? (
                      <div className="rounded-2xl border border-white/8 bg-white/4 p-4">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <p className="font-semibold text-white">Unexpected changed files</p>
                          <div className={`status-pill ${statusTone("warning")}`}>Heads up</div>
                        </div>
                        <div className="mt-3 space-y-2 text-xs font-mono text-slate-300">
                          {repoComparison.missingReportedFiles.map((filePath, index) => (
                            <div
                              key={`${filePath}-${index}`}
                              className="rounded-xl border border-white/8 bg-slate-950/70 px-3 py-2"
                            >
                              {filePath}
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : null}

                    {repoComparison.unexpectedActualFiles.length > 0 ? (
                      <div className="rounded-2xl border border-white/8 bg-white/4 p-4">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <p className="font-semibold text-white">Files only in the AI report</p>
                          <div className={`status-pill ${statusTone("warning")}`}>Heads up</div>
                        </div>
                        <div className="mt-3 space-y-2 text-xs font-mono text-slate-300">
                          {repoComparison.unexpectedActualFiles.map((filePath, index) => (
                            <div
                              key={`${filePath}-${index}`}
                              className="rounded-xl border border-white/8 bg-slate-950/70 px-3 py-2"
                            >
                              {filePath}
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : null}

                    {repoComparison.integrityWarnings.length > 0 ? (
                      <div className="rounded-2xl border border-white/8 bg-white/4 p-4">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <p className="font-semibold text-white">Integrity warnings</p>
                          <div className={`status-pill ${statusTone("warning")}`}>Heads up</div>
                        </div>
                        <div className="mt-3 space-y-2 text-sm leading-7 text-slate-300">
                          {repoComparison.integrityWarnings.map((warning, index) => (
                            <p key={`${warning}-${index}`}>- {warning}</p>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="rounded-2xl border border-white/8 bg-white/4 p-4">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <p className="font-semibold text-white">Integrity warnings</p>
                          <div className={`status-pill ${statusTone("accepted")}`}>Clear</div>
                        </div>
                        <p className="mt-2 text-sm leading-7 text-slate-300">
                          The AI-reported file list lines up with what NSS DevOS detected
                          in the repo.
                        </p>
                      </div>
                    )}
                  </div>
                </DisclosureSection>
              ) : null}

              <DisclosureSection
                title="AI-reported command reports"
                summary="Open the exact command results the coding agent claimed to run."
              >
                {run.parsedResult.commands.length > 0 ? (
                  <div className="space-y-3">
                    {run.parsedResult.commands.map((command, index) => (
                      <div
                        key={`${command.key}-${command.command}-${index}`}
                        className="rounded-2xl border border-white/8 bg-white/4 p-4"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <div>
                            <p className="font-semibold text-white">
                              {humanizeCommandKey(command.key)}
                            </p>
                            <p className="mt-1 font-mono text-xs text-slate-300">
                              {command.command}
                            </p>
                          </div>
                          <div className={`status-pill ${statusTone(command.status)}`}>
                            {humanizeStatus(command.status)}
                          </div>
                        </div>
                        {command.stdoutText ? (
                          <pre className="mt-3 overflow-auto rounded-xl border border-white/8 bg-slate-950/80 p-3 text-xs text-slate-200">
                            <code>{command.stdoutText}</code>
                          </pre>
                        ) : null}
                        {command.stderrText ? (
                          <pre className="mt-3 overflow-auto rounded-xl border border-rose-400/20 bg-rose-950/30 p-3 text-xs text-rose-100">
                            <code>{command.stderrText}</code>
                          </pre>
                        ) : null}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm leading-7 text-slate-300">
                    The pasted payload did not include any command reports.
                  </p>
                )}
              </DisclosureSection>

              {localRepoCheck ? (
                <DisclosureSection
                  title="Local command checks"
                  summary="Open the exact command runs NSS executed locally for this step."
                >
                  {localCommandReports.length > 0 ? (
                    <div className="space-y-3">
                      {localCommandReports.map((command, index) => (
                        <div
                          key={`${command.key}-${command.command}-${index}-local`}
                          className="rounded-2xl border border-white/8 bg-white/4 p-4"
                        >
                          <div className="flex flex-wrap items-center justify-between gap-3">
                            <div>
                              <p className="font-semibold text-white">
                                {humanizeCommandKey(command.key)}
                              </p>
                              <p className="mt-1 font-mono text-xs text-slate-300">
                                {command.command}
                              </p>
                              <p className="mt-2 text-xs uppercase tracking-[0.18em] text-slate-400">
                                Duration: {formatDurationMs(command.durationMs)}
                              </p>
                            </div>
                            <div className={`status-pill ${statusTone(command.status)}`}>
                              {humanizeStatus(command.status)}
                            </div>
                          </div>
                          {command.stdoutText ? (
                            <pre className="mt-3 overflow-auto rounded-xl border border-white/8 bg-slate-950/80 p-3 text-xs text-slate-200">
                              <code>{command.stdoutText}</code>
                            </pre>
                          ) : null}
                          {command.stderrText ? (
                            <pre className="mt-3 overflow-auto rounded-xl border border-rose-400/20 bg-rose-950/30 p-3 text-xs text-rose-100">
                              <code>{command.stderrText}</code>
                            </pre>
                          ) : null}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm leading-7 text-slate-300">
                      No local commands were run for this step.
                    </p>
                  )}
                </DisclosureSection>
              ) : null}
            </div>
          ) : (
            <div className="panel rounded-[1.8rem] p-6">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-sky-300">
                Awaiting result review
              </p>
                <div className="mt-4 space-y-3 text-sm leading-7 text-slate-300">
                  <p>
                    1.{" "}
                    {run.status === "waiting_on_provider"
                      ? run.provider === "codex-api"
                        ? `NSS already dispatched this run to ${getProviderLabel(run.provider)} and is refreshing provider status automatically.`
                        : `NSS already dispatched this run to ${getProviderLabel(run.provider)}. Refresh the provider status first.`
                      : run.executionMode === "connected"
                      ? `Use the connected run details for ${getProviderLabel(run.provider)}. If direct dispatch is not live yet, use the fallback prompt.`
                      : `Copy the master prompt into ${getProviderLabel(run.provider)}.`}
                  </p>
                  <p>
                    2.{" "}
                    {run.status === "waiting_on_provider"
                      ? "Once NSS moves the run out of provider wait mode, either let automatic ingestion continue or use the fallback JSON path."
                      : "Wait for the agent to return a strict JSON result payload."}
                  </p>
                  <p>
                    3. Paste that payload above to unlock repo-truth verification and next-step
                    guidance.
                  </p>
                </div>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
