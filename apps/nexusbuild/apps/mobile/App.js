import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { Platform, ActivityIndicator, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryClient } from '@tanstack/react-query';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemeProvider } from './src/contexts/ThemeContext';
import { AuthProvider, useAuth } from './src/contexts/AuthContext';
import { BuildProvider } from './src/contexts/BuildContext';
import { NetworkProvider } from './src/contexts/NetworkContext';
import { ChatUIProvider } from './src/contexts/ChatUIContext';
import { NotificationProvider } from './src/contexts/NotificationContext';
import { PriceTrackingProvider } from './src/contexts/PriceTrackingContext';
import { AdminSettingsProvider, useAdminSettings } from './src/contexts/AdminSettingsContext';
import { LanguageProvider } from './src/core/i18n';
import { ToastProvider } from './src/contexts/ToastContext';
import AppNavigator from './src/navigation/AppNavigator';
import MaintenanceScreen from './src/screens/MaintenanceScreen';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import { syncPendingReports } from './src/services/bugReportStorage';
import { getApiBaseUrl } from './src/core/config';

// Create a client with retry logic
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 3,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 5000), // Max 5s wait
      gcTime: 1000 * 60 * 60 * 24, // 24 hours
    },
  },
});

// Create persister
const asyncStoragePersister = createAsyncStoragePersister({
  storage: AsyncStorage,
});

// Temporary stack for maintenance login
const MaintenanceStack = createStackNavigator();

function MaintenanceAuthStack() {
  return (
    <NavigationContainer independent={true}>
      <MaintenanceStack.Navigator screenOptions={{ headerShown: false }}>
        <MaintenanceStack.Screen name="Login" component={LoginScreen} />
        <MaintenanceStack.Screen name="Register" component={RegisterScreen} />
      </MaintenanceStack.Navigator>
    </NavigationContainer>
  );
}

// Maintenance Mode Wrapper
// During maintenance: Only admins can use the app, others see maintenance screen
function MaintenanceWrapper({ children }) {
  const { isMaintenanceMode, settings, loading: settingsLoading } = useAdminSettings();
  const { user, loading: authLoading } = useAuth();

  // Check if user is admin
  const isAdmin = user?.role === 'admin' ||
    user?.is_admin === true ||
    user?.email?.toLowerCase().endsWith('@nexusbuild.app') ||
    user?.email === 'admin@nexus.com';

  // Don't do anything during loading
  if (authLoading || settingsLoading) {
    return children;
  }

  // If maintenance mode is OFF - show app normally
  if (!isMaintenanceMode) {
    return children;
  }

  // Maintenance mode is ON:
  // - If no user (not logged in) → show Login Screen
  // - If user is admin → show app
  // - If user is NOT admin → show maintenance screen

  if (!user) {
    // Not logged in - Show Login Screen (wrapped in separate container)
    // This strictly forces the Login page as the "first thing user/admin see"
    return <MaintenanceAuthStack />;
  }

  if (isAdmin) {
    // Admin - let them through to main app
    return children;
  }

  // Non-admin logged in during maintenance
  return (
    <MaintenanceScreen
      message={settings.maintenanceMessage || "We're currently under maintenance. Only administrators can access the app."}
      onAdminOverride={null}
    />
  );
}

import { useFonts } from 'expo-font';
import { Ionicons } from '@expo/vector-icons';
export default function App() {
  const [fontsLoaded] = useFonts({
    'Ionicons': require('./assets/fonts/Ionicons.ttf'),
  });

  // Track font loading for debugging Android symbols
  React.useEffect(() => {
    if (fontsLoaded) {
      console.log('[App] Local Ionicons font loaded successfully');
    }
  }, [fontsLoaded]);

  // Web-specific global styles
  React.useEffect(() => {
    if (Platform.OS === 'web' && typeof document !== 'undefined') {
      const style = document.createElement('style');
      style.textContent = `
      html, body, #root {
        height: 100%;
        margin: 0;
        padding: 0;
        overflow: hidden;
      }

      /* Scroll container fix */
      [data-testid="scroll-container"] {
        overflow-y: auto !important;
        -webkit-overflow-scrolling: touch;
      }
      `;
      document.head.appendChild(style);
    }
  }, []);

  React.useEffect(() => {
    const baseUrl = getApiBaseUrl();
    if (!baseUrl) return;
    syncPendingReports(baseUrl).catch(() => {
      // Best-effort background sync on startup
    });
  }, []);

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0a0f1e' }}>
        <ActivityIndicator size="large" color="#00E5FF" />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <PersistQueryClientProvider
        client={queryClient}
        persistOptions={{ persister: asyncStoragePersister }}
      >
        <LanguageProvider>
          <AuthProvider>
            <ThemeProvider>
              <AdminSettingsProvider>
                <NetworkProvider>
                  <NotificationProvider>
                    <PriceTrackingProvider>
                      <BuildProvider>
                        <ChatUIProvider>
                          <ToastProvider>
                            <StatusBar style="auto" />
                            <MaintenanceWrapper>
                              <AppNavigator />
                            </MaintenanceWrapper>
                          </ToastProvider>
                        </ChatUIProvider>
                      </BuildProvider>
                    </PriceTrackingProvider>
                  </NotificationProvider>
                </NetworkProvider>
              </AdminSettingsProvider>
            </ThemeProvider>
          </AuthProvider>
        </LanguageProvider>
      </PersistQueryClientProvider>
    </SafeAreaProvider>
  );
}
