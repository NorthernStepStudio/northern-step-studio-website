import { Platform } from 'react-native';

// NStep MGBoard design tokens
// Premium dark system with a restrained accent palette.
export const colors = {
  bg: {
    primary: '#070A12',
    secondary: '#0F1524',
    tertiary: '#151E31',
    input: '#11192A',
    overlay: 'rgba(4, 7, 15, 0.72)',
    gradientTop: '#111A30',
    gradientBottom: '#0B1222',
  },
  surface: {
    glass: 'rgba(20, 30, 49, 0.66)',
    glassStrong: 'rgba(24, 36, 58, 0.82)',
    glassSoft: 'rgba(15, 24, 40, 0.58)',
  },
  accent: {
    primary: '#7B72FF',
    primaryMuted: 'rgba(123, 114, 255, 0.2)',
    secondary: '#2EA8FF',
    secondaryMuted: 'rgba(46, 168, 255, 0.2)',
    success: '#22C55E',
    successMuted: 'rgba(34, 197, 94, 0.2)',
    warning: '#F59E0B',
    warningMuted: 'rgba(245, 158, 11, 0.2)',
    danger: '#F43F5E',
    dangerMuted: 'rgba(244, 63, 94, 0.2)',
  },
  text: {
    primary: '#F4F7FF',
    secondary: '#A8B4CC',
    muted: '#77839A',
    inverse: '#070A12',
  },
  border: {
    subtle: 'rgba(168, 180, 204, 0.18)',
    medium: 'rgba(168, 180, 204, 0.26)',
    strong: 'rgba(168, 180, 204, 0.38)',
  },
  status: {
    idea: '#F59E0B',
    building: '#7B72FF',
    preview: '#2EA8FF',
    paused: '#6B778D',
    launched: '#22C55E',
  } as Record<string, string>,
  priority: {
    low: '#6B778D',
    medium: '#F59E0B',
    high: '#F43F5E',
  } as Record<string, string>,
  tag: {
    now: '#F43F5E',
    later: '#F59E0B',
    maybe: '#6B778D',
  } as Record<string, string>,
} as const;

export const typography = {
  display: {
    fontSize: 34,
    fontWeight: '700' as const,
    color: colors.text.primary,
    letterSpacing: -0.8,
    lineHeight: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: '700' as const,
    color: colors.text.primary,
    letterSpacing: -0.6,
    lineHeight: 34,
  },
  heading: {
    fontSize: 22,
    fontWeight: '700' as const,
    color: colors.text.primary,
    letterSpacing: -0.3,
    lineHeight: 28,
  },
  subheading: {
    fontSize: 17,
    fontWeight: '600' as const,
    color: colors.text.primary,
    lineHeight: 24,
  },
  body: {
    fontSize: 15,
    fontWeight: '400' as const,
    color: colors.text.primary,
    lineHeight: 22,
  },
  caption: {
    fontSize: 13,
    fontWeight: '500' as const,
    color: colors.text.secondary,
    lineHeight: 18,
  },
  small: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: colors.text.muted,
    letterSpacing: 0.6,
    textTransform: 'uppercase' as const,
  },
} as const;

// 8pt grid with a compact 4pt half-step.
export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  base: 16,
  lg: 24,
  xl: 32,
  '2xl': 40,
  '3xl': 48,
} as const;

export const radii = {
  sm: 12,
  md: 16,
  lg: 20,
  xl: 24,
  full: 9999,
} as const;

export const shadows = {
  card: Platform.select({
    web: { boxShadow: '0 14px 40px rgba(0, 0, 0, 0.42)' },
    default: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 12 },
      shadowOpacity: 0.36,
      shadowRadius: 26,
      elevation: 13,
    },
  }) as any,
  subtle: Platform.select({
    web: { boxShadow: '0 8px 22px rgba(0, 0, 0, 0.28)' },
    default: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.24,
      shadowRadius: 16,
      elevation: 8,
    },
  }) as any,
} as const;

