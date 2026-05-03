import React, { useState } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

type LanguageCode = 'en' | 'es' | 'it';

interface LanguageGateScreenProps {
  selectedLanguage: LanguageCode;
  onSelectLanguage: (language: LanguageCode) => Promise<void>;
}

const OPTIONS: Array<{ code: LanguageCode; title: string; subtitle: string }> = [
  { code: 'en', title: 'English', subtitle: 'Continue in English' },
  { code: 'es', title: 'Espanol', subtitle: 'Continuar en Espanol' },
  { code: 'it', title: 'Italiano', subtitle: 'Continua in Italiano' }
];

export default function LanguageGateScreen({
  selectedLanguage,
  onSelectLanguage
}: LanguageGateScreenProps) {
  const [busy, setBusy] = useState(false);

  const handlePress = async (language: LanguageCode) => {
    if (busy) {
      return;
    }

    setBusy(true);
    await onSelectLanguage(language);
    setBusy(false);
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Image source={require('../../assets/icon.png')} style={styles.logo} resizeMode="contain" />
        <Text style={styles.title}>ProvLy</Text>
        <Text style={styles.subtitle}>Select your language</Text>
        <Text style={styles.helper}>Selecciona tu idioma</Text>

        <View style={styles.options}>
          {OPTIONS.map((option) => {
            const selected = option.code === selectedLanguage;
            return (
              <Pressable
                key={option.code}
                disabled={busy}
                onPress={() => void handlePress(option.code)}
                style={({ pressed }) => [
                  styles.option,
                  selected ? styles.optionActive : null,
                  pressed || busy ? styles.optionPressed : null
                ]}
              >
                <Text style={[styles.optionTitle, selected ? styles.optionTitleActive : null]}>{option.title}</Text>
                <Text style={styles.optionSubtitle}>{option.subtitle}</Text>
              </Pressable>
            );
          })}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B1220',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20
  },
  content: {
    width: '100%',
    maxWidth: 420,
    alignItems: 'center'
  },
  logo: {
    width: 96,
    height: 96,
    borderRadius: 24,
    marginBottom: 14
  },
  title: {
    color: '#FFFFFF',
    fontSize: 34,
    fontWeight: '800'
  },
  subtitle: {
    marginTop: 8,
    color: '#C7D2FE',
    fontSize: 18,
    fontWeight: '700'
  },
  helper: {
    marginTop: 6,
    color: '#94A3B8',
    fontSize: 14,
    fontWeight: '600'
  },
  options: {
    width: '100%',
    marginTop: 28,
    gap: 12
  },
  option: {
    backgroundColor: '#111827',
    borderColor: '#334155',
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14
  },
  optionActive: {
    borderColor: '#10B981',
    backgroundColor: '#0F1D2A'
  },
  optionPressed: {
    opacity: 0.85
  },
  optionTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800'
  },
  optionTitleActive: {
    color: '#10B981'
  },
  optionSubtitle: {
    color: '#94A3B8',
    fontSize: 13,
    marginTop: 4,
    fontWeight: '600'
  }
});
