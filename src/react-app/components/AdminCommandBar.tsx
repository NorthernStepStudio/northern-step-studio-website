import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { ArrowRight, Clock3, Search } from "lucide-react";
import type { AdminNavItem } from "@/react-app/lib/adminNav";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/react-app/components/ui/dialog";

interface AdminCommandBarProps {
  items: AdminNavItem[];
  recentItems: AdminNavItem[];
  triggerClassName?: string;
}

export default function AdminCommandBar({
  items,
  recentItems,
  triggerClassName = "rounded-full border border-border bg-background px-4 py-2 text-xs font-black uppercase tracking-wider text-muted-foreground transition-colors hover:border-accent/30 hover:text-accent",
}: AdminCommandBarProps) {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen(true);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  const filteredItems = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) {
      return items;
    }

    return items.filter((item) => {
      return (
        item.label.toLowerCase().includes(normalizedQuery) ||
        item.description.toLowerCase().includes(normalizedQuery) ||
        item.page.toLowerCase().includes(normalizedQuery)
      );
    });
  }, [items, query]);

  const groupedItems = useMemo(() => {
    return {
      core: filteredItems.filter((item) => item.section === "core"),
      internal: filteredItems.filter((item) => item.section === "internal"),
      settings: filteredItems.filter((item) => item.section === "settings"),
    };
  }, [filteredItems]);

  const visibleRecentItems = useMemo(() => {
    const filteredRecent = recentItems.filter((item) =>
      filteredItems.some((filtered) => filtered.path === item.path),
    );
    return filteredRecent.slice(0, 4);
  }, [recentItems, filteredItems]);

  const hasResults =
    visibleRecentItems.length > 0 ||
    groupedItems.core.length > 0 ||
    groupedItems.internal.length > 0 ||
    groupedItems.settings.length > 0;

  const navigateTo = (path: string) => {
    navigate(path);
    setOpen(false);
    setQuery("");
  };

  const renderItem = (item: AdminNavItem) => (
    <button
      key={item.path}
      type="button"
      onClick={() => navigateTo(item.path)}
      className="flex w-full items-start gap-3 rounded-2xl border border-border bg-background/60 px-4 py-3 text-left transition-colors hover:border-accent/30 hover:bg-accent/5"
    >
      <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-accent/10 text-accent">
        <item.icon className="h-4 w-4" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-black uppercase tracking-wide text-foreground">
          {item.label}
        </p>
        <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
          {item.description}
        </p>
      </div>
      <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-muted-foreground" />
    </button>
  );

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className={triggerClassName}>
        <span className="inline-flex items-center gap-2">
          <Search className="h-3.5 w-3.5" />
          Command Bar
          <span className="rounded-full border border-border bg-card-soft px-2 py-0.5 text-[10px]">
            Ctrl/K
          </span>
        </span>
      </button>

      <Dialog
        open={open}
        onOpenChange={(nextOpen) => {
          setOpen(nextOpen);
          if (!nextOpen) {
            setQuery("");
          }
        }}
      >
        <DialogContent className="max-w-3xl border-border bg-card-soft">
          <DialogHeader>
            <DialogTitle>Command Bar</DialogTitle>
            <DialogDescription>
              Search admin sections and jump directly where you need to work.
            </DialogDescription>
          </DialogHeader>

          <div className="relative mt-2">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              autoFocus
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search apps, revenue, users, content..."
              className="w-full rounded-2xl border border-border bg-background py-3 pl-10 pr-4 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-accent/50"
            />
          </div>

          <div className="mt-4 max-h-[60vh] space-y-5 overflow-y-auto pr-1">
            {!query.trim() && visibleRecentItems.length > 0 && (
              <section>
                <div className="mb-3 flex items-center gap-2">
                  <Clock3 className="h-4 w-4 text-accent" />
                  <p className="text-[11px] font-black uppercase tracking-wider text-muted-foreground">
                    Recent
                  </p>
                </div>
                <div className="space-y-3">{visibleRecentItems.map(renderItem)}</div>
              </section>
            )}

            {groupedItems.core.length > 0 && (
              <section>
                <p className="mb-3 text-[11px] font-black uppercase tracking-wider text-muted-foreground">
                  Core
                </p>
                <div className="space-y-3">{groupedItems.core.map(renderItem)}</div>
              </section>
            )}

            {groupedItems.internal.length > 0 && (
              <section>
                <p className="mb-3 text-[11px] font-black uppercase tracking-wider text-muted-foreground">
                  Internal
                </p>
                <div className="space-y-3">{groupedItems.internal.map(renderItem)}</div>
              </section>
            )}

            {groupedItems.settings.length > 0 && (
              <section>
                <p className="mb-3 text-[11px] font-black uppercase tracking-wider text-muted-foreground">
                  Settings
                </p>
                <div className="space-y-3">{groupedItems.settings.map(renderItem)}</div>
              </section>
            )}

            {!hasResults && (
              <div className="rounded-2xl border border-border bg-background/60 px-4 py-5 text-sm text-muted-foreground">
                No admin sections matched that search.
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
