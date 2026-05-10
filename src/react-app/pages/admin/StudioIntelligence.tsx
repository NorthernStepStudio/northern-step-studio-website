import { useState, useEffect } from "react";
import { 
  LayoutDashboard, 
  BrainCircuit, 
  Box, 
  Terminal, 
  RefreshCw, 
  CheckCircle2,
  AlertCircle,
  XCircle,
  Database,
  ShieldCheck,
  Zap
} from "lucide-react";

import { type RepoSnapshot } from "@/shared/synox/repoSnapshot";
import { type StudioProject } from "@/shared/synox/projectIntelligence";
import { type AssistantModeId } from "@/worker/synox/assistantModes";
import { type GroundingSummary, type SynoxMemory } from "@/shared/synox/memory";

// Layout Components
import TopStatusBar from "@/react-app/components/admin/studio-intelligence/layout/TopStatusBar";
import OperationalSidebar from "@/react-app/components/admin/studio-intelligence/layout/OperationalSidebar";

// Dashboard Panels
import CockpitExecutiveSummary from "@/react-app/components/admin/studio-intelligence/dashboard/CockpitExecutiveSummary";
import PriorityRisksPanel from "@/react-app/components/admin/studio-intelligence/dashboard/PriorityRisksPanel";
import EngineeringSignalsPanel from "@/react-app/components/admin/studio-intelligence/dashboard/EngineeringSignalsPanel";
import CockpitActionQueue from "@/react-app/components/admin/studio-intelligence/dashboard/CockpitActionQueue";
import CockpitMatterhornPanel from "@/react-app/components/admin/studio-intelligence/dashboard/CockpitMatterhornPanel";
import BridgeQualityPanel from "@/react-app/components/admin/studio-intelligence/dashboard/BridgeQualityPanel";
import AppMomentumPanel from "@/react-app/components/admin/studio-intelligence/analytics/AppMomentumPanel";

// Data Detail Panels (Collapsible/Hidden by default)
import ProjectList from "@/react-app/components/admin/studio-intelligence/ProjectList";
import ProjectDetail from "@/react-app/components/admin/studio-intelligence/ProjectDetail";
import MemoryList from "@/react-app/components/admin/studio-intelligence/memory/MemoryList";
import MemoryEditor from "@/react-app/components/admin/studio-intelligence/memory/MemoryEditor";
import BuildRunsPanel from "@/react-app/components/admin/studio-intelligence/builds/BuildRunsPanel";
import DeploymentRunsPanel from "@/react-app/components/admin/studio-intelligence/builds/DeploymentRunsPanel";

interface StudioOverview {
  status: string;
  system: string;
  version: string;
  last_sync: string;
  metrics: {
    active_projects: number;
    open_risks: number;
    pending_tasks: number;
    open_todos: number;
    total_apps: number;
    last_snapshot: string | null;
    synox_health: string;
  };
}

