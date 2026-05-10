import { Box, CheckCircle2, XCircle, Clock, ExternalLink, Activity } from "lucide-react";

interface BuildRun {
  id: string;
  app_key: string;
  platform: string;
  build_type: string;
  status: string;
  version_name: string;
  finished_at: string;
  risk_level: string;
}

interface Props {
  builds: BuildRun[];
  loading: boolean;
}

export default function BuildRunsPanel({ builds, loading }: Props) {
  if (loading) return <div className="p-8 text-center text-xs animate-pulse font-black uppercase">Scanning Build Intelligence...</div>;

  return (
    <div className="space-y-3">
      {builds.map((build) => (
        <div key={build.id} className="p-4 rounded-2xl bg-background/40 border border-border/50 hover:border-accent/30 transition-all group">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-xl bg-background/60 ${
                build.status === 'success' ? 'text-emerald-500' : build.status === 'failed' ? 'text-destructive' : 'text-orange-500'
              }`}>
                {build.status === 'success' ? <CheckCircle2 className="w-4 h-4" /> : build.status === 'failed' ? <XCircle className="w-4 h-4" /> : <Activity className="w-4 h-4 animate-spin-slow" />}
              </div>
              <div>
                <h4 className="text-xs font-black uppercase tracking-tight flex items-center gap-2">
                  {build.app_key}
                  <span className="px-1.5 py-0.5 rounded-md bg-muted/30 text-[9px] text-muted-foreground font-black">
                    {build.platform} • {build.build_type}
                  </span>
                </h4>
                <p className="text-[10px] text-muted-foreground/60 font-bold uppercase tracking-widest mt-0.5">
                  Version {build.version_name || 'N/A'} • {build.finished_at ? new Date(build.finished_at).toLocaleString() : 'In Progress'}
                </p>
              </div>
            </div>
            <div className={`px-2 py-1 rounded-lg text-[9px] font-black uppercase border ${
              build.risk_level === 'high' ? 'bg-destructive/10 border-destructive/20 text-destructive' : 'bg-accent/10 border-accent/20 text-accent'
            }`}>
              {build.risk_level} Risk
            </div>
          </div>
          
          <div className="flex items-center gap-4 text-[10px] font-bold uppercase text-muted-foreground/40">
            <div className="flex items-center gap-1.5">
              <Clock className="w-3 h-3" />
              Duration: --
            </div>
            <button className="flex items-center gap-1.5 hover:text-accent transition-colors ml-auto">
              View Build Logs
              <ExternalLink className="w-3 h-3" />
            </button>
          </div>
        </div>
      ))}
      {builds.length === 0 && (
        <div className="p-12 text-center border-2 border-dashed border-border/30 rounded-3xl">
          <Box className="w-8 h-8 text-muted-foreground/10 mx-auto mb-3" />
          <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">No recent builds detected.</p>
        </div>
      )}
    </div>
  );
}
