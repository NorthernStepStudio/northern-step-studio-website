import { Platform } from "react-native";
import Constants from "expo-constants";

let PurchasesCache: any = null;
let configuredAppUserId: string | null = null;
let initPurchasesPromise: Promise<void> | null = null;

const getPurchases = () => {
  if (PurchasesCache) return PurchasesCache;
  if (!isRevenueCatAvailable()) return null;
  try {
    const rc = require("react-native-purchases");
    PurchasesCache = rc.default || rc;
    return PurchasesCache;
  } catch (e) {
    console.warn("RevenueCat native module not found globally.");
    return null;
  }
};

let isConfigured = false;

const isRevenueCatAvailable = () => {
  if (isConfigured) return true; // If already configured, it's available
  const ownership = Constants?.appOwnership;
  const environment = Constants?.executionEnvironment;
  return ownership !== "expo" && environment !== "storeClient";
};

const getRevenueCatApiKey = () => {
  const extra = (Constants?.expoConfig?.extra || {}) as Record<string, unknown>;
  if (Platform.OS === "ios") {
    return String(
      extra.revenueCatIosKey ?? process.env.EXPO_PUBLIC_RC_IOS_KEY ?? "",
    ).trim();
  }

  if (Platform.OS === "android") {
    return String(
      extra.revenueCatAndroidKey ??
        process.env.EXPO_PUBLIC_RC_ANDROID_KEY ??
        "",
    ).trim();
  }

  return "";
};

const normalizeUserId = (value: unknown) => {
  const next = String(value ?? "").trim();
  return next.length > 0 ? next : null;
};

const normalizeEntitlementName = (value: unknown) =>
  String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "");

const hasActiveEntitlement = (
  activeEntitlements: Record<string, unknown> | undefined,
  aliases: string[],
) => {
  if (!activeEntitlements) return false;

  const activeKeys = Object.keys(activeEntitlements).map(
    normalizeEntitlementName,
  );
  return aliases
    .map(normalizeEntitlementName)
    .some((alias) => activeKeys.includes(alias));
};

export async function initPurchases(userId: string | null = null) {
  if (initPurchasesPromise) {
    try {
      await initPurchasesPromise;
    } catch {
      // Ignore in-flight initialization failures and retry below.
    }
  }

  const task = (async () => {
    try {
      const Purchases = getPurchases();
      if (!Purchases) {
        console.log("RevenueCat disabled in Expo Go");
        return;
      }

      const apiKey = getRevenueCatApiKey();
      if (!apiKey) {
        console.log(
          "Missing RevenueCat public API key - skipping initialization",
        );
        return;
      }

      const nextUserId = normalizeUserId(userId);

      if (!isConfigured) {
        if (!nextUserId) {
          return;
        }

        const config: { apiKey: string; appUserID?: string } = { apiKey };
        config.appUserID = nextUserId;
        await Purchases.configure(config);
        isConfigured = true;
        configuredAppUserId = nextUserId;
        return;
      }

      if (!nextUserId) {
        if (configuredAppUserId) {
          await Purchases.logOut();
          configuredAppUserId = null;
        }
        return;
      }

      if (configuredAppUserId === nextUserId) {
        return;
      }

      await Purchases.logIn({ appUserID: nextUserId });
      configuredAppUserId = nextUserId;
    } catch (error) {
      console.log(
        "RevenueCat initialization failed (Expo Go limitation):",
        error,
      );
    }
  })();

  initPurchasesPromise = task;
  try {
    await task;
  } finally {
    if (initPurchasesPromise === task) {
      initPurchasesPromise = null;
    }
  }
}

export async function isTokens(): Promise<boolean> {
  try {
    const Purchases = getPurchases();
    if (!Purchases || !isConfigured) return false;
    const info = await Purchases.getCustomerInfo();
    return hasActiveEntitlement(info?.entitlements?.active, [
      "NexusBuild Pro",
      "entle917add7f7",
      "pro",
      "tokens",
    ]);
  } catch (error) {
    console.log("RevenueCat isTokens check failed:", error);
    return false;
  }
}

