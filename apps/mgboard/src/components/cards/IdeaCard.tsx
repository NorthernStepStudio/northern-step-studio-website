import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Lightbulb, Sparkles } from 'lucide-react-native';
import { colors, spacing, radii, typography } from '../../theme';
import { Badge } from '../ui/Badge';
import { GlassCard } from '../ui/GlassCard';
import { getTagColor, getTagLabel } from '../../utils/status';
import { timeAgo } from '../../utils/date';
import type { Idea } from '../../types';

interface IdeaCardProps {
  idea: Idea;
  onPress?: () => void;
}

export function IdeaCard({ idea, onPress }: IdeaCardProps) {
  const tagColor = getTagColor(idea.tag);

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.82}
      disabled={!onPress}
    >
      <GlassCard style={styles.card}>
        <View style={styles.iconWrap}>
          <Lightbulb size={14} color={colors.accent.warning} strokeWidth={2.2} />
        </View>
        <View style={styles.body}>
          <Text style={styles.title} numberOfLines={1}>
            {idea.title}
          </Text>
          {idea.notes && (
            <Text style={styles.notes} numberOfLines={2}>
              {idea.notes}
            </Text>
          )}
          <View style={styles.footer}>
            <Badge label={getTagLabel(idea.tag)} color={tagColor} />
            <View style={styles.timeWrap}>
              <Sparkles size={12} color={colors.text.muted} strokeWidth={2} />
              <Text style={styles.time}>{timeAgo(idea.created_at)}</Text>
            </View>
          </View>
        </View>
      </GlassCard>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderRadius: radii.xl,
    padding: spacing.sm,
    marginBottom: spacing.xs + 2,
  },
  iconWrap: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: colors.accent.warningMuted,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  body: {
    flex: 1,
  },
  title: {
    ...typography.body,
    fontWeight: '600',
    fontSize: 13,
    lineHeight: 17,
  },
  notes: {
    ...typography.caption,
    marginTop: 2,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.xs + 2,
  },
  timeWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  time: {
    ...typography.small,
    textTransform: 'none',
  },
});
