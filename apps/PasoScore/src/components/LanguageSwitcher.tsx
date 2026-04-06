import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { theme } from '../constants/theme';
import { t } from '../core/i18n';
import { useCompanion } from '../state/CompanionProvider';

export default function LanguageSwitcher() {
  const { locale, localeOptions, setLocale } = useCompanion();

  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>{t(locale, 'language.label')}</Text>
      <View style={styles.row}>
        {localeOptions.map((option) => (
          <TouchableOpacity
            key={option.code}
            style={[styles.button, option.code === locale ? styles.buttonActive : null]}
            onPress={() => setLocale(option.code)}
          >
            <Text style={[styles.buttonText, option.code === locale ? styles.buttonTextActive : null]}>
              {option.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginBottom: theme.spacing.md
  },
  label: {
    color: theme.colors.slate,
    fontSize: 12,
    fontFamily: theme.fonts.mono,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 6
  },
  row: {
    flexDirection: 'row',
    gap: 8
  },
  button: {
    borderWidth: 1,
    borderColor: theme.colors.cloud,
    borderRadius: 999,
    paddingVertical: 7,
    paddingHorizontal: 12,
    backgroundColor: theme.colors.panel
  },
  buttonActive: {
    borderColor: theme.colors.accent,
    backgroundColor: theme.colors.accentSoft
  },
  buttonText: {
    color: theme.colors.slate,
    fontFamily: theme.fonts.medium,
    fontSize: 12
  },
  buttonTextActive: {
    color: theme.colors.accentDark
  }
});
