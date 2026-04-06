"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";

import type {
  DashboardSnapshot,
  GoalInput,
  HealthSnapshot,
  JobRecord,
  MemoryEntry,
  WorkflowSummary,
} from "../lib/types";
import { buildLeadRecoveryTemplate, buildTemplate, type GoalDraft, goalDraftToGoalInput } from "../lib/templates";
import {
  fetchJson,
  formatDateTime,
  formatPercent,
  sortJobs,
  sortMemory,
  statusTone,
  topWorkflowCounts,
} from "../lib/ui";
import { GoalForm } from "./goal-form";

const INITIAL_TEMPLATE = buildLeadRecoveryTemplate();

export default function DashboardClient() {
  const [health, setHealth] = useState<HealthSnapshot | null>(null);
  const [dashboard, setDashboard] = useState<DashboardSnapshot | null>(null);
  const [jobs, setJobs] = useState<JobRecord[]>([]);
  const [memory, setMemory] = useState<MemoryEntry[]>([]);
  const [workflows, setWorkflows] = useState<WorkflowSummary[]>([]);
  const [selectedJobId, setSelectedJobId] = useState<string>("");
  const [goal, setGoal] = useState<GoalDraft>(INITIAL_TEMPLATE);
  const [payloadError, setPayloadError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [approvalBusy, setApprovalBusy] = useState<string | null>(null);

  const selectedJob = useMemo(() => {
    return jobs.find((job) => job.jobId === selectedJobId) || jobs[0] || dashboard?.recentJobs[0];
  }, [dashboard?.recentJobs, jobs, selectedJobId]);

  useEffect(() => {
    void loadData(false);
    const interval = setInterval(() => {
      void loadData(true);
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!selectedJobId && jobs.length > 0) {
      setSelectedJobId(jobs[0].jobId);
    }
  }, [jobs, selectedJobId]);

  async function loadData(silent: boolean): Promise<void> {
    try {
      if (silent) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const [healthResponse, dashboardResponse, jobsResponse, memoryResponse, workflowsResponse] = await Promise.all([
        fetchJson<HealthSnapshot>("/api/nstep/health"),
        fetchJson<{ dashboard: DashboardSnapshot }>("/api/nstep/v1/dashboard"),
        fetchJson<{ jobs: JobRecord[] }>("/api/nstep/v1/jobs"),
        fetchJson<{ memory: MemoryEntry[] }>("/api/nstep/v1/memory"),
        fetchJson<{ workflows: WorkflowSummary[] }>("/api/nstep/v1/workflows"),
      ]);

      setHealth(healthResponse);
      setDashboard(dashboardResponse.dashboard);
      setJobs(sortJobs(jobsResponse.jobs));
      setMemory(sortMemory(memoryResponse.memory));
      setWorkflows(workflowsResponse.workflows);
      setError(null);
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "Failed to load dashboard data.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  async function handleGoalSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setPayloadError(null);
    setError(null);

    let goalInput: GoalInput;
    try {
      goalInput = goalDraftToGoalInput(goal);
    } catch (parseError) {
      setPayloadError(parseError instanceof Error ? parseError.message : "Payload JSON is invalid.");
      return;
    }

    const body: { goal: GoalInput } = { goal: goalInput };

    try {
      setSubmitting(true);
      const response = await fetchJson<{ job: JobRecord }>("/api/nstep/v1/goals", {
        method: "POST",
        body: JSON.stringify(body),
      });
      setSelectedJobId(response.job.jobId);
      await loadData(true);
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "Failed to submit goal.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleApprove(jobId: string, stepId: string): Promise<void> {
    try {
      setApprovalBusy(`${jobId}:${stepId}`);
      await fetchJson<{ job: JobRecord }>(`/api/nstep/v1/jobs/${jobId}/approve`, {
        method: "POST",
        body: JSON.stringify({ stepId }),
      });
      await loadData(true);
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "Failed to approve workflow step.");
    } finally {
      setApprovalBusy(null);
    }
  }

  function loadTemplate(product: GoalDraft["product"]): void {
    setGoal(buildTemplate(product));
    setPayloadError(null);
  }

  const workflowCounts = topWorkflowCounts(workflows, dashboard);
  const approvals = jobs.filter((job) => job.status === "waiting_approval" || job.approvalStatus === "pending");
  const failures = jobs.filter((job) => job.status === "failed");

  return (
    <div className="panel-stack">
      {error ? <div className="error-banner">{error}</div> : null}

      <header className="hero">
        <div className="hero-top">
          <div>
            <div className="eyebrow">
              <span className="pill status-info">NStepOS</span>
              <span>Operator console</span>
            </div>
            <h1 className="hero-title">Controlled autonomous work, not a chatbot.</h1>
            <p className="hero-copy">
              NStepOS routes goals into durable jobs, specialized steps, approval gates, live integrations, and
              memory. This dashboard keeps the orchestration visible while the work stays behind the scenes.
            </p>
          </div>
          <div className="hero-meta">
            <div className="meta-row">
              <span className="meta-label">Service</span>
              <span className="meta-value">{health?.service || "NStepOS"}</span>
            </div>
            <div className="meta-row">
              <span className="meta-label">Provider</span>
              <span className="meta-value">{health?.providerMode || "loading"}</span>
            </div>
            <div className="meta-row">
              <span className="meta-label">Updated</span>
              <span className="meta-value">{health ? formatDateTime(health.checkedAt) : "…"}</span>
            </div>
          </div>
        </div>

        <div className="toolbar">
          <button className="button button-primary" onClick={() => void loadData(false)} disabled={loading || refreshing}>
            {refreshing ? "Refreshing" : loading ? "Loading" : "Refresh data"}
          </button>
          <button className="button button-secondary" type="button" onClick={() => loadTemplate("lead-recovery")}>
            Lead recovery
          </button>
          <button className="button button-secondary" type="button" onClick={() => loadTemplate("nexusbuild")}>
            NexusBuild
          </button>
          <button className="button button-secondary" type="button" onClick={() => loadTemplate("provly")}>
            ProvLy
          </button>
          <button className="button button-secondary" type="button" onClick={() => loadTemplate("neurormoves")}>
            NeuroMoves
          </button>
        </div>

        <div className="metric-grid">
          <MetricCard label="Jobs" value={dashboard?.jobs.total ?? 0} note="Durable workflow jobs stored in the runtime." />
          <MetricCard label="Active" value={dashboard?.jobs.running ?? 0} note="Currently executing or resuming steps." />
          <MetricCard label="Approvals" value={dashboard?.approvals.pending ?? 0} note="Human review checkpoints waiting on action." />
          <MetricCard label="Memory" value={dashboard?.memory.total ?? 0} note="Reusable workflow patterns and preferences." />
        </div>
      </header>

      <div className="dashboard-grid">
        <aside className="panel panel-pad panel-stack">
          <GoalForm
            goal={goal}
            payloadError={payloadError}
            submitting={submitting}
            onChange={setGoal}
            onSubmit={(form) => void handleGoalSubmit(form)}
          />

          <section>
            <div className="section-title">
              <h2>Workflow catalog</h2>
              <span className="section-subtitle">{workflows.length} live routes</span>
            </div>
            <div className="summary-list">
              {workflowCounts.length > 0 ? (
                workflowCounts.map((workflow) => (
                  <div className="summary-item" key={workflow.key}>
                    <div className="summary-head">
                      <p className="summary-name">{workflow.title}</p>
                      <span className="pill status-info">{workflow.count} jobs</span>
                    </div>
                    <p className="summary-detail">{workflow.description}</p>
                  </div>
                ))
              ) : (
                <div className="empty-state">No workflow definitions were returned yet.</div>
              )}
            </div>
          </section>

          <section>
            <div className="section-title">
              <h2>System health</h2>
              <span className="section-subtitle">{health?.status || "unknown"}</span>
            </div>
            <div className="stack-small">
              <HealthLine label="Database" value={health?.databaseProvider || "file"} />
              <HealthLine label="Redis" value={health?.redisProvider || "mock"} />
              <HealthLine label="Workflow keys" value={health?.workflowKeys.join(", ") || "loading"} />
              <HealthLine label="Data dir" value={health?.dataDir || "loading"} />
              <HealthLine label="Memory index" value={health ? String(health.memory) : "loading"} />
              <HealthLine label="Job index" value={health ? String(health.jobs) : "loading"} />
            </div>
          </section>
        </aside>

        <main className="panel panel-pad panel-stack">
          <section className="grid-two">
            <div className="panel panel-pad panel-strong">
              <div className="section-title">
                <h2>Job queue</h2>
                <span className="section-subtitle">{jobs.length} records</span>
              </div>
              {jobs.length > 0 ? (
                <div className="job-list">
                  {jobs.map((job) => (
                    <button
                      key={job.jobId}
                      type="button"
                      className={`job-row ${selectedJob?.jobId === job.jobId ? "job-row-active" : ""}`}
                      onClick={() => setSelectedJobId(job.jobId)}
                    >
                      <div className="job-row-top">
                        <div>
                          <p className="job-row-title">{job.goal.goal}</p>
                          <div className="job-row-meta">
                            <span>{job.jobId}</span>
                            <span>{job.goal.product}</span>
                            <span>{job.route?.lane || "unrouted"}</span>
                          </div>
                        </div>
                        <StatusPill value={job.status} />
                      </div>
                      <div className="job-row-meta">
                        <span>{job.approvalStatus}</span>
                        <span>{formatDateTime(job.updatedAt)}</span>
                        <span>{job.route?.riskLevel || "risk-unknown"}</span>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="empty-state">No jobs have been created yet.</div>
              )}
            </div>

            <div className="panel panel-pad panel-strong">
              <div className="section-title">
                <h2>Selected job</h2>
                <span className="section-subtitle">{selectedJob?.jobId || "none selected"}</span>
              </div>
              {selectedJob ? (
                <div className="detail-grid">
                  <div className="detail-block">
                    <p className="detail-label">Goal</p>
                    <p className="detail-value">{selectedJob.goal.goal}</p>
                    <div className="pill-row" style={{ marginTop: 12 }}>
                      <StatusPill value={selectedJob.goal.product} />
                      <StatusPill value={selectedJob.goal.priority} />
                      <StatusPill value={selectedJob.goal.mode} />
                      <StatusPill value={selectedJob.approvalStatus} />
                    </div>
                  </div>

                  <div className="detail-block">
                    <p className="detail-label">Routing</p>
                    <p className="detail-value">{selectedJob.route?.reasoning || "Route not yet computed."}</p>
                    <div className="pill-row" style={{ marginTop: 12 }}>
                      <StatusPill value={selectedJob.route?.workflow || selectedJob.goal.product} />
                      <StatusPill value={selectedJob.route?.lane || "unknown"} />
                      <StatusPill value={selectedJob.route?.riskLevel || "unknown"} />
                      <StatusPill value={selectedJob.status} />
                    </div>
                  </div>

                  <div className="detail-block">
                    <p className="detail-label">Plan</p>
                    <div className="step-list">
                      {(selectedJob.steps || []).map((step) => (
                        <div className="step-item" key={step.id}>
                          <div className="step-item-top">
                            <div>
                              <p className="step-title">{step.title}</p>
                              <div className="step-meta">
                                <span>{step.id}</span>
                                <span>{step.type}</span>
                                <span>{step.tool}</span>
                                <span>deps: {step.dependsOn.length}</span>
                              </div>
                            </div>
                            <div className="stack-small" style={{ justifyItems: "end" }}>
                              <StatusPill value={step.status} />
                              {step.status === "waiting_approval" || step.approvalRequired ? (
                                <button
                                  className="button button-secondary"
                                  type="button"
                                  onClick={() => void handleApprove(selectedJob.jobId, step.id)}
                                  disabled={approvalBusy === `${selectedJob.jobId}:${step.id}`}
                                >
                                  {approvalBusy === `${selectedJob.jobId}:${step.id}` ? "Approving" : "Approve step"}
                                </button>
                              ) : null}
                            </div>
                          </div>
                          <pre className="code-block" style={{ marginTop: 12 }}>
                            {JSON.stringify(step.input, null, 2)}
                          </pre>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="detail-block">
                    <p className="detail-label">Result</p>
                    <p className="detail-value">{selectedJob.result?.summary || selectedJob.error || "No result yet."}</p>
                    {selectedJob.result ? (
                      <pre className="code-block" style={{ marginTop: 12 }}>
                        {JSON.stringify(selectedJob.result.data, null, 2)}
                      </pre>
                    ) : null}
                  </div>
                </div>
              ) : (
                <div className="empty-state">Select a job to inspect its steps, logs, and result.</div>
              )}
            </div>
          </section>

          <section className="panel panel-pad panel-strong">
            <div className="section-title">
              <h2>Execution logs</h2>
              <span className="section-subtitle">{selectedJob?.logs.length || 0} entries</span>
            </div>
            {selectedJob?.logs && selectedJob.logs.length > 0 ? (
              <div className="log-list">
                {selectedJob.logs.slice().reverse().map((log) => (
                  <div className="log-item" key={log.id}>
                    <div className="log-head">
                      <p className="log-message">{log.message}</p>
                      <StatusPill value={log.level} />
                    </div>
                    <p className="log-detail">
                      {formatDateTime(log.at)} {log.data ? `- ${JSON.stringify(log.data)}` : ""}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">Logs will appear as the job executes.</div>
            )}
          </section>

          <section className="panel panel-pad panel-strong">
            <div className="section-title">
              <h2>Recent jobs</h2>
              <span className="section-subtitle">{dashboard?.recentJobs.length || 0} visible</span>
            </div>
            <div className="summary-list">
              {(dashboard?.recentJobs || []).map((job) => (
                <div className="summary-item" key={job.jobId}>
                  <div className="summary-head">
                    <p className="summary-name">{job.goal.goal}</p>
                    <StatusPill value={job.status} />
                  </div>
                  <p className="summary-detail">
                    {job.goal.product} - {job.goal.mode} - {formatDateTime(job.createdAt)}
                  </p>
                </div>
              ))}
            </div>
          </section>
        </main>

        <aside className="panel panel-pad panel-stack">
          <section>
            <div className="section-title">
              <h2>Approvals</h2>
              <span className="section-subtitle">{dashboard?.approvals.pending ?? 0} pending</span>
            </div>
            {approvals.length > 0 ? (
              <div className="summary-list">
                {approvals.map((job) => (
                  <div className="summary-item" key={job.jobId}>
                    <div className="summary-head">
                      <p className="summary-name">{job.goal.goal}</p>
                      <StatusPill value="waiting_approval" />
                    </div>
                    <p className="summary-detail">
                      {job.goal.product} requires approval on {job.steps.find((step) => step.status === "waiting_approval")?.id || "a step"}.
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">No approvals are waiting right now.</div>
            )}
          </section>

          <section>
            <div className="section-title">
              <h2>Memory</h2>
              <span className="section-subtitle">{memory.length} entries</span>
            </div>
            {memory.length > 0 ? (
              <div className="memory-list">
                {memory.slice(0, 8).map((entry) => (
                  <div className="memory-item" key={entry.id}>
                    <div className="memory-head">
                      <p className="memory-key">{entry.key}</p>
                      <StatusPill value={entry.category} />
                    </div>
                    <p className="memory-detail">
                      {entry.product} - confidence {formatPercent(entry.confidence)} - {formatDateTime(entry.updatedAt)}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">No reusable patterns have been stored yet.</div>
            )}
          </section>

          <section>
            <div className="section-title">
              <h2>Failure watch</h2>
              <span className="section-subtitle">{failures.length} failed</span>
            </div>
            {failures.length > 0 ? (
              <div className="summary-list">
                {failures.slice(0, 5).map((job) => (
                  <div className="summary-item" key={job.jobId}>
                    <div className="summary-head">
                      <p className="summary-name">{job.goal.goal}</p>
                      <StatusPill value="failed" />
                    </div>
                    <p className="summary-detail">{job.error || "Workflow failed without an error message."}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">No failed jobs are currently on watch.</div>
            )}
          </section>
        </aside>
      </div>
    </div>
  );
}

function MetricCard({
  label,
  value,
  note,
}: {
  readonly label: string;
  readonly value: number;
  readonly note: string;
}) {
  return (
    <div className="metric-card">
      <div className="metric-label">{label}</div>
      <div className="metric-value">{value}</div>
      <div className="metric-note">{note}</div>
    </div>
  );
}

function HealthLine({
  label,
  value,
}: {
  readonly label: string;
  readonly value: string;
}) {
  return (
    <div className="meta-row">
      <span className="meta-label">{label}</span>
      <span className="meta-value">{value}</span>
    </div>
  );
}

function StatusPill({ value }: { readonly value: string }) {
  return <span className={`pill ${statusTone(value)}`}>{value}</span>;
}
