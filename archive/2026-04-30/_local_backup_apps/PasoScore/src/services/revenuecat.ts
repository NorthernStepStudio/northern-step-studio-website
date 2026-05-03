import Constants from 'expo-constants';
import { Platform } from 'react-native';

import type {
  CustomerInfo,
  PurchasesOffering,
  PurchasesOfferings,
  PurchasesPackage
} from 'react-native-purchases';

type RevenueCatReasonCode =
  | 'billing_unavailable'
  | 'billing_temporarily_unavailable'
  | 'status_error'
  | 'package_unavailable'
  | 'purchase_not_completed'
  | 'restore_failed';

export type RevenueCatPaywallOutcome =
  | 'purchased'
  | 'restored'
  | 'cancelled'
  | 'not_presented'
  | 'error'
  | 'unavailable';

export interface RevenueCatPackageView {
  identifier: string;
  packageType: string;
  productIdentifier: string;
  title: string;
  priceString: string;
}

export interface RevenueCatSnapshot {
  available: boolean;
  initialized: boolean;
  entitlementId: string;
  entitlementActive: boolean;
  packages: RevenueCatPackageView[];
  reasonCode?: RevenueCatReasonCode;
}

type PurchasesModule = {
  configure: (params: { apiKey: string; appUserID?: string }) => void;
  setLogLevel?: (level: unknown) => void;
  LOG_LEVEL?: { VERBOSE?: unknown; WARN?: unknown };
  getCustomerInfo: () => Promise<CustomerInfo>;
  getOfferings: () => Promise<PurchasesOfferings>;
  purchasePackage: (aPackage: PurchasesPackage) => Promise<{ customerInfo: CustomerInfo }>;
  restorePurchases: () => Promise<CustomerInfo>;
  logIn?: (appUserId: string) => Promise<{ customerInfo: CustomerInfo; created: boolean }>;
  logOut?: () => Promise<CustomerInfo>;
};

type RevenueCatUIResultValue =
  | 'NOT_PRESENTED'
  | 'ERROR'
  | 'CANCELLED'
  | 'PURCHASED'
  | 'RESTORED';

type RevenueCatUIModule = {
  presentPaywall?: (params?: {
    offering?: PurchasesOffering;
    displayCloseButton?: boolean;
  }) => Promise<RevenueCatUIResultValue>;
  presentPaywallIfNeeded?: (params: {
    requiredEntitlementIdentifier: string;
    offering?: PurchasesOffering;
    displayCloseButton?: boolean;
  }) => Promise<RevenueCatUIResultValue>;
  presentCustomerCenter: () => Promise<void>;
  PAYWALL_RESULT?: Record<string, RevenueCatUIResultValue>;
};

let cachedModule: PurchasesModule | null | undefined;
let cachedUIModule: RevenueCatUIModule | null | undefined;
let isInitialized = false;
let currentAppUserId: string | undefined;

const DEFAULT_ENTITLEMENT_ID = 'pasoscore_pro';
const PACKAGE_SORT_PRIORITY: Record<string, number> = {
  MONTHLY: 0,
  ANNUAL: 1,
  SIX_MONTH: 2,
  THREE_MONTH: 3,
  TWO_MONTH: 4,
  WEEKLY: 5,
  LIFETIME: 6,
  CUSTOM: 7,
  UNKNOWN: 8
};

const getEntitlementId = (): string => {
  const configured = process.env.EXPO_PUBLIC_REVENUECAT_ENTITLEMENT_ID?.trim();
  return configured && configured.length > 0 ? configured : DEFAULT_ENTITLEMENT_ID;
};

const getConfiguredOfferingId = (): string | null => {
  const configured = process.env.EXPO_PUBLIC_REVENUECAT_OFFERING_ID?.trim();
  if (!configured || configured.length === 0) {
    return null;
  }

  return configured;
};

const getApiKey = (): string => {
  if (Platform.OS === 'ios') {
    return (
      process.env.EXPO_PUBLIC_REVENUECAT_IOS_KEY ||
      process.env.EXPO_PUBLIC_REVENUECAT_API_KEY ||
      ''
    );
  }

  if (Platform.OS === 'android') {
    return (
      process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_KEY ||
      process.env.EXPO_PUBLIC_REVENUECAT_API_KEY ||
      ''
    );
  }

  return '';
};