export async function isPro(): Promise<boolean> {
  try {
    const Purchases = getPurchases();
    if (!Purchases) return false;
    const info = await Purchases.getCustomerInfo();
    return hasActiveEntitlement(info?.entitlements?.active, [
      "pro",
      "pro_monthly",
    ]);
  } catch (error) {
    console.log("RevenueCat isPro check failed:", error);
    return false;
  }
}

export async function isPower(): Promise<boolean> {
  try {
    const Purchases = getPurchases();
    if (!Purchases) return false;
    const info = await Purchases.getCustomerInfo();
    return hasActiveEntitlement(info?.entitlements?.active, ["power"]);
  } catch (error) {
    console.log("RevenueCat isPower check failed:", error);
    return false;
  }
}

export async function getUserTier(): Promise<"free" | "pro" | "power"> {
  try {
    const Purchases = getPurchases();
    if (!Purchases) return "free";
    if (await isPower()) return "power";
    if (await isPro()) return "pro";
    return "free";
  } catch (e) {
    return "free";
  }
}

export async function buyProMonthly() {
  try {
    const Purchases = getPurchases();
    if (!Purchases) throw new Error("RevenueCat not available");
    const offerings: any = await Purchases.getOfferings();
    const pkg = offerings.current?.availablePackages.find(
      (entry) =>
        entry.identifier.includes("pro_monthly") ||
        entry.identifier.includes("monthly"),
    );
    if (!pkg) {
      throw new Error("No Pro monthly package found");
    }
    return Purchases.purchasePackage(pkg);
  } catch (error) {
    console.log("RevenueCat Pro purchase failed:", error);
    throw error;
  }
}

export async function buyPowerMonthly() {
  try {
    const Purchases = getPurchases();
    if (!Purchases) throw new Error("RevenueCat not available");
    const offerings: any = await Purchases.getOfferings();
    const pkg = offerings.current?.availablePackages.find((entry) =>
      entry.identifier.includes("power_monthly"),
    );
    if (!pkg) {
      throw new Error("No Power monthly package found");
    }
    return Purchases.purchasePackage(pkg);
  } catch (error) {
    console.log("RevenueCat Power purchase failed:", error);
    throw error;
  }
}

export async function getTokenOfferings() {
  try {
    const Purchases = getPurchases();
    if (!Purchases || !isConfigured) {
      console.log("RevenueCat not available or not yet configured");
      return [];
    }
    const offerings: any = await Purchases.getOfferings();
    if (!offerings) return [];

    // Attempt to get packages from the current offering first
    let available = offerings.current?.availablePackages || [];

    // Fallback: If current is null or empty, aggregate from ALL offerings
    if (available.length === 0 && offerings.all) {
      const allOfferings: any[] = Object.values(offerings.all);
      for (const offering of allOfferings) {
        if (
          offering.availablePackages &&
          offering.availablePackages.length > 0
        ) {
          available = [...available, ...offering.availablePackages];
        }
      }
    }

    // Filter for packages that include 'token' in their identifier or product description
    const tokenPackages = available.filter(
      (pkg) =>
        String(pkg?.identifier || "")
          .toLowerCase()
          .includes("token") ||
        String(pkg?.product?.description || "")
          .toLowerCase()
          .includes("token"),
    );

    if (tokenPackages.length > 0) return tokenPackages;

    // Ultimate Fallback: Return all available packages found
    return available;
  } catch (error) {
    console.log("RevenueCat getTokenOfferings failed:", error);
    return [];
  }
}

export async function purchasePackage(pkg: any) {
  try {
    const Purchases = getPurchases();
    if (!Purchases) {
      throw new Error("RevenueCat not available in this environment");
    }
    return await Purchases.purchasePackage(pkg);
  } catch (error) {
    console.log("RevenueCat purchase failed:", error);
    throw error;
  }
}

export async function restorePurchases() {
  try {
    const Purchases = getPurchases();
    if (!Purchases) throw new Error("RevenueCat not available");
    return await Purchases.restorePurchases();
  } catch (error) {
    console.log("RevenueCat restore failed:", error);
    throw error;
  }
}
