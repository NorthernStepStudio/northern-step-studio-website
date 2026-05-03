import {
  AnonymousSituation,
  CreditStage,
  OnboardingMode,
  PersonalizedOnboardingInput,
  PersonalizedRulesOutput,
  RiskLevel,
  UserProfile
} from './types';

export const mapAnonymousSituationToStage = (situation: AnonymousSituation): CreditStage => {
  switch (situation) {
    case 'no_credit':
      return 'no_credit';
    case 'thin_file':
      return 'thin_file';
    case 'bad_credit':
      return 'missed_payments';
    case 'denied_recently':
      return 'secured_card_stage';
    default:
      return 'no_credit';
  }
};

export const buildProfileFromPersonalizedInput = (
  base: UserProfile,
  input: PersonalizedOnboardingInput
): UserProfile => {
  return {
    ...base,
    incomeRange: input.incomeRange,
    creditStage: input.creditStage,
    openAccounts: Math.max(0, Math.floor(input.openAccounts)),
    revolvingUtilizationPct: Math.max(0, Math.min(100, Math.floor(input.utilizationPct))),
    recentLatePayments: input.missedPayments,
    hardInquiriesEstimate: Math.max(0, Math.floor(input.hardInquiriesEstimate)),
    deniedRecently: false
  };
};

const computeRiskLevel = (profile: UserProfile): RiskLevel => {
  let riskPoints = 0;

  if (profile.recentLatePayments) {
    riskPoints += 2;
  }

  if (profile.hasCollections) {
    riskPoints += 2;
  }

  if (profile.revolvingUtilizationPct >= 70) {
    riskPoints += 2;
  } else if (profile.revolvingUtilizationPct >= 30) {
    riskPoints += 1;
  }

  if (profile.hardInquiriesEstimate >= 6) {
    riskPoints += 2;
  } else if (profile.hardInquiriesEstimate >= 3) {
    riskPoints += 1;
  }

  if (profile.deniedRecently) {
    riskPoints += 1;
  }

  if (profile.openAccounts === 0) {
    riskPoints += 1;
  }

  if (profile.incomeRange === 'under_30k') {
    riskPoints += 1;
  }

  if (riskPoints >= 6) {
    return 'high';
  }

  if (riskPoints >= 3) {
    return 'medium';
  }

  return 'low';
};

const recommendedDeposit = (profile: UserProfile, riskLevel: RiskLevel): number => {
  if (riskLevel === 'high') {
    return 200;
  }

  if (riskLevel === 'medium') {
    return 300;
  }

  if (profile.incomeRange === '100k_plus' || profile.incomeRange === '60k_to_100k') {
    return 500;
  }

  return 300;
};

export const buildPersonalizedRules = (
  profile: UserProfile,
  mode: OnboardingMode | null
): PersonalizedRulesOutput | null => {
  if (mode !== 'personalized') {
    return null;
  }

  const riskLevel = computeRiskLevel(profile);

  const cardStrategy = profile.recentLatePayments
    ? 'conservative_rebuild'
    : profile.revolvingUtilizationPct > 30
    ? 'utilization_first'
    : profile.openAccounts === 0
    ? 'starter_focus'
    : 'stability_first';

  const disputeTiming = profile.hasCollections
    ? 'this_month'
    : profile.recentLatePayments
    ? 'after_30_days'
    : profile.hardInquiriesEstimate >= 6
    ? 'after_60_days'
    : 'not_needed_now';

  const applicationTiming = profile.recentLatePayments || profile.hasCollections
    ? 'wait_90_days'
    : profile.hardInquiriesEstimate >= 4 || profile.revolvingUtilizationPct > 30
    ? 'wait_30_days'
    : 'apply_now';

  return {
    recommendedSecuredDepositUsd: recommendedDeposit(profile, riskLevel),
    cardStrategy,
    disputeTiming,
    applicationTiming,
    riskLevel
  };
};
