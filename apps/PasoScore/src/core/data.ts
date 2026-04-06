import {
  CardProduct,
  CreditStage,
  DecisionPath,
  EducationModule,
  IncomeRange,
  JourneyMoment,
  RoadmapStep,
  UserProfile
} from './types';

const isCreditStage = (value: unknown): value is CreditStage => {
  return (
    value === 'no_credit' ||
    value === 'thin_file' ||
    value === 'missed_payments' ||
    value === 'secured_card_stage'
  );
};

const isIncomeRange = (value: unknown): value is IncomeRange => {
  return (
    value === 'unknown' ||
    value === 'under_30k' ||
    value === '30k_to_60k' ||
    value === '60k_to_100k' ||
    value === '100k_plus'
  );
};

export const DEFAULT_PROFILE: UserProfile = {
  firstName: 'Founder',
  creditStage: 'no_credit',
  incomeRange: 'unknown',
  ficoBand: 'unknown',
  monthlyBudgetUsd: 250,
  availableDepositUsd: 300,
  openAccounts: 0,
  recentLatePayments: false,
  revolvingUtilizationPct: 0,
  hardInquiriesEstimate: 0,
  deniedRecently: false,
  hasCollections: false,
  wantsAutoPay: true,
  maxAnnualFeeUsd: 39,
  prefersNoHardPull: false,
  stateCode: 'FL'
};

export const normalizeProfile = (input: Partial<UserProfile> | null | undefined): UserProfile => {
  const merged: UserProfile = {
    ...DEFAULT_PROFILE,
    ...(input ?? {})
  };

  if (!isCreditStage((input as { creditStage?: unknown } | undefined)?.creditStage)) {
    merged.creditStage = DEFAULT_PROFILE.creditStage;
  }

  if (!isIncomeRange((input as { incomeRange?: unknown } | undefined)?.incomeRange)) {
    merged.incomeRange = DEFAULT_PROFILE.incomeRange;
  }

  merged.openAccounts = Math.max(0, Math.floor(merged.openAccounts));
  merged.hardInquiriesEstimate = Math.max(0, Math.floor(merged.hardInquiriesEstimate));
  merged.revolvingUtilizationPct = Math.max(0, Math.min(100, Math.floor(merged.revolvingUtilizationPct)));

  return merged;
};

export const DECISION_PATHS: DecisionPath[] = [
  {
    code: 'A',
    stage: 'no_credit',
    titleKey: 'path.A.title',
    descriptionKey: 'path.A.desc'
  },
  {
    code: 'B',
    stage: 'thin_file',
    titleKey: 'path.B.title',
    descriptionKey: 'path.B.desc'
  },
  {
    code: 'C',
    stage: 'missed_payments',
    titleKey: 'path.C.title',
    descriptionKey: 'path.C.desc'
  },
  {
    code: 'D',
    stage: 'secured_card_stage',
    titleKey: 'path.D.title',
    descriptionKey: 'path.D.desc'
  }
];

export const JOURNEY_TIMELINE: JourneyMoment[] = [
  {
    id: 'denial',
    titleKey: 'journey.denial.title',
    bodyKey: 'journey.denial.body'
  },
  {
    id: 'confusion',
    titleKey: 'journey.confusion.title',
    bodyKey: 'journey.confusion.body'
  },
  {
    id: 'turning_point',
    titleKey: 'journey.turning_point.title',
    bodyKey: 'journey.turning_point.body'
  },
  {
    id: 'system',
    titleKey: 'journey.system.title',
    bodyKey: 'journey.system.body'
  },
  {
    id: 'results',
    titleKey: 'journey.results.title',
    bodyKey: 'journey.results.body'
  }
];

