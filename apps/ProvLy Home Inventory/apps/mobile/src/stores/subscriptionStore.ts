import { create } from 'zustand';
import { Platform } from 'react-native';

let Purchases: any = null;
if (Platform.OS !== 'web') {
    Purchases = require('react-native-purchases').default;
}

const LEGACY_API_KEY = process.env.EXPO_PUBLIC_REVENUECAT_KEY || '';
const IOS_API_KEY = process.env.EXPO_PUBLIC_REVENUECAT_IOS_API_KEY || '';
const ANDROID_API_KEY = process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY || '';

const getPlatformApiKey = (): string => {
    if (Platform.OS === 'ios') {
        if (IOS_API_KEY) return IOS_API_KEY;
        return LEGACY_API_KEY.toLowerCase().startsWith('appl_') ? LEGACY_API_KEY : '';
    }

    if (Platform.OS === 'android') {
        if (ANDROID_API_KEY) return ANDROID_API_KEY;
        return LEGACY_API_KEY.toLowerCase().startsWith('goog_') ? LEGACY_API_KEY : '';
    }

    return LEGACY_API_KEY;
};

const API_KEY = getPlatformApiKey();

const PRIMARY_ENTITLEMENT = process.env.EXPO_PUBLIC_REVENUECAT_ENTITLEMENT || 'Pro Access';
const ENTITLEMENT_IDS = Array.from(
    new Set([PRIMARY_ENTITLEMENT, 'Pro Access', 'Pro', 'pro', 'pro_subscription'])
);

const isTestStoreKey = (key: string): boolean => key.toLowerCase().startsWith('test_');
let hasShownOfferingsConfigWarning = false;

const isOfferingsConfigurationError = (error: any): boolean => {
    const message = String(error?.message || '').toLowerCase();
    const underlying = String(error?.underlyingErrorMessage || '').toLowerCase();
    const code = String(error?.code || '').toLowerCase();

    return (
        code.includes('configurationerror') ||
        message.includes('issue with your configuration') ||
        message.includes('no play store products registered') ||
        underlying.includes('no play store products registered') ||
        underlying.includes('configure offerings')
    );
};

const getIsProFromInfo = (info: any): boolean => {
    if (!info?.entitlements?.active) return false;
    const active = info.entitlements.active;
    const activeKeys = Object.keys(active);
    console.log('[Subscription] Active Entitlements:', activeKeys);
    return ENTITLEMENT_IDS.some((id) => active[id] !== undefined);
};

const MOCK_OFFERINGS = {
    monthly: {
        identifier: '$rc_monthly',
        packageType: 'MONTHLY',
        product: {
            identifier: 'pro_monthly',
            description: 'Pro Monthly',
            title: 'Pro Monthly',
            price: 6.99,
            priceString: '$6.99',
            currencyCode: 'USD',
        },
    },
    annual: {
        identifier: '$rc_annual',
        packageType: 'ANNUAL',
        product: {
            identifier: 'pro_annual',
            description: 'Pro Annual',
            title: 'Pro Annual',
            price: 69.99,
            priceString: '$69.99',
            currencyCode: 'USD',
        },
    },
};

const normalizeOfferings = (offerings: any): { monthly: any | null; annual: any | null } | null => {
    const packages = offerings?.current?.availablePackages;
    if (!packages || !Array.isArray(packages) || packages.length === 0) return null;

    const monthly =
        packages.find(
            (pkg: any) =>
                pkg.packageType === 'MONTHLY' ||
                pkg.identifier === '$rc_monthly' ||
                pkg.product?.identifier?.toLowerCase().includes('monthly')
        ) || null;

    const annual =
        packages.find(
            (pkg: any) =>
                pkg.packageType === 'ANNUAL' ||
                pkg.identifier === '$rc_annual' ||
                pkg.product?.identifier?.toLowerCase().includes('annual') ||
                pkg.product?.identifier?.toLowerCase().includes('year')
        ) || null;

    if (!monthly && !annual && packages[0]) {
        const fallback = packages[0];
        const isLikelyAnnual = Number(fallback?.product?.price || 0) > 20;
        return {
            monthly: isLikelyAnnual ? null : fallback,
            annual: isLikelyAnnual ? fallback : null,
        };
    }

    return { monthly, annual };
};

const fetchNormalizedOfferings = async (): Promise<{ monthly: any | null; annual: any | null } | null> => {
    try {
        const offerings = await Purchases.getOfferings();
        if (offerings?.current?.availablePackages) {
            console.log('[Subscription] Raw packages:', JSON.stringify(offerings.current.availablePackages));
        }
        return normalizeOfferings(offerings);
    } catch (error: any) {
        if (isOfferingsConfigurationError(error)) {
            if (!hasShownOfferingsConfigWarning) {
                hasShownOfferingsConfigWarning = true;
                console.warn(
                    '[Subscription] RevenueCat offerings are not fully configured yet. Using fallback plans until dashboard products are linked.'
                );
            }
            return null;
        }
        throw error;
    }
};

