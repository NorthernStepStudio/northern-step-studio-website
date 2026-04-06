import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import GlassCard from "./GlassCard";
import { chatAPI } from "../services/api";
import { getUserTier } from "../billing/revenuecat";
import { useTheme } from "../contexts/ThemeContext";
import { useAuth } from "../contexts/AuthContext";
import { useBuild } from "../contexts/BuildContext";
import { useTranslation } from "../core/i18n";
import { ASSISTANT_TOKEN_COSTS, parseTokens } from "../core/assistantTokens";
import { resolveBenchmarkScore } from "../core/performanceScore";
import { generateSmartResponse } from "../domain/ai";
const COMPONENT_ORDER = [
  "gpu",
  "cpu",
  "ram",
  "storage",
  "motherboard",
  "psu",
  "case",
  "cooler",
];

const USE_CASES = [
  { key: "gaming", label: "Gaming", icon: "game-controller-outline" },
  { key: "streaming", label: "Streaming", icon: "videocam-outline" },
  { key: "workstation", label: "Workstation", icon: "desktop-outline" },
];

const formatCurrency = (amount) => `$${Math.round(amount).toLocaleString()}`;

const normalizeRecommendations = (data) => {
  if (!data) {
    return [];
  }

  if (Array.isArray(data.recommendations) && data.recommendations.length > 0) {
    return data.recommendations.map((recommendation) => ({
      component: recommendation.component,
      amount:
        recommendation.amount ?? data.allocation?.[recommendation.component],
      explanation: recommendation.explanation || recommendation.reason || "",
    }));
  }

  const allocation = data.allocation || data;
  const explanations = data.explanations || {};

  return Object.entries(allocation).map(([component, amount]) => ({
    component,
    amount,
    explanation: explanations[component] || "",
  }));
};

const normalizeSmartBuildParts = (response) => {
  if (
    Array.isArray(response?.recommendations) &&
    response.recommendations.length > 0
  ) {
    return response.recommendations;
  }

  if (
    Array.isArray(response?.build?.parts) &&
    response.build.parts.length > 0
  ) {
    return response.build.parts;
  }

  if (response?.build?.parts && typeof response.build.parts === "object") {
    return Object.values(response.build.parts).filter(Boolean);
  }

  return [];
};

