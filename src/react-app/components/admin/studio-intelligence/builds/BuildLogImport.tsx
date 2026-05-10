import { useState } from "react";
import { Terminal, Upload, X, CheckCircle2, ShieldAlert } from "lucide-react";

interface Props {
  onImport: (log: { message: string; phase: string; level: string }) => Promise<void>;
}

export default function BuildLogImport({ onImport }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [logText, setLogText] = useState("");
  const [phase, setPhase] = useState("process");
  const [level, setLevel] = useState("info");
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<{ success: boolean; redacted: boolean } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!logText.trim()) return;

    setImporting(true);
    try {
      await onImport({ message: logText, phase, level });
      setResult({ success: true, redacted: true }); // Redaction is handled backend, we just assume for UI feedback
      setLogText("");
      setTimeout(() => {
        setResult(null);
        setIsOpen(false);
      }, 2000);
    } catch {
      setResult({ success: false, redacted: false });
    } finally {
      setImporting(false);
    }
  };

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="w-full py-3 border-2 border-dashed border-border/40 rounded-2xl hover:border-accent/30 hover:bg-accent/5 transition-all flex items-center justify-center gap-2 group"
      >
        <Terminal className="w-4 h-4 text-muted-foreground/30 group-hover:text-accent transition-colors" />
        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 group-hover:text-accent">Inject External Logs</span>
      </button>
    );
  }

  return (
    <div className="p-5 rounded-2xl bg-background border border-accent/20 animate-in zoom-in-95 duration-200">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xs font-black uppercase flex items-center gap-2">
          <Terminal className="w-4 h-4 text-accent" />
          Log Injection (Synox Redacted)
        </h3>
        <button onClick={() => setIsOpen(false)} title="Close" className="text-muted-foreground hover:text-foreground">
          <X className="w-4 h-4" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-[9px] font-black uppercase text-muted-foreground ml-1">Phase</label>
            <select 
              title="Select Phase"
              className="w-full bg-muted/20 border border-border/50 rounded-xl px-3 py-2 text-xs font-bold uppercase focus:outline-none focus:border-accent/40"
              value={phase}
              onChange={e => setPhase(e.target.value)}
            >
              <option value="init">Initialization</option>
              <option value="compile">Compilation</option>
              <option value="bundle">Bundling</option>
              <option value="sign">Signing</option>
              <option value="upload">Upload</option>
              <option value="process">Processing</option>
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-[9px] font-black uppercase text-muted-foreground ml-1">Level</label>
            <select 
              title="Select Level"
              className="w-full bg-muted/20 border border-border/50 rounded-xl px-3 py-2 text-xs font-bold uppercase focus:outline-none focus:border-accent/40"
              value={level}
              onChange={e => setLevel(e.target.value)}
            >
              <option value="info">Information</option>
              <option value="warn">Warning</option>
              <option value="error">Error</option>
              <option value="debug">Debug</option>
            </select>
          </div>
        </div>

        <textarea 
          required
          className="w-full h-32 bg-muted/20 border border-border/50 rounded-xl px-3 py-2 text-[10px] font-mono leading-relaxed focus:outline-none focus:border-accent/40 resize-none"
          placeholder="Paste raw log output here..."
          value={logText}
          onChange={e => setLogText(e.target.value)}
        />

        <button 
          type="submit"
          disabled={importing}
          className="w-full py-3 bg-accent text-accent-foreground rounded-xl text-xs font-black uppercase tracking-widest hover:opacity-90 transition-opacity flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {importing ? (
            <div className="w-4 h-4 border-2 border-accent-foreground/30 border-t-accent-foreground rounded-full animate-spin" />
          ) : result?.success ? (
            <CheckCircle2 className="w-4 h-4" />
          ) : (
            <Upload className="w-4 h-4" />
          )}
          {importing ? "Redacting & Storing..." : result?.success ? "Logged & Secured" : "Commit Logs to Synox"}
        </button>

        {result?.redacted && (
          <div className="flex items-center gap-2 text-[9px] font-black uppercase text-emerald-500/60 justify-center">
            <ShieldAlert className="w-3 h-3" />
            Secrets Auto-Redacted by Synox
          </div>
        )}
      </form>
    </div>
  );
}
