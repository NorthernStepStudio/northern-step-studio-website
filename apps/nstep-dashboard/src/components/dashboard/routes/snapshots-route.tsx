import { DashboardSession } from "@/lib/auth-types";
import { formatDateTime } from "@/lib/dashboard/format";

export function SnapshotsRoute({
  snapshots,
  session,
}: {
  readonly snapshots: any[];
  readonly session?: DashboardSession | null;
}) {
  return (
    <div className="nsos-stack">
      <section className="nsos-stack" aria-label="Operational Snapshots">
        <div className="section-title">
          <h3>Memory Snapshots</h3>
          <span className="section-subtitle">{snapshots.length} Versions Retained</span>
        </div>
        <div className="nsos-card-grid">
          {snapshots.map((snap) => (
            <article key={snap.id} className="panel panel-pad job-row">
              <div className="job-row-top">
                <div className="job-row-identity">
                  <div className="job-row-icon-box">??</div>
                  <div>
                    <h4 className="job-row-title">{snap.id}</h4>
                    <span className="label-tiny">{snap.origin}</span>
                  </div>
                </div>
                <div className={`pill ${snap.status === 'verified' ? 'status-ok' : 'status-warn'}`}>
                  {snap.status.toUpperCase()}
                </div>
              </div>
              <div className="job-row-meta mt-16">
                <span>Size: {snap.size}</span>
                <span className="dot-divider">•</span>
                <span>Created: {formatDateTime(snap.at)}</span>
              </div>
              <div className="job-row-actions mt-12">
                <button className="button button-secondary">Restore Context</button>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}

