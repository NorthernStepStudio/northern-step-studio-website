import { BrainCircuit, Send, Info, ShieldCheck } from "lucide-react";

export default function CockpitMatterhornPanel() {
  return (
    <div className="cockpit-card h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-1">Matterhorn <span className="text-accent ml-1">BETA</span></h3>
          <p className="text-xs font-black uppercase text-white">Advisory Assistant</p>
        </div>
        <BrainCircuit className="w-4 h-4 text-accent" />
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto mb-4 scrollbar-thin scrollbar-thumb-white/5 pr-2">
        {/* Mock Message */}
        <div className="flex justify-end">
           <div className="bg-accent/20 text-accent text-[10px] font-bold px-3 py-2 rounded-2xl rounded-tr-none">
             What are the main risks for NeuroMoves right now?
           </div>
        </div>
        
        <div className="space-y-3">
          <div className="bg-white/5 border border-white/5 p-4 rounded-2xl rounded-tl-none">
            <p className="text-[10px] font-bold text-white/80 leading-relaxed">
              Based on the current operational context:
            </p>
            <ul className="mt-2 space-y-1 text-[9px] font-medium text-white/60 list-disc list-inside uppercase tracking-tight">
              <li>Android build is failing due to resource merge conflict</li>
              <li>3 critical TODOs related to performance optimization</li>
              <li>No recent deployments in the last 48 hours</li>
            </ul>
            
            <div className="mt-4 pt-4 border-t border-white/5 space-y-2">
              <div className="flex items-center justify-between text-[8px] font-black uppercase text-muted-foreground/40">
                <span>Risk Level: High</span>
                <span>Confidence: 0.82</span>
              </div>
              <p className="text-[8px] font-black uppercase text-muted-foreground/40">
                Sources: Build Intelligence, Project Risks, TODOs
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="relative">
        <input 
          type="text" 
          placeholder="Ask Matterhorn anything..."
          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-[10px] focus:outline-none focus:border-accent/30 placeholder:text-white/20 transition-all"
        />
        <button title="Send message" className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-lg bg-accent text-accent-foreground hover:opacity-90 transition-all">
          <Send className="w-3 h-3" />
        </button>
      </div>
      
      <p className="text-[8px] font-black uppercase text-muted-foreground/20 text-center mt-3 flex items-center justify-center gap-1.5">
        <ShieldCheck className="w-2.5 h-2.5" /> Powered by Synox Reasoning Engine • Local Bridge
      </p>
    </div>
  );
}
