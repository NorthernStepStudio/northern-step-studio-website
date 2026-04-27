import React from 'react';
import { Stack } from 'expo-router';
import { colors, typography } from '../../../src/theme';

export default function GitHubLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: colors.bg.primary },
        headerTintColor: colors.text.primary,
        headerTitleStyle: { ...typography.subheading, fontWeight: '700' },
        headerShadowVisible: false,
        contentStyle: { backgroundColor: colors.bg.primary },
      }}
    >
      <Stack.Screen name="index" options={{ title: 'Repositories' }} />
      <Stack.Screen name="commits" options={{ title: 'Commits' }} />
      <Stack.Screen name="issues" options={{ title: 'Issues' }} />
    </Stack>
  );
}
