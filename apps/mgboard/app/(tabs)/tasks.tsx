import React, { useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Modal, Platform, useWindowDimensions } from 'react-native';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ListFilter, Plus } from 'lucide-react-native';
import { useTasks } from '../../src/hooks/useTasks';
import { useProjects } from '../../src/hooks/useProjects';
import { TaskCard } from '../../src/components/cards/TaskCard';
import { TaskForm } from '../../src/components/forms/TaskForm';
import { EmptyState } from '../../src/components/ui/EmptyState';
import { LoadingSpinner } from '../../src/components/ui/LoadingSpinner';
import { GlassCard } from '../../src/components/ui/GlassCard';
import * as TaskService from '../../src/services/tasks';
import { colors, spacing, radii, typography } from '../../src/theme';
import { getTaskStatusLabel } from '../../src/utils/status';
import { getTabBarReservedHeight } from '../../src/utils/safeArea';
import { TaskDetailModal } from '../../src/components/modals/TaskDetailModal';
import type { Task, TaskCreate, TaskStatus } from '../../src/types';

const FAB_SIZE = 44;
const FAB_ICON_SIZE = 16;
const FAB_HIT_SLOP = 8;
const FAB_GAP_FROM_TAB = spacing.sm;
const CONTENT_MAX_WIDTH = 640;

