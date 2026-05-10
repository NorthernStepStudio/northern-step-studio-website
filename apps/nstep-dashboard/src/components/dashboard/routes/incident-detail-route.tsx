import Link from "next/link";
import { IncidentDetailViewModel } from "@/lib/dashboard/view-models/incident-detail-view-model";

export function IncidentDetailRoute({
  view
}: {
  readonly view: IncidentDetailViewModel;
}) {
  const { incident } = view;
  
  return (
    <div className="page-shell">
      <div className="hero">
        <div className="hero-top">
          <div>
            <div className="eyebrow">Incident Detail</div>
            <h1 className="hero-title">{incident.title}</h1>
          </div>
          <div className={`pill status-${incident.severityTone}`}>
            {incident.severity}
          </div>
        </div>
        <p className="hero-copy">Detailed analysis and timeline for incident {incident.id}.</p>
      </div>

      <div className="dashboard-grid">
        <div className="panel panel-strong panel-pad panel-stack">
          <div className="section-title">
            <h3>Investigation Status</h3>
            <span className={`pill status-${incident.statusTone}`}>{incident.status}</span>
          </div>
          <div className="meta-row">
            <span className="meta-label">Affected Apps</span>
            <span className="meta-value">{incident.affectedApps}</span>
          </div>
          <div className="meta-row">
            <span className="meta-label">Created At</span>
            <span className="meta-value">{incident.at}</span>
          </div>
        </div>

        <div className="panel panel-pad panel-stack nsos-grid-span-2">
          <div className="section-title">
            <h3>Operational Timeline</h3>
          </div>
          <div className="log-list">
            {incident.timeline.map((ev, i) => (
              <div key={i} className="log-item">
                <div className="log-head">
                  <div className="nsos-stack-tiny">
                    <p className="log-message font-bold">{ev.title}</p>
                    <p className="label-tiny opacity-60">{ev.message}</p>
                  </div>
                  <span className="label-tiny">{ev.at}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="panel panel-pad panel-stack">
          <div className="section-title">
            <h3>Recommended Actions</h3>
          </div>
          <div className="nsos-stack-tiny">
            {incident.recommendations.map((act, i) => (
              <div key={i} className="p-12 bg-white/5 nsos-br-16 border border-white/5">
                <p className="text-xs font-bold">Action {i + 1}</p>
                <p className="text-[10px] opacity-60 mt-4 leading-relaxed">{act}</p>
              </div>
            ))}
          </div>
          <div className="mt-12 flex flex-col gap-2">
            <button className="button button-primary">Escalate to Executive</button>
            <button className="button button-secondary">Acknowledge</button>
            <Link href="/dashboard/incidents" className="button button-secondary">Back to Incidents</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
