import React, { useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Modal, Platform, useWindowDimensions } from 'react-native';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ListFilter, Plus } from 'lucide-react-native';
import { useIdeas } from '../../src/hooks/useIdeas';
import { IdeaCard } from '../../src/components/cards/IdeaCard';
import { IdeaForm } from '../../src/components/forms/IdeaForm';
import { EmptyState } from '../../src/components/ui/EmptyState';
import { LoadingSpinner } from '../../src/components/ui/LoadingSpinner';
import { colors, spacing, radii, typography } from '../../src/theme';
import { getTabBarReservedHeight } from '../../src/utils/safeArea';
import type { IdeaCreate, IdeaTag } from '../../src/types';

const TAGS: (IdeaTag | 'all')[] = ['all', 'now', 'later', 'maybe'];
const FAB_SIZE = 44;
const FAB_ICON_SIZE = 16;
const FAB_HIT_SLOP = 8;
const FAB_GAP_FROM_TAB = spacing.sm;
const CONTENT_MAX_WIDTH = 640;

export default function IdeasScreen() {
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const { ideas, loading, refresh, create } = useIdeas();
  const [showForm, setShowForm] = useState(false);
  const [filterTag, setFilterTag] = useState<IdeaTag | 'all'>('all');
  const tabBarHeight = useBottomTabBarHeight();
  const effectiveTabBarHeight = getTabBarReservedHeight(tabBarHeight, insets.bottom, width);
  const fabBottom = effectiveTabBarHeight + FAB_GAP_FROM_TAB;
  const listBottomPadding = effectiveTabBarHeight + FAB_SIZE + spacing.md;

  const filtered = filterTag === 'all' ? ideas : ideas.filter((i) => i.tag === filterTag);

  const handleCreate = async (data: IdeaCreate) => {
    await create(data);
    setShowForm(false);
  };

  if (loading && ideas.length === 0) return <LoadingSpinner label="Loading ideas" />;

  return (
    <View style={styles.container}>
      <View style={styles.filterBar}>
        <View style={styles.filterLabelWrap}>
          <ListFilter size={14} color={colors.text.muted} strokeWidth={2.4} />
          <Text style={styles.filterLabel}>Tag</Text>
        </View>
        <View style={styles.filterChips}>
          {TAGS.map((t) => (
            <TouchableOpacity
              key={t}
              style={[styles.filterChip, filterTag === t && styles.filterChipActive]}
              onPress={() => setFilterTag(t)}
            >
              <Text style={[styles.filterText, filterTag === t && styles.filterTextActive]}>
                {t === 'all' ? 'All' : t.charAt(0).toUpperCase() + t.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[styles.list, { paddingBottom: listBottomPadding }]}
        renderItem={({ item }) => <IdeaCard idea={item} />}
        ListEmptyComponent={
          <EmptyState icon="bulb-outline" title="No ideas yet" subtitle="Capture your ideas before they disappear" />
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
            <Text style={styles.modalTitle}>New Idea</Text>
          </View>
          <IdeaForm onSubmit={handleCreate} onCancel={() => setShowForm(false)} />
        </View>
      </Modal>
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
    gap: spacing.xs + 2,
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
    backgroundColor: colors.accent.warningMuted,
    borderColor: colors.accent.warning,
  },
  filterText: {
    ...typography.small,
    color: colors.text.secondary,
    textTransform: 'none',
  },
  filterTextActive: {
    color: colors.accent.warning,
  },
  list: {
    width: '100%',
    maxWidth: CONTENT_MAX_WIDTH,
    alignSelf: 'flex-start',
    padding: spacing.md,
    paddingTop: 0,
  },
  fab: {
    position: 'absolute',
    right: spacing.md,
    width: FAB_SIZE,
    height: FAB_SIZE,
    borderRadius: FAB_SIZE / 2,
    backgroundColor: colors.accent.warning,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border.medium,
    ...Platform.select({
      web: { boxShadow: '0 10px 28px rgba(245, 158, 11, 0.28)' },
      default: {
        shadowColor: colors.accent.warning,
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
  modalTitle: { ...typography.heading },
});