export default function TasksScreen() {
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const [filterProjectId, setFilterProjectId] = useState<string | undefined>();
  const { tasks, loading, refresh, create } = useTasks(filterProjectId);
  const { projects } = useProjects();
  const [showForm, setShowForm] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const tabBarHeight = useBottomTabBarHeight();
  const effectiveTabBarHeight = getTabBarReservedHeight(tabBarHeight, insets.bottom, width);
  const fabBottom = effectiveTabBarHeight + FAB_GAP_FROM_TAB;
  const listBottomPadding = effectiveTabBarHeight + FAB_SIZE + spacing.md;

  const handleToggle = async (taskId: string, currentStatus: TaskStatus) => {
    const nextStatus: TaskStatus =
      currentStatus === 'done'
        ? 'todo'
        : currentStatus === 'in_progress' || currentStatus === 'doing'
          ? 'done'
          : 'in_progress';
    await TaskService.updateTask(taskId, { status: nextStatus });
    refresh();
  };

  const handleCreate = async (data: TaskCreate) => {
    await create(data);
    setShowForm(false);
  };

  const grouped = {
    in_progress: tasks.filter((t) => t.status === 'in_progress' || t.status === 'doing'),
    ready: tasks.filter((t) => t.status === 'ready'),
    todo: tasks.filter((t) => t.status === 'todo'),
    needs_review: tasks.filter((t) => t.status === 'needs_review'),
    blocked: tasks.filter((t) => t.status === 'blocked' || t.status === 'needs_clarification'),
    failed: tasks.filter((t) => t.status === 'failed'),
    done: tasks.filter((t) => t.status === 'done'),
  };

  if (loading && tasks.length === 0) return <LoadingSpinner label="Loading tasks" />;

  return (
    <View style={styles.container}>
      <View style={styles.filterBar}>
        <View style={styles.filterLabelWrap}>
          <ListFilter size={14} color={colors.text.muted} strokeWidth={2.4} />
          <Text style={styles.filterLabel}>Filter</Text>
        </View>
        <View style={styles.filterChips}>
          <TouchableOpacity
            style={[styles.filterChip, !filterProjectId && styles.filterChipActive]}
            onPress={() => setFilterProjectId(undefined)}
          >
            <Text style={[styles.filterText, !filterProjectId && styles.filterTextActive]}>All</Text>
          </TouchableOpacity>
          {projects.map((p) => (
            <TouchableOpacity
              key={p.id}
              style={[styles.filterChip, filterProjectId === p.id && styles.filterChipActive]}
              onPress={() => setFilterProjectId(filterProjectId === p.id ? undefined : p.id)}
            >
              <Text style={[styles.filterText, filterProjectId === p.id && styles.filterTextActive]} numberOfLines={1}>
                {p.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <FlatList
        data={[
          ...(grouped.in_progress.length
            ? [{ kind: 'header', label: `${getTaskStatusLabel('in_progress')} (${grouped.in_progress.length})` }]
            : []),
          ...grouped.in_progress.map((task) => ({ kind: 'task' as const, task })),
          ...(grouped.ready.length
            ? [{ kind: 'header', label: `${getTaskStatusLabel('ready')} (${grouped.ready.length})` }]
            : []),
          ...grouped.ready.map((task) => ({ kind: 'task' as const, task })),
          ...(grouped.todo.length ? [{ kind: 'header', label: `To Do (${grouped.todo.length})` }] : []),
          ...grouped.todo.map((task) => ({ kind: 'task' as const, task })),
          ...(grouped.needs_review.length
            ? [{ kind: 'header', label: `${getTaskStatusLabel('needs_review')} (${grouped.needs_review.length})` }]
            : []),
          ...grouped.needs_review.map((task) => ({ kind: 'task' as const, task })),
          ...(grouped.blocked.length
            ? [{ kind: 'header', label: `${getTaskStatusLabel('blocked')} (${grouped.blocked.length})` }]
            : []),
          ...grouped.blocked.map((task) => ({ kind: 'task' as const, task })),
          ...(grouped.failed.length
            ? [{ kind: 'header', label: `${getTaskStatusLabel('failed')} (${grouped.failed.length})` }]
            : []),
          ...grouped.failed.map((task) => ({ kind: 'task' as const, task })),
          ...(grouped.done.length ? [{ kind: 'header', label: `Done (${grouped.done.length})` }] : []),
          ...grouped.done.map((task) => ({ kind: 'task' as const, task })),
        ] as any[]}
        keyExtractor={(item, i) => item.task?.id ?? `header-${i}`}
        contentContainerStyle={[styles.list, { paddingBottom: listBottomPadding }]}
        renderItem={({ item }) => {
          if (item.kind === 'header') {
            return (
              <GlassCard style={styles.groupHeaderCard}>
                <Text style={styles.groupHeader}>{item.label}</Text>
              </GlassCard>
            );
          }
          return (
            <TaskCard 
              task={item.task} 
              onToggleStatus={() => handleToggle(item.task.id, item.task.status)} 
              onPress={() => setSelectedTask(item.task)}
            />
          );
        }}
        ListEmptyComponent={
          <EmptyState icon="checkmark-circle-outline" title="No tasks" subtitle="Create a task to start tracking your work" />
        }
        refreshing={loading}
        onRefresh={refresh}
      />

      <TouchableOpacity
        style={[styles.fab, { bottom: fabBottom }]}
        onPress={() => setShowForm(true)}
        activeOpacity={0.86}
        hitSlop={{ top: FAB_HIT_SLOP, bottom: FAB_HIT_SLOP, left: FAB_HIT_SLOP, right: FAB_HIT_SLOP }}
      >
        <Plus size={FAB_ICON_SIZE} color="#FFFFFF" strokeWidth={2.6} />
      </TouchableOpacity>

      <Modal visible={showForm} animationType="slide" presentationStyle="pageSheet">
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>New Task</Text>
          </View>
          <TaskForm
            projects={projects}
            projectId={filterProjectId}
            onSubmit={handleCreate}
            onCancel={() => setShowForm(false)}
          />
        </View>
      </Modal>

      <TaskDetailModal
        task={selectedTask}
        isVisible={!!selectedTask}
        onClose={() => setSelectedTask(null)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg.primary },
  filterBar: {
    width: '100%',
    maxWidth: CONTENT_MAX_WIDTH,
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  filterLabelWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  filterLabel: {
    ...typography.small,
  },
  filterChips: {
    flexDirection: 'row',
    gap: spacing.sm,
    flexWrap: 'wrap',
  },
  filterChip: {
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: spacing.xs + 2,
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: colors.border.medium,
    backgroundColor: colors.surface.glassSoft,
  },
  filterChipActive: {
    backgroundColor: colors.accent.primaryMuted,
    borderColor: colors.accent.primary,
  },
  filterText: {
    ...typography.small,
    maxWidth: 140,
    textTransform: 'none',
  },
  filterTextActive: {
    color: colors.accent.primary,
  },
  list: {
    width: '100%',
    maxWidth: CONTENT_MAX_WIDTH,
    alignSelf: 'flex-start',
    padding: spacing.md,
    paddingTop: 0,
  },
  groupHeaderCard: {
    borderRadius: radii.md,
    marginTop: spacing.sm,
    marginBottom: spacing.sm,
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: spacing.xs + 2,
  },
  groupHeader: {
    ...typography.small,
    color: colors.text.secondary,
  },
  fab: {
    position: 'absolute',
    right: spacing.md,
    width: FAB_SIZE,
    height: FAB_SIZE,
    borderRadius: FAB_SIZE / 2,
    backgroundColor: colors.accent.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border.medium,
    ...Platform.select({
      web: { boxShadow: '0 10px 28px rgba(46, 168, 255, 0.28)' },
      default: {
        shadowColor: colors.accent.secondary,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.28,
        shadowRadius: 16,
        elevation: 10,
      },
    }),
    zIndex: 30,
  } as any,
  modalContainer: { flex: 1, backgroundColor: colors.bg.primary },
  modalHeader: {
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.subtle,
  },
  modalTitle: { ...typography.heading, flex: 1 },
  closeButton: { ...typography.body, color: colors.accent.primary },
  detailContent: { padding: spacing.md },
  detailTitle: { ...typography.heading, marginBottom: spacing.sm },
  detailStatus: { ...typography.body, marginBottom: spacing.xs },
  detailPriority: { ...typography.body, marginBottom: spacing.xs },
  detailDescription: { ...typography.body, marginTop: spacing.md, color: colors.text.secondary },
  detailAcceptance: { ...typography.small, marginTop: spacing.md, fontStyle: 'italic' },
});
