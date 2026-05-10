import { IncidentViewModel } from "@/lib/dashboard/view-models/incidents-view-model";

export function IncidentsRoute({
  view
}: {
  readonly view: IncidentViewModel[];
}) {
  return (
    <div className="nsos-stack">
      <div className="nsos-layout-grid">
        <div className="nsos-stack nsos-grid-span-2">
          <section className="panel panel-pad">
            <div className="section-title">
              <h3>Operational Incidents</h3>
              <span className="pill status-warn">{view.length} Active</span>
            </div>
            
            <div className="log-list mt-16">
              {view.map((inc) => (
                <div key={inc.id} className="log-item job-row-hoverable nsos-p-16 nsos-br-16">
                  <div className="log-head">
                    <div className="nsos-stack-tiny">
                      <p className={`text-xs font-black uppercase nsos-tone-${inc.isHighRisk ? 'danger' : 'warning'}`}>
                        {inc.id} • {inc.title}
                      </p>
                      <div className="flex items-center gap-3">
                        <span className="pill label-tiny bg-white/5">{inc.status}</span>
                        <span className="label-tiny">{inc.affectedApps}</span>
                        <span className="dot-divider">•</span>
                        <span className="label-tiny">Detected {inc.detectedAt}</span>
                      </div>
                    </div>
                    <button className="button button-secondary label-tiny">Investigate</button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className="nsos-stack">
          <section className="panel panel-pad">
            <div className="section-title">
              <h3>Escalation Queue</h3>
            </div>
            <div className="summary-list mt-12">
              <div className="summary-item">
                <div className="summary-head">
                  <p className="summary-name">Stale Build Failures</p>
                  <span className="pill status-danger">HIGH</span>
                </div>
                <p className="label-tiny mt-4">NeuroMoves #4052 has been OPEN for 5 hours without mitigation.</p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

