import { useState, useEffect } from "react";
import { Save, Loader2, Globe, FileText, Layout, Info, AlertCircle, CheckCircle2 } from "lucide-react";

const EDITABLE_SECTIONS = [
  { key: "home_hero_title", label: "Home: Hero Title", page: "Home", description: "The main headline on the home page." },
  { key: "home_hero_subtitle", label: "Home: Hero Subtitle", page: "Home", description: "The smaller text below the main headline." },
  { key: "about_content", label: "About Page: Content", page: "About", description: "The main body text of the about page." },
  { key: "terms_content", label: "Terms of Service: Body", page: "Terms", description: "The full text of the terms and conditions." },
  { key: "privacy_content", label: "Privacy Policy: Body", page: "Privacy", description: "The full text of the privacy policy." },
];

export default function SiteEditor() {
  const [selectedKey, setSelectedKey] = useState(EDITABLE_SECTIONS[0].key);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const selectedSection = EDITABLE_SECTIONS.find(s => s.key === selectedKey);

  useEffect(() => {
    fetchContent();
  }, [selectedKey]);

  async function fetchContent() {
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch(`/api/site-content/${selectedKey}`);
      if (res.ok) {
        const data = await res.json();
        setContent(data.content || "");
      } else if (res.status === 404) {
        // Content doesn't exist yet, we'll start with empty or hardcoded default
        setContent("");
      } else {
        throw new Error("Failed to fetch content");
      }
    } catch (err) {
      console.error("Error fetching content:", err);
      setMessage({ type: "error", text: "Failed to load current content." });
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch(`/api/site-content/${selectedKey}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });

      if (!res.ok) throw new Error("Failed to save content");

      setMessage({ type: "success", text: "Site content updated successfully!" });
    } catch (err) {
      console.error("Error saving content:", err);
      setMessage({ type: "error", text: "Failed to save content. Please try again." });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-hero mb-2 flex items-center gap-3">
            <Layout className="w-8 h-8 text-accent" />
            Site Editor
          </h1>
          <p className="text-muted-foreground font-normal">
            Manage public website text and sections without touching code.
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving || loading}
          className="btn-pill-primary flex items-center gap-2 self-start"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar: Section Selection */}
        <div className="lg:col-span-1 space-y-2">
          <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-4 px-2">
            Website Sections
          </h2>
          <div className="space-y-1">
            {EDITABLE_SECTIONS.map((section) => (
              <button
                key={section.key}
                onClick={() => setSelectedKey(section.key)}
                className={`w-full text-left px-4 py-3 rounded-xl transition-all flex items-center gap-3 ${
                  selectedKey === section.key
                    ? "bg-accent/10 border border-accent/30 text-accent shadow-sm"
                    : "hover:bg-muted border border-transparent text-muted-foreground"
                }`}
              >
                {section.page === "Home" ? <Globe className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
                <div className="min-w-0">
                  <p className="font-bold text-sm truncate">{section.label}</p>
                  <p className="text-[10px] uppercase opacity-70">{section.page}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Main Content: Editor */}
        <div className="lg:col-span-3 space-y-6">
          {selectedSection && (
            <div className="card-dark-wise border-accent/20">
              <div className="flex items-center gap-2 mb-2 text-accent">
                <Info className="w-4 h-4" />
                <span className="text-xs font-bold uppercase tracking-wider">Editor Context</span>
              </div>
              <p className="text-sm text-muted-foreground mb-1">{selectedSection.description}</p>
              <p className="text-[10px] font-mono opacity-50 uppercase">DB Key: {selectedSection.key}</p>
            </div>
          )}

          {message && (
            <div className={`p-4 rounded-2xl flex items-center gap-3 border animate-in fade-in slide-in-from-top-2 duration-300 ${
              message.type === "success" 
                ? "bg-green-500/10 border-green-500/20 text-green-500" 
                : "bg-red-500/10 border-red-500/20 text-red-500"
            }`}>
              {message.type === "success" ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
              <p className="text-sm font-medium">{message.text}</p>
            </div>
          )}

          <div className="relative group">
            {loading && (
              <div className="absolute inset-0 bg-background/50 backdrop-blur-[1px] flex items-center justify-center z-10 rounded-2xl">
                <Loader2 className="w-8 h-8 animate-spin text-accent" />
              </div>
            )}
            <div className="flex items-center justify-between mb-2">
               <label className="text-sm font-medium">Content (Markdown Supported)</label>
               <span className="text-[10px] text-muted-foreground uppercase bg-muted px-1.5 py-0.5 rounded">Markdown</span>
            </div>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              disabled={loading}
              rows={18}
              placeholder="Enter content here..."
              className="w-full px-5 py-4 bg-muted border border-border rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-accent/50 resize-none font-mono leading-relaxed transition-all group-hover:border-accent/20"
            />
          </div>

          <div className="flex items-center justify-between gap-4 p-4 rounded-2xl bg-muted/30 border border-border">
            <div className="flex items-center gap-3 text-muted-foreground">
              <Layout className="w-5 h-5" />
              <p className="text-xs italic leading-relaxed">
                Changes will be reflected live on the public site immediately after saving. 
                Always preview the page to ensure correct formatting.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
