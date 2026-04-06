import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { HoloBackground } from '../components/future/HoloBackground';
import { TechCard } from '../components/future/TechCard';
import { theme } from '../constants/theme';

type LanguageCode = 'en';

interface LanguageGateScreenProps {
  selectedLanguage: LanguageCode;
  onSelectLanguage: (language: LanguageCode) => Promise<void>;
}

export function LanguageGateScreen({
  selectedLanguage,
  onSelectLanguage
}: LanguageGateScreenProps) {
  const [busy, setBusy] = useState(false);

  const handleSelect = async () => {
    if (busy) {
      return;
    }

    setBusy(true);
    await onSelectLanguage('en');
    setBusy(false);
  };

  return (
    <HoloBackground>
      <View style={styles.container}>
        <TechCard style={styles.card}>
          <Text style={styles.eyebrow}>LANGUAGE HANDSHAKE</Text>
          <Text style={styles.title}>Select language</Text>
          <Text style={styles.subtitle}>Available in this build</Text>

          <Pressable
            disabled={busy}
            onPress={() => void handleSelect()}
            style={({ pressed }) => [styles.option, pressed || busy ? styles.optionPressed : null]}
          >
            <Text style={styles.optionTitle}>English</Text>
            <Text style={styles.optionSub}>Core UI currently available in English</Text>
          </Pressable>

          <Text style={styles.footer}>Selected: {selectedLanguage.toUpperCase()}</Text>
        </TechCard>
      </View>
    </HoloBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 22
  },
  card: {
    width: '100%',
    maxWidth: 480,
    paddingVertical: 22
  },
  eyebrow: {
    color: theme.colors.accent,
    fontSize: 11,
    fontWeight: '900',
    fontFamily: 'monospace',
    letterSpacing: 1.4,
    marginBottom: 8
  },
  title: {
    color: theme.colors.text,
    fontSize: 30,
    fontWeight: '900',
    letterSpacing: -0.8
  },
  subtitle: {
    color: theme.colors.muted,
    marginTop: 8,
    marginBottom: 20,
    fontSize: 14,
    fontWeight: '700',
    fontFamily: 'monospace'
  },
  option: {
    borderWidth: 1,
    borderColor: theme.colors.accent,
    borderRadius: 12,
    backgroundColor: theme.colors.softCard,
    paddingHorizontal: 14,
    paddingVertical: 14
  },
  optionPressed: {
    opacity: 0.85
  },
  optionTitle: {
    color: theme.colors.text,
    fontSize: 20,
    fontWeight: '900'
  },
  optionSub: {
    marginTop: 4,
    color: theme.colors.faint,
    fontSize: 12,
    fontWeight: '700',
    fontFamily: 'monospace'
  },
  footer: {
    marginTop: 14,
    color: theme.colors.faint,
    fontSize: 11,
    fontWeight: '700',
    fontFamily: 'monospace'
  }
});
