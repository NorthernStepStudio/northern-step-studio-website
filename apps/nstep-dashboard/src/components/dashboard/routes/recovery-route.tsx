import { RecoveryViewModel } from "@/lib/dashboard/view-models/recovery-view-model";

export function RecoveryRoute({
  view
}: {
  readonly view: RecoveryViewModel;
}) {
  return (
    <div className="nsos-stack">
      <div className="nsos-layout-grid">
        <div className="nsos-stack nsos-grid-span-2">
          <section className="panel panel-pad">
            <div className="section-title">
              <h3>Rollback Readiness Analysis</h3>
              <span className="pill status-ok">Stable States Found</span>
            </div>
            
            <div className="log-list mt-20">
              {view.options.map((opt) => (
                <div key={opt.id} className="log-item job-row-hoverable nsos-p-20 nsos-br-16">
                  <div className="log-head nsos-items-start">
                    <div className="nsos-stack-small flex-1">
                      <div className="flex items-center gap-2">
                        <span className="pill label-tiny status-info">RECOVERY</span>
                        <span className="label-tiny">{opt.id}</span>
                      </div>
                      <p className="text-sm font-bold">{opt.title}</p>
                      <p className="label-tiny opacity-60">{opt.description}</p>
                      
                      <div className="flex gap-4 mt-8">
                        <div className="nsos-stack-tiny">
                          <p className="label-tiny opacity-60 uppercase font-black">Risk Level</p>
                          <p className={`pill label-tiny status-${opt.riskTone}`}>
                            {opt.risk}
                          </p>
                        </div>
                        <div className="nsos-stack-tiny">
                          <p className="label-tiny opacity-60 uppercase font-black">Steps</p>
                          <p className="text-xs">{opt.steps} required</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <button className="button button-primary label-tiny">
                        Prepare Recovery
                      </button>
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
              <h3>Recovery Safety Gates</h3>
            </div>
            <div className="summary-list mt-12">
              <div className="summary-item">
                <p className="label-tiny font-bold uppercase opacity-60">1. Verification Check</p>
                <p className="text-xs mt-4">Current integrity score must be &gt; 90% before rollback attempt.</p>
              </div>
              <div className="summary-item">
                <p className="label-tiny font-bold uppercase opacity-60">2. Protected File Lock</p>
                <p className="text-xs mt-4">Protected infrastructure files must be identical to snapshot source.</p>
              </div>
              <div className="summary-item">
                <p className="label-tiny font-bold uppercase opacity-60">3. Human Authorization</p>
                <p className="text-xs mt-4">Rollback operations require physical executive approval.</p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
