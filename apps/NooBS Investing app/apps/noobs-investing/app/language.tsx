import { useState } from 'react';
import { Pressable, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { theme } from '../constants/theme';
import { NoobsLogo } from '../components/NoobsLogo';
import { AppLanguage, LANGUAGE_SELECTION_STORAGE_KEY, useI18n } from '../i18n';
import { getProfile } from '../storage/profile';

const LANGUAGE_OPTIONS: Array<{
  code: AppLanguage;
  title: string;
  subtitle: string;
}> = [
  { code: 'en', title: 'English', subtitle: 'Continue in English' },
  { code: 'es', title: 'Espanol', subtitle: 'Continuar en Espanol' }
];

export default function LanguageScreen() {
  const router = useRouter();
  const { language, setLanguage } = useI18n();
  const [busy, setBusy] = useState(false);

  const handleSelect = async (nextLanguage: AppLanguage) => {
    if (busy) {
      return;
    }

    setBusy(true);
    setLanguage(nextLanguage);
    await AsyncStorage.setItem(LANGUAGE_SELECTION_STORAGE_KEY, '1');

    const profile = getProfile();
    router.replace(profile ? '/(tabs)' : '/onboarding');
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <NoobsLogo size="medium" />

        <View style={styles.header}>
          <Text style={styles.eyebrow}>SELECT LANGUAGE</Text>
          <Text style={styles.title}>Choose your language</Text>
          <Text style={styles.subtitle}>Elige tu idioma</Text>
        </View>

        <View style={styles.options}>
          {LANGUAGE_OPTIONS.map((option) => {
            const selected = language === option.code;
            return (
              <Pressable
                key={option.code}
                disabled={busy}
                onPress={() => void handleSelect(option.code)}
                style={({ pressed }) => [
                  styles.optionButton,
                  selected ? styles.optionButtonActive : null,
                  pressed || busy ? styles.optionButtonPressed : null
                ]}
              >
                <Text style={[styles.optionTitle, selected ? styles.optionTitleActive : null]}>{option.title}</Text>
                <Text style={styles.optionSubtitle}>{option.subtitle}</Text>
              </Pressable>
            );
          })}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: theme.colors.bg
  },
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 32,
    justifyContent: 'space-between'
  },
  header: {
    marginTop: 20
  },
  eyebrow: {
    color: theme.colors.accent,
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginBottom: 10
  },
  title: {
    color: theme.colors.text,
    fontSize: 34,
    fontWeight: '900',
    letterSpacing: -0.8
  },
  subtitle: {
    color: theme.colors.muted,
    fontSize: 18,
    fontWeight: '600',
    marginTop: 6
  },
  options: {
    gap: 12
  },
  optionButton: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.card,
    borderRadius: 18,
    paddingVertical: 18,
    paddingHorizontal: 18
  },
  optionButtonActive: {
    borderColor: theme.colors.accent,
    backgroundColor: theme.colors.accent + '20'
  },
  optionButtonPressed: {
    opacity: 0.85
  },
  optionTitle: {
    color: theme.colors.text,
    fontSize: 20,
    fontWeight: '900'
  },
  optionTitleActive: {
    color: theme.colors.accent
  },
  optionSubtitle: {
    color: theme.colors.muted,
    fontSize: 13,
    fontWeight: '600',
    marginTop: 4
  }
});
