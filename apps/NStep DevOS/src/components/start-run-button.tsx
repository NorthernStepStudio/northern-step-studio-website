"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import {
  ExecutionMode,
  ManualProvider,
  ProviderConfig,
} from "@/lib/types";
import {
  getExecutionModeLabel,
  getProviderConnectionSummary,
  getProviderLabel,
} from "@/lib/utils";

export function StartRunButton({
  projectId,
  taskId,
  executionMode,
  providerConfig,
}: {
  projectId: string;
  taskId: string;
  executionMode: ExecutionMode;
  providerConfig: ProviderConfig;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);
  const [provider, setProvider] = useState<ManualProvider>(providerConfig.manualProvider);

  async function onStart() {
    setError(null);
    setIsPending(true);

    try {
      const response = await fetch(`/api/tasks/${taskId}/runs`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          projectId,
          provider: executionMode === "manual" ? provider : undefined,
        }),
      });

      const data = (await response.json()) as { error?: string; runId?: string };

      if (!response.ok || !data.runId) {
        setError(data.error ?? "Could not start the run.");
        return;
      }

      router.push(`/projects/${projectId}/runs/${data.runId}`);
      router.refresh();
    } finally {
      setIsPending(false);
    }
  }

  const connectedProviderLabel = getProviderLabel(providerConfig.connectedProvider);
  const manualProviderLabel = getProviderLabel(provider);
  const connectedStatusSummary = getProviderConnectionSummary(
    providerConfig.connectionStatus,
    providerConfig.connectedProvider,
    providerConfig.apiKeyHint,
  );
  const connectedUnavailable =
    executionMode === "connected" &&
    providerConfig.connectionStatus === "not_configured";
  const buttonLabel =
    executionMode === "connected"
      ? providerConfig.connectedProvider === "mock-connected"
        ? "Start connected mock run"
        : `Start ${connectedProviderLabel} run`
      : `Start ${manualProviderLabel} run`;

  return (
    <div className="space-y-3">
      <div className="rounded-2xl border border-white/8 bg-white/4 px-4 py-4 text-sm leading-7 text-slate-300">
        <p className="font-semibold text-white">
          {getExecutionModeLabel(executionMode)}
        </p>
        <p className="mt-2">
          {executionMode === "connected"
            ? `Connected provider: ${connectedProviderLabel}. ${connectedStatusSummary}`
            : "Choose the coding agent you want to use for this run."}
        </p>
      </div>
      {executionMode === "manual" ? (
        <label className="block space-y-2">
          <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
            Manual provider
          </span>
          <select
            className="field"
            disabled={isPending}
            onChange={(event) => setProvider(event.target.value as ManualProvider)}
            value={provider}
          >
            <option value="codex-app">Codex App</option>
            <option value="antigravity">Antigravity</option>
            <option value="manual-other">Other Coding Agent</option>
          </select>
        </label>
      ) : null}
      <button
        className="btn-primary"
        disabled={isPending || connectedUnavailable}
        onClick={onStart}
        type="button"
      >
        {isPending ? "Opening run..." : buttonLabel}
      </button>
      {connectedUnavailable ? (
        <p className="text-sm text-amber-200">
          {providerConfig.connectedProvider === "codex-api"
            ? `Set ${providerConfig.apiKeyHint?.trim() || "OPENAI_API_KEY"} in the server environment or switch back to manual handoff.`
            : "Add connected-provider settings first or switch back to manual handoff."}
        </p>
      ) : null}
      {error ? <p className="text-sm text-rose-300">{error}</p> : null}
    </div>
  );
}
