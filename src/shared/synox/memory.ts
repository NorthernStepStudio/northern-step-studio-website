export interface SynoxMemory {
  id: string;
  scope: string;
  key: string;
  value: string;
  category?: string;
  tags?: string; // JSON string
  project_id?: number;
  app_key?: string;
  source_type?: string;
  source_id?: string;
  confidence?: number;
  freshness_status?: 'active' | 'stale' | 'archived';
  is_archived?: number;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface SynoxContextDoc {
  id: string;
  title: string;
  path?: string;
  content: string;
  category?: string;
  source_type?: string;
  freshness_status?: 'active' | 'stale' | 'archived';
  is_archived?: number;
  updated_at: string;
}

export interface GroundingSummary {
  productNaming: {
    ecosystem: string;
    agent: string;
    engine: string;
    dashboard: string;
  };
  studioIdentity: string;
  activeProjects: number;
  highRisks: number;
  recentDecisions: number;
  operationalMemory: {
    totalActive: number;
    recentKeys: string[];
  };
  latestSnapshot: {
    repoName: string;
    scannedAt: string;
    apps: number;
  } | null;
  warnings: string[];
}
