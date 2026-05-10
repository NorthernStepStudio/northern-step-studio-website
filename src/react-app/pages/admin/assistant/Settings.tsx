export default function AssistantSettings() {
  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h3 className="text-lg font-bold uppercase tracking-tight mb-1">Local Bridge Settings</h3>
        <p className="text-sm text-muted-foreground">Configure connection to Ollama or LM Studio.</p>
      </div>
      
      <div className="space-y-4">
        <div>
          <label className="block text-xs font-bold uppercase mb-1">Bridge URL</label>
          <input 
            type="text" 
            defaultValue="http://localhost:3010" 
            className="w-full px-3 py-2 bg-background border border-border rounded-md text-sm"
            disabled
          />
        </div>
        <div>
          <label className="block text-xs font-bold uppercase mb-1">Main Code Model</label>
          <input 
            type="text" 
            defaultValue="Qwen2.5-Coder 14B Q4" 
            className="w-full px-3 py-2 bg-background border border-border rounded-md text-sm"
            disabled
          />
        </div>
        <div>
          <label className="block text-xs font-bold uppercase mb-1">Company/Support Model</label>
          <input 
            type="text" 
            defaultValue="Llama 3.1 8B" 
            className="w-full px-3 py-2 bg-background border border-border rounded-md text-sm"
            disabled
          />
        </div>
        <div className="pt-4 border-t border-border">
          <p className="text-xs text-muted-foreground">
            Settings are currently read-only and managed via the <code>apps/nstep-assistant-local-bridge</code> `.env` file.
          </p>
        </div>
      </div>
    </div>
  );
}
