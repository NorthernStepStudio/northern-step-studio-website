import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import SectionCard from '../components/SectionCard';
import { theme } from '../constants/theme';
import { isModuleLockedByProgress } from '../core/education';
import { t } from '../core/i18n';
import { useCompanion } from '../state/CompanionProvider';

export default function EducationScreen() {
  const { locale, educationModules, educationProgress, setEducationCompleted } = useCompanion();
  const [expandedModuleId, setExpandedModuleId] = useState<string | null>(null);

  const progressMap = new Map(educationProgress.map((entry) => [entry.moduleId, entry.completed]));

  return (
    <ScrollView style={styles.page} contentContainerStyle={styles.content}>
      <SectionCard title={t(locale, 'education.title')}>
        {educationModules.map((module) => {
          const completed = progressMap.get(module.id) ?? false;
          const locked = isModuleLockedByProgress(module.id, educationProgress, educationModules);
          const expanded = expandedModuleId === module.id;

          return (
            <View key={module.id} style={[styles.moduleRow, locked ? styles.moduleRowLocked : null]}>
              <View style={styles.moduleTextWrap}>
                <Text style={styles.moduleTitle}>{t(locale, module.titleKey)}</Text>
                <Text style={styles.moduleSummary}>{t(locale, module.summaryKey)}</Text>
                <Text style={styles.minutes}>{module.minutes} min</Text>
                {locked ? (
                  <View style={styles.lockRow}>
                    <Ionicons name='lock-closed-outline' size={14} color={theme.colors.warning} />
                    <Text style={styles.lockedNote}>{t(locale, 'education.unlockFirst')}</Text>
                  </View>
                ) : null}
              </View>
              {!locked && expanded ? (
                <View style={styles.detailsWrap}>
                  <Text style={styles.detailLabel}>{t(locale, 'education.detail.how')}</Text>
                  <Text style={styles.detailBody}>{t(locale, module.detailHowKey)}</Text>
                  <Text style={styles.detailLabel}>{t(locale, 'education.detail.why')}</Text>
                  <Text style={styles.detailBody}>{t(locale, module.detailWhyKey)}</Text>
                  <Text style={styles.detailLabel}>{t(locale, 'education.detail.best')}</Text>
                  <Text style={styles.detailBody}>{t(locale, module.detailBestKey)}</Text>
                </View>
              ) : null}
              <View style={styles.actionsRow}>
                {locked ? (
                  <TouchableOpacity style={[styles.completeButton, styles.lockedButton]} disabled>
                    <Text style={styles.completeButtonText}>{t(locale, 'education.locked')}</Text>
                  </TouchableOpacity>
                ) : (
                  <>
                    <TouchableOpacity
                      style={styles.detailButton}
                      onPress={() => setExpandedModuleId((current) => (current === module.id ? null : module.id))}
                    >
                      <Text style={styles.completeButtonText}>
                        {expanded ? t(locale, 'education.hideDetails') : t(locale, 'education.readDetails')}
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.completeButton, completed ? styles.doneButton : null]}
                      onPress={() => setEducationCompleted(module.id, !completed)}
                    >
                      <Text style={styles.completeButtonText}>
                        {completed ? t(locale, 'education.completed') : t(locale, 'education.complete')}
                      </Text>
                    </TouchableOpacity>
                  </>
                )}
              </View>
            </View>
          );
        })}
      </SectionCard>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: theme.colors.paper
  },
  content: {
    padding: theme.spacing.md,
    paddingTop: theme.spacing.lg,
    paddingBottom: theme.spacing.xl
  },
  moduleRow: {
    borderWidth: 1,
    borderColor: theme.colors.cloud,
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
    backgroundColor: theme.colors.panel,
    marginBottom: theme.spacing.sm,
    gap: theme.spacing.sm
  },
  moduleRowLocked: {
    opacity: 0.7
  },
  moduleTextWrap: {
    gap: 4
  },
  moduleTitle: {
    fontSize: 16,
    color: theme.colors.ink,
    fontFamily: theme.fonts.medium
  },
  moduleSummary: {
    color: theme.colors.slate,
    fontFamily: theme.fonts.body
  },
  minutes: {
    color: theme.colors.slate,
    fontFamily: theme.fonts.mono,
    fontSize: 12
  },
  lockedNote: {
    color: theme.colors.warning,
    fontFamily: theme.fonts.body,
    fontSize: 12
  },
  lockRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6
  },
  detailsWrap: {
    gap: 4
  },
  detailLabel: {
    marginTop: 4,
    color: theme.colors.ink,
    fontFamily: theme.fonts.medium,
    fontSize: 12
  },
  detailBody: {
    color: theme.colors.slate,
    fontFamily: theme.fonts.body,
    lineHeight: 19
  },
  actionsRow: {
    flexDirection: 'row',
    gap: theme.spacing.sm
  },
  detailButton: {
    alignSelf: 'flex-start',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: theme.radius.sm,
    borderWidth: 1,
    borderColor: theme.colors.cloud,
    backgroundColor: theme.colors.white
  },
  completeButton: {
    alignSelf: 'flex-start',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: theme.radius.sm,
    backgroundColor: theme.colors.accentSoft
  },
  doneButton: {
    backgroundColor: theme.colors.accent
  },
  lockedButton: {
    backgroundColor: theme.colors.cloud
  },
  completeButtonText: {
    color: theme.colors.ink,
    fontFamily: theme.fonts.medium
  }
});
