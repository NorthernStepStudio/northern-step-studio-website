import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert, Platform, useWindowDimensions } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { CheckCircle2, GitFork, Rocket, Trash2 } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useProject } from '../../../src/hooks/useProjects';
import { useTasks } from '../../../src/hooks/useTasks';
import { TaskCard } from '../../../src/components/cards/TaskCard';
import { Badge } from '../../../src/components/ui/Badge';
import { Button } from '../../../src/components/ui/Button';
import { Input } from '../../../src/components/ui/Input';
import { LoadingSpinner } from '../../../src/components/ui/LoadingSpinner';
import { EmptyState } from '../../../src/components/ui/EmptyState';
import { GlassCard } from '../../../src/components/ui/GlassCard';
import { TaskDetailModal } from '../../../src/components/modals/TaskDetailModal';
import { colors, spacing, radii, typography } from '../../../src/theme';
import { getStatusColor, getStatusLabel, getPriorityColor, getPriorityLabel } from '../../../src/utils/status';
import { getTabBarReservedHeight } from '../../../src/utils/safeArea';
import * as ProjectService from '../../../src/services/projects';
import * as TaskService from '../../../src/services/tasks';
import type { ProjectStatus, Task } from '../../../src/types';

const STATUSES: ProjectStatus[] = ['idea', 'building', 'preview', 'paused', 'launched'];
const CONTENT_MAX_WIDTH = 640;

