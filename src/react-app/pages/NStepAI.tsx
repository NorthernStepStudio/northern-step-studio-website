import React, { useState, useRef, useEffect } from "react";
import {
  Send, Bot, User, Loader2, Sparkles, ChevronLeft,
  ChevronDown, ChevronUp, ExternalLink, Database,
} from "lucide-react";
import { Link } from "react-router";

type ConfidenceLevel = "low" | "medium" | "high";

interface TraceChunkRef {
  chunkId: string;
  docId: string;
  title: string | null;
  section: string | null;
  lane: string;
  score: number;
  sourceUrl: string | null;
}

interface TraceReport {
  route: string;
  lane: string | null;
  confidence: ConfidenceLevel;
  totalDurationMs: number;
  retrievedChunks: TraceChunkRef[];
}

interface ChatApiResponse {
  answer: string;
  mode?: "gemini" | "fallback";
  confidence?: ConfidenceLevel;
  sources?: string[];
  trace?: TraceReport;
  error?: string;
}

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  mode?: "gemini" | "fallback";
  confidence?: ConfidenceLevel;
  sources?: string[];
  trace?: TraceReport;
}

const FALLBACK_ERROR_MESSAGE =
  "I'm sorry, I'm having trouble connecting right now. Please try again or contact support if the issue persists.";

const QUICK_PROMPTS = [
  { label: "NexusBuild",      prompt: "Tell me about NexusBuild" },
  { label: "ProvLy",          prompt: "What is ProvLy and who is it for?" },
  { label: "NooBS Investing", prompt: "How does NooBS Investing work?" },
  { label: "Neuromove",       prompt: "What is Neuromove?" },
  { label: "PasoScore",       prompt: "How does PasoScore help with credit?" },
  { label: "Support",         prompt: "How do I contact support?" },
] as const;

const LANE_COLORS: Record<string, string> = {
  nexusbuild:         "text-blue-400 border-blue-500/30 bg-blue-500/10",
  provly:             "text-emerald-400 border-emerald-500/30 bg-emerald-500/10",
  noobs:              "text-amber-400 border-amber-500/30 bg-amber-500/10",
  neuromove:          "text-violet-400 border-violet-500/30 bg-violet-500/10",
  pasoscore:          "text-rose-400 border-rose-500/30 bg-rose-500/10",
  mctb:               "text-green-400 border-green-500/30 bg-green-500/10",
  studio:             "text-studio-accent border-accent/30 bg-accent/10",
  automation:         "text-green-400 border-green-500/30 bg-green-500/10",
  service_automation: "text-green-400 border-green-500/30 bg-green-500/10",
  consumer_utility:   "text-blue-400 border-blue-500/30 bg-blue-500/10",
  finance:            "text-amber-400 border-amber-500/30 bg-amber-500/10",
  guided_support:     "text-violet-400 border-violet-500/30 bg-violet-500/10",
};

function getLaneStyle(lane: string | null | undefined): string {
  if (!lane) return "text-studio-accent border-accent/30 bg-accent/10";
  return LANE_COLORS[lane] ?? "text-studio-accent border-accent/30 bg-accent/10";
}

function getConfidenceStyle(confidence?: ConfidenceLevel): string {
  if (confidence === "high")   return "border-emerald-500/30 bg-emerald-500/10 text-emerald-300";
  if (confidence === "medium") return "border-blue-500/30 bg-blue-500/10 text-blue-300";
  return "border-yellow-500/30 bg-yellow-500/10 text-yellow-300";
}

function getConfidenceLabel(confidence?: ConfidenceLevel): string {
  if (confidence === "high")   return "Strong answer";
  if (confidence === "medium") return "Helpful answer";
  if (confidence === "low")    return "Needs human help";
  return "Answer";
}

function getLoadingStatus(input: string): string {
  const lower = input.trim().toLowerCase();
  if (lower.includes("nexusbuild") || lower.includes("hardware") || lower.includes("build"))
    return "Consulting NexusBuild expert...";
  if (lower.includes("provly") || lower.includes("inventory") || lower.includes("claim"))
    return "Consulting ProvLy expert...";
  if (lower.includes("noobs") || lower.includes("invest") || lower.includes("finance"))
    return "Consulting Finance expert...";
  if (lower.includes("neuromove") || lower.includes("therapy") || lower.includes("ot"))
    return "Consulting Guided Support expert...";
  if (lower.includes("paso") || lower.includes("credit"))
    return "Consulting PasoScore expert...";
  if (lower.includes("price") || lower.includes("cost") || lower.includes("product"))
    return "Checking product info...";
  if (lower.includes("doc") || lower.includes("how") || lower.includes("setup") || lower.includes("fix"))
    return "Searching studio docs...";
  if (lower.includes("contact") || lower.includes("support") || lower.includes("human"))
    return "Checking support options...";
  return "Studio Brain thinking...";
}

function buildAssistantErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message) {
    if (error.message.startsWith("I'm sorry")) return error.message;
    return `I'm sorry, ${error.message.charAt(0).toLowerCase()}${error.message.slice(1)}`;
  }
  return FALLBACK_ERROR_MESSAGE;
}

// ─── Thought Accordion ────────────────────────────────────────────────────────

interface ThoughtAccordionProps {
  trace: TraceReport;
  sources?: string[];
}

const ThoughtAccordion: React.FC<ThoughtAccordionProps> = ({ trace, sources }) => {
  const [open, setOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const hasChunks = trace.retrievedChunks.length > 0;
  const hasSources = sources && sources.length > 0;

  useEffect(() => {
    buttonRef.current?.setAttribute("aria-expanded", open ? "true" : "false");
  }, [open]);

  return (
    <div className="mt-2 rounded-xl border border-studio-border/60 overflow-hidden text-xs">
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-2 px-3 py-2 bg-studio-card/60 hover:bg-studio-card transition-colors text-left"
        aria-controls="thought-accordion-body"
      >
        <span className="font-semibold text-studio-text/70 flex-1">
          Thought Trail
          <span className="ml-2 font-normal text-studio-text/40">
            {trace.route} · {trace.totalDurationMs}ms
            {trace.lane ? ` · ${trace.lane}` : ""}
          </span>
        </span>
        {open
          ? <ChevronUp className="w-3.5 h-3.5 text-studio-text/40" />
          : <ChevronDown className="w-3.5 h-3.5 text-studio-text/40" />
        }
      </button>

      {open && (
        <div id="thought-accordion-body" className="px-3 py-3 space-y-3 bg-studio-bg/40">

          {trace.lane && (
            <div className="flex flex-wrap gap-1.5">
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[10px] font-bold uppercase tracking-widest ${getLaneStyle(trace.lane)}`}>
                <Database className="w-2.5 h-2.5" />
                {trace.lane}
              </span>
              <span className={`inline-flex items-center px-2 py-0.5 rounded-full border text-[10px] font-bold uppercase tracking-widest ${getConfidenceStyle(trace.confidence)}`}>
                {getConfidenceLabel(trace.confidence)}
              </span>
            </div>
          )}

          {hasChunks && (
            <div className="space-y-1.5">
              <p className="text-[10px] font-black uppercase tracking-widest text-studio-text/40">Evidence</p>
              <div className="space-y-1">
                {trace.retrievedChunks.slice(0, 5).map((chunk) => (
                  <div
                    key={chunk.chunkId}
                    className="flex items-start gap-2 px-2 py-1.5 rounded-lg bg-studio-card/50 border border-studio-border/40"
                  >
                    <span className={`shrink-0 mt-0.5 px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider border ${getLaneStyle(chunk.lane)}`}>
                      {chunk.lane}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-studio-text/80 truncate">
                        {chunk.title ?? chunk.docId}
                      </p>
                      {chunk.section && (
                        <p className="text-[10px] text-studio-text/40 truncate">{chunk.section}</p>
                      )}
                    </div>
                    <span className="shrink-0 text-[10px] text-studio-text/30 font-mono">
                      {chunk.score.toFixed(2)}
                    </span>
                    {chunk.sourceUrl && (
                      <a
                        href={chunk.sourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="shrink-0 text-studio-accent/60 hover:text-studio-accent transition-colors"
                        aria-label="Open source"
                      >
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {hasSources && (
            <div className="space-y-1">
              <p className="text-[10px] font-black uppercase tracking-widest text-studio-text/40">Sources</p>
              <div className="flex flex-wrap gap-1.5">
                {sources!.map((src, idx) => (
                  <span
                    key={idx}
                    className="inline-block px-2 py-0.5 rounded-full bg-studio-card border border-studio-border/60 text-studio-text/60 text-[10px] font-medium"
                  >
                    {src}
                  </span>
                ))}
              </div>
            </div>
          )}

          {!hasChunks && !hasSources && (
            <p className="text-studio-text/40 text-[10px]">
              Answer generated from studio knowledge base without specific chunk evidence.
            </p>
          )}
        </div>
      )}
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

const NStepAI: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content:
        "Hello! I'm NStep AI — the Studio Brain for Northern Step Studio. I'm an expert on every product we build: NexusBuild, ProvLy, NooBS Investing, Neuromove, PasoScore, and more. What can I help you with?",
      timestamp: new Date(),
      confidence: "high",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [suggestionIndex, setSuggestionIndex] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  };

  useEffect(() => { scrollToBottom(); }, [messages]);

  useEffect(() => {
    if (input.trim()) return;
    const interval = window.setInterval(() => {
      setSuggestionIndex((current) => (current + 1) % QUICK_PROMPTS.length);
    }, 5000);
    return () => window.clearInterval(interval);
  }, [input]);

  const lastAssistantMessage = [...messages].reverse().find((m) => m.role === "assistant");
  const humanHandoffAvailable =
    lastAssistantMessage?.confidence === "low" || lastAssistantMessage?.mode === "fallback";
  const chatStatus = isLoading
    ? getLoadingStatus(input)
    : humanHandoffAvailable
      ? "Need a human? We can route you there."
      : "Ready when you are.";

  const handleSend = async () => {
    const trimmedInput = input.trim();
    if (!trimmedInput || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: trimmedInput,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/nstep-ai/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-nstep-trace": "1",
        },
        body: JSON.stringify({
          message: trimmedInput,
          history: messages.map((m) => ({ role: m.role, content: m.content })),
        }),
      });

      const data = (await response.json().catch(() => null)) as ChatApiResponse | null;

      if (!response.ok) {
        throw new Error(data?.error || "Failed to get response");
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: typeof data?.answer === "string" ? data.answer : FALLBACK_ERROR_MESSAGE,
        mode: data?.mode,
        confidence: data?.confidence,
        sources: data?.sources,
        trace: data?.trace,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error("AI Error:", error);
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: buildAssistantErrorMessage(error),
          confidence: "low",
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-studio-bg text-studio-text flex flex-col items-center pt-24 sm:pt-28 lg:pt-32">
      {/* Background orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none opacity-20">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-studio-accent rounded-full blur-[120px]" />
        <div className="absolute top-1/2 -right-24 w-80 h-80 bg-studio-accent/30 rounded-full blur-[100px]" />
      </div>

      <header className="w-full max-w-5xl px-6 py-8 flex items-center justify-between relative z-10">
        <Link
          to="/"
          className="flex items-center gap-2 text-studio-text/60 hover:text-studio-text transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Back to Studio</span>
        </Link>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-studio-accent/10 rounded-xl border border-studio-accent/20">
            <Sparkles className="w-5 h-5 text-studio-accent" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">NStep AI</h1>
            <p className="text-[10px] text-studio-text/40 font-semibold uppercase tracking-widest">Studio Brain</p>
          </div>
        </div>
        <div className="w-24" />
      </header>

      <main className="flex-1 w-full max-w-4xl px-4 flex flex-col relative z-10 pb-44">
        <div
          className="flex-1 space-y-6 overflow-y-auto pr-4"
          role="log"
          aria-live="polite"
          aria-relevant="additions text"
          aria-label="Conversation history"
        >
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-4 ${message.role === "assistant" ? "justify-start" : "justify-end"}`}
            >
              {message.role === "assistant" && (
                <div className="w-10 h-10 rounded-full bg-studio-accent/10 border border-studio-accent/20 flex items-center justify-center shrink-0">
                  <Bot className="w-5 h-5 text-studio-accent" />
                </div>
              )}

              <div
                className={`max-w-[82%] flex flex-col gap-2 ${
                  message.role === "assistant" ? "items-start" : "items-end"
                }`}
              >
                <div
                  className={`px-5 py-3.5 rounded-2xl shadow-sm leading-relaxed whitespace-pre-wrap break-words ${
                    message.role === "assistant"
                      ? "bg-studio-card border border-studio-border text-studio-text"
                      : "bg-studio-accent text-white font-medium"
                  }`}
                >
                  {message.content}
                </div>

                <div className="flex flex-wrap items-center gap-2 px-1">
                  {message.role === "assistant" && (
                    <span
                      className={`rounded-full border px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.18em] ${getConfidenceStyle(message.confidence)}`}
                    >
                      {getConfidenceLabel(message.confidence)}
                    </span>
                  )}
                  <span className="text-[10px] text-studio-text/40 font-medium uppercase tracking-wider">
                    {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </span>
                  {message.role === "assistant" && message.confidence === "low" && (
                    <Link
                      to="/contact?intent=general-support&source=nstep_ai"
                      className="text-[10px] font-black uppercase tracking-[0.18em] text-studio-accent transition-colors hover:text-studio-accent/80"
                    >
                      Talk to a human
                    </Link>
                  )}
                </div>

                {message.role === "assistant" && message.trace && (
                  <div className="w-full">
                    <ThoughtAccordion trace={message.trace} sources={message.sources} />
                  </div>
                )}
              </div>

              {message.role === "user" && (
                <div className="w-10 h-10 rounded-full bg-studio-accent flex items-center justify-center shrink-0 shadow-lg shadow-studio-accent/20">
                  <User className="w-5 h-5 text-white" />
                </div>
              )}
            </div>
          ))}

          {isLoading && (
            <div className="flex gap-4 justify-start">
              <div className="w-10 h-10 rounded-full bg-studio-accent/10 border border-studio-accent/20 flex items-center justify-center shrink-0 animate-pulse">
                <Bot className="w-5 h-5 text-studio-accent" />
              </div>
              <div className="bg-studio-card border border-studio-border px-5 py-3.5 rounded-2xl flex items-center gap-3">
                <div className="flex gap-1">
                  <span className="w-1.5 h-1.5 bg-studio-accent rounded-full animate-bounce [animation-delay:-0.3s]" />
                  <span className="w-1.5 h-1.5 bg-studio-accent rounded-full animate-bounce [animation-delay:-0.15s]" />
                  <span className="w-1.5 h-1.5 bg-studio-accent rounded-full animate-bounce" />
                </div>
                <span className="text-xs font-medium text-studio-text/60">{chatStatus}</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Fixed input area */}
        <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-t from-studio-bg via-studio-bg to-transparent px-4 pb-[calc(2rem+env(safe-area-inset-bottom))] pt-12 flex justify-center z-20">
          <div className="w-full max-w-3xl relative">
            <div className="absolute inset-0 bg-studio-accent/5 blur-2xl rounded-full -z-10" />
            <form
              className="relative group"
              onSubmit={(e) => {
                e.preventDefault();
                void handleSend();
              }}
            >
              <input
                type="text"
                name="message"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={
                  input.trim()
                    ? "Continue your question..."
                    : `Try: ${QUICK_PROMPTS[suggestionIndex % QUICK_PROMPTS.length].prompt}`
                }
                autoComplete="off"
                spellCheck={false}
                className="w-full bg-studio-card/80 backdrop-blur-xl border border-studio-border hover:border-studio-accent/30 focus:border-studio-accent focus:ring-4 focus:ring-studio-accent/5 rounded-2xl px-6 py-4 outline-none transition-[background-color,border-color,box-shadow] pr-16 shadow-xl shadow-black/5 text-studio-text placeholder:text-studio-text/40"
              />
              <button
                type="submit"
                aria-label="Send message"
                disabled={isLoading || !input.trim()}
                className="absolute right-2 top-2 bottom-2 px-4 bg-studio-accent hover:bg-studio-accent/90 disabled:bg-studio-accent/30 text-white rounded-xl transition-[background-color,box-shadow,transform] shadow-lg shadow-studio-accent/20 flex items-center justify-center group-focus-within:scale-105 active:scale-95"
              >
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
              </button>
            </form>

            <div className="mt-3 flex flex-wrap gap-2 justify-center">
              {QUICK_PROMPTS.map((qp) => (
                <button
                  key={qp.label}
                  type="button"
                  onClick={() => setInput(qp.prompt)}
                  className="text-[11px] font-semibold text-studio-text/40 hover:text-studio-accent transition-colors bg-studio-card/50 border border-studio-border/50 px-2.5 py-1 rounded-lg"
                >
                  {qp.label}
                </button>
              ))}
            </div>

            <div className="mt-4 flex flex-wrap items-center justify-center gap-3 text-center">
              <span className="text-[10px] font-black uppercase tracking-[0.28em] text-studio-text/35">
                {chatStatus}
              </span>
              {humanHandoffAvailable && (
                <Link
                  to="/contact?intent=general-support&source=nstep_ai"
                  className="btn-pill-ghost-compact"
                >
                  Talk to a human
                </Link>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default NStepAI;
