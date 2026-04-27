import React from 'react';
import { View, Text, StyleSheet, type ViewStyle } from 'react-native';
import { radii, spacing, typography } from '../../theme';

interface BadgeProps {
  label: string;
  color: string;
  size?: 'sm' | 'md';
  style?: ViewStyle;
}

export function Badge({ label, color, size = 'sm', style }: BadgeProps) {
  const isSmall = size === 'sm';

  const bgColor = color.startsWith('#') ? `${color}1F` : color;
  return (
    <View
      style={[
        styles.base,
        {
          backgroundColor: bgColor,
          borderColor: color,
          paddingHorizontal: isSmall ? spacing.sm - 1 : spacing.sm + spacing.xs,
          paddingVertical: isSmall ? 3 : 5,
        },
        style,
      ]}
    >
      <View style={[styles.dot, { backgroundColor: color, borderColor: `${color}AA` }]} />
      <Text
        numberOfLines={1}
        ellipsizeMode="tail"
        style={[
          styles.text,
          { color, fontSize: isSmall ? 10 : 11 },
        ]}
      >
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: radii.md,
    borderWidth: 1,
    alignSelf: 'flex-start',
    maxWidth: '100%',
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    marginRight: spacing.xs,
    borderWidth: 1,
    flexShrink: 0,
  },
  text: {
    ...typography.small,
    fontWeight: '700',
    letterSpacing: 0.45,
    textTransform: 'uppercase',
    flexShrink: 1,
  },
});
