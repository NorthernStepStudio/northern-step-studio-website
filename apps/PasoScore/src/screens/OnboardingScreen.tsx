import React, { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import SectionCard from '../components/SectionCard';
import { theme } from '../constants/theme';
import { normalizeProfile } from '../core/data';
import { t } from '../core/i18n';
import { buildProfileFromPersonalizedInput, mapAnonymousSituationToStage } from '../core/onboarding';
import { buildRoadmap, resolveDecisionPath } from '../core/roadmap';
import {
  AnonymousSituation,
  CreditStage,
  IncomeRange,
  OnboardingMode,
  PersonalizedOnboardingInput
} from '../core/types';
import { useCompanion } from '../state/CompanionProvider';

const MODE_OPTIONS: OnboardingMode[] = ['anonymous', 'personalized'];
const ANON_OPTIONS: AnonymousSituation[] = ['no_credit', 'thin_file', 'bad_credit', 'denied_recently'];
const STAGE_OPTIONS: CreditStage[] = ['no_credit', 'thin_file', 'missed_payments', 'secured_card_stage'];
const INCOME_OPTIONS: IncomeRange[] = ['unknown', 'under_30k', '30k_to_60k', '60k_to_100k', '100k_plus'];
const STEPS: Array<1 | 2 | 3 | 4> = [1, 2, 3, 4];

export default function OnboardingScreen() {
  const {
    locale,
    localeOptions,
    setLocale,
    profile,
    completeAnonymousOnboarding,
    completePersonalizedOnboarding
  } = useCompanion();

  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [mode, setMode] = useState<OnboardingMode>('anonymous');
  const [situation, setSituation] = useState<AnonymousSituation>('no_credit');

  const [incomeRange, setIncomeRange] = useState<IncomeRange>('unknown');
  const [creditStage, setCreditStage] = useState<CreditStage>('thin_file');
  const [openAccounts, setOpenAccounts] = useState('1');
  const [utilizationPct, setUtilizationPct] = useState('25');
  const [missedPayments, setMissedPayments] = useState(false);
  const [hardInquiriesEstimate, setHardInquiriesEstimate] = useState('1');

  const personalizedPayload: PersonalizedOnboardingInput = useMemo(
    () => ({
      incomeRange,
      creditStage,
      openAccounts: Number.parseInt(openAccounts, 10) || 0,
      utilizationPct: Number.parseInt(utilizationPct, 10) || 0,
      missedPayments,
      hardInquiriesEstimate: Number.parseInt(hardInquiriesEstimate, 10) || 0
    }),
    [incomeRange, creditStage, openAccounts, utilizationPct, missedPayments, hardInquiriesEstimate]
  );

  const previewProfile = useMemo(() => {
    if (mode === 'anonymous') {
      const stage = mapAnonymousSituationToStage(situation);
      return normalizeProfile({
        ...profile,
        creditStage: stage,
        incomeRange: 'unknown',
        openAccounts: 0,
        revolvingUtilizationPct: 0,
        hardInquiriesEstimate: 0,
        recentLatePayments: situation === 'bad_credit',
        deniedRecently: situation === 'denied_recently'
      });
    }

    return normalizeProfile(buildProfileFromPersonalizedInput(profile, personalizedPayload));
  }, [mode, situation, profile, personalizedPayload]);

  const previewPath = useMemo(() => resolveDecisionPath(previewProfile), [previewProfile]);
  const previewRoadmap = useMemo(() => buildRoadmap(previewProfile), [previewProfile]);
  const monthOneAction = useMemo(
    () => previewRoadmap.find((stepItem) => stepItem.sequenceMonth === 1) ?? previewRoadmap[0] ?? null,
    [previewRoadmap]
  );

  const onBack = () => setStep((current) => (current > 1 ? ((current - 1) as 1 | 2 | 3 | 4) : current));

  const onNext = () => {
    if (step < 4) {
      setStep((current) => (current + 1) as 1 | 2 | 3 | 4);
      return;
    }

    if (mode === 'anonymous') {
      completeAnonymousOnboarding(situation);
      return;
    }

    completePersonalizedOnboarding(personalizedPayload);
  };

  const stepTitle =
    step === 1
      ? t(locale, 'onboarding.step1.title')
      : step === 2
      ? t(locale, 'onboarding.step2.title')
      : step === 3
      ? t(locale, 'onboarding.step3.title')
      : t(locale, 'onboarding.step4.title');

  const stepDescription =
    step === 1
      ? t(locale, 'onboarding.step1.desc')
      : step === 2
      ? t(locale, 'onboarding.step2.desc')
      : step === 3
      ? t(locale, 'onboarding.step3.desc')
      : t(locale, 'onboarding.step4.desc');

  return (
    <LinearGradient colors={['#EEF4FF', '#F7FAFC']} style={styles.page}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.heroBlock}>
          <Text style={styles.heroEyebrow}>{t(locale, 'app.title')}</Text>
          <Text style={styles.heroTitle}>{t(locale, 'onboarding.title')}</Text>
          <Text style={styles.heroSubtitle}>{t(locale, 'onboarding.subtitle')}</Text>
        </View>

        <SectionCard title={t(locale, 'privacy.boundary.title')}>
          <Text style={styles.boundaryText}>{t(locale, 'privacy.boundary.body')}</Text>
        </SectionCard>

        <View style={styles.stepperWrap}>
          {STEPS.map((stepNumber, index) => {
            const isDone = stepNumber < step;
            const isActive = stepNumber === step;
            const isLast = index === STEPS.length - 1;

            return (
              <View key={stepNumber} style={styles.stepNodeWrap}>
                <View
                  style={[
                    styles.stepNode,
                    isDone ? styles.stepNodeDone : null,
                    isActive ? styles.stepNodeActive : null
                  ]}
                >
                  <Text
                    style={[
                      styles.stepNodeText,
                      isDone || isActive ? styles.stepNodeTextActive : null
                    ]}
                  >
                    {stepNumber}
                  </Text>
                </View>
                {!isLast ? <View style={[styles.stepLine, stepNumber < step ? styles.stepLineDone : null]} /> : null}
              </View>
            );
          })}
        </View>

        <SectionCard title={stepTitle} subtitle={stepDescription}>
          {step === 1 ? (
            <View style={styles.segmentWrap}>
              {localeOptions.map((option) => {
                const selected = option.code === locale;
                return (
                  <TouchableOpacity
                    key={option.code}
                    style={[styles.segmentButton, selected ? styles.segmentButtonActive : null]}
                    onPress={() => setLocale(option.code)}
                  >
                    <Text style={[styles.segmentText, selected ? styles.segmentTextActive : null]}>
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          ) : null}

          {step === 2 ? (
            <View style={styles.modeGrid}>
              {MODE_OPTIONS.map((option) => {
                const selected = mode === option;
                return (
                  <TouchableOpacity
                    key={option}
                    style={[styles.modeCard, selected ? styles.modeCardActive : null]}
                    onPress={() => setMode(option)}
                  >
                    <Text style={[styles.modeTitle, selected ? styles.modeTitleActive : null]}>
                      {t(locale, `onboarding.mode.${option}.title`)}
                    </Text>
                    <Text style={styles.modeDesc}>{t(locale, `onboarding.mode.${option}.desc`)}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          ) : null}

          {step === 3 && mode === 'anonymous' ? (
            <>
              <Text style={styles.helper}>{t(locale, 'onboarding.anonymous.question')}</Text>
              <View style={styles.columnWrap}>
                {ANON_OPTIONS.map((option) => {
                  const selected = situation === option;
                  return (
                    <TouchableOpacity
                      key={option}
                      style={[styles.selectRow, selected ? styles.selectRowActive : null]}
                      onPress={() => setSituation(option)}
                    >
                      <Text style={[styles.selectText, selected ? styles.selectTextActive : null]}>
                        {t(locale, `onboarding.situation.${option}`)}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </>
          ) : null}

          {step === 3 && mode === 'personalized' ? (
            <>
              <Text style={styles.helper}>{t(locale, 'onboarding.personalized.disclaimer')}</Text>

              <Text style={styles.label}>{t(locale, 'onboarding.personalized.stage')}</Text>
              <View style={styles.rowWrap}>
                {STAGE_OPTIONS.map((option) => {
                  const selected = creditStage === option;
                  return (
                    <TouchableOpacity
                      key={option}
                      style={[styles.optionButton, selected ? styles.optionButtonActive : null]}
                      onPress={() => setCreditStage(option)}
                    >
                      <Text style={[styles.optionText, selected ? styles.optionTextActive : null]}>
                        {t(locale, `onboarding.stage.${option}`)}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <Text style={styles.label}>{t(locale, 'onboarding.personalized.income')}</Text>
              <View style={styles.rowWrap}>
                {INCOME_OPTIONS.map((option) => {
                  const selected = incomeRange === option;
                  return (
                    <TouchableOpacity
                      key={option}
                      style={[styles.optionButton, selected ? styles.optionButtonActive : null]}
                      onPress={() => setIncomeRange(option)}
                    >
                      <Text style={[styles.optionText, selected ? styles.optionTextActive : null]}>
                        {t(locale, `onboarding.income.${option}`)}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <View style={styles.inputGrid}>
                <View style={styles.inputField}>
                  <Text style={styles.label}>{t(locale, 'onboarding.personalized.openAccounts')}</Text>
                  <TextInput
                    style={styles.input}
                    keyboardType='number-pad'
                    value={openAccounts}
                    onChangeText={setOpenAccounts}
                  />
                </View>
                <View style={styles.inputField}>
                  <Text style={styles.label}>{t(locale, 'onboarding.personalized.utilization')}</Text>
                  <TextInput
                    style={styles.input}
                    keyboardType='number-pad'
                    value={utilizationPct}
                    onChangeText={setUtilizationPct}
                  />
                </View>
              </View>

              <View style={styles.inputGrid}>
                <View style={styles.inputField}>
                  <Text style={styles.label}>{t(locale, 'onboarding.personalized.hardInquiries')}</Text>
                  <TextInput
                    style={styles.input}
                    keyboardType='number-pad'
                    value={hardInquiriesEstimate}
                    onChangeText={setHardInquiriesEstimate}
                  />
                </View>
                <View style={styles.inputField}>
                  <Text style={styles.label}>{t(locale, 'onboarding.personalized.missedPayments')}</Text>
                  <View style={styles.rowWrap}>
                    {[
                      { key: 'yes', value: true },
                      { key: 'no', value: false }
                    ].map((choice) => {
                      const selected = missedPayments === choice.value;
                      return (
                        <TouchableOpacity
                          key={choice.key}
                          style={[styles.optionButton, selected ? styles.optionButtonActive : null]}
                          onPress={() => setMissedPayments(choice.value)}
                        >
                          <Text style={[styles.optionText, selected ? styles.optionTextActive : null]}>
                            {t(locale, `common.${choice.key}`)}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>
              </View>
            </>
          ) : null}

          {step === 4 ? (
            <View style={styles.previewWrap}>
              <Text style={styles.previewPathLabel}>{t(locale, 'onboarding.preview.path')}</Text>
              <Text style={styles.previewPathValue}>{t(locale, previewPath.titleKey)}</Text>

              <Text style={styles.previewPathLabel}>{t(locale, 'onboarding.preview.month1')}</Text>
              <Text style={styles.previewPathValue}>
                {monthOneAction ? t(locale, monthOneAction.titleKey) : t(locale, 'onboarding.preview.none')}
              </Text>
            </View>
          ) : null}
        </SectionCard>

        <View style={styles.footerActions}>
          <TouchableOpacity
            style={[styles.secondaryButton, step === 1 ? styles.secondaryButtonDisabled : null]}
            onPress={onBack}
            disabled={step === 1}
          >
            <Text style={styles.secondaryButtonText}>{t(locale, 'common.back')}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.primaryButton} onPress={onNext}>
            <Text style={styles.primaryButtonText}>
              {step < 4 ? t(locale, 'common.next') : t(locale, 'onboarding.finish')}
            </Text>
          </TouchableOpacity>
        </View>
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
    paddingTop: theme.spacing.xxl,
    paddingBottom: theme.spacing.xxl
  },
  heroBlock: {
    marginBottom: theme.spacing.md
  },
  heroEyebrow: {
    color: theme.colors.info,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    fontSize: theme.typography.caption,
    fontFamily: theme.fonts.mono
  },
  heroTitle: {
    marginTop: 6,
    color: theme.colors.ink,
    fontSize: theme.typography.display,
    fontFamily: theme.fonts.heading
  },
  heroSubtitle: {
    marginTop: 8,
    color: theme.colors.slate,
    fontSize: theme.typography.subtitle,
    fontFamily: theme.fonts.body,
    lineHeight: 22
  },
  boundaryText: {
    color: theme.colors.ink,
    fontFamily: theme.fonts.medium,
    lineHeight: 20
  },
  stepperWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
    paddingHorizontal: 4
  },
  stepNodeWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1
  },
  stepNode: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.colors.cloud,
    backgroundColor: theme.colors.panel,
    alignItems: 'center',
    justifyContent: 'center'
  },
  stepNodeDone: {
    backgroundColor: theme.colors.accent,
    borderColor: theme.colors.accent
  },
  stepNodeActive: {
    borderColor: theme.colors.accent,
    backgroundColor: theme.colors.accentSoft
  },
  stepNodeText: {
    color: theme.colors.slate,
    fontFamily: theme.fonts.mono,
    fontSize: 13
  },
  stepNodeTextActive: {
    color: theme.colors.ink
  },
  stepLine: {
    flex: 1,
    height: 2,
    backgroundColor: theme.colors.cloud,
    marginHorizontal: 8
  },
  stepLineDone: {
    backgroundColor: theme.colors.accent
  },
  segmentWrap: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap'
  },
  segmentButton: {
    minWidth: 92,
    borderRadius: theme.radius.sm,
    borderWidth: 1,
    borderColor: theme.colors.cloud,
    backgroundColor: theme.colors.panel,
    paddingVertical: 10,
    paddingHorizontal: 12,
    alignItems: 'center'
  },
  segmentButtonActive: {
    borderColor: theme.colors.accent,
    backgroundColor: theme.colors.accentSoft
  },
  segmentText: {
    color: theme.colors.slate,
    fontFamily: theme.fonts.medium
  },
  segmentTextActive: {
    color: theme.colors.ink
  },
  modeGrid: {
    gap: theme.spacing.sm
  },
  modeCard: {
    borderWidth: 1,
    borderColor: theme.colors.cloud,
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
    backgroundColor: theme.colors.panel,
    gap: 4
  },
  modeCardActive: {
    borderColor: theme.colors.accent,
    backgroundColor: theme.colors.accentSoft
  },
  modeTitle: {
    fontSize: 16,
    color: theme.colors.ink,
    fontFamily: theme.fonts.heading
  },
  modeTitleActive: {
    color: theme.colors.accentDark
  },
  modeDesc: {
    color: theme.colors.slate,
    fontFamily: theme.fonts.body,
    lineHeight: 20
  },
  helper: {
    color: theme.colors.slate,
    fontFamily: theme.fonts.body,
    marginBottom: 2
  },
  label: {
    color: theme.colors.ink,
    fontFamily: theme.fonts.medium,
    marginTop: 8,
    marginBottom: 4
  },
  rowWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8
  },
  columnWrap: {
    gap: 8
  },
  optionButton: {
    borderWidth: 1,
    borderColor: theme.colors.cloud,
    borderRadius: theme.radius.sm,
    backgroundColor: theme.colors.panel,
    paddingVertical: 8,
    paddingHorizontal: 10,
    minHeight: 36,
    justifyContent: 'center'
  },
  optionButtonActive: {
    borderColor: theme.colors.accent,
    backgroundColor: theme.colors.accentSoft
  },
  optionText: {
    color: theme.colors.slate,
    fontFamily: theme.fonts.body,
    fontSize: 12
  },
  optionTextActive: {
    color: theme.colors.ink,
    fontFamily: theme.fonts.medium
  },
  selectRow: {
    borderWidth: 1,
    borderColor: theme.colors.cloud,
    borderRadius: theme.radius.sm,
    paddingVertical: 12,
    paddingHorizontal: 12,
    backgroundColor: theme.colors.panel
  },
  selectRowActive: {
    borderColor: theme.colors.accent,
    backgroundColor: theme.colors.accentSoft
  },
  selectText: {
    color: theme.colors.slate,
    fontFamily: theme.fonts.body,
    fontSize: theme.typography.body
  },
  selectTextActive: {
    color: theme.colors.ink,
    fontFamily: theme.fonts.medium
  },
  inputGrid: {
    flexDirection: 'row',
    gap: 10
  },
  inputField: {
    flex: 1
  },
  input: {
    borderWidth: 1,
    borderColor: theme.colors.cloud,
    borderRadius: theme.radius.sm,
    paddingVertical: 8,
    paddingHorizontal: 10,
    backgroundColor: theme.colors.panel,
    fontFamily: theme.fonts.body,
    color: theme.colors.ink,
    minHeight: 40
  },
  previewWrap: {
    gap: 10
  },
  previewPathLabel: {
    color: theme.colors.slate,
    fontSize: theme.typography.caption,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    fontFamily: theme.fonts.mono
  },
  previewPathValue: {
    color: theme.colors.ink,
    fontSize: 16,
    fontFamily: theme.fonts.medium
  },
  footerActions: {
    marginTop: theme.spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: theme.spacing.sm
  },
  secondaryButton: {
    borderRadius: theme.radius.sm,
    borderWidth: 1,
    borderColor: theme.colors.cloud,
    backgroundColor: theme.colors.panel,
    minHeight: 44,
    paddingHorizontal: 18,
    alignItems: 'center',
    justifyContent: 'center'
  },
  secondaryButtonDisabled: {
    opacity: 0.45
  },
  secondaryButtonText: {
    color: theme.colors.ink,
    fontFamily: theme.fonts.medium
  },
  primaryButton: {
    flex: 1,
    backgroundColor: theme.colors.accent,
    borderRadius: theme.radius.sm,
    minHeight: 44,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center'
  },
  primaryButtonText: {
    color: theme.colors.white,
    fontFamily: theme.fonts.medium
  }
});
