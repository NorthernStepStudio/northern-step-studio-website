import { SynoxMemory } from "@/shared/synox/memory";
import { BrainCircuit, Clock, ShieldCheck, Tag } from "lucide-react";

interface Props {
  memory: SynoxMemory[];
  loading: boolean;
}

export default function MemoryList({ memory, loading }: Props) {
  if (loading) return <div className="p-8 text-center text-xs animate-pulse uppercase font-black">Retrieving Synox Memory...</div>;

  return (
    <div className="space-y-3">
      {memory.map((m) => (
        <div key={m.id} className="p-4 rounded-2xl bg-background/40 border border-border/50 group hover:border-accent/30 transition-all">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="px-1.5 py-0.5 rounded-md bg-accent/10 text-accent text-[9px] font-black uppercase">
                {m.category || 'General'}
              </span>
              <span className={`px-1.5 py-0.5 rounded-md text-[9px] font-black uppercase ${
                m.freshness_status === 'active' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-orange-500/10 text-orange-500'
              }`}>
                {m.freshness_status}
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-[9px] text-muted-foreground/60 font-bold uppercase">
              <Clock className="w-3 h-3" />
              {new Date(m.updated_at).toLocaleDateString()}
            </div>
          </div>

          <p className="text-xs font-black uppercase mb-1 tracking-tight">{m.key}</p>
          <p className="text-[11px] text-muted-foreground leading-relaxed whitespace-pre-wrap">{m.value}</p>

          <div className="mt-3 pt-3 border-t border-border/20 flex flex-wrap gap-2">
            {m.tags && JSON.parse(m.tags).map((tag: string) => (
              <span key={tag} className="flex items-center gap-1 text-[9px] font-bold text-muted-foreground/40 hover:text-accent transition-colors">
                <Tag className="w-2.5 h-2.5" />
                {tag}
              </span>
            ))}
            <div className="ml-auto flex items-center gap-1 text-[9px] font-black text-accent/60">
              <ShieldCheck className="w-3 h-3" />
              {Math.round((m.confidence || 1) * 100)}% Confidence
            </div>
          </div>
        </div>
      ))}
      {memory.length === 0 && (
        <div className="p-8 text-center border border-dashed border-border/50 rounded-2xl">
          <BrainCircuit className="w-8 h-8 text-muted-foreground/10 mx-auto mb-2" />
          <p className="text-[10px] text-muted-foreground uppercase font-black">No operational memory found.</p>
        </div>
      )}
    </div>
  );
}
