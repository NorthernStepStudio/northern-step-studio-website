import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Appearance, useColorScheme } from 'react-native';

export type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeState {
    theme: ThemeMode;
    setTheme: (theme: ThemeMode) => void;
    getColors: () => ThemeColors;
}

export interface ThemeColors {
    background: string;
    surface: string;
    surfaceVariant: string;
    text: string;
    textSecondary: string;
    border: string;
    primary: string;
    error: string;
    warning: string;
    card: string;
}

const LightColors: ThemeColors = {
    background: '#F8FAFC',
    surface: '#FFFFFF',
    surfaceVariant: '#F1F5F9',
    text: '#1E293B',
    textSecondary: '#64748B',
    border: '#E2E8F0',
    primary: '#10B981',
    error: '#EF4444',
    warning: '#F59E0B',
    card: '#FFFFFF',
};

const DarkColors: ThemeColors = {
    background: '#0B1220',
    surface: '#1E293B',
    surfaceVariant: '#334155',
    text: '#FFFFFF',
    textSecondary: '#CBD5E1',
    border: '#334155',
    primary: '#10B981',
    error: '#EF4444',
    warning: '#F59E0B',
    card: '#1E293B',
};

export const useThemeStore = create<ThemeState>()(
    persist(
        (set, get) => ({
            theme: 'system' as ThemeMode,
            setTheme: (theme) => set({ theme }),
            getColors: () => {
                const mode = get().theme;
                const isDark = mode === 'dark' || (mode === 'system' && Appearance.getColorScheme() === 'dark');
                return isDark ? DarkColors : LightColors;
            },
        }),
        {
            name: 'theme-storage',
            storage: createJSONStorage(() => AsyncStorage),
        }
    )
);

export const useTheme = () => {
    const { theme } = useThemeStore();
    const systemScheme = useColorScheme();

    // Determine strict darkness
    // If theme is 'system', fallback to systemScheme
    // If theme is explicit, use it.
    const isDark = theme === 'dark' || (theme === 'system' && systemScheme === 'dark');

    const colors = isDark ? DarkColors : LightColors;

    return {
        theme,
        colors,
        isDark,
    };
};
