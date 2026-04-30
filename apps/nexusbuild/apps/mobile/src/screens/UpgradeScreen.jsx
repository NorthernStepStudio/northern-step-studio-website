import React, { useCallback, useState } from "react";
import { useFocusEffect } from "@react-navigation/native";
import {
  Alert,
  ActivityIndicator,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";

import Header from "../components/Header";
import GlassCard from "../components/GlassCard";
import { useTheme } from "../contexts/ThemeContext";
import { useAuth } from "../contexts/AuthContext";
import { useChatUI } from "../contexts/ChatUIContext";
import { useTranslation } from "../core/i18n";
import { authAPI } from "../services/api";
import {
  getTokenOfferings,
  initPurchases,
  purchasePackage,
  restorePurchases,
} from "../billing/revenuecat";

const FEATURE_TILES = [
  {
    icon: "star",
    title: "Smart Build AI",
    description:
      "AI generates a complete optimized PC build based on your budget and use case. Includes part picks, rationale, and compatibility guarantee.",
    cost: 150,
  },
  {
    icon: "hardware-chip",
    title: "Full Build Review",
    description:
      "Get a detailed AI analysis of your current build: bottlenecks, upgrade paths, thermal concerns, and performance predictions.",
    cost: 100,
  },
  {
    icon: "speedometer",
    title: "FPS Deep-Dive",
    description:
      "Predict FPS for specific games at your target resolution. Includes lows, bottleneck analysis, and settings recommendations.",
    cost: 15,
  },
  {
    icon: "chatbubble",
    title: "Ask Nexus",
    description:
      "Ask any build-specific question. Get expert AI advice on parts, compatibility, upgrades, or troubleshooting.",
    cost: 5,
  },
];

const SUPPORT_TIERS = [
  {
    tokens: 50,
    label: "Supporter",
    price: "$5",
    subtitle: "Cover server costs + tokens",
  },
  {
    tokens: 120,
    label: "Backer",
    price: "$10",
    subtitle: "Fuel Early Access progress + tokens",
  },
  {
    tokens: 260,
    label: "Founder",
    price: "$20",
    subtitle: "Keep Nexus improving + tokens",
  },
  {
    tokens: 600,
    label: "Patron",
    price: "$40",
    subtitle: "Max support + tokens",
  },
];

export default function UpgradeScreen({ navigation }) {
  const { theme } = useTheme();
  const { user } = useAuth();
  const { refreshEntitlements } = useChatUI();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);
  const [tokens, setTokens] = useState(0);
  const [offerings, setOfferings] = useState([]);

  const refreshBalance = async () => {
    if (user) {
      const me = await authAPI.getMe().catch(() => null);
      if (typeof me?.tokens === "number") {
        setTokens(me.tokens);
        return me.tokens;
      }
      const fallbackTokens = Number(user?.tokens || 0);
      setTokens(fallbackTokens);
      return fallbackTokens;
    }
    const guestTokens = Number(
      (await AsyncStorage.getItem("guest_tokens").catch(() => "10000")) ||
        10000,
    );
    setTokens(guestTokens);
    return guestTokens;
  };

  useFocusEffect(
    useCallback(() => {
      let mounted = true;

      const load = async () => {
        setLoading(true);

        try {
          const userId = user?.id || user?.uid || user?.email || null;
          if (userId) {
            await initPurchases(userId);
          }

          const [available, me, guestTokens] = await Promise.all([
            getTokenOfferings(),
            user ? authAPI.getMe().catch(() => null) : Promise.resolve(null),
            AsyncStorage.getItem("guest_tokens").catch(() => null),
          ]);

          if (!mounted) return;

          if (user && typeof me?.tokens === "number") {
            setTokens(me.tokens);
          } else {
            setTokens(
              user ? Number(user?.tokens || 0) : Number(guestTokens || 10000),
            );
          }

          setOfferings(available);
        } catch (error) {
          console.log("Store load failed:", error);
        } finally {
          if (mounted) setLoading(false);
        }
      };

      load();

      return () => {
        mounted = false;
      };
    }, [user]),
  );

  const openFeedback = () => {
    navigation.navigate("Contact", { initialSubject: "Token Store Feedback" });
  };

  const goToLogin = () => {
    navigation.navigate("ProfileTab", { screen: "Login" });
  };

  const bonusProductIdForAmount = (amount) => `bonus_${Number(amount || 0)}`;

  const tokenAmountForSku = (sku) => {
    const normalized = String(sku || "").toLowerCase();
    const skuMap = {
      tokens_20: 20,
      tokens_60: 60,
      tokens_120: 120,
      tokens_160: 160,
      tokens_280: 280,
      tokens_600: 600,
    };
    return skuMap[normalized] || Number(normalized.match(/\d+/)?.[0] || 0);
  };

  const waitForTokenUpdate = async (minimumBalance) => {
    const deadline = Date.now() + 8000;
    let latestBalance = tokens;

    while (Date.now() < deadline) {
      latestBalance = await refreshBalance();
      if (
        typeof latestBalance === "number" &&
        latestBalance >= minimumBalance
      ) {
        return latestBalance;
      }
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    return latestBalance;
  };

  const claimBonus = async (packageLabel, amount) => {
    try {
      setPurchasing(true);
      if (user) {
        await authAPI.syncPurchase(
          bonusProductIdForAmount(amount),
          user.id || user.uid,
        );
      } else {
        const next =
          (Number(
            await AsyncStorage.getItem("guest_tokens").catch(() => "10000"),
          ) || 10000) + amount;
        await AsyncStorage.setItem("guest_tokens", String(next));
      }
      await refreshBalance();
      await refreshEntitlements?.();
      Alert.alert("Founders Bonus", `${packageLabel} added to your token balance.`);
    } catch (error) {
      Alert.alert(
        "Founders Bonus failed",
        error?.message || "Unable to add tokens right now.",
      );
    } finally {
      setPurchasing(false);
    }
  };

  const handlePurchase = async (pkg) => {
    try {
      setPurchasing(true);
      const startingTokens = tokens;
      const expectedTokens = tokenAmountForSku(pkg?.product?.identifier);

      if (user) {
        await purchasePackage(pkg);
        if (expectedTokens > 0) {
          await waitForTokenUpdate(startingTokens + expectedTokens);
        } else {
          await refreshBalance();
        }
      } else {
        const purchased = Number(
          pkg?.product?.identifier?.match(/\d+/)?.[0] || 0,
        );
        const next =
          (Number(
            await AsyncStorage.getItem("guest_tokens").catch(() => "10000"),
          ) || 10000) + (purchased || 20);
        await AsyncStorage.setItem("guest_tokens", String(next));
      }
      await refreshBalance();
      await refreshEntitlements?.();
      Alert.alert(
        "Success",
        `${pkg.product.title} has been added to your account.`,
      );
    } catch (error) {
      if (!error?.userCancelled) {
        Alert.alert("Purchase failed", error?.message || "Please try again.");
      }
    } finally {
      setPurchasing(false);
    }
  };

  const handleRestorePurchases = async () => {
    try {
      setPurchasing(true);
      await restorePurchases();
      await refreshBalance();
      await refreshEntitlements?.();
      Alert.alert(
        "Restored",
        "Your purchases have been restored successfully.",
      );
    } catch (error) {
      Alert.alert(
        "Restore failed",
        error?.message || "Unable to restore purchases at this time.",
      );
    } finally {
      setPurchasing(false);
    }
  };

  if (loading) {
    return (
      <LinearGradient
        colors={theme.gradients.background}
        style={styles.container}
      >
        <Header navigation={navigation} title={t("menu.store")} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.accentPrimary} />
          <Text
            style={[styles.loadingText, { color: theme.colors.textSecondary }]}
          >
            Loading token store...
          </Text>
        </View>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient
      colors={["#0f0928", "#17123a", "#381e5f"]}
      style={styles.container}
    >
      <Header navigation={navigation} title={t("menu.store")} />
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <GlassCard style={styles.balanceCard}>
          <View style={styles.balanceIconWrap}>
            <View
              style={[
                styles.balanceIcon,
                { backgroundColor: theme.colors.bgSecondary },
              ]}
            >
              <Ionicons
                name="wallet"
                size={22}
                color={theme.colors.accentPrimary}
              />
            </View>
          </View>
          <View style={styles.balanceTextWrap}>
            <Text
              style={[styles.balanceLabel, { color: theme.colors.textMuted }]}
            >
              Your Balance
            </Text>
            <Text
              style={[styles.balanceValue, { color: theme.colors.textPrimary }]}
            >
              {tokens} tokens
            </Text>
          </View>
        </GlassCard>

        <GlassCard style={styles.previewCard}>
          <View style={styles.previewHeader}>
            <Ionicons
              name="alert-circle"
              size={18}
              color={theme.colors.accentPrimary}
            />
            <Text
              style={[styles.previewTitle, { color: theme.colors.textPrimary }]}
            >
              Founders Preview (Jan-Apr 2026)
            </Text>
          </View>
          <Text
            style={[styles.previewText, { color: theme.colors.textSecondary }]}
          >
            You&apos;re testing Early Access features! Some AI responses may use local
            fallback if our servers are busy. Tokens are non-refundable during
            preview but will carry over to launch.
          </Text>
          <View style={styles.previewButtons}>
            <TouchableOpacity
              style={[
                styles.previewBtn,
                { backgroundColor: theme.colors.bgSecondary },
              ]}
              onPress={openFeedback}
            >
              <Ionicons
                name="chatbubble"
                size={14}
                color={theme.colors.accentPrimary}
              />
              <Text
                style={[
                  styles.previewBtnText,
                  { color: theme.colors.accentPrimary },
                ]}
              >
                Send Feedback
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.previewBtn,
                { backgroundColor: theme.colors.bgSecondary },
              ]}
              onPress={() =>
                navigation.navigate("Legal", { initialTab: "terms" })
              }
            >
              <Ionicons
                name="document-text"
                size={14}
                color={theme.colors.textMuted}
              />
              <Text
                style={[styles.previewBtnText, { color: theme.colors.textMuted }]}
              >
                Terms
              </Text>
            </TouchableOpacity>
          </View>
        </GlassCard>

        <GlassCard style={styles.claimCard}>
          <View style={styles.claimHeader}>
            <Ionicons name="flame" size={18} color={theme.colors.warning} />
            <Text
              style={[styles.claimTitle, { color: theme.colors.textPrimary }]}
            >
              Founders Preview
            </Text>
          </View>
          <Text
            style={[
              styles.claimSubtitle,
              { color: theme.colors.textSecondary },
            ]}
          >
            330 free tokens - try every feature!
          </Text>
          <TouchableOpacity
            style={[styles.claimBtn, { backgroundColor: "#18c38a" }]}
            onPress={() => claimBonus("Claim +273 Founders Bonus", 273)}
          >
            <Text style={styles.claimBtnText}>Claim +273 Founders Bonus</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.claimBtn, { backgroundColor: "#ff1414" }]}
            onPress={() => claimBonus("Claim +20 Weekly", 20)}
          >
            <Text style={styles.claimBtnText}>Claim +20 Weekly</Text>
          </TouchableOpacity>
        </GlassCard>

        <Text
          style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}
        >
          Support Early Access
        </Text>

        <GlassCard style={styles.supportIntroCard}>
          <View style={styles.supportIntroHeader}>
            <Ionicons name="sparkles" size={18} color={theme.colors.warning} />
            <Text
              style={[
                styles.supportIntroTitle,
                { color: theme.colors.textPrimary },
              ]}
            >
              Founders Club Access
            </Text>
          </View>
          <Text
            style={[
              styles.supportIntroText,
              { color: theme.colors.textSecondary },
            ]}
          >
            Join the exclusive Founders Club during Early Access. Your
            support accelerates development and grants you permanent Founder
            status.
          </Text>
          <Text
            style={[styles.supportIntroNote, { color: theme.colors.textMuted }]}
          >
            * includes instant token bundles & exclusive profile badge.
          </Text>
        </GlassCard>

        <View style={styles.tierGrid}>
          {SUPPORT_TIERS.map((tier) => (
            <TouchableOpacity
              key={tier.label}
              style={[
                styles.tierCard,
                {
                  backgroundColor: theme.colors.glassBg,
                  borderColor: "#8c5e18",
                },
              ]}
              onPress={() => claimBonus(`${tier.label} pack`, tier.tokens)}
            >
              <View style={styles.tierCenter}>
                <View style={styles.tierTokenRow}>
                  <View style={styles.tierTokenDot} />
                  <Text
                    style={[
                      styles.tierTokens,
                      { color: theme.colors.accentPrimary },
                    ]}
                  >
                    {tier.tokens}
                  </Text>
                </View>
                <Text
                  style={[
                    styles.tierLabel,
                    { color: theme.colors.textPrimary },
                  ]}
                >
                  {tier.label}
                </Text>
                <Text
                  style={[
                    styles.tierPrice,
                    { color: theme.colors.textPrimary },
                  ]}
                >
                  {tier.price}
                </Text>
                <Text
                  style={[
                    styles.tierSubtitle,
                    { color: theme.colors.textMuted },
                  ]}
                >
                  {tier.subtitle}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <Text
          style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}
        >
          What You Can Unlock
        </Text>
        <View style={styles.featureStack}>
          {FEATURE_TILES.map((feature) => (
            <View
              key={feature.title}
              style={[
                styles.featureCard,
                {
                  backgroundColor: theme.colors.bgSecondary,
                  borderColor: theme.colors.glassBorder,
                },
              ]}
            >
              <View style={styles.featureHeader}>
                <View style={styles.featureIconWrap}>
                  <Ionicons
                    name={feature.icon}
                    size={18}
                    color={theme.colors.accentPrimary}
                  />
                </View>
                <View style={styles.featureHeaderText}>
                  <Text
                    style={[
                      styles.featureTitle,
                      { color: theme.colors.textPrimary },
                    ]}
                  >
                    {feature.title}
                  </Text>
                  <Text
                    style={[
                      styles.featureDesc,
                      { color: theme.colors.textSecondary },
                    ]}
                  >
                    {feature.description}
                  </Text>
                </View>
                <View style={styles.featureCostPill}>
                  <View style={styles.featureCostDot} />
                  <Text style={styles.featureCostText}>{feature.cost}</Text>
                </View>
              </View>
            </View>
          ))}
        </View>

        {offerings.length > 0 && (
          <>
            <Text
              style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}
            >
              Token Packs
            </Text>
            <View style={styles.packages}>
              {offerings.map((pkg) => (
                <TouchableOpacity
                  key={pkg.identifier}
                  style={[
                    styles.packageCard,
                    {
                      backgroundColor: theme.colors.glassBg,
                      borderColor: theme.colors.glassBorder,
                    },
                  ]}
                  onPress={() => handlePurchase(pkg)}
                  disabled={purchasing}
                >
                  <View style={styles.packageInfo}>
                    <Text
                      style={[
                        styles.packageTitle,
                        { color: theme.colors.textPrimary },
                      ]}
                    >
                      {pkg.product.title}
                    </Text>
                    <Text
                      style={[
                        styles.packageDesc,
                        { color: theme.colors.textSecondary },
                      ]}
                      numberOfLines={2}
                    >
                      {pkg.product.description}
                    </Text>
                  </View>
                  <View
                    style={[
                      styles.priceTag,
                      { backgroundColor: theme.colors.accentPrimary },
                    ]}
                  >
                    <Text style={styles.priceText}>
                      {pkg.product.priceString}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}

        <View style={styles.footer}>
          <TouchableOpacity onPress={handleRestorePurchases}>
            <Text
              style={[
                styles.restoreText,
                { color: theme.colors.accentPrimary },
              ]}
            >
              Restore Tokens
            </Text>
          </TouchableOpacity>
          <Text style={[styles.disclaimer, { color: theme.colors.textMuted }]}>
            Purchases are managed through your{" "}
            {Platform.OS === "ios" ? "Apple ID" : "Google Play"} account.
          </Text>
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0f0928" },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 16,
  },
  loadingText: { fontSize: 14 },
  content: { padding: 16, paddingBottom: 40, gap: 12 },
  balanceCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    padding: 18,
    borderRadius: 18,
    marginBottom: 2,
  },
  balanceIconWrap: {
    width: 52,
    alignItems: "center",
    justifyContent: "center",
  },
  balanceIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
  },
  balanceTextWrap: { flex: 1 },
  balanceLabel: { fontSize: 13, marginBottom: 4 },
  balanceValue: { fontSize: 28, fontWeight: "800" },
  previewCard: { padding: 18, borderRadius: 18, gap: 10, marginTop: 2 },
  previewHeader: { flexDirection: "row", alignItems: "center", gap: 8 },
  previewTitle: { fontSize: 16, fontWeight: "800" },
  previewText: { fontSize: 13, lineHeight: 19 },
  previewButtons: { flexDirection: "row", gap: 10, flexWrap: "wrap" },
  previewBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 12,
  },
  previewBtnText: { fontSize: 12, fontWeight: "700" },
  claimCard: {
    padding: 18,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "rgba(20,195,142,0.45)",
    backgroundColor: "rgba(18, 29, 57, 0.9)",
    gap: 10,
    marginTop: 2,
  },
  claimHeader: { flexDirection: "row", alignItems: "center", gap: 8 },
  claimTitle: { fontSize: 18, fontWeight: "800" },
  claimSubtitle: { fontSize: 14 },
  claimBtn: { borderRadius: 10, paddingVertical: 14, alignItems: "center" },
  claimBtnText: { color: "#fff", fontSize: 15, fontWeight: "800" },
  sectionTitle: { fontSize: 20, fontWeight: "800", marginTop: 4 },
  supportIntroCard: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    backgroundColor: "rgba(21, 24, 45, 0.8)",
    gap: 8,
    borderColor: "#8c5e18",
  },
  supportIntroHeader: { flexDirection: "row", alignItems: "center", gap: 8 },
  supportIntroTitle: { fontSize: 16, fontWeight: "800" },
  supportIntroText: { fontSize: 13, lineHeight: 19 },
  supportIntroNote: { fontSize: 11, fontStyle: "italic" },
  tierGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  tierCard: {
    width: "48%",
    borderWidth: 1,
    borderRadius: 16,
    padding: 14,
    minHeight: 126,
    alignItems: "center",
    justifyContent: "center",
  },
  tierCenter: {
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    gap: 6,
  },
  tierTokenRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  tierTokenDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#ff2323",
  },
  tierTokens: { fontSize: 18, fontWeight: "800", textAlign: "center" },
  tierLabel: { fontSize: 15, fontWeight: "700", textAlign: "center" },
  tierPrice: { fontSize: 22, fontWeight: "800", textAlign: "center" },
  tierSubtitle: { fontSize: 11, lineHeight: 15, textAlign: "center" },
  unlockList: { gap: 10 },
  unlockItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
  },
  unlockText: { fontSize: 14, fontWeight: "600" },
  featureStack: { gap: 12 },
  featureCard: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 16,
    minHeight: 118,
  },
  featureHeader: { flexDirection: "row", alignItems: "flex-start", gap: 12 },
  featureIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.04)",
  },
  featureHeaderText: { flex: 1, gap: 4 },
  featureTitle: { fontSize: 17, fontWeight: "800" },
  featureDesc: { fontSize: 13, lineHeight: 18 },
  featureCostPill: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    minWidth: 50,
    backgroundColor: "rgba(255,34,34,0.12)",
    borderRadius: 999,
    paddingVertical: 7,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: "rgba(255,34,34,0.18)",
    gap: 6,
  },
  featureCostDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#ff2323",
  },
  featureCostText: { color: "#ff2222", fontSize: 12, fontWeight: "800" },
  packages: { gap: 12 },
  packageCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    gap: 12,
  },
  packageInfo: { flex: 1 },
  packageTitle: { fontSize: 16, fontWeight: "800", marginBottom: 2 },
  packageDesc: { fontSize: 12, lineHeight: 17 },
  priceTag: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    minWidth: 64,
    alignItems: "center",
  },
  priceText: { color: "#fff", fontWeight: "800" },
  footer: { alignItems: "center", gap: 10, paddingTop: 8 },
  restoreText: { fontSize: 14, fontWeight: "700" },
  disclaimer: { fontSize: 12, textAlign: "center", lineHeight: 17 },
});
