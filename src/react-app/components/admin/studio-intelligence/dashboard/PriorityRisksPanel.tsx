import { Rocket, AlertTriangle, ArrowUpRight } from "lucide-react";

interface Props {
  priorities: { name: string; readiness: number }[];
  risks: { title: string; level: string }[];
  loading: boolean;
}

export default function PriorityRisksPanel({ priorities, risks, loading }: Props) {
  if (loading) return <div className="grid grid-cols-1 md:grid-cols-2 gap-6"><div className="h-48 cockpit-card animate-pulse" /><div className="h-48 cockpit-card animate-pulse" /></div>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Priorities */}
      <div className="cockpit-card">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-1">Closest to Launch</h3>
            <p className="text-xs font-black uppercase text-white">Based on current signals</p>
          </div>
          <Rocket className="w-4 h-4 text-emerald-500" />
        </div>
        
        <div className="space-y-4">
          {priorities.map((item, i) => (
            <div key={i} className="space-y-2">
              <div className="flex items-center justify-between text-[10px] font-black uppercase">
                <span className="text-white/80">{i + 1}. {item.name}</span>
                <span className="text-emerald-500">{item.readiness}%</span>
              </div>
              <div className="h-1 bg-white/5 rounded-full overflow-hidden" title={`${item.readiness}% ready`}>
                <div 
                  className="h-full bg-emerald-500 transition-all duration-1000" 
                  style={{ width: `${item.readiness}%` }} 
                />
              </div>
            </div>
          ))}
        </div>
        
        <button className="w-full mt-6 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-[9px] font-black uppercase tracking-widest text-white/60 transition-all">
          View All Projects
        </button>
      </div>

      {/* Risks */}
      <div className="cockpit-card">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-1">Top Risks</h3>
            <p className="text-xs font-black uppercase text-white">Requires attention</p>
          </div>
          <AlertTriangle className="w-4 h-4 text-amber-500" />
        </div>

        <div className="space-y-3">
          {risks.map((risk, i) => (
            <div key={i} className="flex items-center justify-between p-2.5 rounded-xl bg-white/5 border border-white/5 group hover:border-amber-500/30 transition-all">
              <div>
                <p className="text-[11px] font-black uppercase text-white/90">{risk.title}</p>
                <p className="text-[8px] font-bold uppercase text-muted-foreground/60 mt-1">Studio Intelligence Signal</p>
              </div>
              <div className={`px-2 py-0.5 rounded-lg text-[8px] font-black uppercase ${
                risk.level === 'high' ? 'bg-destructive/20 text-destructive' : 'bg-amber-500/20 text-amber-500'
              }`}>
                {risk.level}
              </div>
            </div>
          ))}
        </div>

        <button className="w-full mt-6 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-[9px] font-black uppercase tracking-widest text-white/60 transition-all">
          View Risk Register
        </button>
      </div>
    </div>
  );
}
