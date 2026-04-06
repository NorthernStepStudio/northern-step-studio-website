import React from 'react';
import { NavigationContainer, getFocusedRouteNameFromRoute } from '@react-navigation/native';
import { navigationRef } from './RootNavigation';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator, CardStyleInterpolators } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { View, StyleSheet, Platform, useWindowDimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Linking from 'expo-linking';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '../contexts/ThemeContext';
import { FEATURE_COLORS } from '../core/constants';

import HomeScreen from '../screens/HomeScreen';
import BuilderScreen from '../screens/BuilderScreen';
import MyBuildsScreen from '../screens/MyBuildsScreen';
import ChatScreen from '../screens/ChatScreen';
import ProfileScreen from '../screens/ProfileScreen';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import LegalScreen from '../screens/LegalScreen';
import AboutScreen from '../screens/AboutScreen';

import PartSelectionScreen from '../screens/PartSelectionScreen';
import ComparisonScreen from '../screens/ComparisonScreen';
import BenchmarksScreen from '../screens/BenchmarksScreen';
import SettingsScreen from '../screens/SettingsScreen';
import CommunityScreen from '../screens/CommunityScreen';
import AdminReportsScreen from '../screens/AdminReportsScreen';
import PartDetailsScreen from '../screens/PartDetailsScreen';
import BuildGuideScreen from '../screens/BuildGuideScreen';
import ContactScreen from '../screens/ContactScreen';
import AssemblyGuideScreen from '../screens/AssemblyGuideScreen';
import HelpSupportScreen from '../screens/HelpSupportScreen';
import NotificationsScreen from '../screens/NotificationsScreen';
import TrackedPartsScreen from '../screens/TrackedPartsScreen';
import MenuScreen from '../screens/MenuScreen';
import BuildComparisonScreen from '../screens/BuildComparisonScreen';
import UpgradeScreen from '../screens/UpgradeScreen';
import GameLibraryScreen from '../screens/GameLibraryScreen';
import WorkstationLibraryScreen from '../screens/WorkstationLibraryScreen';


const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// Common stack screen options with smooth slide animation
const stackScreenOptions = {
    headerShown: false,
    cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
    gestureEnabled: true,
    gestureDirection: 'horizontal',
    transitionSpec: {
        open: {
            animation: 'timing',
            config: {
                duration: 350,
            },
        },
        close: {
            animation: 'timing',
            config: {
                duration: 350,
            },
        },
    },
};

// Home Stack - contains Home and all sub-screens accessible from Home/Menu
function HomeStack() {
    return (
        <Stack.Navigator screenOptions={stackScreenOptions}>
            <Stack.Screen name="Home" component={HomeScreen} />

            <Stack.Screen name="PartSelection" component={PartSelectionScreen} />
            <Stack.Screen name="PartDetails" component={PartDetailsScreen} />
            <Stack.Screen name="Comparison" component={ComparisonScreen} />
            <Stack.Screen name="Benchmarks" component={BenchmarksScreen} />
            <Stack.Screen name="BuildGuide" component={BuildGuideScreen} />
            <Stack.Screen name="AssemblyGuide" component={AssemblyGuideScreen} />
            <Stack.Screen name="TrackedParts" component={TrackedPartsScreen} />
            <Stack.Screen name="Community" component={CommunityScreen} />
            <Stack.Screen name="Notifications" component={NotificationsScreen} />
            <Stack.Screen name="About" component={AboutScreen} />
            <Stack.Screen name="Legal" component={LegalScreen} />
            <Stack.Screen name="HelpSupport" component={HelpSupportScreen} />
            <Stack.Screen name="Contact" component={ContactScreen} />

        </Stack.Navigator>
    );
}

// Builder Stack
function BuilderStack() {
    return (
        <Stack.Navigator screenOptions={stackScreenOptions}>
            <Stack.Screen name="BuilderMain" component={BuilderScreen} />
            <Stack.Screen name="PartSelection" component={PartSelectionScreen} />
            <Stack.Screen name="PartDetails" component={PartDetailsScreen} />
            <Stack.Screen name="Comparison" component={ComparisonScreen} />
            <Stack.Screen name="Benchmarks" component={BenchmarksScreen} />
            <Stack.Screen name="MyBuilds" component={MyBuildsScreen} />
            <Stack.Screen name="BuildComparison" component={BuildComparisonScreen} />
            <Stack.Screen name="Notifications" component={NotificationsScreen} />
        </Stack.Navigator>
    );
}

// Chat Stack
function ChatStack() {
    return (
        <Stack.Navigator screenOptions={stackScreenOptions}>
            <Stack.Screen name="ChatMain" component={ChatScreen} />
            <Stack.Screen name="Notifications" component={NotificationsScreen} />
        </Stack.Navigator>
    );
}

function ProfileStack() {
    return (
        <Stack.Navigator screenOptions={stackScreenOptions}>
            <Stack.Screen name="ProfileMain" component={ProfileScreen} />
            <Stack.Screen name="Settings" component={SettingsScreen} />
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
            <Stack.Screen name="Notifications" component={NotificationsScreen} />
            <Stack.Screen name="TrackedParts" component={TrackedPartsScreen} />
            <Stack.Screen name="HelpSupport" component={HelpSupportScreen} />
            <Stack.Screen name="BuildGuide" component={BuildGuideScreen} />
            <Stack.Screen name="AssemblyGuide" component={AssemblyGuideScreen} />
            <Stack.Screen name="About" component={AboutScreen} />
            <Stack.Screen name="Legal" component={LegalScreen} />
            <Stack.Screen name="Contact" component={ContactScreen} />
            <Stack.Screen name="AdminReports" component={AdminReportsScreen} />
            <Stack.Screen name="Chat" component={ChatScreen} />
            <Stack.Screen name="Store" component={UpgradeScreen} />
            <Stack.Screen name="GameLibrary" component={GameLibraryScreen} />
            <Stack.Screen name="WorkstationLibrary" component={WorkstationLibraryScreen} />
        </Stack.Navigator>
    );
}

// Menu/More Stack
function MenuStack() {
    return (
        <Stack.Navigator screenOptions={stackScreenOptions}>
            <Stack.Screen name="MenuMain" component={MenuScreen} />
            <Stack.Screen name="TrackedParts" component={TrackedPartsScreen} />
            <Stack.Screen name="PartSelection" component={PartSelectionScreen} />
            <Stack.Screen name="PartDetails" component={PartDetailsScreen} />

            <Stack.Screen name="AssemblyGuide" component={AssemblyGuideScreen} />
            <Stack.Screen name="BuildGuide" component={BuildGuideScreen} />
            <Stack.Screen name="Notifications" component={NotificationsScreen} />
            <Stack.Screen name="Settings" component={SettingsScreen} />
            <Stack.Screen name="About" component={AboutScreen} />
            <Stack.Screen name="HelpSupport" component={HelpSupportScreen} />
            <Stack.Screen name="Contact" component={ContactScreen} />
            <Stack.Screen name="Legal" component={LegalScreen} />
            <Stack.Screen name="Community" component={CommunityScreen} />
            <Stack.Screen name="AdminReports" component={AdminReportsScreen} />
            <Stack.Screen name="Comparison" component={ComparisonScreen} />
            <Stack.Screen name="Store" component={UpgradeScreen} />
            <Stack.Screen name="GameLibrary" component={GameLibraryScreen} />
            <Stack.Screen name="WorkstationLibrary" component={WorkstationLibraryScreen} />

        </Stack.Navigator>
    );
}

// Web routing configuration
const linking = {
    prefixes: [Linking.createURL('/'), 'nexusbuild://'],
    config: {
        screens: {
            HomeTab: {
                screens: {
                    Home: '',
                    Community: 'community',
                    PartSelection: 'parts',
                    BuildGuide: 'guide',
                    AssemblyGuide: 'assembly',

                }
            },
            BuilderTab: {
                screens: {
                    BuilderMain: 'builder',
                }
            },
            ChatTab: {
                screens: {
                    ChatMain: 'chat',
                }
            },
            ProfileTab: {
                screens: {
                    ProfileMain: 'profile',
                    Settings: 'settings',
                    Login: 'login',
                    Register: 'register',
                }
            },
            MenuTab: {
                screens: {
                    MenuMain: 'menu',
                    About: 'about',
                    Legal: 'legal',
                    HelpSupport: 'help',
                    Contact: 'contact',
                }
            },
        },
    }
};

// Main Tab Navigator
export default function AppNavigator() {
    const { width } = useWindowDimensions();
    const isDesktop = width >= 768;
    const insets = useSafeAreaInsets();
    const { theme, isDark } = useTheme();

    return (
        <NavigationContainer ref={navigationRef} linking={linking}>
            <Tab.Navigator
                screenOptions={({ route }) => ({
                    headerShown: false,
                    tabBarIcon: ({ focused }) => {
                        // Get the focused route name within this tab's stack
                        const routeName = getFocusedRouteNameFromRoute(route);

                        // Define main screen names for each tab
                        const mainScreens = {
                            HomeTab: 'Home',
                            BuilderTab: 'BuilderMain',
                            ChatTab: 'ChatMain',
                            ProfileTab: 'ProfileMain',
                            MenuTab: 'MenuMain',
                        };

                        // Only consider "truly focused" if we're on the main screen of this tab
                        // If routeName is undefined, we're on the initial/main screen
                        const isOnMainScreen = !routeName || routeName === mainScreens[route.name];
                        const isTrulyFocused = focused && isOnMainScreen;

                        let iconName;
                        if (route.name === 'HomeTab') iconName = isTrulyFocused ? 'home' : 'home-outline';
                        else if (route.name === 'BuilderTab') iconName = isTrulyFocused ? 'construct' : 'construct-outline';
                        else if (route.name === 'ChatTab') iconName = isTrulyFocused ? 'chatbubble' : 'chatbubble-outline';
                        else if (route.name === 'ProfileTab') iconName = isTrulyFocused ? 'person' : 'person-outline';
                        else if (route.name === 'MenuTab') iconName = isTrulyFocused ? 'grid' : 'grid-outline';

                        // Define signature colors
                        const colors = {
                            HomeTab: FEATURE_COLORS.HOME,      // Cyan
                            BuilderTab: FEATURE_COLORS.BUILDER, // Orange
                            ChatTab: FEATURE_COLORS.CHAT,      // Purple
                            ProfileTab: FEATURE_COLORS.PROFILE, // Teal
                            MenuTab: FEATURE_COLORS.MENU,      // Pink
                        };

                        const signatureColor = colors[route.name] || '#00E5FF';

                        // Icon color based on whether truly focused and theme
                        const iconColor = isDark
                            ? (isTrulyFocused ? '#FFFFFF' : signatureColor)
                            : (isTrulyFocused ? signatureColor : theme.colors.textMuted);

                        const finalIconColor = (isDark || !isTrulyFocused) ? iconColor : theme.colors.textPrimary;

                        const glowStyle = (isTrulyFocused && isDark) ? {
                            shadowColor: signatureColor,
                            shadowOffset: { width: 0, height: 0 },
                            shadowOpacity: 1,
                            shadowRadius: 12,
                            elevation: 5
                        } : {
                            opacity: isTrulyFocused ? 1 : 0.6
                        };

                        return (
                            <View style={glowStyle}>
                                <Ionicons name={iconName} size={24} color={iconColor} />
                            </View>
                        );
                    },
                    tabBarActiveTintColor: isDark ? '#FFFFFF' : '#000000',
                    tabBarInactiveTintColor: theme.colors.textMuted,
                    tabBarStyle: {
                        backgroundColor: isDark ? 'rgba(13, 10, 34, 0.96)' : theme.colors.bgSecondary,
                        borderTopWidth: 0,
                        borderTopColor: 'transparent',
                        elevation: 0,
                        shadowOpacity: 0,
                        paddingTop: 8,
                        paddingBottom: Platform.OS === 'ios' ? 25 : Math.max(insets.bottom, 12) + 8,
                        height: Platform.OS === 'ios' ? 85 : 65 + Math.max(insets.bottom, 0),
                        display: isDesktop ? 'none' : 'flex',
                    },
                    tabBarHideOnKeyboard: true,
                    tabBarLabelStyle: {
                        fontSize: 11,
                        fontWeight: '600',
                        marginBottom: 2,
                    },
                })}
            >
                <Tab.Screen name="HomeTab" component={HomeStack} options={{ tabBarLabel: 'Home' }} />
                <Tab.Screen name="BuilderTab" component={BuilderStack} options={{ tabBarLabel: 'Builder' }} />
                <Tab.Screen name="ChatTab" component={ChatStack} options={{ tabBarLabel: 'Chat' }} />
                <Tab.Screen name="ProfileTab" component={ProfileStack} options={{ tabBarLabel: 'Profile' }} />
                <Tab.Screen name="MenuTab" component={MenuStack} options={{ tabBarLabel: 'Menu' }} />
            </Tab.Navigator>
        </NavigationContainer>
    );
}
