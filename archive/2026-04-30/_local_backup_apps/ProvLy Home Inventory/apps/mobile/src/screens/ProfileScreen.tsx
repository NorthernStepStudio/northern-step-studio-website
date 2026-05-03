import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Modal,
    Alert,
    Platform,
    Image,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuthStore } from '../stores/authStore';
import { useInventoryStore } from '../stores/inventoryStore';
import { useTheme, useThemeStore } from '../stores/themeStore';
import { useSubscriptionStore } from '../stores/subscriptionStore';
import { syncSettings } from '../settings/syncSettings';
import ScreenHeader from '../components/ScreenHeader';
import EditProfileModal from '../components/EditProfileModal';
import LegalFooter from '../components/LegalFooter';
import { useTranslation } from 'react-i18next';

export default function ProfileScreen() {
    const navigation = useNavigation<any>();
    const insets = useSafeAreaInsets();
    const { colors, isDark, theme } = useTheme();
    const { setTheme } = useThemeStore();
    const { session } = useAuthStore();
    const { isPro, restorePurchases } = useSubscriptionStore();
    const { items, rooms } = useInventoryStore();
    const { t } = useTranslation();

    const [editProfileVisible, setEditProfileVisible] = useState(false);
    const [showAppearanceModal, setShowAppearanceModal] = useState(false);
    const [notificationsEnabled, setNotificationsEnabled] = useState(true);
    const [deviceId, setDeviceId] = useState('');

    React.useEffect(() => {
        loadDeviceId();
    }, []);

    const loadDeviceId = async () => {
        const id = await syncSettings.getDeviceId();
        setDeviceId(id);
    };

    const appearanceOptions = [
        { code: 'system', name: t('settings.systemDefault', 'System Default'), icon: 'brightness-auto' },
        { code: 'light', name: t('settings.lightMode', 'Light Mode'), icon: 'white-balance-sunny' },
        { code: 'dark', name: t('settings.darkMode', 'Dark Mode'), icon: 'weather-night' },
    ];

    const handleThemeChange = (newTheme: any) => {
        setTheme(newTheme);
        setShowAppearanceModal(false);
    };

    const totalItems = items.length;
    const totalValue = items.reduce((sum, item) => sum + (item.purchasePrice || 0), 0);

    return (
        <View style={[
            styles.container,
            { backgroundColor: colors.background }
        ]}>
            <StatusBar style={isDark ? "light" : "dark"} />

            <ScreenHeader title={t('settings.profile', 'Profile')} showBackButton={true} />

            <ScrollView
                style={styles.content}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.maxWidthContainer}>
                    {/* Profile Card */}
                    <View style={[styles.profileCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                        <View style={styles.profileInfo}>
                            <View style={[styles.avatarCircle, { backgroundColor: colors.surfaceVariant }]}>
                                {session?.user?.user_metadata?.avatar_url ? (
                                    <Image
                                        source={{ uri: session.user.user_metadata.avatar_url }}
                                        style={styles.avatarImage}
                                    />
                                ) : (
                                    <MaterialCommunityIcons name="account" size={48} color={colors.primary} />
                                )}
                            </View>
                            <View style={styles.profileTexts}>
                                <Text style={[styles.profileName, { color: colors.text }]}>
                                    {session?.user?.user_metadata?.full_name || session?.user?.email?.split('@')[0] || t('common.user', 'User')}
                                </Text>
                                <Text style={[styles.profileEmail, { color: colors.textSecondary }]}>{session?.user?.email}</Text>
                            </View>
                        </View>

                        <TouchableOpacity
                            style={[styles.editProfileButton, { borderColor: colors.border }]}
                            onPress={() => setEditProfileVisible(true)}
                        >
                            <MaterialCommunityIcons name="pencil-outline" size={18} color={colors.textSecondary} />
                            <Text style={[styles.editProfileText, { color: colors.textSecondary }]}>{t('common.edit', 'Edit')}</Text>
                        </TouchableOpacity>
                    </View>

                    <EditProfileModal
                        visible={editProfileVisible}
                        onClose={() => setEditProfileVisible(false)}
                    />

                    {/* Vault Stats */}
                    <View style={styles.statsRow}>
                        <View style={[styles.statCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                            <Text style={[styles.statValue, { color: colors.text }]}>{totalItems}</Text>
                            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>{t('vault.items', 'Items')}</Text>
                        </View>
                        <View style={[styles.statCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                            <Text style={[styles.statValue, { color: colors.text }]}>{rooms.length}</Text>
                            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>{t('vault.rooms', 'Rooms')}</Text>
                        </View>
                        <View style={[styles.statCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                            <Text style={[styles.statValue, { color: colors.text }]}>${totalValue.toLocaleString()}</Text>
                            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>{t('home.totalValue', 'Total Value')}</Text>
                        </View>
                    </View>

                    {/* Subscription Section */}
                    <View style={[
                        styles.subscriptionCard,
                        {
                            backgroundColor: isPro ? `${colors.primary}15` : colors.surface,
                            borderColor: isPro ? colors.primary : colors.border
                        }
                    ]}>
                        <View style={styles.subCardHeader}>
                            <View style={[styles.subIconContainer, { backgroundColor: isPro ? colors.primary : colors.surfaceVariant }]}>
                                <MaterialCommunityIcons name="crown" size={28} color="#FFF" />
                            </View>
                            <View style={styles.subCardInfo}>
                                <Text style={[styles.subStatus, { color: isPro ? colors.primary : colors.text }]}>
                                    {isPro ? t('subscription.proTitle', 'PRO VERSION ACTIVE') : t('subscription.freeTitle', 'FREE PLAN')}
                                </Text>
                                <Text style={[styles.subExpires, { color: colors.textSecondary }]}>
                                    {isPro ? t('subscription.proDesc', 'All premium features unlocked') : t('subscription.freeDesc', 'Upgrade for cloud sync & more')}
                                </Text>
                            </View>
                        </View>

                        {!isPro && (
                            <TouchableOpacity
                                style={[styles.upgradeButton, { backgroundColor: colors.primary }]}
                                onPress={() => navigation.navigate('Upgrade')}
                            >
                                <Text style={styles.upgradeButtonText}>{t('subscription.upgradeToPro', 'Upgrade to Pro')}</Text>
                                <MaterialCommunityIcons name="arrow-right" size={20} color="#FFF" />
                            </TouchableOpacity>
                        )}

                        {isPro && (
                            <View style={styles.proBenefitRow}>
                                <MaterialCommunityIcons name="check-circle" size={18} color={colors.primary} />
                                <Text style={[styles.proBenefitText, { color: colors.textSecondary }]}>{t('subscription.proSupport', 'Premium Support Included')}</Text>
                            </View>
                        )}

                        <TouchableOpacity
                            style={styles.restoreButton}
                            onPress={async () => {
                                const success = await restorePurchases();
                                Alert.alert(
                                    success ? t('common.success', 'Success') : t('common.notice', 'Notice'),
                                    success ? t('subscription.restoreSuccess', 'Purchases restored.') : t('subscription.restoreNone', 'No active subscription found.')
                                );
                            }}
                        >
                            <Text style={[styles.restoreText, { color: colors.textSecondary }]}>{t('subscription.restore', 'Restore Purchase')}</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Preferences Section */}
                    <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>{t('settings.preferences', 'PREFERENCES')}</Text>

                    {/* Appearance */}
                    <TouchableOpacity
                        style={[styles.settingRow, { backgroundColor: colors.surface, borderColor: colors.border }]}
                        onPress={() => setShowAppearanceModal(true)}
                    >
                        <View style={[styles.settingIcon, { backgroundColor: `${colors.primary}15` }]}>
                            <MaterialCommunityIcons name="theme-light-dark" size={20} color={colors.primary} />
                        </View>
                        <View style={styles.settingInfo}>
                            <Text style={[styles.settingTitle, { color: colors.text }]}>{t('settings.appearance', 'Appearance')}</Text>
                            <Text style={[styles.settingValue, { color: colors.textSecondary }]}>
                                {appearanceOptions.find(o => o.code === theme)?.name || t('settings.systemDefault', 'System Default')}
                            </Text>
                        </View>
                        <MaterialCommunityIcons name="chevron-right" size={24} color={colors.border} />
                    </TouchableOpacity>

                    {/* Notifications */}
                    <View style={[styles.settingRow, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                        <View style={[styles.settingIcon, { backgroundColor: '#F59E0B15' }]}>
                            <MaterialCommunityIcons name="bell-outline" size={20} color="#F59E0B" />
                        </View>
                        <View style={styles.settingInfo}>
                            <Text style={[styles.settingTitle, { color: colors.text }]}>{t('settings.notifications', 'Notifications')}</Text>
                            <Text style={[styles.settingValue, { color: colors.textSecondary }]}>{t('settings.pushAlerts', 'Push alerts')}</Text>
                        </View>
                        <TouchableOpacity
                            style={[styles.toggle, { backgroundColor: colors.border }, notificationsEnabled && { backgroundColor: colors.primary }]}
                            onPress={() => setNotificationsEnabled(!notificationsEnabled)}
                        >
                            <View style={[styles.toggleCircle, notificationsEnabled && styles.toggleCircleActive]} />
                        </TouchableOpacity>
                    </View>

                    {/* Device ID */}
                    <View style={[styles.settingRow, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                        <View style={[styles.settingIcon, { backgroundColor: `${colors.textSecondary}15` }]}>
                            <MaterialCommunityIcons name="cellphone-check" size={20} color={colors.textSecondary} />
                        </View>
                        <View style={styles.settingInfo}>
                            <Text style={[styles.settingTitle, { color: colors.text }]}>{t('settings.deviceId', 'Device ID')}</Text>
                            <Text style={[styles.settingValue, { color: colors.textSecondary }]} numberOfLines={1}>
                                {deviceId || t('common.loading', 'Loading...')}
                            </Text>
                        </View>
                    </View>

                    <LegalFooter />
                </View>
            </ScrollView>

            {/* Appearance Modal */}
            <Modal visible={showAppearanceModal} transparent animationType="fade">
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
                        <Text style={[styles.modalTitle, { color: colors.text }]}>{t('settings.appearance', 'Appearance')}</Text>

                        {appearanceOptions.map((opt) => (
                            <TouchableOpacity
                                key={opt.code}
                                style={[
                                    styles.modalOption,
                                    { backgroundColor: colors.background, borderColor: colors.border },
                                    theme === opt.code && { borderColor: colors.primary, backgroundColor: `${colors.primary}10` }
                                ]}
                                onPress={() => handleThemeChange(opt.code)}
                            >
                                <MaterialCommunityIcons
                                    name={opt.icon as any}
                                    size={22}
                                    color={theme === opt.code ? colors.primary : colors.textSecondary}
                                    style={{ marginRight: 14 }}
                                />
                                <Text style={[
                                    styles.modalOptionText,
                                    { color: colors.text },
                                    theme === opt.code && { color: colors.primary }
                                ]}>
                                    {opt.name}
                                </Text>
                                {theme === opt.code && (
                                    <MaterialCommunityIcons name="check" size={22} color={colors.primary} />
                                )}
                            </TouchableOpacity>
                        ))}

                        <TouchableOpacity
                            style={[styles.modalCancel, { backgroundColor: colors.surfaceVariant }]}
                            onPress={() => setShowAppearanceModal(false)}
                        >
                            <Text style={[styles.modalCancelText, { color: colors.textSecondary }]}>{t('common.cancel', 'Cancel')}</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        flex: 1,
    },
    scrollContent: {
        paddingBottom: 40,
    },
    maxWidthContainer: {
        maxWidth: 560,
        width: '100%',
        alignSelf: 'center',
        paddingHorizontal: 16,
    },
    profileCard: {
        marginTop: 20,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        borderRadius: 20,
        borderWidth: 1,
    },
    profileInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    avatarCircle: {
        width: 64,
        height: 64,
        borderRadius: 32,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 14,
        overflow: 'hidden', // Ensure image stays circular
    },
    avatarImage: {
        width: '100%',
        height: '100%',
        borderRadius: 32,
    },
    profileTexts: {
        flex: 1,
    },
    profileName: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    profileEmail: {
        fontSize: 14,
        marginTop: 2,
    },
    editProfileButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 14,
        paddingVertical: 10,
        borderRadius: 14,
        borderWidth: 1,
        gap: 6,
    },
    editProfileText: {
        fontSize: 14,
        fontWeight: '600',
    },
    statsRow: {
        flexDirection: 'row',
        marginTop: 20,
        gap: 12,
    },
    statCard: {
        flex: 1,
        padding: 14,
        borderRadius: 16,
        alignItems: 'center',
        borderWidth: 1,
    },
    statValue: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    statLabel: {
        fontSize: 11,
        fontWeight: '600',
        marginTop: 4,
        textTransform: 'uppercase',
    },
    subscriptionCard: {
        marginTop: 24,
        padding: 20,
        borderRadius: 24,
        borderWidth: 2,
    },
    subCardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    subIconContainer: {
        width: 52,
        height: 52,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 14,
    },
    subCardInfo: {
        flex: 1,
    },
    subStatus: {
        fontSize: 16,
        fontWeight: 'bold',
        letterSpacing: 0.5,
    },
    subExpires: {
        fontSize: 13,
        marginTop: 2,
    },
    upgradeButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 14,
        borderRadius: 16,
        gap: 10,
    },
    upgradeButtonText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
    proBenefitRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    proBenefitText: {
        fontSize: 14,
    },
    restoreButton: {
        marginTop: 14,
        alignItems: 'center',
    },
    restoreText: {
        fontSize: 13,
        textDecorationLine: 'underline',
    },
    sectionTitle: {
        fontSize: 12,
        fontWeight: 'bold',
        letterSpacing: 1,
        marginTop: 32,
        marginBottom: 12,
        marginLeft: 4,
    },
    settingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 14,
        borderRadius: 16,
        borderWidth: 1,
        marginBottom: 10,
    },
    settingIcon: {
        width: 40,
        height: 40,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 14,
    },
    settingInfo: {
        flex: 1,
    },
    settingTitle: {
        fontSize: 16,
        fontWeight: '600',
    },
    settingValue: {
        fontSize: 13,
        marginTop: 2,
    },
    toggle: {
        width: 50,
        height: 28,
        borderRadius: 14,
        padding: 2,
    },
    toggleCircle: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: '#FFF',
    },
    toggleCircleActive: {
        transform: [{ translateX: 22 }],
    },
    bottomSpacer: {
        height: 60,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    modalContent: {
        width: '100%',
        maxWidth: 400,
        padding: 24,
        borderRadius: 24,
    },
    modalTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
    },
    modalOption: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 16,
        borderWidth: 2,
        marginBottom: 10,
    },
    modalOptionText: {
        fontSize: 16,
        fontWeight: '600',
        flex: 1,
    },
    modalCancel: {
        marginTop: 10,
        padding: 16,
        borderRadius: 16,
        alignItems: 'center',
    },
    modalCancelText: {
        fontSize: 16,
        fontWeight: 'bold',
    },
});
