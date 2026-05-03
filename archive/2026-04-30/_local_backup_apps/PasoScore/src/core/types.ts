export type LocaleCode = 'en' | 'es' | 'it';

export type FicoBand = 'unknown' | 'poor' | 'fair' | 'good' | 'excellent';
export type CreditStage = 'no_credit' | 'thin_file' | 'missed_payments' | 'secured_card_stage';
export type DecisionPathCode = 'A' | 'B' | 'C' | 'D';
export type OnboardingMode = 'anonymous' | 'personalized';
export type AnonymousSituation = 'no_credit' | 'thin_file' | 'bad_credit' | 'denied_recently';
export type IncomeRange = 'unknown' | 'under_30k' | '30k_to_60k' | '60k_to_100k' | '100k_plus';
export type CardStrategy =
  | 'starter_focus'
  | 'stability_first'
  | 'utilization_first'
  | 'conservative_rebuild';
export type DisputeTiming = 'not_needed_now' | 'this_month' | 'after_30_days' | 'after_60_days';
export type ApplicationTiming = 'apply_now' | 'wait_30_days' | 'wait_90_days';
export type RiskLevel = 'low' | 'medium' | 'high';

export interface UserProfile {
  firstName: string;
  creditStage: CreditStage;
  incomeRange: IncomeRange;
  ficoBand: FicoBand;
  monthlyBudgetUsd: number;
  availableDepositUsd: number;
  openAccounts: number;
  recentLatePayments: boolean;
  revolvingUtilizationPct: number;
  hardInquiriesEstimate: number;
  deniedRecently: boolean;
  hasCollections: boolean;
  wantsAutoPay: boolean;
  maxAnnualFeeUsd: number;
  prefersNoHardPull: boolean;
  stateCode: string;
}

export type StepStatus = 'todo' | 'in_progress' | 'done' | 'blocked';

export interface RoadmapStep {
  id: string;
  pathCode: DecisionPathCode;
  titleKey: string;
  descriptionKey: string;
  category:
    | 'foundation'
    | 'payment_history'
    | 'utilization'
    | 'dispute_hygiene'
    | 'credit_mix';
  priority: number;
  sequenceMonth: number;
  estimatedDays: number;
  complianceKey: string;
  prerequisiteIds: string[];
}

export interface StepProgress {
  stepId: string;
  status: StepStatus;
  startedAt?: string;
  completedAt?: string;
}

export interface EducationModule {
  id: string;
  titleKey: string;
  summaryKey: string;
  detailHowKey: string;
  detailWhyKey: string;
  detailBestKey: string;
  minutes: number;
  tags: string[];
}

export interface EducationProgress {
  moduleId: string;
  completed: boolean;
  completedAt?: string;
}

export interface CardProduct {
  id: string;
  issuer: string;
  name: string;
  minDepositUsd: number;
  annualFeeUsd: number;
  allowsUpgradePath: boolean;
  reportsAllBureaus: boolean;
  hardPullLikely: boolean;
  notesKey: string;
}

export interface CardRecommendation {
  product: CardProduct;
  outcome: 'strong_fit' | 'possible_fit' | 'use_caution';
  reasons: string[];
  cautions: string[];
}

export interface NextBestAction {
  stepId: string;
  reason: string;
  confidence: 'high' | 'medium' | 'low';
}

export type LetterTemplateType =
  | 'goodwill_request'
  | 'debt_validation_request'
  | 'hardship_plan_request';

export interface LetterInput {
  template: LetterTemplateType;
  senderName: string;
  senderAddress: string;
  recipientName: string;
  recipientAddress: string;
  accountReference: string;
  explanation: string;
  locale: LocaleCode;
  dateIso?: string;
}

export interface RenderedLetter {
  title: string;
  body: string;
  footer: string;
}

export interface JourneyMoment {
  id: 'denial' | 'confusion' | 'turning_point' | 'system' | 'results';
  titleKey: string;
  bodyKey: string;
}

export interface DecisionPath {
  code: DecisionPathCode;
  stage: CreditStage;
  titleKey: string;
  descriptionKey: string;
}

export interface PersonalizedOnboardingInput {
  incomeRange: IncomeRange;
  creditStage: CreditStage;
  openAccounts: number;
  utilizationPct: number;
  missedPayments: boolean;
  hardInquiriesEstimate: number;
}

export interface PersonalizedRulesOutput {
  recommendedSecuredDepositUsd: number;
  cardStrategy: CardStrategy;
  disputeTiming: DisputeTiming;
  applicationTiming: ApplicationTiming;
  riskLevel: RiskLevel;
}

export interface AccountProfile {
  displayName: string;
  email: string;
  appUserId: string;
  linkedToBilling: boolean;
}

export interface PersistedState {
  locale: LocaleCode;
  profile: UserProfile;
  stepProgress: StepProgress[];
  educationProgress: EducationProgress[];
  onboardingCompleted: boolean;
  onboardingMode: OnboardingMode | null;
  accountProfile?: AccountProfile;
}
