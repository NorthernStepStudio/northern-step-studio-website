import React, { createContext, PropsWithChildren, useContext, useEffect, useMemo, useState } from 'react';

import { getComplianceGuardrail } from '../core/compliance';
import { DEFAULT_PROFILE, JOURNEY_TIMELINE, normalizeProfile } from '../core/data';
import {
  getEducationModules,
  reconcileEducationProgress,
  seedEducationProgress,
  setModuleComplete
} from '../core/education';
import { languageLabel, SUPPORTED_LOCALES } from '../core/i18n';
import { getNextBestAction } from '../core/nextBestAction';
import {
  buildPersonalizedRules,
  buildProfileFromPersonalizedInput,
  mapAnonymousSituationToStage
} from '../core/onboarding';
import { recommendSecuredCards } from '../core/recommendations';
import {
  buildRoadmap,
  reconcileStepProgress,
  resolveDecisionPath,
  seedStepProgress,
  updateStepStatus as applyStepStatus
} from '../core/roadmap';
import { clearPersistedState, loadPersistedState, savePersistedState } from '../core/storage';
import {
  fetchRevenueCatSnapshot,
  initializeRevenueCatBase,
  linkRevenueCatAccount,
  presentRevenueCatCustomerCenter,
  presentRevenueCatPaywall,
  purchaseRevenueCatPackage,
  RevenueCatPaywallOutcome,
  restoreRevenueCatPurchases,
  RevenueCatSnapshot,
  unlinkRevenueCatAccount
} from '../services/revenuecat';
import {
  AccountProfile,
  AnonymousSituation,
  CardRecommendation,
  CreditStage,
  DecisionPath,
  EducationModule,
  EducationProgress,
  JourneyMoment,
  LocaleCode,
  NextBestAction,
  OnboardingMode,
  PersonalizedOnboardingInput,
  PersonalizedRulesOutput,
  RoadmapStep,
  StepProgress,
  StepStatus,
  UserProfile
} from '../core/types';

interface CompanionContextValue {
  hydrated: boolean;
  onboardingCompleted: boolean;
  onboardingMode: OnboardingMode | null;
  locale: LocaleCode;
  localeOptions: Array<{ code: LocaleCode; label: string }>;
  setLocale: (locale: LocaleCode) => void;
  accountProfile: AccountProfile;
  updateAccountProfile: (patch: Partial<AccountProfile>) => void;
  linkBillingIdentity: (appUserId?: string) => Promise<boolean>;
  unlinkBillingIdentity: () => Promise<boolean>;
  resetLocalData: () => Promise<void>;
  profile: UserProfile;
  setProfile: (profile: UserProfile) => void;
  completeAnonymousOnboarding: (situation: AnonymousSituation) => void;
  completePersonalizedOnboarding: (input: PersonalizedOnboardingInput) => void;
  restartOnboarding: () => void;
  setCreditStage: (stage: CreditStage) => void;
  activePath: DecisionPath;
  journey: JourneyMoment[];
  roadmap: RoadmapStep[];
  stepProgress: StepProgress[];
  updateStepStatus: (stepId: string, status: StepStatus) => void;
  educationModules: EducationModule[];
  educationProgress: EducationProgress[];
  setEducationCompleted: (moduleId: string, completed: boolean) => void;
  recommendations: CardRecommendation[];
  personalizedRules: PersonalizedRulesOutput | null;
  subscription: RevenueCatSnapshot;
  subscriptionBusy: boolean;
  refreshSubscription: () => Promise<void>;
  presentSubscriptionPaywall: () => Promise<RevenueCatPaywallOutcome>;
  openSubscriptionCustomerCenter: () => Promise<boolean>;
  purchaseSubscriptionPackage: (packageIdentifier: string) => Promise<boolean>;
  restoreSubscriptionPurchases: () => Promise<boolean>;
  nextBestAction: NextBestAction | null;
  compliance: { title: string; bullets: string[] };
}

const CompanionContext = createContext<CompanionContextValue | null>(null);

const DEFAULT_ACCOUNT_PROFILE: AccountProfile = {
  displayName: '',
  email: '',
  appUserId: '',
  linkedToBilling: false
};

