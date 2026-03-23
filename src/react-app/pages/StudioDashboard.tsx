import { useState, useEffect, useRef } from "react";
import { Plus, Pin, PinOff, Pencil, Trash2, X, Save, StickyNote, Lightbulb, CheckSquare, FileText } from "lucide-react";
import MentionInput, { extractMentionedUserIds, renderMentions } from "@/react-app/components/MentionInput";
import { sendMentionNotifications } from "@/react-app/lib/notifications";

interface Note {
  id: number;
  title: string;
  content: string;
  category: string;
  is_pinned: number;
  created_at: string;
  updated_at: string;
}

const CATEGORIES = [
  { value: "general", label: "General", icon: StickyNote, color: "text-blue-400" },
  { value: "idea", label: "Ideas", icon: Lightbulb, color: "text-yellow-400" },
  { value: "task", label: "Tasks", icon: CheckSquare, color: "text-green-400" },
  { value: "reference", label: "Reference", icon: FileText, color: "text-purple-400" },
];

export default function StudioDashboard() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [filterCategory, setFilterCategory] = useState<string>("all");

  // Form state
  const [formTitle, setFormTitle] = useState("");
  const [formContent, setFormContent] = useState("");
  const [formCategory, setFormCategory] = useState("general");
  const [formPinned, setFormPinned] = useState(false);
  const mentionedUserIds = useRef<number[]>([]);

  useEffect(() => {
    fetchNotes();
  }, []);

  const fetchNotes = async () => {
    try {
      const res = await fetch("/api/studio/notes");
      if (res.ok) {
        const data = await res.json();
        setNotes(data);
      }
    } catch (error) {
      console.error("Failed to fetch notes:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormTitle("");
    setFormContent("");
    setFormCategory("general");
    setFormPinned(false);
    setEditingNote(null);
    setIsCreating(false);
    mentionedUserIds.current = [];
  };

  const startCreate = () => {
    resetForm();
    setIsCreating(true);
  };

  const startEdit = (note: Note) => {
    setFormTitle(note.title);
    setFormContent(note.content);
    setFormCategory(note.category);
    setFormPinned(note.is_pinned === 1);
    setEditingNote(note);
    setIsCreating(false);
    mentionedUserIds.current = extractMentionedUserIds(note.content);
  };

  const saveNote = async () => {
    if (!formTitle.trim()) return;

    const noteData = {
      title: formTitle,
      content: formContent,
      category: formCategory,
      is_pinned: formPinned,
      mentioned_user_ids: mentionedUserIds.current,
    };

    try {
      const previousMentionIds = editingNote ? extractMentionedUserIds(editingNote.content) : [];
      const nextMentionIds = Array.from(new Set(mentionedUserIds.current));
      let noteId = editingNote?.id ?? null;

      if (editingNote) {
        const response = await fetch(`/api/studio/notes/${editingNote.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(noteData),
        });
        if (!response.ok) {
          throw new Error("Failed to update note");
        }
      } else {
        const response = await fetch("/api/studio/notes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(noteData),
        });
        if (!response.ok) {
          throw new Error("Failed to create note");
        }

        const createdNote = await response.json();
        noteId = typeof createdNote?.id === "number" ? createdNote.id : null;
      }

      if (noteId) {
        await sendMentionNotifications({
          recipientIds: editingNote
            ? nextMentionIds.filter((id) => !previousMentionIds.includes(id))
            : nextMentionIds,
          referenceType: "note",
          referenceId: noteId,
          content: `Mentioned you in the note "${formTitle.trim()}"`,
        }).catch((error) => {
          console.error("Failed to send studio note mention notifications:", error);
        });
      }

      fetchNotes();
      resetForm();
    } catch (error) {
      console.error("Failed to save note:", error);
    }
  };

  const deleteNote = async (id: number) => {
    if (!confirm("Delete this note?")) return;

    try {
      await fetch(`/api/studio/notes/${id}`, { method: "DELETE" });
      fetchNotes();
      if (editingNote?.id === id) resetForm();
    } catch (error) {
      console.error("Failed to delete note:", error);
    }
  };

  const togglePin = async (note: Note) => {
    try {
      await fetch(`/api/studio/notes/${note.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...note,
          is_pinned: note.is_pinned === 1 ? false : true,
        }),
      });
      fetchNotes();
    } catch (error) {
      console.error("Failed to toggle pin:", error);
    }
  };

  const filteredNotes = filterCategory === "all" 
    ? notes 
    : notes.filter(n => n.category === filterCategory);

  const getCategoryInfo = (category: string) => {
    return CATEGORIES.find(c => c.value === category) || CATEGORIES[0];
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black">Studio Dashboard</h1>
          <p className="text-muted-foreground text-sm mt-1">Internal workspace for Northern Step Studio</p>
        </div>
        <button onClick={startCreate} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" />
          New Note
        </button>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-1 p-1 bg-secondary rounded-xl overflow-x-auto">
        <button
          onClick={() => setFilterCategory("all")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
            filterCategory === "all" ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          All Notes
        </button>
        {CATEGORIES.map((cat) => (
          <button
            key={cat.value}
            onClick={() => setFilterCategory(cat.value)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 whitespace-nowrap ${
              filterCategory === cat.value ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <cat.icon className="w-4 h-4" />
            {cat.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Notes List */}
        <div className="lg:col-span-2 space-y-3">
          {isLoading ? (
            <div className="text-center py-12 text-muted-foreground">Loading notes...</div>
          ) : filteredNotes.length === 0 ? (
            <div className="text-center py-12 bg-card rounded-2xl border border-border">
              <StickyNote className="w-12 h-12 mx-auto mb-3 text-muted-foreground/50" />
              <p className="text-muted-foreground">No notes yet</p>
              <button onClick={startCreate} className="mt-4 text-accent text-sm font-medium hover:underline">
                Create your first note
              </button>
            </div>
          ) : (
            filteredNotes.map((note) => {
              const catInfo = getCategoryInfo(note.category);
              const isActive = editingNote?.id === note.id;
              return (
                <div
                  key={note.id}
                  className={`group bg-card rounded-xl border transition-all cursor-pointer ${
                    isActive ? "border-accent ring-2 ring-accent/20" : "border-border hover:border-accent/50"
                  }`}
                  onClick={() => startEdit(note)}
                >
                  <div className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2 min-w-0">
                        {note.is_pinned === 1 && (
                          <Pin className="w-4 h-4 text-accent flex-shrink-0" />
                        )}
                        <catInfo.icon className={`w-4 h-4 ${catInfo.color} flex-shrink-0`} />
                        <h3 className="font-bold truncate">{note.title}</h3>
                      </div>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={(e) => { e.stopPropagation(); togglePin(note); }}
                          className="p-1.5 rounded-lg hover:bg-secondary transition-colors"
                          title={note.is_pinned ? "Unpin" : "Pin"}
                        >
                          {note.is_pinned === 1 ? <PinOff className="w-4 h-4" /> : <Pin className="w-4 h-4" />}
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); deleteNote(note.id); }}
                          className="p-1.5 rounded-lg hover:bg-destructive/20 text-destructive transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    {note.content && (
                      <p className="mt-2 text-sm text-muted-foreground line-clamp-2">{renderMentions(note.content)}</p>
                    )}
                    <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground/60">
                      <span className="capitalize">{catInfo.label}</span>
                      <span>{formatDate(note.updated_at)}</span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Editor Panel */}
        <div className="lg:col-span-1">
          {(isCreating || editingNote) ? (
            <div className="bg-card rounded-2xl border border-border p-4 sticky top-24">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold">{editingNote ? "Edit Note" : "New Note"}</h3>
                <button onClick={resetForm} className="p-1.5 rounded-lg hover:bg-secondary transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1.5">Title</label>
                  <input
                    type="text"
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    placeholder="Note title..."
                    className="w-full px-3 py-2 bg-secondary border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1.5">Content</label>
                  <MentionInput
                    value={formContent}
                    onChange={setFormContent}
                    onMentionsChange={(ids) => { mentionedUserIds.current = ids; }}
                    placeholder="Write your note... Type @ to mention someone"
                    rows={8}
                    className="bg-secondary text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1.5">Category</label>
                  <div className="grid grid-cols-2 gap-2">
                    {CATEGORIES.map((cat) => (
                      <button
                        key={cat.value}
                        type="button"
                        onClick={() => setFormCategory(cat.value)}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                          formCategory === cat.value
                            ? "bg-accent text-accent-foreground"
                            : "bg-secondary text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        <cat.icon className="w-4 h-4" />
                        {cat.label}
                      </button>
                    ))}
                  </div>
                </div>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formPinned}
                    onChange={(e) => setFormPinned(e.target.checked)}
                    className="w-4 h-4 rounded border-border text-accent focus:ring-accent"
                  />
                  <span className="text-sm">Pin to top</span>
                </label>

                <button
                  onClick={saveNote}
                  disabled={!formTitle.trim()}
                  className="w-full btn-primary flex items-center justify-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  {editingNote ? "Update Note" : "Save Note"}
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-card/50 rounded-2xl border border-dashed border-border p-6 text-center">
              <Pencil className="w-8 h-8 mx-auto mb-3 text-muted-foreground/50" />
              <p className="text-sm text-muted-foreground">Select a note to edit or create a new one</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
