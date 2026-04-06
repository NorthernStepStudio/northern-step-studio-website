import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';

const LANGUAGE_SELECTION_KEY = '@tts_mobile_language_selected';
const LANGUAGE_CODE_KEY = '@tts_mobile_language';

export default function LanguageScreen() {
  const [busy, setBusy] = useState(false);

  const chooseEnglish = async () => {
    if (busy) {
      return;
    }

    setBusy(true);
    await AsyncStorage.multiSet([
      [LANGUAGE_SELECTION_KEY, '1'],
      [LANGUAGE_CODE_KEY, 'en']
    ]);
    router.replace('/(tabs)');
  };

  return (
    <View style={styles.flex}>
      <LinearGradient colors={['#050510', '#0a0a20', '#151540']} style={StyleSheet.absoluteFill} />
      <View style={styles.container}>
        <Text style={styles.eyebrow}>NEURAL STUDIO</Text>
        <Text style={styles.title}>Select language</Text>
        <Text style={styles.subtitle}>Choose how this app starts</Text>

        <Pressable
          disabled={busy}
          onPress={() => void chooseEnglish()}
          style={({ pressed }) => [styles.option, pressed || busy ? styles.optionPressed : null]}
        >
          <Text style={styles.optionTitle}>English</Text>
          <Text style={styles.optionSub}>Current available UI language</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24
  },
  eyebrow: {
    color: '#00C6FF',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1.3,
    marginBottom: 10
  },
  title: {
    color: '#FFFFFF',
    fontSize: 36,
    fontWeight: '900'
  },
  subtitle: {
    marginTop: 6,
    color: 'rgba(255,255,255,0.75)',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 22
  },
  option: {
    borderWidth: 1,
    borderColor: '#00C6FF',
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 16
  },
  optionPressed: {
    opacity: 0.85
  },
  optionTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '800'
  },
  optionSub: {
    marginTop: 4,
    color: 'rgba(255,255,255,0.65)',
    fontSize: 13,
    fontWeight: '600'
  }
});
