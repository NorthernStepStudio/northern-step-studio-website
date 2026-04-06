import React, { useState, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Pressable,
    useWindowDimensions,
    Animated,
    Platform,
    Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import GlassCard from '../GlassCard';
import { useTheme } from '../../contexts/ThemeContext';
import { FEATURES } from '../../core/config';

const isWeb = Platform.OS === 'web';

// Action card - animated on web, static on native for performance
function AnimatedActionCard({ action, navigation, isMobile, width, theme }) {
    const [hovered, setHovered] = useState(false);
    const animValue = useRef(new Animated.Value(0)).current;

    const handleHoverIn = () => {
        setHovered(true);
        if (isWeb) {
            Animated.spring(animValue, {
                toValue: 1,
                useNativeDriver: true,
                tension: 120,
                friction: 8,
            }).start();
        }
    };

    const handleHoverOut = () => {
        setHovered(false);
        if (isWeb) {
            Animated.spring(animValue, {
                toValue: 0,
                useNativeDriver: true,
                tension: 120,
                friction: 8,
            }).start();
        }
    };

    // Only use animations on web
    const scale = isWeb ? animValue.interpolate({
        inputRange: [0, 1],
        outputRange: [1, 1.04],
    }) : 1;

    const translateY = isWeb ? animValue.interpolate({
        inputRange: [0, 1],
        outputRange: [0, -4],
    }) : 0;

    // Use View on native, Animated.View on web
    const CardOuter = isWeb ? Animated.View : View;

    // Handle press - navigate to route or open external URL
    const handlePress = () => {
        if (action.externalUrl) {
            Linking.openURL(action.externalUrl);
        } else {
            navigation.navigate(action.route, action.params);
        }
    };

    return (
        <Pressable
            style={[styles.cardWrapper, {
                // Mobile: 2 columns with 10px gap and 12px padding each side = (width - 24 - 10) / 2
                // Tablet: 3 columns = (width - 60 - 20) / 3
                // Desktop: flexible percentage
                width: isMobile ? (width - 24 - 10) / 2 : (width < 1024 ? (width - 60 - 20) / 3 : '18%'),
                minWidth: isMobile ? 140 : (width < 1024 ? 160 : undefined),
            }]}
            onPress={handlePress}
            onHoverIn={handleHoverIn}
            onHoverOut={handleHoverOut}
            onPressIn={handleHoverIn}
            onPressOut={handleHoverOut}
        >
            <CardOuter
                style={[
                    styles.cardOuter,
                    isWeb ? {
                        transform: [{ scale }, { translateY }],
                        borderColor: hovered ? action.color : 'transparent',
                        shadowColor: hovered ? action.color : '#000',
                        shadowOpacity: hovered ? 0.5 : 0.15,
                        shadowRadius: hovered ? 16 : 8,
                    } : {
                        borderColor: 'transparent',
                    },
                ]}
            >
                <GlassCard
                    style={[
                        styles.card,
                        {
                            backgroundColor: hovered
                                ? theme.colors.glassBgHover
                                : theme.colors.glassBg,
                        },
                    ]}
                >
                    <View
                        style={[
                            styles.iconContainer,
                            {
                                backgroundColor: action.color + '20',
                                borderColor: hovered ? action.color : 'transparent',
                                borderWidth: 2,
                            },
                        ]}
                    >
                        <Ionicons name={action.icon} size={24} color={action.color} />
                    </View>
                    <View style={styles.textContainer}>
                        <Text
                            style={[
                                styles.title,
                                {
                                    color: hovered
                                        ? action.color
                                        : theme.colors.textPrimary,
                                },
                            ]}
                            numberOfLines={1}
                        >
                            {action.title}
                        </Text>
                        <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]} numberOfLines={1}>
                            {action.subtitle}
                        </Text>
                    </View>
                    {/* Arrow indicator on hover - web only */}
                    {isWeb && hovered && (
                        <Ionicons
                            name="arrow-forward-circle"
                            size={22}
                            color={action.color}
                            style={{ marginLeft: 4 }}
                        />
                    )}
                </GlassCard>
            </CardOuter>
        </Pressable>
    );
}

import { useTranslation } from '../../core/i18n';

export default function HomeQuickActions({ navigation }) {
    const { theme } = useTheme();
    const { t } = useTranslation();
    const { width } = useWindowDimensions();
    const isMobile = width < 600;
    const isTablet = width >= 600 && width < 1024;

    // Calculate ideal card width based on screen size
    const getCardWidth = () => {
        if (isMobile) return '47%'; // 2 per row on mobile
        if (isTablet) return '31%'; // 3 per row on tablet
        return '18%'; // 5 per row on desktop
    };

    const actions = [
        {
            title: t('nav.builder'),
            subtitle: t('home.actions.builder_desc'),
            icon: 'construct',
            color: '#ff204a',
            route: 'BuilderTab',
        },
        {
            title: t('home.quickActions.community'),
            subtitle: t('home.actions.gallery_desc'),
            icon: 'people',
            color: '#b44cff',
            route: 'Community',
        },
        {
            title: t('nav.chat'),
            subtitle: t('home.actions.chat_desc'),
            icon: 'chatbubble',
            color: '#ff4d4d',
            route: 'ChatTab',
            params: { screen: 'ChatMain', params: { mode: 'general' } },
        },
        FEATURES.PRICE_TRACKING && {
            title: t('home.quickActions.watchlist'),
            subtitle: t('home.quickActions.trackPriceDrops'),
            icon: 'notifications',
            color: '#ff204a',
            route: 'TrackedParts',
        },
        {
            title: t('home.quickActions.benchmarks'),
            subtitle: t('home.quickActions.compareParts'),
            icon: 'speedometer',
            color: '#b44cff',
            route: 'Benchmarks',
        },
    ].filter(Boolean);

    return (
        <View style={[styles.container, { paddingHorizontal: isMobile ? 12 : 30 }]}>
            <View style={[styles.grid, {
                justifyContent: isMobile ? 'space-between' : 'flex-start',
            }]}>
                {actions.map((action, index) => (
                    <AnimatedActionCard
                        key={index}
                        action={action}
                        navigation={navigation}
                        isMobile={isMobile}
                        width={width}
                        theme={theme}
                    />
                ))}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginTop: 14,
        marginBottom: 24,
        zIndex: 10,
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
    },
    cardWrapper: {
        // Width handled inline
    },
    cardOuter: {
        borderRadius: 20,
        borderWidth: 2,
        shadowOffset: { width: 0, height: 4 },
        elevation: 6,
    },
    card: {
        padding: 14,
        borderRadius: 18,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        height: 76,
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    textContainer: {
        flex: 1,
    },
    title: {
        fontSize: 13,
        fontWeight: '700',
    },
    subtitle: {
        fontSize: 10,
        opacity: 0.8,
    },
});
