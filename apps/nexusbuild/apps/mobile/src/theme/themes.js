// Dark Theme - Darker Deep Blue & Rich Purple Mix
export const darkTheme = {
    colors: {
        // Primary Colors - reference screenshot palette
        bgPrimary: '#120b2f',
        bgSecondary: '#1b1240',
        bgTertiary: '#31205d',

        // Accent Colors - neon red/pink with purple support
        accentPrimary: '#ff204a',
        accentSecondary: '#b44cff',

        // Text Colors
        textPrimary: '#ffffff',
        textSecondary: 'rgba(255, 255, 255, 0.8)',
        textMuted: 'rgba(255, 255, 255, 0.5)',

        // Glassmorphism - Slightly more transparent/darker
        glassBg: 'rgba(21, 24, 45, 0.86)',
        glassBgHover: 'rgba(28, 32, 58, 0.96)',
        glassBorder: 'rgba(140, 94, 24, 0.45)',
        glassWhite: 'rgba(255, 255, 255, 0.95)',

        // Status Colors
        success: '#22c55e',
        warning: '#f59e0b',
        error: '#ef4444',
        danger: '#ef4444', // Alias for error - used by SettingsScreen
        info: '#3b82f6',

        // Additional UI Colors (used by various components)
        card: '#15182d',
        border: 'rgba(140, 94, 24, 0.45)',
        surface: '#1a1138',
    },
    gradients: {
        primary: ['#ff204a', '#ff4d4d'],
        background: ['#120b2f', '#1b1240', '#3c2368'],
        hero: ['#120b2f', '#2a1750'],
    },
};

// Light Theme - Soft Slate / Nordic (Eye-Friendly)
export const lightTheme = {
    colors: {
        // Primary Colors - Neutral Cool Grays (Low Saturation)
        bgPrimary: '#F1F5F9',   // Slate-100 (Soft Cool Gray)
        bgSecondary: '#FFFFFF', // White Cards
        bgTertiary: '#E2E8F0',  // Slate-200 (Inputs/Borders)

        // Accent Colors - Retain Brand but softer context
        accentPrimary: '#ff204a',
        accentSecondary: '#b44cff',

        // Text Colors - High Contrast
        textPrimary: '#020617', // Slate-950 (Almost Black)
        textSecondary: '#334155', // Slate-700 (Dark Gray)
        textMuted: '#64748B',     // Slate-500 (Medium Gray)

        // Glassmorphism
        glassBg: 'rgba(255, 255, 255, 0.85)', // More opaque for readability
        glassBgHover: 'rgba(255, 255, 255, 0.95)',
        glassBorder: 'rgba(148, 163, 184, 0.3)',
        glassWhite: 'rgba(255, 255, 255, 0.95)',

        // Status Colors
        success: '#059669',
        warning: '#d97706',
        error: '#dc2626',
        danger: '#dc2626',
        info: '#3b82f6',

        // Additional UI Colors (used by various components)
        card: '#FFFFFF', // White cards
        border: 'rgba(148, 163, 184, 0.3)', // Same as glassBorder
        surface: '#F8FAFC', // Slightly off-white for modals
    },
    gradients: {
        primary: ['#4F46E5', '#4338ca'], // Indigo Gradient
        background: ['#F1F5F9', '#E2E8F0', '#CBD5E1'], // Soft Slate Gradient
        hero: ['#FFFFFF', '#F1F5F9'],
    },
};

// Shared theme properties (same for both themes)
export const sharedTheme = {
    spacing: {
        xs: 4,
        sm: 8,
        md: 16,
        lg: 24,
        xl: 32,
        xxl: 48,
        xxxl: 64,
    },
    borderRadius: {
        sm: 8,
        md: 12,
        lg: 16,
        xl: 24,
        full: 9999,
    },
    fontSize: {
        xs: 12,
        sm: 15,
        base: 17,
        lg: 18,
        xl: 20,
        xxl: 24,
        xxxl: 32,
        xxxxl: 48,
    },
    shadows: {
        glass: {
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.37,
            shadowRadius: 32,
            elevation: 8,
        },
        card: {
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.2,
            shadowRadius: 16,
            elevation: 5,
        },
        button: {
            shadowColor: '#ff204a',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 16,
            elevation: 6,
        },
    },
};

// Helper function to get complete theme
export const getTheme = (isDark) => {
    const colorTheme = isDark ? darkTheme : lightTheme;
    return {
        ...colorTheme,
        ...sharedTheme,
        isDark,
    };
};
