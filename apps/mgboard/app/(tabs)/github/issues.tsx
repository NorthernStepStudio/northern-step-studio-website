import React from 'react';
import { View, Text, FlatList, StyleSheet, Linking, TouchableOpacity, useWindowDimensions } from 'react-native';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { AlertCircle, AlertTriangle, ArrowUpRight } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useIssues } from '../../../src/hooks/useGitHub';
import { Badge } from '../../../src/components/ui/Badge';
import { EmptyState } from '../../../src/components/ui/EmptyState';
import { LoadingSpinner } from '../../../src/components/ui/LoadingSpinner';
import { GlassCard } from '../../../src/components/ui/GlassCard';
import { colors, spacing, radii, typography } from '../../../src/theme';
import { timeAgo } from '../../../src/utils/date';
import { getTabBarReservedHeight } from '../../../src/utils/safeArea';

const CONTENT_MAX_WIDTH = 640;

export default function IssuesScreen() {
  const { width } = useWindowDimensions();
  const tabBarHeight = useBottomTabBarHeight();
  const insets = useSafeAreaInsets();
  const { issues, loading, error, refresh } = useIssues();
  const listBottomPadding = getTabBarReservedHeight(tabBarHeight, insets.bottom, width) + spacing.sm;

  if (loading && issues.length === 0) return <LoadingSpinner label="Loading issues" />;

  return (
    <View style={styles.container}>
      {error && (
        <GlassCard style={styles.errorBox}>
          <AlertTriangle size={16} color={colors.accent.danger} strokeWidth={2.2} />
          <Text style={styles.errorText}>{error}</Text>
        </GlassCard>
      )}

      <FlatList
        data={issues}
        keyExtractor={(item, index) => String(item.id || `${item.repository_url}-${item.number}-${index}`)}
        contentContainerStyle={[styles.list, { paddingBottom: listBottomPadding }]}
        renderItem={({ item }) => {
          const repoName = item.repository_url
            ? item.repository_url.split('/').slice(-2).join('/')
            : 'unknown/repo';
          const labels = Array.isArray(item.labels) ? item.labels : [];
          const title = item.title?.trim() ? item.title : '(untitled issue)';

          const onPress = () => {
            if (item.html_url) {
              void Linking.openURL(item.html_url).catch(() => {});
            }
          };

          return (
            <TouchableOpacity onPress={onPress} activeOpacity={0.85}>
              <GlassCard style={styles.issueCard}>
                <View style={styles.issueIcon}>
                  <AlertCircle size={18} color={colors.accent.warning} strokeWidth={2.2} />
                </View>
                <View style={styles.issueBody}>
                  <View style={styles.titleRow}>
                    <Text style={styles.issueTitle} numberOfLines={2}>
                      {title}
                    </Text>
                    <ArrowUpRight size={14} color={colors.text.muted} strokeWidth={2.2} />
                  </View>
                  <View style={styles.issueMeta}>
                    <Text style={styles.issueRepo}>{repoName}</Text>
                    <Text style={styles.issueDot}>|</Text>
                    <Text style={styles.issueNumber}>#{item.number}</Text>
                    <Text style={styles.issueDot}>|</Text>
                    <Text style={styles.issueTime}>{timeAgo(item.updated_at)}</Text>
                  </View>
                  {labels.length > 0 && (
                    <View style={styles.labels}>
                      {labels.slice(0, 3).map((label, idx) => (
                        <Badge key={`${label.name}-${idx}`} label={label.name} color={`#${label.color}`} />
                      ))}
                    </View>
                  )}
                </View>
              </GlassCard>
            </TouchableOpacity>
          );
        }}
        ListEmptyComponent={
          <EmptyState
            icon="checkmark-circle-outline"
            title="No open issues"
            subtitle="Looking good. No open issues across your repos."
          />
        }
        refreshing={loading}
        onRefresh={refresh}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg.primary },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    borderColor: colors.accent.danger,
    backgroundColor: colors.accent.dangerMuted,
    padding: spacing.sm + 2,
    borderRadius: radii.md,
    width: '100%',
    maxWidth: CONTENT_MAX_WIDTH,
    alignSelf: 'flex-start',
    marginHorizontal: 0,
    marginBottom: spacing.sm,
    marginTop: spacing.md,
  },
  errorText: { ...typography.caption, color: colors.accent.danger, flex: 1 },
  list: {
    width: '100%',
    maxWidth: CONTENT_MAX_WIDTH,
    alignSelf: 'flex-start',
    padding: spacing.md,
    paddingTop: 0,
    paddingBottom: spacing['3xl'],
  },
  issueCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderRadius: radii.lg,
    padding: spacing.sm,
    marginBottom: spacing.xs + 2,
  },
  issueIcon: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: colors.accent.warningMuted,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  issueBody: { flex: 1 },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  issueTitle: {
    ...typography.body,
    fontWeight: '500',
    fontSize: 13,
    lineHeight: 17,
    flex: 1,
  },
  issueMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
    gap: 4,
  },
  issueRepo: {
    ...typography.small,
    color: colors.accent.secondary,
    textTransform: 'none',
    fontFamily: 'monospace',
  },
  issueDot: { color: colors.text.muted, fontSize: 11 },
  issueNumber: { ...typography.small, color: colors.text.muted, textTransform: 'none' },
  issueTime: { ...typography.small, textTransform: 'none' },
  labels: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginTop: spacing.xs + 2,
  },
});
