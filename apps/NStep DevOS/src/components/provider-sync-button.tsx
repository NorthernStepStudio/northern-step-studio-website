"use client";

import { startTransition, useEffect, useEffectEvent, useRef, useState } from "react";
import { useRouter } from "next/navigation";

const AUTO_POLL_INTERVAL_MS = 4000;
const INITIAL_AUTO_POLL_DELAY_MS = 1500;

function getNextPollDelay(lastProviderSyncAt?: string) {
  if (!lastProviderSyncAt) {
    return INITIAL_AUTO_POLL_DELAY_MS;
  }

  const elapsedMs = Date.now() - new Date(lastProviderSyncAt).getTime();

  if (!Number.isFinite(elapsedMs) || elapsedMs < 0) {
    return AUTO_POLL_INTERVAL_MS;
  }

  return Math.max(1000, AUTO_POLL_INTERVAL_MS - elapsedMs);
}

export function ProviderSyncButton({
  runId,
  provider,
  runStatus,
  autoIngestEnabled = false,
  lastProviderSyncAt,
}: {
  runId: string;
  provider: string;
  runStatus: string;
  autoIngestEnabled?: boolean;
  lastProviderSyncAt?: string;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);
  const [syncMode, setSyncMode] = useState<"manual" | "auto" | null>(null);
  const inFlightRef = useRef(false);
  const autoPollingEnabled = provider === "codex-api" && runStatus === "waiting_on_provider";

  async function runSync(mode: "manual" | "auto") {
    if (inFlightRef.current) {
      return;
    }

    inFlightRef.current = true;
    setError(null);
    setIsPending(true);
    setSyncMode(mode);

    try {
      const response = await fetch(`/api/runs/${runId}/sync`, {
        method: "POST",
      });
      const data = (await response.json()) as { error?: string };

      if (!response.ok) {
        setError(data.error ?? "Could not refresh provider status.");
        return;
      }

      startTransition(() => {
        router.refresh();
      });
    } finally {
      inFlightRef.current = false;
      setIsPending(false);
      setSyncMode(null);
    }
  }

  const autoSync = useEffectEvent(() => {
    void runSync("auto");
  });

  useEffect(() => {
    if (!autoPollingEnabled) {
      return;
    }

    const timer = window.setTimeout(() => {
      autoSync();
    }, getNextPollDelay(lastProviderSyncAt));

    return () => {
      window.clearTimeout(timer);
    };
  }, [autoPollingEnabled, lastProviderSyncAt]);

  async function onRefresh() {
    await runSync("manual");
  }

  return (
    <div className="space-y-3">
      {autoPollingEnabled ? (
        <p className="text-sm text-cyan-200">
          NSS is auto-refreshing Codex API about every 4 seconds while this run is still active.
        </p>
      ) : null}
      <button className="btn-primary" disabled={isPending} onClick={onRefresh} type="button">
        {isPending
          ? syncMode === "auto"
            ? "Auto-refreshing Codex API..."
            : "Refreshing..."
          : autoIngestEnabled
            ? "Refresh provider and ingest result"
            : "Refresh provider status"}
      </button>
      {error ? <p className="text-sm text-rose-300">{error}</p> : null}
    </div>
  );
}
