import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { GitCommitHorizontal, TimerReset } from 'lucide-react-native';
import { colors, spacing, radii, typography } from '../../theme';
import { timeAgo } from '../../utils/date';
import type { Commit } from '../../types';
import { GlassCard } from '../ui/GlassCard';

interface CommitCardProps {
  commit: Commit & { repo_name?: string };
}

export function CommitCard({ commit }: CommitCardProps) {
  const shortSha = typeof commit.sha === 'string' && commit.sha
    ? commit.sha.slice(0, 7)
    : 'unknown';
  const firstLine = typeof commit.message === 'string' && commit.message
    ? commit.message.split('\n')[0]
    : '(no commit message)';
  const committedAt = typeof commit.committed_at === 'string' && commit.committed_at
    ? commit.committed_at
    : new Date(0).toISOString();

  return (
    <GlassCard style={styles.card}>
      <View style={styles.iconWrap}>
        <GitCommitHorizontal size={16} color={colors.accent.secondary} strokeWidth={2} />
      </View>
      <View style={styles.body}>
        <Text style={styles.message} numberOfLines={1}>
          {firstLine}
        </Text>
        <View style={styles.meta}>
          <Text style={styles.sha}>{shortSha}</Text>
          {commit.repo_name && (
            <>
              <Text style={styles.dot}>·</Text>
              <Text style={styles.repo}>{commit.repo_name}</Text>
            </>
          )}
          <Text style={styles.dot}>·</Text>
          <View style={styles.timeWrap}>
            <TimerReset size={12} color={colors.text.muted} strokeWidth={2} />
            <Text style={styles.time}>{timeAgo(committedAt)}</Text>
          </View>
        </View>
      </View>
    </GlassCard>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    borderRadius: radii.lg,
    marginBottom: spacing.xs + 2,
  },
  iconWrap: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: colors.accent.secondaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  body: {
    flex: 1,
  },
  message: {
    ...typography.body,
    fontWeight: '500',
    fontSize: 13,
    lineHeight: 17,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
    gap: 4,
  },
  sha: {
    ...typography.small,
    fontFamily: 'monospace',
    color: colors.accent.primary,
    textTransform: 'none',
  },
  dot: {
    ...typography.small,
    color: colors.text.muted,
    textTransform: 'none',
  },
  repo: {
    ...typography.small,
    color: colors.text.secondary,
    textTransform: 'none',
  },
  time: {
    ...typography.small,
    textTransform: 'none',
  },
  timeWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
});

