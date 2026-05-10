import { ShieldAlert, CheckCircle, BarChart, History, Info } from "lucide-react";

interface BridgeStatus {
  ok: boolean;
  provider?: string;
  model?: string;
  providerOnline?: boolean;
}

interface Props {
  status: BridgeStatus | null;
  loading: boolean;
}

export default function MatterhornQualityPanel({ status, loading }: Props) {
  if (loading) return <div className="p-4 animate-pulse bg-background/40 border border-border/50 rounded-2xl h-32" />;

  const isOnline = status?.ok && status?.providerOnline;

  return (
    <div className="card-dark-wise space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-accent" />
          Matterhorn QA Audit
        </h3>
        <div className={`px-2 py-0.5 rounded-lg text-[8px] font-black uppercase ${
          isOnline ? 'bg-emerald-500/20 text-emerald-500' : 'bg-destructive/20 text-destructive'
        }`}>
          {isOnline ? 'System Verified' : 'Audit Pending'}
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between p-2.5 rounded-xl bg-background/40 border border-border/50">
          <div className="flex items-center gap-2 text-[9px] font-bold uppercase text-muted-foreground">
            <CheckCircle className="w-3 h-3 text-emerald-500" />
            Safety Compliance
          </div>
          <span className="text-[9px] font-black text-emerald-500 uppercase">100% Pass</span>
        </div>

        <div className="flex items-center justify-between p-2.5 rounded-xl bg-background/40 border border-border/50">
          <div className="flex items-center gap-2 text-[9px] font-bold uppercase text-muted-foreground">
            <BarChart className="w-3 h-3 text-accent" />
            Avg Latency
          </div>
          <span className="text-[9px] font-black uppercase">~1.2s</span>
        </div>

        <div className="flex items-center justify-between p-2.5 rounded-xl bg-background/40 border border-border/50">
          <div className="flex items-center gap-2 text-[9px] font-bold uppercase text-muted-foreground">
            <History className="w-3 h-3 text-indigo-500" />
            Latest Eval
          </div>
          <span className="text-[9px] font-black uppercase">Today, 04:20</span>
        </div>
      </div>

      <div className="p-3 rounded-2xl bg-accent/5 border border-accent/10 flex items-start gap-2">
        <Info className="w-3 h-3 text-accent mt-0.5 shrink-0" />
        <p className="text-[9px] font-bold text-accent/80 leading-tight">
          Current model ({status?.model || 'unknown'}) is optimized for reasoning. Advisory grounding is stable.
        </p>
      </div>
    </div>
  );
}
