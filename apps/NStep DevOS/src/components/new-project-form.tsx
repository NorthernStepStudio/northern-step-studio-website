"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

type FormState = {
  name: string;
  rawBrief: string;
  targetMvp: string;
  repoPath: string;
  defaultBranch: string;
  primaryPaths: string;
  executionMode: "manual" | "connected";
  manualProvider: "codex-app" | "antigravity" | "ollama-code" | "manual-other";
  connectedProvider:
    | "mock-connected"
    | "codex-api"
    | "antigravity-api"
    | "ollama-code-api";
  providerBaseUrl: string;
  providerModel: string;
  providerApiKeyHint: string;
  verificationCommands: string;
};

const initialState: FormState = {
  name: "NSS DevOS",
  rawBrief:
    "Build a supervisor app that accepts one product brief, turns it into structured implementation tasks, sends those tasks to a coding agent, verifies the result, and decides the next task until a milestone is complete.",
  targetMvp:
    "Create project brief -> generate task one -> copy prompt into Codex App -> paste result -> verify -> generate next task.",
  repoPath: "D:\\dev\\Northern Step Studio\\apps\\NSS DevOS",
  defaultBranch: "main",
  primaryPaths: "src/app/**\nsrc/components/**\nsrc/lib/**\nREADME.md\npackage.json",
  executionMode: "manual",
  manualProvider: "codex-app",
  connectedProvider: "mock-connected",
  providerBaseUrl: "",
  providerModel: "gpt-5-codex",
  providerApiKeyHint: "OPENAI_API_KEY",
  verificationCommands: "typecheck | npm run lint\nbuild | npm run build",
};

