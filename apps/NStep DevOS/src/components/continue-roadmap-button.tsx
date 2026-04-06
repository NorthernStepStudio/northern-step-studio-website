"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function ContinueRoadmapButton({ projectId }: { projectId: string }) {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onContinue() {
    setError(null);
    setIsPending(true);

    try {
      const response = await fetch(`/api/projects/${projectId}/continue`, {
        method: "POST",
      });
      const data = (await response.json()) as { error?: string; nextTaskId?: string };

      if (!response.ok || !data.nextTaskId) {
        setError(data.error ?? "Could not open the next stage.");
        return;
      }

      router.push(`/projects/${projectId}/tasks/${data.nextTaskId}`);
      router.refresh();
    } finally {
      setIsPending(false);
    }
  }

  return (
    <div className="space-y-3">
      <button className="btn-primary" disabled={isPending} onClick={onContinue} type="button">
        {isPending ? "Opening next stage..." : "Open next stage"}
      </button>
      {error ? <p className="text-sm text-rose-300">{error}</p> : null}
    </div>
  );
}
