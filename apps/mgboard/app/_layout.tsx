import React from 'react';
import { Platform } from 'react-native';
import { Redirect, Stack, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider, useAuth } from '../src/hooks/useAuth';
import { LoadingSpinner } from '../src/components/ui/LoadingSpinner';
import * as AuliService from '../src/services/auli';
import { getAutoWatchEnabled } from '../src/services/auliWatchStorage';
import { isStudioAuthDisabled } from '../src/services/studioAuth';
import { colors } from '../src/theme';

function WebScrollbarStyles() {
  React.useEffect(() => {
    if (Platform.OS !== 'web' || typeof document === 'undefined') {
      return;
    }

    const styleId = 'mgboard-web-scrollbar-style';
    const existing = document.getElementById(styleId);
    if (existing) {
      return;
    }

    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
      html, body, #root {
        margin: 0;
        min-height: 100%;
        background: ${colors.bg.primary};
      }

      html, body {
        scrollbar-width: thin;
        scrollbar-color: rgba(77, 141, 255, 0.68) rgba(10, 18, 34, 0.56);
        scrollbar-gutter: stable;
      }

      *::-webkit-scrollbar {
        width: 9px;
        height: 9px;
      }

      *::-webkit-scrollbar-track {
        background: linear-gradient(180deg, rgba(10, 18, 34, 0.24), rgba(10, 18, 34, 0.62));
      }

      *::-webkit-scrollbar-thumb {
        background: linear-gradient(180deg, rgba(77, 141, 255, 0.78), rgba(132, 112, 255, 0.72));
        border-radius: 999px;
        border: 2px solid rgba(5, 10, 22, 0.74);
      }

      *::-webkit-scrollbar-thumb:hover {
        background: linear-gradient(180deg, rgba(110, 163, 255, 0.9), rgba(151, 133, 255, 0.88));
      }
    `;

    document.head.appendChild(style);

    return () => {
      const current = document.getElementById(styleId);
      if (current?.parentNode) {
        current.parentNode.removeChild(current);
      }
    };
  }, []);

  return null;
}

function RootLayoutContent() {
  const { loading, user } = useAuth();
  const segments = useSegments();
  const inAuthGroup = segments[0] === '(auth)';
  const authDisabled = isStudioAuthDisabled();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!authDisabled && !user && !inAuthGroup) {
    return <Redirect href="/(auth)/sign-in" />;
  }

  if ((authDisabled || user) && inAuthGroup) {
    return <Redirect href="/(tabs)" />;
  }

  return (
    <>
      <WebScrollbarStyles />
      <AuliAutoWatchRunner />
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.bg.primary },
          animation: 'fade',
        }}
      >
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
      </Stack>
    </>
  );
}

function AuliAutoWatchRunner() {
  const { user } = useAuth();

  React.useEffect(() => {
    let alive = true;

    const tick = async () => {
      try {
        if (!alive || !user) return;

        const enabled = await getAutoWatchEnabled();
        if (!enabled) return;

        const latest = await AuliService.scanTasks('auto');
        if (!alive || latest.eligible_queue.length === 0) return;

        await AuliService.runEligibleTasks({
          mode: 'auto',
          maxTasks: 1,
          ifBusy: 'skip',
        });
      } catch (error) {
        console.error('[MGBoard AuliAutoWatchRunner] Auto tick failed', error);
      }
    };

    void tick();
    const interval = setInterval(() => {
      void tick();
    }, AuliService.getAutoScanIntervalMs());

    return () => {
      alive = false;
      clearInterval(interval);
    };
  }, [user]);

  return null;
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <RootLayoutContent />
    </AuthProvider>
  );
}