export default function BudgetAllocationCard({
  recommendations = [],
  loading = false,
  useCase = null,
  setUseCase = () => {},
  maxBudget = 0,
}) {
  const { theme } = useTheme();
  const { user, updateTokens } = useAuth();
  const { t } = useTranslation();
  const navigation = useNavigation();
  const { currentBuild, addPart } = useBuild();
  const [tokenCount, setTokenCount] = useState(0);
  const [assistantTier, setAssistantTier] = useState("free");
  const [smartBuildParts, setSmartBuildParts] = useState([]);
  const [smartBuildUpsells, setSmartBuildUpsells] = useState([]);
  const [selectedSmartPartIds, setSelectedSmartPartIds] = useState(new Set());
  const [smartBuildLoading, setSmartBuildLoading] = useState(false);
  const [smartBuildError, setSmartBuildError] = useState(null);
  const smartBuildTokenCost = ASSISTANT_TOKEN_COSTS.smart_build;

  useEffect(() => {
    if (!user) {
      setTokenCount(0);
      return;
    }

    setTokenCount(parseTokens(user.tokens));
  }, [user?.id, user?.tokens]);

  useEffect(() => {
    let mounted = true;

    const loadTier = async () => {
      if (!user) {
        if (mounted) {
          setAssistantTier("free");
        }
        return;
      }

      try {
        const tier = await getUserTier();
        if (mounted) {
          setAssistantTier(tier || "free");
        }
      } catch {
        if (mounted) {
          setAssistantTier("free");
        }
      }
    };

    loadTier();

    return () => {
      mounted = false;
    };
  }, [user?.id, user?.email]);

  const selectedUseCase =
    USE_CASES.find((item) => item.key === useCase) || USE_CASES[0];
  const buildType =
    selectedUseCase.key === "workstation" ? "work" : selectedUseCase.key;
  const hasSmartBuildAccess =
    Boolean(user) &&
    (assistantTier !== "free" || tokenCount >= smartBuildTokenCost);
  const smartBuildCostLabel =
    assistantTier !== "free" ? "Included" : `${smartBuildTokenCost} tokens`;

  useEffect(() => {
    if (hasSmartBuildAccess) {
      setSmartBuildError(null);
    }
  }, [hasSmartBuildAccess]);

  const syncGeneratedTokenBalance = async (nextBalance) => {
    try {
      if (
        typeof nextBalance !== "number" ||
        !Number.isFinite(nextBalance) ||
        !updateTokens
      ) {
        return;
      }

      await updateTokens(nextBalance);
    } catch (error) {
      console.warn("Failed to sync smart build token balance:", error);
    }
  };

  const handleSmartBuildGenerate = async () => {
    if (!user) {
      navigation.navigate("ProfileTab", { screen: "Login" });
      return;
    }

    if (!hasSmartBuildAccess) {
      navigation.navigate("Store");
      return;
    }

    const prompt = `Generate a complete ${selectedUseCase.label.toLowerCase()} PC build around a budget of ${formatCurrency(maxBudget)}. Return a concise parts list with the best value-first recommendations.`;
    const sessionId = `builder-smart-${buildType}-${maxBudget || 0}`;

    setSmartBuildLoading(true);
    setSmartBuildError(null);
    setSmartBuildUpsells([]);

    try {
      const aiResponse = await chatAPI.sendMessage(
        prompt,
        sessionId,
        null,
        currentBuild,
        {
          mode: "assistant",
          userTier: assistantTier,
          useCase: buildType,
          requestType: "smart_build",
        },
      );
      const parts = normalizeSmartBuildParts(aiResponse);

      if (!Array.isArray(parts) || parts.length === 0) {
        setSmartBuildError("AI did not return build parts. Please try again.");
        return;
      }

      const normalizedParts = parts
        .map((part, index) => {
          const categoryMap = {
            CPU: "cpu",
            GPU: "gpu",
            "Graphics Card": "gpu",
            Motherboard: "motherboard",
            RAM: "ram",
            Memory: "ram",
            Storage: "storage",
            SSD: "storage",
            NVMe: "storage",
            PSU: "psu",
            "Power Supply": "psu",
            Case: "case",
            Cooler: "cooler",
            "CPU Cooler": "cooler",
          };

          const category =
            categoryMap[part.category] || part.category?.toLowerCase();
          if (!category || !part.name) return null;

          return {
            id: part.id || `option-${Date.now()}-${index}`,
            category,
            name: part.name,
            price: part.price ?? 0,
            score: resolveBenchmarkScore(part),
            source: part.source || "AI",
          };
        })
        .filter(Boolean);

      if (normalizedParts.length === 0) {
        setSmartBuildError("No valid AI parts found. Please try again.");
        return;
      }

      setSmartBuildParts(normalizedParts);
      const backendUpsells = Array.isArray(aiResponse?.upsells)
        ? aiResponse.upsells
        : [];
      if (backendUpsells.length > 0) {
        setSmartBuildUpsells(backendUpsells);
      } else {
        try {
          const fallback = generateSmartResponse(prompt, {
            currentBuild,
            useCase: buildType,
          });
          setSmartBuildUpsells(
            Array.isArray(fallback?.upsells) ? fallback.upsells : [],
          );
        } catch {
          setSmartBuildUpsells([]);
        }
      }
      setSelectedSmartPartIds(new Set(normalizedParts.map((p) => p.id)));

      if (aiResponse?.tokens_remaining !== undefined) {
        const nextTokens = parseTokens(aiResponse.tokens_remaining);
        setTokenCount(nextTokens);
        await syncGeneratedTokenBalance(nextTokens);
      } else if (assistantTier === "free") {
        setTokenCount((prev) => Math.max(0, (prev || 0) - smartBuildTokenCost));
      }
    } catch (err) {
      const status = err?.response?.status;
      const code = err?.response?.data?.code;

      if (status === 401 || code === "AUTH_REQUIRED") {
        setSmartBuildError("Login required to use Smart Build.");
        navigation.navigate("ProfileTab", { screen: "Login" });
        return;
      }

      if (status === 403 || code === "INSUFFICIENT_TOKENS") {
        setSmartBuildError("Buy AI tokens to generate a smart build.");
        navigation.navigate("Store");
        return;
      }

      console.error("Smart build generation failed:", err);
      try {
        const fallback = generateSmartResponse(prompt, {
          currentBuild,
          useCase: buildType,
        });
        const fallbackParts = normalizeSmartBuildParts(fallback);
        const normalizedParts = fallbackParts
          .map((part, index) => {
            const categoryMap = {
              CPU: "cpu",
              GPU: "gpu",
              "Graphics Card": "gpu",
              Motherboard: "motherboard",
              RAM: "ram",
              Memory: "ram",
              Storage: "storage",
              SSD: "storage",
              NVMe: "storage",
              PSU: "psu",
              "Power Supply": "psu",
              Case: "case",
              Cooler: "cooler",
              "CPU Cooler": "cooler",
            };

            const category =
              categoryMap[part.category] || part.category?.toLowerCase();
            if (!category || !part.name) return null;

            return {
              id: part.id || `option-${Date.now()}-${index}`,
              category,
              name: part.name,
              price: part.price ?? 0,
              score: resolveBenchmarkScore(part),
              source: part.source || "AI",
            };
          })
          .filter(Boolean);

        if (normalizedParts.length === 0) {
          setSmartBuildError(
            "Unable to generate build at the moment. Try again.",
          );
          setSmartBuildUpsells([]);
          return;
        }

        setSmartBuildParts(normalizedParts);
        setSmartBuildUpsells(
          Array.isArray(fallback?.upsells) ? fallback.upsells : [],
        );
        setSelectedSmartPartIds(new Set(normalizedParts.map((p) => p.id)));
        if (assistantTier === "free") {
          setTokenCount((prev) => Math.max(0, prev - smartBuildTokenCost));
        }
      } catch {
        setSmartBuildError(
          "Unable to generate build at the moment. Try again.",
        );
        setSmartBuildUpsells([]);
      }
    } finally {
      setSmartBuildLoading(false);
    }
  };

  const toggleSmartPartSelection = (partId) => {
    setSelectedSmartPartIds((prevSet) => {
      const next = new Set(prevSet);
      if (next.has(partId)) {
        next.delete(partId);
      } else {
        next.add(partId);
      }
      return next;
    });
  };

  const handleAddSelectedSmartParts = async () => {
    const selectedParts = smartBuildParts.filter((part) =>
      selectedSmartPartIds.has(part.id),
    );
    if (selectedParts.length === 0) {
      Alert.alert(
        "Select parts first",
        "Choose at least one component before adding to your build.",
      );
      return;
    }

    for (const part of selectedParts) {
      await addPart(part.category, {
        id: part.id,
        name: part.name,
        price: part.price,
        category: part.category,
        score: part.score,
      });
    }

    Alert.alert(
      "Added to build",
      `Added ${selectedParts.length} parts to your Builder.`,
    );
    const parent = navigation.getParent?.();
    if (parent?.navigate)
      parent.navigate("BuilderTab", { screen: "BuilderMain" });
    else navigation.navigate("BuilderTab", { screen: "BuilderMain" });
  };

  const getUpgradeCategory = (component) => {
    const normalized = String(component || "").toLowerCase();
    const allowed = new Set(["cpu", "gpu", "cooler", "psu", "case"]);
    return allowed.has(normalized) ? normalized : null;
  };

  const handleOpenUpgrade = (upgrade) => {
    const category = getUpgradeCategory(upgrade?.component);
    if (!category || !upgrade?.upgrade) {
      return;
    }

    navigation.navigate("PartSelection", {
      category,
      categoryName: upgrade.upgrade,
      searchQuery: upgrade.upgrade,
      targetBudget: upgrade.upgradePrice || upgrade.priceDiff || 0,
      mode: "buy",
    });
  };

  const handleAddAllSmartParts = async () => {
    for (const part of smartBuildParts) {
      await addPart(part.category, {
        id: part.id,
        name: part.name,
        price: part.price,
        category: part.category,
        score: part.score,
      });
    }

    Alert.alert(
      "Added all to build",
      `Added ${smartBuildParts.length} parts to your Builder.`,
    );
    const parent = navigation.getParent?.();
    if (parent?.navigate)
      parent.navigate("BuilderTab", { screen: "BuilderMain" });
    else navigation.navigate("BuilderTab", { screen: "BuilderMain" });
  };

  const orderedRecommendations = useMemo(() => {
    if (!recommendations.length) return [];
    const orderMap = new Map(COMPONENT_ORDER.map((key, index) => [key, index]));
    return [...recommendations].sort(
      (a, b) =>
        (orderMap.get(a.component) ?? 999) - (orderMap.get(b.component) ?? 999),
    );
  }, [recommendations]);

  return (
    <GlassCard style={styles.card}>
      <View style={styles.headerRow}>
        <View style={styles.titleRow}>
          <Ionicons
            name="pie-chart-outline"
            size={20}
            color={theme.colors.accentPrimary}
          />
          <Text style={[styles.title, { color: theme.colors.textPrimary }]}>
            Budget Allocation
          </Text>
        </View>
        {maxBudget > 0 ? (
          <Text
            style={[styles.subtitle, { color: theme.colors.textSecondary }]}
          >
            {formatCurrency(maxBudget)} target
          </Text>
        ) : null}
      </View>

      {/* Use Case Selector */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.useCaseRow}
      >
        {USE_CASES.map((item) => {
          const isActive = useCase === item.key;
          return (
            <Pressable
              key={item.key}
              onPress={() => setUseCase(item.key)}
              style={[
                styles.useCaseChip,
                {
                  backgroundColor: isActive
                    ? theme.colors.accentPrimary
                    : "rgba(255,255,255,0.08)",
                  borderColor: isActive
                    ? theme.colors.accentPrimary
                    : "rgba(255,255,255,0.15)",
                },
              ]}
            >
              <Ionicons
                name={item.icon}
                size={14}
                color={isActive ? "#fff" : theme.colors.textSecondary}
              />
              <Text
                style={[
                  styles.useCaseLabel,
                  { color: isActive ? "#fff" : theme.colors.textSecondary },
                ]}
              >
                {item.label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {!maxBudget ? (
        <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
          Set a max budget to see recommended allocations.
        </Text>
      ) : null}

      {loading ? (
        <View style={styles.loadingRow}>
          <ActivityIndicator size="small" color={theme.colors.accentPrimary} />
          <Text
            style={[styles.loadingText, { color: theme.colors.textSecondary }]}
          >
            Loading recommendations...
          </Text>
        </View>
      ) : null}

      {!loading && maxBudget > 0 && orderedRecommendations.length > 0 ? (
        <View style={styles.list}>
          {orderedRecommendations.map((item) => {
            const translationKey = `parts.categories.${item.component}`;
            const translatedLabel = t(translationKey);
            const label =
              translatedLabel === translationKey
                ? item.component.toUpperCase()
                : translatedLabel;

            return (
              <View key={item.component} style={styles.listItem}>
                <View style={styles.itemHeader}>
                  <Text
                    style={[
                      styles.itemTitle,
                      { color: theme.colors.textPrimary },
                    ]}
                  >
                    {label}
                  </Text>
                  {item.amount ? (
                    <Text
                      style={[
                        styles.itemAmount,
                        { color: theme.colors.success },
                      ]}
                    >
                      {formatCurrency(item.amount)}
                    </Text>
                  ) : null}
                </View>
                <Text
                  style={[
                    styles.itemExplanation,
                    { color: theme.colors.textSecondary },
                  ]}
                >
                  {item.explanation}
                </Text>
              </View>
            );
          })}
        </View>
      ) : null}

      {maxBudget > 0 ? (
        <GlassCard style={[styles.smartBuildCard, { borderColor: "#ff204a" }]}>
          <View style={styles.smartBuildHeader}>
            <View style={styles.smartBuildTitleRow}>
              <Ionicons name="sparkles" size={20} color="#ff204a" />
              <Text
                style={[
                  styles.smartBuildTitle,
                  { color: theme.colors.textPrimary },
                ]}
              >
                Smart Build AI
              </Text>
            </View>
            <View style={styles.smartBuildTokenPill}>
              <View style={styles.smartBuildTokenDot} />
              <Text style={styles.smartBuildTokenText}>
                {hasSmartBuildAccess ? smartBuildCostLabel : "Locked"}
              </Text>
            </View>
          </View>
          <Text
            style={[
              styles.smartBuildText,
              { color: theme.colors.textSecondary },
            ]}
          >
            Get a complete {selectedUseCase.label.toLowerCase()} PC build
            optimized for {formatCurrency(maxBudget)}. The generated parts are
            added directly to your Builder.
          </Text>
          <TouchableOpacity
            style={[
              styles.smartBuildButton,
              {
                backgroundColor: hasSmartBuildAccess
                  ? "#ff1414"
                  : theme.colors.bgSecondary,
              },
            ]}
            onPress={handleSmartBuildGenerate}
            disabled={smartBuildLoading}
          >
            <Ionicons name="flash" size={18} color="#fff" />
            <Text style={styles.smartBuildButtonText}>
              {!user
                ? "Login to Unlock"
                : hasSmartBuildAccess
                  ? smartBuildLoading
                    ? "Generating..."
                    : "Generate My Build"
                  : "Buy Tokens"}
            </Text>
            {hasSmartBuildAccess ? (
              <View style={styles.smartBuildButtonToken}>
                <View style={styles.smartBuildButtonTokenDot} />
                <Text style={styles.smartBuildButtonTokenText}>
                  {assistantTier !== "free" ? "Included" : "150"}
                </Text>
              </View>
            ) : null}
          </TouchableOpacity>

          {smartBuildError ? (
            <Text
              style={[styles.smartBuildError, { color: theme.colors.error }]}
            >
              {smartBuildError}
            </Text>
          ) : null}

          <View style={styles.smartBuildUpgradeSection}>
            <View style={styles.smartBuildUpgradeHeader}>
              <View style={styles.smartBuildTitleRow}>
                <Ionicons
                  name="trending-up-outline"
                  size={18}
                  color="#ff204a"
                />
                <Text
                  style={[
                    styles.smartBuildUpgradeTitle,
                    { color: theme.colors.textPrimary },
                  ]}
                >
                  Upgrade options
                </Text>
              </View>
              <Text
                style={[
                  styles.smartBuildUpgradeSubtitle,
                  { color: theme.colors.textSecondary },
                ]}
              >
                A little more budget can move you up a tier.
              </Text>
            </View>

            {smartBuildUpsells.length > 0 ? (
              <View style={styles.smartBuildUpgradeList}>
                {smartBuildUpsells.map((upgrade) => (
                  <Pressable
                    key={`${upgrade.component}-${upgrade.upgrade}`}
                    style={[
                      styles.smartBuildUpgradeCard,
                      {
                        backgroundColor: theme.colors.bgSecondary,
                        borderColor: theme.colors.accentPrimary + "2a",
                      },
                    ]}
                    onPress={() => handleOpenUpgrade(upgrade)}
                  >
                    <View style={styles.smartBuildUpgradeTopRow}>
                      <View
                        style={[
                          styles.smartBuildUpgradeBadge,
                          { borderColor: theme.colors.accentSecondary + "40" },
                        ]}
                      >
                        <Text
                          style={[
                            styles.smartBuildUpgradeBadgeText,
                            { color: theme.colors.accentSecondary },
                          ]}
                        >
                          {upgrade.component}
                        </Text>
                      </View>
                      <Text
                        style={[
                          styles.smartBuildUpgradeDelta,
                          { color: theme.colors.textPrimary },
                        ]}
                      >
                        {upgrade.stretch > 0
                          ? `${formatCurrency(upgrade.stretch)} over budget`
                          : `${formatCurrency(upgrade.priceDiff)} more`}
                      </Text>
                    </View>

                    <Text
                      style={[
                        styles.smartBuildUpgradeName,
                        { color: theme.colors.textPrimary },
                      ]}
                    >
                      {upgrade.current} to {upgrade.upgrade}
                    </Text>
                    <Text
                      style={[
                        styles.smartBuildUpgradeBenefit,
                        { color: theme.colors.textSecondary },
                      ]}
                    >
                      {upgrade.benefit}
                    </Text>

                    <View style={styles.smartBuildUpgradeFooter}>
                      <View
                        style={[
                          styles.smartBuildUpgradeAction,
                          {
                            backgroundColor: theme.colors.accentPrimary + "20",
                          },
                        ]}
                      >
                        <Text
                          style={[
                            styles.smartBuildUpgradeActionText,
                            { color: theme.colors.accentPrimary },
                          ]}
                        >
                          Buy
                        </Text>
                      </View>
                      <Text
                        style={[
                          styles.smartBuildUpgradeFooterText,
                          { color: theme.colors.textSecondary },
                        ]}
                      >
                        New total {formatCurrency(upgrade.newTotal)}
                      </Text>
                    </View>
                  </Pressable>
                ))}
              </View>
            ) : smartBuildParts.length > 0 ? (
              <Text
                style={[
                  styles.smartBuildUpgradeEmpty,
                  { color: theme.colors.textSecondary },
                ]}
              >
                No obvious upgrades within a small price bump for this build.
              </Text>
            ) : (
              <Text
                style={[
                  styles.smartBuildUpgradeEmpty,
                  { color: theme.colors.textSecondary },
                ]}
              >
                Generate a build to see upgrade options.
              </Text>
            )}
          </View>

          {smartBuildParts.length > 0 ? (
            <View style={styles.smartBuildResults}>
              <View style={styles.smartBuildActions}>
                <TouchableOpacity
                  style={[
                    styles.smartBuildActionButton,
                    { backgroundColor: theme.colors.accentSecondary + "22" },
                  ]}
                  onPress={handleAddSelectedSmartParts}
                >
                  <Text
                    style={[
                      styles.smartBuildActionText,
                      { color: theme.colors.accentSecondary },
                    ]}
                  >
                    Add Selected
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.smartBuildActionButton,
                    { backgroundColor: theme.colors.accentPrimary + "22" },
                  ]}
                  onPress={handleAddAllSmartParts}
                >
                  <Text
                    style={[
                      styles.smartBuildActionText,
                      { color: theme.colors.accentPrimary },
                    ]}
                  >
                    Add All
                  </Text>
                </TouchableOpacity>
              </View>

              {smartBuildParts.map((part) => (
                <Pressable
                  key={part.id}
                  style={[
                    styles.smartBuildPartItem,
                    {
                      backgroundColor: selectedSmartPartIds.has(part.id)
                        ? theme.colors.accentPrimary + "15"
                        : theme.colors.bgSecondary,
                    },
                  ]}
                  onPress={() => toggleSmartPartSelection(part.id)}
                >
                  <View style={styles.smartBuildPartRow}>
                    <Text
                      style={[
                        styles.smartBuildPartCheckbox,
                        {
                          color: selectedSmartPartIds.has(part.id)
                            ? theme.colors.accentPrimary
                            : theme.colors.textSecondary,
                        },
                      ]}
                    >
                      {selectedSmartPartIds.has(part.id) ? "☑" : "☐"}
                    </Text>
                    <View style={{ flex: 1 }}>
                      <Text
                        style={[
                          styles.smartBuildPartName,
                          { color: theme.colors.textPrimary },
                        ]}
                      >
                        {part.name}
                      </Text>
                      <Text
                        style={[
                          styles.smartBuildPartMeta,
                          { color: theme.colors.textSecondary },
                        ]}
                      >
                        {part.category.toUpperCase()} · ${part.price}
                      </Text>
                    </View>
                  </View>
                </Pressable>
              ))}
            </View>
          ) : null}
        </GlassCard>
      ) : null}
    </GlassCard>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 15,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
  },
  subtitle: {
    fontSize: 12,
    fontWeight: "600",
  },
  emptyText: {
    fontSize: 13,
    marginTop: 4,
  },
  loadingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 6,
  },
  loadingText: {
    fontSize: 12,
  },
  list: {
    gap: 12,
    marginTop: 8,
  },
  listItem: {
    padding: 10,
    borderRadius: 10,
    backgroundColor: "rgba(255,255,255,0.05)",
  },
  smartBuildError: {
    marginTop: 8,
    fontSize: 12,
    fontWeight: "500",
  },
  smartBuildUpgradeSection: {
    marginTop: 10,
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    backgroundColor: "rgba(255,255,255,0.03)",
    gap: 10,
  },
  smartBuildUpgradeHeader: {
    gap: 4,
  },
  smartBuildUpgradeTitle: {
    fontSize: 14,
    fontWeight: "800",
  },
  smartBuildUpgradeSubtitle: {
    fontSize: 11,
    lineHeight: 15,
  },
  smartBuildUpgradeList: {
    gap: 8,
  },
  smartBuildUpgradeCard: {
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    gap: 8,
  },
  smartBuildUpgradeTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  smartBuildUpgradeBadge: {
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  smartBuildUpgradeBadgeText: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.6,
  },
  smartBuildUpgradeDelta: {
    fontSize: 12,
    fontWeight: "800",
  },
  smartBuildUpgradeName: {
    fontSize: 13,
    fontWeight: "800",
  },
  smartBuildUpgradeBenefit: {
    fontSize: 12,
    lineHeight: 16,
  },
  smartBuildUpgradeFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  smartBuildUpgradeAction: {
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  smartBuildUpgradeActionText: {
    fontSize: 11,
    fontWeight: "800",
  },
  smartBuildUpgradeFooterText: {
    fontSize: 11,
    fontWeight: "600",
  },
  smartBuildUpgradeEmpty: {
    fontSize: 12,
    lineHeight: 16,
  },
  smartBuildResults: {
    marginTop: 12,
  },
  smartBuildActions: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 10,
  },
  smartBuildActionButton: {
    flex: 1,
    padding: 8,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  smartBuildActionText: {
    fontWeight: "700",
    fontSize: 12,
  },
  smartBuildPartItem: {
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    marginBottom: 8,
  },
  smartBuildPartRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  smartBuildPartCheckbox: {
    fontSize: 14,
    marginRight: 8,
  },
  smartBuildPartName: {
    fontWeight: "600",
    fontSize: 13,
  },
  smartBuildPartMeta: {
    fontSize: 11,
  },
  itemHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  itemTitle: {
    fontSize: 13,
    fontWeight: "600",
  },
  itemAmount: {
    fontSize: 12,
    fontWeight: "700",
  },
  itemExplanation: {
    fontSize: 12,
    lineHeight: 16,
    marginTop: 4,
  },
  addAllFooterBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
    marginTop: 12,
  },
  smartBuildCard: {
    marginTop: 12,
    padding: 16,
    borderRadius: 18,
    gap: 12,
    borderWidth: 1,
    backgroundColor: "rgba(12, 12, 28, 0.98)",
  },
  smartBuildHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 10,
  },
  smartBuildTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flex: 1,
  },
  smartBuildTitle: {
    fontSize: 17,
    fontWeight: "800",
  },
  smartBuildTokenPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(255, 20, 20, 0.12)",
    borderWidth: 1,
    borderColor: "rgba(255, 20, 20, 0.18)",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  smartBuildTokenDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#ff2323",
  },
  smartBuildTokenText: {
    color: "#ff2323",
    fontSize: 11,
    fontWeight: "800",
  },
  smartBuildText: {
    fontSize: 13,
    lineHeight: 19,
  },
  smartBuildButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderRadius: 14,
    paddingVertical: 14,
  },
  smartBuildButtonText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "800",
  },
  smartBuildButtonToken: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(255,255,255,0.12)",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  smartBuildButtonTokenDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#fff",
  },
  smartBuildButtonTokenText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "800",
  },
  useCaseRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 12,
  },
  useCaseChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    borderWidth: 1,
  },
  useCaseLabel: {
    fontSize: 12,
    fontWeight: "600",
  },
});
