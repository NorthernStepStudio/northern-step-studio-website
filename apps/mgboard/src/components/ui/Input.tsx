import React from 'react';
import { TextInput, Text, View, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import { colors, radii, spacing, typography } from '../../theme';

interface InputProps {
  label?: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  multiline?: boolean;
  style?: StyleProp<ViewStyle>;
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'email-address' | 'numeric';
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
}

export function Input({
  label,
  value,
  onChangeText,
  placeholder,
  multiline = false,
  style,
  secureTextEntry,
  keyboardType,
  autoCapitalize,
}: InputProps) {
  const [focused, setFocused] = React.useState(false);

  return (
    <View style={[styles.container, style]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <TextInput
        style={[
          styles.input,
          multiline && styles.multiline,
          focused && styles.inputFocused,
        ]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.text.muted}
        multiline={multiline}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.sm,
  },
  label: {
    ...typography.small,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  input: {
    backgroundColor: colors.surface.glassSoft,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border.subtle,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs + 2,
    color: colors.text.primary,
    fontSize: 13,
    minHeight: 32,
  },
  inputFocused: {
    borderColor: colors.accent.secondary,
    backgroundColor: colors.bg.input,
  },
  multiline: {
    minHeight: 64,
    textAlignVertical: 'top',
    paddingTop: spacing.xs + 2,
  },
});
