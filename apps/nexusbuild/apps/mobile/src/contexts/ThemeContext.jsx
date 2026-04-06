import React, { createContext, useContext, useState } from 'react';
import { getTheme } from '../theme/themes';

// Hardcoded fallback theme for when context is not ready (Hermes edge case)
const fallbackTheme = {
    colors: {
        bgPrimary: '#120b2f',
        bgSecondary: '#1b1240',
        bgTertiary: '#31205d',
        accentPrimary: '#ff204a',
        accentSecondary: '#b44cff',
        textPrimary: '#ffffff',
        textSecondary: 'rgba(255, 255, 255, 0.8)',
        textMuted: 'rgba(255, 255, 255, 0.5)',
        glassBg: 'rgba(24, 18, 56, 0.72)',
        glassBgHover: 'rgba(35, 25, 72, 0.9)',
        glassBorder: 'rgba(184, 115, 255, 0.18)',
        glassWhite: 'rgba(255, 255, 255, 0.95)',
        success: '#22c55e',
        warning: '#f59e0b',
        error: '#ef4444',
        danger: '#ef4444',
        info: '#3b82f6',
    },
    gradients: {
        primary: ['#ff204a', '#ff4d4d'],
        background: ['#120b2f', '#1b1240', '#3c2368'],
        hero: ['#120b2f', '#2a1750'],
    },
    spacing: { xs: 4, sm: 8, md: 16, lg: 24, xl: 32, xxl: 48, xxxl: 64 },
    borderRadius: { sm: 8, md: 12, lg: 16, xl: 24, full: 9999 },
    fontSize: { xs: 12, sm: 15, base: 17, lg: 18, xl: 20, xxl: 24, xxxl: 32, xxxxl: 48 },
    shadows: {
        glass: { shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.37, shadowRadius: 32, elevation: 8 },
        card: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 16, elevation: 5 },
        button: { shadowColor: '#ff204a', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 16, elevation: 6 },
    },
    isDark: true,
};

const ThemeContext = createContext({
    theme: fallbackTheme,
    isDark: true,
    themeMode: 'dark',
    setTheme: () => { },
    toggleTheme: () => { },
});

export const useTheme = () => {
    const context = useContext(ThemeContext);
    // Return fallback if context is somehow undefined (shouldn't happen with default value)
    if (!context || !context.theme) {
        console.warn('[Theme] useTheme called outside ThemeProvider, using fallback');
        return {
            theme: fallbackTheme,
            isDark: true,
            themeMode: 'dark',
            setTheme: () => { },
            toggleTheme: () => { },
        };
    }
    return context;
};

export const ThemeProvider = ({ children }) => {
    const [isDark, setIsDark] = useState(true); // Start with dark mode

    const theme = getTheme(isDark);

    const toggleTheme = () => {
        setIsDark(prev => !prev);
    };

    const setTheme = (mode) => {
        if (mode === 'dark') {
            setIsDark(true);
        } else if (mode === 'light') {
            setIsDark(false);
        }
    };

    const value = {
        theme,
        isDark,
        themeMode: isDark ? 'dark' : 'light',
        setTheme,
        toggleTheme,
    };

    return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};
