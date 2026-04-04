import React, { useState, useRef, useEffect } from "react";
import { Send, Bot, User, Loader2, Sparkles, ChevronLeft } from "lucide-react";
import { Link } from "react-router";

type ConfidenceLevel = "low" | "medium" | "high";

interface ChatSource {
  title: string;
  url: string;
}

interface ChatApiResponse {
  answer: string;
  sources?: ChatSource[];
  mode?: "gemini" | "fallback";
  confidence?: ConfidenceLevel;
  warning?: string;
  error?: string;
}

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  mode?: "gemini" | "fallback";
  confidence?: ConfidenceLevel;
  warning?: string;
}

const FALLBACK_ERROR_MESSAGE =
  "I'm sorry, I'm having trouble connecting right now. Please try again or contact support if the issue persists.";

const QUICK_PROMPTS = [
  { label: "Products catalog", prompt: "What products do you have?" },
  { label: "Lead Recovery", prompt: "Tell me about Lead Recovery" },
  { label: "Support info", prompt: "How do I contact support?" },
] as const;

function getConfidenceLabel(confidence?: ConfidenceLevel) {
  if (confidence === "high") {
    return "Strong answer";
  }

  if (confidence === "medium") {
    return "Helpful answer";
  }

  if (confidence === "low") {
    return "Needs human help";
  }

  return "Answer";
}

function getLoadingStatus(input: string) {
  const lower = input.trim().toLowerCase();

  if (lower.includes("price") || lower.includes("cost") || lower.includes("product")) {
    return "Checking product info...";
  }

  if (lower.includes("doc") || lower.includes("how") || lower.includes("setup") || lower.includes("fix")) {
    return "Checking studio docs...";
  }

  if (lower.includes("contact") || lower.includes("support") || lower.includes("human")) {
    return "Checking support options...";
  }

  return "Finding the best answer...";
}

function getSuggestedPrompt(input: string, suggestionIndex: number) {
  const lower = input.trim().toLowerCase();
  if (!lower) {
    return QUICK_PROMPTS[suggestionIndex % QUICK_PROMPTS.length].prompt;
  }

  if (lower.includes("product") || lower.includes("app")) {
    return "What products do you have?";
  }

  if (lower.includes("lead") || lower.includes("recovery")) {
    return "Tell me about Lead Recovery";
  }

  if (lower.includes("support") || lower.includes("contact")) {
    return "How do I contact support?";
  }

  return QUICK_PROMPTS[suggestionIndex % QUICK_PROMPTS.length].prompt;
}

function buildAssistantErrorMessage(error: unknown) {
  if (error instanceof Error && error.message) {
    if (error.message.startsWith("I'm sorry")) {
      return error.message;
    }

    return `I'm sorry, ${error.message.charAt(0).toLowerCase()}${error.message.slice(1)}`;
  }

  return FALLBACK_ERROR_MESSAGE;
}

const NStepAI: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content:
        "Hello! I'm NStep AI, your guide to Northern Step Studio. I can help you with product information, documentation, or any questions you have about our work. How can I assist you today?",
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

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (input.trim()) {
      return;
    }

    const interval = window.setInterval(() => {
      setSuggestionIndex((current) => (current + 1) % QUICK_PROMPTS.length);
    }, 6000);

    return () => window.clearInterval(interval);
  }, [input]);

  const lastAssistantMessage = [...messages].reverse().find((message) => message.role === "assistant");
  const humanHandoffAvailable = lastAssistantMessage?.confidence === "low" || lastAssistantMessage?.mode === "fallback";
  const chatStatus = isLoading
    ? getLoadingStatus(input)
    : humanHandoffAvailable
      ? "Need a human? We can route you there."
      : "Ready when you are.";
  const activeSuggestion = getSuggestedPrompt(input, suggestionIndex);

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
        headers: { "Content-Type": "application/json" },
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
        warning: data?.warning,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error("AI Error:", error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: buildAssistantErrorMessage(error),
        confidence: "low",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-studio-bg text-studio-text flex flex-col items-center pt-24 sm:pt-28 lg:pt-32">
      {/* Background Gradient Orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none opacity-20">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-studio-accent rounded-full blur-[120px]" />
        <div className="absolute top-1/2 -right-24 w-80 h-80 bg-studio-accent/30 rounded-full blur-[100px]" />
      </div>

      <header className="w-full max-w-5xl px-6 py-8 flex items-center justify-between relative z-10">
        <Link to="/" className="flex items-center gap-2 text-studio-text/60 hover:text-studio-text transition-colors">
          <ChevronLeft className="w-4 h-4" />
          <span>Back to Studio</span>
        </Link>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-studio-accent/10 rounded-xl border border-studio-accent/20">
            <Sparkles className="w-5 h-5 text-studio-accent" />
          </div>
          <h1 className="text-xl font-bold tracking-tight">NStep AI</h1>
        </div>
        <div className="w-24" />
      </header>

      <main className="flex-1 w-full max-w-4xl px-4 flex flex-col relative z-10 pb-40">
        {/* Messages Container */}
        <div
          className="flex-1 space-y-6 overflow-y-auto pr-4 scrollbar-thin scrollbar-thumb-studio-border/50"
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
                className={`max-w-[80%] flex flex-col gap-2 ${
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
                      className={`rounded-full border px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.18em] ${
                        message.confidence === "low"
                          ? "border-yellow-500/30 bg-yellow-500/10 text-yellow-300"
                          : message.confidence === "medium"
                            ? "border-blue-500/30 bg-blue-500/10 text-blue-300"
                            : "border-accent/30 bg-accent/10 text-accent"
                      }`}
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

        {/* Input Area */}
        <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-t from-studio-bg via-studio-bg to-transparent px-4 pb-[calc(2rem+env(safe-area-inset-bottom))] pt-12 flex justify-center z-20">
          <div className="w-full max-w-3xl relative">
            <div className="absolute inset-0 bg-studio-accent/5 blur-2xl rounded-full -z-10" />
            <form
              className="relative group"
              onSubmit={(event) => {
                event.preventDefault();
                void handleSend();
              }}
            >
              <input
                type="text"
                name="message"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={input.trim() ? "Continue your question..." : `Try: ${activeSuggestion}`}
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
              <button
                type="button"
                onClick={() => setInput(QUICK_PROMPTS[0].prompt)}
                className="text-[11px] font-semibold text-studio-text/40 hover:text-studio-accent transition-colors bg-studio-card/50 border border-studio-border/50 px-2.5 py-1 rounded-lg"
              >
                {QUICK_PROMPTS[0].label}
              </button>
              <button
                type="button"
                onClick={() => setInput(QUICK_PROMPTS[1].prompt)}
                className="text-[11px] font-semibold text-studio-text/40 hover:text-studio-accent transition-colors bg-studio-card/50 border border-studio-border/50 px-2.5 py-1 rounded-lg"
              >
                {QUICK_PROMPTS[1].label}
              </button>
              <button
                type="button"
                onClick={() => setInput(QUICK_PROMPTS[2].prompt)}
                className="text-[11px] font-semibold text-studio-text/40 hover:text-studio-accent transition-colors bg-studio-card/50 border border-studio-border/50 px-2.5 py-1 rounded-lg"
              >
                {QUICK_PROMPTS[2].label}
              </button>
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
