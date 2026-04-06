import Link from "next/link";

import { getAutomationPauseSummary } from "@/lib/utils";

export function AutomationPausePanel({
  projectId,
  taskId,
  runId,
  taskStatus,
  runStatus,
  decisionAction,
}: {
  projectId: string;
  taskId?: string;
  runId?: string;
  taskStatus?: string;
  runStatus?: string;
  decisionAction?: string;
}) {
  const pause = getAutomationPauseSummary({
    taskStatus,
    runStatus,
    decisionAction,
  });

  if (!pause) {
    return null;
  }

  return (
    <div className="rounded-[1.8rem] border border-amber-400/30 bg-amber-950/25 p-6">
      <p className="text-sm font-semibold uppercase tracking-[0.24em] text-amber-200">
        Automation pause
      </p>
      <h2 className="mt-2 text-2xl font-semibold text-white">{pause.title}</h2>
      <p className="mt-4 text-sm leading-7 text-amber-50">{pause.detail}</p>
      <p className="mt-4 text-sm leading-7 text-amber-100/90">
        NSS does not edit code inside this UI. The recovery path is: review here, make repo or
        agent changes outside NSS when needed, then use the supervisor actions or launch another
        run from the same task.
      </p>
      <div className="mt-5 flex flex-wrap gap-3">
        {taskId ? (
          <Link className="btn-primary" href={`/projects/${projectId}/tasks/${taskId}`}>
            Open task
          </Link>
        ) : null}
        {runId ? (
          <Link className="btn-secondary" href={`/projects/${projectId}/runs/${runId}`}>
            Open run
          </Link>
        ) : null}
        <Link className="btn-secondary" href={`/projects/${projectId}`}>
          Open overview
        </Link>
      </div>
    </div>
  );
}
