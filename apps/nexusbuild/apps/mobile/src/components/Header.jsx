import React, { useState, useRef, useEffect } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Modal,
    Pressable,
    Image,
    Animated,
    Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { useNotifications } from '../contexts/NotificationContext';
import { LanguageSelector } from './LanguageSelector';

import { useWindowDimensions } from 'react-native';
import { useRoute } from '@react-navigation/native';



// Simplified Button Component - no animations for performance
const AnimatedButton = ({ onPress, style, children, scaleTo = 1.02, theme, accentColor }) => {
    const [isHovered, setIsHovered] = useState(false);
    const isWeb = Platform.OS === 'web';

    return (
        <Pressable
            onPress={onPress}
            onHoverIn={isWeb ? () => setIsHovered(true) : undefined}
            onHoverOut={isWeb ? () => setIsHovered(false) : undefined}
            style={[
                {
                    backgroundColor: 'transparent',
                    borderWidth: 0,
                    outlineWidth: 0,
                },
                style,
                isWeb && isHovered && { opacity: 0.8 }
            ]}
        >
            {children}
        </Pressable>
    );
};

// Simplified Navigation Link - no animations for performance
const NavLink = ({ label, target, icon, currentRoute, navigation, theme }) => {
    const [isHovered, setIsHovered] = useState(false);
    const isActive = currentRoute === target;

    return (
        <Pressable
            onPress={() => navigation.navigate(target)}
            onHoverIn={() => setIsHovered(true)}
            onHoverOut={() => setIsHovered(false)}
            style={[
                styles.navLinkWrapper,
                styles.navLinkContainer,
                {
                    backgroundColor: isActive
                        ? theme.colors.accentPrimary + '15'
                        : (isHovered ? theme.colors.glassBgHover : 'transparent'),
                    borderWidth: (isActive || isHovered) ? 1 : 0,
                    borderColor: isActive
                        ? theme.colors.accentPrimary
                        : (isHovered ? theme.colors.accentPrimary + '60' : 'transparent'),
                }
            ]}
        >
            <Ionicons
                name={icon}
                size={16}
                color={isActive ? theme.colors.accentPrimary : (isHovered ? theme.colors.textPrimary : theme.colors.textSecondary)}
                style={{ marginRight: 6 }}
            />
            <Text style={[
                styles.navLinkText,
                {
                    color: isActive
                        ? theme.colors.accentPrimary
                        : (isHovered ? theme.colors.textPrimary : theme.colors.textSecondary),
                    fontWeight: isActive ? '700' : '500'
                }
            ]}>
                {label}
            </Text>
        </Pressable>
    );
};

import { useTranslation } from '../core/i18n';

// ... (simplified components) ...

