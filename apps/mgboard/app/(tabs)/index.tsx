import React from 'react';
import { View, Text, ScrollView, StyleSheet, RefreshControl, useWindowDimensions, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { AlertTriangle, BriefcaseBusiness, ClockAlert, Zap, ChevronRight } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTasks } from '../../src/hooks/useTasks';
import { useProjects } from '../../src/hooks/useProjects';
import { TaskCard } from '../../src/components/cards/TaskCard';
import { ProjectCard } from '../../src/components/cards/ProjectCard';
import { TaskDetailModal } from '../../src/components/modals/TaskDetailModal';
import { colors, spacing, typography, radii } from '../../src/theme';
import { GlassCard } from '../../src/components/ui/GlassCard';
import * as ProjectService from '../../src/services/projects';
import { getTabBarReservedHeight } from '../../src/utils/safeArea';
import type { Task } from '../../src/types';

const DAY_MS = 24 * 60 * 60 * 1000;
const STALE_DAYS_THRESHOLD = 7;
const DESKTOP_SPLIT_BREAKPOINT = 1040;

type RepoHealthMap = Record<string, ProjectService.ProjectRepoHealth>;

function safeTimestamp(date: string | null | undefined): number | null {
  if (!date) return null;
  const ts = new Date(date).getTime();
  return Number.isFinite(ts) ? ts : null;
}

function getDaysSince(date: string | null | undefined, nowMs: number): number | null {
  const ts = safeTimestamp(date);
  if (ts === null) return null;
  if (nowMs <= ts) return 0;
  return Math.floor((nowMs - ts) / DAY_MS);
}

function getTaskUrgencyScore(task: Task, nowMs: number): number {
  const statusWeight =
    task.status === 'in_progress' || task.status === 'doing'
      ? 320
      : task.status === 'ready'
        ? 240
        : task.status === 'todo'
          ? 200
          : task.status === 'needs_review'
            ? 170
            : 0;
  const priorityWeight = task.priority === 'high' ? 120 : task.priority === 'medium' ? 80 : 40;

  let dueWeight = 0;
  const dueTs = safeTimestamp(task.due_date);
  if (dueTs !== null) {
    const daysUntilDue = Math.ceil((dueTs - nowMs) / DAY_MS);
    if (daysUntilDue < 0) {
      dueWeight = 140 + Math.min(60, Math.abs(daysUntilDue) * 10);
    } else if (daysUntilDue <= 1) {
      dueWeight = 110;
    } else if (daysUntilDue <= 3) {
      dueWeight = 80;
    } else if (daysUntilDue <= 7) {
      dueWeight = 50;
    } else {
      dueWeight = 20;
    }
  }

  return statusWeight + priorityWeight + dueWeight;
}

