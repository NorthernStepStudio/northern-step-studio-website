import { useState } from "react";
import { Send, Terminal } from "lucide-react";

export default function LogsAssistant() {
  const [prompt, setPrompt] = useState("");
  const [response, setResponse] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const askAssistant = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    try {
      const res = await fetch("/api/admin/assistant/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode: "logs", message: prompt }),
      });
      const data = await res.json();
      setResponse(data.answer || "No response received.");
    } catch {
      setResponse("Error connecting to the assistant bridge.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[600px]">
      <div className="flex-1 overflow-y-auto mb-4 p-4 border border-border rounded-lg bg-background">
        {response ? (
          <div className="whitespace-pre-wrap text-sm text-foreground">{response}</div>
        ) : (
          <div className="text-muted-foreground text-sm flex flex-col items-center justify-center h-full gap-2">
            <Terminal className="w-6 h-6" />
            <p>Paste logs here to find errors and root causes.</p>
          </div>
        )}
        {loading && <div className="text-accent text-sm mt-2">Analyzing logs...</div>}
      </div>
      <div className="flex gap-2">
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Paste Android build logs or server errors here..."
          className="flex-1 px-4 py-2 bg-background border border-border rounded-lg text-sm min-h-[60px]"
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              askAssistant();
            }
          }}
        />
        <button
          onClick={askAssistant}
          disabled={loading}
          title="Analyze logs"
          className="px-4 py-2 bg-accent text-accent-foreground rounded-lg font-bold disabled:opacity-50 flex items-center justify-center h-[60px]"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
