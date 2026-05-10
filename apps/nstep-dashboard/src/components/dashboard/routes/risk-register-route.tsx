import { RiskRegisterViewModel } from "@/lib/dashboard/view-models/risk-register-view-model";
import type { DashboardSession } from "@/lib/auth-types";

export function RiskRegisterRoute({
  view,
  session,
}: {
  readonly view: RiskRegisterViewModel;
  readonly session?: DashboardSession | null;
}) {
  return (
    <div className="nsos-stack">
      <section className="nsos-stack" aria-label="Active Risks">
        <div className="section-title">
          <h3>Active Operational Risks</h3>
          <span className="section-subtitle">{view.risks.length} Items Tracked</span>
        </div>
        <div className="nsos-card-grid-single">
          {view.risks.map((risk) => (
            <article key={risk.id} className="panel panel-pad job-row">
              <div className="job-row-top">
                <div className="job-row-identity">
                  <div className={`job-row-icon-box nsos-tone-${risk.severityTone}`}>
                    ⚠️
                  </div>
                  <div>
                    <h4 className="job-row-title">{risk.title}</h4>
                    <span className="label-tiny">{risk.severity}</span>
                  </div>
                </div>
                <div className="pill status-danger">
                  {risk.status}
                </div>
              </div>
              <div className="job-row-copy mt-12">
                <p>{risk.recommendation}</p>
              </div>
              <div className="job-row-meta mt-16">
                <span>Affected: {risk.affectedApps}</span>
                <span className="dot-divider">•</span>
                <span>Detected: {risk.detectedAt}</span>
              </div>
            </article>
          ))}
        </div>
      </section>

      {view.risks.length === 0 && (
        <div className="panel panel-pad nsos-empty-state">
          <p>No active risks detected. System integrity is high.</p>
        </div>
      )}
    </div>
  );
}
