import { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Redirect } from 'expo-router';

const LANGUAGE_SELECTION_KEY = '@tts_mobile_language_selected';

export default function AppEntry() {
  const [ready, setReady] = useState(false);
  const [hasLanguageSelection, setHasLanguageSelection] = useState(false);

  useEffect(() => {
    let mounted = true;

    AsyncStorage.getItem(LANGUAGE_SELECTION_KEY)
      .then((value) => {
        if (!mounted) {
          return;
        }
        setHasLanguageSelection(value === '1');
      })
      .finally(() => {
        if (mounted) {
          setReady(true);
        }
      });

    return () => {
      mounted = false;
    };
  }, []);

  if (!ready) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: '#050510'
        }}
      >
        <ActivityIndicator size="large" color="#00C6FF" />
      </View>
    );
  }

  if (!hasLanguageSelection) {
    return <Redirect href={'/language' as any} />;
  }

  return <Redirect href={'/(tabs)'} />;
}
