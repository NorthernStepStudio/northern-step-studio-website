import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import Header from "../components/Header";
import Layout from "../components/Layout";
import MarkdownMessage from "../components/MarkdownMessage";
import SuggestionChips from "../components/SuggestionChips";
import { handleChatLinkPress } from "../core/chatLinks";
import { FEATURES } from "../core/config";
import { useTranslation } from "../core/i18n";
import { useChatUI } from "../contexts/ChatUIContext";
import { useBuild } from "../contexts/BuildContext";
import { useTheme } from "../contexts/ThemeContext";

const GENERAL_MODE = "general";
const ASSISTANT_MODE = "assistant";

const getTitle = (mode) =>
  mode === ASSISTANT_MODE ? "Assistant Chat" : "General Chat";
const getSubtitle = (mode) =>
  mode === ASSISTANT_MODE
    ? "Build recommendations, compatibility checks, and upgrade planning"
    : "PC basics, troubleshooting, compatibility, and upgrades";
const getPlaceholder = (mode) =>
  mode === ASSISTANT_MODE
    ? "Ask for builds, upgrades, or compatibility checks..."
    : "Ask about PC parts or NexusBuild...";
const normalizeSuggestion = (value) => String(value ?? "").trim();
const isOpenAssistantSuggestion = (value) =>
  /^(open assistant chat|assistant chat)$/i.test(normalizeSuggestion(value));
const isSwitchGeneralSuggestion = (value) =>
  /^switch to general chat$/i.test(normalizeSuggestion(value));
const isTokenStoreSuggestion = (value) =>
  /(?:buy|get|open).*(ai tokens?|token store)|\btoken store\b|^get ai tokens$/i.test(
    normalizeSuggestion(value),
  );
const isAssistantHelpSuggestion = (value) =>
  /what can assistant chat do/i.test(normalizeSuggestion(value));
const isSaveBuildSuggestion = (value) =>
  /^save( current)? build$/i.test(normalizeSuggestion(value));
const isAssistantTaskSuggestion = (value) => {
  const text = normalizeSuggestion(value).toLowerCase();
  return (
    /\b(review my build|show fps|fps estimate|check for bottlenecks|check bottlenecks|bottleneck|compatibility|upgrade|generate (my )?build|smart build ai)\b/.test(
      text,
    ) ||
    /\b(build me|new pc|pc build|gaming pc|streaming pc|workstation|custom pc|budget build)\b/.test(
      text,
    )
  );
};

