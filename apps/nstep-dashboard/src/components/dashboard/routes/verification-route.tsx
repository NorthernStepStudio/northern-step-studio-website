import { VerificationViewModel } from "@/lib/dashboard/view-models/verification-view-model";
import type { DashboardSession } from "@/lib/auth-types";

export function VerificationRoute({
  view,
  session,
}: {
  readonly view: VerificationViewModel;
  readonly session?: DashboardSession | null;
}) {
  return (
    <div className="nsos-stack">
      <div className="nsos-card-grid">
        {view.results.map((result) => (
          <section key={result.id} className="panel panel-pad">
            <div className="section-title">
              <h3>{result.appLabel}</h3>
              <span className={`pill status-${result.statusTone}`}>
                {result.status}
              </span>
            </div>
            
            <div className="log-list mt-16">
              {result.checks.map((check, i) => (
                <div key={i} className="log-item">
                  <div className="log-head">
                    <div>
                      <p className={`log-message nsos-tone-${check.statusTone}`}>
                        {check.label}
                      </p>
                    </div>
                    <span className={`pill label-tiny status-${check.statusTone}`}>{check.status}</span>
                  </div>
                </div>
              ))}
              <div className="mt-12 pt-12 border-t border-border">
                 <p className="label-tiny opacity-40">Verified at {result.at}</p>
              </div>
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
