import { Briefcase, Zap, AlertTriangle, ShieldCheck, ArrowUpRight } from "lucide-react";

interface BusinessSummary {
  momentum: {
    topApp: string;
    trendingUp: string[];
    staleApps: string[];
  };
  readiness: {
    launchCandidates: string[];
    blockedProjects: string[];
  };
  risks: {
    highRiskProjects: { id: string | number; title: string }[];
  };
  recommendations: string[];
}

interface Props {
  summary: BusinessSummary | null;
  loading: boolean;
}

export default function BusinessOverviewPanel({ summary, loading }: Props) {
  if (loading || !summary) return <div className="h-48 flex items-center justify-center animate-pulse text-[10px] uppercase font-black text-muted-foreground">Synthesizing Business Intelligence...</div>;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Momentum Card */}
        <div className="p-5 rounded-3xl bg-accent/5 border border-accent/10 relative overflow-hidden group">
          <Zap className="absolute -right-2 -top-2 w-16 h-16 text-accent/5 group-hover:text-accent/10 transition-all" />
          <h3 className="text-[10px] font-black uppercase tracking-widest text-accent mb-4 flex items-center gap-2">
            <Zap className="w-3 h-3" /> Momentum
          </h3>
          <p className="text-[20px] font-black tracking-tighter leading-none mb-1">{summary.momentum.topApp}</p>
          <p className="text-[9px] font-bold uppercase text-muted-foreground/60 mb-4">Current Lead Operator</p>
          
          <div className="space-y-1.5">
            {summary.momentum.trendingUp.map(app => (
              <div key={app} className="flex items-center justify-between text-[9px] font-black uppercase text-emerald-500/80">
                <span>{app}</span>
                <ArrowUpRight className="w-3 h-3" />
              </div>
            ))}
          </div>
        </div>

        {/* Risk Card */}
        <div className="p-5 rounded-3xl bg-destructive/5 border border-destructive/10 relative overflow-hidden group">
          <AlertTriangle className="absolute -right-2 -top-2 w-16 h-16 text-destructive/5 group-hover:text-destructive/10 transition-all" />
          <h3 className="text-[10px] font-black uppercase tracking-widest text-destructive mb-4 flex items-center gap-2">
            <AlertTriangle className="w-3 h-3" /> Business Risks
          </h3>
          <p className="text-[20px] font-black tracking-tighter leading-none mb-1">{summary.risks.highRiskProjects.length}</p>
          <p className="text-[9px] font-bold uppercase text-muted-foreground/60 mb-4">Critical Blockers Detected</p>
          
          <div className="space-y-1.5">
            {summary.risks.highRiskProjects.slice(0, 2).map(risk => (
              <div key={risk.id} className="text-[9px] font-bold text-destructive/70 line-clamp-1 uppercase">
                • {risk.title}
              </div>
            ))}
          </div>
        </div>

        {/* Readiness Card */}
        <div className="p-5 rounded-3xl bg-emerald-500/5 border border-emerald-500/10 relative overflow-hidden group">
          <ShieldCheck className="absolute -right-2 -top-2 w-16 h-16 text-emerald-500/5 group-hover:text-emerald-500/10 transition-all" />
          <h3 className="text-[10px] font-black uppercase tracking-widest text-emerald-500 mb-4 flex items-center gap-2">
            <Briefcase className="w-3 h-3" /> Launch Readiness
          </h3>
          <p className="text-[20px] font-black tracking-tighter leading-none mb-1">
            {summary.readiness.launchCandidates.length > 0 ? summary.readiness.launchCandidates[0] : "None"}
          </p>
          <p className="text-[9px] font-bold uppercase text-muted-foreground/60 mb-4">Next Optimal Launch</p>
          
          <div className="px-2 py-1 rounded-lg bg-emerald-500/10 text-[9px] font-black uppercase text-emerald-500 text-center">
            Verification Active
          </div>
        </div>
      </div>

      {/* Recommendations */}
      <div className="p-4 rounded-2xl bg-background/40 border border-border/50">
        <h4 className="text-[9px] font-black uppercase tracking-widest text-muted-foreground mb-3 flex items-center gap-2">
          <ShieldCheck className="w-3 h-3" /> Synox Advisory Signals
        </h4>
        <div className="space-y-2">
          {summary.recommendations.map((rec, i) => (
            <div key={i} className="flex items-start gap-2 text-[10px] font-bold leading-tight">
              <span className="text-accent mt-0.5">•</span>
              {rec}
            </div>
          ))}
          {summary.recommendations.length === 0 && (
            <p className="text-[10px] text-muted-foreground italic">No immediate advisory signals detected.</p>
          )}
        </div>
      </div>
    </div>
  );
}
