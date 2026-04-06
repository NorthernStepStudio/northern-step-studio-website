import React, { useState, useEffect, useRef } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ResidencyDashboardScreen } from "./src/screens/ResidencyDashboardScreen";
import { ColdOpenScreen } from "./src/screens/ColdOpenScreen";
import { ContractSetupScreen } from "./src/screens/ContractSetupScreen";
import { PaywallScreen } from "./src/screens/PaywallScreen";
import { GraduationScreen } from "./src/screens/GraduationScreen";
import { createInitialState } from "./src/game/engine";
import { GameState, Job, Rule, TimeScale } from "./src/game/types";
import { MainMenuScreen } from "./src/screens/MainMenuScreen";
import { JobSelectionScreen } from "./src/screens/JobSelectionScreen";
import { clearSave, loadGame, saveGame } from "./src/game/storage";
import { requestNotificationPermissions, schedulePaydayAlert, cancelPaydayAlert } from "./src/game/notifier";
import {
  DEFAULT_NOTIFICATION_SETTINGS,
  NotificationSettings,
  loadNotificationSettings,
  saveNotificationSettings
} from "./src/game/notificationSettings";
import { ProgramDetailsScreen } from "./src/screens/ProgramDetailsScreen";
import { getInitialMarketPrices } from "./src/game/market";

import { RuleSelectionScreen } from "./src/screens/RuleSelectionScreen";
import { LanguageGateScreen } from "./src/screens/LanguageGateScreen";

const LANGUAGE_SELECTION_KEY = "@noobsgame_language_selected";
const LANGUAGE_CODE_KEY = "@noobsgame_language";
type LanguageCode = "en";