const isExpoGo = (): boolean => {
  const ownership = Constants.appOwnership;
  const executionEnvironment = Constants.executionEnvironment;
  return ownership === 'expo' || executionEnvironment === 'storeClient';
};

const toUnavailableSnapshot = (reasonCode: RevenueCatReasonCode): RevenueCatSnapshot => ({
  available: false,
  initialized: false,
  entitlementId: getEntitlementId(),
  entitlementActive: false,
  packages: [],
  reasonCode
});

const getPurchasesModule = (): PurchasesModule | null => {
  if (cachedModule !== undefined) {
    return cachedModule;
  }

  try {
    const loaded = require('react-native-purchases').default as PurchasesModule;
    cachedModule = loaded;
  } catch {
    cachedModule = null;
  }

  return cachedModule;
};

const getPurchasesUIModule = (): RevenueCatUIModule | null => {
  if (cachedUIModule !== undefined) {
    return cachedUIModule;
  }

  try {
    const loaded = require('react-native-purchases-ui');
    const resolved = (loaded.default ?? loaded) as RevenueCatUIModule;
    cachedUIModule = resolved;
  } catch {
    cachedUIModule = null;
  }

  return cachedUIModule;
};

const canUseRevenueCat = (): { available: boolean; reasonCode?: RevenueCatReasonCode } => {
  if (Platform.OS === 'web') {
    return { available: false, reasonCode: 'billing_unavailable' };
  }

  if (isExpoGo()) {
    return {
      available: false,
      reasonCode: 'billing_unavailable'
    };
  }

  const apiKey = getApiKey();
  if (!apiKey) {
    return {
      available: false,
      reasonCode: 'billing_temporarily_unavailable'
    };
  }

  const module = getPurchasesModule();
  if (!module || typeof module.configure !== 'function') {
    return {
      available: false,
      reasonCode: 'billing_temporarily_unavailable'
    };
  }

  return { available: true };
};

const sortPackages = (packages: PurchasesPackage[]): PurchasesPackage[] => {
  return [...packages].sort((a, b) => {
    const aPriority = PACKAGE_SORT_PRIORITY[a.packageType] ?? 99;
    const bPriority = PACKAGE_SORT_PRIORITY[b.packageType] ?? 99;
    if (aPriority !== bPriority) {
      return aPriority - bPriority;
    }

    return a.identifier.localeCompare(b.identifier);
  });
};

const getPreferredOffering = (offerings: PurchasesOfferings): PurchasesOffering | null => {
  const configuredOfferingId = getConfiguredOfferingId();
  if (configuredOfferingId) {
    const configuredOffering = offerings.all[configuredOfferingId];
    if (configuredOffering) {
      return configuredOffering;
    }
  }

  if (offerings.current) {
    return offerings.current;
  }

  const firstOffering = Object.values(offerings.all)[0];
  return firstOffering ?? null;
};

const mapPackages = (offerings: PurchasesOfferings): RevenueCatPackageView[] => {
  const offering = getPreferredOffering(offerings);
  if (!offering || !offering.availablePackages.length) {
    return [];
  }

  return sortPackages(offering.availablePackages).map((pkg) => ({
    identifier: pkg.identifier,
    packageType: pkg.packageType,
    productIdentifier: pkg.product.identifier,
    title: pkg.product.title,
    priceString: pkg.product.priceString
  }));
};

const normalizeRevenueCatToken = (value: string): string => value.toLowerCase().replace(/[^a-z0-9]/g, '');

const resolveEntitlementId = (customerInfo: CustomerInfo): string => {
  const entitlementId = getEntitlementId();
  if (customerInfo.entitlements.all[entitlementId]) {
    return entitlementId;
  }

  const normalizedTarget = normalizeRevenueCatToken(entitlementId);
  const allEntitlementIds = Object.keys(customerInfo.entitlements.all);
  const fuzzyMatch = allEntitlementIds.find(
    (entryId) => normalizeRevenueCatToken(entryId) === normalizedTarget
  );
  if (fuzzyMatch) {
    return fuzzyMatch;
  }

  if (allEntitlementIds.length === 1) {
    const singleEntitlementId = allEntitlementIds[0];
    if (singleEntitlementId) {
      return singleEntitlementId;
    }
  }

  return entitlementId;
};

