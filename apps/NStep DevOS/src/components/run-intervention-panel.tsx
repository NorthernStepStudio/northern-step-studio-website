"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { InterventionAction } from "@/lib/types";

const ACTION_LABELS: Record<InterventionAction, string> = {
  approve_and_continue: "Approve and continue",
  request_retry_with_guidance: "Request retry with guidance",
  mark_rollback_complete: "Mark rollback complete",
  resume_task: "Resume task",
};

export function RunInterventionPanel({
  projectId,
  runId,
  runStatus,
}: {
  projectId: string;
  runId: string;
  runStatus: string;
}) {
  const router = useRouter();
  const [guidance, setGuidance] = useState("");
  const [startNextRun, setStartNextRun] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [pendingAction, setPendingAction] = useState<InterventionAction | null>(null);

  const isPaused =
    runStatus === "needs_review" ||
    runStatus === "needs_retry" ||
    runStatus === "rollback_required";

  if (!isPaused) {
    return null;
  }

  async function onAction(action: InterventionAction) {
    setError(null);
    setMessage(null);
    setPendingAction(action);

    try {
      const response = await fetch(`/api/runs/${runId}/intervention`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action,
          guidance,
          startNextRun,
        }),
      });
      const data = (await response.json()) as {
        error?: string;
        summary?: string;
        nextRunId?: string;
      };

      if (!response.ok) {
        setError(data.error ?? "Could not apply the intervention.");
        return;
      }

      setMessage(data.summary ?? "Supervisor intervention recorded.");
      setGuidance("");
      if (data.nextRunId) {
        router.push(`/projects/${projectId}/runs/${data.nextRunId}`);
        return;
      }

      router.refresh();
    } finally {
      setPendingAction(null);
    }
  }

  return (
    <div className="panel rounded-[1.8rem] p-6">
      <p className="text-sm font-semibold uppercase tracking-[0.24em] text-cyan-300">
        Supervisor actions
      </p>
      <p className="mt-3 text-sm leading-7 text-slate-300">
        Use this when the verifier paused automation. NSS will record the operator decision and,
        when needed, carry the guidance into the next run prompt before resuming the loop.
      </p>
      {runStatus === "rollback_required" ? (
        <p className="mt-3 text-sm leading-7 text-amber-200">
          Mark rollback complete now verifies the risky files against the pre-run snapshot before
          NSS DevOS will continue.
        </p>
      ) : null}
      <label className="mt-4 block space-y-2">
        <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
          Guidance for the next run
        </span>
        <textarea
          className="field min-h-36"
          onChange={(event) => setGuidance(event.target.value)}
          placeholder="Describe what the orchestrator or coding agent should fix next."
          value={guidance}
        />
      </label>
      <label className="mt-4 flex items-start gap-3 rounded-2xl border border-white/8 bg-white/4 px-4 py-3 text-sm text-slate-200">
        <input
          checked={startNextRun}
          className="mt-1"
          onChange={(event) => setStartNextRun(event.target.checked)}
          type="checkbox"
        />
        <span>
          Start the next run immediately after this action when NSS can continue automatically.
        </span>
      </label>
      <div className="mt-5 flex flex-wrap gap-3">
        <button
          className="btn-primary"
          disabled={pendingAction !== null}
          onClick={() => void onAction("approve_and_continue")}
          type="button"
        >
          {pendingAction === "approve_and_continue"
            ? "Applying..."
            : ACTION_LABELS.approve_and_continue}
        </button>
        <button
          className="btn-secondary"
          disabled={pendingAction !== null}
          onClick={() => void onAction("request_retry_with_guidance")}
          type="button"
        >
          {pendingAction === "request_retry_with_guidance"
            ? "Applying..."
            : ACTION_LABELS.request_retry_with_guidance}
        </button>
        {runStatus === "rollback_required" ? (
          <button
            className="btn-secondary"
            disabled={pendingAction !== null}
            onClick={() => void onAction("mark_rollback_complete")}
            type="button"
          >
            {pendingAction === "mark_rollback_complete"
              ? "Applying..."
              : ACTION_LABELS.mark_rollback_complete}
          </button>
        ) : null}
        <button
          className="btn-secondary"
          disabled={pendingAction !== null}
          onClick={() => void onAction("resume_task")}
          type="button"
        >
          {pendingAction === "resume_task" ? "Applying..." : ACTION_LABELS.resume_task}
        </button>
      </div>
      {error ? (
        <div className="mt-4 rounded-2xl border border-rose-400/30 bg-rose-950/30 px-4 py-3 text-sm text-rose-200">
          {error}
        </div>
      ) : null}
      {message ? (
        <div className="mt-4 rounded-2xl border border-emerald-400/30 bg-emerald-950/30 px-4 py-3 text-sm text-emerald-200">
          {message}
        </div>
      ) : null}
    </div>
  );
}