export default function StudioIntelligence() {
  const [activeSection, setActiveSection] = useState("command-center");
  const [overview, setOverview] = useState<StudioOverview | null>(null);
  const [projects, setProjects] = useState<StudioProject[]>([]);
  const [selectedProject, setSelectedProject] = useState<StudioProject | null>(null);
  const [latestSnapshot, setLatestSnapshot] = useState<RepoSnapshot | null>(null);
  const [actionQueue, setActionQueue] = useState<any[]>([]);
  const [bridgeStatus, setBridgeStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Synox Data
  const [memory, setMemory] = useState<SynoxMemory[]>([]);
  const [builds, setBuilds] = useState<any[]>([]);
  const [deployments, setDeployments] = useState<any[]>([]);
  const [momentum, setMomentum] = useState<any[]>([]);

  const refreshData = async () => {
    setLoading(true);
    try {
      const [overRes, projRes, snapRes, actionRes, bridgeRes, memRes, buildRes, deployRes, momRes] = await Promise.all([
        fetch("/api/admin/studio/overview"),
        fetch("/api/admin/studio/projects"),
        fetch("/api/admin/studio/repo-snapshots/latest"),
        fetch("/api/admin/intelligence/actions"),
        fetch("/api/admin/studio/assistant/bridge-status"),
        fetch("/api/admin/intelligence/memory"),
        fetch("/api/admin/intelligence/builds"),
        fetch("/api/admin/intelligence/deployments"),
        fetch("/api/admin/intelligence/analytics/overview")
      ]);

      if (overRes.ok) setOverview(await overRes.json());
      if (projRes.ok) {
        const data = await projRes.json();
        setProjects(data);
        if (data.length > 0 && !selectedProject) setSelectedProject(data[0]);
      }
      if (snapRes.ok) {
        const data = await snapRes.json();
        setLatestSnapshot(data.snapshot_data);
      }
      if (actionRes.ok) setActionQueue(await actionRes.json());
      if (bridgeRes.ok) setBridgeStatus(await bridgeRes.json());
      if (memRes.ok) setMemory(await memRes.json());
      if (buildRes.ok) setBuilds(await buildRes.json());
      if (deployRes.ok) setDeployments(await deployRes.json());
      if (momRes.ok) {
        const data = await momRes.json();
        setMomentum(data.momentum || []);
      }
    } catch (err) {
      console.error("Failed to fetch cockpit data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshData();
  }, []);

  // Mock Signals for the cockpit
  const mockSignals = [
    { id: '1', type: 'build_fail' as const, title: 'Failed Android build', subtitle: 'NeuroMoves', time: '32m ago' },
    { id: '2', type: 'deploy_warn' as const, title: 'Deployment warning', subtitle: 'nstep-ai.com', time: '2h ago' },
    { id: '3', type: 'snapshot_ok' as const, title: 'Repo snapshot updated', subtitle: '26 apps scanned', time: '5h ago' },
  ];

  const renderMainContent = () => {
    if (activeSection === 'command-center') {
      return (
        <div className="space-y-6">
          <CockpitExecutiveSummary summary={overview} loading={loading} />
          
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <div className="xl:col-span-2 space-y-6">
              <PriorityRisksPanel 
                priorities={projects.slice(0, 3).map(p => ({ name: p.name, readiness: Math.round(Math.random() * 40 + 60) }))}
                risks={[
                  { title: 'NeuroMoves: Android build failing', level: 'high' },
                  { title: 'Studio Intelligence: Architectural drift detected', level: 'medium' },
                  { title: 'Synox Engine: Repo snapshot stale', level: 'medium' }
                ]}
                loading={loading}
              />
              <AppMomentumPanel data={momentum} loading={loading} />
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <CockpitActionQueue 
                  actions={actionQueue.slice(0, 2).map(a => ({
                    id: a.id,
                    title: a.title,
                    priority: a.priority || 'Medium',
                    reasoning: a.reasoning || '',
                    evidence: '1 failed build in last 24h',
                    time: '20m ago'
                  }))} 
                  loading={loading} 
                />
                <CockpitMatterhornPanel />
              </div>
            </div>

            <div className="xl:col-span-1 space-y-6">
              <EngineeringSignalsPanel signals={mockSignals} loading={loading} />
              <BridgeQualityPanel status={bridgeStatus} loading={loading} />
              
              {/* Repo Snapshot Summary */}
              <div className="cockpit-card">
                 <h3 className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-4">Repo Intelligence</h3>
                 {latestSnapshot ? (
                   <div className="space-y-4">
                      <div className="p-3 rounded-2xl bg-white/5 border border-white/5">
                        <p className="text-[8px] font-black uppercase text-muted-foreground/40 mb-1">Active Snapshot</p>
                        <p className="text-[11px] font-black text-white">{latestSnapshot.repoName}</p>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                         <div className="p-3 rounded-2xl bg-white/5 border border-white/5">
                           <p className="text-[8px] font-black uppercase text-muted-foreground/40 mb-1">Apps</p>
                           <p className="text-lg font-black text-white">{latestSnapshot.apps.length}</p>
                         </div>
                         <div className="p-3 rounded-2xl bg-white/5 border border-white/5">
                           <p className="text-[8px] font-black uppercase text-muted-foreground/40 mb-1">TODOs</p>
                           <p className="text-lg font-black text-white">{latestSnapshot.todos.length}</p>
                         </div>
                      </div>
                   </div>
                 ) : (
                   <div className="p-8 text-center text-[10px] uppercase font-black text-muted-foreground/20">No Snapshot</div>
                 )}
              </div>
            </div>
          </div>

          {/* Footer Signals */}
          <div className="pt-8 border-t border-white/5 flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-muted-foreground/40">
             <div className="flex items-center gap-6">
               <div className="flex items-center gap-2">
                 <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                 Environment: Development (Local)
               </div>
               <div className="flex items-center gap-2">
                 <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                 D1 Database: Connected
               </div>
               <div className="flex items-center gap-2">
                 <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                 Worker: Running
               </div>
             </div>
             <div className="flex items-center gap-2">
               v1.0.0 <span className="opacity-30">•</span> NStep AI Operating System
             </div>
          </div>
        </div>
      );
    }

    // Generic placeholder for other sections
    return (
      <div className="cockpit-card min-h-[500px] flex flex-col items-center justify-center text-center">
        <div className="w-16 h-16 rounded-3xl bg-accent/10 flex items-center justify-center mb-6">
          <Terminal className="w-8 h-8 text-accent" />
        </div>
        <h2 className="text-xl font-black uppercase tracking-widest text-white mb-2">{activeSection.replace('-', ' ')}</h2>
        <p className="text-xs font-bold text-muted-foreground/60 uppercase tracking-widest max-w-xs">
          This operational module is being calibrated by Synox. Full access coming in next phase.
        </p>
      </div>
    );
  };

  return (
    <div className="cockpit-bg text-white selection:bg-accent/30 flex flex-col overflow-hidden h-screen">
      <TopStatusBar bridgeStatus={bridgeStatus} onRefresh={refreshData} loading={loading} />
      
      <div className="flex flex-1 overflow-hidden">
        <OperationalSidebar 
          activeSection={activeSection} 
          onSectionChange={setActiveSection} 
          actionCount={actionQueue.length}
        />
        
        <main className="flex-1 overflow-y-auto p-8 theme-scrollbar scrollbar-thin">
          <div className="max-w-[1400px] mx-auto animate-fadeIn">
            {renderMainContent()}
          </div>
        </main>
      </div>
    </div>
  );
}
