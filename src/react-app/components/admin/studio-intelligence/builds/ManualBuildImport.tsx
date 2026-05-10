import React, { useState } from "react";
import { Package, Send, ShieldCheck, AlertCircle } from "lucide-react";

interface Props {
  onSuccess: () => void;
}

export default function ManualBuildImport({ onSuccess }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    app_key: "",
    project_id: "",
    source: "manual",
    platform: "android",
    build_type: "release",
    status: "success",
    version_name: "",
    version_code: "",
    artifact_name: "",
    summary: "",
    risk_level: "low"
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/admin/studio/builds", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          project_id: formData.project_id ? parseInt(formData.project_id) : null
        })
      });

      if (!response.ok) throw new Error("Failed to import build run");
      
      onSuccess();
      setFormData({
        app_key: "",
        project_id: "",
        source: "manual",
        platform: "android",
        build_type: "release",
        status: "success",
        version_name: "",
        version_code: "",
        artifact_name: "",
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
          <Package className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-sm font-black uppercase tracking-tight">Manual Build Import</h3>
          <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">Connect Build Center status to Studio Intelligence</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-[9px] font-black uppercase text-muted-foreground ml-1">App Key</label>
            <input 
              type="text"
              required
              placeholder="e.g. neuromoves"
              className="w-full bg-muted/30 border-border/50 rounded-xl px-4 py-2.5 text-xs focus:ring-1 focus:ring-accent outline-none transition-all"
              value={formData.app_key}
              onChange={e => setFormData({ ...formData, app_key: e.target.value })}
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[9px] font-black uppercase text-muted-foreground ml-1">Platform</label>
            <select 
              title="Select Platform"
              className="w-full bg-muted/30 border-border/50 rounded-xl px-4 py-2.5 text-xs focus:ring-1 focus:ring-accent outline-none transition-all"
              value={formData.platform}
              onChange={e => setFormData({ ...formData, platform: e.target.value })}
            >
              <option value="android">Android</option>
              <option value="ios">iOS</option>
              <option value="web">Web</option>
              <option value="worker">Worker</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-[9px] font-black uppercase text-muted-foreground ml-1">Build Type</label>
            <select 
              title="Select Build Type"
              className="w-full bg-muted/30 border-border/50 rounded-xl px-4 py-2.5 text-xs focus:ring-1 focus:ring-accent outline-none transition-all"
              value={formData.build_type}
              onChange={e => setFormData({ ...formData, build_type: e.target.value })}
            >
              <option value="debug">Debug</option>
              <option value="release">Release</option>
              <option value="production">Production</option>
            </select>
          </div>
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
              <option value="running">Running</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-[9px] font-black uppercase text-muted-foreground ml-1">Version Name</label>
            <input 
              type="text"
              placeholder="e.g. 1.2.0"
              className="w-full bg-muted/30 border-border/50 rounded-xl px-4 py-2.5 text-xs focus:ring-1 focus:ring-accent outline-none transition-all"
              value={formData.version_name}
              onChange={e => setFormData({ ...formData, version_name: e.target.value })}
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[9px] font-black uppercase text-muted-foreground ml-1">Version Code</label>
            <input 
              type="text"
              placeholder="e.g. 42"
              className="w-full bg-muted/30 border-border/50 rounded-xl px-4 py-2.5 text-xs focus:ring-1 focus:ring-accent outline-none transition-all"
              value={formData.version_code}
              onChange={e => setFormData({ ...formData, version_code: e.target.value })}
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-[9px] font-black uppercase text-muted-foreground ml-1">Artifact Name</label>
          <input 
            type="text"
            placeholder="e.g. app-release.apk"
            className="w-full bg-muted/30 border-border/50 rounded-xl px-4 py-2.5 text-xs focus:ring-1 focus:ring-accent outline-none transition-all"
            value={formData.artifact_name}
            onChange={e => setFormData({ ...formData, artifact_name: e.target.value })}
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-[9px] font-black uppercase text-muted-foreground ml-1">Summary</label>
          <textarea 
            placeholder="Briefly describe the build result..."
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
          {loading ? "Importing..." : <><Send className="w-3.5 h-3.5" /> Import Build Run</>}
        </button>

        <div className="flex items-center justify-center gap-1.5 text-[9px] font-black uppercase text-muted-foreground/40">
          <ShieldCheck className="w-3 h-3" />
          Synox Log Redaction Active
        </div>
      </form>
    </div>
  );
}
