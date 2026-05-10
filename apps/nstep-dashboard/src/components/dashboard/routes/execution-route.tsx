import { ExecutionViewModel } from "@/lib/dashboard/view-models/execution-view-model";

export function ExecutionRoute({
  view
}: {
  readonly view: ExecutionViewModel;
}) {
  return (
    <div className="nsos-stack">
      <div className="nsos-layout-grid">
        <div className="nsos-stack nsos-grid-span-2">
          <section className="panel panel-pad">
            <div className="section-title">
              <h3>Active Workflows</h3>
              <span className="pill status-info">{view.workflows.filter(w => w.status !== 'COMPLETED').length} Running</span>
            </div>
            
            <div className="log-list mt-20">
              {view.workflows.map((wf) => (
                <div key={wf.id} className="log-item job-row-hoverable nsos-p-20 nsos-br-16">
                  <div className="log-head nsos-items-start">
                    <div className="nsos-stack-small flex-1">
                      <div className="flex items-center gap-2">
                        <span className={`pill label-tiny status-${wf.statusTone}`}>
                          {wf.status}
                        </span>
                        <span className="label-tiny">{wf.id}</span>
                        <span className="dot-divider">•</span>
                        <span className="label-tiny">{wf.at}</span>
                      </div>
                      <p className="text-sm font-bold">{wf.title}</p>
                      <p className="label-tiny opacity-80">{wf.description}</p>
                      
                      <div className="flex gap-4 mt-8">
                        <div className="nsos-stack-tiny">
                          <p className="label-tiny opacity-60 uppercase font-black">Targets</p>
                          <p className="text-xs">{wf.targets}</p>
                        </div>
                        <div className="nsos-stack-tiny">
                          <p className="label-tiny opacity-60 uppercase font-black">Verification</p>
                          <div className="flex gap-2">
                            {wf.verifications.map((v: string) => (
                              <span key={v} className="text-[10px] nsos-tone-ok">? {v}</span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      {wf.status === 'WAITING_APPROVAL' && (
                        <button className="button button-primary label-tiny">Approve & Execute</button>
                      )}
                      <button className="button button-secondary label-tiny">View Logs</button>
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
              <h3>Safe Operation Catalog</h3>
            </div>
            <div className="summary-list mt-12">
              {view.catalog.map(op => (
                <div key={op.id} className="summary-item" style={{ padding: '12px' }}>
                  <div className="nsos-stack-tiny">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-bold">{op.title}</p>
                      <span className={`pill label-tiny status-${op.riskTone}`}>
                        {op.riskLevel}
                      </span>
                    </div>
                    <p className="label-tiny opacity-60 line-clamp-2">{op.description}</p>
                    <button className="button button-secondary label-tiny mt-4 w-fit">
                      Prepare Workflow
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