export default function Header({ navigation }) {
    const { theme, toggleTheme } = useTheme();
    const { user } = useAuth();
    const { unreadCount } = useNotifications();
    const { t } = useTranslation();
    const [menuVisible, setMenuVisible] = useState(false);

    const menuItems = [
        // Navigation group
        { type: 'header', label: t('menu.navigate') },
        { label: 'Builder', icon: 'construct-outline', screen: 'BuilderTab' },
        { label: 'Parts', icon: 'search-outline', screen: 'PartSelection' },
        { label: 'Deals', icon: 'pricetag-outline', screen: 'Deals' },
        { label: 'Builds', icon: 'images-outline', screen: 'Community' },
        { label: 'Chat', icon: 'chatbubble-outline', screen: 'Chat' },
        // Account group
        { type: 'header', label: t('menu.account') },
        { label: 'Profile', icon: 'person-outline', screen: 'ProfileTab' },
        { label: 'Notifications', icon: 'notifications-outline', screen: 'Notifications' },
        { label: 'Settings', icon: 'settings-outline', screen: 'Settings' },
    ];

    const { width } = useWindowDimensions();
    const isMobile = width < 768;

    const route = useRoute();
    const currentRoute = route?.name || '';
    const isHomePage = currentRoute === 'Home';
    const canGoBack = navigation.canGoBack();

    const goToLogin = () => {
        navigation.navigate('ProfileTab', { screen: 'Login' });
    };

    return (
        <View style={[styles.header, {
            backgroundColor: 'rgba(16, 11, 40, 0.92)',
            borderBottomColor: theme.colors.glassBorder
        }]}>
            {/* Logo - click to go home */}
            {/* Logo - click to go home */}
            <TouchableOpacity
                onPress={() => navigation.navigate('HomeTab')}
                style={[styles.logoContainer, { backgroundColor: 'transparent' }]}
                activeOpacity={0.7}
            >
                {/* Logo Image - Always show */}
                <View style={{
                    shadowColor: theme.colors.accentPrimary,
                    shadowOffset: { width: 0, height: 0 },
                    shadowOpacity: 0.9,
                    shadowRadius: 12,
                    elevation: 10,
                    backgroundColor: 'transparent',
                    borderRadius: 8,
                }}>
                    <Image
                        source={require('../../assets/icon.png')}
                        style={{
                            width: 32,
                            height: 32,
                            borderRadius: 6,
                            borderWidth: 1,
                            borderColor: theme.colors.accentPrimary
                        }}
                        resizeMode="contain"
                    />
                </View>
                {/* Text Logo - Always show */}
                <Text style={[styles.logoText, { color: theme.colors.textPrimary }]}>
                    Nexus<Text style={{ color: theme.colors.accentPrimary }}>Build</Text>
                </Text>
            </TouchableOpacity>

            {/* Back Button - shows when there's navigation history, positioned AFTER logo */}
            {
                canGoBack && !isHomePage && (
                    <AnimatedButton
                        onPress={() => navigation.goBack()}
                        style={[styles.iconButton, {
                            backgroundColor: theme.colors.accentPrimary + '15',
                            marginLeft: 4,
                            paddingHorizontal: 10,
                        }]}
                        theme={theme}
                        accentColor={theme.colors.accentPrimary}
                    >
                        <Ionicons name="arrow-back" size={18} color={theme.colors.accentPrimary} />
                        {!isMobile && (
                            <Text style={{ color: theme.colors.accentPrimary, fontSize: 13, fontWeight: '500', marginLeft: 4 }}>{t('common.back')}</Text>
                        )}
                    </AnimatedButton>
                )
            }

            {/* Center Navigation Links (Desktop Only) */}
            {
                !isMobile ? (
                    <View style={styles.centerContent}>
                        <NavLink
                            label={t('nav.builder')}
                            target="Builder"
                            icon="construct-outline"
                            currentRoute={currentRoute}
                            navigation={navigation}
                            theme={theme}
                        />
                        <NavLink
                            label={t('nav.deals')}
                            target="Deals"
                            icon="pricetag-outline"
                            currentRoute={currentRoute}
                            navigation={navigation}
                            theme={theme}
                        />
                        <NavLink
                            label={t('community.title')}
                            target="Community"
                            icon="images-outline"
                            currentRoute={currentRoute}
                            navigation={navigation}
                            theme={theme}
                        />
                        <NavLink
                            label={t('nav.chat')}
                            target="Chat"
                            icon="chatbubble-outline"
                            currentRoute={currentRoute}
                            navigation={navigation}
                            theme={theme}
                        />
                    </View>
                ) : (
                    /* Mobile Spacer */
                    <View style={{ flex: 1 }} />
                )
            }

            {/* Right Actions - Mobile: minimal, Desktop: full */}
            <View style={styles.actions}>

                {/* Language Selector */}
                <LanguageSelector
                    style={{
                        backgroundColor: theme.colors.glassBg,
                        marginRight: 2,
                        paddingHorizontal: 10,
                        paddingVertical: 6,
                    }}
                />

                {/* Notifications Bell - Always visible */}
                <AnimatedButton
                    onPress={() => navigation.navigate('Notifications')}
                    style={[styles.iconButton, { backgroundColor: 'transparent', position: 'relative' }]}
                    theme={theme}
                    accentColor={theme.colors.warning}
                >
                    <Ionicons name="notifications-outline" size={20} color={theme.colors.textSecondary} />
                    {unreadCount > 0 && (
                        <View style={{
                            position: 'absolute',
                            top: 4,
                            right: 8,
                            backgroundColor: theme.colors.accentPrimary,
                            width: 8,
                            height: 8,
                            borderRadius: 4,
                        }} />
                    )}
                </AnimatedButton>

                {/* Theme Toggle - Desktop only */}
                {!isMobile && (
                    <AnimatedButton
                        onPress={toggleTheme}
                        style={[styles.iconButton, { backgroundColor: 'transparent' }]}
                        theme={theme}
                        accentColor={theme.colors.warning}
                    >
                        <Ionicons
                            name={theme.isDark ? "sunny" : "moon-outline"}
                            size={20}
                            color={theme.colors.warning}
                        />
                    </AnimatedButton>
                )}

                {/* Sign In / User - Desktop only, mobile uses Profile tab */}
                {!isMobile && (user ? (
                    <AnimatedButton
                        onPress={() => navigation.navigate('ProfileTab')}
                        style={[styles.iconButton, { backgroundColor: 'transparent' }]}
                        theme={theme}
                        accentColor={theme.colors.accentPrimary}
                    >
                        <Ionicons name="person" size={20} color={theme.colors.accentPrimary} />
                    </AnimatedButton>
                ) : (
                    <AnimatedButton
                        onPress={goToLogin}
                        style={[styles.signInButton, {
                            backgroundColor: theme.colors.accentPrimary,
                            borderWidth: 0,
                            paddingHorizontal: 16,
                        }]}
                        theme={theme}
                        accentColor={theme.colors.success}
                    >
                        <Text style={[styles.signInText, { color: '#FFFFFF', fontSize: 14 }]}>{t('auth.login.title')}</Text>
                    </AnimatedButton>
                ))}

                {/* Burger Menu - Desktop only */}
                {!isMobile && (
                    <AnimatedButton
                        onPress={() => setMenuVisible(true)}
                        style={[styles.iconButton, { backgroundColor: 'transparent', paddingHorizontal: 8 }]}
                        theme={theme}
                        accentColor={theme.colors.accentSecondary}
                    >
                        <Ionicons name="menu" size={24} color={theme.colors.accentSecondary} />
                    </AnimatedButton>
                )}
            </View>

            {/* Menu Modal */}
            <Modal
                visible={menuVisible}
                transparent
                animationType="fade"
                onRequestClose={() => setMenuVisible(false)}
            >
                <Pressable
                    style={styles.modalOverlay}
                    onPress={() => setMenuVisible(false)}
                >
                    <View style={[styles.menuDropdown, {
                        backgroundColor: theme.colors.bgSecondary,
                        borderColor: theme.colors.glassBorder
                    }]}>
                        {menuItems.map((item, index) => (
                            item.type === 'header' ? (
                                <View key={index} style={[styles.menuSectionHeader, { borderBottomColor: theme.colors.glassBorder }]}>
                                    <Text style={{ color: theme.colors.textMuted, fontSize: 11, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 1 }}>
                                        {item.label}
                                    </Text>
                                </View>
                            ) : (
                                <TouchableOpacity
                                    key={index}
                                    style={[styles.menuItem, { borderBottomColor: theme.colors.glassBorder }]}
                                    onPress={() => {
                                        setMenuVisible(false);
                                        navigation.navigate(item.screen);
                                    }}
                                >
                                    <Ionicons name={item.icon} size={20} color={theme.colors.accentPrimary} />
                                    <Text style={[styles.menuItemText, { color: theme.colors.textPrimary }]}>
                                        {item.label}
                                    </Text>
                                </TouchableOpacity>
                            )
                        ))}
                    </View>
                </Pressable>
            </Modal>
        </View >
    );
}

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 10,
        paddingTop: Platform.OS === 'ios' ? 4 : 10, // iOS needs less since SafeAreaView adds top space
        borderBottomWidth: 1,
        gap: 10,
    },
    logoContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 18,
        flexShrink: 0,
        zIndex: 10,
        minWidth: 130,
    },

    logoText: {
        fontSize: 18,
        fontWeight: '800',
        letterSpacing: -0.5,
        marginLeft: 8,
    },
    centerContent: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        marginLeft: 10,
        flexWrap: 'nowrap',
        overflow: 'hidden',
    },
    navLinkWrapper: {
        paddingHorizontal: 4,
        paddingVertical: 2,
    },
    navLinkContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 18,
        position: 'relative',
        overflow: 'hidden',
    },
    navLinkText: {
        fontSize: 15,
        letterSpacing: 0.3,
    },
    activeIndicator: {
        position: 'absolute',
        bottom: 0,
        height: 2,
        borderRadius: 2,
        alignSelf: 'center',
        shadowColor: "#00E5FF",
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.8,
        shadowRadius: 5,
        elevation: 5,
    },
    actions: {
        flexDirection: 'row',
        gap: 6,
        paddingRight: 8,
        marginRight: 0,
    },
    iconButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 20,
        gap: 6,
    },
    menuText: {
        fontSize: 14,
        fontWeight: '500',
    },
    signInButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
    },
    signInText: {
        fontSize: 14,
        fontWeight: '600',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-start',
        alignItems: 'flex-end',
        paddingTop: 100,
        paddingRight: 20,
    },
    menuDropdown: {
        width: 200,
        borderRadius: 20,
        borderWidth: 2,
        overflow: 'hidden',
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 15,
        gap: 12,
        borderBottomWidth: 1,
    },
    menuItemText: {
        fontSize: 15,
        fontWeight: '500',
    },
    menuSectionHeader: {
        paddingHorizontal: 15,
        paddingVertical: 8,
        backgroundColor: 'rgba(255,255,255,0.03)',
    },
});
