import { AssistantModeId, ASSISTANT_MODES } from "@/worker/synox/assistantModes";
import { ShieldCheck, ChevronDown } from "lucide-react";
import { useState } from "react";

interface Props {
  selectedMode: AssistantModeId;
  onModeChange: (mode: AssistantModeId) => void;
}

export default function AssistantModeSelector({ selectedMode, onModeChange }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const currentMode = ASSISTANT_MODES[selectedMode];

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 bg-background/40 border border-border/50 rounded-xl hover:border-accent/40 transition-all text-left"
      >
        <div className="p-1.5 rounded-lg bg-accent/10 text-accent">
          <ShieldCheck className="w-4 h-4" />
        </div>
        <div className="min-w-0">
          <p className="text-[10px] font-bold uppercase text-muted-foreground/60 leading-none mb-1">Active Mode</p>
          <p className="text-xs font-black uppercase truncate">{currentMode.label}</p>
        </div>
        <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-64 bg-background border border-border/50 rounded-2xl shadow-2xl z-50 p-2 space-y-1">
          {Object.values(ASSISTANT_MODES).map((mode) => (
            <button
              key={mode.id}
              onClick={() => {
                onModeChange(mode.id);
                setIsOpen(false);
              }}
              className={`w-full text-left p-3 rounded-xl transition-all ${
                selectedMode === mode.id ? "bg-accent/10 border-accent/20" : "hover:bg-muted/50"
              }`}
            >
              <p className="text-xs font-black uppercase mb-0.5">{mode.label}</p>
              <p className="text-[10px] text-muted-foreground leading-tight">{mode.description}</p>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
