import { Cpu, Activity, ShieldCheck, User, RefreshCw, Zap } from "lucide-react";

interface Props {
  bridgeStatus: {
    ok: boolean;
    provider?: string;
    model?: string;
    providerOnline?: boolean;
    error?: string;
  } | null;
  onRefresh: () => void;
  loading: boolean;
}

export default function TopStatusBar({ bridgeStatus, onRefresh, loading }: Props) {
  const isOnline = bridgeStatus?.ok && bridgeStatus?.providerOnline;

  return (
    <div className="h-16 cockpit-glass-header flex items-center justify-between px-8 z-50 sticky top-0">
      <div className="flex items-center gap-4">
        <div className="p-2 rounded-xl bg-accent/20">
          <Zap className="w-5 h-5 text-accent" />
        </div>
        <div>
          <h1 className="text-sm font-black uppercase tracking-[0.2em] leading-none">Studio Intelligence</h1>
          <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground mt-1 flex items-center gap-1.5">
            Executive Command Center <span className="opacity-30">•</span> Northern Step Studio
          </p>
        </div>
      </div>

      <div className="flex items-center gap-8">
        {/* Bridge Status */}
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-[8px] font-black uppercase text-muted-foreground/60 leading-none mb-1">Bridge Status</p>
            <div className="flex items-center gap-1.5 justify-end">
              <div className={`w-1.5 h-1.5 rounded-full ${isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-destructive'}`} />
              <span className={`text-[10px] font-black uppercase ${isOnline ? 'text-emerald-500' : 'text-destructive'}`}>
                {isOnline ? 'Online (Local)' : 'Offline'}
              </span>
            </div>
          </div>
        </div>

        {/* Provider/Model */}
        <div className="h-8 w-px bg-white/5" />
        
        <div className="flex items-center gap-6">
          <div>
            <p className="text-[8px] font-black uppercase text-muted-foreground/60 leading-none mb-1 text-center">Provider</p>
            <p className="text-[10px] font-black uppercase text-white/80">{bridgeStatus?.provider || 'None'}</p>
          </div>
          <div>
            <p className="text-[8px] font-black uppercase text-muted-foreground/60 leading-none mb-1 text-center">Model</p>
            <p className="text-[10px] font-black uppercase text-white/80">{bridgeStatus?.model || 'N/A'}</p>
          </div>
        </div>

        <div className="h-8 w-px bg-white/5" />

        <div className="flex items-center gap-4">
          <button 
            onClick={onRefresh}
            disabled={loading}
            title="Refresh status"
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors group"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-muted-foreground group-hover:text-white transition-all ${loading ? 'animate-spin' : ''}`} />
          </button>
          
          <div className="flex items-center gap-3 pl-2">
            <div className="text-right">
              <p className="text-[10px] font-black uppercase text-white leading-none">NStep Admin</p>
              <p className="text-[8px] font-bold uppercase text-muted-foreground/60 mt-1">Administrator</p>
            </div>
            <div className="w-8 h-8 rounded-full bg-accent/20 border border-accent/30 flex items-center justify-center text-[10px] font-black text-accent">
              NS
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