const getEntitlementState = (
  customerInfo: CustomerInfo
): {
  entitlementId: string;
  entitlementActive: boolean;
} => {
  const resolvedEntitlementId = resolveEntitlementId(customerInfo);
  return {
    entitlementId: resolvedEntitlementId,
    entitlementActive: Boolean(customerInfo.entitlements.active[resolvedEntitlementId])
  };
};

export const initializeRevenueCatBase = async (appUserId?: string): Promise<RevenueCatSnapshot> => {
  const availability = canUseRevenueCat();
  if (!availability.available) {
    return toUnavailableSnapshot(availability.reasonCode ?? 'billing_unavailable');
  }

  const module = getPurchasesModule();
  if (!module) {
    return toUnavailableSnapshot('billing_temporarily_unavailable');
  }

  if (!isInitialized) {
    try {
      if (module.setLogLevel) {
        if (__DEV__ && module.LOG_LEVEL?.VERBOSE) {
          module.setLogLevel(module.LOG_LEVEL.VERBOSE);
        } else if (module.LOG_LEVEL?.WARN) {
          module.setLogLevel(module.LOG_LEVEL.WARN);
        }
      }

      const config: { apiKey: string; appUserID?: string } = { apiKey: getApiKey() };
      if (appUserId) {
        config.appUserID = appUserId;
      }

      module.configure(config);
      currentAppUserId = appUserId?.trim() || undefined;

      isInitialized = true;
    } catch {
      return toUnavailableSnapshot('billing_temporarily_unavailable');
    }
  } else if (
    appUserId &&
    appUserId.trim().length > 0 &&
    appUserId.trim() !== currentAppUserId &&
    module.logIn
  ) {
    try {
      await module.logIn(appUserId.trim());
      currentAppUserId = appUserId.trim();
    } catch {
      return {
        ...(await fetchRevenueCatSnapshot()),
        reasonCode: 'status_error'
      };
    }
  }

  return fetchRevenueCatSnapshot();
};

export const fetchRevenueCatSnapshot = async (): Promise<RevenueCatSnapshot> => {
  const availability = canUseRevenueCat();
  if (!availability.available) {
    return toUnavailableSnapshot(availability.reasonCode ?? 'billing_unavailable');
  }

  const module = getPurchasesModule();
  if (!module) {
    return toUnavailableSnapshot('billing_temporarily_unavailable');
  }

  try {
    const [customerInfo, offerings] = await Promise.all([module.getCustomerInfo(), module.getOfferings()]);
    const entitlementState = getEntitlementState(customerInfo);
    const packages = mapPackages(offerings);

    const snapshot: RevenueCatSnapshot = {
      available: true,
      initialized: isInitialized,
      entitlementId: entitlementState.entitlementId,
      entitlementActive: entitlementState.entitlementActive,
      packages
    };

    if (packages.length === 0) {
      snapshot.reasonCode = 'package_unavailable';
    }

    return snapshot;
  } catch {
    return {
      entitlementId: getEntitlementId(),
      available: true,
      initialized: isInitialized,
      entitlementActive: false,
      packages: [],
      reasonCode: 'status_error'
    };
  }
};

export const purchaseRevenueCatPackage = async (packageIdentifier: string): Promise<RevenueCatSnapshot> => {
  const availability = canUseRevenueCat();
  if (!availability.available) {
    return toUnavailableSnapshot(availability.reasonCode ?? 'billing_unavailable');
  }

  const module = getPurchasesModule();
  if (!module) {
    return toUnavailableSnapshot('billing_temporarily_unavailable');
  }

  try {
    const offerings = await module.getOfferings();
    const offering = getPreferredOffering(offerings);
    const packageToBuy = offering?.availablePackages.find((entry) => entry.identifier === packageIdentifier);

    if (!packageToBuy) {
      return {
        available: true,
        initialized: isInitialized,
        entitlementId: getEntitlementId(),
        entitlementActive: false,
        packages: mapPackages(offerings),
        reasonCode: 'package_unavailable'
      };
    }

    await module.purchasePackage(packageToBuy);
    return fetchRevenueCatSnapshot();
  } catch {
    return {
      ...(await fetchRevenueCatSnapshot()),
      reasonCode: 'purchase_not_completed'
    };
  }
};

