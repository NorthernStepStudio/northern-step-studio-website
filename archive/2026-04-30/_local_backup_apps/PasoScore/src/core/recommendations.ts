import { SECURED_CARD_PRODUCTS } from './data';
import { CardRecommendation, LocaleCode, UserProfile } from './types';
import { t } from './i18n';

const buildRecommendation = (
  profile: UserProfile,
  productId: string,
  locale: LocaleCode
): CardRecommendation | null => {
  const product = SECURED_CARD_PRODUCTS.find((item) => item.id === productId);
  if (!product) {
    return null;
  }

  if (profile.availableDepositUsd < product.minDepositUsd) {
    return null;
  }

  if (product.annualFeeUsd > profile.maxAnnualFeeUsd) {
    return null;
  }

  const reasons: string[] = [];
  const cautions: string[] = [];

  if (product.annualFeeUsd === 0) {
    reasons.push(t(locale, 'card.reason.no_fee'));
  } else {
    reasons.push(t(locale, 'card.reason.fee_budget'));
  }

  if (product.reportsAllBureaus) {
    reasons.push(t(locale, 'card.reason.all_bureaus'));
  }

  if (product.allowsUpgradePath) {
    reasons.push(t(locale, 'card.reason.upgrade_path'));
  }

  if (profile.prefersNoHardPull && product.hardPullLikely) {
    cautions.push(t(locale, 'card.caution.hard_pull_preference'));
  }

  if (product.hardPullLikely) {
    cautions.push(t(locale, 'card.caution.hard_pull_general'));
  }

  if (profile.hardInquiriesEstimate >= 4) {
    cautions.push(t(locale, 'card.caution.inquiries_high'));
  }

  if (profile.revolvingUtilizationPct > 30) {
    cautions.push(t(locale, 'card.caution.utilization_high'));
  }

  if (profile.recentLatePayments) {
    cautions.push(t(locale, 'card.caution.recent_lates'));
  }

  reasons.push(t(locale, product.notesKey));

  let outcome: CardRecommendation['outcome'];
  if (cautions.length > 0) {
    outcome = 'use_caution';
  } else if (product.annualFeeUsd > 0 || !product.allowsUpgradePath) {
    outcome = 'possible_fit';
  } else {
    outcome = 'strong_fit';
  }

  return {
    product,
    outcome,
    reasons,
    cautions
  };
};

export const recommendSecuredCards = (
  profile: UserProfile,
  locale: LocaleCode,
  limit = 3
): CardRecommendation[] => {
  const recommendations = SECURED_CARD_PRODUCTS.map((product) =>
    buildRecommendation(profile, product.id, locale)
  ).filter((item): item is CardRecommendation => item !== null);

  return recommendations
    .sort((a, b) => {
      const rank = (value: CardRecommendation['outcome']): number => {
        if (value === 'strong_fit') {
          return 0;
        }

        if (value === 'possible_fit') {
          return 1;
        }

        return 2;
      };
      const outcomeRankA = rank(a.outcome);
      const outcomeRankB = rank(b.outcome);

      if (outcomeRankA !== outcomeRankB) {
        return outcomeRankA - outcomeRankB;
      }

      if (a.product.annualFeeUsd !== b.product.annualFeeUsd) {
        return a.product.annualFeeUsd - b.product.annualFeeUsd;
      }

      return a.product.minDepositUsd - b.product.minDepositUsd;
    })
    .slice(0, limit);
};