export function CompanionProvider({ children }: PropsWithChildren) {
  const defaultEntitlementId = process.env.EXPO_PUBLIC_REVENUECAT_ENTITLEMENT_ID?.trim() || 'pasoscore_pro';
  const [hydrated, setHydrated] = useState(false);
  const [onboardingCompleted, setOnboardingCompleted] = useState(false);
  const [onboardingMode, setOnboardingMode] = useState<OnboardingMode | null>(null);
  const [locale, setLocale] = useState<LocaleCode>('es');
  const [profile, setProfile] = useState<UserProfile>(DEFAULT_PROFILE);
  const [accountProfile, setAccountProfile] = useState<AccountProfile>(DEFAULT_ACCOUNT_PROFILE);
  const [subscription, setSubscription] = useState<RevenueCatSnapshot>({
    available: false,
    initialized: false,
    entitlementId: defaultEntitlementId,
    entitlementActive: false,
    packages: []
  });
  const [subscriptionBusy, setSubscriptionBusy] = useState(false);

  const roadmap = useMemo(() => buildRoadmap(profile), [profile]);
  const educationModules = useMemo(() => getEducationModules(), []);

  const [stepProgress, setStepProgress] = useState<StepProgress[]>(() => seedStepProgress(roadmap));
  const [educationProgress, setEducationProgress] = useState<EducationProgress[]>(() =>
    seedEducationProgress(educationModules)
  );

  useEffect(() => {
    let mounted = true;

    loadPersistedState()
      .then((saved) => {
        if (!mounted || !saved) {
          return;
        }

        setLocale(saved.locale);
        setProfile(normalizeProfile(saved.profile));
        setStepProgress(saved.stepProgress);
        setEducationProgress(saved.educationProgress);
        setOnboardingCompleted(saved.onboardingCompleted ?? false);
        setOnboardingMode(saved.onboardingMode ?? null);
        setAccountProfile({
          ...DEFAULT_ACCOUNT_PROFILE,
          ...(saved.accountProfile ?? {})
        });
      })
      .finally(() => {
        if (mounted) {
          setHydrated(true);
        }
      });

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    setStepProgress((current) => reconcileStepProgress(current, roadmap));
  }, [roadmap]);

  useEffect(() => {
    setEducationProgress((current) => reconcileEducationProgress(current, educationModules));
  }, [educationModules]);

  useEffect(() => {
    if (!hydrated) {
      return;
    }

    void savePersistedState({
      locale,
      profile,
      stepProgress,
      educationProgress,
      onboardingCompleted,
      onboardingMode,
      accountProfile
    });
  }, [
    hydrated,
    locale,
    profile,
    stepProgress,
    educationProgress,
    onboardingCompleted,
    onboardingMode,
    accountProfile
  ]);

  useEffect(() => {
    if (!hydrated) {
      return;
    }

    setSubscriptionBusy(true);
    void initializeRevenueCatBase(
      accountProfile.linkedToBilling && accountProfile.appUserId.trim().length > 0
        ? accountProfile.appUserId.trim()
        : undefined
    )
      .then((snapshot) => setSubscription(snapshot))
      .finally(() => setSubscriptionBusy(false));
  }, [hydrated, accountProfile.linkedToBilling, accountProfile.appUserId]);

  const recommendations = useMemo<CardRecommendation[]>(
    () => recommendSecuredCards(profile, locale),
    [profile, locale]
  );
  const personalizedRules = useMemo(
    () => buildPersonalizedRules(profile, onboardingMode),
    [profile, onboardingMode]
  );
  const activePath = useMemo(() => resolveDecisionPath(profile), [profile]);

  const nextBestAction = useMemo<NextBestAction | null>(
    () => getNextBestAction(profile, locale, roadmap, stepProgress),
    [locale, profile, roadmap, stepProgress]
  );

  const localeOptions = useMemo(
    () => SUPPORTED_LOCALES.map((code) => ({ code, label: languageLabel(code) })),
    []
  );

  const refreshSubscription = async (): Promise<void> => {
    setSubscriptionBusy(true);
    try {
      const snapshot = await fetchRevenueCatSnapshot();
      setSubscription(snapshot);
    } finally {
      setSubscriptionBusy(false);
    }
  };

  const linkBillingIdentity = async (appUserId?: string): Promise<boolean> => {
    const userId = (appUserId ?? accountProfile.appUserId).trim();
    if (!userId) {
      return false;
    }

    setSubscriptionBusy(true);
    try {
      const snapshot = await linkRevenueCatAccount(userId);
      setSubscription(snapshot);
      const linked = snapshot.available && !snapshot.reasonCode;
      setAccountProfile((current) => ({
        ...current,
        appUserId: userId,
        linkedToBilling: linked
      }));
      return linked;
    } finally {
      setSubscriptionBusy(false);
    }
  };

  const unlinkBillingIdentity = async (): Promise<boolean> => {
    setSubscriptionBusy(true);
    try {
      const snapshot = await unlinkRevenueCatAccount();
      setSubscription(snapshot);
      setAccountProfile((current) => ({
        ...current,
        linkedToBilling: false
      }));
      return true;
    } finally {
      setSubscriptionBusy(false);
    }
  };

  const purchaseSubscriptionPackage = async (packageIdentifier: string): Promise<boolean> => {
    setSubscriptionBusy(true);
    try {
      const snapshot = await purchaseRevenueCatPackage(packageIdentifier);
      setSubscription(snapshot);
      return snapshot.entitlementActive;
    } finally {
      setSubscriptionBusy(false);
    }
  };

  const restoreSubscriptionPurchases = async (): Promise<boolean> => {
    setSubscriptionBusy(true);
    try {
      const snapshot = await restoreRevenueCatPurchases();
      setSubscription(snapshot);
      return snapshot.entitlementActive;
    } finally {
      setSubscriptionBusy(false);
    }
  };

  const presentSubscriptionPaywall = async (): Promise<RevenueCatPaywallOutcome> => {
    setSubscriptionBusy(true);
    try {
      const result = await presentRevenueCatPaywall();
      const snapshot = await fetchRevenueCatSnapshot();
      setSubscription(snapshot);
      return result;
    } finally {
      setSubscriptionBusy(false);
    }
  };

  const openSubscriptionCustomerCenter = async (): Promise<boolean> => {
    setSubscriptionBusy(true);
    try {
      const opened = await presentRevenueCatCustomerCenter();
      const snapshot = await fetchRevenueCatSnapshot();
      setSubscription(snapshot);
      return opened;
    } finally {
      setSubscriptionBusy(false);
    }
  };

  const resetLocalData = async (): Promise<void> => {
    await clearPersistedState();

    const defaultProfile = normalizeProfile(DEFAULT_PROFILE);
    const defaultRoadmap = buildRoadmap(defaultProfile);

    setProfile(defaultProfile);
    setStepProgress(seedStepProgress(defaultRoadmap));
    setEducationProgress(seedEducationProgress(educationModules));
    setOnboardingCompleted(false);
    setOnboardingMode(null);
    setAccountProfile(DEFAULT_ACCOUNT_PROFILE);

    setSubscription({
      available: false,
      initialized: false,
      entitlementId: defaultEntitlementId,
      entitlementActive: false,
      packages: []
    });
  };

  const value: CompanionContextValue = {
    hydrated,
    onboardingCompleted,
    onboardingMode,
    locale,
    localeOptions,
    setLocale,
    accountProfile,
    updateAccountProfile: (patch) => {
      setAccountProfile((current) => ({
        ...current,
        ...patch
      }));
    },
    linkBillingIdentity,
    unlinkBillingIdentity,
    resetLocalData,
    profile,
    setProfile: (nextProfile) => setProfile(normalizeProfile(nextProfile)),
    completeAnonymousOnboarding: (situation) => {
      setProfile((current) =>
        normalizeProfile({
          ...current,
          creditStage: mapAnonymousSituationToStage(situation),
          incomeRange: 'unknown',
          openAccounts: 0,
          revolvingUtilizationPct: 0,
          hardInquiriesEstimate: 0,
          recentLatePayments: situation === 'bad_credit',
          deniedRecently: situation === 'denied_recently'
        })
      );
      setOnboardingMode('anonymous');
      setOnboardingCompleted(true);
    },
    completePersonalizedOnboarding: (input) => {
      setProfile((current) => normalizeProfile(buildProfileFromPersonalizedInput(current, input)));
      setOnboardingMode('personalized');
      setOnboardingCompleted(true);
    },
    restartOnboarding: () => {
      setOnboardingCompleted(false);
      setOnboardingMode(null);
    },
    setCreditStage: (stage) => {
      setProfile((current) => ({
        ...current,
        creditStage: stage
      }));
    },
    activePath,
    journey: JOURNEY_TIMELINE,
    roadmap,
    stepProgress,
    updateStepStatus: (stepId, status) => {
      setStepProgress((current) => applyStepStatus(current, roadmap, stepId, status));
    },
    educationModules,
    educationProgress,
    setEducationCompleted: (moduleId, completed) => {
      setEducationProgress((current) => setModuleComplete(current, moduleId, completed, educationModules));
    },
    recommendations,
    personalizedRules,
    subscription,
    subscriptionBusy,
    refreshSubscription,
    presentSubscriptionPaywall,
    openSubscriptionCustomerCenter,
    purchaseSubscriptionPackage,
    restoreSubscriptionPurchases,
    nextBestAction,
    compliance: getComplianceGuardrail(locale)
  };

  return <CompanionContext.Provider value={value}>{children}</CompanionContext.Provider>;
}

export function useCompanion(): CompanionContextValue {
  const value = useContext(CompanionContext);
  if (!value) {
    throw new Error('useCompanion must be used inside CompanionProvider');
  }

  return value;
}