export const restoreRevenueCatPurchases = async (): Promise<RevenueCatSnapshot> => {
  const availability = canUseRevenueCat();
  if (!availability.available) {
    return toUnavailableSnapshot(availability.reasonCode ?? 'billing_unavailable');
  }

  const module = getPurchasesModule();
  if (!module) {
    return toUnavailableSnapshot('billing_temporarily_unavailable');
  }

  try {
    await module.restorePurchases();
    return fetchRevenueCatSnapshot();
  } catch {
    return {
      ...(await fetchRevenueCatSnapshot()),
      reasonCode: 'restore_failed'
    };
  }
};

export const linkRevenueCatAccount = async (appUserId: string): Promise<RevenueCatSnapshot> => {
  const trimmed = appUserId.trim();
  if (!trimmed) {
    return {
      ...(await fetchRevenueCatSnapshot()),
      reasonCode: 'status_error'
    };
  }

  return initializeRevenueCatBase(trimmed);
};

export const unlinkRevenueCatAccount = async (): Promise<RevenueCatSnapshot> => {
  const availability = canUseRevenueCat();
  if (!availability.available) {
    return toUnavailableSnapshot(availability.reasonCode ?? 'billing_unavailable');
  }

  const module = getPurchasesModule();
  if (!module) {
    return toUnavailableSnapshot('billing_temporarily_unavailable');
  }

  if (!module.logOut) {
    currentAppUserId = undefined;
    return fetchRevenueCatSnapshot();
  }

  try {
    await module.logOut();
    currentAppUserId = undefined;
    return fetchRevenueCatSnapshot();
  } catch {
    return {
      ...(await fetchRevenueCatSnapshot()),
      reasonCode: 'status_error'
    };
  }
};

const mapPaywallResult = (value: RevenueCatUIResultValue): RevenueCatPaywallOutcome => {
  if (value === 'PURCHASED') {
    return 'purchased';
  }
  if (value === 'RESTORED') {
    return 'restored';
  }
  if (value === 'CANCELLED') {
    return 'cancelled';
  }
  if (value === 'NOT_PRESENTED') {
    return 'not_presented';
  }
  return 'error';
};

export const presentRevenueCatPaywall = async (): Promise<RevenueCatPaywallOutcome> => {
  const availability = canUseRevenueCat();
  if (!availability.available) {
    return 'unavailable';
  }

  const module = getPurchasesUIModule();
  if (
    !module ||
    (typeof module.presentPaywall !== 'function' && typeof module.presentPaywallIfNeeded !== 'function')
  ) {
    return 'unavailable';
  }

  const init = await initializeRevenueCatBase(currentAppUserId);
  if (!init.available) {
    return 'unavailable';
  }

  try {
    const purchases = getPurchasesModule();
    if (!purchases) {
      return 'unavailable';
    }

    const offerings = await purchases.getOfferings();
    const offering = getPreferredOffering(offerings) ?? undefined;

    let result: any;
    const uiModule = module;
    if (!uiModule) {
      return 'unavailable';
    }

    if (uiModule.presentPaywall) {
      const params = offering ? { offering, displayCloseButton: true } : { displayCloseButton: true };
      result = await uiModule.presentPaywall(params);
    } else if (uiModule.presentPaywallIfNeeded) {
      const params = offering
        ? {
          requiredEntitlementIdentifier: getEntitlementId(),
          offering,
          displayCloseButton: true
        }
        : {
          requiredEntitlementIdentifier: getEntitlementId(),
          displayCloseButton: true
        };
      result = await uiModule.presentPaywallIfNeeded(params);
    } else {
      return 'unavailable';
    }

    return mapPaywallResult(result);
  } catch {
    return 'error';
  }
};

export const presentRevenueCatCustomerCenter = async (): Promise<boolean> => {
  const availability = canUseRevenueCat();
  if (!availability.available) {
    return false;
  }

  const module = getPurchasesUIModule();
  if (!module || typeof module.presentCustomerCenter !== 'function') {
    return false;
  }

  const init = await initializeRevenueCatBase(currentAppUserId);
  if (!init.available) {
    return false;
  }

  try {
    if (module && module.presentCustomerCenter) {
      await module.presentCustomerCenter();
      return true;
    }
    return false;
  } catch {
    return false;
  }
};