export default function App() {
  const [state, setState] = useState<GameState>(() => ({
    ...createInitialState(),
    phase: "MAIN_MENU"
  }));
  const [savedGame, setSavedGame] = useState<GameState | null>(null);
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>(
    DEFAULT_NOTIFICATION_SETTINGS
  );
  const [languageReady, setLanguageReady] = useState(false);
  const [showLanguageGate, setShowLanguageGate] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState<LanguageCode>("en");

  const normalizeState = (loaded: GameState): GameState => {
    let normalized: GameState = {
      ...createInitialState(),
      ...loaded,
      holdings: loaded.holdings ?? {},
      marketPrices: loaded.marketPrices ?? getInitialMarketPrices(),
      timeScale: loaded.timeScale ?? "ONE_WEEK",
      openOrders: loaded.openOrders ?? [],
      marketClockMinutes: loaded.marketClockMinutes ?? 9 * 60 + 30,
      marketDay: loaded.marketDay ?? 1,
      pendingShockPct: loaded.pendingShockPct ?? 0,
      hasCompletedStory: loaded.hasCompletedStory ?? false,
      monthlyExpenses: loaded.monthlyExpenses ?? 3000,
      emergencyFundStatus: loaded.emergencyFundStatus ?? "NONE",
    };
    return normalized;
  };

  // Persistence & Notifications: Load on mount
  useEffect(() => {
    const loadLanguageChoice = async () => {
      const [savedFlag, savedCode] = await Promise.all([
        AsyncStorage.getItem(LANGUAGE_SELECTION_KEY),
        AsyncStorage.getItem(LANGUAGE_CODE_KEY),
      ]);

      setSelectedLanguage(savedCode === "en" ? "en" : "en");
      setShowLanguageGate(savedFlag !== "1");
      setLanguageReady(true);
    };

    void loadLanguageChoice();

    loadGame().then(loaded => {
      if (loaded) setSavedGame(normalizeState(loaded));
    });
    loadNotificationSettings().then(settings => setNotificationSettings(settings));
    requestNotificationPermissions();
  }, []);

  const handleLanguageSelect = async (language: LanguageCode) => {
    setSelectedLanguage(language);
    await AsyncStorage.multiSet([
      [LANGUAGE_SELECTION_KEY, "1"],
      [LANGUAGE_CODE_KEY, language],
    ]);
    setShowLanguageGate(false);
  };

  useEffect(() => {
    saveNotificationSettings(notificationSettings);
    if (!notificationSettings.enabled || !notificationSettings.payday) {
      cancelPaydayAlert();
    }
  }, [notificationSettings]);

  const lastPaydayMonthRef = useRef<number | null>(null);

  // Persistence: Auto-save on phase change or month change
  useEffect(() => {
    if (state.phase !== "MAIN_MENU" && state.phase !== "JOB_SELECTION" && state.phase !== "RULE_SELECTION") {
      saveGame(state);
    }
  }, [state.phase, state.month, state.netWorth, state.cash, state.hasSeenTutorial]);

  // Notifications: schedule only once per month
  useEffect(() => {
    if (state.phase === "SIMULATION" && state.job && notificationSettings.enabled && notificationSettings.payday) {
      if (lastPaydayMonthRef.current !== state.month) {
        lastPaydayMonthRef.current = state.month;
        schedulePaydayAlert(state.job.title);
      }
    } else if (!notificationSettings.enabled || !notificationSettings.payday) {
      cancelPaydayAlert();
    }
  }, [state.phase, state.month, state.job?.title, notificationSettings.enabled, notificationSettings.payday]);

  const setPhase = (phase: GameState["phase"]) => {
    setState(prev => ({ ...prev, phase }));
  };

  const handleStartGame = async () => {
    await clearSave();
    setSavedGame(null);
    setState(prev => ({
      ...createInitialState(),
      timeScale: prev.timeScale,
      hasCompletedStory: prev.hasCompletedStory,
      phase: "JOB_SELECTION",
    }));
  };

  const handleJobSelected = (job: Job, startingCash: number, expenses: number, emergencyFund: "NONE" | "PARTIAL" | "FULL") => {
    setState(prev => ({
      ...prev,
      job,
      cash: startingCash,
      netWorth: startingCash,
      history: [startingCash],
      freedomNumber: startingCash / prev.targetNetWorth,
      simMultiplier: 1,
      selectedRules: [],
      monthlyExpenses: expenses,
      emergencyFundStatus: emergencyFund,
      phase: "RULE_SELECTION"
    }));
  };

  const handleRulesConfirmed = (selectedRules: Rule[]) => {
    setState(prev => ({
      ...prev,
      selectedRules,
      phase: "COLD_OPEN" // Finally begin the intro
    }));
  };

  const handleContinueGame = () => {
    if (savedGame) {
      setState(normalizeState({ ...savedGame, timeScale: state.timeScale }));
    }
  };

  const handleBeginIntro = () => setPhase("CONTRACT_SETUP");

  const handleLockContract = () => {
    // Act I is Orientaton. Paywall hits immediately after planning.
    setPhase("PAYWALL");
  };

  const handleUnlock = () => {
    setState(prev => ({
      ...prev,
      isPaidUser: true,
      phase: "SIMULATION"
    }));
  };

  const handleNotNow = () => {
    // Limited trial: up to end of Act I (which is Month 3)
    setPhase("SIMULATION");
  };

  const handleGraduation = () => {
    setState(prev => ({
      ...prev,
      hasCompletedStory: true,
      phase: "GRADUATION"
    }));
  };

  const handleExit = async () => {
    // Save current state before exiting
    await saveGame(state);
    // Refresh local resume state from what we just saved (or just use current state)
    // To be safe, we update the local 'savedGame' so 'Resume' is immediately available/up-to-date
    setSavedGame(state);
    setPhase("MAIN_MENU");
  };

  if (!languageReady) {
    return null;
  }

  if (showLanguageGate) {
    return (
      <LanguageGateScreen
        selectedLanguage={selectedLanguage}
        onSelectLanguage={handleLanguageSelect}
      />
    );
  }

  switch (state.phase) {
    case "MAIN_MENU":
      return (
        <MainMenuScreen
          onStart={handleStartGame}
          onContinue={handleContinueGame}
          canContinue={!!savedGame}
          timeScale={state.timeScale}
          onTimeScaleChange={(timeScale: TimeScale) => setState(prev => ({ ...prev, timeScale }))}
          notificationSettings={notificationSettings}
          onNotificationSettingsChange={setNotificationSettings}
        />
      );
    case "JOB_SELECTION":
      return (
        <JobSelectionScreen
          onSelectJob={handleJobSelected}
          onExit={handleExit}
          onBack={() => setPhase("MAIN_MENU")}
        />
      );
    case "RULE_SELECTION":
      return (
        <RuleSelectionScreen
          onConfirmRules={handleRulesConfirmed}
          onExit={handleExit}
          onBack={() => setPhase("JOB_SELECTION")}
        />
      );
    case "COLD_OPEN":
      return (
        <ColdOpenScreen
          onBegin={handleBeginIntro}
          onWhatIsThis={() => setPhase("PROGRAM_DETAILS")}
          onExit={handleExit}
          onBack={() => setPhase("RULE_SELECTION")}
        />
      );
    case "PROGRAM_DETAILS":
      return <ProgramDetailsScreen onBack={() => setPhase("COLD_OPEN")} onExit={handleExit} />;
    case "CONTRACT_SETUP":
      return <ContractSetupScreen state={state} onLock={handleLockContract} onExit={handleExit} />;
    case "SIMULATION":
      return (
        <ResidencyDashboardScreen
          state={state}
          setState={setState}
          onGraduation={handleGraduation}
          onExit={handleExit}
        />
      );
    case "PAYWALL":
      return <PaywallScreen onUnlock={handleUnlock} onNotNow={handleNotNow} onExit={handleExit} />;
    case "GRADUATION":
      return (
        <GraduationScreen
          state={state}
          onRestart={handleStartGame}
          onExit={handleExit}
        />
      );
    default:
      return null;
  }
}