interface SubscriptionState {
    isPro: boolean;
    offerings: any | null;
    customerInfo: any | null;
    loading: boolean;
    initialized: boolean;
    initializing: boolean;
    initialize: () => Promise<void>;
    login: (userId: string) => Promise<void>;
    logout: () => Promise<void>;
    purchasePackage: (pkg: any) => Promise<boolean>;
    restorePurchases: () => Promise<boolean>;
    checkEntitlement: () => Promise<boolean>;
}

export const useSubscriptionStore = create<SubscriptionState>((set, get) => ({
    isPro: false,
    offerings: null,
    customerInfo: null,
    loading: true,
    initialized: false,
    initializing: false,

    initialize: async () => {
        if (get().initialized || get().initializing) return;
        set({ initializing: true });

        if (Platform.OS === 'web') {
            set({
                loading: false,
                offerings: MOCK_OFFERINGS,
                initialized: true,
                initializing: false,
            });
            return;
        }

        if (!Purchases) {
            console.warn('[Subscription] Purchases SDK unavailable. Falling back to mock offerings.');
            set({
                loading: false,
                offerings: MOCK_OFFERINGS,
                initialized: true,
                initializing: false,
            });
            return;
        }

        if (!API_KEY) {
            console.warn('[Subscription] Missing RevenueCat public API key. Falling back to mock offerings.');
            set({
                loading: false,
                offerings: MOCK_OFFERINGS,
                initialized: true,
                initializing: false,
            });
            return;
        }

        if (isTestStoreKey(API_KEY)) {
            console.warn(
                '[Subscription] RevenueCat Test Store key detected. Replace with live public SDK key for production billing.'
            );
        }

        try {
            Purchases.setLogLevel(Purchases.LOG_LEVEL.DEBUG);
            await Purchases.configure({ apiKey: API_KEY });

            const customerInfo = await Purchases.getCustomerInfo().catch(() => null);
            const normalizedOfferings = await fetchNormalizedOfferings().catch(() => null);

            set({
                customerInfo,
                isPro: getIsProFromInfo(customerInfo),
                offerings: normalizedOfferings || MOCK_OFFERINGS,
                loading: false,
                initialized: true,
                initializing: false,
            });
        } catch (error) {
            console.error('[Subscription] Initialization failed:', error);
            set({
                loading: false,
                offerings: MOCK_OFFERINGS,
                initialized: true,
                initializing: false,
            });
        }
    },

    login: async (userId: string) => {
        if (Platform.OS === 'web' || !Purchases || !API_KEY) return;
        if (!get().initialized) await get().initialize();

        try {
            const { customerInfo } = await Purchases.logIn(userId);
            const normalizedOfferings = await fetchNormalizedOfferings().catch(() => null);
            set({
                customerInfo,
                isPro: getIsProFromInfo(customerInfo),
                offerings: normalizedOfferings || get().offerings || MOCK_OFFERINGS,
            });
        } catch (error) {
            console.error('[Subscription] Login sync failed:', error);
        }
    },

    logout: async () => {
        if (Platform.OS === 'web' || !Purchases || !API_KEY || !get().initialized) return;
        try {
            await Purchases.logOut();
            set({ isPro: false, customerInfo: null });
        } catch (error) {
            console.error('[Subscription] Logout failed:', error);
        }
    },

    purchasePackage: async (pkg: any) => {
        if (Platform.OS === 'web' || !Purchases || !API_KEY) {
            set({ isPro: true });
            return true;
        }

        if (!get().initialized) await get().initialize();

        try {
            const { customerInfo } = await Purchases.purchasePackage(pkg);
            const isPro = getIsProFromInfo(customerInfo);
            set({ customerInfo, isPro });
            return isPro;
        } catch (error: any) {
            if (!error?.userCancelled) {
                console.error('[Subscription] Purchase failed:', error);
            }
            return false;
        }
    },

    restorePurchases: async () => {
        if (Platform.OS === 'web' || !Purchases || !API_KEY) return false;
        if (!get().initialized) await get().initialize();

        try {
            const customerInfo = await Purchases.restorePurchases();
            const isPro = getIsProFromInfo(customerInfo);
            set({ customerInfo, isPro });
            return isPro;
        } catch (error) {
            console.error('[Subscription] Restore failed:', error);
            return false;
        }
    },

    checkEntitlement: async () => {
        if (Platform.OS === 'web' || !Purchases || !API_KEY) return get().isPro;
        if (!get().initialized) await get().initialize();

        try {
            const info = await Purchases.getCustomerInfo();
            const isPro = getIsProFromInfo(info);
            set({ isPro, customerInfo: info });
            return isPro;
        } catch {
            return false;
        }
    },
}));
