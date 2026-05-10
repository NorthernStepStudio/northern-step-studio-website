import { BrainCircuit, AlertTriangle, CheckCircle2, ChevronRight, Terminal, ShieldCheck } from "lucide-react";

interface ActionItem {
  id: string;
  title: string;
  description: string;
  source_type: string;
  priority: string;
  risk_level: string;
  status: string;
  reasoning_summary: string;
  suggested_prompt: string;
  created_at: string;
  updated_at: string;
}

interface Props {
  actions: ActionItem[];
  loading: boolean;
  onUpdateStatus: (id: string, status: string) => void;
}

export default function ActionQueuePanel({ actions, loading, onUpdateStatus }: Props) {
  if (loading) return <div className="p-8 text-center text-xs animate-pulse font-black uppercase">Scanning Action Queue...</div>;

  return (
    <div className="space-y-4">
      <div className="p-4 rounded-2xl bg-accent/5 border border-accent/10 flex items-start gap-3">
        <ShieldCheck className="w-4 h-4 text-accent shrink-0 mt-0.5" />
        <p className="text-[10px] text-accent/80 font-bold uppercase tracking-tight leading-relaxed">
          Matterhorn recommendations are advisory and require manual review before execution.
        </p>
      </div>

      {actions.map((action) => (
        <div key={action.id} className="p-5 rounded-3xl bg-background border border-border/50 hover:border-accent/30 transition-all group">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-xl ${
                action.priority === 'critical' || action.priority === 'high' ? 'bg-destructive/10 text-destructive' : 'bg-accent/10 text-accent'
              }`}>
                {action.source_type === 'risk' ? <AlertTriangle className="w-4 h-4" /> : <BrainCircuit className="w-4 h-4" />}
              </div>
              <div>
                <h4 className="text-xs font-black uppercase tracking-tight">{action.title}</h4>
                <p className="text-[10px] text-muted-foreground/60 font-bold uppercase tracking-widest mt-0.5">
                  Matterhorn Recommendation • {action.source_type} • {new Date(action.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <div className={`px-2 py-1 rounded-lg text-[9px] font-black uppercase border ${
                action.risk_level === 'high' || action.risk_level === 'critical' ? 'bg-destructive/10 border-destructive/20 text-destructive' : 'bg-muted border-border text-muted-foreground'
              }`}>
                Risk: {action.risk_level}
              </div>
              <div className={`px-2 py-1 rounded-lg text-[9px] font-black uppercase border ${
                action.priority === 'critical' || action.priority === 'high' ? 'bg-destructive/10 border-destructive/20 text-destructive' : 'bg-accent/10 border-accent/20 text-accent'
              }`}>
                {action.priority}
              </div>
            </div>
          </div>

          <p className="text-[11px] text-muted-foreground leading-relaxed mb-3">
            {action.description}
          </p>

          {action.reasoning_summary && (
            <div className="mb-4 text-[10px] text-muted-foreground/80 italic leading-relaxed pl-3 border-l-2 border-border/50">
              {action.reasoning_summary}
            </div>
          )}

          {action.suggested_prompt && (
            <div className="mb-4 p-3 rounded-2xl bg-muted/30 border border-border/50 font-mono text-[9px] text-muted-foreground relative group/prompt">
              <div className="flex items-center justify-between mb-2 opacity-40 uppercase font-black tracking-widest">
                <span className="flex items-center gap-1"><Terminal className="w-2.5 h-2.5" /> Codex Prompt</span>
              </div>
              <p className="whitespace-pre-wrap">{action.suggested_prompt}</p>
            </div>
          )}

          <div className="flex items-center gap-2">
            <button 
              onClick={() => onUpdateStatus(action.id, 'accepted')}
              className="px-3 py-1.5 rounded-xl bg-accent text-accent-foreground text-[9px] font-black uppercase tracking-widest hover:opacity-90 transition-opacity flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-3 h-3" /> Accept
            </button>
            <button 
              onClick={() => onUpdateStatus(action.id, 'dismissed')}
              className="px-3 py-1.5 rounded-xl bg-muted/20 text-muted-foreground text-[9px] font-black uppercase tracking-widest hover:bg-muted/40 transition-colors"
            >
              Dismiss
            </button>
            <div className="ml-auto flex items-center gap-1.5 text-[9px] font-black uppercase text-emerald-500 opacity-60">
              <ShieldCheck className="w-3 h-3" />
              Grounded
            </div>
          </div>
        </div>
      ))}
      {actions.length === 0 && (
        <div className="p-12 text-center border-2 border-dashed border-border/30 rounded-3xl">
          <BrainCircuit className="w-8 h-8 text-muted-foreground/10 mx-auto mb-3" />
          <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">Action queue is clear.</p>
        </div>
      )}
    </div>
  );
}
