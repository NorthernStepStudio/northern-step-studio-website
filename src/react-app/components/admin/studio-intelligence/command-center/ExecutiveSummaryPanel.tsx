import { Activity, Zap, ArrowRight } from "lucide-react";

interface Props {
  summary: {
    studioHealth: string;
    launchReadiness: {
      closestProject: string | null;
      blockerCount: number;
    };
    topRisks: unknown[];
    recentFailures: unknown[];
    suggestedActions: string[];
  } | null;
  loading: boolean;
}

export default function ExecutiveSummaryPanel({ summary, loading }: Props) {
  if (loading || !summary) return <div className="h-48 flex items-center justify-center animate-pulse text-[10px] uppercase font-black text-muted-foreground">Synthesizing Command Center...</div>;

  const healthColors = {
    healthy: 'text-emerald-500 border-emerald-500/20 bg-emerald-500/5',
    warning: 'text-orange-500 border-orange-500/20 bg-orange-500/5',
    critical: 'text-destructive border-destructive/20 bg-destructive/5'
  };

  return (
    <div className="space-y-4">
      <div className={`p-6 rounded-[2.5rem] border-2 ${healthColors[summary.studioHealth as keyof typeof healthColors]} transition-all`}>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-background/80 shadow-sm">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xs font-black uppercase tracking-[0.2em]">Studio Health</h3>
              <p className="text-[10px] font-bold uppercase opacity-60">Real-time Operational State</p>
            </div>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-background/80 border border-current shadow-sm">
            <span className="w-2 h-2 rounded-full bg-current animate-pulse" />
            <span className="text-xs font-black uppercase tracking-widest">{summary.studioHealth}</span>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-3xl bg-background/40 border border-current/10">
            <p className="text-[9px] font-black uppercase opacity-40 mb-1">Launch Readiness</p>
            <p className="text-lg font-black tracking-tighter">{summary.launchReadiness.closestProject || 'None'}</p>
          </div>
          <div className="p-4 rounded-3xl bg-background/40 border border-current/10">
            <p className="text-[9px] font-black uppercase opacity-40 mb-1">Open Risks</p>
            <p className="text-lg font-black tracking-tighter">{summary.topRisks.length}</p>
          </div>
          <div className="p-4 rounded-3xl bg-background/40 border border-current/10">
            <p className="text-[9px] font-black uppercase opacity-40 mb-1">Blockers</p>
            <p className="text-lg font-black tracking-tighter">{summary.launchReadiness.blockerCount}</p>
          </div>
          <div className="p-4 rounded-3xl bg-background/40 border border-current/10">
            <p className="text-[9px] font-black uppercase opacity-40 mb-1">Recent Failures</p>
            <p className="text-lg font-black tracking-tighter">{summary.recentFailures.length}</p>
          </div>
        </div>
      </div>

      <div className="p-5 rounded-3xl bg-background border border-border/50 shadow-xl">
        <h4 className="text-[10px] font-black uppercase tracking-widest mb-4 flex items-center gap-2">
          <Zap className="w-3 h-3 text-accent" />
          Synox Directives
        </h4>
        <div className="space-y-3">
          {summary.suggestedActions.map((action: string, i: number) => (
            <div key={i} className="flex items-center justify-between p-3 rounded-2xl bg-muted/20 border border-border/50 group hover:border-accent/40 transition-all cursor-pointer">
              <div className="flex items-center gap-3">
                <div className="w-1 h-8 rounded-full bg-accent/20 group-hover:bg-accent transition-colors" />
                <span className="text-[11px] font-bold">{action}</span>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-muted-foreground group-hover:text-accent transition-all" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
