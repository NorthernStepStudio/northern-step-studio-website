import { formatDateTime } from "@/lib/dashboard/format";
import type { MemoryViewModel } from "@/lib/dashboard/view-models/memory-view-model";

export function MemoryRoute({
  memories
}: {
  readonly memories: MemoryViewModel["entries"];
}) {
  return (
    <div className="nsos-stack">
      <div className="nsos-layout-grid">
        <div className="nsos-stack nsos-grid-span-2">
          <section className="panel panel-pad">
            <div className="section-title">
              <h3>Operational Memory</h3>
              <span className="label-tiny">Persistent Context</span>
            </div>
            
            <div className="log-list mt-20">
              {memories.map((mem) => (
                <div key={mem.id} className="log-item job-row-hoverable nsos-p-16 nsos-br-16">
                  <div className="log-head nsos-items-start">
                    <div className="nsos-stack-small">
                      <div className="flex items-center gap-2">
                        <span className={`pill label-tiny status-${mem.category === 'decision' ? 'accent' : 'info'}`}>
                          {mem.category.toUpperCase()}
                        </span>
                        <span className="label-tiny">{formatDateTime(mem.timestamp)}</span>
                      </div>
                      <p className="text-sm font-bold">{mem.title}</p>
                      <p className="label-tiny opacity-80">{mem.summary}</p>
                      <div className="template-strip mt-8">
                        {mem.tags.map((tag: string) => (
                          <span key={tag} className="pill label-tiny bg-white/5">#{tag}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className="nsos-stack">
          <section className="panel panel-pad">
            <div className="section-title">
              <h3>Memory Statistics</h3>
            </div>
            <div className="nsos-shell-stat-grid">
              <div className="nsos-shell-stat">
                <span className="nsos-shell-stat-label">Total Entries</span>
                <span className="nsos-shell-stat-value">{memories.length}</span>
              </div>
              <div className="nsos-shell-stat">
                <span className="nsos-shell-stat-label">Decisions</span>
                <span className="nsos-shell-stat-value">{memories.filter((memory) => memory.category === "decision").length}</span>
              </div>
            </div>
          </section>
          
          <section className="panel panel-pad">
            <div className="section-title">
              <h3>Continuity Context</h3>
            </div>
            <p className="label-tiny opacity-60">StudioOS maintains long-term persistence of operational findings to prevent recurring risks and assist Matterhorn in multi-step reasoning.</p>
          </section>
        </div>
      </div>
    </div>
  );
}
