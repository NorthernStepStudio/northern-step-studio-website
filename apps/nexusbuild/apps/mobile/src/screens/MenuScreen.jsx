import React from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    Platform,
    Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from '../components/Header';
import { LanguageSettingsRow } from '../components/LanguageSelector';
import { useTranslation } from '../core/i18n';
import { APP_VERSION_LABEL } from '../core/appInfo';
import { FEATURES, getWebAdminConsoleUrl } from '../core/config';

export default function MenuScreen({ navigation }) {
    const { theme, toggleTheme } = useTheme();
    const { user, logout } = useAuth();
    const { t } = useTranslation();
    const isAdminUser =
        user?.role === 'admin' || user?.is_admin === true || user?.is_moderator === true;
    const adminConsoleUrl = getWebAdminConsoleUrl();

    const goToLogin = () => {
        navigation.navigate('ProfileTab', { screen: 'Login' });
    };

    const menuSections = [
        {
            title: t('menu.navigate'),
            items: [
                { label: t('menu.partsDatabase'), icon: 'search-outline', screen: 'PartSelection', color: theme.colors.accentPrimary },
                { label: t('community.title'), icon: 'images-outline', screen: 'Community', color: theme.colors.accentSecondary },
                { label: t('menu.assemblyGuide'), icon: 'hammer-outline', screen: 'AssemblyGuide', color: theme.colors.info },
                { label: t('menu.buildGuide'), icon: 'book-outline', screen: 'BuildGuide', color: theme.colors.warning },
            ].filter(Boolean)
        },
        {
            title: 'Software Libraries',
            items: [
                { label: 'Game Library', icon: 'game-controller-outline', screen: 'GameLibrary', color: '#8B5CF6' },
                { label: 'Workstation Tools', icon: 'desktop-outline', screen: 'WorkstationLibrary', color: '#10B981' },
            ]
        },
        {
            title: t('menu.account'),
            items: [
                { label: t('menu.store') || t('menu.buyTokens'), icon: 'cart-outline', screen: 'Store', color: '#F59E0B' },
                { label: t('profile.notifications'), icon: 'notifications-outline', screen: 'Notifications', color: theme.colors.warning },
                { label: t('common.settings'), icon: 'cog-outline', screen: 'Settings', color: '#6366F1' },
            ]
        },
        ...(FEATURES.WEB_ADMIN_CONSOLE && isAdminUser
            ? [{
                title: t('common.admin'),
                items: [
                    { label: 'Open Web Admin', icon: 'open-outline', externalUrl: adminConsoleUrl, color: '#EF4444' },
                ]
            }]
            : []),
        {
            title: t('menu.more'),
            items: [
                { label: t('menu.aboutNexusBuild'), icon: 'information-circle-outline', screen: 'About', color: theme.colors.accentSecondary },
                { label: t('profile.helpAndSupport'), icon: 'help-circle-outline', screen: 'HelpSupport', color: theme.colors.info },
                { label: t('menu.contactUs'), icon: 'mail-outline', screen: 'Contact', color: theme.colors.accentPrimary },
                { label: t('menu.legal'), icon: 'shield-checkmark-outline', screen: 'Legal', color: '#10B981' },
            ]
        },
    ];

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.bgPrimary }]} edges={['top']}>
            <Header navigation={navigation} />
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Theme Toggle */}
                <TouchableOpacity
                    style={[styles.themeToggle, {
                        backgroundColor: theme.colors.glassBg,
                        borderColor: theme.colors.glassBorder,
                    }]}
                    onPress={toggleTheme}
                >
                    <Ionicons
                        name={theme.isDark ? "sunny" : "moon"}
                        size={24}
                        color={theme.colors.warning}
                    />
                    <Text style={[styles.themeToggleText, { color: theme.colors.textPrimary }]}>
                        {theme.isDark ? t('menu.switchToLight') : t('menu.switchToDark')}
                    </Text>
                    <Ionicons name="chevron-forward" size={20} color={theme.colors.textMuted} />
                </TouchableOpacity>

                {/* Language Toggle */}
                <View style={[styles.menuGrid, {
                    backgroundColor: theme.colors.glassBg,
                    borderColor: theme.colors.glassBorder,
                    marginBottom: 24,
                }]}>
                    <LanguageSettingsRow />
                </View>

                {/* Menu Sections */}
                {menuSections.map((section, sectionIndex) => (
                    <View key={sectionIndex} style={styles.section}>
                        <Text style={[styles.sectionTitle, { color: theme.colors.textMuted }]}>
                            {section.title}
                        </Text>
                        <View style={[styles.menuGrid, {
                            backgroundColor: theme.colors.glassBg,
                            borderColor: theme.colors.glassBorder,
                        }]}>
                            {section.items.map((item, itemIndex) => (
                                <TouchableOpacity
                                    key={itemIndex}
                                    style={[styles.menuItem, {
                                        borderBottomColor: theme.colors.glassBorder,
                                        borderBottomWidth: itemIndex < section.items.length - 1 ? 1 : 0,
                                    }]}
                                    onPress={() => {
                                        if (item.externalUrl) {
                                            Linking.openURL(item.externalUrl);
                                            return;
                                        }
                                        navigation.navigate(item.screen);
                                    }}
                                >
                                    <View style={[styles.iconContainer, { backgroundColor: item.color + '20' }]}>
                                        <Ionicons name={item.icon} size={22} color={item.color} />
                                    </View>
                                    <Text style={[styles.menuItemText, { color: theme.colors.textPrimary }]}>
                                        {item.label}
                                    </Text>
                                    <Ionicons name="chevron-forward" size={18} color={theme.colors.textMuted} />
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                ))}

                {/* Login/Logout Button */}
                <View style={styles.section}>
                    {user ? (
                        <TouchableOpacity
                            style={[styles.authButton, {
                                backgroundColor: theme.colors.error + '20',
                                borderColor: theme.colors.error,
                            }]}
                            onPress={logout}
                        >
                            <Ionicons name="log-out-outline" size={22} color={theme.colors.error} />
                            <Text style={[styles.authButtonText, { color: theme.colors.error }]}>
                                {t('profile.signOut')}
                            </Text>
                        </TouchableOpacity>
                    ) : (
                        <TouchableOpacity
                            style={[styles.authButton, {
                                backgroundColor: theme.colors.accentPrimary,
                            }]}
                            onPress={goToLogin}
                        >
                            <Ionicons name="log-in-outline" size={22} color="#FFFFFF" />
                            <Text style={[styles.authButtonText, { color: '#FFFFFF' }]}>
                                {t('auth.login.signIn')}
                            </Text>
                        </TouchableOpacity>
                    )}
                </View>

                {/* Version */}
                <Text style={[styles.version, { color: theme.colors.textMuted }]}>
                    {APP_VERSION_LABEL}
                </Text>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        padding: 16,
        paddingBottom: 40,
    },
    themeToggle: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 16,
        borderWidth: 1,
        marginBottom: 24,
        gap: 12,
    },
    themeToggleText: {
        flex: 1,
        fontSize: 16,
        fontWeight: '600',
    },
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 12,
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: 8,
        marginLeft: 4,
    },
    menuGrid: {
        borderRadius: 16,
        borderWidth: 1,
        overflow: 'hidden',
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 14,
        gap: 12,
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    menuItemText: {
        flex: 1,
        fontSize: 16,
        fontWeight: '500',
    },
    authButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        borderRadius: 16,
        borderWidth: 1,
        gap: 10,
    },
    authButtonText: {
        fontSize: 16,
        fontWeight: '600',
    },
    version: {
        textAlign: 'center',
        fontSize: 12,
        marginTop: 16,
    },
});
