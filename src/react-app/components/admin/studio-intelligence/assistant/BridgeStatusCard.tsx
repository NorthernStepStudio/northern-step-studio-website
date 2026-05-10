import { Activity, AlertCircle, CheckCircle2, Cpu, Zap } from "lucide-react";

interface BridgeStatus {
  ok: boolean;
  provider?: string;
  model?: string;
  providerOnline?: boolean;
  error?: string;
}

interface Props {
  status: BridgeStatus | null;
  loading: boolean;
}

export default function BridgeStatusCard({ status, loading }: Props) {
  if (loading) return <div className="p-4 rounded-3xl bg-background/40 border border-border/50 animate-pulse text-[9px] font-black uppercase text-center">Checking Synox Bridge...</div>;

  const isOnline = status?.ok && status?.providerOnline;

  return (
    <div className={`p-5 rounded-3xl border transition-all ${
      isOnline ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-destructive/5 border-destructive/20'
    }`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
          <Activity className={`w-3 h-3 ${isOnline ? 'text-emerald-500' : 'text-destructive'}`} />
          Synox Reasoning Bridge
        </h3>
        <div className={`px-2 py-0.5 rounded-lg text-[8px] font-black uppercase tracking-widest ${
          isOnline ? 'bg-emerald-500/20 text-emerald-500' : 'bg-destructive/20 text-destructive'
        }`}>
          {isOnline ? 'Online' : 'Offline'}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="p-3 rounded-2xl bg-background/40 border border-border/50">
          <p className="text-[8px] font-black uppercase text-muted-foreground/60 mb-1 flex items-center gap-1">
            <Zap className="w-2 h-2" /> Provider
          </p>
          <p className="text-[10px] font-black uppercase truncate">{status?.provider || 'Unknown'}</p>
        </div>
        <div className="p-3 rounded-2xl bg-background/40 border border-border/50">
          <p className="text-[8px] font-black uppercase text-muted-foreground/60 mb-1 flex items-center gap-1">
            <Cpu className="w-2 h-2" /> Model
          </p>
          <p className="text-[10px] font-black uppercase truncate">{status?.model || 'N/A'}</p>
        </div>
      </div>

      {!isOnline && (
        <div className="flex items-start gap-2 p-3 rounded-2xl bg-destructive/10 text-destructive text-[9px] font-bold leading-tight">
          <AlertCircle className="w-3 h-3 mt-0.5 shrink-0" />
          {status?.error || 'Local reasoning bridge is unreachable. Using Gemini fallback.'}
        </div>
      )}

      {isOnline && (
        <div className="flex items-center gap-2 text-[9px] font-black uppercase text-emerald-500/80">
          <CheckCircle2 className="w-3 h-3" />
          Grounded Reasoning Active
        </div>
      )}
    </div>
  );
}
