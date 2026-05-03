import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import SectionCard from '../components/SectionCard';
import { theme } from '../constants/theme';
import { t } from '../core/i18n';
import { useCompanion } from '../state/CompanionProvider';

export default function RecommendationsScreen() {
  const {
    locale,
    onboardingMode,
    personalizedRules,
    recommendations,
    compliance,
    subscription,
    presentSubscriptionPaywall
  } = useCompanion();
  const personalizedLocked = onboardingMode === 'personalized' && !subscription.entitlementActive;

  return (
    <ScrollView style={styles.page} contentContainerStyle={styles.content}>
      <SectionCard title={t(locale, 'rules.title')}>
        {personalizedLocked ? (
          <>
            <Text style={styles.rulesLine}>{t(locale, 'rules.proLocked')}</Text>
            <TouchableOpacity
              style={styles.paywallButton}
              onPress={() => {
                void presentSubscriptionPaywall();
              }}
            >
              <Text style={styles.paywallButtonText}>{t(locale, 'settings.subscription.showPaywall')}</Text>
            </TouchableOpacity>
          </>
        ) : onboardingMode === 'personalized' && personalizedRules ? (
          <>
            <Text style={styles.rulesLine}>
              {t(locale, 'rules.deposit')}: ${personalizedRules.recommendedSecuredDepositUsd}
            </Text>
            <Text style={styles.rulesLine}>
              {t(locale, 'rules.strategy')}: {t(locale, `rules.strategy.${personalizedRules.cardStrategy}`)}
            </Text>
            <Text style={styles.rulesLine}>
              {t(locale, 'rules.disputeTiming')}:{' '}
              {t(locale, `rules.dispute.${personalizedRules.disputeTiming}`)}
            </Text>
            <Text style={styles.rulesLine}>
              {t(locale, 'rules.applicationTiming')}:{' '}
              {t(locale, `rules.application.${personalizedRules.applicationTiming}`)}
            </Text>
          </>
        ) : (
          <Text style={styles.rulesLine}>{t(locale, 'rules.anonymous')}</Text>
        )}
      </SectionCard>

      <SectionCard title={t(locale, 'cards.title')}>
        <Text style={styles.sampleNotice}>{t(locale, 'cards.sampleNotice')}</Text>
        {recommendations.length === 0 ? (
          <Text style={styles.emptyText}>{t(locale, 'cards.none')}</Text>
        ) : (
          recommendations.map((recommendation) => (
            <View key={recommendation.product.id} style={styles.cardRow}>
              <Text style={styles.cardTitle}>
                {recommendation.product.issuer} - {recommendation.product.name}
              </Text>
              <Text style={styles.score}>
                {t(locale, 'cards.outcome')}: {t(locale, `cards.outcome.${recommendation.outcome}`)}
              </Text>
              <Text style={styles.approvalNote}>{t(locale, 'cards.approvalNote')}</Text>

              <Text style={styles.sectionLabel}>{t(locale, 'cards.reason')}</Text>
              {recommendation.reasons.map((reason) => (
                <Text key={reason} style={styles.reasonLine}>
                  - {reason}
                </Text>
              ))}

              {recommendation.cautions.length > 0 ? (
                <>
                  <Text style={styles.sectionLabel}>{t(locale, 'cards.caution')}</Text>
                  {recommendation.cautions.map((caution) => (
                    <Text key={caution} style={styles.cautionLine}>
                      - {caution}
                    </Text>
                  ))}
                </>
              ) : null}
            </View>
          ))
        )}
      </SectionCard>

      <SectionCard title={compliance.title}>
        {compliance.bullets.map((line) => (
          <Text key={line} style={styles.complianceText}>
            - {line}
          </Text>
        ))}
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
  emptyText: {
    color: theme.colors.slate,
    fontFamily: theme.fonts.body
  },
  sampleNotice: {
    color: theme.colors.slate,
    fontFamily: theme.fonts.body,
    fontSize: 12
  },
  rulesLine: {
    color: theme.colors.slate,
    fontFamily: theme.fonts.body
  },
  cardRow: {
    borderWidth: 1,
    borderColor: theme.colors.cloud,
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
    backgroundColor: theme.colors.panel,
    marginBottom: theme.spacing.sm
  },
  cardTitle: {
    color: theme.colors.ink,
    fontSize: 16,
    fontFamily: theme.fonts.medium
  },
  score: {
    color: theme.colors.accent,
    fontFamily: theme.fonts.mono,
    marginTop: 2
  },
  approvalNote: {
    color: theme.colors.slate,
    fontFamily: theme.fonts.body,
    fontSize: 12,
    marginBottom: theme.spacing.sm
  },
  sectionLabel: {
    color: theme.colors.ink,
    fontFamily: theme.fonts.medium,
    marginTop: 6
  },
  reasonLine: {
    color: theme.colors.slate,
    fontFamily: theme.fonts.body
  },
  cautionLine: {
    color: theme.colors.warning,
    fontFamily: theme.fonts.body
  },
  paywallButton: {
    marginTop: theme.spacing.md,
    backgroundColor: theme.colors.accent,
    borderRadius: theme.radius.sm,
    paddingVertical: 10,
    alignItems: 'center'
  },
  paywallButtonText: {
    color: theme.colors.white,
    fontFamily: theme.fonts.medium
  },
  complianceText: {
    color: theme.colors.slate,
    fontFamily: theme.fonts.body,
    marginBottom: 4
  }
});
