import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { theme } from '../constants/theme';
import { t } from '../core/i18n';
import DashboardScreen from '../screens/DashboardScreen';
import EducationScreen from '../screens/EducationScreen';
import LettersScreen from '../screens/LettersScreen';
import OnboardingScreen from '../screens/OnboardingScreen';
import RecommendationsScreen from '../screens/RecommendationsScreen';
import SettingsScreen from '../screens/SettingsScreen';
import { useCompanion } from '../state/CompanionProvider';

export type RootTabs = {
  Dashboard: undefined;
  Education: undefined;
  Cards: undefined;
  Letters: undefined;
  Settings: undefined;
};

const Tab = createBottomTabNavigator<RootTabs>();

function TabNavigator() {
  const { locale } = useCompanion();
  const insets = useSafeAreaInsets();

  const tabBarBottomPadding = Math.max(8, insets.bottom);
  const tabBarBaseHeight = 62;

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: theme.colors.accent,
        tabBarInactiveTintColor: theme.colors.slate,
        tabBarStyle: {
          height: tabBarBaseHeight + tabBarBottomPadding,
          paddingBottom: tabBarBottomPadding,
          paddingTop: 8,
          borderTopColor: theme.colors.cloud,
          backgroundColor: theme.colors.panel
        },
        tabBarLabelStyle: {
          fontFamily: theme.fonts.medium,
          fontSize: 11
        },
        tabBarIcon: ({ color, size }) => {
          const iconName =
            route.name === 'Dashboard'
              ? 'map-outline'
              : route.name === 'Education'
                ? 'school-outline'
                : route.name === 'Cards'
                  ? 'card-outline'
                  : route.name === 'Settings'
                    ? 'settings-outline'
                    : 'document-text-outline';

          return <Ionicons name={iconName} size={size} color={color} />;
        }
      })}
    >
      <Tab.Screen
        name='Dashboard'
        component={DashboardScreen}
        options={{ tabBarLabel: t(locale, 'tabs.dashboard') }}
      />
      <Tab.Screen
        name='Education'
        component={EducationScreen}
        options={{ tabBarLabel: t(locale, 'tabs.education') }}
      />
      <Tab.Screen
        name='Cards'
        component={RecommendationsScreen}
        options={{ tabBarLabel: t(locale, 'tabs.cards') }}
      />
      <Tab.Screen
        name='Letters'
        component={LettersScreen}
        options={{ tabBarLabel: t(locale, 'tabs.letters') }}
      />
      <Tab.Screen
        name='Settings'
        component={SettingsScreen}
        options={{ tabBarLabel: t(locale, 'tabs.settings') }}
      />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  const { onboardingCompleted } = useCompanion();

  if (!onboardingCompleted) {
    return (
      <SafeAreaView style={{ flex: 1 }} edges={['top', 'bottom']}>
        <OnboardingScreen />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1 }} edges={['top']}>
      <NavigationContainer>
        <TabNavigator />
      </NavigationContainer>
    </SafeAreaView>
  );
}
