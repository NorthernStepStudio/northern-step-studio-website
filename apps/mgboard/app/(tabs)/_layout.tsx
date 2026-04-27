import React from 'react';
import { Tabs } from 'expo-router';
import { useWindowDimensions } from 'react-native';
import { Bot, FolderKanban, GitFork, LayoutGrid, Lightbulb, ListTodo } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, spacing, typography } from '../../src/theme';
import {
  TAB_BAR_BASE_HEIGHT,
  TAB_BAR_BASE_MARGIN,
  getBottomViewportInset,
  getTopViewportInset,
} from '../../src/utils/safeArea';

export default function TabLayout() {
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const topInset = getTopViewportInset(insets.top, width);
  const bottomInset = getBottomViewportInset(insets.bottom, width);

  return (
    <Tabs
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.bg.primary,
          borderBottomWidth: 0,
          shadowOpacity: 0,
          elevation: 0,
        },
        headerTintColor: colors.text.primary,
        headerStatusBarHeight: topInset,
        headerTitleStyle: {
          ...typography.subheading,
          fontWeight: '700',
        },
        tabBarStyle: {
          position: 'absolute',
          backgroundColor: colors.surface.glassStrong,
          borderTopColor: colors.border.subtle,
          borderTopWidth: 1,
          height: TAB_BAR_BASE_HEIGHT,
          marginHorizontal: spacing.md,
          marginBottom: TAB_BAR_BASE_MARGIN + bottomInset,
          borderRadius: 22,
          paddingBottom: spacing.sm,
          paddingTop: spacing.sm,
        },
        sceneStyle: {
          backgroundColor: colors.bg.primary,
        },
        tabBarActiveTintColor: colors.accent.secondary,
        tabBarInactiveTintColor: colors.text.muted,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '700',
          letterSpacing: 0.5,
          textTransform: 'uppercase',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color, size }) => <LayoutGrid size={size - 1} color={color} strokeWidth={2.4} />,
        }}
      />
      <Tabs.Screen
        name="projects"
        options={{
          title: 'Projects',
          headerShown: false,
          tabBarIcon: ({ color, size }) => <FolderKanban size={size - 1} color={color} strokeWidth={2.4} />,
        }}
      />
      <Tabs.Screen
        name="tasks"
        options={{
          title: 'Tasks',
          tabBarIcon: ({ color, size }) => <ListTodo size={size - 1} color={color} strokeWidth={2.4} />,
        }}
      />
      <Tabs.Screen
        name="auli"
        options={{
          title: 'Auto Exec',
          tabBarIcon: ({ color, size }) => <Bot size={size - 1} color={color} strokeWidth={2.4} />,
        }}
      />
      <Tabs.Screen
        name="github"
        options={{
          title: 'GitHub',
          headerShown: false,
          tabBarIcon: ({ color, size }) => <GitFork size={size - 1} color={color} strokeWidth={2.4} />,
        }}
      />
      <Tabs.Screen
        name="ideas"
        options={{
          title: 'Ideas',
          tabBarIcon: ({ color, size }) => <Lightbulb size={size - 1} color={color} strokeWidth={2.4} />,
        }}
      />
    </Tabs>
  );
}
