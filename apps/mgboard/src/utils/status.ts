import { colors } from '../theme';
import type {
  ExecutionMode,
  IdeaTag,
  Priority,
  ProjectStatus,
  RiskLevel,
  TaskStatus,
  TaskType,
} from '../types';

export function getStatusColor(status: ProjectStatus): string {
  return colors.status[status] ?? colors.text.muted;
}

export function getStatusLabel(status: ProjectStatus): string {
  const labels: Record<ProjectStatus, string> = {
    idea: 'Idea',
    building: 'Building',
    beta: 'Beta',
    paused: 'Paused',
    launched: 'Launched',
  };
  return labels[status];
}

export function getPriorityColor(priority: Priority): string {
  return colors.priority[priority] ?? colors.text.muted;
}

export function getPriorityLabel(priority: Priority): string {
  const labels: Record<Priority, string> = {
    low: 'Low',
    medium: 'Med',
    high: 'High',
  };
  return labels[priority];
}

export function getTaskStatusLabel(status: TaskStatus): string {
  const labels: Partial<Record<TaskStatus, string>> = {
    todo: 'To Do',
    ready: 'Ready',
    in_progress: 'In Progress',
    doing: 'Doing',
    done: 'Done',
    blocked: 'Blocked',
    needs_clarification: 'Needs Clarification',
    needs_review: 'Needs Review',
    failed: 'Failed',
  };
  return labels[status] ?? status;
}

export function getTaskTypeLabel(type: TaskType): string {
  const labels: Record<TaskType, string> = {
    bug_fix: 'Bug Fix',
    ui_polish: 'UI Polish',
    small_refactor: 'Small Refactor',
    documentation: 'Documentation',
    config_cleanup: 'Config Cleanup',
    issue_triage: 'Issue Triage',
    test_creation: 'Test Creation',
    maintenance: 'Maintenance',
    auth_security: 'Auth/Security',
    payments: 'Payments',
    database_migration: 'DB Migration',
    destructive: 'Destructive',
    deployment: 'Deployment',
    billing: 'Billing',
    secrets: 'Secrets/Env',
    external_account: 'External Account',
    other: 'Other',
  };
  return labels[type] ?? 'Other';
}

export function getRiskColor(risk: RiskLevel): string {
  if (risk === 'high') return colors.accent.danger;
  if (risk === 'medium') return colors.accent.warning;
  return colors.accent.success;
}

export function getRiskLabel(risk: RiskLevel): string {
  if (risk === 'high') return 'High Risk';
  if (risk === 'medium') return 'Medium Risk';
  return 'Low Risk';
}

export function getExecutionModeLabel(mode: ExecutionMode): string {
  return mode === 'auto_allowed' ? 'Auto Allowed' : 'Manual Only';
}

export function getTagColor(tag: IdeaTag): string {
  return colors.tag[tag] ?? colors.text.muted;
}

export function getTagLabel(tag: IdeaTag): string {
  const labels: Record<IdeaTag, string> = {
    now: 'Now',
    later: 'Later',
    maybe: 'Maybe',
  };
  return labels[tag];
}
