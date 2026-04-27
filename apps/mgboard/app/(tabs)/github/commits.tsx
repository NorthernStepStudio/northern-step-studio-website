import React from 'react';
import { View, FlatList, StyleSheet, Text, useWindowDimensions } from 'react-native';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { AlertTriangle } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useCommits } from '../../../src/hooks/useGitHub';
import { CommitCard } from '../../../src/components/cards/CommitCard';
import { EmptyState } from '../../../src/components/ui/EmptyState';
import { LoadingSpinner } from '../../../src/components/ui/LoadingSpinner';
import { GlassCard } from '../../../src/components/ui/GlassCard';
import { colors, spacing, radii, typography } from '../../../src/theme';
import { getTabBarReservedHeight } from '../../../src/utils/safeArea';

const CONTENT_MAX_WIDTH = 640;

export default function CommitsScreen() {
  const { width } = useWindowDimensions();
  const tabBarHeight = useBottomTabBarHeight();
  const insets = useSafeAreaInsets();
  const { commits, loading, error, refresh } = useCommits();
  const listBottomPadding = getTabBarReservedHeight(tabBarHeight, insets.bottom, width) + spacing.sm;

  if (loading && commits.length === 0) return <LoadingSpinner label="Loading commits" />;

  return (
    <View style={styles.container}>
      {error && (
        <GlassCard style={styles.errorBox}>
          <AlertTriangle size={16} color={colors.accent.danger} strokeWidth={2.2} />
          <Text style={styles.errorText}>{error}</Text>
        </GlassCard>
      )}

      <FlatList
        data={commits}
        keyExtractor={(item, index) => item.id ?? item.sha ?? `commit-${index}`}
        contentContainerStyle={[styles.list, { paddingBottom: listBottomPadding }]}
        renderItem={({ item }) => <CommitCard commit={item} />}
        ListEmptyComponent={
          <EmptyState
            icon="git-commit-outline"
            title="No commits yet"
            subtitle="Sync your repos first, then sync commits"
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
});
