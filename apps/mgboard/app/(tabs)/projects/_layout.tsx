import React from 'react';
import { Stack } from 'expo-router';
import { colors, typography } from '../../../src/theme';

export default function ProjectsLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.bg.primary,
        },
        headerTintColor: colors.text.primary,
        headerTitleStyle: { ...typography.subheading, fontWeight: '700' },
        headerShadowVisible: false,
        contentStyle: { backgroundColor: colors.bg.primary },
      }}
    >
      <Stack.Screen name="index" options={{ title: 'Projects' }} />
      <Stack.Screen name="[id]" options={{ title: 'Project' }} />
      <Stack.Screen
        name="new"
        options={{
          title: 'New Project',
          presentation: 'modal',
        }}
      />
    </Stack>
  );
}
