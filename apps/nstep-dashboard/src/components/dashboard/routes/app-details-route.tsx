import Link from "next/link";
import { SingleAppViewModel } from "@/lib/dashboard/view-models/apps-view-model";

export function AppDetailsRoute({
  view
}: {
  readonly view: SingleAppViewModel;
}) {
  return (
    <div className="page-shell">
      <div className="hero">
        <div className="hero-top">
          <div>
            <div className="eyebrow">App Detail</div>
            <h1 className="hero-title">{view.app.displayName}</h1>
          </div>
          <div className="pill status-info">Service</div>
        </div>
        <p className="hero-copy">Detailed status and operational metrics for {view.app.displayName}.</p>
      </div>

      <div className="dashboard-grid">
        <div className="panel panel-strong panel-pad panel-stack">
          <div className="section-title">
            <h3>Status</h3>
          </div>
          <div className="meta-row">
            <span className="meta-label">Availability</span>
            <span className={`pill status-${view.app.statusTone}`}>
              {view.app.status}
            </span>
          </div>
          <div className="meta-row">
            <span className="meta-label">Details</span>
            <span className="meta-value text-xs">{view.app.healthDetails}</span>
          </div>
          <div className="meta-row">
            <span className="meta-label">Latency</span>
            <span className="meta-value">{view.metrics.latency}</span>
          </div>
        </div>

        <div className="panel panel-pad panel-stack">
          <div className="section-title">
            <h3>Operational Timeline</h3>
          </div>
          <div className="log-list">
            {view.timeline.length > 0 ? (
              view.timeline.map(ev => (
                <div key={ev.id} className="log-item">
                  <div className="log-head">
                    <p className={`log-message nsos-tone-${ev.severityTone}`}>
                      {ev.title}
                    </p>
                    <span className="label-tiny">{ev.at}</span>
                  </div>
                </div>
              ))
            ) : (
              <p className="label-tiny opacity-60">No recent activity events recorded.</p>
            )}
          </div>
        </div>

        <div className="panel panel-pad panel-stack">
          <div className="section-title">
            <h3>Intelligence Context</h3>
          </div>
          <div className="nsos-stack-tiny">
            <p className="label-tiny opacity-60 uppercase font-black mb-4">Risk Level</p>
            <div className="flex items-center gap-4">
              <span className={`text-2xl font-black ${view.intelligence.riskScore > 50 ? 'nsos-tone-danger' : 'nsos-tone-ok'}`}>
                {view.intelligence.riskScore}%
              </span>
              <p className="label-tiny">{view.intelligence.riskMessage}</p>
            </div>
            
            <p className="label-tiny opacity-60 uppercase font-black mt-12 mb-4">Patterns</p>
            {view.intelligence.patterns.map((p, i) => (
              <div key={i} className="flex items-center justify-between p-8 bg-white/5 nsos-br-12">
                <span className="text-xs font-bold">{p.title}</span>
                <span className="pill label-tiny status-accent">{p.confidence}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="panel panel-pad panel-stack">
          <div className="section-title">
            <h3>Dependencies</h3>
          </div>
          <div className="nsos-stack-tiny">
            {view.dependencies.map(d => (
              <div key={d.id} className="flex items-center justify-between p-8 bg-white/5 nsos-br-12">
                <span className="text-xs font-bold">{d.displayName}</span>
                <span className="pill label-tiny status-info">UPSTREAM</span>
              </div>
            ))}
          </div>
        </div>

        <div className="panel panel-pad panel-stack">
          <div className="section-title">
            <h3>Actions</h3>
          </div>
          <button className="button button-primary">Trigger Build</button>
          <button className="button button-secondary">Run Health Check</button>
          <Link href="/dashboard" className="button button-secondary">Back to Overview</Link>
        </div>
      </div>
    </div>
  );
}
