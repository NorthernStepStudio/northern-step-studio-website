import React, { useCallback, useMemo, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, useWindowDimensions } from 'react-native';
import { router } from 'expo-router';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { AlertTriangle, GitCommitHorizontal, GitFork, RefreshCcw } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useGitHubConnection, useRepos } from '../../../src/hooks/useGitHub';
import { Button } from '../../../src/components/ui/Button';
import { EmptyState } from '../../../src/components/ui/EmptyState';
import { LoadingSpinner } from '../../../src/components/ui/LoadingSpinner';
import { Badge } from '../../../src/components/ui/Badge';
import { GlassCard } from '../../../src/components/ui/GlassCard';
import { Input } from '../../../src/components/ui/Input';
import { colors, spacing, radii, typography } from '../../../src/theme';
import { timeAgo } from '../../../src/utils/date';
import { getTabBarReservedHeight } from '../../../src/utils/safeArea';

const CONTENT_MAX_WIDTH = 640;

export default function ReposScreen() {
  const { width } = useWindowDimensions();
  const tabBarHeight = useBottomTabBarHeight();
  const insets = useSafeAreaInsets();
  const { repos, loading, syncing, error, sync, refresh } = useRepos();
  const {
    connection,
    loading: connectionLoading,
    saving: tokenSaving,
    error: connectionError,
    refresh: refreshConnection,
    saveToken,
    clearToken,
  } = useGitHubConnection();

  const [tokenInput, setTokenInput] = useState('');
  const [tokenNotice, setTokenNotice] = useState<string | null>(null);
  const listBottomPadding = getTabBarReservedHeight(tabBarHeight, insets.bottom, width) + spacing.sm;

  const connectionMessage = useMemo(() => {
    if (connectionLoading) {
      return 'Checking GitHub connection...';
    }

    if (connection.connected) {
      const suffix = connection.tokenPreview ? ` (${connection.tokenPreview})` : '';
      return `Connected via ${connection.sourceLabel}${suffix}.`;
    }

    return 'Not connected. Add EXPO_PUBLIC_GITHUB_TOKEN or save a Personal Access Token below.';
  }, [connection, connectionLoading]);

  const handleSync = useCallback(async () => {
    setTokenNotice(null);
    await sync();
    await refreshConnection();
  }, [refreshConnection, sync]);

  const handleSaveToken = useCallback(async () => {
    const nextToken = tokenInput.trim();
    if (!nextToken) {
      setTokenNotice('Enter a Personal Access Token before saving.');
      return;
    }

    try {
      await saveToken(nextToken);
      setTokenInput('');
      setTokenNotice('Saved token to device storage. Syncing now...');
      await handleSync();
    } catch (error: unknown) {
      setTokenNotice(error instanceof Error ? error.message : 'Failed to save GitHub token.');
    }
  }, [handleSync, saveToken, tokenInput]);

  const handleClearToken = useCallback(async () => {
    try {
      await clearToken();
      setTokenNotice(
        connection.hasEnvToken
          ? 'Stored token cleared. Environment token is still active.'
          : 'Stored token cleared.',
      );
    } catch (error: unknown) {
      setTokenNotice(error instanceof Error ? error.message : 'Failed to clear stored token.');
    }
  }, [clearToken, connection.hasEnvToken]);

  if (loading && repos.length === 0 && connectionLoading) return <LoadingSpinner label="Loading repositories" />;

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <View style={styles.navButtons}>
          <TouchableOpacity style={styles.navBtn} onPress={() => router.push('/(tabs)/github/commits')}>
            <GitCommitHorizontal size={15} color={colors.accent.secondary} strokeWidth={2.4} />
            <Text style={styles.navBtnText}>Commits</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.navBtn} onPress={() => router.push('/(tabs)/github/issues')}>
            <AlertTriangle size={15} color={colors.accent.warning} strokeWidth={2.4} />
            <Text style={styles.navBtnText}>Issues</Text>
          </TouchableOpacity>
        </View>
        <Button
          title={syncing ? 'Syncing' : 'Sync'}
          variant="secondary"
          size="sm"
          onPress={handleSync}
          loading={syncing}
          icon={<RefreshCcw size={14} color={colors.text.primary} strokeWidth={2.4} />}
        />
      </View>

      <GlassCard style={styles.connectionCard}>
        <Text style={styles.connectionTitle}>GitHub Connection</Text>
        <Text style={styles.connectionText}>{connectionMessage}</Text>

        <Input
          label="Personal Access Token"
          value={tokenInput}
          onChangeText={setTokenInput}
          placeholder="github_pat_..."
          secureTextEntry
          autoCapitalize="none"
          style={styles.tokenInput}
        />

        <View style={styles.connectionButtons}>
          <Button
            title={connection.hasStoredToken ? 'Update token' : 'Save token'}
            variant="secondary"
            size="sm"
            onPress={handleSaveToken}
            loading={tokenSaving}
            style={styles.connectionButton}
          />
          <Button
            title="Clear"
            variant="danger"
            size="sm"
            onPress={handleClearToken}
            disabled={!connection.canClearStoredToken || tokenSaving}
            style={styles.connectionButton}
          />
        </View>

        {connection.hasEnvToken && (
          <Text style={styles.connectionHint}>
            Environment token detected. Saved token is used only when env token is not set.
          </Text>
        )}

        {tokenNotice && <Text style={styles.connectionNote}>{tokenNotice}</Text>}
        {connectionError && <Text style={styles.connectionError}>{connectionError}</Text>}
      </GlassCard>

      {error && (
        <GlassCard style={styles.errorBox}>
          <AlertTriangle size={16} color={colors.accent.danger} strokeWidth={2.2} />
          <Text style={styles.errorText}>{error}</Text>
        </GlassCard>
      )}

      <FlatList
        data={repos}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[styles.list, { paddingBottom: listBottomPadding }]}
        renderItem={({ item }) => (
          <GlassCard style={styles.repoCard}>
            <View style={styles.repoHeader}>
              <View style={styles.repoIconWrap}>
                <GitFork size={16} color={colors.accent.secondary} strokeWidth={2.4} />
              </View>
              <Text style={styles.repoName} numberOfLines={1}>
                {item.full_name}
              </Text>
            </View>
            <View style={styles.repoMeta}>
              {item.open_issues_count > 0 ? (
                <Badge label={`${item.open_issues_count} issues`} color={colors.accent.warning} />
              ) : (
                <Badge label="clean" color={colors.accent.success} />
              )}
              <Text style={styles.repoTime}>
                {item.last_commit_date ? `Last push ${timeAgo(item.last_commit_date)}` : 'No commits'}
              </Text>
            </View>
          </GlassCard>
        )}
        ListEmptyComponent={
          <EmptyState
            icon="logo-github"
            title="No repos loaded"
            subtitle={
              connection.connected
                ? 'Tap Sync to fetch your repositories.'
                : 'Add a GitHub token above, then tap Sync.'
            }
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
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    maxWidth: CONTENT_MAX_WIDTH,
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
  },
  navButtons: { flexDirection: 'row', gap: spacing.sm },
  navBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: spacing.xs + 2,
    borderRadius: radii.sm,
    backgroundColor: colors.surface.glassSoft,
    borderWidth: 1,
    borderColor: colors.border.subtle,
  },
  navBtnText: {
    ...typography.small,
    fontWeight: '700',
    textTransform: 'none',
  },
  connectionCard: {
    width: '100%',
    maxWidth: CONTENT_MAX_WIDTH,
    alignSelf: 'flex-start',
    marginHorizontal: 0,
    marginBottom: spacing.md,
    padding: spacing.sm + 2,
    borderRadius: radii.lg,
  },
  connectionTitle: {
    ...typography.caption,
    color: colors.text.primary,
    fontWeight: '700',
    marginBottom: spacing.xs,
    textTransform: 'none',
  },
  connectionText: {
    ...typography.caption,
    color: colors.text.secondary,
    marginBottom: spacing.sm,
    textTransform: 'none',
  },
  tokenInput: {
    marginBottom: spacing.sm,
  },
  connectionButtons: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  connectionButton: {
    flex: 1,
  },
  connectionHint: {
    ...typography.small,
    color: colors.text.muted,
    marginTop: spacing.sm,
    textTransform: 'none',
  },
  connectionNote: {
    ...typography.small,
    color: colors.accent.secondary,
    marginTop: spacing.sm,
    textTransform: 'none',
  },
  connectionError: {
    ...typography.small,
    color: colors.accent.danger,
    marginTop: spacing.xs,
    textTransform: 'none',
  },
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
    marginBottom: spacing.md,
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
  repoCard: {
    borderRadius: radii.lg,
    padding: spacing.sm,
    marginBottom: spacing.xs + 2,
  },
  repoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  repoIconWrap: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.accent.secondaryMuted,
    borderWidth: 1,
    borderColor: colors.border.medium,
  },
  repoName: {
    ...typography.body,
    fontWeight: '600',
    fontFamily: 'monospace',
    fontSize: 12,
    flex: 1,
  },
  repoMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.sm,
  },
  repoTime: {
    ...typography.small,
    textTransform: 'none',
    marginLeft: spacing.sm,
  },
});
