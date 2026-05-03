import React, { useEffect, useState } from 'react';
import { useFonts } from 'expo-font';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StyleSheet, View } from 'react-native';
import {
  SpaceGrotesk_400Regular,
  SpaceGrotesk_500Medium,
  SpaceGrotesk_700Bold
} from '@expo-google-fonts/space-grotesk';
import { IBMPlexMono_500Medium } from '@expo-google-fonts/ibm-plex-mono';

import AdminConsole from './src/components/AdminConsole';
import AppNavigator from './src/navigation/AppNavigator';
import { CompanionProvider, useCompanion } from './src/state/CompanionProvider';
import LanguageGateScreen from './src/screens/LanguageGateScreen';

const LANGUAGE_GATE_KEY = '@pasoscore_language_selected';

function CompanionBootstrap() {
  const { hydrated, locale, localeOptions, setLocale } = useCompanion();
  const [gateChecked, setGateChecked] = useState(false);
  const [needsLanguageSelection, setNeedsLanguageSelection] = useState(false);

  useEffect(() => {
    let mounted = true;

    AsyncStorage.getItem(LANGUAGE_GATE_KEY)
      .then((value) => {
        if (!mounted) {
          return;
        }
        setNeedsLanguageSelection(value !== '1');
      })
      .finally(() => {
        if (mounted) {
          setGateChecked(true);
        }
      });

    return () => {
      mounted = false;
    };
  }, []);

  if (!hydrated || !gateChecked) {
    return null;
  }

  const reopenLanguageGate = async () => {
    await AsyncStorage.removeItem(LANGUAGE_GATE_KEY);
    setNeedsLanguageSelection(true);
  };

  if (needsLanguageSelection) {
    return (
      <View style={styles.shell}>
        <LanguageGateScreen
          selectedLocale={locale}
          options={localeOptions}
          onSelect={(nextLocale) => {
            setLocale(nextLocale);
            void AsyncStorage.setItem(LANGUAGE_GATE_KEY, '1');
            setNeedsLanguageSelection(false);
          }}
        />
        <AdminConsole
          languageGateOpen={needsLanguageSelection}
          onReopenLanguageGate={reopenLanguageGate}
        />
      </View>
    );
  }

  return (
    <View style={styles.shell}>
      <AppNavigator />
      <AdminConsole languageGateOpen={needsLanguageSelection} onReopenLanguageGate={reopenLanguageGate} />
    </View>
  );
}

export default function App() {
  const [fontsLoaded] = useFonts({
    SpaceGrotesk_400Regular,
    SpaceGrotesk_500Medium,
    SpaceGrotesk_700Bold,
    IBMPlexMono_500Medium
  });

  if (!fontsLoaded) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <StatusBar style='dark' />
      <CompanionProvider>
        <CompanionBootstrap />
      </CompanionProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  shell: {
    flex: 1
  }
});
