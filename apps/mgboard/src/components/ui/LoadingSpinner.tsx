import React from 'react';
import { View, ActivityIndicator, StyleSheet, Text } from 'react-native';
import { colors, spacing, typography } from '../../theme';

interface LoadingSpinnerProps {
  label?: string;
}

export function LoadingSpinner({ label = 'Loading...' }: LoadingSpinnerProps) {
  return (
    <View style={styles.container}>
      <View style={styles.spinnerWrap}>
        <ActivityIndicator size="large" color={colors.accent.secondary} />
      </View>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.bg.primary,
  },
  spinnerWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface.glassSoft,
    borderWidth: 1,
    borderColor: colors.border.subtle,
  },
  label: {
    ...typography.caption,
    marginTop: spacing.md,
    color: colors.text.secondary,
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
});