export default function ProjectDetailScreen() {
  const { width } = useWindowDimensions();
  const tabBarHeight = useBottomTabBarHeight();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { project, repos, loading, error, refresh } = useProject(id);
  const { tasks, refresh: refreshTasks } = useTasks(id);

  const [quickTask, setQuickTask] = useState('');
  const [addingTask, setAddingTask] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  const contentBottomPadding = getTabBarReservedHeight(tabBarHeight, insets.bottom, width) + spacing.md;

  if (loading) return <LoadingSpinner label="Loading project" />;
  if (!project) {
    return (
      <EmptyState
        icon="alert-circle-outline"
        title="Project not found"
        subtitle={error ?? 'This project may have been deleted'}
      />
    );
  }

  const handleStatusChange = async (status: ProjectStatus) => {
    await ProjectService.updateProject(project.id, { status });
    refresh();
  };

  const handleNextActionUpdate = async (text: string) => {
    await ProjectService.updateProject(project.id, { next_action: text || null });
  };

  const handleQuickAdd = async () => {
    if (!quickTask.trim()) return;
    try {
      setAddingTask(true);
      await TaskService.createTask({
        title: quickTask.trim(),
        description: null,
        type: 'bug_fix',
        status: 'todo',
        priority: 'medium',
        risk_level: 'low',
        execution_mode: 'manual_only',
        project_id: project.id,
        repo_id: null,
        due_date: null,
        files_hint: null,
        acceptance_criteria: null,
        human_review_required: false,
      });
      setQuickTask('');
      refreshTasks();
    } finally {
      setAddingTask(false);
    }
  };

  const handleToggleTask = async (taskId: string, currentStatus: string) => {
    const nextStatus =
      currentStatus === 'done'
        ? 'todo'
        : currentStatus === 'in_progress' || currentStatus === 'doing'
          ? 'done'
          : 'in_progress';
    await TaskService.updateTask(taskId, { status: nextStatus as any });
    refreshTasks();
  };

  const handleDelete = () => {
    const doDelete = async () => {
      await ProjectService.deleteProject(project.id);
      router.back();
    };
    if (Platform.OS === 'web') {
      if (confirm('Delete this project? This cannot be undone.')) doDelete();
    } else {
      Alert.alert('Delete Project', 'This cannot be undone.', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: doDelete },
      ]);
    }
  };

  const statusColor = getStatusColor(project.status);

  return (
    <ScrollView style={styles.container} contentContainerStyle={[styles.content, { paddingBottom: contentBottomPadding }]}>
      <GlassCard style={styles.headerCard}>
        <View style={styles.headerTop}>
          <View style={styles.titleIconWrap}>
            <Rocket size={18} color={colors.accent.primary} strokeWidth={2.2} />
          </View>
          <Text style={styles.projectName}>{project.name}</Text>
        </View>
        <View style={styles.badges}>
          <Badge label={getStatusLabel(project.status)} color={statusColor} size="md" />
          <Badge label={getPriorityLabel(project.priority)} color={getPriorityColor(project.priority)} size="md" />
        </View>
      </GlassCard>

      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Status</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.chips}>
            {STATUSES.map((s) => (
              <TouchableOpacity
                key={s}
                style={[
                  styles.chip,
                  project.status === s && { backgroundColor: `${getStatusColor(s)}2E`, borderColor: getStatusColor(s) },
                ]}
                onPress={() => handleStatusChange(s)}
              >
                <Text style={[styles.chipText, project.status === s && { color: getStatusColor(s) }]}>{getStatusLabel(s)}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Next Action</Text>
        <Input value={project.next_action ?? ''} onChangeText={handleNextActionUpdate} placeholder="What's the next step?" />
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <CheckCircle2 size={18} color={colors.accent.success} strokeWidth={2.2} />
          <Text style={styles.sectionTitle}>Tasks ({tasks.length})</Text>
        </View>

        <View style={styles.quickAdd}>
          <Input value={quickTask} onChangeText={setQuickTask} placeholder="Add a task..." style={{ flex: 1, marginBottom: 0 }} />
          <Button
            title="Add"
            size="sm"
            onPress={handleQuickAdd}
            loading={addingTask}
            disabled={!quickTask.trim()}
            style={{ marginLeft: spacing.sm }}
          />
        </View>

        {tasks.map((task) => (
          <TaskCard 
            key={task.id} 
            task={task} 
            onToggleStatus={() => handleToggleTask(task.id, task.status)}
            onPress={() => setSelectedTask(task)}
          />
        ))}
        {tasks.length === 0 && <Text style={styles.emptyNote}>No tasks yet. Add one above.</Text>}
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <GitFork size={18} color={colors.text.secondary} strokeWidth={2.2} />
          <Text style={styles.sectionTitle}>Linked Repos ({repos.length})</Text>
        </View>
        {repos.length > 0 ? (
          repos.map((repo: any) => (
            <GlassCard key={repo.id} style={styles.repoRow}>
              <GitFork size={15} color={colors.accent.secondary} strokeWidth={2.4} />
              <Text style={styles.repoName}>{repo.full_name}</Text>
            </GlassCard>
          ))
        ) : (
          <Text style={styles.emptyNote}>No repos linked</Text>
        )}
      </View>

      <View style={[styles.section, { marginTop: spacing.md }]}>
        <Button
          title="Delete Project"
          variant="danger"
          onPress={handleDelete}
          icon={<Trash2 size={16} color={colors.accent.danger} strokeWidth={2.4} />}
        />
      </View>

      <TaskDetailModal
        task={selectedTask}
        isVisible={!!selectedTask}
        onClose={() => setSelectedTask(null)}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg.primary },
  content: {
    width: '100%',
    maxWidth: CONTENT_MAX_WIDTH,
    alignSelf: 'flex-start',
    padding: spacing.md,
    paddingBottom: spacing['3xl'],
  },
  headerCard: {
    borderRadius: radii.xl,
    marginBottom: spacing.lg,
    padding: spacing.sm + 2,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  titleIconWrap: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.accent.primaryMuted,
    borderWidth: 1,
    borderColor: colors.border.medium,
    alignItems: 'center',
    justifyContent: 'center',
  },
  projectName: { ...typography.heading, flex: 1, fontSize: 22, lineHeight: 28 },
  badges: { flexDirection: 'row', gap: spacing.xs + 2, marginTop: spacing.sm },
  section: { marginBottom: spacing.lg },
  sectionLabel: { ...typography.small, marginBottom: spacing.xs + 2 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.md },
  sectionTitle: { ...typography.subheading },
  chips: { flexDirection: 'row', gap: spacing.xs + 2 },
  chip: {
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: spacing.xs + 2,
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: colors.border.medium,
    backgroundColor: colors.surface.glassSoft,
  },
  chipText: { ...typography.small, fontWeight: '700', textTransform: 'none' },
  quickAdd: { flexDirection: 'row', alignItems: 'flex-end', marginBottom: spacing.md },
  repoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.sm + 2,
    borderRadius: radii.md,
    marginBottom: spacing.sm,
  },
  repoName: { ...typography.body, fontFamily: 'monospace', fontSize: 13 },
  emptyNote: { ...typography.caption, textAlign: 'center', paddingVertical: spacing.md },
});
