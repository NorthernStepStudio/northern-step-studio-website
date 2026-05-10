export type ProjectStatus = 'planning' | 'active' | 'paused' | 'archived';
export type ProjectPriority = 'low' | 'medium' | 'high' | 'critical';
export type RiskImpact = 'low' | 'medium' | 'high';

export interface StudioProject {
  id: number;
  uuid: string;
  name: string;
  status: ProjectStatus;
  priority: ProjectPriority;
  description: string | null;
  start_date: string | null;
  target_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface ProjectNote {
  id: number;
  project_id: number;
  title: string;
  content: string | null;
  created_at: string;
  updated_at: string;
}

export interface ProjectGoal {
  id: number;
  project_id: number;
  goal: string;
  is_completed: boolean | number;
  created_at: string;
}

export interface ProjectRisk {
  id: number;
  project_id: number;
  risk: string;
  impact: RiskImpact;
  mitigation: string | null;
  created_at: string;
}

export interface ProjectDecision {
  id: number;
  project_id: number;
  decision: string;
  rationale: string | null;
  created_at: string;
}
