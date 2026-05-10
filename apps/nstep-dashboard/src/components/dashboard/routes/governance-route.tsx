import { GovernanceViewModel } from "@/lib/dashboard/view-models/governance-view-model";
import type { DashboardSession } from "@/lib/auth-types";

export function GovernanceRoute({
  view,
  session,
}: {
  readonly view: GovernanceViewModel;
  readonly session?: DashboardSession | null;
}) {
  return (
    <div className="nsos-stack">
      <div className="nsos-layout-grid">
        <div className="nsos-stack">
          <section className="panel panel-strong panel-pad">
            <div className="section-title">
              <h3>Integrity Score</h3>
              <div className="pill-row">
                <span className="pill status-ok">{view.integrity.score}%</span>
              </div>
            </div>
            <p className="job-row-copy mt-12">
              Overall operational integrity based on {view.integrity.stats.total} tracked objects and {view.integrity.stats.protected} protected configuration files.
            </p>
          </section>

          <section className="panel panel-pad">
            <div className="section-title">
              <h3>Protected File Status</h3>
              <span className={`pill ${view.integrity.stats.drifted === 0 ? 'status-ok' : 'status-danger'}`}>
                {view.integrity.stats.drifted === 0 ? 'Intact' : 'Drift Detected'}
              </span>
            </div>
            <div className="summary-list mt-16">
              {view.files.map((file) => (
                <div key={file.path} className="summary-item">
                  <div className="summary-head">
                    <div>
                      <p className="summary-name">{file.path}</p>
                      <p className="label-tiny">Last verified: {file.lastModified}</p>
                    </div>
                    <span className={`pill ${file.isDrifted ? 'status-danger' : 'status-ok'}`}>
                      {file.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className="nsos-stack">
          <section className="panel panel-pad">
            <div className="section-title">
              <h3>Governance Findings</h3>
            </div>
            <div className="log-list">
              {view.integrity.findings.map((finding) => (
                <div key={finding.id} className="log-item">
                  <div className="log-head">
                    <div>
                      <p className={`log-message nsos-tone-${finding.status === 'fail' ? 'danger' : 'warning'}`}>
                        {finding.title}
                      </p>
                      <p className="label-tiny">Status: {finding.status.toUpperCase()} • Severity: {finding.severity.toUpperCase()}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="panel panel-pad">
            <div className="section-title">
              <h3>Policy Snapshot</h3>
            </div>
            <div className="nsos-shell-stat-grid">
              <div className="nsos-shell-stat">
                <span className="nsos-shell-stat-label">Active Risks</span>
                <span className="nsos-shell-stat-value">{view.integrity.findings.length}</span>
              </div>
              <div className="nsos-shell-stat">
                <span className="nsos-shell-stat-label">Violations</span>
                <span className="nsos-shell-stat-value">0</span>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

