import { StudioProject } from "@/shared/synox/projectIntelligence";
import { Box, ChevronRight } from "lucide-react";

interface ProjectListProps {
  projects: StudioProject[];
  selectedId: number | null;
  onSelect: (project: StudioProject) => void;
}

export default function ProjectList({ projects, selectedId, onSelect }: ProjectListProps) {
  const statusColors = {
    active: "text-emerald-500 bg-emerald-500/10",
    planning: "text-blue-500 bg-blue-500/10",
    paused: "text-yellow-500 bg-yellow-500/10",
    archived: "text-muted-foreground bg-muted/20",
  };

  const priorityColors = {
    critical: "bg-destructive text-destructive-foreground",
    high: "bg-orange-500 text-white",
    medium: "bg-blue-500 text-white",
    low: "bg-slate-500 text-white",
  };

  return (
    <div className="space-y-2">
      {projects.map((project) => (
        <button
          key={project.id}
          onClick={() => onSelect(project)}
          className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all text-left group ${
            selectedId === project.id
              ? "bg-accent/10 border-accent/40 shadow-lg shadow-accent/5"
              : "bg-background/40 border-border/50 hover:border-accent/30 hover:bg-accent/5"
          }`}
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className={`p-2 rounded-lg ${selectedId === project.id ? "bg-accent/20 text-accent" : "bg-muted/50 text-muted-foreground"}`}>
              <Box className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <span className="font-black text-xs uppercase truncate">{project.name}</span>
                <span className={`px-1.5 py-0.5 rounded-full text-[8px] font-black uppercase ${priorityColors[project.priority]}`}>
                  {project.priority}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className={`px-1.5 py-0.5 rounded-full text-[8px] font-black uppercase ${statusColors[project.status]}`}>
                  {project.status}
                </span>
                <span className="text-[9px] text-muted-foreground/60 uppercase font-bold tracking-wider">
                  Updated {new Date(project.updated_at).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
          <ChevronRight className={`w-4 h-4 transition-transform ${selectedId === project.id ? "text-accent translate-x-1" : "text-muted-foreground/30 group-hover:text-accent/50"}`} />
        </button>
      ))}
    </div>
  );
}
