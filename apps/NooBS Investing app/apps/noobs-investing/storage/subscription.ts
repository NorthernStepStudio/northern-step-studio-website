import AsyncStorage from '@react-native-async-storage/async-storage';
import Purchases, { PurchasesPackage } from 'react-native-purchases';
import { Platform } from 'react-native';

const PRO_KEY = 'noobs_pro_status';
// Mapping "Winston Martinez (Northen Steps Studio) Pro" to the simple "pro" entitlement
const ENTITLEMENT_ID = 'pro';

const isWeb = Platform.OS === 'web';
const IOS_API_KEY =
    process.env.EXPO_PUBLIC_RC_IOS_KEY ||
    process.env.EXPO_PUBLIC_REVENUECAT_IOS_API_KEY ||
    '';
const ANDROID_API_KEY =
    process.env.EXPO_PUBLIC_RC_ANDROID_KEY ||
    process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY ||
    '';
const LEGACY_API_KEY = process.env.EXPO_PUBLIC_REVENUECAT_KEY || '';
const REVENUE_CAT_API_KEY =
    Platform.OS === 'ios'
        ? (IOS_API_KEY || (LEGACY_API_KEY.toLowerCase().startsWith('appl_') ? LEGACY_API_KEY : ''))
        : Platform.OS === 'android'
            ? (ANDROID_API_KEY || (LEGACY_API_KEY.toLowerCase().startsWith('goog_') ? LEGACY_API_KEY : ''))
            : '';
const hasRevenueCatKey = !!REVENUE_CAT_API_KEY && !isWeb;
let purchasesConfigured = false;

async function ensurePurchasesConfigured(): Promise<boolean> {
    if (!hasRevenueCatKey) return false;
    if (purchasesConfigured) return true;
    try {
        await Purchases.configure({ apiKey: REVENUE_CAT_API_KEY });
        purchasesConfigured = true;
        return true;
    } catch (e) {
        console.warn('RevenueCat configure failed; purchases disabled until fixed.', e);
        return false;
    }
}

async function getStoredProStatus(): Promise<ProStatus> {
    const stored = await AsyncStorage.getItem(PRO_KEY);
    if (stored) {
        try {
            return JSON.parse(stored);
        } catch {
            await AsyncStorage.removeItem(PRO_KEY);
        }
    }
    return { isPro: false };
}

async function resolvePackage(pkgOrId: PurchasesPackage | 'monthly' | 'lifetime'): Promise<PurchasesPackage | null> {
    if (typeof pkgOrId !== 'string') return pkgOrId;

    const offerings = await Purchases.getOfferings();
    const packages = offerings.current?.availablePackages ?? [];
    if (!packages.length) return null;

    if (pkgOrId === 'monthly') {
        return (
            packages.find(
                (pkg) =>
                    pkg.packageType === 'MONTHLY' ||
                    pkg.identifier.toLowerCase().includes('monthly') ||
                    pkg.product.identifier.toLowerCase().includes('monthly')
            ) || null
        );
    }

    return (
        packages.find(
            (pkg) =>
                pkg.packageType === 'LIFETIME' ||
                pkg.identifier.toLowerCase().includes('lifetime') ||
                pkg.product.identifier.toLowerCase().includes('lifetime')
        ) || null
    );
}

export interface ProStatus {
    isPro: boolean;
    purchaseType?: 'monthly' | 'lifetime';
    expiresAt?: string;
}

export async function checkProStatus(): Promise<ProStatus> {
    if (isWeb || !hasRevenueCatKey) {
        return getStoredProStatus();
    }

    try {
        const configured = await ensurePurchasesConfigured();
        if (!configured) return getStoredProStatus();

        const customerInfo = await Purchases.getCustomerInfo();
        const entitlements = customerInfo.entitlements.active;

        if (entitlements[ENTITLEMENT_ID]) {
            const status: ProStatus = {
                isPro: true,
                purchaseType: entitlements[ENTITLEMENT_ID].productIdentifier.includes('lifetime') ? 'lifetime' : 'monthly',
                expiresAt: entitlements[ENTITLEMENT_ID].expirationDate || undefined
            };
            await AsyncStorage.setItem(PRO_KEY, JSON.stringify(status));
            return status;
        } else {
            // If the server says no, clear local cache
            await AsyncStorage.removeItem(PRO_KEY);
        }
    } catch (e) {
        console.error('Error checking pro status via RevenueCat:', e);
        return getStoredProStatus();
    }
    return { isPro: false };
}

export async function unlockPro(pkgOrId: PurchasesPackage | 'monthly' | 'lifetime'): Promise<boolean> {
    if (isWeb) {
        console.log('Web mode: purchases disabled, returning false.');
        return false;
    }

    if (!hasRevenueCatKey) {
        console.warn('Missing RevenueCat production key. Purchase flow is disabled.');
        return false;
    }

    try {
        const configured = await ensurePurchasesConfigured();
        if (!configured) return false;

        const pkg = await resolvePackage(pkgOrId);
        if (!pkg) {
            console.warn(`No RevenueCat package found for "${String(pkgOrId)}".`);
            return false;
        }

        const { customerInfo } = await Purchases.purchasePackage(pkg);
        if (customerInfo.entitlements.active[ENTITLEMENT_ID]) {
            const status: ProStatus = { isPro: true };
            await AsyncStorage.setItem(PRO_KEY, JSON.stringify(status));
            return true;
        }
        return false;
    } catch (e: any) {
        if (!e.userCancelled) {
            console.error('Purchase error:', e);
        }
        return false;
    }
}

export async function restorePurchase(): Promise<boolean> {
    if (isWeb || !hasRevenueCatKey) {
        return (await getStoredProStatus()).isPro;
    }
    try {
        const configured = await ensurePurchasesConfigured();
        if (!configured) return false;

        const customerInfo = await Purchases.restorePurchases();
        const active = !!customerInfo.entitlements.active[ENTITLEMENT_ID];
        if (active) {
            await AsyncStorage.setItem(PRO_KEY, JSON.stringify({ isPro: true }));
        }
        return active;
    } catch (e) {
        console.error('Restore error:', e);
        return false;
    }
}

/**
 * Simple boolean check for Pro status
 */
export async function isProUser(): Promise<boolean> {
    const status = await checkProStatus();
    return status.isPro;
}

const SIM_COMPLETED_SCENARIOS_KEY = 'noobs_simulator_completed_scenarios';

export async function getCompletedScenarios(): Promise<string[]> {
    const val = await AsyncStorage.getItem(SIM_COMPLETED_SCENARIOS_KEY);
    return val ? JSON.parse(val) : [];
}

export async function markScenarioCompleted(scenarioId: string): Promise<void> {
    const current = await getCompletedScenarios();
    if (!current.includes(scenarioId)) {
        await AsyncStorage.setItem(SIM_COMPLETED_SCENARIOS_KEY, JSON.stringify([...current, scenarioId]));
    }
}
