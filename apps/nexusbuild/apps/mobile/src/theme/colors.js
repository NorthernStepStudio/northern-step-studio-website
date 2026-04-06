// NexusBuild Mobile Theme - Matching Web Design System
// NOTE: This is the legacy default dark theme with inline fallback for Hermes compatibility
// For theme switching, use ThemeContext and themes.js

// Hardcoded fallback theme (used if dynamic import fails)
const FALLBACK_THEME = {
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
    fontSize: { xs: 12, sm: 14, base: 16, lg: 18, xl: 20, xxl: 24, xxxl: 32, xxxxl: 48 },
    shadows: {
        glass: { shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.37, shadowRadius: 32, elevation: 8 },
        card: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 16, elevation: 5 },
        button: { shadowColor: '#ff204a', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 16, elevation: 6 },
    },
    isDark: true,
};

// Try to get dynamic theme, fall back to hardcoded if it fails
let defaultTheme;
try {
    const { getTheme } = require('./themes');
    defaultTheme = getTheme(true);
} catch (e) {
    console.warn('[Theme] Using fallback theme:', e?.message || e);
    defaultTheme = FALLBACK_THEME;
}

// Ensure all properties exist
if (!defaultTheme || !defaultTheme.colors) {
    defaultTheme = FALLBACK_THEME;
}

export const colors = defaultTheme.colors;
export const spacing = defaultTheme.spacing;
export const borderRadius = defaultTheme.borderRadius;
export const fontSize = defaultTheme.fontSize;
export const shadows = defaultTheme.shadows;
export const gradients = defaultTheme.gradients;

export default defaultTheme;
