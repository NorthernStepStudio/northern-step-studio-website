import { Outlet, Link, useLocation } from "react-router";

export default function AssistantLayout() {
  const location = useLocation();

  const tabs = [
    { label: "Company", path: "/admin/assistant/company" },
    { label: "Repo", path: "/admin/assistant/repo" },
    { label: "Logs", path: "/admin/assistant/logs" },
    { label: "Settings", path: "/admin/assistant/settings" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black uppercase tracking-tight text-foreground">Matterhorn Agent</h1>
        <p className="text-sm text-muted-foreground">The primary NStep AI operator powered by the Synox engine.</p>
      </div>

      <div className="flex items-center gap-2 border-b border-border pb-2">
        {tabs.map((tab) => (
          <Link
            key={tab.path}
            to={tab.path}
            className={`px-4 py-2 text-sm font-bold uppercase rounded-t-lg transition-colors ${
              location.pathname.startsWith(tab.path)
                ? "bg-accent/10 text-accent border-b-2 border-accent"
                : "text-muted-foreground hover:bg-secondary"
            }`}
          >
            {tab.label}
          </Link>
        ))}
      </div>

      <div className="rounded-xl border border-border bg-card p-6">
        <Outlet />
      </div>
    </div>
  );
}
