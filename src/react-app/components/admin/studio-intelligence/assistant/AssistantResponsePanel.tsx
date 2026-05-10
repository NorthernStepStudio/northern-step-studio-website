import { Sparkles, AlertTriangle } from "lucide-react";

interface Props {
  response: {
    answer: string;
    grounding?: {
      mode: string;
      warnings: string[];
      sourcesUsed: {
        docs: number;
        projects: number;
        repoSnapshot: boolean;
      };
    };
  } | null;
  loading: boolean;
}

export default function AssistantResponsePanel({ response, loading }: Props) {
  if (loading) {
    return (
      <div className="p-8 flex flex-col items-center justify-center border border-dashed border-border/50 rounded-3xl bg-background/20">
        <Sparkles className="w-8 h-8 text-accent animate-pulse mb-4" />
        <p className="text-xs text-muted-foreground uppercase font-black tracking-widest animate-pulse">Assistant is reasoning...</p>
      </div>
    );
  }

  if (!response) return null;

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Response Header */}
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-accent" />
          <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Intelligence Output</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="px-2 py-0.5 bg-accent/10 text-accent text-[9px] font-black uppercase rounded-full">
            {response.grounding?.mode || "General"} Mode
          </span>
        </div>
      </div>

      {/* Main Content */}
      <div className="card-dark-wise bg-background/60 p-6 shadow-xl border-accent/10">
        <div className="prose prose-invert prose-xs max-w-none">
          <div className="whitespace-pre-wrap text-sm leading-relaxed text-foreground/90 font-medium">
            {response.answer}
          </div>
        </div>

        {/* Source Badges */}
        {response.grounding?.sourcesUsed && (
          <div className="mt-8 pt-6 border-t border-border/50 flex flex-wrap gap-3">
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-muted/30 rounded-lg border border-border/50">
              <span className="text-[9px] font-black uppercase text-muted-foreground/60">Grounded in</span>
              <span className="text-[10px] font-black uppercase text-accent">
                {response.grounding.sourcesUsed.docs} Docs
              </span>
              <span className="w-1 h-1 rounded-full bg-border" />
              <span className="text-[10px] font-black uppercase text-accent">
                {response.grounding.sourcesUsed.projects} Projects
              </span>
              {response.grounding.sourcesUsed.repoSnapshot && (
                <>
                  <span className="w-1 h-1 rounded-full bg-border" />
                  <span className="text-[10px] font-black uppercase text-accent">Repo Snapshot</span>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Warnings Panel */}
      {response.grounding?.warnings && response.grounding.warnings.length > 0 && (
        <div className="p-3 bg-destructive/5 border border-destructive/20 rounded-2xl flex items-start gap-3">
          <AlertTriangle className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
          <div>
            <p className="text-[10px] font-black uppercase text-destructive mb-1 tracking-wider">Context Warnings</p>
            <ul className="space-y-1">
              {response.grounding.warnings.map((w, i) => (
                <li key={i} className="text-[10px] text-muted-foreground leading-tight">• {w}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
