import { Globe, ShieldCheck, ExternalLink, GitCommit } from "lucide-react";

interface Deployment {
  id: string;
  app_key: string;
  environment: string;
  provider: string;
  status: string;
  url: string;
  commit_sha: string;
  finished_at: string;
}

interface Props {
  deployments: Deployment[];
  loading: boolean;
}

export default function DeploymentRunsPanel({ deployments, loading }: Props) {
  if (loading) return <div className="p-8 text-center text-xs animate-pulse font-black uppercase">Retrieving Edge Deploys...</div>;

  return (
    <div className="space-y-3">
      {deployments.map((deploy) => (
        <div key={deploy.id} className="p-4 rounded-2xl bg-background/40 border border-border/50 group">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-xl bg-background/60 ${
                deploy.status === 'success' ? 'text-teal-500' : 'text-destructive'
              }`}>
                <Globe className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-black uppercase tracking-tight flex items-center gap-2">
                  {deploy.app_key}
                  <span className={`px-1.5 py-0.5 rounded-md text-[9px] font-black ${
                    deploy.environment === 'production' ? 'bg-accent/20 text-accent' : 'bg-muted/30 text-muted-foreground'
                  }`}>
                    {deploy.environment}
                  </span>
                </h4>
                <p className="text-[10px] text-muted-foreground/60 font-bold uppercase tracking-widest mt-0.5">
                  {deploy.provider} • {new Date(deploy.finished_at).toLocaleString()}
                </p>
              </div>
            </div>
            {deploy.url && (
              <a 
                href={deploy.url} 
                target="_blank" 
                rel="noopener noreferrer"
                title="View deployment"
                className="p-2 rounded-xl bg-muted/20 text-muted-foreground hover:bg-accent/10 hover:text-accent transition-all"
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
          </div>

          <div className="flex items-center gap-4 text-[10px] font-bold uppercase text-muted-foreground/40">
            <div className="flex items-center gap-1.5">
              <GitCommit className="w-3 h-3" />
              {deploy.commit_sha?.slice(0, 7) || 'N/A'}
            </div>
            <div className="flex items-center gap-1.5 ml-auto">
              <ShieldCheck className="w-3 h-3 text-emerald-500" />
              Verified
            </div>
          </div>
        </div>
      ))}
      {deployments.length === 0 && (
        <div className="p-12 text-center border-2 border-dashed border-border/30 rounded-3xl">
          <Globe className="w-8 h-8 text-muted-foreground/10 mx-auto mb-3" />
          <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">No active deployments found.</p>
        </div>
      )}
    </div>
  );
}