export const ROADMAP_STEPS: RoadmapStep[] = [
  {
    id: 'a_budget_buffer',
    pathCode: 'A',
    titleKey: 'step.a_budget_buffer.title',
    descriptionKey: 'step.a_budget_buffer.desc',
    category: 'foundation',
    priority: 100,
    sequenceMonth: 1,
    estimatedDays: 10,
    complianceKey: 'step.a_budget_buffer.note',
    prerequisiteIds: []
  },
  {
    id: 'a_unsecured_precheck',
    pathCode: 'A',
    titleKey: 'step.a_unsecured_precheck.title',
    descriptionKey: 'step.a_unsecured_precheck.desc',
    category: 'credit_mix',
    priority: 95,
    sequenceMonth: 1,
    estimatedDays: 5,
    complianceKey: 'step.a_unsecured_precheck.note',
    prerequisiteIds: ['a_budget_buffer']
  },
  {
    id: 'a_first_reporting_line',
    pathCode: 'A',
    titleKey: 'step.a_first_reporting_line.title',
    descriptionKey: 'step.a_first_reporting_line.desc',
    category: 'credit_mix',
    priority: 92,
    sequenceMonth: 1,
    estimatedDays: 14,
    complianceKey: 'step.a_first_reporting_line.note',
    prerequisiteIds: ['a_unsecured_precheck']
  },
  {
    id: 'a_autopay_protection',
    pathCode: 'A',
    titleKey: 'step.a_autopay_protection.title',
    descriptionKey: 'step.a_autopay_protection.desc',
    category: 'payment_history',
    priority: 88,
    sequenceMonth: 2,
    estimatedDays: 4,
    complianceKey: 'step.a_autopay_protection.note',
    prerequisiteIds: ['a_first_reporting_line']
  },
  {
    id: 'a_first_60_days',
    pathCode: 'A',
    titleKey: 'step.a_first_60_days.title',
    descriptionKey: 'step.a_first_60_days.desc',
    category: 'payment_history',
    priority: 82,
    sequenceMonth: 3,
    estimatedDays: 60,
    complianceKey: 'step.a_first_60_days.note',
    prerequisiteIds: ['a_autopay_protection']
  },
  {
    id: 'b_keep_oldest_active',
    pathCode: 'B',
    titleKey: 'step.b_keep_oldest_active.title',
    descriptionKey: 'step.b_keep_oldest_active.desc',
    category: 'foundation',
    priority: 96,
    sequenceMonth: 1,
    estimatedDays: 1,
    complianceKey: 'step.b_keep_oldest_active.note',
    prerequisiteIds: []
  },
  {
    id: 'b_unsecured_precheck',
    pathCode: 'B',
    titleKey: 'step.b_unsecured_precheck.title',
    descriptionKey: 'step.b_unsecured_precheck.desc',
    category: 'credit_mix',
    priority: 92,
    sequenceMonth: 2,
    estimatedDays: 5,
    complianceKey: 'step.b_unsecured_precheck.note',
    prerequisiteIds: ['b_keep_oldest_active']
  },
  {
    id: 'b_add_second_line',
    pathCode: 'B',
    titleKey: 'step.b_add_second_line.title',
    descriptionKey: 'step.b_add_second_line.desc',
    category: 'credit_mix',
    priority: 90,
    sequenceMonth: 2,
    estimatedDays: 20,
    complianceKey: 'step.b_add_second_line.note',
    prerequisiteIds: ['b_unsecured_precheck']
  },
  {
    id: 'b_utilization_window',
    pathCode: 'B',
    titleKey: 'step.b_utilization_window.title',
    descriptionKey: 'step.b_utilization_window.desc',
    category: 'utilization',
    priority: 84,
    sequenceMonth: 3,
    estimatedDays: 30,
    complianceKey: 'step.b_utilization_window.note',
    prerequisiteIds: ['b_add_second_line']
  },
  {
    id: 'b_monthly_review',
    pathCode: 'B',
    titleKey: 'step.b_monthly_review.title',
    descriptionKey: 'step.b_monthly_review.desc',
    category: 'foundation',
    priority: 78,
    sequenceMonth: 4,
    estimatedDays: 30,
    complianceKey: 'step.b_monthly_review.note',
    prerequisiteIds: ['b_utilization_window']
  },
  {
    id: 'c_stop_new_lates',
    pathCode: 'C',
    titleKey: 'step.c_stop_new_lates.title',
    descriptionKey: 'step.c_stop_new_lates.desc',
    category: 'payment_history',
    priority: 100,
    sequenceMonth: 1,
    estimatedDays: 7,
    complianceKey: 'step.c_stop_new_lates.note',
    prerequisiteIds: []
  },
  {
    id: 'c_catch_up_plan',
    pathCode: 'C',
    titleKey: 'step.c_catch_up_plan.title',
    descriptionKey: 'step.c_catch_up_plan.desc',
    category: 'payment_history',
    priority: 92,
    sequenceMonth: 2,
    estimatedDays: 21,
    complianceKey: 'step.c_catch_up_plan.note',
    prerequisiteIds: ['c_stop_new_lates']
  },
  {
    id: 'c_document_requests',
    pathCode: 'C',
    titleKey: 'step.c_document_requests.title',
    descriptionKey: 'step.c_document_requests.desc',
    category: 'dispute_hygiene',
    priority: 86,
    sequenceMonth: 3,
    estimatedDays: 14,
    complianceKey: 'step.c_document_requests.note',
    prerequisiteIds: ['c_catch_up_plan']
  },
  {
    id: 'c_stability_cycle',
    pathCode: 'C',
    titleKey: 'step.c_stability_cycle.title',
    descriptionKey: 'step.c_stability_cycle.desc',
    category: 'foundation',
    priority: 80,
    sequenceMonth: 4,
    estimatedDays: 60,
    complianceKey: 'step.c_stability_cycle.note',
    prerequisiteIds: ['c_document_requests']
  },
  {
    id: 'd_unsecured_precheck',
    pathCode: 'D',
    titleKey: 'step.d_unsecured_precheck.title',
    descriptionKey: 'step.d_unsecured_precheck.desc',
    category: 'credit_mix',
    priority: 99,
    sequenceMonth: 1,
    estimatedDays: 5,
    complianceKey: 'step.d_unsecured_precheck.note',
    prerequisiteIds: []
  },
  {
    id: 'd_open_card',
    pathCode: 'D',
    titleKey: 'step.d_open_card.title',
    descriptionKey: 'step.d_open_card.desc',
    category: 'credit_mix',
    priority: 98,
    sequenceMonth: 1,
    estimatedDays: 14,
    complianceKey: 'step.d_open_card.note',
    prerequisiteIds: ['d_unsecured_precheck']
  },
  {
    id: 'd_utilization_under_10',
    pathCode: 'D',
    titleKey: 'step.d_utilization_under_10.title',
    descriptionKey: 'step.d_utilization_under_10.desc',
    category: 'utilization',
    priority: 92,
    sequenceMonth: 2,
    estimatedDays: 45,
    complianceKey: 'step.d_utilization_under_10.note',
    prerequisiteIds: ['d_open_card']
  },
  {
    id: 'd_limit_increase_request',
    pathCode: 'D',
    titleKey: 'step.d_limit_increase_request.title',
    descriptionKey: 'step.d_limit_increase_request.desc',
    category: 'credit_mix',
    priority: 88,
    sequenceMonth: 3,
    estimatedDays: 15,
    complianceKey: 'step.d_limit_increase_request.note',
    prerequisiteIds: ['d_utilization_under_10']
  },
  {
    id: 'd_second_tradeline',
    pathCode: 'D',
    titleKey: 'step.d_second_tradeline.title',
    descriptionKey: 'step.d_second_tradeline.desc',
    category: 'credit_mix',
    priority: 84,
    sequenceMonth: 6,
    estimatedDays: 21,
    complianceKey: 'step.d_second_tradeline.note',
    prerequisiteIds: ['d_limit_increase_request']
  },
  {
    id: 'd_inquiry_planning',
    pathCode: 'D',
    titleKey: 'step.d_inquiry_planning.title',
    descriptionKey: 'step.d_inquiry_planning.desc',
    category: 'foundation',
    priority: 80,
    sequenceMonth: 9,
    estimatedDays: 30,
    complianceKey: 'step.d_inquiry_planning.note',
    prerequisiteIds: ['d_second_tradeline']
  },
  {
    id: 'd_transition_unsecured',
    pathCode: 'D',
    titleKey: 'step.d_transition_unsecured.title',
    descriptionKey: 'step.d_transition_unsecured.desc',
    category: 'credit_mix',
    priority: 78,
    sequenceMonth: 12,
    estimatedDays: 45,
    complianceKey: 'step.d_transition_unsecured.note',
    prerequisiteIds: ['d_inquiry_planning']
  }
];

