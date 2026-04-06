"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function RunSubmissionForm({
  runId,
  initialText,
  templateText,
}: {
  runId: string;
  initialText?: string;
  templateText?: string;
}) {
  const router = useRouter();
  const [value, setValue] = useState(initialText ?? "");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccess(null);
    setIsPending(true);

    try {
      const response = await fetch(`/api/runs/${runId}/submit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ submissionText: value }),
      });

      const data = (await response.json()) as { error?: string };

      if (!response.ok) {
        setError(data.error ?? "Could not submit the run result.");
        return;
      }

      setSuccess("Run submitted. Review the verification details below.");
      router.refresh();
    } finally {
      setIsPending(false);
    }
  }

  return (
    <form className="space-y-4" onSubmit={onSubmit}>
      <p className="text-sm leading-7 text-slate-300">
        The pasted payload must stay as valid JSON and should include the current run ID, task ID,
        task title, changed files, and command reports.
      </p>
      <textarea
        className="field min-h-[24rem] font-mono text-sm"
        onChange={(event) => setValue(event.target.value)}
        spellCheck={false}
        value={value}
      />
      {success ? (
        <div className="rounded-2xl border border-emerald-400/30 bg-emerald-950/30 px-4 py-3 text-sm text-emerald-100">
          {success}
        </div>
      ) : null}
      {error ? (
        <div className="rounded-2xl border border-rose-400/30 bg-rose-950/30 px-4 py-3 text-sm text-rose-200">
          {error}
        </div>
      ) : null}
      <div className="flex flex-wrap gap-3">
        <button className="btn-primary" disabled={isPending} type="submit">
          {isPending ? "Submitting..." : "Submit agent result"}
        </button>
        {templateText ? (
          <button
            className="btn-secondary"
            disabled={isPending}
            onClick={() => setValue(templateText)}
            type="button"
          >
            Load result template
          </button>
        ) : null}
        <button
          className="btn-secondary"
          disabled={isPending}
          onClick={() => setValue("")}
          type="button"
        >
          Clear
        </button>
      </div>
    </form>
  );
}
