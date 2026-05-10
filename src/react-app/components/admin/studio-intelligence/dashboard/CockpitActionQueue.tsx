import { Check, X, Clock } from "lucide-react";

interface Action {
  id: string;
  title: string;
  priority: string;
  reasoning: string;
  evidence: string;
  time: string;
}

interface Props {
  actions: Action[];
  loading: boolean;
}

export default function CockpitActionQueue({ actions, loading }: Props) {
  if (loading) return <div className="cockpit-card animate-pulse h-full" />;

  return (
    <div className="cockpit-card h-full">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-1">Action Queue <span className="text-accent ml-1">{actions.length}</span></h3>
          <p className="text-xs font-black uppercase text-white">AI Suggested • Requires Review</p>
        </div>
      </div>

      <div className="space-y-4">
        {actions.map((action) => (
          <div key={action.id} className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-3 group hover:border-accent/20 transition-all">
            <div className="flex items-center justify-between">
              <div className={`px-1.5 py-0.5 rounded text-[8px] font-black uppercase ${
                action.priority === 'High' ? 'bg-destructive/20 text-destructive' : 'bg-amber-500/20 text-amber-500'
              }`}>
                {action.priority}
              </div>
              <div className="flex items-center gap-1 text-[8px] font-black text-muted-foreground/40 uppercase">
                <Clock className="w-2.5 h-2.5" /> {action.time}
              </div>
            </div>
            
            <div>
              <p className="text-[11px] font-black uppercase text-white/90 leading-tight">{action.title}</p>
              <p className="text-[9px] font-bold text-muted-foreground/60 mt-1 uppercase tracking-tight">
                Evidence: {action.evidence}
              </p>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <button className="flex-1 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-500 text-[9px] font-black uppercase tracking-widest hover:bg-emerald-500/30 transition-all">
                Accept
              </button>
              <button className="px-3 py-1.5 rounded-lg bg-white/5 text-muted-foreground/60 text-[9px] font-black uppercase tracking-widest hover:bg-white/10 transition-all">
                Dismiss
              </button>
            </div>
          </div>
        ))}
      </div>

      <button className="w-full mt-6 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-[9px] font-black uppercase tracking-widest text-white/60 transition-all">
        View All Actions
      </button>
    </div>
  );
}
