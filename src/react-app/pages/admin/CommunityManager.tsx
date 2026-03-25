import { useState, useEffect } from "react";
import { apiFetch } from "@/react-app/lib/api";
import { Button } from "@/react-app/components/ui/button";
import { Trash2, Pin, Lock, Eye, EyeOff } from "lucide-react";

interface Thread {
  id: number;
  title: string;
  slug: string;
  category_name: string;
  is_pinned: boolean;
  is_locked: boolean;
  is_hidden: boolean;
  post_count: number;
  view_count: number;
  created_at: string;
}

export default function CommunityManager() {
  const [threads, setThreads] = useState<Thread[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadThreads();
  }, []);

  const loadThreads = () => {
    apiFetch("/api/community/threads")
      .then((res) => res.json())
      .then((data) => {
        // Handle both array response and paginated response {threads: [...], total: X}
        const threadList = Array.isArray(data) ? data : (data?.threads || []);
        setThreads(threadList);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load threads:", err);
        setThreads([]);
        setLoading(false);
      });
  };

  const togglePin = async (id: number, currentState: boolean) => {
    try {
      const res = await apiFetch(`/api/community/threads/${id}/pin`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_pinned: !currentState }),
      });

      if (!res.ok) {
        const error = await res.json().catch(() => ({}));
        throw new Error(error.error || "Failed to update thread");
      }

      loadThreads();
    } catch (err) {
      console.error("Failed to toggle pin:", err);
    }
  };

  const toggleLock = async (id: number, currentState: boolean) => {
    try {
      const res = await apiFetch(`/api/community/threads/${id}/lock`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_locked: !currentState }),
      });

      if (res.ok) {
        loadThreads();
      }
    } catch (err) {
      console.error("Failed to toggle lock:", err);
    }
  };

  const toggleHide = async (id: number, currentState: boolean) => {
    try {
      const res = await apiFetch(`/api/community/threads/${id}/hide`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_hidden: !currentState }),
      });

      if (res.ok) {
        loadThreads();
      }
    } catch (err) {
      console.error("Failed to toggle hide:", err);
    }
  };

  const deleteThread = async (id: number) => {
    if (!confirm("Are you sure you want to delete this thread?")) return;

    try {
      const res = await apiFetch(`/api/community/threads/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        loadThreads();
      }
    } catch (err) {
      console.error("Failed to delete thread:", err);
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-12 bg-card rounded"></div>
          <div className="h-24 bg-card rounded"></div>
          <div className="h-24 bg-card rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Community Management</h1>
          <p className="text-muted-foreground">Moderate threads and manage community discussions</p>
        </div>
      </div>

      {/* Threads table */}
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-muted/50">
            <tr>
              <th className="text-left p-4 font-medium">Thread</th>
              <th className="text-left p-4 font-medium">Category</th>
              <th className="text-center p-4 font-medium">Posts</th>
              <th className="text-center p-4 font-medium">Views</th>
              <th className="text-center p-4 font-medium">Status</th>
              <th className="text-right p-4 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {threads.map((thread) => (
              <tr key={thread.id} className="border-t border-border hover:bg-muted/20">
                <td className="p-4">
                  <div className="flex items-center gap-2">
                    {thread.is_pinned && <Pin className="w-4 h-4 text-accent" />}
                    {thread.is_locked && <Lock className="w-4 h-4 text-muted-foreground" />}
                    {thread.is_hidden && <EyeOff className="w-4 h-4 text-destructive" />}
                    <span className="font-medium">{thread.title}</span>
                  </div>
                </td>
                <td className="p-4 text-muted-foreground">{thread.category_name}</td>
                <td className="p-4 text-center">{thread.post_count || 0}</td>
                <td className="p-4 text-center">{thread.view_count || 0}</td>
                <td className="p-4 text-center">
                  <div className="flex items-center justify-center gap-2">
                    {thread.is_pinned && (
                      <span className="px-2 py-1 text-xs bg-accent/20 text-accent rounded">Pinned</span>
                    )}
                    {thread.is_locked && (
                      <span className="px-2 py-1 text-xs bg-muted text-muted-foreground rounded">Locked</span>
                    )}
                    {thread.is_hidden && (
                      <span className="px-2 py-1 text-xs bg-destructive/20 text-destructive rounded">Hidden</span>
                    )}
                  </div>
                </td>
                <td className="p-4">
                  <div className="flex items-center justify-end gap-2">
                    <Button
                      size="sm"
                      variant={thread.is_pinned ? "default" : "outline"}
                      onClick={() => togglePin(thread.id, thread.is_pinned)}
                      title={thread.is_pinned ? "Unpin" : "Pin"}
                    >
                      <Pin className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant={thread.is_locked ? "default" : "outline"}
                      onClick={() => toggleLock(thread.id, thread.is_locked)}
                      title={thread.is_locked ? "Unlock" : "Lock"}
                    >
                      <Lock className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant={thread.is_hidden ? "default" : "outline"}
                      onClick={() => toggleHide(thread.id, thread.is_hidden)}
                      title={thread.is_hidden ? "Show" : "Hide"}
                    >
                      {thread.is_hidden ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => deleteThread(thread.id)}
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {threads.length === 0 && (
          <div className="p-12 text-center text-muted-foreground">
            No threads found
          </div>
        )}
      </div>
    </div>
  );
}


