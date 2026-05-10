import { GroundingSummary } from "@/shared/synox/memory";
import { AlertTriangle, ShieldCheck, Database } from "lucide-react";

interface Props {
  summary: GroundingSummary | null;
  loading: boolean;
}

export default function GroundingSummaryPreview({ summary, loading }: Props) {
  if (loading || !summary) return <div className="h-32 flex items-center justify-center animate-pulse text-[10px] uppercase font-black text-muted-foreground">Synthesizing Grounding Summary...</div>;

  return (
    <div className="space-y-4 p-5 rounded-2xl bg-accent/5 border border-accent/10">
      <div className="flex items-center gap-2 mb-2">
        <Database className="w-4 h-4 text-accent" />
        <h3 className="text-xs font-black uppercase tracking-widest">Synox Grounding State</h3>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="p-2.5 rounded-xl bg-background/40 border border-border/50">
          <p className="text-[9px] font-bold uppercase text-muted-foreground/60 mb-0.5">Engine</p>
          <p className="text-[11px] font-black uppercase text-accent">{summary.productNaming.engine}</p>
        </div>
        <div className="p-2.5 rounded-xl bg-background/40 border border-border/50">
          <p className="text-[9px] font-bold uppercase text-muted-foreground/60 mb-0.5">Operator</p>
          <p className="text-[11px] font-black uppercase text-accent">{summary.productNaming.agent}</p>
        </div>
        <div className="p-2.5 rounded-xl bg-background/40 border border-border/50">
          <p className="text-[9px] font-bold uppercase text-muted-foreground/60 mb-0.5">Active Projects</p>
          <p className="text-[11px] font-black uppercase">{summary.activeProjects}</p>
        </div>
        <div className="p-2.5 rounded-xl bg-background/40 border border-border/50">
          <p className="text-[9px] font-bold uppercase text-muted-foreground/60 mb-0.5">Recent Decisions</p>
          <p className="text-[11px] font-black uppercase">{summary.recentDecisions}</p>
        </div>
      </div>

      {summary.warnings.length > 0 && (
        <div className="space-y-2">
          {summary.warnings.map((w, i) => (
            <div key={i} className="flex items-center gap-2 px-3 py-2 bg-destructive/5 border border-destructive/10 rounded-xl">
              <AlertTriangle className="w-3.5 h-3.5 text-destructive shrink-0" />
              <p className="text-[10px] font-medium text-destructive/80 leading-none">{w}</p>
            </div>
          ))}
        </div>
      )}

      <div className="pt-3 border-t border-border/20 flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-[9px] font-black uppercase text-muted-foreground/60">
          <ShieldCheck className="w-3 h-3 text-emerald-500" />
          Grounded Context Integrity: High
        </div>
        <button className="text-[9px] font-black uppercase text-accent hover:underline">View Mapping</button>
      </div>
    </div>
  );
}
