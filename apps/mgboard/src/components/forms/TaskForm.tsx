import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { colors, spacing, radii, typography } from '../../theme';
import { GlassCard } from '../ui/GlassCard';
import { getExecutionModeLabel, getPriorityColor, getPriorityLabel, getRiskLabel, getTaskTypeLabel } from '../../utils/status';
import type { ExecutionMode, Priority, Project, RiskLevel, TaskCreate, TaskType } from '../../types';
import { AUTO_EXECUTABLE_TASK_TYPES, PROTECTED_TASK_TYPES } from '../../services/taskModel';

const PRIORITIES: Priority[] = ['low', 'medium', 'high'];
const RISK_LEVELS: RiskLevel[] = ['low', 'medium', 'high'];
const EXECUTION_MODES: ExecutionMode[] = ['manual_only', 'auto_allowed'];
const TASK_TYPES: TaskType[] = [...AUTO_EXECUTABLE_TASK_TYPES, ...PROTECTED_TASK_TYPES, 'other'];
const FORM_MAX_WIDTH = 520;

interface TaskFormProps {
  projects?: Project[];
  projectId?: string;
  onSubmit: (data: TaskCreate) => Promise<void>;
  onCancel: () => void;
  submitLabel?: string;
}

export function TaskForm({ projects, projectId, onSubmit, onCancel, submitLabel = 'Create' }: TaskFormProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');
  const [riskLevel, setRiskLevel] = useState<RiskLevel>('low');
  const [taskType, setTaskType] = useState<TaskType>('bug_fix');
  const [executionMode, setExecutionMode] = useState<ExecutionMode>('auto_allowed');
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(projectId ?? null);
  const [repoId, setRepoId] = useState('');
  const [filesHint, setFilesHint] = useState('');
  const [acceptanceCriteria, setAcceptanceCriteria] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!title.trim()) {
      setError('Task title is required');
      return;
    }
    try {
      setLoading(true);
      setError(null);
      await onSubmit({
        title: title.trim(),
        description: description.trim() || null,
        type: taskType,
        status: 'todo',
        priority,
        risk_level: riskLevel,
        execution_mode: executionMode,
        project_id: selectedProjectId,
        repo_id: repoId.trim() || null,
        due_date: dueDate || null,
        files_hint: filesHint.trim() || null,
        acceptance_criteria: acceptanceCriteria.trim() || null,
        human_review_required: riskLevel !== 'low',
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

        <Input label="Task Title" value={title} onChangeText={setTitle} placeholder="What needs to be done?" />
        <Input
          label="Description"
          value={description}
          onChangeText={setDescription}
          placeholder="What is broken, expected behavior, and constraints?"
          multiline
        />

        <Text style={styles.sectionLabel}>Task Type</Text>
        <View style={styles.chips}>
          {TASK_TYPES.map((type) => (
            <TouchableOpacity
              key={type}
              style={[styles.chip, taskType === type && styles.chipSelected]}
              onPress={() => setTaskType(type)}
            >
              <Text style={[styles.chipText, taskType === type && { color: colors.accent.primary }]}>
                {getTaskTypeLabel(type)}
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

        <Text style={styles.sectionLabel}>Risk Level</Text>
        <View style={styles.chips}>
          {RISK_LEVELS.map((risk) => (
            <TouchableOpacity
              key={risk}
              style={[
                styles.chip,
                riskLevel === risk && {
                  backgroundColor:
                    risk === 'high'
                      ? colors.accent.dangerMuted
                      : risk === 'medium'
                        ? colors.accent.warningMuted
                        : colors.accent.successMuted,
                  borderColor:
                    risk === 'high'
                      ? colors.accent.danger
                      : risk === 'medium'
                        ? colors.accent.warning
                        : colors.accent.success,
                },
              ]}
              onPress={() => setRiskLevel(risk)}
            >
              <Text
                style={[
                  styles.chipText,
                  riskLevel === risk && {
                    color:
                      risk === 'high'
                        ? colors.accent.danger
                        : risk === 'medium'
                          ? colors.accent.warning
                          : colors.accent.success,
                  },
                ]}
              >
                {getRiskLabel(risk)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.sectionLabel}>Execution Mode</Text>
        <View style={styles.chips}>
          {EXECUTION_MODES.map((mode) => (
            <TouchableOpacity
              key={mode}
              style={[styles.chip, executionMode === mode && styles.chipSelected]}
              onPress={() => setExecutionMode(mode)}
            >
              <Text style={[styles.chipText, executionMode === mode && { color: colors.accent.primary }]}>
                {getExecutionModeLabel(mode)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {projects && projects.length > 0 && !projectId && (
          <>
            <Text style={styles.sectionLabel}>Project (optional)</Text>
            <View style={styles.chips}>
              <TouchableOpacity
                style={[styles.chip, !selectedProjectId && styles.chipSelected]}
                onPress={() => setSelectedProjectId(null)}
              >
                <Text style={[styles.chipText, !selectedProjectId && { color: colors.accent.primary }]}>
                  None
                </Text>
              </TouchableOpacity>
              {projects.map((proj) => (
                <TouchableOpacity
                  key={proj.id}
                  style={[
                    styles.chip,
                    selectedProjectId === proj.id && styles.chipSelected,
                  ]}
                  onPress={() => setSelectedProjectId(proj.id)}
                >
                  <Text style={[styles.chipText, selectedProjectId === proj.id && { color: colors.accent.primary }]}>
                    {proj.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}

        <Input
          label="Due Date (optional)"
          value={dueDate}
          onChangeText={setDueDate}
          placeholder="YYYY-MM-DD"
          keyboardType="numeric"
        />
        <Input
          label="Repo Id (optional)"
          value={repoId}
          onChangeText={setRepoId}
          placeholder="Linked repo UUID (if available)"
        />
        <Input
          label="Files Hint (optional)"
          value={filesHint}
          onChangeText={setFilesHint}
          placeholder="src/app.tsx, src/components/Button.tsx"
        />
        <Input
          label="Acceptance Criteria (optional)"
          value={acceptanceCriteria}
          onChangeText={setAcceptanceCriteria}
          placeholder="What must be true before this is done?"
          multiline
        />

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
  chipSelected: {
    backgroundColor: colors.accent.primaryMuted,
    borderColor: colors.accent.primary,
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
  primaryButton: { minWidth: 150 },
});
