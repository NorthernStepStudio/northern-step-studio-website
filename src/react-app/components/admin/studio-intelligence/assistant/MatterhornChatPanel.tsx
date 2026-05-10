import { useState, useRef, useEffect } from "react";
import { Send, BrainCircuit, Terminal, ShieldCheck, Info } from "lucide-react";

interface Message {
  role: 'user' | 'assistant';
  content: string;
  grounding?: {
    mode: string;
    sourcesUsed: {
      docs: number;
      projects: number;
      repoSnapshot: boolean;
    };
  };
}

interface Props {
  mode: string;
}

export default function MatterhornChatPanel({ mode }: Props) {
  const [messages, setMessages] = useState<Message[]>([
    { 
      role: 'assistant', 
      content: "I am Matterhorn, your advisory agent. I am grounded in Northern Step Studio's operational data via Synox. How can I assist you today?" 
    }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage = input;
    setInput("");
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setLoading(true);

    try {
      const res = await fetch("/api/admin/studio/assistant/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMessage, mode })
      });
      const data = await res.json();
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: data.answer,
        grounding: data.grounding
      }]);
    } catch (err) {
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: "I'm having trouble connecting to the Synox reasoning engine. Please ensure the local bridge is online." 
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[500px] bg-background/40 border border-border/50 rounded-3xl overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-border/50 bg-background/60 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BrainCircuit className="w-4 h-4 text-accent" />
          <h3 className="text-[10px] font-black uppercase tracking-widest">Matterhorn Advisor</h3>
        </div>
        <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-accent/10 text-accent text-[9px] font-black uppercase">
          <ShieldCheck className="w-3 h-3" /> Advisory Only
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-5 space-y-4 scrollbar-thin scrollbar-thumb-accent/20">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] p-4 rounded-3xl text-[11px] leading-relaxed ${
              msg.role === 'user' 
                ? 'bg-accent text-accent-foreground rounded-tr-none' 
                : 'bg-muted/40 border border-border/50 rounded-tl-none'
            }`}>
              {msg.content}
              
              {msg.grounding && (
                <div className="mt-3 pt-3 border-t border-border/20 space-y-2">
                  <div className="flex items-center gap-2 text-[9px] font-black uppercase text-muted-foreground/60">
                    <Info className="w-3 h-3" /> Synox Grounding Details
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="px-2 py-1 rounded-md bg-background/40 text-[8px] font-black uppercase">
                      Docs: {msg.grounding.sourcesUsed.docs}
                    </div>
                    <div className="px-2 py-1 rounded-md bg-background/40 text-[8px] font-black uppercase">
                      Projects: {msg.grounding.sourcesUsed.projects}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-muted/40 border border-border/50 p-4 rounded-3xl rounded-tl-none animate-pulse">
              <div className="flex gap-1">
                <div className="w-1 h-1 bg-accent rounded-full animate-bounce" />
                <div className="w-1 h-1 bg-accent rounded-full animate-bounce [animation-delay:0.2s]" />
                <div className="w-1 h-1 bg-accent rounded-full animate-bounce [animation-delay:0.4s]" />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="p-4 bg-background/60 border-t border-border/50">
        <div className="relative">
          <input 
            type="text" 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask Matterhorn about Studio Intelligence..."
            className="w-full bg-background/80 border border-border/50 rounded-2xl px-4 py-3 text-[11px] placeholder:text-muted-foreground/40 focus:outline-none focus:border-accent/50 pr-12 transition-all"
          />
          <button 
            onClick={handleSend}
            disabled={loading || !input.trim()}
            title="Send message"
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-xl bg-accent text-accent-foreground disabled:opacity-50 disabled:grayscale transition-all"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
        <p className="text-[8px] text-center text-muted-foreground/40 font-bold uppercase tracking-widest mt-2 flex items-center justify-center gap-1">
          <Terminal className="w-2.5 h-2.5" /> Reasoning provided by Synox Local Bridge
        </p>
      </div>
    </div>
  );
}
