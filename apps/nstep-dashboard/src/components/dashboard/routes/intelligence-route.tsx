import { IntelligenceViewModel } from "@/lib/dashboard/view-models/intelligence-view-model";

export function IntelligenceRoute({
  view
}: {
  readonly view: IntelligenceViewModel;
}) {

  return (
    <div className="nsos-stack">
      <div className="nsos-layout-grid">
        <div className="nsos-stack nsos-grid-span-2">
          {/* Relationship Graph Summary */}
          <section className="panel panel-pad">
            <div className="section-title">
              <h3>Studio Knowledge Graph</h3>
              <span className="pill status-info">{view.graph.nodeCount} Nodes • {view.graph.edgeCount} Edges</span>
            </div>
            
            <div className="nsos-card-grid mt-16">
              <div className="card-mini bg-white/5 p-16 nsos-br-16">
                <p className="label-tiny opacity-60">Critical Dependencies</p>
                <div className="nsos-stack-tiny mt-8">
                  {view.graph.criticalEdges.map(e => (
                    <div key={e.id} className="flex items-center justify-between text-xs font-bold">
                      <span>{e.sourceLabel}</span>
                      <span className="opacity-40">→</span>
                      <span>{e.targetLabel}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="card-mini bg-white/5 p-16 nsos-br-16">
                <p className="label-tiny opacity-60">System Impact Chains</p>
                <div className="nsos-stack-tiny mt-8">
                  {view.forecasts.slice(0, 2).map(f => (
                    <div key={f.appId} className="flex items-center justify-between text-xs font-bold">
                      <span>{f.appLabel}</span>
                      <span className={`pill label-tiny ${f.score < 70 ? 'status-danger' : 'status-warn'}`}>
                        {f.score < 70 ? 'CRITICAL' : 'RECOVERY'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-24 p-16 bg-background/40 border border-border nsos-br-16">
              <p className="label-tiny opacity-60 mb-12">Relationship Map visualization (Schematic)</p>
              <div className="flex flex-wrap gap-4">
                {view.graph.nodes.map(node => (
                  <div key={node.id} className="p-8 bg-white/5 nsos-br-12 border border-white/5 text-[10px] font-bold uppercase">
                    {node.label}
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Operational Pattern Analysis */}
          <section className="panel panel-pad">
            <div className="section-title">
              <h3>Pattern Analysis Engine</h3>
              <span className="pill status-accent">AI Insights</span>
            </div>
            
            <div className="log-list mt-16">
              {view.patterns.map(pat => (
                <div key={pat.id} className="log-item nsos-p-16 nsos-br-16">
                  <div className="log-head nsos-items-start">
                    <div className="nsos-stack-tiny flex-1">
                      <div className="flex items-center gap-2">
                        <span className={`pill label-tiny status-${pat.severityTone}`}>
                          {pat.type}
                        </span>
                        <span className="label-tiny">{pat.confidenceLabel}</span>
                      </div>
                      <p className="text-sm font-bold mt-4">{pat.title}</p>
                      <p className="label-tiny opacity-60">{pat.description}</p>
                    </div>
                    <div className="nsos-stack-tiny text-right">
                      <p className="text-xs font-bold">{pat.occurrenceCount} Instances</p>
                      <p className="label-tiny opacity-40">Last: {pat.lastDetected}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className="nsos-stack">
          {/* Shared Risk Indicators */}
          <section className="panel panel-pad">
            <div className="section-title">
              <h3>Shared Risk Indicators</h3>
            </div>
            <div className="nsos-stack-small">
              {view.risks.map((risk, i) => (
                <div key={i} className="p-12 bg-destructive/10 border border-destructive/20 nsos-br-16">
                  <p className="label-tiny text-danger font-bold">{risk.appLabel}</p>
                  <p className="text-xs font-bold">{risk.riskMessage}</p>
                </div>
              ))}
              {view.risks.length === 0 && <p className="label-tiny opacity-60 p-12">No high-pressure risks detected.</p>}
            </div>
          </section>

          {/* Stability Forecast */}
          <section className="panel panel-pad">
            <div className="section-title">
              <h3>Operational Forecast</h3>
            </div>
            <div className="nsos-stack-small">
              {view.forecasts.map(f => (
                <div key={f.appId} className="flex items-center justify-between p-12 bg-white/5 nsos-br-16">
                  <div>
                    <p className="text-xs font-bold uppercase">{f.appLabel}</p>
                    <p className="label-tiny opacity-60">Stability: {f.score}%</p>
                  </div>
                  <span className={`text-lg ${f.trend === 'up' ? 'nsos-tone-ok' : f.trend === 'down' ? 'nsos-tone-danger' : 'opacity-40'}`}>
                    {f.trend === 'up' ? '↑' : f.trend === 'down' ? '↓' : '→'}
                  </span>
                </div>
              ))}
            </div>
          </section>

          {/* Efficiency Metrics */}
          <section className="panel panel-pad">
            <div className="section-title">
              <h3>Studio Efficiency</h3>
            </div>
            <div className="nsos-shell-stat-grid">
              <div className="nsos-shell-stat">
                <span className="nsos-shell-stat-label">Recovery Success</span>
                <span className="nsos-shell-stat-value text-emerald-500">{view.efficiency.recoveryRate}</span>
              </div>
              <div className="nsos-shell-stat">
                <span className="nsos-shell-stat-label">Workflow Avg</span>
                <span className="nsos-shell-stat-value">{view.efficiency.avgWorkflowTime}</span>
              </div>
            </div>
            <div className="mt-12 p-8 bg-white/5 nsos-br-12">
              <p className="label-tiny opacity-40 uppercase font-black mb-4">Top Performance</p>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold">{view.efficiency.topPerformer}</span>
                <span className="pill label-tiny status-ok">99.9% UPTIME</span>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
