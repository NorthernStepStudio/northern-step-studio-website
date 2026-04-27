import React from 'react';
import { View, FlatList, StyleSheet, useWindowDimensions, TouchableOpacity, Platform } from 'react-native';
import { router } from 'expo-router';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Plus } from 'lucide-react-native';
import { useProjects } from '../../../src/hooks/useProjects';
import { ProjectCard } from '../../../src/components/cards/ProjectCard';
import { EmptyState } from '../../../src/components/ui/EmptyState';
import { LoadingSpinner } from '../../../src/components/ui/LoadingSpinner';
import { colors, spacing } from '../../../src/theme';
import { getTabBarReservedHeight } from '../../../src/utils/safeArea';

const FAB_SIZE = 44;
const FAB_ICON_SIZE = 16;
const FAB_HIT_SLOP = 8;
const FAB_GAP_FROM_TAB = spacing.sm;
const CONTENT_MAX_WIDTH = 640;

export default function ProjectsListScreen() {
  const { projects, loading, refresh } = useProjects();
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const tabBarHeight = useBottomTabBarHeight();
  const numColumns = width > 740 ? 2 : 1;
  const effectiveTabBarHeight = getTabBarReservedHeight(tabBarHeight, insets.bottom, width);
  const fabBottom = effectiveTabBarHeight + FAB_GAP_FROM_TAB;
  const listBottomPadding = effectiveTabBarHeight + FAB_SIZE + spacing.md;

  if (loading && projects.length === 0) return <LoadingSpinner label="Loading projects" />;

  return (
    <View style={styles.container}>
      <FlatList
        key={numColumns}
        data={projects}
        numColumns={numColumns}
        contentContainerStyle={[styles.list, { paddingBottom: listBottomPadding }]}
        columnWrapperStyle={numColumns > 1 ? styles.row : undefined}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={[styles.cardWrap, numColumns > 1 && { flex: 1, maxWidth: '50%' }]}>
            <ProjectCard project={item} onPress={() => router.push(`/(tabs)/projects/${item.id}`)} />
          </View>
        )}
        ListEmptyComponent={
          <EmptyState
            icon="folder-open-outline"
            title="No projects yet"
            subtitle="Create your first project to get started"
          />
        }
        refreshing={loading}
        onRefresh={refresh}
      />

      <TouchableOpacity
        style={[styles.fab, { bottom: fabBottom }]}
        onPress={() => router.push('/(tabs)/projects/new')}
        activeOpacity={0.86}
        hitSlop={{ top: FAB_HIT_SLOP, bottom: FAB_HIT_SLOP, left: FAB_HIT_SLOP, right: FAB_HIT_SLOP }}
      >
        <Plus size={FAB_ICON_SIZE} color="#FFFFFF" strokeWidth={2.6} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg.primary,
  },
  list: {
    width: '100%',
    maxWidth: CONTENT_MAX_WIDTH,
    alignSelf: 'flex-start',
    padding: spacing.md,
  },
  row: {
    gap: spacing.sm,
  },
  cardWrap: {
    marginBottom: spacing.sm + 2,
  },
  fab: {
    position: 'absolute',
    right: spacing.md,
    width: FAB_SIZE,
    height: FAB_SIZE,
    borderRadius: FAB_SIZE / 2,
    backgroundColor: colors.accent.primary,
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
  },
});
