import React, { useState } from "react";
import { Cloud, Send, ShieldCheck, AlertCircle } from "lucide-react";

interface Props {
  onSuccess: () => void;
}

export default function ManualDeploymentImport({ onSuccess }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    app_key: "",
    environment: "staging",
    provider: "cloudflare",
    status: "success",
    url: "",
    commit_sha: "",
    summary: "",
    risk_level: "low"
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/admin/studio/deployments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });

      if (!response.ok) throw new Error("Failed to import deployment summary");
      
      onSuccess();
      setFormData({
        app_key: "",
        environment: "staging",
        provider: "cloudflare",
        status: "success",
        url: "",
        commit_sha: "",
        summary: "",
        risk_level: "low"
      });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 rounded-3xl bg-background border border-border/50">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-xl bg-accent/10 text-accent">
          <Cloud className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-sm font-black uppercase tracking-tight">Manual Deployment Import</h3>
          <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">Connect Cloudflare Worker status to Studio Intelligence</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-[9px] font-black uppercase text-muted-foreground ml-1">App Key</label>
            <input 
              type="text"
              required
              placeholder="e.g. nstep-website"
              className="w-full bg-muted/30 border-border/50 rounded-xl px-4 py-2.5 text-xs focus:ring-1 focus:ring-accent outline-none transition-all"
              value={formData.app_key}
              onChange={e => setFormData({ ...formData, app_key: e.target.value })}
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[9px] font-black uppercase text-muted-foreground ml-1">Environment</label>
            <select 
              title="Select Environment"
              className="w-full bg-muted/30 border-border/50 rounded-xl px-4 py-2.5 text-xs focus:ring-1 focus:ring-accent outline-none transition-all"
              value={formData.environment}
              onChange={e => setFormData({ ...formData, environment: e.target.value })}
            >
              <option value="preview">Preview</option>
              <option value="staging">Staging</option>
              <option value="production">Production</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-[9px] font-black uppercase text-muted-foreground ml-1">Status</label>
            <select 
              title="Select Status"
              className="w-full bg-muted/30 border-border/50 rounded-xl px-4 py-2.5 text-xs focus:ring-1 focus:ring-accent outline-none transition-all"
              value={formData.status}
              onChange={e => setFormData({ ...formData, status: e.target.value })}
            >
              <option value="success">Success</option>
              <option value="failed">Failed</option>
              <option value="pending">Pending</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-[9px] font-black uppercase text-muted-foreground ml-1">Risk Level</label>
            <select 
              title="Select Risk Level"
              className="w-full bg-muted/30 border-border/50 rounded-xl px-4 py-2.5 text-xs focus:ring-1 focus:ring-accent outline-none transition-all"
              value={formData.risk_level}
              onChange={e => setFormData({ ...formData, risk_level: e.target.value })}
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-[9px] font-black uppercase text-muted-foreground ml-1">Deployment URL</label>
          <input 
            type="url"
            placeholder="https://..."
            className="w-full bg-muted/30 border-border/50 rounded-xl px-4 py-2.5 text-xs focus:ring-1 focus:ring-accent outline-none transition-all"
            value={formData.url}
            onChange={e => setFormData({ ...formData, url: e.target.value })}
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-[9px] font-black uppercase text-muted-foreground ml-1">Summary</label>
          <textarea 
            placeholder="Briefly describe the deployment..."
            className="w-full bg-muted/30 border-border/50 rounded-xl px-4 py-2.5 text-xs focus:ring-1 focus:ring-accent outline-none transition-all min-h-[80px]"
            value={formData.summary}
            onChange={e => setFormData({ ...formData, summary: e.target.value })}
          />
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20 flex items-center gap-2 text-[10px] text-destructive font-bold uppercase">
            <AlertCircle className="w-3.5 h-3.5" /> {error}
          </div>
        )}

        <button 
          type="submit"
          disabled={loading}
          className="w-full py-3 rounded-2xl bg-accent text-accent-foreground text-xs font-black uppercase tracking-widest hover:opacity-90 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
        >
          {loading ? "Importing..." : <><Send className="w-3.5 h-3.5" /> Import Deployment Summary</>}
        </button>

        <div className="flex items-center justify-center gap-1.5 text-[9px] font-black uppercase text-muted-foreground/40">
          <ShieldCheck className="w-3 h-3" />
          No Cloudflare Tokens Required
        </div>
      </form>
    </div>
  );
}