export default function ChatScreen({ navigation, route }) {
  const { theme } = useTheme();
  const { t } = useTranslation();
  let buildContext = null;
  try {
    buildContext = useBuild();
  } catch {
    buildContext = null;
  }
  const {
    addRecommendedBuild,
    assistantUnlocked,
    chatMode,
    clearConversation,
    closeChat,
    freeAssistantCount,
    lastExtractedEntities,
    loading,
    messages,
    refreshEntitlements,
    sendMessage,
    setChatMode,
    suggestions,
    tokens,
    userTier,
  } = useChatUI();

  const insets = useSafeAreaInsets();
  const [inputText, setInputText] = useState("");
  const [showEntities, setShowEntities] = useState(false);
  const scrollViewRef = useRef(null);
  const lastHelpModeRef = useRef(null);

  const helpMode = route?.params?.helpMode;
  const requestedMode = route?.params?.mode;
  const presetPrompt = route?.params?.presetPrompt;
  const chatTitle = useMemo(() => getTitle(chatMode), [chatMode]);
  const chatSubtitle = useMemo(() => getSubtitle(chatMode), [chatMode]);
  const inputPlaceholder = useMemo(() => getPlaceholder(chatMode), [chatMode]);
  const handleLinkPress = useCallback(
    (url) =>
      handleChatLinkPress(url, navigation, {
        removePart: buildContext?.removePart,
      }),
    [buildContext?.removePart, navigation],
  );

  useEffect(() => {
    closeChat?.();
    refreshEntitlements?.();
  }, [closeChat, refreshEntitlements]);

  useEffect(() => {
    if (requestedMode === ASSISTANT_MODE || requestedMode === GENERAL_MODE) {
      setChatMode(requestedMode);
    }
  }, [requestedMode, setChatMode]);

  useEffect(() => {
    if (!helpMode) {
      lastHelpModeRef.current = null;
      return;
    }
    const helpKey = `${helpMode}:${requestedMode || GENERAL_MODE}`;
    if (lastHelpModeRef.current === helpKey) return;
    lastHelpModeRef.current = helpKey;
    setChatMode(GENERAL_MODE);
    sendMessage("I need help with something", { mode: GENERAL_MODE });
  }, [helpMode, requestedMode, sendMessage, setChatMode]);

  useEffect(() => {
    if (!presetPrompt) return;
    sendMessage(presetPrompt, { mode: ASSISTANT_MODE });
    navigation.setParams({ presetPrompt: null });
  }, [navigation, presetPrompt, sendMessage]);

  useEffect(() => {
    if (!scrollViewRef.current) return;
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, [loading, messages]);

  const openUpgrade = () => {
    const parent = navigation.getParent();
    if (parent) {
      parent.navigate("ProfileTab", { screen: "Store" });
      return;
    }
    navigation.navigate("ProfileTab", { screen: "Store" });
  };

  const handleSend = () => {
    if (!inputText.trim()) return;
    sendMessage(inputText.trim());
    setInputText("");
  };

  const handleSuggestionPress = async (suggestion) => {
    const text = normalizeSuggestion(suggestion);
    if (!text) return;

    if (isOpenAssistantSuggestion(text)) {
      setChatMode(ASSISTANT_MODE);
      return;
    }
    if (isSwitchGeneralSuggestion(text)) {
      setChatMode(GENERAL_MODE);
      return;
    }
    if (isTokenStoreSuggestion(text)) {
      openUpgrade();
      return;
    }
    if (isAssistantHelpSuggestion(text)) {
      setChatMode(ASSISTANT_MODE);
      return;
    }
    if (isSaveBuildSuggestion(text)) {
      const partCount = buildContext?.getPartCount?.() || 0;
      if (partCount > 0 && buildContext?.saveBuild) {
        setChatMode(ASSISTANT_MODE);
        const result = await buildContext.saveBuild();
        if (result?.success) {
          if (Platform.OS !== "web") {
            Alert.alert("Build Saved", "Your current build was saved.");
          }
          return;
        }
      }
      setChatMode(ASSISTANT_MODE);
      await sendMessage(text, { mode: ASSISTANT_MODE });
      return;
    }
    if (isAssistantTaskSuggestion(text)) {
      setChatMode(ASSISTANT_MODE);
      await sendMessage(text, { mode: ASSISTANT_MODE });
      return;
    }
    sendMessage(text);
  };

  const handleAddToBuild = (recommendations) => {
    if (!addRecommendedBuild({ parts: recommendations })) return;
    const parent = navigation.getParent();
    if (parent) parent.navigate("BuilderTab", { screen: "BuilderMain" });
  };

  if (!chatMode) {
    return (
      <Layout scrollable={true}>
        <LinearGradient
          colors={theme.gradients.background}
          style={StyleSheet.absoluteFill}
        />
        <Header navigation={navigation} />

        <ScrollView contentContainerStyle={styles.selectionContent}>
          <View style={styles.selectionHeader}>
            <Text
              style={[styles.selectionTitle, { color: theme.colors.textPrimary }]}
            >
              CHOOSE YOUR MODE
            </Text>
            <Text
              style={[
                styles.selectionSubtitle,
                { color: theme.colors.textSecondary },
              ]}
            >
              Select the assistant that fits your needs.
            </Text>
          </View>

          <TouchableOpacity
            style={[
              styles.selectionCard,
              {
                backgroundColor: theme.colors.surface,
                borderColor: theme.colors.glassBorder,
              },
            ]}
            onPress={() => setChatMode(GENERAL_MODE)}
          >
            <View style={[styles.cardBadge, { backgroundColor: "#10b98122", borderColor: "#10b98144" }]}>
              <Text style={[styles.cardBadgeText, { color: "#10b981" }]}>ALWAYS FREE</Text>
            </View>
            <View style={styles.cardContentRow}>
              <View style={[styles.cardIconBox, { backgroundColor: "#ff204a20" }]}>
                <Ionicons name="chatbubbles" size={26} color="#ff204a" />
              </View>
              <View style={styles.cardTextContent}>
                <Text style={[styles.cardTitle, { color: theme.colors.textPrimary }]}>
                  General Chat
                </Text>
                <Text style={[styles.cardDesc, { color: theme.colors.textSecondary }]}>
                  Ask about parts, specs, terminology, and get quick answers.
                </Text>
              </View>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.selectionCard,
              {
                backgroundColor: theme.colors.surface,
                borderColor: theme.colors.glassBorder,
              },
            ]}
            onPress={() => setChatMode(ASSISTANT_MODE)}
          >
            <View style={[styles.cardBadge, { backgroundColor: "#f59e0b22", borderColor: "#f59e0b44" }]}>
              <Text style={[styles.cardBadgeText, { color: "#f59e0b" }]}>{freeAssistantCount} FREE MESSAGES</Text>
            </View>
            <View style={styles.cardContentRow}>
              <View style={[styles.cardIconBox, { backgroundColor: "#8b5cf620" }]}>
                <Ionicons name="construct" size={26} color="#8b5cf6" />
              </View>
              <View style={styles.cardTextContent}>
                <Text style={[styles.cardTitle, { color: theme.colors.textPrimary }]}>
                  Build Assistant
                </Text>
                <Text style={[styles.cardDesc, { color: theme.colors.textSecondary }]}>
                  Generate custom builds, check compatibility, and upgrade analysis.
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        </ScrollView>
      </Layout>
    );
  }

  return (
    <Layout scrollable={false}>
      <LinearGradient
        colors={theme.gradients.background}
        style={StyleSheet.absoluteFill}
      />
      <Header navigation={navigation} title={chatTitle} />

      {/* Mode Navigation Tray */}
      <View style={[styles.pillarRow, { paddingTop: insets.top + 8 }]}>
        <View style={[styles.trayContainer, { backgroundColor: "rgba(0,0,0,0.4)" }]}>
          <TouchableOpacity
            style={[
              styles.trayPill,
              chatMode === GENERAL_MODE && {
                backgroundColor: "#ff204a20",
                borderColor: "#ff204a",
                borderWidth: 1.5,
              },
            ]}
            onPress={() => setChatMode(GENERAL_MODE)}
          >
            <Text
              style={[
                styles.trayPillText,
                { color: chatMode === GENERAL_MODE ? "#fff" : theme.colors.textMuted },
              ]}
            >
              General Chat
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.trayPill,
              chatMode === ASSISTANT_MODE && {
                backgroundColor: "#8b5cf620",
                borderColor: "#8b5cf6",
                borderWidth: 1.5,
              },
            ]}
            onPress={() => setChatMode(ASSISTANT_MODE)}
          >
            <Text
              style={[
                styles.trayPillText,
                { color: chatMode === ASSISTANT_MODE ? "#fff" : theme.colors.textMuted },
              ]}
            >
              Build Assistant
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.headerActionIcons}>
          <TouchableOpacity onPress={clearConversation} style={styles.headerIconButton}>
            <Ionicons name="trash-outline" size={20} color={theme.colors.textMuted} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerIconButton}>
            <Ionicons name="flag-outline" size={20} color={theme.colors.textMuted} />
          </TouchableOpacity>
        </View>
      </View>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
        keyboardVerticalOffset={Platform.OS === "ios" ? 20 : 0}
      >
        <ScrollView
          ref={scrollViewRef}
          style={styles.messagesContainer}
          contentContainerStyle={styles.messagesContent}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() =>
            scrollViewRef.current?.scrollToEnd({ animated: true })
          }
        >
          {messages.length <= 1 && (
            <View style={styles.welcomeContainer}>
              <Image
                source={require("../../assets/images/nexus-ai-icon.png")}
                style={styles.brandingLogo}
              />
              <Text
                style={[
                  styles.welcomeTitle,
                  { color: theme.colors.textPrimary },
                ]}
              >
                Nexus AI
              </Text>
              <Text
                style={[
                  styles.welcomeSubtitle,
                  { color: theme.colors.textSecondary },
                ]}
              >
                {chatSubtitle}
              </Text>
              <View style={styles.quickPillsRow}>
                {(chatMode === ASSISTANT_MODE
                  ? [
                      "Build me a $1000 gaming PC",
                      "$1500 streaming setup",
                      "Upgrade my GPU",
                      "Review my build",
                    ]
                  : [
                      "What is a GPU?",
                      "DDR4 vs DDR5?",
                      "Best CPU for gaming?",
                      "How much RAM do I need?",
                      "NVMe vs SATA?",
                      "What is bottlenecking?",
                    ]
                ).map((item) => (
                  <TouchableOpacity
                    key={item}
                    style={[
                      styles.quickPill,
                      {
                        backgroundColor: theme.colors.glassBg,
                        borderColor:
                          chatMode === ASSISTANT_MODE ? "#8b5cf644" : "#ff204a44",
                      },
                    ]}
                    onPress={() => sendMessage(item)}
                  >
                    <Text
                      style={[
                        styles.quickPillText,
                        { color: theme.colors.textPrimary },
                      ]}
                      numberOfLines={1}
                    >
                      {item}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {showEntities &&
            lastExtractedEntities &&
            chatMode === ASSISTANT_MODE && (
              <View
                style={[
                  styles.debugPanel,
                  {
                    backgroundColor: theme.colors.glassBg,
                    borderColor: theme.colors.glassBorder,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.debugTitle,
                    { color: theme.colors.textPrimary },
                  ]}
                >
                  Extracted Entities
                </Text>
                <Text
                  style={[
                    styles.debugText,
                    { color: theme.colors.textSecondary },
                  ]}
                >
                  {JSON.stringify(lastExtractedEntities, null, 2)}
                </Text>
              </View>
            )}

          {messages.map((message) => (
            <View
              key={message.id}
              style={[
                styles.messageWrapper,
                message.isBot
                  ? styles.botMessageWrapper
                  : styles.userMessageWrapper,
              ]}
            >
              {message.isBot && (
                <View
                  style={[
                    styles.botAvatar,
                    { backgroundColor: theme.colors.glassBg },
                  ]}
                >
                  <Image
                    source={require("../../assets/images/nexus-ai-icon.png")}
                    style={styles.avatarImage}
                  />
                </View>
              )}
              <View
                style={[
                  styles.messageBubble,
                  message.isBot
                    ? {
                        backgroundColor: theme.colors.glassBg,
                        borderColor: theme.colors.glassBorder,
                        borderWidth: 1,
                        borderBottomLeftRadius: 0,
                      }
                    : {
                        backgroundColor: theme.colors.accentPrimary + "20",
                        borderWidth: 1,
                        borderColor: theme.colors.accentPrimary + "40",
                        borderBottomRightRadius: 0,
                      },
                ]}
              >
                {message.isBot ? (
                  <MarkdownMessage
                    content={message.text}
                    onLinkPress={handleLinkPress}
                  />
                ) : (
                  <Text
                    style={[
                      styles.messageText,
                      { color: theme.colors.textPrimary },
                    ]}
                  >
                    {message.text}
                  </Text>
                )}

                {message.isBot &&
                  message.id === messages[0]?.id &&
                  chatMode === ASSISTANT_MODE && (
                    <View style={styles.botActionBadgeRow}>
                      <View
                        style={[
                          styles.actionBadge,
                          {
                            backgroundColor: "#f59e0b22",
                            borderColor: "#f59e0b44",
                          },
                        ]}
                      >
                        <Ionicons name="flash" size={12} color="#f59e0b" />
                        <Text
                          style={[styles.actionBadgeText, { color: "#f59e0b" }]}
                        >
                          Smart Build{" "}
                          <Text style={{ fontWeight: "800" }}>150</Text>
                        </Text>
                        <Ionicons name="cube" size={10} color="#f59e0b" />
                      </View>
                      <View
                        style={[
                          styles.actionBadge,
                          {
                            backgroundColor: "#ff204a22",
                            borderColor: "#ff204a44",
                          },
                        ]}
                      >
                        <Ionicons name="document-text" size={12} color="#ff204a" />
                        <Text
                          style={[styles.actionBadgeText, { color: "#ff204a" }]}
                        >
                          Full Review{" "}
                          <Text style={{ fontWeight: "800" }}>100</Text>
                        </Text>
                        <Ionicons name="cube" size={10} color="#ff204a" />
                      </View>
                    </View>
                  )}

                {message.isBot &&
                  Array.isArray(message.recommendations) &&
                  message.recommendations.length > 0 &&
                  chatMode === ASSISTANT_MODE && (
                    <View
                      style={[
                        styles.buildCard,
                        {
                          backgroundColor: theme.colors.surface,
                          borderColor: "#8b5cf644",
                        },
                      ]}
                    >
                      <View style={styles.buildCardHeader}>
                        <Ionicons
                          name="cube-outline"
                          size={18}
                          color={theme.colors.accentPrimary}
                        />
                        <Text
                          style={[
                            styles.buildCardTitle,
                            { color: theme.colors.textPrimary },
                          ]}
                        >
                          Recommended Parts
                        </Text>
                      </View>
                      {message.recommendations
                        .slice(0, 8)
                        .map((part, index) => (
                          <View
                            key={`${message.id}-${index}`}
                            style={styles.buildPartRow}
                          >
                            <Text
                              style={[
                                styles.buildPartCategory,
                                { color: theme.colors.textMuted },
                              ]}
                            >
                              {part.category || "Part"}
                            </Text>
                            <Text
                              style={[
                                styles.buildPartName,
                                { color: theme.colors.textSecondary },
                              ]}
                              numberOfLines={1}
                            >
                              {part.name}
                            </Text>
                            <Text
                              style={[
                                styles.buildPartPrice,
                                { color: theme.colors.success },
                              ]}
                            >
                              ${part.price || 0}
                            </Text>
                          </View>
                        ))}
                      <TouchableOpacity
                        style={[
                          styles.addToBuildButton,
                          { backgroundColor: theme.colors.accentPrimary },
                        ]}
                        onPress={() =>
                          handleAddToBuild(message.recommendations)
                        }
                      >
                        <Ionicons name="add-circle" size={18} color="#FFF" />
                        <Text style={styles.addToBuildText}>
                          Add All to Builder
                        </Text>
                      </TouchableOpacity>
                    </View>
                  )}
              </View>
            </View>
          ))}

          {loading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator
                size="small"
                color={theme.colors.accentPrimary}
              />
              <Text
                style={[
                  styles.loadingText,
                  { color: theme.colors.textSecondary },
                ]}
              >
                {chatMode === ASSISTANT_MODE ? "Analyzing..." : "Working..."}
              </Text>
            </View>
          )}
        </ScrollView>

        {!loading && suggestions.length > 0 && (
          <View style={styles.suggestionsContainer}>
            <SuggestionChips
              suggestions={suggestions}
              onPress={handleSuggestionPress}
            />
          </View>
        )}

        <View
          style={[
            styles.inputContainer,
            {
              backgroundColor: theme.colors.bgPrimary,
              borderTopColor: theme.colors.glassBorder,
              paddingBottom: Math.max(insets.bottom, 12),
            },
          ]}
        >
          <View
            style={[
              styles.inputWrapper,
              { backgroundColor: theme.colors.surface },
            ]}
          >
            <TouchableOpacity style={styles.plusButton}>
              <Ionicons name="add" size={24} color={theme.colors.textMuted} />
            </TouchableOpacity>
            <TextInput
              style={[styles.input, { color: theme.colors.textPrimary }]}
              placeholder="Ask me anything about PCs..."
              placeholderTextColor={theme.colors.textMuted}
              value={inputText}
              onChangeText={setInputText}
              onSubmitEditing={handleSend}
              returnKeyType="send"
            />
          </View>
          <TouchableOpacity
            style={[styles.sendButton, { backgroundColor: "#ff204a" }]}
            onPress={handleSend}
            disabled={!inputText.trim()}
          >
            <LinearGradient
              colors={["rgba(255,255,255,0.2)", "transparent"]}
              style={styles.sendButtonGradient}
            >
              <Ionicons name="arrow-up" size={24} color="#FFF" />
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Layout>
  );
}

const styles = StyleSheet.create({
  keyboardView: { flex: 1 },
  selectionContent: { padding: 20, paddingTop: 40, paddingBottom: 60 },
  pillarRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    justifyContent: "space-between",
    marginBottom: 10,
  },
  trayContainer: {
    flexDirection: "row",
    padding: 4,
    borderRadius: 22,
    gap: 4,
  },
  trayPill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  trayPillText: { fontSize: 13, fontWeight: "700" },
  headerActionIcons: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  headerIconButton: {
    width: 38,
    height: 38,
    borderRadius: 99,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.03)",
  },

  selectionHeader: { alignItems: "center", marginBottom: 32 },
  selectionTitle: { fontSize: 24, fontWeight: "900", marginBottom: 8, letterSpacing: 0.5 },
  selectionSubtitle: { fontSize: 15, opacity: 0.7, textAlign: "center" },
  selectionCard: {
    padding: 24,
    borderRadius: 28,
    borderWidth: 1,
    marginBottom: 16,
    overflow: "hidden",
    position: "relative",
  },
  cardBadge: {
    position: "absolute",
    top: 16,
    right: 16,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 9,
    borderWidth: 1,
  },
  cardBadgeText: { fontSize: 10, fontWeight: "900" },
  cardContentRow: { flexDirection: "row", alignItems: "center", gap: 18 },
  cardIconBox: {
    width: 56,
    height: 56,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  cardTextContent: { flex: 1 },
  cardTitle: { fontSize: 19, fontWeight: "800", marginBottom: 4 },
  cardDesc: { fontSize: 13, lineHeight: 18, opacity: 0.75 },

  lockedBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginHorizontal: 16,
    marginTop: 12,
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
  },
  lockedCopy: { flex: 1 },
  lockedTitle: {
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 2,
    letterSpacing: -0.1,
  },
  lockedText: { fontSize: 12, lineHeight: 16 },
  upgradeButton: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
  },
  upgradeButtonText: { color: "#111827", fontWeight: "700", fontSize: 12 },
  messagesContainer: { flex: 1 },
  messagesContent: { padding: 16, paddingBottom: 20 },
  welcomeContainer: {
    alignItems: "center",
    marginTop: 60,
    marginBottom: 40,
    gap: 12,
  },
  brandingLogo: {
    width: 80,
    height: 80,
    marginBottom: 10,
  },
  welcomeTitle: { fontSize: 32, fontWeight: "900", letterSpacing: -1 },
  welcomeSubtitle: {
    fontSize: 15,
    lineHeight: 22,
    opacity: 0.7,
    textAlign: "center",
    paddingHorizontal: 40,
  },
  quickPillsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 8,
    marginTop: 12,
  },
  quickPill: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 12,
    borderWidth: 1,
  },
  quickPillText: { fontSize: 13, fontWeight: "600", letterSpacing: -0.05 },
  debugPanel: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
    marginBottom: 16,
  },
  debugTitle: { fontSize: 14, fontWeight: "600", marginBottom: 6 },
  debugText: {
    fontSize: 12,
    fontFamily: Platform.select({
      ios: "Courier",
      android: "monospace",
      default: "monospace",
    }),
  },
  messageWrapper: { marginBottom: 16, flexDirection: "row", maxWidth: "100%" },
  userMessageWrapper: { justifyContent: "flex-end" },
  botMessageWrapper: { justifyContent: "flex-start" },
  botAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 8,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  avatarImage: { width: "100%", height: "100%" },
  messageBubble: {
    padding: 12,
    borderRadius: 16,
    maxWidth: "82%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 2,
  },
  messageText: { fontSize: 14, lineHeight: 20, letterSpacing: -0.05 },
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 40,
    marginTop: 8,
    marginBottom: 16,
    gap: 8,
  },
  loadingText: { fontSize: 12, fontStyle: "italic" },
  suggestionsContainer: { paddingVertical: 8 },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderTopWidth: 1,
    gap: 12,
  },
  inputWrapper: {
    flex: 1,
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    paddingHorizontal: 4,
    flexDirection: "row",
    alignItems: "center",
  },
  plusButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  input: {
    flex: 1,
    fontSize: 15,
    height: 48,
    paddingRight: 16,
  },
  sendButton: { width: 44, height: 44, borderRadius: 22, overflow: "hidden" },
  sendButtonGradient: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  buildCard: { marginTop: 12, padding: 12, borderRadius: 12, borderWidth: 1 },
  buildCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 10,
  },
  buildCardTitle: { fontSize: 14, fontWeight: "600" },
  buildPartRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.05)",
  },
  buildPartCategory: { fontSize: 11, width: 80, textTransform: "uppercase" },
  buildPartName: { flex: 1, fontSize: 13, marginRight: 8 },
  buildPartPrice: { fontSize: 13, fontWeight: "600" },
  addToBuildButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 12,
    gap: 6,
  },
  addToBuildText: { color: "#FFF", fontSize: 14, fontWeight: "600" },

  botActionBadgeRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 12,
  },
  actionBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    gap: 6,
  },
  actionBadgeText: { fontSize: 11, fontWeight: "600" },
});
