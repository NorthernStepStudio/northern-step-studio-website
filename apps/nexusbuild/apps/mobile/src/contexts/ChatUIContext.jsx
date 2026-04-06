import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { Alert, Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { FEATURES } from "../core/config";
import { useTranslation } from "../core/i18n";
import {
  ASSISTANT_TOKEN_COSTS,
  getAssistantTokenCost,
  inferAssistantRequestType,
  isSmartBuildRequest,
  parseTokens,
} from "../core/assistantTokens";
import { generateSmartResponse } from "../domain/ai";
import nexusMemory from "../domain/ai/conversationMemory";
import { authAPI, chatAPI } from "../services/api";
import { getUserTier, initPurchases } from "../billing/revenuecat";
import { useAuth } from "./AuthContext";
import { useBuild } from "./BuildContext";

import { eventTracker } from "../state/eventTracker";

const ChatUIContext = createContext();
const GENERAL_MODE = "general";
const ASSISTANT_MODE = "assistant";
const GENERAL_SUGGESTIONS = [
  "GPU basics",
  "No display fix",
  "OLED vs IPS",
  "PSU sizing",
];
const ASSISTANT_SUGGESTIONS = [
  "Build a $1200 gaming PC",
  "Review my build",
  "Cyberpunk FPS estimate",
  "Check for bottlenecks",
];

const createMessage = (text, isBot, extra = {}) => ({
  id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
  text,
  isBot,
  timestamp: new Date(),
  ...extra,
});

const createGeneralWelcomeState = () => ({
  loading: false,
  messages: [
    createMessage(
      "General Chat covers PC basics, troubleshooting, compatibility, upgrades, monitors, PSUs, laptops, audio, and prebuilt checks. Use Assistant Chat for build recommendations and Builder handoff.",
      true,
    ),
  ],
  suggestions: [...GENERAL_SUGGESTIONS],
});

const createAssistantWelcomeState = () => ({
  loading: false,
  messages: [
    createMessage(
      "Assistant Chat handles build recommendations, compatibility checks, and upgrade planning. AI Tokens unlock this mode.",
      true,
    ),
  ],
  suggestions: [...ASSISTANT_SUGGESTIONS],
});

const createFallbackGeneralResponse = () => ({
  text: "General Chat covers PC basics, troubleshooting, compatibility, upgrades, monitors, PSUs, laptops, audio, and prebuilt checks. Use Assistant Chat for build recommendations and Builder handoff.",
  suggestions: [...GENERAL_SUGGESTIONS],
});

const createLockedAssistantResponse = (requiredTokens = 5) => ({
  text: `Assistant Chat requires ${requiredTokens} AI Tokens. Buy more tokens to unlock build planning, compatibility checks, and Builder handoff.`,
  suggestions: [
    "Get AI Tokens",
    "What can Assistant Chat do?",
    "Switch to General Chat",
  ],
});

export function useChatUI() {
  const context = useContext(ChatUIContext);
  if (!context) {
    throw new Error("useChatUI must be used within ChatUIProvider");
  }
  return context;
}

export function ChatUIProvider({ children }) {
  let currentUser = null;
  try {
    const auth = useAuth();
    currentUser = auth?.user;
  } catch {
    currentUser = null;
  }

  let buildContext = null;
  try {
    buildContext = useBuild();
  } catch {
    buildContext = null;
  }

  const { locale } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [chatMode, setChatModeState] = useState(null);
  const [freeAssistantCount, setFreeAssistantCount] = useState(5);

  // Track chat open/close
  useEffect(() => {
    if (isOpen) {
      eventTracker.track("chat_opened", { mode: chatMode });
    } else {
      eventTracker.track("chat_closed");
    }
  }, [isOpen]);
  const [generalState, setGeneralState] = useState(createGeneralWelcomeState);
  const [assistantState, setAssistantState] = useState(
    createAssistantWelcomeState,
  );
  const [userTier, setUserTier] = useState("free");
  const [tokens, setTokens] = useState(10000); // Default guest token fallback for offline/guest users
  const previousBuildRef = useRef(null);

  const assistantUnlocked =
    FEATURES.ASSISTANT_CHAT &&
    (userTier !== "free" ||
      tokens >= ASSISTANT_TOKEN_COSTS.assistant_chat ||
      freeAssistantCount > 0);

  const setModeState = useCallback((mode, updater) => {
    const applyUpdate = (prev) =>
      typeof updater === "function" ? updater(prev) : updater;
    if (mode === ASSISTANT_MODE) {
      setAssistantState((prev) => applyUpdate(prev));
      return;
    }
    setGeneralState((prev) => applyUpdate(prev));
  }, []);

  const setChatMode = useCallback((nextMode) => {
    if (nextMode === GENERAL_MODE && !FEATURES.GENERAL_CHAT) {
      return;
    }
    if (nextMode === ASSISTANT_MODE && !FEATURES.ASSISTANT_CHAT) {
      return;
    }
    const mode = nextMode === ASSISTANT_MODE ? ASSISTANT_MODE : GENERAL_MODE;
    setChatModeState(mode);
    eventTracker.track("chat_mode_switched", { mode });
  }, []);

  const refreshEntitlements = useCallback(async () => {
    if (!FEATURES.ASSISTANT_CHAT) {
      setUserTier("free");
      setTokens(0);
      return;
    }

    if (!currentUser) {
      setUserTier("free");
      const rawGuestTokens =
        (await AsyncStorage.getItem("guest_tokens").catch(() => "10000")) ||
        10000;
      setTokens(parseTokens(rawGuestTokens));
      return;
    }

    try {
      await initPurchases(
        currentUser.id || currentUser.uid || currentUser.email || null,
      );
    } catch (error) {
      console.error("[ChatUI] RevenueCat sync failed:", error);
    }

    try {
      const tier = await getUserTier();
      setUserTier(tier || "free");
    } catch (error) {
      console.error("[ChatUI] Tier refresh failed:", error);
      setUserTier("free");
    }

    try {
      const profile = await authAPI.getMe();
      setTokens(parseTokens(profile?.tokens ?? currentUser?.tokens ?? 0));
    } catch (error) {
      console.error("[ChatUI] Token refresh failed:", error);
      setTokens(parseTokens(currentUser?.tokens ?? 0));
    }
  }, [currentUser]);

  useEffect(() => {
    refreshEntitlements();
  }, [currentUser, isOpen, refreshEntitlements]);

  useEffect(() => {
    const initMemory = async () => {
      if (currentUser) {
        await nexusMemory.init(
          "registered",
          currentUser.id || currentUser.uid || "user",
        );
        const savedHistory = nexusMemory.getHistory();
        if (savedHistory?.length) {
          setAssistantState({
            loading: false,
            messages: [
              createMessage(
                "Welcome back to Assistant Chat.\n\nI kept your saved chat history so you can continue from where you left off.",
                true,
              ),
              ...savedHistory.map((message) =>
                createMessage(message.content, message.role === "assistant"),
              ),
            ],
            suggestions: [],
          });
        } else {
          setAssistantState(createAssistantWelcomeState());
        }
      } else {
        await nexusMemory.init("guest");
        setAssistantState(createAssistantWelcomeState());
      }

      setGeneralState(createGeneralWelcomeState());
    };

    initMemory();
  }, [currentUser]);

  useEffect(() => {
    if (!buildContext?.currentBuild) {
      return;
    }

    const partCount =
      typeof buildContext.getPartCount === "function"
        ? buildContext.getPartCount()
        : Object.values(buildContext.currentBuild.parts || {}).filter(Boolean)
            .length;

    if (previousBuildRef.current?.partCount > 0 && partCount === 0) {
      nexusMemory.resetContext();
    }

    previousBuildRef.current = { partCount };
  }, [buildContext?.currentBuild, buildContext?.getPartCount]);

  const getActiveState =
    chatMode === ASSISTANT_MODE ? assistantState : generalState;

  const toggleChat = () => setIsOpen((prev) => !prev);

  const closeChat = useCallback(() => {
    setIsOpen(false);

    if (!currentUser) {
      setGeneralState(createGeneralWelcomeState());
      setAssistantState(createAssistantWelcomeState());
      nexusMemory.clearMemory();
    }
  }, [currentUser]);

  const openChat = useCallback(() => setIsOpen(true), []);

  const appendSystemMessage = useCallback(
    (mode, text, extra = {}) => {
      const botMessage = createMessage(text, true, extra);
      setModeState(mode, (prev) => ({
        ...prev,
        loading: false,
        messages: [...prev.messages, botMessage],
        suggestions:
          extra.suggestions ||
          prev.suggestions ||
          (mode === ASSISTANT_MODE
            ? [...ASSISTANT_SUGGESTIONS]
            : [...GENERAL_SUGGESTIONS]),
      }));

      if (mode === ASSISTANT_MODE) {
        nexusMemory.addMessage("assistant", text);
      }
    },
    [setModeState],
  );

  const sendMessage = useCallback(
    async (text, optionsOrSystemMessage = {}) => {
      if (!text?.trim()) {
        return;
      }

      const options =
        typeof optionsOrSystemMessage === "boolean"
          ? { localEchoOnly: optionsOrSystemMessage }
          : optionsOrSystemMessage;
      const explicitMode =
        options?.mode === ASSISTANT_MODE || options?.mode === GENERAL_MODE
          ? options.mode
          : null;
      const content = text.trim();
      const shouldAutoRouteToAssistant =
        !explicitMode &&
        chatMode === GENERAL_MODE &&
        FEATURES.ASSISTANT_CHAT &&
        isSmartBuildRequest(content);
      const targetMode = shouldAutoRouteToAssistant
        ? ASSISTANT_MODE
        : explicitMode || chatMode;
      const assistantRequestType =
        targetMode === ASSISTANT_MODE
          ? inferAssistantRequestType(content, {
              requestType:
                options?.requestType || options?.userContext?.requestType,
              hasCurrentBuild: Boolean(buildContext?.currentBuild),
              hasGpu: Boolean(buildContext?.currentBuild?.gpu),
            })
          : "assistant_chat";
      const assistantTokenCost =
        targetMode === ASSISTANT_MODE
          ? getAssistantTokenCost(content, {
              requestType:
                options?.requestType || options?.userContext?.requestType,
              hasCurrentBuild: Boolean(buildContext?.currentBuild),
              hasGpu: Boolean(buildContext?.currentBuild?.gpu),
            })
          : 0;

      if (options?.localEchoOnly) {
        appendSystemMessage(targetMode, content, {
          skipSuggestionsReset: true,
        });
        return;
      }

      if (shouldAutoRouteToAssistant) {
        setChatMode(ASSISTANT_MODE);
      }

      const userMessage = createMessage(content, false);
      setModeState(targetMode, (prev) => ({
        ...prev,
        loading: true,
        messages: [...prev.messages, userMessage],
        suggestions: [],
      }));

      if (targetMode === ASSISTANT_MODE) {
        nexusMemory.addMessage("user", content);
      }

      if (targetMode === ASSISTANT_MODE && !assistantUnlocked) {
        const lockedResponse = createLockedAssistantResponse(
          ASSISTANT_TOKEN_COSTS.assistant_chat,
        );
        setModeState(targetMode, (prev) => ({
          ...prev,
          loading: false,
          messages: [
            ...prev.messages,
            createMessage(lockedResponse.text, true),
          ],
          suggestions: lockedResponse.suggestions,
        }));
        return;
      }

      if (
        targetMode === ASSISTANT_MODE &&
        userTier === "free" &&
        tokens < assistantTokenCost
      ) {
        const lockedResponse =
          createLockedAssistantResponse(assistantTokenCost);
        setModeState(targetMode, (prev) => ({
          ...prev,
          loading: false,
          messages: [
            ...prev.messages,
            createMessage(lockedResponse.text, true),
          ],
          suggestions: lockedResponse.suggestions,
        }));
        return;
      }

      await new Promise((resolve) => setTimeout(resolve, 250));

      try {
        const sessionId = currentUser?.id || currentUser?.uid || "guest";
        const memorySnapshot =
          targetMode === ASSISTANT_MODE
            ? nexusMemory.getStructuredContext()
            : null;
        const apiResponse = await chatAPI.sendMessage(
          content,
          sessionId,
          memorySnapshot,
          buildContext?.currentBuild,
          {
            locale,
            mode: targetMode,
            userTier,
            requestType: assistantRequestType,
            events: eventTracker.getEvents(),
          },
        );

        const fallbackResponse =
          targetMode === ASSISTANT_MODE
            ? generateSmartResponse(content, {
                currentBuild: buildContext?.currentBuild,
              })
            : createFallbackGeneralResponse();
        const response = {
          text:
            apiResponse?.text ??
            apiResponse?.response ??
            fallbackResponse.text ??
            "",
          suggestions:
            apiResponse?.suggestions ?? fallbackResponse.suggestions ?? [],
          recommendations: apiResponse?.recommendations ?? [],
          build: apiResponse?.build,
        };

        if (!response.text) {
          response.text = fallbackResponse.text;
          response.suggestions = fallbackResponse.suggestions;
        }

        const botMessage = createMessage(response.text, true, {
          recommendations:
            response.recommendations?.length > 0
              ? response.recommendations
              : Array.isArray(response.build?.parts)
                ? response.build.parts
                : [],
        });

        if (targetMode === ASSISTANT_MODE) {
          nexusMemory.addMessage("assistant", response.text);
        }

        // Keep the local token balance in sync with the authoritative server balance.
        if (apiResponse?.tokens_remaining !== undefined) {
          setTokens(parseTokens(apiResponse.tokens_remaining));
        } else if (targetMode === ASSISTANT_MODE && userTier === "free") {
          if (freeAssistantCount > 0) {
            setFreeAssistantCount((prev) => Math.max(0, prev - 1));
          } else {
            setTokens((prev) => Math.max(0, (prev || 0) - assistantTokenCost));
          }
        }

        setModeState(targetMode, (prev) => ({
          ...prev,
          loading: false,
          messages: [...prev.messages, botMessage],
          suggestions:
            response.suggestions?.length > 0
              ? response.suggestions
              : targetMode === ASSISTANT_MODE
                ? [...ASSISTANT_SUGGESTIONS]
                : [...GENERAL_SUGGESTIONS],
        }));
      } catch (error) {
        console.error("Nexus AI Logic Error:", error);

        const status = error?.response?.status;
        const code = error?.response?.data?.code;

        if (
          targetMode === ASSISTANT_MODE &&
          (status === 401 || code === "AUTH_REQUIRED")
        ) {
          const lockedResponse = createLockedAssistantResponse(
            ASSISTANT_TOKEN_COSTS.assistant_chat,
          );
          setModeState(targetMode, (prev) => ({
            ...prev,
            loading: false,
            messages: [
              ...prev.messages,
              createMessage(lockedResponse.text, true),
            ],
            suggestions: lockedResponse.suggestions,
          }));
          return;
        }

        if (
          targetMode === ASSISTANT_MODE &&
          (status === 403 || code === "INSUFFICIENT_TOKENS")
        ) {
          const requiredTokens =
            Number(error?.response?.data?.required_tokens) ||
            assistantTokenCost ||
            ASSISTANT_TOKEN_COSTS.assistant_chat;
          const lockedResponse = createLockedAssistantResponse(requiredTokens);
          setModeState(targetMode, (prev) => ({
            ...prev,
            loading: false,
            messages: [
              ...prev.messages,
              createMessage(lockedResponse.text, true),
            ],
            suggestions: lockedResponse.suggestions,
          }));
          return;
        }

        const fallback =
          targetMode === ASSISTANT_MODE
            ? {
                text: "I hit an internal error while processing that. Try rephrasing or ask a narrower build question.",
                suggestions: [...ASSISTANT_SUGGESTIONS],
              }
            : createFallbackGeneralResponse();

        setModeState(targetMode, (prev) => ({
          ...prev,
          loading: false,
          messages: [...prev.messages, createMessage(fallback.text, true)],
          suggestions: fallback.suggestions,
        }));
      }
    },
    [
      appendSystemMessage,
      assistantUnlocked,
      buildContext?.currentBuild,
      chatMode,
      currentUser,
      locale,
      setModeState,
      tokens,
      userTier,
    ],
  );

  const clearConversation = useCallback(async () => {
    const resetActiveMode = async () => {
      if (chatMode === ASSISTANT_MODE) {
        await nexusMemory.clearMemory();
        setAssistantState(createAssistantWelcomeState());
        return;
      }

      setGeneralState(createGeneralWelcomeState());
    };

    if (Platform.OS === "web") {
      await resetActiveMode();
      return;
    }

    Alert.alert("Clear Conversation", "Are you sure?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Clear",
        style: "destructive",
        onPress: () => {
          resetActiveMode();
        },
      },
    ]);
  }, [chatMode]);

  const addRecommendedBuild = useCallback(
    (buildData) => {
      if (!buildContext?.addPart) {
        console.warn("[ChatUI] Build context not available");
        return false;
      }

      try {
        const parts = buildData?.parts || buildData?.recommendations || [];
        let addedCount = 0;
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

        parts.forEach((part) => {
          const category =
            categoryMap[part.category] || part.category?.toLowerCase();
          if (!category || !part.name) {
            return;
          }

          buildContext.addPart(category, {
            id: part.id || `${category}-${Date.now()}-${addedCount}`,
            name: part.name,
            price: part.price || 0,
            category,
          });
          addedCount += 1;
        });

        if (addedCount > 0) {
          if (Platform.OS !== "web") {
            Alert.alert(
              "Build Updated",
              `Added ${addedCount} parts to your build.`,
            );
          }
          return true;
        }
      } catch (error) {
        console.error("[ChatUI] Error adding recommended build:", error);
      }

      return false;
    },
    [buildContext],
  );

  const value = {
    isOpen,
    toggleChat,
    closeChat,
    openChat,
    chatMode,
    setChatMode,
    userTier,
    tokens,
    assistantUnlocked,
    refreshEntitlements,
    messages: getActiveState.messages,
    loading: getActiveState.loading,
    suggestions: getActiveState.suggestions,
    sendMessage,
    clearConversation,
    addRecommendedBuild,
    getMemorySummary: () => nexusMemory.getSummary(),
    lastExtractedEntities: nexusMemory.getContext(),
    freeAssistantCount,
  };

  return (
    <ChatUIContext.Provider value={value}>{children}</ChatUIContext.Provider>
  );
}
