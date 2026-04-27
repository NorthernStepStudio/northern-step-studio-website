import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { colors, spacing, radii, typography } from '../../theme';
import { GlassCard } from '../ui/GlassCard';
import { getTagColor, getTagLabel } from '../../utils/status';
import type { IdeaCreate, IdeaTag } from '../../types';

const TAGS: IdeaTag[] = ['now', 'later', 'maybe'];
const FORM_MAX_WIDTH = 520;

interface IdeaFormProps {
  initial?: Partial<IdeaCreate>;
  onSubmit: (data: IdeaCreate) => Promise<void>;
  onCancel: () => void;
  submitLabel?: string;
}

export function IdeaForm({ initial, onSubmit, onCancel, submitLabel = 'Save' }: IdeaFormProps) {
  const [title, setTitle] = useState(initial?.title ?? '');
  const [notes, setNotes] = useState(initial?.notes ?? '');
  const [tag, setTag] = useState<IdeaTag>(initial?.tag ?? 'later');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!title.trim()) {
      setError('Idea title is required');
      return;
    }
    try {
      setLoading(true);
      setError(null);
      await onSubmit({
        title: title.trim(),
        notes: notes.trim() || null,
        tag,
      });
    } catch (err: any) {
      setError(err.message ?? 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.formBody}>
        {error && (
          <GlassCard style={styles.errorCard}>
            <Text style={styles.error}>{error}</Text>
          </GlassCard>
        )}

        <Input label="Idea Title" value={title} onChangeText={setTitle} placeholder="What's on your mind?" />

        <Input label="Notes (optional)" value={notes} onChangeText={setNotes} placeholder="Any details..." multiline />

        <Text style={styles.sectionLabel}>Priority Tag</Text>
        <View style={styles.chips}>
          {TAGS.map((t) => (
            <TouchableOpacity
              key={t}
              style={[
                styles.chip,
                tag === t && { backgroundColor: getTagColor(t) + '33', borderColor: getTagColor(t) },
              ]}
              onPress={() => setTag(t)}
            >
              <Text style={[styles.chipText, tag === t && { color: getTagColor(t) }]}>
                {getTagLabel(t)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.actions}>
          <Button title="Cancel" variant="ghost" size="md" onPress={onCancel} style={styles.cancelButton} />
          <Button title={submitLabel} size="md" onPress={handleSubmit} loading={loading} style={styles.primaryButton} />
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: {
    padding: spacing.md,
    alignItems: 'flex-start',
  },
  formBody: { width: '100%', maxWidth: FORM_MAX_WIDTH },
  errorCard: {
    borderRadius: radii.md,
    marginBottom: spacing.md,
    padding: spacing.md,
    borderColor: colors.accent.danger,
    backgroundColor: colors.accent.dangerMuted,
  },
  error: {
    ...typography.caption,
    color: colors.accent.danger,
  },
  sectionLabel: {
    ...typography.small,
    marginBottom: spacing.xs + 2,
    marginTop: spacing.xs + 2,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs + 2,
    marginBottom: spacing.sm + 2,
  },
  chip: {
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: spacing.xs + 2,
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: colors.border.medium,
    backgroundColor: colors.surface.glassSoft,
  },
  chipText: {
    ...typography.small,
    fontWeight: '600',
    textTransform: 'none',
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.md,
    alignSelf: 'flex-end',
  },
  cancelButton: { minWidth: 110 },
  primaryButton: { minWidth: 130 },
});