export default function DashboardScreen() {
  const { width } = useWindowDimensions();
  const tabBarHeight = useBottomTabBarHeight();
  const insets = useSafeAreaInsets();
  const { tasks, loading: loadingTasks, refresh: refreshTasks } = useTasks();
  const { projects, loading: loadingProjects, refresh: refreshProjects } = useProjects();

  const [refreshing, setRefreshing] = React.useState(false);
  const [healthLoading, setHealthLoading] = React.useState(true);
  const [healthError, setHealthError] = React.useState<string | null>(null);
  const [repoHealthByProject, setRepoHealthByProject] = React.useState<RepoHealthMap>({});
  const [selectedTask, setSelectedTask] = React.useState<Task | null>(null);

  React.useEffect(() => {
    let cancelled = false;

    const loadProjectHealth = async () => {
      if (projects.length === 0) {
        setRepoHealthByProject({});
        setHealthError(null);
        setHealthLoading(false);
        return;
      }

      try {
        setHealthLoading(true);
        setHealthError(null);
        const rows = await ProjectService.getProjectRepoHealth(projects.map((project) => project.id));
        if (cancelled) return;

        const nextMap: RepoHealthMap = {};
        for (const row of rows) {
          nextMap[row.project_id] = row;
        }
        setRepoHealthByProject(nextMap);
      } catch (error: unknown) {
        if (cancelled) return;
        const message = error instanceof Error ? error.message : 'Failed to load project health';
        setHealthError(message);
        setRepoHealthByProject({});
      } finally {
        if (!cancelled) {
          setHealthLoading(false);
        }
      }
    };

    loadProjectHealth();

    return () => {
      cancelled = true;
    };
  }, [projects]);

  const onRefresh = async () => {
    try {
      setRefreshing(true);
      await Promise.all([refreshTasks(), refreshProjects()]);
    } finally {
      setRefreshing(false);
    }
  };

  const greeting = React.useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  }, []);

  const nowMs = Date.now();

  const sortedActiveTasks = React.useMemo(() => {
    return tasks
      .filter(
        (task) =>
          task.status !== 'done' &&
          task.status !== 'failed' &&
          task.status !== 'blocked' &&
          task.status !== 'needs_clarification',
      )
      .sort((a, b) => getTaskUrgencyScore(b, nowMs) - getTaskUrgencyScore(a, nowMs));
  }, [tasks, nowMs]);

  const highPriorityTasks = React.useMemo(
    () => sortedActiveTasks.filter((task) => task.priority === 'high'),
    [sortedActiveTasks],
  );

  const activeWorkTasks = React.useMemo(
    () => sortedActiveTasks.filter((task) => task.priority !== 'high').slice(0, 6),
    [sortedActiveTasks],
  );

  const projectsWithIssuePressure = React.useMemo(() => {
    return projects
      .filter((project) => (repoHealthByProject[project.id]?.total_open_issues ?? 0) > 5)
      .sort((a, b) => {
        const left = repoHealthByProject[a.id]?.total_open_issues ?? 0;
        const right = repoHealthByProject[b.id]?.total_open_issues ?? 0;
        return right - left;
      });
  }, [projects, repoHealthByProject]);

  const staleProjects = React.useMemo(() => {
    return projects.filter((project) => {
      const health = repoHealthByProject[project.id];
      if (!health || health.linked_repo_count === 0) return false;

      const daysSinceCommit = getDaysSince(health.latest_commit_date, nowMs);
      if (daysSinceCommit === null) return true;
      return daysSinceCommit >= STALE_DAYS_THRESHOLD;
    });
  }, [projects, repoHealthByProject, nowMs]);

  const staleProjectSet = React.useMemo(() => {
    return new Set(staleProjects.map((project) => project.id));
  }, [staleProjects]);

  const activeWorkProjects = React.useMemo(() => {
    return projects
      .filter((project) => (project.status === 'building' || project.status === 'preview'))
      .filter((project) => !staleProjectSet.has(project.id))
      .sort((a, b) => {
        const left = a.priority === 'high' ? 0 : a.priority === 'medium' ? 1 : 2;
        const right = b.priority === 'high' ? 0 : b.priority === 'medium' ? 1 : 2;
        return left - right;
      });
  }, [projects, staleProjectSet]);

  const isInitialLoading = loadingTasks || loadingProjects || healthLoading;
  const isWideLayout = width >= DESKTOP_SPLIT_BREAKPOINT;
  const contentBottomPadding = getTabBarReservedHeight(tabBarHeight, insets.bottom, width) + spacing.md;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[styles.content, { paddingBottom: contentBottomPadding }]}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={colors.accent.secondary}
        />
      }
    >
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>{greeting}</Text>
          <Text style={styles.tagline}>Simple dashboard logic. No AI.</Text>
        </View>
      </View>

      <TouchableOpacity onPress={() => router.push('/nexus-build' as any)}>
        <GlassCard style={styles.nexusCard}>
          <View style={styles.nexusContent}>
            <View style={styles.nexusIcon}>
              <Zap size={16} color={colors.accent.secondary} />
            </View>
            <View>
              <Text style={styles.nexusTitle}>NexusBuild</Text>
              <Text style={styles.nexusSubtitle}>Autonomous Engineering Console</Text>
            </View>
          </View>
          <ChevronRight size={20} color={colors.text.muted} />
        </GlassCard>
      </TouchableOpacity>

      {healthError && (
        <GlassCard style={styles.noticeCard}>
          <Text style={styles.noticeText}>Project health fallback active: {healthError}</Text>
        </GlassCard>
      )}

      {isInitialLoading && tasks.length === 0 && projects.length === 0 ? (
        <GlassCard style={styles.miniEmpty}>
          <Text style={styles.miniEmptyText}>Loading dashboard...</Text>
        </GlassCard>
      ) : (
        <View style={[styles.dashboardGrid, isWideLayout && styles.dashboardGridWide]}>
          <View style={[styles.mainColumn, isWideLayout && styles.splitColumn]}>
            {!isWideLayout && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <View style={[styles.sectionIcon, { backgroundColor: colors.accent.dangerMuted }]}>
                    <AlertTriangle size={14} color={colors.accent.danger} strokeWidth={2.4} />
                  </View>
                  <Text style={styles.sectionTitle}>Needs Attention</Text>
                </View>

                {highPriorityTasks.map((task) => (
                  <View key={`high-${task.id}`} style={styles.attentionItem}>
                    <View style={styles.attentionPill}>
                      <Text style={styles.attentionPillText}>High Priority</Text>
                    </View>
                    <TaskCard task={task} onPress={() => setSelectedTask(task)} />
                  </View>
                ))}

                {projectsWithIssuePressure.map((project) => {
                  const issueCount = repoHealthByProject[project.id]?.total_open_issues ?? 0;
                  return (
                    <View key={`issues-${project.id}`} style={styles.attentionItem}>
                      <ProjectCard project={project} onPress={() => router.push(`/(tabs)/projects/${project.id}`)} />
                      <Text style={styles.projectWarning}>Open issues: {issueCount}</Text>
                    </View>
                  );
                })}

                {highPriorityTasks.length === 0 && projectsWithIssuePressure.length === 0 && (
                  <GlassCard style={styles.miniEmpty}>
                    <Text style={styles.miniEmptyText}>No urgent blockers right now.</Text>
                  </GlassCard>
                )}
              </View>
            )}

            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <View style={[styles.sectionIcon, { backgroundColor: colors.accent.secondaryMuted }]}>
                  <BriefcaseBusiness size={14} color={colors.accent.secondary} strokeWidth={2.4} />
                </View>
                <Text style={styles.sectionTitle}>Active Work</Text>
              </View>

              {activeWorkTasks.length > 0 ? (
                activeWorkTasks.map((task) => (
                  <TaskCard key={`active-task-${task.id}`} task={task} onPress={() => setSelectedTask(task)} />
                ))
              ) : (
                <GlassCard style={styles.miniEmpty}>
                  <Text style={styles.miniEmptyText}>No active tasks outside high-priority work.</Text>
                </GlassCard>
              )}

              {activeWorkProjects.length > 0 && (
                <View style={styles.projectRow}>
                  {activeWorkProjects.slice(0, 4).map((project) => (
                    <View key={`active-project-${project.id}`} style={styles.projectCardWrap}>
                      <ProjectCard project={project} onPress={() => router.push(`/(tabs)/projects/${project.id}`)} />
                    </View>
                  ))}
                </View>
              )}
            </View>

            {!isWideLayout && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <View style={[styles.sectionIcon, { backgroundColor: colors.accent.warningMuted }]}>
                    <ClockAlert size={14} color={colors.accent.warning} strokeWidth={2.4} />
                  </View>
                  <Text style={styles.sectionTitle}>Stale Projects</Text>
                </View>

                {staleProjects.length > 0 ? (
                  staleProjects.map((project) => {
                    const health = repoHealthByProject[project.id];
                    const staleDays = getDaysSince(health?.latest_commit_date ?? null, nowMs);
                    const staleLabel = staleDays === null
                      ? 'No synced commits yet'
                      : `No commits in ${staleDays} day${staleDays === 1 ? '' : 's'}`;

                    return (
                      <View key={`stale-${project.id}`} style={styles.attentionItem}>
                        <ProjectCard project={project} onPress={() => router.push(`/(tabs)/projects/${project.id}`)} />
                        <Text style={styles.projectStale}>{staleLabel}</Text>
                      </View>
                    );
                  })
                ) : (
                  <GlassCard style={styles.miniEmpty}>
                    <Text style={styles.miniEmptyText}>No stale projects in the last 7 days.</Text>
                  </GlassCard>
                )}
              </View>
            )}
          </View>

          {isWideLayout && (
            <View style={[styles.urgentRail, styles.splitColumn]}>
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <View style={[styles.sectionIcon, { backgroundColor: colors.accent.dangerMuted }]}>
                    <AlertTriangle size={14} color={colors.accent.danger} strokeWidth={2.4} />
                  </View>
                  <Text style={styles.sectionTitle}>Urgent Action</Text>
                </View>

                {highPriorityTasks.slice(0, 4).map((task) => (
                  <View key={`rail-high-${task.id}`} style={styles.attentionItem}>
                    <View style={styles.attentionPill}>
                      <Text style={styles.attentionPillText}>High Priority</Text>
                    </View>
                    <TaskCard task={task} onPress={() => setSelectedTask(task)} />
                  </View>
                ))}

                {projectsWithIssuePressure.slice(0, 4).map((project) => {
                  const issueCount = repoHealthByProject[project.id]?.total_open_issues ?? 0;
                  return (
                    <View key={`rail-issues-${project.id}`} style={styles.attentionItem}>
                      <ProjectCard project={project} onPress={() => router.push(`/(tabs)/projects/${project.id}`)} />
                      <Text style={styles.projectWarning}>Open issues: {issueCount}</Text>
                    </View>
                  );
                })}

                {highPriorityTasks.length === 0 && projectsWithIssuePressure.length === 0 && (
                  <GlassCard style={styles.miniEmpty}>
                    <Text style={styles.miniEmptyText}>No urgent blockers right now.</Text>
                  </GlassCard>
                )}
              </View>

              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <View style={[styles.sectionIcon, { backgroundColor: colors.accent.warningMuted }]}>
                    <ClockAlert size={14} color={colors.accent.warning} strokeWidth={2.4} />
                  </View>
                  <Text style={styles.sectionTitle}>Permanent Watch</Text>
                </View>

                {staleProjects.length > 0 ? (
                  staleProjects.slice(0, 5).map((project) => {
                    const health = repoHealthByProject[project.id];
                    const staleDays = getDaysSince(health?.latest_commit_date ?? null, nowMs);
                    const staleLabel = staleDays === null
                      ? 'No synced commits yet'
                      : `No commits in ${staleDays} day${staleDays === 1 ? '' : 's'}`;

                    return (
                      <View key={`rail-stale-${project.id}`} style={styles.attentionItem}>
                        <ProjectCard project={project} onPress={() => router.push(`/(tabs)/projects/${project.id}`)} />
                        <Text style={styles.projectStale}>{staleLabel}</Text>
                      </View>
                    );
                  })
                ) : (
                  <GlassCard style={styles.miniEmpty}>
                    <Text style={styles.miniEmptyText}>No stale projects in the last 7 days.</Text>
                  </GlassCard>
                )}
              </View>
            </View>
          )}
        </View>
      )}

      <TaskDetailModal
        task={selectedTask}
        isVisible={!!selectedTask}
        onClose={() => setSelectedTask(null)}
      />

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg.primary,
  },
  content: {
    width: '100%',
    alignSelf: 'flex-start',
    padding: spacing.md,
    paddingTop: spacing.md,
  },
  dashboardGrid: {
    width: '100%',
  },
  dashboardGridWide: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.lg,
  },
  mainColumn: {
    width: '100%',
  },
  splitColumn: {
    flex: 1,
    minWidth: 0,
  },
  urgentRail: {
    width: '100%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    marginBottom: spacing.lg,
  },
  greeting: {
    ...typography.display,
    fontSize: 30,
  },
  tagline: {
    ...typography.caption,
    marginTop: spacing.xs,
  },
  noticeCard: {
    borderRadius: radii.lg,
    padding: spacing.sm + 2,
    marginBottom: spacing.md,
    borderColor: colors.accent.warning,
  },
  noticeText: {
    ...typography.caption,
    color: colors.accent.warning,
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  sectionIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border.medium,
  },
  sectionTitle: {
    ...typography.heading,
    fontSize: 16,
  },
  attentionItem: {
    marginBottom: spacing.sm,
  },
  attentionPill: {
    alignSelf: 'flex-start',
    backgroundColor: colors.accent.dangerMuted,
    borderWidth: 1,
    borderColor: colors.accent.danger,
    borderRadius: radii.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    marginBottom: spacing.xs,
  },
  attentionPillText: {
    ...typography.small,
    color: colors.accent.danger,
    textTransform: 'none',
  },
  projectWarning: {
    ...typography.caption,
    color: colors.accent.warning,
    marginTop: spacing.xs,
    marginLeft: spacing.sm,
  },
  projectStale: {
    ...typography.caption,
    color: colors.accent.warning,
    marginTop: spacing.xs,
    marginLeft: spacing.sm,
  },
  projectRow: {
    marginTop: spacing.sm,
  },
  projectCardWrap: {
    marginBottom: spacing.sm,
  },
  miniEmpty: {
    borderRadius: radii.lg,
    padding: spacing.sm + 2,
  },
  miniEmptyText: {
    ...typography.caption,
    textAlign: 'center',
  },
  nexusCard: {
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
    borderRadius: radii.xl,
    backgroundColor: colors.surface.glassStrong,
  },
  nexusContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  nexusIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.accent.secondaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nexusTitle: {
    ...typography.body,
    fontWeight: '700',
  },
  nexusSubtitle: {
    ...typography.caption,
    fontSize: 11,
    color: colors.text.muted,
  },
});



