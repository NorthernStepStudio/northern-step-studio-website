import { useState } from "react";
import { X, Tag as TagIcon, Save, BrainCircuit } from "lucide-react";

interface Props {
  onSave: (memory: {
    key: string;
    value: string;
    category: string;
    tags: string[];
    confidence: number;
    project_id: number | null;
  }) => void;
}

export default function MemoryEditor({ onSave }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    key: "",
    value: "",
    category: "general",
    tags: "",
    confidence: 1.0,
    project_id: ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.key || !formData.value) return;

    onSave({
      ...formData,
      tags: formData.tags.split(',').map(t => t.trim()).filter(t => t),
      project_id: formData.project_id ? parseInt(formData.project_id) : null
    });
    setIsOpen(false);
    setFormData({ key: "", value: "", category: "general", tags: "", confidence: 1.0, project_id: "" });
  };

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="w-full py-4 border-2 border-dashed border-border/50 rounded-2xl hover:border-accent/40 hover:bg-accent/5 transition-all flex flex-col items-center justify-center gap-2 group"
      >
        <BrainCircuit className="w-6 h-6 text-muted-foreground/30 group-hover:text-accent transition-colors" />
        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 group-hover:text-accent">Seed New Synox Memory</span>
      </button>
    );
  }

  return (
    <div className="p-5 rounded-2xl bg-background border border-accent/20 shadow-2xl animate-in zoom-in-95 duration-200">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xs font-black uppercase flex items-center gap-2">
          <BrainCircuit className="w-4 h-4 text-accent" />
          Seed Memory
        </h3>
        <button onClick={() => setIsOpen(false)} title="Close editor" className="text-muted-foreground hover:text-foreground">
          <X className="w-4 h-4" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="text-[9px] font-black uppercase text-muted-foreground ml-1">Key / Identifier</label>
            <input 
              required
              className="w-full bg-muted/20 border border-border/50 rounded-xl px-3 py-2 text-xs font-bold uppercase focus:outline-none focus:border-accent/40"
              placeholder="e.g. PROJECT_ARCHITECTURE"
              value={formData.key}
              onChange={e => setFormData({...formData, key: e.target.value})}
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[9px] font-black uppercase text-muted-foreground ml-1">Category</label>
            <select 
              title="Select Category"
              className="w-full bg-muted/20 border border-border/50 rounded-xl px-3 py-2 text-xs font-bold uppercase focus:outline-none focus:border-accent/40"
              value={formData.category}
              onChange={e => setFormData({...formData, category: e.target.value})}
            >
              <option value="general">General</option>
              <option value="architecture">Architecture</option>
              <option value="strategy">Strategy</option>
              <option value="process">Process</option>
              <option value="risk">Risk</option>
            </select>
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-[9px] font-black uppercase text-muted-foreground ml-1">Operational Knowledge</label>
          <textarea 
            required
            className="w-full h-24 bg-muted/20 border border-border/50 rounded-xl px-3 py-2 text-xs leading-relaxed focus:outline-none focus:border-accent/40 resize-none"
            placeholder="Describe the company knowledge to be grounded..."
            value={formData.value}
            onChange={e => setFormData({...formData, value: e.target.value})}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="text-[9px] font-black uppercase text-muted-foreground ml-1 flex items-center gap-1">
              <TagIcon className="w-2.5 h-2.5" /> Tags (comma separated)
            </label>
            <input 
              className="w-full bg-muted/20 border border-border/50 rounded-xl px-3 py-2 text-[10px] font-bold focus:outline-none focus:border-accent/40"
              placeholder="v1, breaking, core"
              value={formData.tags}
              onChange={e => setFormData({...formData, tags: e.target.value})}
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[9px] font-black uppercase text-muted-foreground ml-1">Confidence (0.0 - 1.0)</label>
            <input 
              type="number"
              title="Confidence level (0.0 to 1.0)"
              step="0.1"
              min="0"
              max="1"
              className="w-full bg-muted/20 border border-border/50 rounded-xl px-3 py-2 text-xs font-bold focus:outline-none focus:border-accent/40"
              value={formData.confidence}
              onChange={e => setFormData({...formData, confidence: parseFloat(e.target.value)})}
            />
          </div>
        </div>

        <button 
          type="submit"
          className="w-full py-3 bg-accent text-accent-foreground rounded-xl text-xs font-black uppercase tracking-widest hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
        >
          <Save className="w-4 h-4" />
          Commit to Synox Memory
        </button>
      </form>
    </div>
  );
}
