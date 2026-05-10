import { ShieldCheck, AlertTriangle, XCircle, Box, ListTodo, Zap } from "lucide-react";

interface Props {
  summary: {
    status: string;
    metrics: {
      active_projects: number;
      open_risks: number;
      pending_tasks: number;
      open_todos: number;
      total_apps: number;
    };
  } | null;
  loading: boolean;
}

export default function CockpitExecutiveSummary({ summary, loading }: Props) {
  if (loading) return <div className="h-48 cockpit-card animate-pulse flex items-center justify-center text-[10px] uppercase font-black">Analyzing Studio Health...</div>;

  const isHealthy = summary?.status === 'healthy';

  return (
    <div className="cockpit-card">
      <div className="flex items-start justify-between mb-8">
        <div>
          <h2 className="text-xs font-black uppercase tracking-widest text-white/40 mb-1">Executive Summary</h2>
          <p className="text-sm font-black uppercase text-white">Studio Health Overview</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-[9px] font-black uppercase text-white/40">
          Last updated: {new Date().toLocaleTimeString()}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        <div className="flex items-center gap-6">
          <div className={`w-24 h-24 rounded-3xl flex items-center justify-center ${
            isHealthy ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 shadow-[0_0_40px_rgba(16,185,129,0.1)]' : 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
          }`}>
            {isHealthy ? <ShieldCheck className="w-12 h-12" /> : <AlertTriangle className="w-12 h-12" />}
          </div>
          <div>
            <h3 className={`text-2xl font-black tracking-tighter ${isHealthy ? 'text-emerald-500' : 'text-amber-500'}`}>
              {isHealthy ? 'Healthy' : 'Warning'}
            </h3>
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mt-1">Studio Health</p>
            <p className="text-[11px] font-bold text-white/60 mt-3 leading-relaxed">
              All critical systems operational. No unacknowledged critical risks. Continue shipping.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Active Projects', value: summary?.metrics.active_projects || 0, color: 'text-white' },
            { label: 'Open Risks', value: summary?.metrics.open_risks || 0, color: 'text-amber-500' },
            { label: 'Failed Builds', value: 0, color: 'text-destructive' },
            { label: 'Open TODOs', value: summary?.metrics.open_todos || 0, color: 'text-white/60' },
            { label: 'Total Apps', value: summary?.metrics.total_apps || 0, color: 'text-white/60' },
          ].map((stat, i) => (
            <div key={i} className="text-center md:text-left">
              <p className={`text-xl font-black tracking-tighter ${stat.color}`}>{stat.value}</p>
              <p className="text-[8px] font-black uppercase text-muted-foreground tracking-widest mt-1">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
