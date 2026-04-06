import { Stack } from 'expo-router';
import { useEffect, useState } from 'react';
import { Platform } from 'react-native';

import { StatusBar } from 'expo-status-bar';
import { View, Text, Pressable } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as SplashScreen from 'expo-splash-screen';
import { ErrorBoundaryProps } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { seedLessonsIfEmpty } from '../storage/lessons';
import { theme } from '../constants/theme';
import { MedalProvider } from '../components/MedalContext';
import { TutorialProvider } from '../components/TutorialContext';
import { NotificationProvider } from '../components/NotificationContext';
import { I18nProvider, useI18n } from '../i18n';
import { getCurrentLanguage, getTranslator } from '../i18n';

// Prevent splash screen from auto-hiding
SplashScreen.preventAutoHideAsync().catch(console.warn);

export function ErrorBoundary({ error, retry }: ErrorBoundaryProps) {
  const { tr } = getTranslator(getCurrentLanguage());
  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.bg, justifyContent: 'center', alignItems: 'center', padding: 40 }}>
      <MaterialCommunityIcons name="alert-octagon" size={64} color={theme.colors.danger} />
      <Text style={{ color: theme.colors.text, fontSize: 24, fontWeight: '900', marginTop: 24, textAlign: 'center' }}>{tr("SYSTEM MALFUNCTION")}</Text>
      <Text style={{ color: theme.colors.muted, fontSize: 16, textAlign: 'center', marginTop: 12, lineHeight: 24 }}>
        {tr("A critical error has occurred. Even the best machines glitch occasionally.")}
      </Text>
      <View style={{ marginTop: 24, padding: 16, backgroundColor: theme.colors.card, borderRadius: 16, width: '100%' }}>
        <Text style={{ color: theme.colors.danger, fontSize: 12, fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace' }}>
          {error.message}
        </Text>
      </View>
      <Pressable
        onPress={retry}
        style={({ pressed }) => ({
          marginTop: 40,
          paddingVertical: 16,
          paddingHorizontal: 32,
          borderRadius: 30,
          backgroundColor: theme.colors.accent,
          opacity: pressed ? 0.9 : 1
        })}
      >
        <Text style={{ color: theme.colors.buttonText, fontWeight: '900', fontSize: 16 }}>{tr("REBOOT SYSTEM")}</Text>
      </Pressable>
    </View>
  );
}


function RootLayoutContent() {
  const [appIsReady, setAppIsReady] = useState(false);
  const { t } = useI18n();

  useEffect(() => {
    async function prepare() {
      try {
        // DB init happens at module level in storage/db.ts
        // Just ensure lessons are seeded
        seedLessonsIfEmpty();
        // Artificial delay if needed to ensure DB is locked/ready
        await new Promise(resolve => setTimeout(resolve, 500));
      } catch (e) {
        console.warn(e);
      } finally {
        setAppIsReady(true);
        await SplashScreen.hideAsync().catch(console.warn);
      }
    }

    prepare();
  }, []);

  if (!appIsReady) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <TutorialProvider>
        <MedalProvider>
          <NotificationProvider>
            <StatusBar style="light" translucent backgroundColor="transparent" />
              <Stack
              screenOptions={{
                headerStyle: { backgroundColor: theme.colors.bg },
                headerTintColor: theme.colors.text,
                headerShadowVisible: false,
                headerTitleStyle: { fontWeight: '900' },
              }}
              >
              <Stack.Screen name="index" options={{ headerShown: false }} />
              <Stack.Screen name="language" options={{ title: t("common.language"), headerShown: false }} />
              <Stack.Screen name="onboarding" options={{ title: t("layout.onboarding"), headerShown: false }} />
              <Stack.Screen name="checkin" options={{ title: t("layout.checkin"), headerShown: false }} />
              <Stack.Screen name="lesson/[id]" options={{ title: t("layout.lesson"), headerShown: false }} />
              <Stack.Screen name="(tabs)" options={{ headerShown: false, title: t("layout.home") }} />
              <Stack.Screen name="add-entry" options={{ title: t("layout.addEntry"), headerShown: false }} />
              <Stack.Screen name="philosophy" options={{ title: t("layout.rules"), headerShown: false }} />
              <Stack.Screen name="invest" options={{ title: t("layout.market"), headerShown: false }} />
              <Stack.Screen name="orders" options={{ title: t("layout.orders"), headerShown: false }} />
              <Stack.Screen name="loss-simulator" options={{ title: t("layout.lossSimulator"), headerShown: false }} />
              <Stack.Screen name="health-report" options={{ title: t("layout.healthReport"), headerShown: false }} />
              <Stack.Screen name="notifications" options={{ title: t("layout.notifications"), headerShown: false }} />
              <Stack.Screen name="settings" options={{ title: t("layout.settings"), headerShown: false }} />
            </Stack>
          </NotificationProvider>
        </MedalProvider>
      </TutorialProvider>
    </SafeAreaProvider>
  );
}

export default function RootLayout() {
  return (
    <I18nProvider>
      <RootLayoutContent />
    </I18nProvider>
  );
}
