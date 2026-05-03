import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';

import HomeScreen from '../screens/HomeScreen';
import ManageRoomsScreen from '../screens/ManageRoomsScreen';
import SettingsScreen from '../screens/SettingsScreen';
import ChatScreen from '../screens/ChatScreen';
import CameraScanScreen from '../screens/CameraScanScreen';
import ProfileScreen from '../screens/ProfileScreen';
import MaintenanceScreen from '../screens/MaintenanceScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function SettingsStack() {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Settings" component={SettingsScreen} />
            <Stack.Screen name="Profile" component={ProfileScreen} />
        </Stack.Navigator>
    );
}

import { MaterialCommunityIcons } from '@expo/vector-icons';
import { FEATURES, CHAT_ENABLED } from '../config/features';
import { useTheme } from '../stores/themeStore';

// Custom Tab Bar Component
function CustomTabBar({ state, descriptors, navigation }: any) {
    const { colors, isDark } = useTheme();

    return (
        <View style={[styles.tabBar, { backgroundColor: colors.surface, borderTopColor: colors.border }]}>
            {state.routes.map((route: any, index: number) => {
                const { options } = descriptors[route.key];
                const label = options.tabBarLabel ?? route.name;
                const isFocused = state.index === index;

                // All tabs use same emerald green when active
                const BRAND_GREEN = '#10B981';
                const BRAND_YELLOW = '#FFD700'; // Logo yellow for ChatTab stroke

                const activeColor = BRAND_GREEN;
                const inactiveColor = colors.textSecondary;
                const color = isFocused ? activeColor : inactiveColor;

                // Determine if this tab should be the "hero" center button
                // ChatTab is hero if any chat is enabled, otherwise ScanTab is hero
                const isHeroTab = CHAT_ENABLED
                    ? route.name === 'ChatTab'
                    : route.name === 'ScanTab';

                // Define icons for each tab
                const getIcon = () => {
                    const size = 24;
                    const heroSize = 28;

                    switch (route.name) {
                        case 'HomeTab':
                            return <MaterialCommunityIcons name={isFocused ? "home-variant" : "home-variant-outline"} size={size} color={color} />;
                        case 'RoomsTab':
                            return <MaterialCommunityIcons name={isFocused ? "briefcase-variant" : "briefcase-variant-outline"} size={size} color={color} />;
                        case 'ChatTab':
                            return <MaterialCommunityIcons name="creation" size={heroSize} color="#FFFFFF" />;
                        case 'ScanTab':
                            // Use white icon when ScanTab is the hero button
                            return <MaterialCommunityIcons name="line-scan" size={isHeroTab ? heroSize : size} color={isHeroTab ? "#FFFFFF" : color} />;
                        case 'SettingsTab':
                            return <MaterialCommunityIcons name={isFocused ? "cog" : "cog-outline"} size={size} color={color} />;
                        default:
                            return <MaterialCommunityIcons name="circle-small" size={size} color={color} />;
                    }
                };

                const onPress = () => {
                    const event = navigation.emit({
                        type: 'tabPress',
                        target: route.key,
                        canPreventDefault: true,
                    });



                    if (!isFocused && !event.defaultPrevented) {
                        navigation.navigate(route.name);
                    }
                };

                // Special styling for the hero center button (AI or Scan depending on feature flag)
                if (isHeroTab) {
                    return (
                        <TouchableOpacity
                            key={route.key}
                            style={styles.tab}
                            onPress={onPress}
                            activeOpacity={0.7}
                        >
                            <View style={{
                                backgroundColor: activeColor,
                                width: 56,
                                height: 56,
                                borderRadius: 28,
                                alignItems: 'center',
                                justifyContent: 'center',
                                marginTop: 0, // Aligned with tab bar
                                borderWidth: 4,
                                borderColor: BRAND_YELLOW,
                                shadowColor: activeColor,
                                shadowOffset: { width: 0, height: 6 },
                                shadowOpacity: 0.35,
                                shadowRadius: 10,
                                elevation: 8,
                            }}>
                                {getIcon()}
                            </View>
                        </TouchableOpacity>
                    );
                }

                // Color with opacity for the pill background
                const pillBgColor = isFocused ? `${activeColor}25` : 'transparent'; // 15-20% opacity hex suffix

                // Regular tabs
                return (
                    <TouchableOpacity
                        key={route.key}
                        style={styles.tab}
                        onPress={onPress}
                        activeOpacity={0.7}
                    >
                        <View style={[
                            styles.iconContainer,
                            isFocused && { backgroundColor: pillBgColor }
                        ]}>
                            {getIcon()}
                        </View>
                        <Text style={[
                            styles.tabLabel,
                            { color: inactiveColor },
                            isFocused && { color: activeColor, fontWeight: '700' }
                        ]}>
                            {label}
                        </Text>
                    </TouchableOpacity>
                );
            })}
        </View>
    );
}

// ... (rest of file)

// Screens handling is now direct


export default function BottomTabNavigator() {
    return (
        <Tab.Navigator
            tabBar={(props) => <CustomTabBar {...props} />}
            screenOptions={{
                headerShown: false,
            }}
        >
            <Tab.Screen
                name="HomeTab"
                component={HomeScreen}
                options={{ tabBarLabel: 'Home' }}
            />
            <Tab.Screen
                name="RoomsTab"
                component={ManageRoomsScreen}
                options={{ tabBarLabel: 'Vault' }}
            />
            {/* ChatTab in center position (hero button) */}
            {CHAT_ENABLED && (
                <Tab.Screen
                    name="ChatTab"
                    component={ChatScreen}
                    options={{ tabBarLabel: 'ProChat' }}
                />
            )}
            {/* ScanTab after ChatTab - intercepts and opens modal */}
            <Tab.Screen
                name="ScanTab"
                component={View} // Placeholder as it intercepts
                options={{ tabBarLabel: 'Scan' }}
                listeners={({ navigation }) => ({
                    tabPress: (e) => {
                        e.preventDefault();
                        navigation.navigate('CameraScan');
                    },
                })}
            />
            <Tab.Screen
                name="SettingsTab"
                component={SettingsStack}
                options={{ tabBarLabel: 'Settings' }}
            />
        </Tab.Navigator>
    );
}

const styles = StyleSheet.create({
    tabBar: {
        flexDirection: 'row',
        backgroundColor: '#FFFFFF',
        height: 75, // Taller profile
        paddingBottom: 15,
        borderTopWidth: 1,
        borderTopColor: '#F1F5F9', // Subtle top separator
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -6 },
        shadowOpacity: 0.04,
        shadowRadius: 8,
        elevation: 20,
        alignItems: 'center',
    },
    tab: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        height: 60,
    },
    iconContainer: {
        marginBottom: 4,
        paddingHorizontal: 16,
        paddingVertical: 4,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    iconContainerActive: {
        backgroundColor: '#D1FAE5', // Soft Emerald Pill (NexusBuild style)
    },
    tabLabel: {
        fontSize: 10,
        color: '#94A3B8',
        fontWeight: '600',
        letterSpacing: 0.2,
    },
    tabLabelActive: {
        color: '#10B981',
        fontWeight: '700',
    },
});