export function NewProjectForm() {
  const router = useRouter();
  const [form, setForm] = useState<FormState>(initialState);
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  const previewCommands = useMemo(
    () =>
      form.verificationCommands
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter(Boolean),
    [form.verificationCommands],
  );

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsPending(true);

    try {
      const response = await fetch("/api/projects", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const data = (await response.json()) as {
        error?: string;
        projectId?: string;
        initialRunId?: string;
      };

      if (!response.ok || !data.projectId) {
        setError(data.error ?? "Could not create the project.");
        return;
      }

      router.push(
        data.initialRunId
          ? `/projects/${data.projectId}/runs/${data.initialRunId}`
          : `/projects/${data.projectId}`,
      );
      router.refresh();
    } finally {
      setIsPending(false);
    }
  }

  return (
    <form className="space-y-6" onSubmit={onSubmit}>
      <div className="grid gap-4 md:grid-cols-2">
        <label className="space-y-2">
          <span className="text-sm font-semibold text-slate-300">Project name</span>
          <input
            className="field"
            value={form.name}
            onChange={(event) => update("name", event.target.value)}
          />
        </label>
        <label className="space-y-2">
          <span className="text-sm font-semibold text-slate-300">Target MVP</span>
          <input
            className="field"
            value={form.targetMvp}
            onChange={(event) => update("targetMvp", event.target.value)}
          />
        </label>
      </div>

      <label className="space-y-2">
        <span className="text-sm font-semibold text-slate-300">Project brief</span>
        <textarea
          className="field min-h-52"
          value={form.rawBrief}
          onChange={(event) => update("rawBrief", event.target.value)}
        />
      </label>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="space-y-2">
          <span className="text-sm font-semibold text-slate-300">Repo path</span>
          <input
            className="field"
            value={form.repoPath}
            onChange={(event) => update("repoPath", event.target.value)}
          />
        </label>
        <label className="space-y-2">
          <span className="text-sm font-semibold text-slate-300">Default branch</span>
          <input
            className="field"
            value={form.defaultBranch}
            onChange={(event) => update("defaultBranch", event.target.value)}
          />
        </label>
      </div>

      <div className="panel rounded-[1.6rem] p-5">
        <div className="grid gap-4 md:grid-cols-2">
          <label className="space-y-2">
            <span className="text-sm font-semibold text-slate-300">Execution mode</span>
            <select
              className="field"
              value={form.executionMode}
              onChange={(event) =>
                update("executionMode", event.target.value as FormState["executionMode"])
              }
            >
              <option value="manual">Manual handoff</option>
              <option value="connected">Connected automation</option>
            </select>
          </label>
          <label className="space-y-2">
            <span className="text-sm font-semibold text-slate-300">
              Manual fallback provider
            </span>
            <select
              className="field"
              value={form.manualProvider}
              onChange={(event) =>
                update("manualProvider", event.target.value as FormState["manualProvider"])
              }
            >
              <option value="codex-app">Codex App</option>
              <option value="antigravity">Antigravity</option>
              <option value="ollama-code">Ollama Code</option>
              <option value="manual-other">Other coding agent</option>
            </select>
          </label>
        </div>

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <label className="space-y-2">
            <span className="text-sm font-semibold text-slate-300">Connected provider</span>
            <select
              className="field"
              value={form.connectedProvider}
              onChange={(event) =>
                update(
                  "connectedProvider",
                  event.target.value as FormState["connectedProvider"],
                )
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
              value={form.providerModel}
              onChange={(event) => update("providerModel", event.target.value)}
            />
          </label>
        </div>

        <div className="mt-4 grid gap-4 md:grid-cols-2">
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

        <div className="mt-4 rounded-2xl border border-white/8 bg-white/4 px-4 py-4 text-sm leading-7 text-slate-300">
          {form.executionMode === "connected"
            ? form.connectedProvider === "codex-api"
              ? `Connected mode can dispatch directly to Codex API when ${form.providerApiKeyHint.trim() || "OPENAI_API_KEY"} is available on the server. NSS DevOS will auto-start task one after project creation and still keep the manual fallback prompt for recovery.`
              : form.connectedProvider === "mock-connected"
                ? "Connected mode keeps the provider lifecycle inside NSS. The mock provider is useful for proving automation, and NSS DevOS will auto-start task one after project creation."
                : form.connectedProvider === "ollama-code-api"
                  ? "Connected mode for Ollama Code is planned for a future local adapter. NSS DevOS will create the project and leave task one ready until that connected path exists."
                : "Connected mode is available, but this provider adapter is still planned. NSS DevOS will create the project and leave task one ready until the adapter is implemented."
            : form.manualProvider === "ollama-code"
              ? "Manual mode keeps the current copy-paste loop. Ollama Code is a good future local-model path when you do not want a cloud API key."
              : "Manual mode keeps the current copy-paste loop. NSS still stores connected-provider settings so you can move into full automation without recreating the project later."}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="space-y-2">
          <span className="text-sm font-semibold text-slate-300">
            Primary code paths
          </span>
          <textarea
            className="field min-h-44"
            value={form.primaryPaths}
            onChange={(event) => update("primaryPaths", event.target.value)}
          />
        </label>
        <label className="space-y-2">
          <span className="text-sm font-semibold text-slate-300">
            Verification commands
          </span>
          <textarea
            className="field min-h-44"
            value={form.verificationCommands}
            onChange={(event) => update("verificationCommands", event.target.value)}
          />
        </label>
      </div>

      <div className="panel rounded-[1.6rem] p-5">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-sky-300">
          Command preview
        </p>
        <div className="mt-4 space-y-2 text-sm text-slate-300">
          {previewCommands.length > 0 ? (
            previewCommands.map((command) => (
              <div
                key={command}
                className="rounded-2xl border border-white/8 bg-white/4 px-4 py-3"
              >
                {command}
              </div>
            ))
          ) : (
            <div className="rounded-2xl border border-dashed border-white/12 px-4 py-6 text-slate-400">
              Add one command per line using <code>key | command</code>.
            </div>
          )}
        </div>
      </div>

      {error ? (
        <div className="rounded-2xl border border-rose-400/30 bg-rose-950/30 px-4 py-3 text-sm text-rose-200">
          {error}
        </div>
      ) : null}

      <div className="flex flex-wrap gap-3">
        <button className="btn-primary" disabled={isPending} type="submit">
          {isPending ? "Creating project..." : "Create project"}
        </button>
        <button
          className="btn-secondary"
          disabled={isPending}
          onClick={() => setForm(initialState)}
          type="button"
        >
          Reset defaults
        </button>
      </div>
    </form>
  );
}
