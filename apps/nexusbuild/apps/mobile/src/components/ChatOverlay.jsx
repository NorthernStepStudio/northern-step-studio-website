import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

import MarkdownMessage from "./MarkdownMessage";
import SuggestionChips from "./SuggestionChips";
import { FEATURES } from "../core/config";
import { handleChatLinkPress } from "../core/chatLinks";
import { useChatUI } from "../contexts/ChatUIContext";
import { useBuild } from "../contexts/BuildContext";
import { useTheme } from "../contexts/ThemeContext";

const GENERAL_MODE = "general";
const ASSISTANT_MODE = "assistant";

const getOverlayTitle = (mode) =>
  mode === ASSISTANT_MODE ? "Assistant Chat" : "General Chat";
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

function ChatOverlayContent({ navigation, theme }) {
  const insets = useSafeAreaInsets();
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
    isOpen,
    loading,
    messages,
    sendMessage,
    setChatMode,
    suggestions,
    userTier,
  } = useChatUI();
  const [inputText, setInputText] = useState("");
  const scrollViewRef = useRef(null);
  const handleLinkPress = useCallback(
    (url) =>
      handleChatLinkPress(url, navigation, {
        removePart: buildContext?.removePart,
      }),
    [buildContext?.removePart, navigation],
  );

  useEffect(() => {
    if (!isOpen || !scrollViewRef.current) return;
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, [isOpen, loading, messages]);

  const openFullChat = () => {
    closeChat();
    navigation.navigate("ChatTab", {
      screen: "ChatMain",
      params: { mode: chatMode },
    });
  };

  const openAssistantPrompt = (prompt) => {
    closeChat();
    navigation.navigate("ChatTab", {
      screen: "ChatMain",
      params: { mode: ASSISTANT_MODE, presetPrompt: prompt },
    });
  };

  const openUpgrade = () => {
    closeChat();
    navigation.navigate("ProfileTab", { screen: "Store" });
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
      if (/generate (my )?build/i.test(text) || /smart build ai/i.test(text)) {
        openAssistantPrompt(
          "Generate me a custom PC build based on my current budget and use case.",
        );
        return;
      }
      await sendMessage(text, { mode: ASSISTANT_MODE });
      return;
    }
    if (/generate (my )?build/i.test(text) || /smart build ai/i.test(text)) {
      openAssistantPrompt(
        "Generate me a custom PC build based on my current budget and use case.",
      );
      return;
    }
    sendMessage(text);
  };

  const handleSend = () => {
    if (!inputText.trim()) return;
    sendMessage(inputText.trim());
    setInputText("");
  };

  const handleAddToBuild = (recommendations) => {
    if (!addRecommendedBuild({ parts: recommendations })) return;
    const parent = navigation.getParent?.();
    if (parent) {
      parent.navigate("BuilderTab", { screen: "BuilderMain" });
    }
  };

  return (
    <View
      style={[
        styles.panel,
        {
          backgroundColor: theme.colors.bgSecondary,
          borderColor: theme.colors.glassBorder,
        },
      ]}
    >
      <View
        style={[
          styles.header,
          {
            backgroundColor: theme.colors.bgSecondary,
            borderBottomColor: theme.colors.glassBorder,
          },
        ]}
      >
        <TouchableOpacity style={styles.headerTitle} onPress={openFullChat}>
          <Text style={[styles.titleText, { color: theme.colors.textPrimary }]}>
            {getOverlayTitle(chatMode)}
          </Text>
          <Ionicons
            name="chevron-forward"
            size={16}
            color={theme.colors.textMuted}
          />
        </TouchableOpacity>
        <View style={styles.headerActions}>
          <TouchableOpacity
            onPress={clearConversation}
            style={[
              styles.iconButton,
              { backgroundColor: theme.colors.glassBg },
            ]}
          >
            <Ionicons
              name="trash-outline"
              size={18}
              color={theme.colors.textMuted}
            />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={closeChat}
            style={[
              styles.iconButton,
              { backgroundColor: theme.colors.error + "20" },
            ]}
          >
            <Ionicons name="close" size={18} color={theme.colors.error} />
          </TouchableOpacity>
        </View>
      </View>

      {(FEATURES.GENERAL_CHAT || FEATURES.ASSISTANT_CHAT) && (
        <View
          style={[
            styles.modeBar,
            { borderBottomColor: theme.colors.glassBorder },
          ]}
        >
          {FEATURES.GENERAL_CHAT && (
            <TouchableOpacity
              style={[
                styles.modeButton,
                chatMode === GENERAL_MODE && {
                  backgroundColor: theme.colors.accentPrimary + "22",
                  borderColor: theme.colors.accentPrimary,
                },
              ]}
              onPress={() => setChatMode(GENERAL_MODE)}
            >
              <Text
                style={[
                  styles.modeText,
                  {
                    color:
                      chatMode === GENERAL_MODE
                        ? theme.colors.accentPrimary
                        : theme.colors.textSecondary,
                  },
                ]}
              >
                General
              </Text>
            </TouchableOpacity>
          )}
          {FEATURES.ASSISTANT_CHAT && (
            <TouchableOpacity
              style={[
                styles.modeButton,
                chatMode === ASSISTANT_MODE && {
                  backgroundColor: theme.colors.accentSecondary + "22",
                  borderColor: theme.colors.accentSecondary,
                },
              ]}
              onPress={() => setChatMode(ASSISTANT_MODE)}
            >
              <Ionicons
                name={
                  assistantUnlocked ? "sparkles-outline" : "lock-closed-outline"
                }
                size={14}
                color={
                  chatMode === ASSISTANT_MODE
                    ? theme.colors.accentSecondary
                    : theme.colors.textMuted
                }
              />
              <Text
                style={[
                  styles.modeText,
                  {
                    color:
                      chatMode === ASSISTANT_MODE
                        ? theme.colors.accentSecondary
                        : theme.colors.textSecondary,
                  },
                ]}
              >
                Assistant
              </Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {chatMode === ASSISTANT_MODE && !assistantUnlocked && (
        <View
          style={[
            styles.banner,
            {
              backgroundColor: theme.colors.glassBg,
              borderColor: theme.colors.glassBorder,
            },
          ]}
        >
          <View style={styles.bannerCopy}>
            <Text
              style={[styles.bannerTitle, { color: theme.colors.textPrimary }]}
            >
              Assistant locked
            </Text>
            <Text
              style={[styles.bannerText, { color: theme.colors.textSecondary }]}
            >
              AI Tokens unlock build planning and Builder handoff.
            </Text>
          </View>
          <TouchableOpacity
            style={[
              styles.upgradeButton,
              { backgroundColor: theme.colors.accentPrimary },
            ]}
            onPress={openUpgrade}
          >
            <Text style={styles.upgradeButtonText}>Get Tokens</Text>
          </TouchableOpacity>
        </View>
      )}

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
        keyboardVerticalOffset={Platform.OS === "ios" ? 50 : 0}
      >
        <ScrollView
          ref={scrollViewRef}
          style={styles.messagesContainer}
          contentContainerStyle={styles.messagesContent}
          showsVerticalScrollIndicator={false}
        >
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
                      }
                    : {
                        backgroundColor: theme.colors.accentPrimary + "20",
                        borderColor: theme.colors.accentPrimary + "40",
                        borderWidth: 1,
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
                  Array.isArray(message.recommendations) &&
                  message.recommendations.length > 0 &&
                  chatMode === ASSISTANT_MODE && (
                    <View
                      style={[
                        styles.buildCard,
                        {
                          backgroundColor: theme.colors.surface,
                          borderColor: theme.colors.accentSecondary + "40",
                        },
                      ]}
                    >
                      <View style={styles.buildCardHeader}>
                        <Ionicons
                          name="cube-outline"
                          size={18}
                          color={theme.colors.accentSecondary}
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
                          { backgroundColor: theme.colors.accentSecondary },
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
            <View style={[styles.messageWrapper, styles.botMessageWrapper]}>
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
              <View
                style={[
                  styles.messageBubble,
                  {
                    backgroundColor: theme.colors.glassBg,
                    borderColor: theme.colors.glassBorder,
                    borderWidth: 1,
                  },
                ]}
              >
                <ActivityIndicator
                  size="small"
                  color={theme.colors.accentPrimary}
                />
              </View>
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
              borderTopColor: theme.colors.glassBorder,
              paddingBottom: Math.max(insets.bottom, 12),
            },
          ]}
        >
          <TextInput
            style={[
              styles.input,
              {
                color: theme.colors.textPrimary,
                backgroundColor: theme.colors.surface,
                borderColor: theme.colors.glassBorder,
              },
            ]}
            placeholder={getPlaceholder(chatMode)}
            placeholderTextColor={theme.colors.textMuted}
            value={inputText}
            onChangeText={setInputText}
            onSubmitEditing={handleSend}
          />
          <TouchableOpacity
            style={[
              styles.sendButton,
              { backgroundColor: theme.colors.accentPrimary },
            ]}
            onPress={handleSend}
            disabled={!inputText.trim()}
          >
            <LinearGradient
              colors={["rgba(255,255,255,0.2)", "transparent"]}
              style={styles.sendGradient}
            >
              <Ionicons name="arrow-up" size={20} color="#FFF" />
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

export default function ChatOverlay() {
  const { theme } = useTheme();
  const { isOpen, closeChat } = useChatUI();
  const navigation = useNavigation();

  if (!isOpen) return null;

  const content = <ChatOverlayContent navigation={navigation} theme={theme} />;

  if (Platform.OS === "web") {
    return (
      <View style={styles.webOverlay}>
        <Pressable style={styles.backdrop} onPress={closeChat} />
        <View style={styles.webPanelWrap}>{content}</View>
      </View>
    );
  }

  return (
    <Modal
      visible={isOpen}
      transparent
      animationType="fade"
      onRequestClose={closeChat}
    >
      <Pressable style={styles.backdrop} onPress={closeChat} />
      <View style={styles.mobilePanelWrap}>{content}</View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  webOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 10000,
  },
  mobilePanelWrap: {
    position: "absolute",
    top: 60,
    left: "5%",
    right: "5%",
    bottom: 20,
  },
  webPanelWrap: {
    position: "absolute",
    right: 20,
    bottom: 20,
    width: 400,
    maxHeight: "80%",
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.45)",
  },
  panel: {
    flex: 1,
    borderRadius: 22,
    borderWidth: 1,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.28,
    shadowRadius: 18,
    elevation: 8,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 13,
    borderBottomWidth: 1,
  },
  headerTitle: { flexDirection: "row", alignItems: "center", gap: 6 },
  titleText: { fontSize: 16, fontWeight: "700", letterSpacing: -0.2 },
  headerActions: { flexDirection: "row", gap: 8 },
  iconButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
  },
  modeBar: {
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  modeButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "transparent",
  },
  modeText: { fontSize: 12, fontWeight: "700" },
  banner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    margin: 12,
    marginBottom: 0,
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
  },
  bannerCopy: { flex: 1 },
  bannerTitle: {
    fontSize: 13,
    fontWeight: "700",
    marginBottom: 2,
    letterSpacing: -0.1,
  },
  bannerText: { fontSize: 11, lineHeight: 15 },
  upgradeButton: {
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 999,
  },
  upgradeButtonText: { color: "#111827", fontSize: 12, fontWeight: "700" },
  keyboardView: { flex: 1 },
  messagesContainer: { flex: 1 },
  messagesContent: { padding: 14, paddingBottom: 20 },
  messageWrapper: {
    flexDirection: "row",
    marginBottom: 12,
    alignItems: "flex-end",
  },
  botMessageWrapper: { justifyContent: "flex-start" },
  userMessageWrapper: { justifyContent: "flex-end" },
  botAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    marginRight: 8,
    overflow: "hidden",
  },
  avatarImage: { width: "100%", height: "100%" },
  messageBubble: { maxWidth: "86%", padding: 12, borderRadius: 16 },
  messageText: { fontSize: 14, lineHeight: 20, letterSpacing: -0.05 },
  buildCard: { marginTop: 10, padding: 12, borderRadius: 12, borderWidth: 1 },
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
    borderBottomColor: "rgba(255,255,255,0.06)",
    gap: 8,
  },
  buildPartCategory: { fontSize: 11, width: 76, textTransform: "uppercase" },
  buildPartName: { flex: 1, fontSize: 13, marginRight: 8 },
  buildPartPrice: { fontSize: 13, fontWeight: "600" },
  addToBuildButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 10,
    paddingVertical: 10,
    borderRadius: 12,
  },
  addToBuildText: { color: "#FFF", fontSize: 14, fontWeight: "600" },
  suggestionsContainer: { paddingBottom: 8 },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderTopWidth: 1,
    gap: 8,
  },
  input: {
    flex: 1,
    height: 42,
    borderRadius: 21,
    paddingHorizontal: 16,
    borderWidth: 1,
    fontSize: 14,
  },
  sendButton: { width: 40, height: 40, borderRadius: 20, overflow: "hidden" },
  sendGradient: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
});
