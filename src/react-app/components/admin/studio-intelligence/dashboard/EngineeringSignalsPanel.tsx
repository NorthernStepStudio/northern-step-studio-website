import { XCircle, AlertTriangle, CheckCircle2 } from "lucide-react";

interface Signal {
  id: string;
  type: 'build_fail' | 'deploy_warn' | 'snapshot_ok';
  title: string;
  subtitle: string;
  time: string;
}

interface Props {
  signals: Signal[];
  loading: boolean;
}

export default function EngineeringSignalsPanel({ signals, loading }: Props) {
  if (loading) return <div className="cockpit-card animate-pulse h-full" />;

  return (
    <div className="cockpit-card h-full">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-1">Recent Engineering Signals</h3>
          <p className="text-xs font-black uppercase text-white">Latest system activity</p>
        </div>
      </div>

      <div className="space-y-6">
        {signals.map((signal) => (
          <div key={signal.id} className="flex items-start gap-4">
            <div className={`mt-1 ${
              signal.type === 'build_fail' ? 'text-destructive' : signal.type === 'deploy_warn' ? 'text-amber-500' : 'text-emerald-500'
            }`}>
              {signal.type === 'build_fail' ? <XCircle className="w-4 h-4" /> : signal.type === 'deploy_warn' ? <AlertTriangle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <p className="text-[11px] font-black uppercase text-white/90 leading-none">{signal.title}</p>
                <span className="text-[9px] font-bold text-muted-foreground/40">{signal.time}</span>
              </div>
              <p className="text-[10px] font-bold text-muted-foreground/60 mt-1 uppercase tracking-tight">{signal.subtitle}</p>
            </div>
          </div>
        ))}
      </div>

      <button className="w-full mt-8 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-[9px] font-black uppercase tracking-widest text-white/60 transition-all">
        View All Signals
      </button>
    </div>
  );
}
