import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { theme } from '../constants/theme';
import { LocaleCode } from '../core/types';

interface LanguageGateScreenProps {
  selectedLocale: LocaleCode;
  options: Array<{ code: LocaleCode; label: string }>;
  onSelect: (locale: LocaleCode) => void;
}

export default function LanguageGateScreen({
  selectedLocale,
  options,
  onSelect
}: LanguageGateScreenProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.eyebrow}>PASOSCORE</Text>
      <Text style={styles.title}>Choose your language</Text>
      <Text style={styles.subtitle}>Elige tu idioma / Scegli la lingua</Text>

      <View style={styles.options}>
        {options.map((option) => {
          const selected = option.code === selectedLocale;
          return (
            <Pressable
              key={option.code}
              onPress={() => onSelect(option.code)}
              style={({ pressed }) => [
                styles.option,
                selected ? styles.optionSelected : null,
                pressed ? styles.optionPressed : null
              ]}
            >
              <Text style={[styles.optionText, selected ? styles.optionTextSelected : null]}>
                {option.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.paper,
    paddingHorizontal: theme.spacing.xl,
    justifyContent: 'center'
  },
  eyebrow: {
    color: theme.colors.accent,
    fontFamily: theme.fonts.mono,
    fontSize: theme.typography.caption,
    letterSpacing: 1.2,
    marginBottom: theme.spacing.sm
  },
  title: {
    color: theme.colors.ink,
    fontFamily: theme.fonts.heading,
    fontSize: 34,
    marginBottom: theme.spacing.xs
  },
  subtitle: {
    color: theme.colors.slate,
    fontFamily: theme.fonts.body,
    fontSize: theme.typography.subtitle,
    marginBottom: theme.spacing.xl
  },
  options: {
    gap: theme.spacing.sm
  },
  option: {
    borderWidth: 1,
    borderColor: theme.colors.cloud,
    backgroundColor: theme.colors.panel,
    borderRadius: theme.radius.md,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md
  },
  optionSelected: {
    borderColor: theme.colors.accent,
    backgroundColor: theme.colors.accentSoft
  },
  optionPressed: {
    opacity: 0.85
  },
  optionText: {
    color: theme.colors.ink,
    fontFamily: theme.fonts.medium,
    fontSize: 18
  },
  optionTextSelected: {
    color: theme.colors.accentDark
  }
});
