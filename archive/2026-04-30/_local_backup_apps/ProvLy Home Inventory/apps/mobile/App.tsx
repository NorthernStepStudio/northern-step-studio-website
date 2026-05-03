import { useEffect, useState, useRef } from 'react';
import { StyleSheet, LogBox, AppState, AppStateStatus, View, ActivityIndicator, Text } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import RootNavigator from './src/navigation/RootNavigator';
import { initDB } from './src/db';
import NetInfo from '@react-native-community/netinfo';
import { useNetworkStore } from './src/stores/networkStore';
import { biometricAuth } from './src/lib/biometricAuth';
import AppLockScreen from './src/screens/AppLockScreen';
import IntroScreen from './src/screens/IntroScreen';
import * as SplashScreen from 'expo-splash-screen';
import AsyncStorage from '@react-native-async-storage/async-storage';
import './src/i18n';

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync().catch(() => { });

// Suppress common warnings that cause the LogBox overlay to appear
import { useSubscriptionStore } from './src/stores/subscriptionStore';
LogBox.ignoreLogs([
  'Text strings must be rendered within a <Text> component',
  'VirtualizedLists should never be nested',
  'Non-serializable values were found in the navigation state',
  'Each child in a list should have a unique',
  'Warning:',
]);

import { backgroundSync } from './src/sync/backgroundSync';
import AppErrorBoundary from './src/components/AppErrorBoundary';
import i18n from './src/i18n';
import LanguageGateScreen from './src/screens/LanguageGateScreen';

const LANGUAGE_SELECTION_KEY = 'provly:language:selected';
const LANGUAGE_CODE_KEY = 'provly:language:code';
type AppLanguageCode = 'en' | 'es' | 'it';

export default function App() {
  const { setOnline, loadPreferences } = useNetworkStore();
  const [isLocked, setIsLocked] = useState(true);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [showIntro, setShowIntro] = useState(true);
  const [languageReady, setLanguageReady] = useState(false);
  const [showLanguageGate, setShowLanguageGate] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState<AppLanguageCode>('en');
  const appState = useRef(AppState.currentState);

  useEffect(() => {
    const prepare = async () => {
      try {
        console.log('[System] Initializing Core Services...');

        await hydrateLanguagePreference();
        await initDB();
        await useSubscriptionStore.getState().initialize();

        backgroundSync.register();
        loadPreferences();
        console.log('[System] Initialization Complete');
      } catch (e: any) {
        console.error('Fatal Initialization Error:', e);
        // Show alert but continue if possible, or show error UI
      } finally {
        SplashScreen.hideAsync().catch(() => { });
        checkBiometricLock();
      }
    };

    prepare();

    // Subscribe to network state changes
    const unsubscribe = NetInfo.addEventListener(state => {
      const online = !!(state.isConnected && state.isInternetReachable !== false);
      setOnline(online);
      console.log('[Network] Status:', online ? 'ONLINE' : 'OFFLINE');
    });

    // Subscribe to app state changes for immediate lock on close
    const appStateSubscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      unsubscribe();
      appStateSubscription.remove();
    };
  }, []);

  const hydrateLanguagePreference = async () => {
    const [savedFlag, savedCode] = await Promise.all([
      AsyncStorage.getItem(LANGUAGE_SELECTION_KEY),
      AsyncStorage.getItem(LANGUAGE_CODE_KEY)
    ]);

    const normalizedCode: AppLanguageCode =
      savedCode === 'es' || savedCode === 'it' || savedCode === 'en' ? savedCode : 'en';

    setSelectedLanguage(normalizedCode);
    await i18n.changeLanguage(normalizedCode);
    setShowLanguageGate(savedFlag !== '1');
    setLanguageReady(true);
  };

  const handleLanguageSelect = async (language: AppLanguageCode) => {
    setSelectedLanguage(language);
    await i18n.changeLanguage(language);
    await AsyncStorage.multiSet([
      [LANGUAGE_SELECTION_KEY, '1'],
      [LANGUAGE_CODE_KEY, language]
    ]);
    setShowLanguageGate(false);
  };

  const checkBiometricLock = async () => {
    const enabled = await biometricAuth.isEnabled();
    setIsLocked(enabled);
    setCheckingAuth(false);
  };

  const handleAppStateChange = async (nextAppState: AppStateStatus) => {
    // Lock immediately when app goes to background
    if (appState.current === 'active' && nextAppState.match(/inactive|background/)) {
      const enabled = await biometricAuth.isEnabled();
      if (enabled) {
        setIsLocked(true);
      }
    }
    appState.current = nextAppState;
  };

  const handleUnlock = () => {
    setIsLocked(false);
  };

  // Don't render anything while checking auth status
  if (checkingAuth) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#10B981" />
      </View>
    );
  }

  if (!languageReady) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#10B981" />
      </View>
    );
  }

  if (showLanguageGate) {
    return (
      <LanguageGateScreen
        selectedLanguage={selectedLanguage}
        onSelectLanguage={handleLanguageSelect}
      />
    );
  }

  // Show intro video first
  if (showIntro && !checkingAuth) {
    return (
      <IntroScreen onFinish={() => setShowIntro(false)} />
    );
  }

  // Show lock screen if locked
  if (isLocked) {
    return (
      <SafeAreaProvider>
        <AppLockScreen onUnlock={handleUnlock} />
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <AppErrorBoundary>
        <RootNavigator />
      </AppErrorBoundary>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0B1220',
  },
  loadingText: {
    color: '#94A3B8',
    marginTop: 16,
    fontSize: 16,
  },
});
