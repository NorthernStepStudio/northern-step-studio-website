import { 
  LayoutDashboard, 
  BrainCircuit, 
  ListTodo, 
  Box, 
  Database, 
  Terminal, 
  BarChart3, 
  Rocket, 
  Settings, 
  ShieldAlert,
  Activity,
  History
} from "lucide-react";

interface Props {
  activeSection: string;
  onSectionChange: (section: string) => void;
  actionCount: number;
}

export default function OperationalSidebar({ activeSection, onSectionChange, actionCount }: Props) {
  const items = [
    { id: 'command-center', label: 'Executive Command Center', icon: LayoutDashboard },
    { id: 'matterhorn', label: 'Matterhorn Advisor', icon: BrainCircuit },
    { id: 'action-queue', label: 'Action Queue', icon: ListTodo, count: actionCount },
    { id: 'projects', label: 'Projects', icon: Box },
    { id: 'memory', label: 'Operational Memory', icon: Database },
    { id: 'repo', label: 'Repo Intelligence', icon: Terminal },
    { id: 'builds', label: 'Builds & Deployments', icon: Activity },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'readiness', label: 'Release Readiness', icon: Rocket },
    { id: 'audit', label: 'Audit Log', icon: History },
    { id: 'settings', label: 'Settings & Safety', icon: Settings },
  ];

  return (
    <div className="w-64 border-r border-white/5 flex flex-col h-[calc(100vh-64px)] p-4 bg-[#020617]/40">
      <div className="flex-1 space-y-1">
        {items.map((item) => (
          <button
            key={item.id}
            onClick={() => onSectionChange(item.id)}
            className={`w-full cockpit-sidebar-item ${activeSection === item.id ? 'active' : ''}`}
          >
            <item.icon className="w-4 h-4 shrink-0" />
            <span className="flex-1 text-left">{item.label}</span>
            {item.count ? (
              <span className="bg-accent/20 text-accent text-[9px] px-1.5 py-0.5 rounded-md">
                {item.count}
              </span>
            ) : null}
          </button>
        ))}
      </div>

      <div className="mt-auto p-4 rounded-2xl bg-destructive/5 border border-destructive/10 space-y-3">
        <div className="flex items-center gap-2 text-destructive">
          <ShieldAlert className="w-3.5 h-3.5" />
          <h4 className="text-[9px] font-black uppercase tracking-widest">Safety Advisory</h4>
        </div>
        <p className="text-[9px] font-bold text-muted-foreground/60 leading-relaxed uppercase">
          Matterhorn is advisory only. No autonomous execution permitted.
        </p>
        <button className="w-full py-2 rounded-xl bg-white/5 hover:bg-white/10 text-[9px] font-black uppercase tracking-widest text-white/40 transition-colors">
          Learn More
        </button>
      </div>

      <div className="mt-4 pt-4 border-t border-white/5 text-[8px] font-black uppercase text-muted-foreground/20 text-center">
        &copy; 2026 Northern Step Studio
      </div>
    </div>
  );
}
