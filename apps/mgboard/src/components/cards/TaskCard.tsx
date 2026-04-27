import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { CheckCircle2, Circle, CircleDotDashed, Clock3 } from 'lucide-react-native';
import { colors, spacing, radii, typography } from '../../theme';
import { getPriorityColor } from '../../utils/status';
import { shortDate } from '../../utils/date';
import type { Task, TaskStatus } from '../../types';
import { GlassCard } from '../ui/GlassCard';
import { Badge } from '../ui/Badge';

interface TaskCardProps {
  task: Task;
  onPress?: () => void;
  onToggleStatus?: () => void;
}

const statusColors: Partial<Record<TaskStatus, string>> = {
  todo: colors.text.muted,
  ready: colors.accent.secondary,
  in_progress: colors.accent.secondary,
  doing: colors.accent.secondary,
  done: colors.accent.success,
  blocked: colors.accent.danger,
  needs_clarification: colors.accent.warning,
  needs_review: colors.accent.warning,
  failed: colors.accent.danger,
};

export function TaskCard({ task, onToggleStatus, onPress }: TaskCardProps) {
  const priorityColor = getPriorityColor(task.priority);
  const isDone = task.status === 'done';

  const CardContainer = onPress ? TouchableOpacity : View;
  const CheckContainer = onToggleStatus ? TouchableOpacity : View;

  return (
    <CardContainer
      onPress={onPress}
      activeOpacity={0.72}
      style={[styles.wrapper, onPress ? styles.wrapperClickable : null]}
    >
      <GlassCard style={styles.card}>
        <CheckContainer onPress={onToggleStatus} style={styles.checkArea}>
          {task.status === 'done' ? (
            <CheckCircle2 size={18} color={statusColors.done ?? colors.accent.success} strokeWidth={2} />
          ) : task.status === 'doing' || task.status === 'in_progress' ? (
            <CircleDotDashed size={18} color={statusColors.in_progress ?? colors.accent.secondary} strokeWidth={2} />
          ) : (
            <Circle size={18} color={statusColors[task.status] ?? colors.text.muted} strokeWidth={2} />
          )}
        </CheckContainer>

        <View style={styles.body}>
          <Text style={[styles.title, isDone && styles.done]} numberOfLines={1}>
            {task.title}
          </Text>
          <View style={styles.meta}>
            {task.project_name && (
              <Text style={styles.project} numberOfLines={1}>
                {task.project_name}
              </Text>
            )}
            {task.due_date && (
              <View style={styles.dateWrap}>
                <Clock3 size={12} color={colors.text.muted} strokeWidth={2} />
                <Text style={styles.date}>{shortDate(task.due_date)}</Text>
              </View>
            )}
          </View>
        </View>

        <Badge
          label={task.priority}
          color={priorityColor}
          style={styles.priorityBadge}
        />
      </GlassCard>
    </CardContainer>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginHorizontal: spacing.sm,
  },
  wrapperClickable: {
    cursor: 'pointer',
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: radii.xl,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    marginBottom: spacing.xs + 2,
  },
  checkArea: {
    marginRight: spacing.xs + 2,
  },
  body: {
    flex: 1,
  },
  title: {
    ...typography.body,
    fontWeight: '500',
    fontSize: 13,
    lineHeight: 17,
  },
  done: {
    textDecorationLine: 'line-through',
    color: colors.text.muted,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
    gap: spacing.xs,
  },
  project: {
    ...typography.small,
    color: colors.accent.secondary,
    maxWidth: 132,
    textTransform: 'none',
  },
  dateWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  date: {
    ...typography.small,
    textTransform: 'none',
  },
  priorityBadge: {
    marginLeft: spacing.sm,
    alignSelf: 'center',
  },
});
