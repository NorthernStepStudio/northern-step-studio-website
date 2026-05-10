import { TimelineViewModel } from "@/lib/dashboard/view-models/timeline-view-model";

export function TimelineRoute({
  view
}: {
  readonly view: TimelineViewModel;
}) {
  return (
    <div className="nsos-stack">
      <section className="panel panel-pad">
        <div className="section-title">
          <h3>Unified Operational Timeline</h3>
          <span className="label-tiny">Real-time Coordination</span>
        </div>
        
        <div className="log-list mt-20">
          {view.events.map((event, i) => (
            <div key={event.id} className={`log-item nsos-pl-24 nsos-ml-12 nsos-pb-24 nsos-relative ${i === view.events.length - 1 ? '' : 'nsos-timeline-border'}`}>
              <div className={`nsos-timeline-dot nsos-bg-${event.severityTone}`} />
              
              <div className="log-head">
                <div className="nsos-stack-tiny">
                  <div className="flex items-center gap-2">
                    <p className="text-[10px] font-black uppercase tracking-widest">{event.type}</p>
                    <span className="dot-divider">•</span>
                    <p className="label-tiny">{event.at}</p>
                  </div>
                  <p className="text-sm font-bold">{event.title}</p>
                  <p className="label-tiny mt-4 nsos-opacity-80">{event.message}</p>
                  <span className="pill label-tiny mt-8 nsos-w-fit">{event.appLabel}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
