import React from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

import SectionCard from '../components/SectionCard';
import { theme } from '../constants/theme';
import { t } from '../core/i18n';
import { buildStepAvailabilityMap } from '../core/roadmap';
import { StepStatus } from '../core/types';
import { useCompanion } from '../state/CompanionProvider';

const statusColor = (status: StepStatus): string => {
  switch (status) {
    case 'done':
      return theme.colors.accent;
    case 'in_progress':
      return '#2755A0';
    case 'blocked':
      return theme.colors.warning;
    default:
      return theme.colors.slate;
  }
};

export default function DashboardScreen() {
  const {
    locale,
    onboardingMode,
    restartOnboarding,
    activePath,
    journey,
    roadmap,
    stepProgress,
    nextBestAction,
    updateStepStatus,
    compliance
  } = useCompanion();

  const progressMap = new Map(stepProgress.map((entry) => [entry.stepId, entry.status]));
  const availabilityMap = buildStepAvailabilityMap(roadmap, stepProgress);

  const onRestartPress = () => {
    Alert.alert(
      t(locale, 'onboarding.restart.confirmTitle'),
      t(locale, 'onboarding.restart.confirmBody'),
      [
        { text: t(locale, 'common.no'), style: 'cancel' },
        {
          text: t(locale, 'onboarding.restart.confirmAction'),
          style: 'destructive',
          onPress: () => restartOnboarding()
        }
      ]
    );
  };

  return (
    <LinearGradient colors={[theme.colors.paper, '#F3FBF8']} style={styles.page}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.appTitle}>{t(locale, 'app.title')}</Text>
        <Text style={styles.appSubtitle}>{t(locale, 'app.subtitle')}</Text>

        <SectionCard title={t(locale, 'dashboard.nextAction')}>
          {nextBestAction ? (
            <>
              <Text style={styles.actionStep}>
                {(() => {
                  const step = roadmap.find((item) => item.id === nextBestAction.stepId);
                  return step ? t(locale, step.titleKey) : nextBestAction.stepId;
                })()}
              </Text>
              <Text style={styles.actionReason}>{nextBestAction.reason}</Text>
            </>
          ) : (
            <Text style={styles.actionReason}>{t(locale, 'dashboard.emptyAction')}</Text>
          )}
        </SectionCard>

        <SectionCard title={t(locale, 'path.title')} subtitle={t(locale, activePath.descriptionKey)}>
          <Text style={styles.pathActive}>
            {t(locale, 'path.active')}: {t(locale, activePath.titleKey)}
          </Text>
          <Text style={styles.pathMode}>
            {t(locale, 'onboarding.currentMode')}:{' '}
            {onboardingMode ? t(locale, `onboarding.mode.${onboardingMode}.title`) : '-'}
          </Text>
          <TouchableOpacity style={styles.resetButton} onPress={onRestartPress}>
            <Text style={styles.resetButtonText}>{t(locale, 'onboarding.restart')}</Text>
          </TouchableOpacity>
        </SectionCard>

        <SectionCard title={t(locale, 'journey.title')}>
          {journey.map((moment, index) => (
            <View key={moment.id} style={styles.journeyRow}>
              <Text style={styles.journeyIndex}>{index + 1}.</Text>
              <View style={styles.journeyBody}>
                <Text style={styles.journeyTitle}>{t(locale, moment.titleKey)}</Text>
                <Text style={styles.journeyText}>{t(locale, moment.bodyKey)}</Text>
              </View>
            </View>
          ))}
        </SectionCard>

        <SectionCard title={t(locale, 'dashboard.roadmap')}>
          {roadmap.map((step) => {
            const status = progressMap.get(step.id) ?? 'todo';
            const availability = availabilityMap.get(step.id);
            const isLocked = status !== 'done' && status !== 'in_progress' && !(availability?.unlocked ?? false);
            const displayStatus: StepStatus = isLocked ? 'blocked' : status;
            const canStart = !isLocked && status === 'todo';
            const canMarkDone = !isLocked && status !== 'done';
            const lockReason = isLocked ? t(locale, 'dashboard.lock.short') : null;

            return (
              <View key={step.id} style={styles.stepCard}>
                <Text style={styles.stepTitle}>{t(locale, step.titleKey)}</Text>
                <Text style={styles.monthTag}>
                  {t(locale, 'dashboard.month')}: {step.sequenceMonth}
                </Text>
                <Text style={styles.stepDesc}>{t(locale, step.descriptionKey)}</Text>
                {!isLocked ? (
                  <Text style={[styles.statusTag, { color: statusColor(displayStatus) }]}>
                    {t(locale, `dashboard.status.${displayStatus}`)}
                  </Text>
                ) : null}
                {lockReason ? (
                  <View style={styles.lockRow}>
                    <Ionicons name='lock-closed-outline' size={14} color={theme.colors.warning} />
                    <Text style={styles.lockReason}>{lockReason}</Text>
                  </View>
                ) : null}
                <Text style={styles.note}>{t(locale, step.complianceKey)}</Text>
                <View style={styles.stepActions}>
                  {isLocked ? (
                    <TouchableOpacity style={[styles.doneButton, styles.actionButtonDisabled]} disabled>
                      <Text style={styles.buttonText}>{t(locale, 'dashboard.lockedAction')}</Text>
                    </TouchableOpacity>
                  ) : (
                    <>
                      <TouchableOpacity
                        style={[styles.startButton, !canStart ? styles.actionButtonDisabled : null]}
                        onPress={() => updateStepStatus(step.id, 'in_progress')}
                        disabled={!canStart}
                      >
                        <Text style={styles.buttonText}>{t(locale, 'dashboard.markInProgress')}</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.doneButton, !canMarkDone ? styles.actionButtonDisabled : null]}
                        onPress={() => updateStepStatus(step.id, 'done')}
                        disabled={!canMarkDone}
                      >
                        <Text style={styles.buttonText}>{t(locale, 'dashboard.markDone')}</Text>
                      </TouchableOpacity>
                    </>
                  )}
                </View>
              </View>
            );
          })}
        </SectionCard>

        <SectionCard title={compliance.title}>
          {compliance.bullets.map((line) => (
            <Text key={line} style={styles.complianceText}>
              - {line}
            </Text>
          ))}
        </SectionCard>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1
  },
  content: {
    padding: theme.spacing.md,
    paddingTop: theme.spacing.xl,
    paddingBottom: theme.spacing.xl
  },
  appTitle: {
    fontSize: theme.typography.display,
    color: theme.colors.ink,
    fontFamily: theme.fonts.heading,
    marginBottom: 4
  },
  appSubtitle: {
    color: theme.colors.slate,
    fontFamily: theme.fonts.body,
    marginBottom: theme.spacing.lg
  },
  actionStep: {
    fontSize: 18,
    color: theme.colors.ink,
    fontFamily: theme.fonts.medium
  },
  actionReason: {
    color: theme.colors.slate,
    fontFamily: theme.fonts.body
  },
  pathActive: {
    color: theme.colors.ink,
    fontFamily: theme.fonts.medium
  },
  pathMode: {
    color: theme.colors.slate,
    fontFamily: theme.fonts.body
  },
  resetButton: {
    marginTop: 4,
    alignSelf: 'flex-start',
    paddingVertical: 7,
    paddingHorizontal: 10,
    borderRadius: theme.radius.sm,
    backgroundColor: theme.colors.cloud
  },
  resetButtonText: {
    color: theme.colors.ink,
    fontFamily: theme.fonts.medium,
    fontSize: 12
  },
  journeyRow: {
    flexDirection: 'row',
    gap: theme.spacing.sm
  },
  journeyIndex: {
    fontSize: 15,
    color: theme.colors.accent,
    marginTop: 1,
    fontFamily: theme.fonts.mono
  },
  journeyBody: {
    flex: 1
  },
  journeyTitle: {
    fontSize: 15,
    color: theme.colors.ink,
    fontFamily: theme.fonts.medium
  },
  journeyText: {
    color: theme.colors.slate,
    fontFamily: theme.fonts.body
  },
  stepCard: {
    borderWidth: 1,
    borderColor: theme.colors.cloud,
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    backgroundColor: theme.colors.white
  },
  stepTitle: {
    fontSize: 16,
    color: theme.colors.ink,
    fontFamily: theme.fonts.medium
  },
  stepDesc: {
    color: theme.colors.slate,
    fontFamily: theme.fonts.body,
    marginTop: 2
  },
  monthTag: {
    marginTop: 4,
    color: theme.colors.accent,
    fontFamily: theme.fonts.mono
  },
  statusTag: {
    marginTop: theme.spacing.xs,
    marginBottom: theme.spacing.xs,
    fontFamily: theme.fonts.medium
  },
  note: {
    color: theme.colors.slate,
    fontFamily: theme.fonts.body,
    fontSize: 12,
    marginBottom: theme.spacing.sm
  },
  lockReason: {
    color: theme.colors.warning,
    fontFamily: theme.fonts.body,
    fontSize: 12
  },
  lockRow: {
    marginTop: theme.spacing.xs,
    marginBottom: theme.spacing.xs,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6
  },
  stepActions: {
    flexDirection: 'row',
    gap: theme.spacing.sm
  },
  startButton: {
    backgroundColor: theme.colors.accentSoft,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: theme.radius.sm
  },
  doneButton: {
    backgroundColor: theme.colors.accent,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: theme.radius.sm
  },
  buttonText: {
    color: theme.colors.ink,
    fontFamily: theme.fonts.medium
  },
  actionButtonDisabled: {
    opacity: 0.45
  },
  complianceText: {
    color: theme.colors.slate,
    fontFamily: theme.fonts.body,
    marginBottom: 4
  }
});
