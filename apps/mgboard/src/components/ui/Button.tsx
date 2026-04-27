import React from 'react';
import {
  Pressable,
  View,
  Animated,
  Text,
  StyleSheet,
  ActivityIndicator,
  type StyleProp,
  type ViewStyle,
  type TextStyle,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, radii, spacing, typography } from '../../theme';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

export function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  icon,
  style,
}: ButtonProps) {
  const variantStyles = variants[variant];
  const sizeStyles = sizes[size];
  const isDisabled = disabled || loading;
  const scale = React.useRef(new Animated.Value(1)).current;

  const animateTo = (value: number) => {
    Animated.spring(scale, {
      toValue: value,
      useNativeDriver: true,
      speed: 30,
      bounciness: 0,
    }).start();
  };

  const content = loading ? (
    <ActivityIndicator size="small" color={variantStyles.textColor} />
  ) : (
    <View style={styles.content}>
      {icon}
      <Text
        numberOfLines={1}
        ellipsizeMode="tail"
        style={[
          styles.text,
          { color: variantStyles.textColor },
          sizeStyles.text,
          icon ? styles.textWithIcon : undefined,
        ]}
      >
        {title}
      </Text>
    </View>
  );

  const background =
    variant === 'primary' ? (
      <LinearGradient
        colors={[colors.accent.primary, colors.accent.secondary]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.base, sizeStyles.container, variantStyles.container, isDisabled && styles.disabled]}
      >
        {content}
      </LinearGradient>
    ) : (
      <View style={[styles.base, sizeStyles.container, variantStyles.container, isDisabled && styles.disabled]}>
        {content}
      </View>
    );

  return (
    <Animated.View style={[style, { transform: [{ scale }] }]}>
      <Pressable
        onPress={onPress}
        onPressIn={() => !isDisabled && animateTo(0.97)}
        onPressOut={() => animateTo(1)}
        disabled={isDisabled}
        style={styles.pressable}
      >
        {background}
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  pressable: {
    borderRadius: radii.lg,
  },
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radii.lg,
    overflow: 'hidden',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 0,
    maxWidth: '100%',
  },
  text: {
    ...typography.caption,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    flexShrink: 1,
  },
  textWithIcon: {
    marginLeft: spacing.xs,
  },
  disabled: {
    opacity: 0.5,
  },
});

const variants: Record<string, { container: ViewStyle; textColor: string }> = {
  primary: {
    container: {},
    textColor: '#FFFFFF',
  },
  secondary: {
    container: {
      backgroundColor: colors.surface.glassSoft,
      borderWidth: 1,
      borderColor: colors.border.medium,
    },
    textColor: colors.text.primary,
  },
  ghost: {
    container: {
      backgroundColor: 'transparent',
      borderWidth: 1,
      borderColor: colors.border.subtle,
    },
    textColor: colors.text.secondary,
  },
  danger: {
    container: {
      backgroundColor: colors.accent.dangerMuted,
      borderWidth: 1,
      borderColor: colors.accent.danger,
    },
    textColor: colors.accent.danger,
  },
};

const sizes: Record<string, { container: ViewStyle; text: TextStyle }> = {
  sm: {
    container: { paddingHorizontal: spacing.sm + 2, minHeight: 30, paddingVertical: 4 },
    text: { fontSize: 9, lineHeight: 12 },
  },
  md: {
    container: { paddingHorizontal: spacing.sm + spacing.xs, minHeight: 34, paddingVertical: 5 },
    text: { fontSize: 10, lineHeight: 13 },
  },
  lg: {
    container: { paddingHorizontal: spacing.md, minHeight: 38, paddingVertical: 6 },
    text: { fontSize: 11, lineHeight: 14 },
  },
};
