"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import {
  ConnectedProvider,
  ExecutionMode,
  ManualProvider,
  ProviderConfig,
} from "@/lib/types";
import {
  getExecutionModeSummary,
  getProviderConnectionSummary,
  getProviderLabel,
} from "@/lib/utils";

type ExecutionModePanelProps = {
  projectId: string;
  executionMode: ExecutionMode;
  providerConfig: ProviderConfig;
};

type FormState = {
  executionMode: ExecutionMode;
  manualProvider: ManualProvider;
  connectedProvider: ConnectedProvider;
  providerBaseUrl: string;
  providerModel: string;
  providerApiKeyHint: string;
  autoDispatchEnabled: boolean;
  autoIngestEnabled: boolean;
  autopilotEnabled: boolean;
};

type ConnectionTestResult = {
  ok: boolean;
  summary: string;
  detail: string;
  checkedAt: string;
};

export function ExecutionModePanel({
  projectId,
  executionMode,
  providerConfig,
}: ExecutionModePanelProps) {
  const router = useRouter();
  const [form, setForm] = useState<FormState>({
    executionMode,
    manualProvider: providerConfig.manualProvider,
    connectedProvider: providerConfig.connectedProvider,
    providerBaseUrl: providerConfig.baseUrl ?? "",
    providerModel: providerConfig.model ?? "",
    providerApiKeyHint: providerConfig.apiKeyHint ?? "",
    autoDispatchEnabled: providerConfig.autoDispatchEnabled,
    autoIngestEnabled: providerConfig.autoIngestEnabled,
    autopilotEnabled: providerConfig.autopilotEnabled,
  });
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<ConnectionTestResult | null>(null);

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function onSave(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setMessage(null);
    setIsPending(true);

    try {
      const response = await fetch(`/api/projects/${projectId}/settings`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const data = (await response.json()) as { error?: string };

      if (!response.ok) {
        setError(data.error ?? "Could not update execution settings.");
        return;
      }

      setMessage("Execution settings saved.");
      router.refresh();
    } finally {
      setIsPending(false);
    }
  }

  async function onTestConnection() {
    setError(null);
    setMessage(null);
    setTestResult(null);
    setIsTesting(true);

    try {
      const response = await fetch(`/api/projects/${projectId}/settings/test`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const data = (await response.json()) as
        | ({ error?: string } & Partial<ConnectionTestResult>)
        | undefined;

      if (!response.ok) {
        if (data?.summary && data.detail && typeof data.ok === "boolean") {
          setTestResult({
            ok: data.ok,
            summary: data.summary,
            detail: data.detail,
            checkedAt: data.checkedAt ?? new Date().toISOString(),
          });
          return;
        }

        setError(data?.error ?? "Could not test provider connection.");
        return;
      }

      if (!data?.summary || !data.detail || typeof data.ok !== "boolean") {
        setError("Provider test did not return a complete result.");
        return;
      }

      setTestResult({
        ok: data.ok,
        summary: data.summary,
        detail: data.detail,
        checkedAt: data.checkedAt ?? new Date().toISOString(),
      });
    } finally {
      setIsTesting(false);
    }
  }

  return (
    <form className="space-y-4" onSubmit={onSave}>
      <div className="grid gap-4 md:grid-cols-2">
        <label className="space-y-2">
          <span className="text-sm font-semibold text-slate-300">Execution mode</span>
          <select
            className="field"
            value={form.executionMode}
            onChange={(event) =>
              update("executionMode", event.target.value as ExecutionMode)
            }
          >
            <option value="manual">Manual handoff</option>
            <option value="connected">Connected automation</option>
          </select>
        </label>
        <label className="space-y-2">
          <span className="text-sm font-semibold text-slate-300">Manual fallback</span>
          <select
            className="field"
            value={form.manualProvider}
            onChange={(event) =>
              update("manualProvider", event.target.value as ManualProvider)
            }
          >
            <option value="codex-app">Codex App</option>
            <option value="antigravity">Antigravity</option>
            <option value="ollama-code">Ollama Code</option>
            <option value="manual-other">Other coding agent</option>
          </select>
        </label>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="space-y-2">
          <span className="text-sm font-semibold text-slate-300">Connected provider</span>
          <select
            className="field"
            value={form.connectedProvider}
            onChange={(event) =>
              update("connectedProvider", event.target.value as ConnectedProvider)
            }
          >
            <option value="mock-connected">Mock connected provider</option>
            <option value="codex-api">Codex API</option>
            <option value="antigravity-api">Antigravity API</option>
            <option value="ollama-code-api">Ollama Code API</option>
          </select>
        </label>
        <label className="space-y-2">
          <span className="text-sm font-semibold text-slate-300">Provider model</span>
          <input
            className="field"
            placeholder="gpt-5-codex"
            value={form.providerModel}
            onChange={(event) => update("providerModel", event.target.value)}
          />
        </label>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="space-y-2">
          <span className="text-sm font-semibold text-slate-300">Provider base URL</span>
          <input
            className="field"
            placeholder="https://api.example.com/v1"
            value={form.providerBaseUrl}
            onChange={(event) => update("providerBaseUrl", event.target.value)}
          />
        </label>
        <label className="space-y-2">
          <span className="text-sm font-semibold text-slate-300">API key hint</span>
          <input
            className="field"
            placeholder="OPENAI_API_KEY"
            value={form.providerApiKeyHint}
            onChange={(event) => update("providerApiKeyHint", event.target.value)}
          />
        </label>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        <label className="rounded-2xl border border-white/8 bg-white/4 px-4 py-4 text-sm text-slate-200">
          <input
            className="mr-3"
            checked={form.autoDispatchEnabled}
            onChange={(event) => update("autoDispatchEnabled", event.target.checked)}
            type="checkbox"
          />
          Auto-dispatch ready
        </label>
        <label className="rounded-2xl border border-white/8 bg-white/4 px-4 py-4 text-sm text-slate-200">
          <input
            className="mr-3"
            checked={form.autoIngestEnabled}
            onChange={(event) => update("autoIngestEnabled", event.target.checked)}
            type="checkbox"
          />
          Auto-ingest ready
        </label>
        <label className="rounded-2xl border border-white/8 bg-white/4 px-4 py-4 text-sm text-slate-200">
          <input
            className="mr-3"
            checked={form.autopilotEnabled}
            onChange={(event) => update("autopilotEnabled", event.target.checked)}
            type="checkbox"
          />
          Autopilot enabled
        </label>
      </div>

      <div className="rounded-[1.4rem] border border-white/8 bg-white/4 p-4 text-sm leading-7 text-slate-300">
        <p className="font-semibold text-white">
          {form.executionMode === "connected"
            ? `${getProviderLabel(form.connectedProvider)} is the active connected provider.`
            : `${getProviderLabel(form.manualProvider)} is the active manual handoff target.`}
        </p>
        <p className="mt-2">{getExecutionModeSummary(form.executionMode)}</p>
        <p className="mt-2">
          {getProviderConnectionSummary(
            form.connectedProvider === "mock-connected"
              ? "mock_ready"
              : form.connectedProvider === "codex-api"
                ? form.providerApiKeyHint.trim()
                  ? "configured"
                  : "not_configured"
                : form.providerBaseUrl || form.providerModel || form.providerApiKeyHint
                ? "configured"
                : "not_configured",
            form.connectedProvider,
            form.providerApiKeyHint,
          )}
        </p>
      </div>

      {error ? (
        <div className="rounded-2xl border border-rose-400/30 bg-rose-950/30 px-4 py-3 text-sm text-rose-200">
          {error}
        </div>
      ) : null}

      {message ? (
        <div className="rounded-2xl border border-emerald-400/30 bg-emerald-950/30 px-4 py-3 text-sm text-emerald-200">
          {message}
        </div>
      ) : null}

      {testResult ? (
        <div
          className={`rounded-2xl px-4 py-3 text-sm ${
            testResult.ok
              ? "border border-emerald-400/30 bg-emerald-950/30 text-emerald-200"
              : "border border-amber-400/30 bg-amber-950/30 text-amber-100"
          }`}
        >
          <p className="font-semibold">{testResult.summary}</p>
          <p className="mt-2 leading-7">{testResult.detail}</p>
        </div>
      ) : null}

      <div className="flex flex-wrap gap-3">
        <button className="btn-secondary" disabled={isPending || isTesting} type="submit">
          {isPending ? "Saving..." : "Save execution settings"}
        </button>
        <button
          className="btn-primary"
          disabled={isPending || isTesting}
          onClick={onTestConnection}
          type="button"
        >
          {isTesting ? "Testing connection..." : "Test connected provider"}
        </button>
      </div>
    </form>
  );
}
