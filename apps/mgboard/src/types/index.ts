export type ProjectStatus = 'idea' | 'building' | 'preview' | 'paused' | 'launched';
export type Priority = 'low' | 'medium' | 'high';
export type TaskStatus =
  | 'todo'
  | 'ready'
  | 'in_progress'
  | 'doing'
  | 'done'
  | 'blocked'
  | 'needs_clarification'
  | 'needs_review'
  | 'failed';
export type IdeaTag = 'now' | 'later' | 'maybe';

export type TaskType =
  | 'bug_fix'
  | 'ui_polish'
  | 'small_refactor'
  | 'documentation'
  | 'config_cleanup'
  | 'issue_triage'
  | 'test_creation'
  | 'maintenance'
  | 'auth_security'
  | 'payments'
  | 'database_migration'
  | 'destructive'
  | 'deployment'
  | 'billing'
  | 'secrets'
  | 'external_account'
  | 'other';

export type RiskLevel = 'low' | 'medium' | 'high';
export type ExecutionMode = 'manual_only' | 'auto_allowed';

export interface Project {
  id: string;
  user_id: string;
  name: string;
  status: ProjectStatus;
  priority: Priority;
  next_action: string | null;
  created_at: string;
  updated_at: string;
}

export interface Task {
  id: string;
  user_id: string;
  project_id: string | null;
  repo_id: string | null;
  title: string;
  description: string | null;
  type: TaskType;
  status: TaskStatus;
  priority: Priority;
  risk_level: RiskLevel;
  execution_mode: ExecutionMode;
  due_date: string | null;
  files_hint: string | null;
  acceptance_criteria: string | null;
  blocker_reason: string | null;
  assigned_to: string | null;
  started_at: string | null;
  completed_at: string | null;
  result_summary: string | null;
  root_cause: string | null;
  fix_summary: string | null;
  human_review_required: boolean;
  created_at: string;
  updated_at: string;
  project_name?: string;
  repo_name?: string;
}

export interface Idea {
  id: string;
  user_id: string;
  title: string;
  notes: string | null;
  tag: IdeaTag;
  created_at: string;
  updated_at: string;
}

export interface Repo {
  id: string;
  user_id: string;
  github_id: number;
  name: string;
  full_name: string;
  last_commit_date: string | null;
  open_issues_count: number;
  synced_at: string;
}

export interface Commit {
  id: string;
  user_id: string;
  repo_id: string;
  sha: string;
  message: string;
  committed_at: string;
  synced_at: string;
  repo_name?: string;
}

export type ProjectCreate = Pick<Project, 'name' | 'status' | 'priority' | 'next_action'>;
export type ProjectUpdate = Partial<ProjectCreate>;

export interface TaskCreate {
  title: string;
  description?: string | null;
  type?: TaskType;
  status?: TaskStatus;
  priority?: Priority;
  risk_level?: RiskLevel;
  execution_mode?: ExecutionMode;
  project_id?: string | null;
  repo_id?: string | null;
  due_date?: string | null;
  files_hint?: string | null;
  acceptance_criteria?: string | null;
  blocker_reason?: string | null;
  assigned_to?: string | null;
  started_at?: string | null;
  completed_at?: string | null;
  result_summary?: string | null;
  root_cause?: string | null;
  fix_summary?: string | null;
  human_review_required?: boolean;
}

export type TaskUpdate = Partial<
  Omit<Task, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'project_name' | 'repo_name'>
>;

export type IdeaCreate = Pick<Idea, 'title' | 'notes' | 'tag'>;
export type IdeaUpdate = Partial<IdeaCreate>;

export interface GitHubRepo {
  id: number;
  name: string;
  full_name: string;
  open_issues_count: number;
  pushed_at: string | null;
  html_url: string;
  description: string | null;
  private: boolean;
  language: string | null;
}

export interface GitHubCommit {
  sha: string;
  commit: {
    message: string;
    author: {
      name: string;
      date: string;
    };
  };
  html_url: string;
}

export interface GitHubIssue {
  id: number;
  number: number;
  title: string;
  state: string;
  html_url: string;
  created_at: string;
  updated_at: string;
  labels: Array<{
    name: string;
    color: string;
  }>;
  repository_url: string;
}

export interface AuliExecutionLogEntry {
  id: string;
  user_id: string;
  task_id: string | null;
  project_id: string | null;
  action_taken: string;
  why_selected: string | null;
  risk_level: RiskLevel | null;
  files_touched: string | null;
  validation_run: string | null;
  result: string;
  root_cause: string | null;
  fix_applied: string | null;
  needs_human_review: boolean;
  payload: Record<string, unknown> | null;
  created_at: string;
}

export interface AuliApprovalRule {
  id: string;
  user_id: string;
  task_type: TaskType;
  decision: 'allow_once' | 'always_allow' | 'never_auto_run';
  note: string | null;
  expires_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface AuliMemoryEntry {
  id: string;
  user_id: string;
  task_id: string | null;
  project_id: string | null;
  issue: string;
  why_happened: string;
  how_fixed: string;
  avoid_next_time: string;
  created_at: string;
}

