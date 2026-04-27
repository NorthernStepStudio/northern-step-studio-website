import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { colors, spacing, radii, typography } from '../../theme';
import { GlassCard } from '../ui/GlassCard';
import { getStatusColor, getStatusLabel, getPriorityColor, getPriorityLabel } from '../../utils/status';
import type { ProjectCreate, ProjectStatus, Priority } from '../../types';

const STATUSES: ProjectStatus[] = ['idea', 'building', 'beta', 'paused', 'launched'];
const PRIORITIES: Priority[] = ['low', 'medium', 'high'];
const FORM_MAX_WIDTH = 520;

interface ProjectFormProps {
  initial?: Partial<ProjectCreate>;
  onSubmit: (data: ProjectCreate) => Promise<void>;
  onCancel: () => void;
  submitLabel?: string;
}

export function ProjectForm({ initial, onSubmit, onCancel, submitLabel = 'Create' }: ProjectFormProps) {
  const [name, setName] = useState(initial?.name ?? '');
  const [status, setStatus] = useState<ProjectStatus>(initial?.status ?? 'idea');
  const [priority, setPriority] = useState<Priority>(initial?.priority ?? 'medium');
  const [nextAction, setNextAction] = useState(initial?.next_action ?? '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!name.trim()) {
      setError('Project name is required');
      return;
    }
    try {
      setLoading(true);
      setError(null);
      await onSubmit({
        name: name.trim(),
        status,
        priority,
        next_action: nextAction.trim() || null,
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

        <Input label="Project Name" value={name} onChangeText={setName} placeholder="My awesome project" />

        <Text style={styles.sectionLabel}>Status</Text>
        <View style={styles.chips}>
          {STATUSES.map((s) => (
            <TouchableOpacity
              key={s}
              style={[
                styles.chip,
                status === s && { backgroundColor: getStatusColor(s) + '33', borderColor: getStatusColor(s) },
              ]}
              onPress={() => setStatus(s)}
            >
              <Text style={[styles.chipText, status === s && { color: getStatusColor(s) }]}>
                {getStatusLabel(s)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.sectionLabel}>Priority</Text>
        <View style={styles.chips}>
          {PRIORITIES.map((p) => (
            <TouchableOpacity
              key={p}
              style={[
                styles.chip,
                priority === p && { backgroundColor: getPriorityColor(p) + '33', borderColor: getPriorityColor(p) },
              ]}
              onPress={() => setPriority(p)}
            >
              <Text style={[styles.chipText, priority === p && { color: getPriorityColor(p) }]}>
                {getPriorityLabel(p)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Input label="Next Action" value={nextAction} onChangeText={setNextAction} placeholder="What's the next step?" />

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
  primaryButton: { minWidth: 170 },
});
