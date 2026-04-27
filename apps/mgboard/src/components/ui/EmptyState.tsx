import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import {
  AlertTriangle,
  CheckCircle2,
  FolderOpen,
  GitCommit,
  GitFork,
  Lightbulb,
  Package,
  type LucideIcon,
} from 'lucide-react-native';
import { colors, spacing, typography, radii } from '../../theme';
import { GlassCard } from './GlassCard';

interface EmptyStateProps {
  icon?:
    | 'cube-outline'
    | 'folder-open-outline'
    | 'logo-github'
    | 'bulb-outline'
    | 'checkmark-circle-outline'
    | 'alert-circle-outline'
    | 'git-commit-outline';
  title: string;
  subtitle?: string;
}

export function EmptyState({ icon = 'cube-outline', title, subtitle }: EmptyStateProps) {
  const Icon = iconMap[icon] ?? Package;

  return (
    <GlassCard style={styles.container}>
      <View style={styles.iconWrap}>
        <Icon size={26} color={colors.accent.secondary} strokeWidth={2} />
      </View>
      <Text style={styles.title}>{title}</Text>
      {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
    </GlassCard>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    maxWidth: 460,
    alignSelf: 'flex-start',
    alignItems: 'flex-start',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm + 2,
    borderRadius: radii.lg,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.accent.secondaryMuted,
    borderWidth: 1,
    borderColor: colors.border.medium,
  },
  title: {
    ...typography.body,
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '600',
    color: colors.text.primary,
    marginTop: spacing.sm,
    textAlign: 'left',
  },
  subtitle: {
    ...typography.caption,
    marginTop: spacing.xs + 2,
    textAlign: 'left',
  },
});

const iconMap: Record<string, LucideIcon> = {
  'cube-outline': Package,
  'folder-open-outline': FolderOpen,
  'logo-github': GitFork,
  'bulb-outline': Lightbulb,
  'checkmark-circle-outline': CheckCircle2,
  'alert-circle-outline': AlertTriangle,
  'git-commit-outline': GitCommit,
};
