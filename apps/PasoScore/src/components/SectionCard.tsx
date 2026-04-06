import React, { PropsWithChildren } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { theme } from '../constants/theme';

interface SectionCardProps {
  title: string;
  subtitle?: string;
}

export default function SectionCard({ title, subtitle, children }: PropsWithChildren<SectionCardProps>) {
  return (
    <View style={styles.card}>
      <View style={styles.accentBar} />
      <Text style={styles.title}>{title}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      <View style={styles.content}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: theme.radius.lg,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.cloud,
    backgroundColor: theme.colors.panel,
    shadowColor: theme.colors.shadow,
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 7 },
    shadowRadius: 14,
    elevation: 2,
    overflow: 'hidden'
  },
  accentBar: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
    backgroundColor: theme.colors.accentSoft
  },
  title: {
    fontSize: theme.typography.title,
    color: theme.colors.ink,
    fontFamily: theme.fonts.heading,
    marginBottom: 4,
    marginLeft: 4
  },
  subtitle: {
    color: theme.colors.slate,
    marginBottom: theme.spacing.sm,
    fontSize: theme.typography.body,
    fontFamily: theme.fonts.body,
    marginLeft: 4
  },
  content: {
    gap: theme.spacing.sm,
    marginLeft: 4
  }
});
