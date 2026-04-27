import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { ArrowRightCircle, FolderGit2 } from 'lucide-react-native';
import { colors, spacing, radii, typography } from '../../theme';
import { Badge } from '../ui/Badge';
import { GlassCard } from '../ui/GlassCard';
import { getStatusColor, getStatusLabel, getPriorityColor } from '../../utils/status';
import type { Project } from '../../types';

interface ProjectCardProps {
  project: Project;
  onPress: () => void;
}

export function ProjectCard({ project, onPress }: ProjectCardProps) {
  const statusColor = getStatusColor(project.status);
  const priorityColor = getPriorityColor(project.priority);

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.82}>
      <GlassCard style={styles.card}>
        <View style={styles.header}>
          <View style={styles.titleWrap}>
            <View style={styles.iconWrap}>
              <FolderGit2 size={14} color={colors.accent.secondary} strokeWidth={2} />
            </View>
            <Text style={styles.name} numberOfLines={1}>
              {project.name}
            </Text>
          </View>
          <View style={[styles.priorityDot, { backgroundColor: priorityColor }]} />
        </View>

        <View style={styles.badges}>
          <Badge label={getStatusLabel(project.status)} color={statusColor} />
          <Badge
            label={`P${project.priority === 'high' ? '1' : project.priority === 'medium' ? '2' : '3'}`}
            color={priorityColor}
          />
        </View>

        {project.next_action && (
          <View style={styles.nextAction}>
            <ArrowRightCircle size={12} color={colors.text.muted} strokeWidth={2} />
            <Text style={styles.nextActionText} numberOfLines={1}>
              {project.next_action}
            </Text>
          </View>
        )}
      </GlassCard>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: spacing.sm,
    borderRadius: radii.xl,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  titleWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconWrap: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.accent.secondaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border.medium,
    marginRight: spacing.xs + 2,
  },
  name: {
    ...typography.body,
    fontSize: 13,
    lineHeight: 17,
    fontWeight: '600',
    flex: 1,
    marginRight: spacing.xs + 2,
  },
  priorityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: colors.border.strong,
  },
  badges: {
    flexDirection: 'row',
    gap: spacing.xs + 2,
    marginTop: spacing.xs + 2,
  },
  nextAction: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.xs + 2,
    gap: spacing.xs,
  },
  nextActionText: {
    ...typography.caption,
    flex: 1,
  },
});
