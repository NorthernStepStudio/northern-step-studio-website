import { Redirect } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getProfile } from '../storage/profile';
import { LANGUAGE_SELECTION_STORAGE_KEY } from '../i18n';
import { theme } from '../constants/theme';

export default function Entrypoint() {
    const [languageChecked, setLanguageChecked] = useState(false);
    const [hasLanguageSelection, setHasLanguageSelection] = useState(false);

    useEffect(() => {
        let mounted = true;

        AsyncStorage.getItem(LANGUAGE_SELECTION_STORAGE_KEY)
            .then((stored) => {
                if (!mounted) {
                    return;
                }
                setHasLanguageSelection(stored === '1');
            })
            .finally(() => {
                if (mounted) {
                    setLanguageChecked(true);
                }
            });

        return () => {
            mounted = false;
        };
    }, []);

    if (!languageChecked) {
        return (
            <View
                style={{
                    flex: 1,
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: theme.colors.bg
                }}
            >
                <ActivityIndicator size="large" color={theme.colors.accent} />
            </View>
        );
    }

    if (!hasLanguageSelection) {
        return <Redirect href={"/language" as any} />;
    }

    const profile = getProfile();

    if (!profile) {
        return <Redirect href="/onboarding" />;
    }

    return <Redirect href="/(tabs)" />;
}
