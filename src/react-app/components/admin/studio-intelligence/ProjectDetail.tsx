import { useState, useEffect } from "react";
import { 
  StudioProject, 
  ProjectNote, 
  ProjectGoal, 
  ProjectRisk, 
  ProjectDecision 
} from "@/shared/synox/projectIntelligence";
import { 
  FileText, 
  Target, 
  AlertTriangle, 
  Gavel, 
  Plus, 
  CheckCircle2, 
  Circle 
} from "lucide-react";

interface ProjectDetailProps {
  project: StudioProject;
}

export default function ProjectDetail({ project }: ProjectDetailProps) {
  const [notes, setNotes] = useState<ProjectNote[]>([]);
  const [goals, setGoals] = useState<ProjectGoal[]>([]);
  const [risks, setRisks] = useState<ProjectRisk[]>([]);
  const [decisions, setDecisions] = useState<ProjectDecision[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDetails() {
      setLoading(true);
      try {
        const [nRes, gRes, rRes, dRes] = await Promise.all([
          fetch(`/api/admin/studio/projects/${project.id}/notes`),
          fetch(`/api/admin/studio/projects/${project.id}/goals`),
          fetch(`/api/admin/studio/projects/${project.id}/risks`),
          fetch(`/api/admin/studio/projects/${project.id}/decisions`)
        ]);
        
        setNotes(await nRes.json());
        setGoals(await gRes.json());
        setRisks(await rRes.json());
        setDecisions(await dRes.json());
      } catch (err) {
        console.error("Failed to fetch project details:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchDetails();
  }, [project.id]);

  if (loading) {
    return <div className="p-8 text-center text-xs text-muted-foreground animate-pulse uppercase font-black">Analyzing Project Intelligence...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="p-5 rounded-2xl bg-accent/5 border border-accent/10">
        <h2 className="text-xl font-black uppercase mb-2">{project.name}</h2>
        <p className="text-xs text-muted-foreground leading-relaxed mb-4">
          {project.description || "No project description available."}
        </p>
        <div className="flex flex-wrap gap-4 pt-4 border-t border-border/50">
          <div>
            <p className="text-[10px] font-bold uppercase text-muted-foreground/60 mb-0.5">Status</p>
            <span className="text-xs font-black uppercase text-accent">{project.status}</span>
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase text-muted-foreground/60 mb-0.5">Priority</p>
            <span className="text-xs font-black uppercase text-orange-500">{project.priority}</span>
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase text-muted-foreground/60 mb-0.5">Started</p>
            <span className="text-xs font-black uppercase">
              {project.start_date ? new Date(project.start_date).toLocaleDateString() : "TBD"}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Goals Section */}
        <div className="card-dark-wise bg-background/20">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-black uppercase flex items-center gap-2">
              <Target className="w-4 h-4 text-emerald-500" />
              Strategic Goals
            </h3>
            <button title="Add goal" className="p-1 rounded-lg hover:bg-muted/50 text-muted-foreground">
              <Plus className="w-3 h-3" />
            </button>
          </div>
          <div className="space-y-2">
            {goals.length > 0 ? goals.map(goal => (
              <div key={goal.id} className="flex items-start gap-2 p-2 rounded-xl bg-muted/20 border border-border/30">
                {goal.is_completed ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 mt-0.5 shrink-0" />
                ) : (
                  <Circle className="w-3.5 h-3.5 text-muted-foreground/40 mt-0.5 shrink-0" />
                )}
                <span className={`text-[11px] leading-tight ${goal.is_completed ? "text-muted-foreground line-through" : ""}`}>
                  {goal.goal}
                </span>
              </div>
            )) : (
              <p className="text-[10px] text-muted-foreground italic">No goals defined.</p>
            )}
          </div>
        </div>

        {/* Risks Section */}
        <div className="card-dark-wise bg-background/20">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-black uppercase flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-destructive" />
              Active Risks
            </h3>
            <button title="Add risk" className="p-1 rounded-lg hover:bg-muted/50 text-muted-foreground">
              <Plus className="w-3 h-3" />
            </button>
          </div>
          <div className="space-y-2">
            {risks.length > 0 ? risks.map(risk => (
              <div key={risk.id} className="p-2 rounded-xl bg-destructive/5 border border-destructive/10">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[11px] font-bold text-destructive uppercase tracking-tighter">{risk.impact} Impact</span>
                </div>
                <p className="text-[11px] font-medium leading-snug mb-1">{risk.risk}</p>
                {risk.mitigation && (
                  <p className="text-[10px] text-muted-foreground bg-background/40 p-1 rounded">
                    Mitigation: {risk.mitigation}
                  </p>
                )}
              </div>
            )) : (
              <p className="text-[10px] text-muted-foreground italic">No risks tracked.</p>
            )}
          </div>
        </div>

        {/* Decisions Section */}
        <div className="card-dark-wise bg-background/20">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-black uppercase flex items-center gap-2">
              <Gavel className="w-4 h-4 text-blue-500" />
              Key Decisions
            </h3>
            <button title="Add decision" className="p-1 rounded-lg hover:bg-muted/50 text-muted-foreground">
              <Plus className="w-3 h-3" />
            </button>
          </div>
          <div className="space-y-2">
            {decisions.length > 0 ? decisions.map(d => (
              <div key={d.id} className="p-2 rounded-xl bg-blue-500/5 border border-blue-500/10">
                <p className="text-[11px] font-black uppercase tracking-tight mb-0.5">{d.decision}</p>
                <p className="text-[10px] text-muted-foreground leading-relaxed italic">
                  Rationale: {d.rationale}
                </p>
              </div>
            )) : (
              <p className="text-[10px] text-muted-foreground italic">No major decisions logged.</p>
            )}
          </div>
        </div>

        {/* Notes Section */}
        <div className="card-dark-wise bg-background/20">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-black uppercase flex items-center gap-2">
              <FileText className="w-4 h-4 text-purple-500" />
              Project Notes
            </h3>
            <button title="Add note" className="p-1 rounded-lg hover:bg-muted/50 text-muted-foreground">
              <Plus className="w-3 h-3" />
            </button>
          </div>
          <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
            {notes.length > 0 ? notes.map(note => (
              <div key={note.id} className="p-2.5 rounded-xl bg-background/40 border border-border/50">
                <p className="text-[11px] font-black uppercase mb-1">{note.title}</p>
                <p className="text-[10px] text-muted-foreground line-clamp-3 whitespace-pre-wrap">
                  {note.content}
                </p>
                <p className="text-[9px] text-muted-foreground/40 mt-2 text-right">
                  {new Date(note.created_at).toLocaleDateString()}
                </p>
              </div>
            )) : (
              <p className="text-[10px] text-muted-foreground italic">No notes found.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
