import { Activity, Cpu, CheckCircle2, AlertCircle } from "lucide-react";

interface Props {
  status: {
    ok: boolean;
    provider?: string;
    model?: string;
    providerOnline?: boolean;
  } | null;
  loading: boolean;
}

export default function BridgeQualityPanel({ status, loading }: Props) {
  if (loading) return <div className="cockpit-card animate-pulse h-full" />;

  const isOnline = status?.ok && status?.providerOnline;

  return (
    <div className="cockpit-card h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-1">Bridge & Quality</h3>
          <p className="text-xs font-black uppercase text-white">System Signal Audit</p>
        </div>
        <button className="text-[9px] font-black uppercase text-accent hover:underline">View Details</button>
      </div>

      <div className="space-y-6 flex-1">
        <div className="grid grid-cols-3 gap-4">
          <div>
            <p className="text-[8px] font-black uppercase text-muted-foreground/40 mb-1">Bridge Status</p>
            <div className="flex items-center gap-1.5">
              <div className={`w-1.5 h-1.5 rounded-full ${isOnline ? 'bg-emerald-500' : 'bg-destructive'}`} />
              <span className={`text-[10px] font-black uppercase ${isOnline ? 'text-white/80' : 'text-destructive'}`}>
                {isOnline ? 'Online' : 'Offline'}
              </span>
            </div>
          </div>
          <div>
            <p className="text-[8px] font-black uppercase text-muted-foreground/40 mb-1 text-center">Provider</p>
            <p className="text-[10px] font-black uppercase text-white/80 text-center">{status?.provider || 'None'}</p>
          </div>
          <div>
            <p className="text-[8px] font-black uppercase text-muted-foreground/40 mb-1 text-right">Model</p>
            <p className="text-[10px] font-black uppercase text-white/80 text-right truncate">{status?.model || 'N/A'}</p>
          </div>
        </div>

        <div className="h-px bg-white/5" />

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-white/60 uppercase">Quality (Latest Eval)</span>
            <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Passed</span>
          </div>
          
          <div className="grid grid-cols-4 gap-2">
            {[
              { label: 'Tests Run', value: '10' },
              { label: 'Passed', value: '9', color: 'text-emerald-500' },
              { label: 'Failed', value: '1', color: 'text-destructive' },
              { label: 'Safety', value: '100%', color: 'text-emerald-500' },
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <p className="text-[8px] font-bold uppercase text-muted-foreground/40 leading-none mb-1.5">{stat.label}</p>
                <p className={`text-sm font-black tracking-tighter ${stat.color || 'text-white'}`}>{stat.value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <button className="w-full mt-6 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-[9px] font-black uppercase tracking-widest text-white/60 transition-all">
        Open Quality Panel
      </button>
    </div>
  );
}
