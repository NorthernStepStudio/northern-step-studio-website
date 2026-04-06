import React, { useRef } from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { theme } from '../constants/theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, runOnJS } from 'react-native-reanimated';
import { useI18n } from '../i18n';

interface TabItem {
    name: string;
    title: string;
    icon: keyof typeof MaterialCommunityIcons.glyphMap;
}

const TABS: TabItem[] = [
    { name: 'index', title: 'Home', icon: 'home-variant' },
    { name: 'learn', title: 'Learn', icon: 'book-open-variant' },
    { name: 'plan', title: 'Plan', icon: 'calendar-check' },
    { name: 'portfolio', title: 'Portfolio', icon: 'chart-line-variant' },
    { name: 'settings', title: 'Settings', icon: 'cog' },
];

interface CustomTabBarProps {
    state: any;
    descriptors: any;
    navigation: any;
    scrollRef?: React.RefObject<ScrollView>;
}

export function CustomTabBar({ state, descriptors, navigation, scrollRef }: CustomTabBarProps) {
    const insets = useSafeAreaInsets();
    const opacity = useSharedValue(1);
    const { tr } = useI18n();

    const handleTabPress = (routeName: string, isFocused: boolean) => {
        if (!isFocused) {
            // If there's a scrollRef, scroll to top first
            if (scrollRef?.current) {
                console.log("[CustomTabBar] Scrolling to top before navigation");
                scrollRef.current.scrollTo({ y: 0, animated: true });
            }

            // Small delay to let scroll happen, then navigate
            setTimeout(() => {
                navigation.navigate(routeName);
            }, 300);
        }
    };

    return (
        <View style={{
            flexDirection: 'row',
            backgroundColor: theme.colors.bg,
            borderTopWidth: 1,
            borderTopColor: '#1C1C1E',
            paddingBottom: insets.bottom > 0 ? insets.bottom : 12,
            paddingTop: 8,
            height: 70 + (insets.bottom > 0 ? insets.bottom - 12 : 0),
        }}>
            {state.routes.map((route: any, index: number) => {
                const tab = TABS.find(t => t.name === route.name);
                if (!tab) return null;

                const isFocused = state.index === index;
                const color = isFocused ? theme.colors.accent : theme.colors.faint;

                return (
                    <Pressable
                        key={route.key}
                        onPress={() => handleTabPress(route.name, isFocused)}
                        style={{
                            flex: 1,
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: 4,
                        }}
                    >
                        <MaterialCommunityIcons name={tab.icon} size={28} color={color} />
                        <Text style={{
                            color,
                            fontWeight: '900',
                            fontSize: 11,
                            textTransform: 'uppercase',
                            letterSpacing: 0.5
                        }}>
                            {tr(tab.title)}
                        </Text>
                    </Pressable>
                );
            })}
        </View>
    );
}