export const EDUCATION_MODULES: EducationModule[] = [
  {
    id: 'basics',
    titleKey: 'education.basics.title',
    summaryKey: 'education.basics.summary',
    detailHowKey: 'education.basics.how',
    detailWhyKey: 'education.basics.why',
    detailBestKey: 'education.basics.best',
    minutes: 10,
    tags: ['foundation', 'rules']
  },
  {
    id: 'utilization_timing',
    titleKey: 'education.utilization.title',
    summaryKey: 'education.utilization.summary',
    detailHowKey: 'education.utilization.how',
    detailWhyKey: 'education.utilization.why',
    detailBestKey: 'education.utilization.best',
    minutes: 8,
    tags: ['utilization', 'timing']
  },
  {
    id: 'dispute_documentation',
    titleKey: 'education.disputes.title',
    summaryKey: 'education.disputes.summary',
    detailHowKey: 'education.disputes.how',
    detailWhyKey: 'education.disputes.why',
    detailBestKey: 'education.disputes.best',
    minutes: 9,
    tags: ['disputes', 'letters']
  },
  {
    id: 'secured_card_terms',
    titleKey: 'education.cards.title',
    summaryKey: 'education.cards.summary',
    detailHowKey: 'education.cards.how',
    detailWhyKey: 'education.cards.why',
    detailBestKey: 'education.cards.best',
    minutes: 7,
    tags: ['cards', 'fees']
  },
  {
    id: 'monthly_review',
    titleKey: 'education.results.title',
    summaryKey: 'education.results.summary',
    detailHowKey: 'education.results.how',
    detailWhyKey: 'education.results.why',
    detailBestKey: 'education.results.best',
    minutes: 6,
    tags: ['discipline', 'retention']
  }
];

export const SECURED_CARD_PRODUCTS: CardProduct[] = [
  {
    id: 'starter-lowfee',
    issuer: 'Credit Union Network',
    name: 'Starter Secured',
    minDepositUsd: 200,
    annualFeeUsd: 25,
    allowsUpgradePath: true,
    reportsAllBureaus: true,
    hardPullLikely: false,
    notesKey: 'card.notes.lowfee'
  },
  {
    id: 'starter-nofee',
    issuer: 'Community Bank Co.',
    name: 'Build No-Fee Secured',
    minDepositUsd: 300,
    annualFeeUsd: 0,
    allowsUpgradePath: false,
    reportsAllBureaus: true,
    hardPullLikely: true,
    notesKey: 'card.notes.nofee'
  },
  {
    id: 'starter-upgrade',
    issuer: 'Metro Card Services',
    name: 'Graduation Secured Plus',
    minDepositUsd: 400,
    annualFeeUsd: 39,
    allowsUpgradePath: true,
    reportsAllBureaus: true,
    hardPullLikely: true,
    notesKey: 'card.notes.upgrade'
  }
];
