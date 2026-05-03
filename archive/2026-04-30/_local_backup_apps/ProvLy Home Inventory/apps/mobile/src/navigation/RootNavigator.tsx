import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuthStore } from '../stores/authStore';
import { useTheme } from '../stores/themeStore';

import AuthScreen from '../screens/AuthScreen';
import BottomTabNavigator from './BottomTabNavigator';
import AddItemScreen from '../screens/AddItemScreen';
import AddRoomScreen from '../screens/AddRoomScreen';
import RoomDetailScreen from '../screens/RoomDetailScreen';
import ItemDetailScreen from '../screens/ItemDetailScreen';
import ManageRoomsScreen from '../screens/ManageRoomsScreen';
import ClaimCenterScreen from '../screens/ClaimCenterScreen';
import CameraScanScreen from '../screens/CameraScanScreen';
import ChatScreen from '../screens/ChatScreen';
import LegalScreen from '../screens/LegalScreen';
import UpgradeScreen from '../screens/UpgradeScreen';
import FeedbackScreen from '../screens/FeedbackScreen';
import GalleryScreen from '../screens/GalleryScreen';
import MaintenanceScreen from '../screens/MaintenanceScreen';
import SearchScreen from '../screens/SearchScreen';
import VerificationScreen from '../screens/VerificationScreen';

const Stack = createNativeStackNavigator();

export default function RootNavigator() {
    const { session, loading, initialize } = useAuthStore();
    const { colors, isDark } = useTheme();

    React.useEffect(() => {
        initialize();
    }, []);

    if (loading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
                <ActivityIndicator size="large" color="#10B981" />
            </View>
        );
    }

    const navigationTheme = {
        dark: isDark,
        colors: {
            primary: colors.primary,
            background: colors.background,
            card: colors.background,
            text: colors.text,
            border: colors.border,
            notification: colors.primary,
        },
        fonts: DefaultTheme.fonts,
    };

    return (
        <NavigationContainer theme={navigationTheme}>
            <Stack.Navigator
                screenOptions={{
                    headerShown: false,
                    presentation: 'modal',
                    animation: 'slide_from_bottom',
                    contentStyle: { backgroundColor: colors.background },
                }}
            >
                {!session ? (
                    <Stack.Screen name="Auth" component={AuthScreen} />
                ) : (
                    <>
                        <Stack.Screen name="MainTabs" component={BottomTabNavigator} />
                        <Stack.Screen name="AddItem" component={AddItemScreen} />
                        <Stack.Screen name="AddRoom" component={AddRoomScreen} />
                        <Stack.Screen name="RoomDetail" component={RoomDetailScreen} />
                        <Stack.Screen name="ItemDetail" component={ItemDetailScreen} />
                        <Stack.Screen name="ManageRooms" component={ManageRoomsScreen} />
                        <Stack.Screen name="ClaimCenter" component={ClaimCenterScreen} />
                        <Stack.Screen
                            name="CameraScan"
                            component={CameraScanScreen}
                            options={{ headerShown: false, presentation: 'fullScreenModal' }}
                        />
                        <Stack.Screen
                            name="Chat"
                            component={ChatScreen}
                            options={{ headerShown: false }}
                        />
                        <Stack.Screen
                            name="Upgrade"
                            component={UpgradeScreen}
                            options={{ presentation: 'fullScreenModal', animation: 'slide_from_bottom' }}
                        />
                        <Stack.Screen
                            name="Feedback"
                            component={FeedbackScreen}
                            options={{ presentation: 'fullScreenModal', animation: 'slide_from_bottom' }}
                        />
                        <Stack.Screen name="Gallery" component={GalleryScreen} />
                        <Stack.Screen name="Maintenance" component={MaintenanceScreen} />
                        <Stack.Screen name="Search" component={SearchScreen} />
                        <Stack.Screen name="Verification" component={VerificationScreen} />
                    </>
                )}
                <Stack.Screen name="Legal" component={LegalScreen} />
            </Stack.Navigator>
        </NavigationContainer>
    );
}
